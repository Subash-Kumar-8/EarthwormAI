import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import agriData from "./SampleDB/agriShop.json" with { type: "json" };
import marketPrices from "./SampleDB/marketPrice.json" with { type: "json" };
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

app.get("/api/nearby/agri-shops", (req, res) => {
     console.log("Nearby shops endpoint hit", req.query);

    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({
            message: "Latitude and Longitude are required."
        });
    }

    const nearby = agriData
        .map(shop => {

            const distance = getDistance(
                Number(lat),
                Number(lon),
                shop.latitude,
                shop.longitude
            );

            return {
                ...shop,
                distance: distance.toFixed(2)
            };

        })
        .filter(shop => Number(shop.distance) <= 5)
        .sort((a, b) => a.distance - b.distance);

    res.json(nearby);

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

app.get("/api/market", (req, res) => {
  const foodCrops = marketPrices.foodCrops.map(crop => ({
    ...crop,
    change: crop.todayPrice - crop.yesterdayPrice,
    changeType:
      crop.todayPrice > crop.yesterdayPrice
        ? "up"
        : crop.todayPrice < crop.yesterdayPrice
        ? "down"
        : "same"
  }));

  const cashCrops = marketPrices.cashCrops.map(crop => ({
    ...crop,
    change: crop.todayPrice - crop.yesterdayPrice,
    changeType:
      crop.todayPrice > crop.yesterdayPrice
        ? "up"
        : crop.todayPrice < crop.yesterdayPrice
        ? "down"
        : "same"
  }));

  res.json({
    success: true,
    lastUpdated: new Date().toISOString().split("T")[0],
    foodCrops,
    cashCrops
  });
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
                            "http://192.168.137.198:8000/predict",
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

                    console.log(
                        "Disease Model Error:",
                        err.message
                    );
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