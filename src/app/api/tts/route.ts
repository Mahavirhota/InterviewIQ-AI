import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

const TTSRequestSchema = z.object({
  text: z.string().min(1, "Text is required.").max(2500, "Text exceeds maximum character limit of 2500."),
  voiceId: z.string().optional(),
});

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

    const voiceId = customVoiceId || process.env.ELEVENLABS_VOICE_ID?.trim() || "21m00Tcm4TlvDq8ikWAM"; // Default: Rachel

    // 4. Call ElevenLabs API
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

    if (!response.ok) {
      const errorDetail = await response.text().catch(() => "Unknown error");
      console.error(`ElevenLabs API returned status ${response.status}:`, errorDetail);
      return NextResponse.json(
        { error: "ElevenLabs TTS synthesis failed", fallback: true },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

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
