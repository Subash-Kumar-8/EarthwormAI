# 🌱 Earthworm AI – Farmers' Friend

> AI-powered smart farming assistant that helps farmers with crop disease detection, weather forecasting, AI-based agricultural guidance, and GPS-enabled farming services.

![Platform](https://img.shields.io/badge/Platform-React%20Native-green)
![Backend](https://img.shields.io/badge/Backend-Node.js-brightgreen)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-blue)
![ML](https://img.shields.io/badge/Model-EfficientNetB0-orange)
![Database](https://img.shields.io/badge/Database-Firebase%20Firestore-yellow)

---

# 📌 Overview

Earthworm AI is an intelligent mobile application developed to assist farmers by integrating Artificial Intelligence, Machine Learning, Weather Intelligence, and GPS-based services into a single platform.

The application provides:

- 🌦 Real-time Weather Forecast
- 🌱 Crop Disease Detection
- 🤖 AI Farming Assistant
- 📍 GPS Location Detection
- 🏪 Nearby Fertilizer Shop Locator
- 🔐 Secure Firebase Authentication

The goal is to improve agricultural productivity by providing timely recommendations and disease diagnosis through AI.

---

# 🚀 Features

## 🔐 User Authentication

- Firebase Authentication
- Secure Login
- Registration
- Password Reset

---

## 🌦 Weather Forecast

- Current Weather
- Temperature
- Humidity
- Wind Speed
- 5-Day Forecast

Powered by:

- OpenWeather API

---

## 📍 GPS Location Detection

- Detects user's current location
- Displays coordinates
- Enables location-aware services

---

## 🤖 AI Farming Assistant

Powered by Google Gemini API.

Farmers can ask questions such as:

- How to treat rice leaf blight?
- Best fertilizer for tomato?
- Preventive measures for bacterial wilt
- Pest management

---

## 🌱 Disease Detection

Farmers upload a crop leaf image.

The application:

1. Preprocesses the image
2. Detects disease using EfficientNetB0
3. Sends prediction to Gemini
4. Generates treatment recommendations

### Model Information

| Property | Value |
|----------|-------|
| Model | EfficientNetB0 |
| Accuracy | 94% |
| Disease Classes | 34 |
| Supported Crops | Tomato, Rice, Potato, Wheat, Sugarcane, Corn, Apple, Bell Pepper |

Dataset

- Kaggle
- Multiple Agricultural Resources

---

## 🏪 Nearby Fertilizer Shops

Using GPS,

the application displays nearby fertilizer and agricultural input stores.

---

# 🏗 System Architecture

```

Farmer
│
▼
React Native Mobile App
│
├── Firebase Authentication
├── GPS Location
└── Image Upload
│
▼
Node.js + Express Backend
│
├── OpenWeather API
├── EfficientNetB0 Disease Detection
└── Google Gemini AI
│
▼
Firebase Cloud Firestore
│
▼
Farmer Dashboard

```

---

# 🛠 Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React Native + Expo |
| Backend | Node.js + Express.js |
| Authentication | Firebase Authentication |
| Database | Firebase Cloud Firestore |
| AI | Google Gemini API |
| ML | TensorFlow / Keras |
| Model | EfficientNetB0 |
| Weather | OpenWeather API |
| GPS | Expo Location |

---

# 📂 Project Structure

```

EarthwormAI

├── mobile
│ ├── assets
│ ├── components
│ ├── navigation
│ ├── screens
│ ├── services
│ └── App.js
│
├── backend
│ ├── controllers
│ ├── routes
│ ├── middleware
│ ├── models
│ ├── services
│ ├── server.js
│ └── package.json
│
├── ml-model
│ ├── dataset
│ ├── train.py
│ ├── predict.py
│ ├── model.h5
│
└── README.md

```

---

# 📊 Disease Detection Workflow

```

Leaf Image
│
▼
Image Preprocessing
│
▼
EfficientNetB0
│
▼
Disease Prediction
│
▼
Google Gemini AI
│
▼
Treatment Recommendation

```

---

# 📱 Application Screens

- Login
- Dashboard
- Weather Forecast
- AI Chat Assistant
- Disease Detection
- Profile

---

# 🔥 Results

✅ Firebase Authentication

✅ GPS Location Detection

✅ Weather Forecasting

✅ AI Chat Assistant

✅ Disease Detection

✅ Nearby Fertilizer Shop Locator

✅ Firebase Firestore Integration

---

# 📈 Future Enhancements

- Tamil Voice Assistant
- Offline Support
- IoT Sensor Integration
- Government Scheme Recommendation
- Marketplace Integration
- Satellite Crop Monitoring
- Pest Prediction
- Yield Prediction

---

# 👨‍💻 Team

**Team Name:** CodeForge

**Team ID:** H26AGR04

**Project:** Earthworm AI – Farmers' Friend

**Team Leader**

- Subash Kumar B

**Team Members**

- Muthamaizhan Natarajan
- Babu T

**College**

Anna University Regional Campus, Coimbatore

---

# 📚 References

- React Native Documentation
- Firebase Documentation
- TensorFlow Documentation
- Google Gemini API Documentation
- OpenWeather API Documentation

---

# ⭐ Acknowledgement

Developed as part of an AI-powered Smart Agriculture Hackathon to empower farmers with intelligent digital solutions.

---

## 📄 License

This project is developed for educational and hackathon purposes.
