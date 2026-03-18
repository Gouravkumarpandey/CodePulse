const axios = require('axios');
const DatabaseService = require('../services/mongo.service');
const response = require('../utils/response.util');

const chatWithAI = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        // Fetch current rules from database
        const settings = await DatabaseService.getAdminSettings();
        const rules = settings || {
          maxInactivityGapHours: 2,
          gracePeriodHours: 1,
          warningThresholdHours: 1.5,
          totalHackathonDurationHours: 48,
        };

        // System prompt outlining constraints and capabilities
        const systemPrompt = `You are CodePulse AI, a smart assistant helper for the developer portal CodePulse.
Your primary duties are:
1. Clearly explain and always adhere to the current server rules set by the Admin:
   - Max Inactivity Gap: ${rules.maxInactivityGapHours} hours (How long they can stay inactive before violation).
   - Grace Period: ${rules.gracePeriodHours} hours (After gap exceeds).
   - Warning Threshold: ${rules.warningThresholdHours} hours (Threshold for warning state triggers).
   - Total Hackathon Duration: ${rules.totalHackathonDurationHours} hours.

2. Guide fully with GitHub setup, git commit, branching strategies and general merge structures.
3. Help users resolve merge conflicts step-by-step.
4. Analyze problem statements provided by users and guide them through solutions or building architecture correctly.

Respond in structured markdown correctly, being concise, helpful, and polite. Highlight solutions strictly.`;

        // Frame the API payload for OpenRouter
        const payload = {
            model: "anthropic/claude-3.5-sonnet", // Smartest model, switch to "anthropic/claude-3-opus" if needed
            max_tokens: 500, // Explicitly cap to prevent high-balance checks from failing on light balances
            messages: [
                { role: "system", content: systemPrompt },
                ...history.map(h => ({
                    role: h.role || (h.sender === 'user' ? 'user' : 'assistant'),
                    content: h.content || h.text
                })),
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

        if (!result.data.choices || result.data.choices.length === 0) {
            throw new Error("No response from AI model.");
        }

        const aiMessage = result.data.choices[0].message.content;
        response.success(res, { reply: aiMessage });

    } catch (error) {
        console.error("AI Chat Error:", error.response?.data || error.message);
        response.error(res, error.response?.data?.error?.message || error.message, 500);
    }
};

module.exports = {
    chatWithAI
};
