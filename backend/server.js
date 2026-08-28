import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import { askGemini } from "./services/gemini.js";
import multer from "multer";
import { speechToText } from "./services/speechToText.js";
import fs from "fs";
import FormData from "form-data";
import { franc } from "franc";

dotenv.config();

const upload = multer({
    dest: "uploads/",
});

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.listen(3001,  "0.0.0.0", () => {
    console.log("Server is running on port 3001");
});

app.get("/ping", (req, res) => {
    console.log("Ping received");
    res.send("pong");
});

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MarketCache = new Map();
const Market_Cache_Duration = 30 * 60 * 1000;

app.get("/api/nearby/agri-shops", async (req, res) => {
    console.log("Nearby agri-shops endpoint hit:", req.query);

    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude are required."
            });
        }

        const latitude = Number(lat);
        const longitude = Number(lon);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude."
            });
        }

        const response = await axios.post(
            "https://places.googleapis.com/v1/places:searchText",
            {
                textQuery: "agricultural supply stores",
                pageSize: 20,
                locationBias: {
                    circle: {
                        center: {
                            latitude,
                            longitude
                        },
                        radius: 5000
                    }
                },
                rankPreference: "DISTANCE"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
                    "X-Goog-FieldMask": [
                        "places.id",
                        "places.displayName",
                        "places.formattedAddress",
                        "places.location",
                        "places.googleMapsUri"
                    ].join(",")
                }
            }
        );
        const places = response.data.places || [];
        const shops = places
            .filter(place => place.location)
            .map(place => ({
                id: place.id,
                name: place.displayName?.text || "Unknown Shop",
                address: place.formattedAddress || "",
                latitude: place.location.latitude,
                longitude: place.location.longitude,
                googleMapsUrl: place.googleMapsUri || ""
            }));
        res.json(shops);
    } catch (error) {
        console.error("Google Places API Error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Unable to fetch nearby agricultural shops."
        });
    }
});

