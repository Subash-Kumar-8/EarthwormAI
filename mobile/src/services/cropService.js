const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API = `${API_URL}/api`;

export const cropService = {
  async queryAIAssistant({
    message,
    latitude,
    longitude,
    imageUri,
  }) {
    try {
      const formData = new FormData();
      formData.append("message", message || "");
      formData.append(
        "latitude",
        latitude !== undefined && latitude !== null
          ? String(latitude)
          : ""
      );
      formData.append(
        "longitude",
        longitude !== undefined && longitude !== null
          ? String(longitude)
          : ""
      );
      if (imageUri) {
        console.log("📷 Attaching image:", imageUri);
        const extension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
        let mimeType = "image/jpeg";
        if (extension === "png") {
          mimeType = "image/png";
        } else if (extension === "webp") {
          mimeType = "image/webp";
        }
        formData.append("image", {
          uri: imageUri,
          type: mimeType,
          name: `leaf.${extension}`,
        });
        console.log("✅ Image added to FormData");
      } else {
        console.log("⚠️ No image URI provided");
      }
      console.log("📤 Sending request to:", `${API}/assistant`);
      const response = await fetch(`${API}/assistant`, {
        method: "POST",
        body: formData,
      });
      console.log("📥 Response status:", response.status);
      const data = await response.json();
      console.log("🤖 AI Response:", data);
      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "AI Assistant request failed"
        );
      }
      return {
        id: Date.now().toString(),
        sender: "ai",
        text: data.reply || "I couldn't generate a response.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (error) {console.error("❌ queryAIAssistant error:", error);
      throw error;
    }
  },
};