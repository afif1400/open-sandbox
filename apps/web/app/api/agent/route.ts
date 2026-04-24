import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { PROVIDERS, type ProviderId } from "@/lib/providers";
import { AGENT_PROMPTS, composePrompt } from "@/lib/agent-prompts";

export const runtime = "nodejs";

const Body = z.object({
  provider: z.enum(["anthropic", "google", "groq"]),
  model: z.string().min(1).max(80),
  apiKey: z.string().min(8).max(400),
  role: z.enum(["orchestrator", "product"]),
  prompt: z.string().min(1).max(4000),
  context: z.string().max(12000).optional(),
});

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

  let capturedError: unknown = null;
  let result: ReturnType<typeof streamText>;
  try {
    result = streamText({
      model: modelFor(body.provider, body.model, body.apiKey),
      system: AGENT_PROMPTS[body.role],
      prompt: composePrompt(body.role, body.prompt, body.context),
      onError: ({ error }) => {
        capturedError = error;
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "provider error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // streamText swallows provider errors into fullStream rather than throwing,
  // so walk the parts ourselves and surface errors as readable text rather
  // than closing the response with an empty body on a 401.
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
