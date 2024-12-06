import type { CallLog } from "@graham/db";

export function analyzeSentiment(transcription: string): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' {
    // Simple sentiment analysis based on keyword matching
    const positiveKeywords = ['great', 'thanks', 'happy', 'perfect', 'excellent', 'good', 'wonderful', 'appreciate'];
    const negativeKeywords = ['bad', 'wrong', 'unhappy', 'terrible', 'poor', 'issue', 'problem', 'complaint'];

    const text = transcription.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    positiveKeywords.forEach(keyword => {
        const matches = text.match(new RegExp(keyword, 'g'));
        if (matches) positiveScore += matches.length;
    });

    negativeKeywords.forEach(keyword => {
        const matches = text.match(new RegExp(keyword, 'g'));
        if (matches) negativeScore += matches.length;
    });

    if (positiveScore > negativeScore) return 'POSITIVE';
    if (negativeScore > positiveScore) return 'NEGATIVE';
    return 'NEUTRAL';
}

export function analyzeCallSuccess(transcription: string, summary: string | null): boolean {
    const successIndicators = [
        'resolved',
        'completed',
        'helped',
        'solved',
        'fixed',
        'done',
        'successful',
        'thank you',
        'thanks'
    ];

    const text = (transcription + ' ' + (summary || '')).toLowerCase();
    return successIndicators.some(indicator => text.includes(indicator));
}

export function identifyCallTags(transcription: string, summary: string | null): string[] {
    const text = (transcription + ' ' + (summary || '')).toLowerCase();
    const tags: string[] = [];

    // Define patterns for each tag
    const patterns = {
        SALES_OPPORTUNITY: ['price', 'cost', 'buy', 'purchase', 'interested in', 'looking to get'],
        SUPPORT_ISSUE: ['help', 'problem', 'issue', 'not working', 'broken', 'error'],
        GENERAL_INQUIRY: ['question', 'wondering', 'information', 'learn more', 'tell me about'],
        COMPLAINT: ['unhappy', 'dissatisfied', 'complaint', 'wrong', 'bad', 'terrible'],
        FOLLOW_UP_REQUIRED: ['call back', 'follow up', 'check back', 'let me know', 'contact again'],
        HIGH_PRIORITY: ['urgent', 'emergency', 'asap', 'immediately', 'critical']
    };

    // Check for each pattern
    Object.entries(patterns).forEach(([tag, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
            tags.push(tag);
        }
    });

    if (analyzeCallSuccess(transcription, summary)) {
        tags.push('RESOLVED');
    }

    return tags;
}

export function calculateMetrics(calls: CallLog[]) {
    const totalCalls = calls.length;
    if (totalCalls === 0) return null;

    const avgDuration = calls.reduce((acc, call) => acc + call.duration, 0) / totalCalls;
    const successfulCalls = calls.filter(call => 
        call.transcription && analyzeCallSuccess(call.transcription, call.summary)
    ).length;

    const sentiments = calls.reduce((acc, call) => {
        if (!call.transcription) return acc;
        const sentiment = analyzeSentiment(call.transcription);
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        totalCalls,
        avgDuration,
        successRate: (successfulCalls / totalCalls) * 100,
        sentiments
    };
} 