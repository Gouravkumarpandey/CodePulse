
const AIInsightsService = require('./src/services/ai.service');
require('dotenv').config();

async function testAI() {
    console.log('Testing Gemini AI Integration...');
    const stats = {
        totalCommits: 50,
        consistencyScore: 85,
        longestGap: 12,
        averageGap: 4,
        burstCommits: 5,
        warningCount: 0,
        violationCount: 0,
        timelineSpan: 10,
        lastMinuteCommits: 2
    };

    try {
        const insight = await AIInsightsService.generateInsights(stats);
        console.log('AI Insight Result:', insight);
    } catch (error) {
        console.error('AI Insight Error:', error.message);
    }
}

testAI();
