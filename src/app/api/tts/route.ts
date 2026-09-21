import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

const TTSRequestSchema = z.object({
  text: z.string().min(1, "Text is required.").max(2500, "Text exceeds maximum character limit of 2500."),
  voiceId: z.string().optional(),
});

// Verified free-tier premade voices
const PREMADE_VOICES = [
  "EXAVITQu4vr4xnSDxMaL", // Sarah (Mature, Reassuring, Confident)
  "Xb7hH8MSUJpSbSDYk0k2", // Alice (Clear, Engaging Educator)
  "JBFqnCBsd6RMkjVDRZzb", // George (Warm Storyteller)
  "IKne3meq5aSn9XLyUdCD", // Charlie (Deep, Confident)
];

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // 2. Validate input
    const body = await req.json();
    const validation = TTSRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { text, voiceId: customVoiceId } = validation.data;

    // 3. Check for ElevenLabs API Key
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured", fallback: true },
        { status: 501 }
      );
    }

    // Determine voice IDs to try (custom/configured first, followed by verified premade fallbacks)
    const preferredVoiceId = customVoiceId || process.env.ELEVENLABS_VOICE_ID?.trim() || PREMADE_VOICES[0];
    const voiceCandidates = Array.from(new Set([preferredVoiceId, ...PREMADE_VOICES]));

    let audioBuffer: ArrayBuffer | null = null;
    let lastError = "";

    // 4. Try synthesizing with fallback across valid premade voices if library voice returns 402
    for (const voiceId of voiceCandidates) {
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
              "Accept": "audio/mpeg",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (response.ok) {
          audioBuffer = await response.arrayBuffer();
          break;
        } else {
          lastError = await response.text().catch(() => `HTTP ${response.status}`);
          console.warn(`[ElevenLabs TTS] Voice ${voiceId} returned status ${response.status}. Trying premade fallback...`);
        }
      } catch (fetchErr: unknown) {
        lastError = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        console.warn(`[ElevenLabs TTS] Fetch error for voice ${voiceId}: ${lastError}`);
      }
    }

    if (!audioBuffer) {
      console.error("ElevenLabs TTS failed for all candidate voices. Last error:", lastError);
      return NextResponse.json(
        { error: "ElevenLabs TTS synthesis failed", fallback: true },
        { status: 502 }
      );
    }

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error: unknown) {
    console.error("API /api/tts Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", fallback: true },
      { status: 500 }
    );
  }
}
