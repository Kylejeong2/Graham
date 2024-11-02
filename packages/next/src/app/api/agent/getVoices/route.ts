import { NextResponse } from 'next/server';
import type { Voice } from "@cartesia/cartesia-js";

export async function GET() {
    try {
        const response = await fetch('https://api.cartesia.ai/voices/', {
            headers: {
                'Cartesia-Version': '2024-06-10',
                'X-API-Key': process.env.CARTESIA_API_KEY!,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch voices from Cartesia');
        }

        const voices: Voice[] = await response.json();

        // Filter for public English voices only
        const filteredVoices = voices.filter(voice => 
            voice.is_public && voice.language === 'en'
        );

        return NextResponse.json(filteredVoices);
    } catch (error) {
        console.error('Error fetching voices:', error);
        return NextResponse.json(
            { error: `Failed to fetch voices: ${error}` },
            { status: 500 }
        );
    }
}
