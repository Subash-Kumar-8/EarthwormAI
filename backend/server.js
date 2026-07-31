import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import agriData from "./SampleDB/agriShop.json" with { type: "json" };

dotenv.config();

const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});

app.get("/api/nearby/agri-shops", (req, res) => {
    res.json(agriData);
});

app.get("/api/nearby/markets", async (req, res) => {
    const { lat, lon } = req.query;

    const query = `
    [out:json][timeout:25];
    (
      node["amenity"="marketplace"](around:5000,${lat},${lon});
      way["amenity"="marketplace"](around:5000,${lat},${lon});
      relation["amenity"="marketplace"](around:5000,${lat},${lon});
    );
    out center tags;
    `;

    try {
        const response = await axios.get(
            "https://overpass.kumi.systems/api/interpreter",
            {
                params: { data: query },
                headers: {
                    "User-Agent": "EarthwormAI/1.0",
                    "Accept": "application/json"
                }
            }
        );

        res.json(response.data.elements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});