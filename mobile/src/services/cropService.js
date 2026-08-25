import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const API = `${API_URL}/api`;

export const cropService = {

    async queryAIAssistant({
        message,
        latitude,
        longitude,
        imageUri,
    }) {

        const formData = new FormData();

        formData.append("message", message);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);

        if (imageUri) {
            formData.append("image", {
                uri: imageUri,
                type: "image/jpeg",
                name: "leaf.jpg",
            });
        }

        const response = await fetch(`${API}/assistant`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        return {
            id: Date.now().toString(),
            sender: "ai",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    },

};