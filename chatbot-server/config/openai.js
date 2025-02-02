const axios = require("axios");

const queryOpenAI = async (message, context) => {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are an assistant for CAM Institute. Provide well-formatted responses with bullet points, headings, and line breaks. Use **bold text** to emphasize important points. Be concise and clear." },
                    { role: "user", content: `Context: ${context}\n\nQuestion: ${message}` },
                ],
                max_tokens: 1000,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error querying OpenAI:", error.message);
        return "Sorry, I couldn't fetch a response.";
    }
};

module.exports = queryOpenAI;
