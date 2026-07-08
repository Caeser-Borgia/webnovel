import { NextRequest, NextResponse } from "next/server";
import { getNovelPrompt } from "@/utils/prompts";
import type { GenerateRequestBody } from "@/types";

function extractTextFromChunk(payload: Record<string, unknown>) {
  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const firstChoice = choices[0] as
    | {
        delta?: { content?: string };
        message?: { content?: string };
        text?: string;
      }
    | undefined;

  if (!firstChoice) {
    return "";
  }

  return firstChoice.delta?.content || firstChoice.message?.content || firstChoice.text || "";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const {
      apiUrl,
      apiKey,
      bookTitle,
      mainCharacter,
      model,
      previousContent,
      setting,
      style,
    } = body;

    if (!apiUrl || !apiKey || !model || !bookTitle || !mainCharacter) {
      return NextResponse.json({ error: "缺少必要字段，请检查配置和故事信息。" }, { status: 400 });
    }

    const prompt = getNovelPrompt(style, bookTitle, mainCharacter, setting, previousContent);
    const upstreamResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 5000,
        temperature: 0.9,
      }),
      cache: "no-store",
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        {
          error: errorText || "上游模型接口调用失败。",
        },
        { status: upstreamResponse.status || 500 },
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamResponse.body!.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();

              if (!trimmed.startsWith("data:")) {
                continue;
              }

              const data = trimmed.slice(5).trim();

              if (!data) {
                continue;
              }

              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const json = JSON.parse(data) as Record<string, unknown>;
                const text = extractTextFromChunk(json);

                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: data })}\n\n`));
              }
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: error instanceof Error ? error.message : "流式转发失败。",
              })}\n\n`,
            ),
          );
          controller.close();
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "生成接口发生未知错误。",
      },
      { status: 500 },
    );
  }
}
