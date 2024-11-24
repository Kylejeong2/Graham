import { NextResponse } from 'next/server';
import { ElevenLabsClient } from "elevenlabs";

export async function GET() {
    try {
        // Initialize client with error checking
        if (!process.env.ELEVENLABS_API_KEY) {
            throw new Error('ELEVENLABS_API_KEY is not configured');
        }

        const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

        // Add more detailed error handling around the API call
        let voicesResponse;
        try {
            voicesResponse = await client.voices.getAll();
        } catch (apiError) {
            console.error('ElevenLabs API error details:', apiError);
            return NextResponse.json(
                { error: 'Failed to fetch voices from ElevenLabs API' },
                { status: 502 }
            );
        }

        // Get the voices array from the response
        const voices = Array.isArray(voicesResponse) ? voicesResponse : voicesResponse.voices;

        // Update the filtering to handle nullable properties
        const filteredVoices = voices.filter((voice) => {
            // Include all voices, as available_for_tiers might be empty or null
            return voice.voice_id && voice.name;
        });

        // Map to match expected response format, handling null values
        const formattedVoices = filteredVoices.map((voice) => ({
            voice_id: voice.voice_id,
            name: voice.name,
            samples: voice.samples || [],
            category: voice.category || "premade",
            fine_tuning: voice.fine_tuning || {},
            labels: voice.labels || {},
            description: voice.description || "",
            preview_url: voice.preview_url || "",
            available_for_tiers: voice.available_for_tiers || [],
            settings: voice.settings || {},
            sharing: voice.sharing || {},
            high_quality_base_model_ids: voice.high_quality_base_model_ids || [],
            safety_control: voice.safety_control || null,
            voice_verification: voice.voice_verification || {},
            permission_on_resource: voice.permission_on_resource || "",
            is_owner: voice.is_owner || false,
            is_legacy: voice.is_legacy || false,
            is_mixed: voice.is_mixed || false
        }));

        return NextResponse.json({ voices: formattedVoices }, { status: 200 });
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
