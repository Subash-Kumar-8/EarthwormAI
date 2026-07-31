import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import agriData from "./SampleDB/agriShop.json" with { type: "json" };

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.listen(3001, () => {
    console.log("Server is running on port 3001");
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