app.get("/api/weather", async(req, res) => {
    console.log("Weather endpoint hit", req.query);
    try{
        const {lat, lon} = req.query;
        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude are required.",
            });
        }
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather`;
        const response = await axios.get(weatherURL, {
        params: {
            lat,
            lon,
            appid: process.env.WEATHER_API_KEY,
            units: "metric",
        },
        });
        const data = response.data;
        res.json({
        success: true,
        location: data.name,
        coordinates: data.coord,
        weather: {
            condition: data.weather[0].main,
            description: data.weather[0].description,
            temperature: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            wind_speed: data.wind.speed,
            visibility: data.visibility,
        },
        });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({
        success: false,
        message: "Unable to fetch weather data.",
        });
    }
    });

app.get("/api/weather/forecast", async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude are required."
            });
        }
        const weatherURL = "https://api.openweathermap.org/data/2.5/forecast";
        const response = await axios.get(weatherURL, {
            params: {
                lat,
                lon,
                appid: process.env.WEATHER_API_KEY,
                units: "metric"
            }
        });
        const dailyForecast = {};
        response.data.list.forEach((item) => {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyForecast[date]) {
                dailyForecast[date] = {
                    date,
                    min_temp: item.main.temp,
                    max_temp: item.main.temp,
                    humidity: [],
                    rain_probability: 0,
                    condition: item.weather[0].main
                };
            }
            dailyForecast[date].min_temp = Math.min(
                dailyForecast[date].min_temp,
                item.main.temp
            );
            dailyForecast[date].max_temp = Math.max(
                dailyForecast[date].max_temp,
                item.main.temp
            );
            dailyForecast[date].humidity.push(item.main.humidity);
            dailyForecast[date].rain_probability = Math.max(
                dailyForecast[date].rain_probability,
                item.pop * 100
            );
            if (item.weather[0].main === "Rain") {
                dailyForecast[date].condition = "Rain";
            }
        });

        const forecast = Object.values(dailyForecast).map(day => ({
            date: day.date,
            min_temp: Number(day.min_temp.toFixed(1)),
            max_temp: Number(day.max_temp.toFixed(1)),
            humidity: Math.round(
                day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length
            ),
            rain_probability: Math.round(day.rain_probability),
            condition: day.condition
        }));
        res.json({
            success: true,
            location: response.data.city.name,
            coordinates: {
                lat: response.data.city.coord.lat,
                lon: response.data.city.coord.lon
            },
            forecast
        });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Unable to fetch forecast data."
        });
    }
});

app.get("/api/market", async (req, res) => {
    console.log("Market prices endpoint hit:", req.query);
    try {
        const {
            lat,
            lon,
            state,
            district,
            commodity
        } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude are required."
            });
        }
        const latitude = Number(lat);
        const longitude = Number(lon);
        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude."
            });
        }
        let farmerState = state;
        let farmerDistrict = district;
        if (!farmerState || !farmerDistrict) {
            const geoResponse = await axios.get(
                "https://nominatim.openstreetmap.org/reverse",
                {
                    params: {
                        lat: latitude,
                        lon: longitude,
                        format: "json",
                        zoom: 10
                    },
                    headers: {
                        "User-Agent": "EarthwormAI/1.0"
                    },
                    timeout: 10000
                }
            );
            const address = geoResponse.data.address || {};
            farmerState = farmerState || address.state;
            farmerDistrict = farmerDistrict || address.state_district || address.district || address.county;
        }
        console.log("Detected location:", {
            state: farmerState,
            district: farmerDistrict
        });
        if (!farmerState) {
            return res.status(404).json({
                success: false,
                message: "Unable to determine state from location."
            });
        }
        const requestedLimit = Math.min(
            Number(req.query.limit) || 10,
            50
        );
        const cacheKey = [
            farmerState,
            farmerDistrict || "all",
            commodity || "all",
            requestedLimit
        ]
            .join("-")
            .toLowerCase();
        const cachedData = MarketCache.get(cacheKey);
        if (
            cachedData &&
            Date.now() - cachedData.timestamp < Market_Cache_Duration
        ) {
            console.log("✅ Returning cached market data.");
            return res.json(cachedData.data);
        }
        console.log("🌐 Fetching fresh market data from data.gov.in");
        const classifyCrop = (commodity) => {
            const crop = (commodity || "")
                .trim()
                .toLowerCase();
            if (
                crop.includes("cotton") ||
                crop.includes("sugarcane") ||
                crop.includes("tobacco") ||
                crop.includes("jute") ||
                crop.includes("tea") ||
                crop.includes("coffee") ||
                crop.includes("rubber") ||
                crop.includes("coconut") ||
                crop.includes("arecanut") ||
                crop.includes("pepper") ||
                crop.includes("cardamom")
            ) {
                return "cash";
            }
            return "food";
        };
        const MARKET_API =
            "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
        const baseParams = {
            "api-key": process.env.DATA_GOV_API_KEY,
            format: "json",
            limit: requestedLimit,
            "filters[state.keyword]": farmerState
        };
        if (farmerDistrict) {
            baseParams["filters[district]"] = farmerDistrict;
        }
        if (commodity) {
            baseParams["filters[commodity]"] = commodity;
        }
        let marketResponse;
        try {
            marketResponse = await axios.get(
                MARKET_API,
                {
                    params: baseParams,
                    timeout: 15000
                }
            );
        } catch (error) {
            console.error(
                "Market API error:",
                error.response?.status,
                error.response?.data || error.message
            );
            if (error.response?.status === 429) {
                return res.status(429).json({
                    success: false,
                    message:
                        "Market service is temporarily busy. Please try again shortly."
                });
            }
            return res.status(502).json({
                success: false,
                message:
                    "Unable to fetch market prices from the government data service."
            });
        }
        const records =
            marketResponse.data?.records || [];
        console.log(
            `📊 Market records received: ${records.length}`
        );
        if (records.length === 0) {
            const emptyResponse = {
                success: true,
                location: {
                    latitude,
                    longitude,
                    state: farmerState,
                    district: farmerDistrict || null
                },
                lastUpdated: null,
                count: 0,
                foodCrops: [],
                cashCrops: []
            };
            MarketCache.set(cacheKey, {
                timestamp: Date.now(),
                data: emptyResponse
            });
            return res.json(emptyResponse);
        }
        const marketPrices = records.map(
            (item, index) => {
                const todayPrice =
                    Number(item.modal_price);
                return {
                    id: `${item.market}-${item.commodity}-${index}`,
                    name: item.commodity,
                    todayPrice:
                        Number.isFinite(todayPrice)
                            ? todayPrice
                            : 0,
                    unit: "Quintal",
                    market: item.market,
                    variety: item.variety,
                    grade: item.grade,
                    arrivalDate: item.arrival_date
                };
            }
        );
        const foodCrops =
            marketPrices.filter(
                item =>
                    classifyCrop(item.name) === "food"
            );
        const cashCrops =
            marketPrices.filter(
                item =>
                    classifyCrop(item.name) === "cash"
            );
        console.log("🍚 Food crops:", foodCrops.length);
        console.log("💰 Cash crops:",cashCrops.length);
        const responseData = {
            success: true,
            location: {
                latitude,
                longitude,
                state: farmerState,
                district: farmerDistrict || null
            },
            lastUpdated: records[0]?.arrival_date || null,
            count: marketPrices.length,
            foodCrops,
            cashCrops
        };
        MarketCache.set(cacheKey, {
            timestamp: Date.now(),
            data: responseData
        });
        console.log("💾 Market data cached:", cacheKey);
        return res.json(responseData);
    } catch (error) {
        console.error(
            "❌ Market API Error:",
            error.response?.status,
            error.response?.data || error.message
        );
        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch market prices."
        });
    }
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        const reply = await askGemini(message);
        res.json({
            success:true,
            reply
        });
    } catch(err){
        console.error("Gemini Error:", err.message);
        res.status(429).json({
            success:false,
            message:"Gemini quota exceeded. Please try again later."
        });
    }
});

app.post(
    "/api/stt",
    upload.single("audio"),
    async (req, res) => {
        try {
            const text = await speechToText(req.file.path);
            res.json({
                success: true,
                text,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
);

app.post(
    "/api/assistant",
    upload.single("image"),
    async (req, res) => {
        console.log("========== ASSISTANT REQUEST ==========");
        console.log("FILE:", req.file);
        console.log("BODY:", req.body);
        try {
            const {
                message,
                latitude,
                longitude
            } = req.body;

            const language = franc(message || "");
            const replyLanguage =
                language === "tam" ? "Tamil" : "English";

            let diseaseResult = null;

            if (req.file) {
                console.log("🖼️ Image received by backend");
                console.log("📁 File path:", req.file.path);
                console.log("📄 Original name:", req.file.originalname);
                console.log("🖼️ MIME type:", req.file.mimetype);
                console.log("📦 File size:", req.file.size);
                try {
                    const form = new FormData();
                    form.append(
                        "file",
                        fs.createReadStream(req.file.path),
                        {
                            filename: req.file.originalname,
                            contentType: req.file.mimetype,
                        }
                    );
                    const diseaseResponse =
                        await axios.post(
                            `${AI_SERVICE_URL}/predict`,
                            form,
                            {
                                headers: form.getHeaders(),
                            }
                        );

                    diseaseResult =
                        diseaseResponse.data;

                    console.log(
                        "Disease Model Response:",
                        diseaseResult
                    );

                }
                catch (err) {
                    console.error("❌ Disease Model Error");
                    console.error("Status:",err.response?.status);
                    console.error("Response:",err.response?.data);
                    console.error("Headers:",err.response?.headers);
                    console.error("Message:",err.message);
                    diseaseResult = null;
                }
                try {
                    fs.unlinkSync(req.file.path);
                }
                catch {}
            }
            let weatherContext = "";
            if (latitude && longitude) {
                try {
                    const weather =
                        await axios.get(
                            "https://api.openweathermap.org/data/2.5/weather",
                            {
                                params: {
                                    lat: latitude,
                                    lon: longitude,
                                    appid: process.env.WEATHER_API_KEY,
                                    units: "metric"
                                }
                            }
                        );
                    const w = weather.data;
                    weatherContext = `
                        Current Location : ${w.name}
                        Weather
                        Temperature : ${w.main.temp} °C
                        Feels Like : ${w.main.feels_like} °C
                        Humidity : ${w.main.humidity} %
                        Condition : ${w.weather[0].description}
                        Wind Speed : ${w.wind.speed} m/s
                    `;
                }
                catch (err) {
                    console.log(
                        "Weather API Error:",
                        err.message
                    );
                }
            }

            let prompt = `
                You are Earthworm AI,
                an intelligent agriculture assistant for Indian farmers.
                Farmer Question:
                ${message}
                ${weatherContext}
            `;
            if (diseaseResult) {
                prompt += `
                Disease Detection Result
                Crop:
                ${diseaseResult.crop}
                Disease:
                ${diseaseResult.disease}
                Confidence:
                ${diseaseResult.confidence}%
                Symptoms:
                ${diseaseResult.symptoms}
                Treatment:
                ${diseaseResult.treatment}
                `;
            }
            prompt += `

                Instructions

                1. Reply ONLY in ${replyLanguage}.

                2. If farmer speaks Tamil,
                reply entirely in Tamil.

                3. If farmer speaks English,
                reply entirely in English.

                4. Use the weather information
                while giving agricultural advice.

                5. If disease information is available,
                explain

                • Disease name

                • Cause

                • Symptoms

                • Treatment

                • Prevention

                6. If there is no disease result,
                ignore disease diagnosis.

                7. Keep answers simple and suitable for farmers.

                8. Use bullet points whenever possible.

                `;

            const reply =
                await askGemini(prompt);
            res.json({
                success: true,
                reply,
                diseaseResult,
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
);