const fs = require('fs');
const axios = require('axios');
require('dotenv').config({ path: 'c:/Personal Project/CodePulse/Backend/.env' });

async function testAI() {
    try {
        const systemPrompt = "You are a helpful assistant.";
        const message = "Hello";

        const payload = {
            model: "anthropic/claude-3.5-sonnet",
            max_tokens: 500,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ]
        };

        const result = await axios.post("https://openrouter.ai/api/v1/chat/completions", payload, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "CodePulse AI",
            }
        });

        fs.writeFileSync('test_result.txt', "SUCCESS: " + result.data.choices[0].message.content);

    } catch (error) {
        fs.writeFileSync('test_result.txt', "ERROR: " + JSON.stringify(error.response?.data || error.message, null, 2));
    }
}

testAI();
