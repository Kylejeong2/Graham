import { NextResponse } from 'next/server';
import type { Voice } from "@cartesia/cartesia-js";
import CartesiaClient from "@cartesia/cartesia-js";

export async function GET() {
    try {
        // Initialize client with error checking
        if (!process.env.CARTESIA_API_KEY) {
            throw new Error('CARTESIA_API_KEY is not configured');
        }

        const client = new CartesiaClient({
            apiKey: process.env.CARTESIA_API_KEY,
        });

        // Add more detailed error handling around the API call
        let voices;
        try {
            voices = await client.voices.list();
        } catch (apiError) {
            console.error('Cartesia API error details:', apiError);
            return NextResponse.json(
                { error: 'Failed to fetch voices from Cartesia API' },
                { status: 502 }
            );
        }

        // Validate the response
        if (!Array.isArray(voices)) {
            console.error('Unexpected response format:', voices);
            return NextResponse.json(
                { error: 'Invalid response format from Cartesia API' },
                { status: 502 }
            );
        }

        // Filter for public English voices only
        const filteredVoices = voices.filter((voice: Voice) => 
            voice.is_public && voice.language === 'en'
        );

        return NextResponse.json({ voices: filteredVoices }, { status: 200 });
    } catch (error) {
        // Log the full error for debugging
        console.error('Detailed error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            error
        });

        return NextResponse.json(
            { error: 'Internal server error while fetching voices' },
            { status: 500 }
        );
    }
}
