import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const API_KEY = process.env.ASSEMBLYAI_API_KEY;

export async function speechToText(audioPath) {

    // Read audio file
    const audio = fs.createReadStream(audioPath);

    // Upload to AssemblyAI
    const upload = await axios.post(
        "https://api.assemblyai.com/v2/upload",
        audio,
        {
            headers: {
                authorization: API_KEY,
                "transfer-encoding": "chunked",
            },
            maxBodyLength: Infinity,
        }
    );

    const audioUrl = upload.data.upload_url;

    // Request transcription
    const transcript = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        {
            audio_url: audioUrl,
        },
        {
            headers: {
                authorization: API_KEY,
            },
        }
    );

    const id = transcript.data.id;

    // Poll until completed
    while (true) {

        await new Promise(resolve => setTimeout(resolve, 1500));

        const status = await axios.get(
            `https://api.assemblyai.com/v2/transcript/${id}`,
            {
                headers: {
                    authorization: API_KEY,
                },
            }
        );

        if (status.data.status === "completed") {
            return status.data.text;
        }

        if (status.data.status === "error") {
            throw new Error(status.data.error);
        }
    }
}