import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { PROVIDERS, type ProviderId } from "@/lib/providers";

export const runtime = "nodejs";

const Body = z.object({
  provider: z.enum(["anthropic", "google", "groq"]),
  model: z.string().min(1).max(80),
  apiKey: z.string().min(8).max(400),
  prompt: z.string().min(1).max(4000),
});

const SYSTEM = `You are the Orchestrator, the lead agent in a crew of AI specialists building a mobile app for the user.

Specialists you route work to:
- Product: shapes screens, data model, and user flows
- Mobile: writes React Native and Expo code
- Backend: runs Supabase migrations, row-level security, and edge functions
- QA: typecheck, lint, and smoke tests

Respond in 2–4 short paragraphs, calm and technical. No emojis, no headers, no bullet points.
1. Restate the user's ask in your own words, including the core data model and screens.
2. Call out any non-obvious decision or assumption.
3. Hand off to the specialists, naming who owns what.

Aim for ~180 words. Talk to the user and to your crew — not a customer pitch.`;

function modelFor(provider: ProviderId, model: string, apiKey: string) {
  if (!PROVIDERS[provider].models.some((m) => m.id === model)) {
    throw new Error(`unsupported model for ${provider}: ${model}`);
  }
  if (provider === "anthropic") return createAnthropic({ apiKey })(model);
  if (provider === "google") return createGoogleGenerativeAI({ apiKey })(model);
  return createGroq({ apiKey })(model);
}

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "invalid request" },
      { status: 400 },
    );
  }

  // streamText swallows provider errors into the fullStream rather than
  // throwing, so walk the parts ourselves and surface errors to the client as
  // readable text (rather than closing the response with an empty body).
  let capturedError: unknown = null;
  let result: ReturnType<typeof streamText>;
  try {
    result = streamText({
      model: modelFor(body.provider, body.model, body.apiKey),
      system: SYSTEM,
      prompt: body.prompt,
      onError: ({ error }) => {
        capturedError = error;
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "provider error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            controller.enqueue(encoder.encode(part.text));
          } else if (part.type === "error") {
            capturedError = part.error;
          }
        }
      } catch (err) {
        capturedError = err;
      } finally {
        if (capturedError) {
          const msg =
            capturedError instanceof Error ? capturedError.message : String(capturedError);
          controller.enqueue(encoder.encode(`\n\n[${body.provider} error: ${msg}]`));
        }
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
