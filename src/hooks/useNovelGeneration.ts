"use client";

import { useRef, useState } from "react";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import type { GenerateRequestBody } from "@/types";
import { sanitizeFileName } from "@/utils/api";

function countWords(content: string) {
  return content.replace(/\s/g, "").length;
}

export function useNovelGeneration() {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const pauseGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsGenerating(false);
  };

  const startGeneration = async (payload: GenerateRequestBody) => {
    pauseGeneration();
    setError(null);
    setContent("");
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const errorBody = await response.json().catch(() => ({ error: "生成请求失败。" }));
        throw new Error(errorBody.error || "生成请求失败。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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

          if (data === "[DONE]") {
            setIsGenerating(false);
            abortControllerRef.current = null;
            return;
          }

          const parsed = JSON.parse(data) as { error?: string; text?: string };

          if (parsed.error) {
            throw new Error(parsed.error);
          }

          if (parsed.text) {
            setContent((current) => current + parsed.text);
          }
        }
      }
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        setError(null);
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "生成过程中发生未知错误。");
      }
    } finally {
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const copyContent = async () => {
    if (!content) {
      return;
    }

    await navigator.clipboard.writeText(content);
  };

  const downloadTxt = (bookTitle: string) => {
    if (!content) {
      return;
    }

    const fileName = `${sanitizeFileName(bookTitle)}.txt`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
  };

  const downloadDocx = async (bookTitle: string) => {
    if (!content) {
      return;
    }

    const doc = new Document({
      sections: [
        {
          children: content.split(/\n+/).map((paragraph) => new Paragraph(paragraph)),
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${sanitizeFileName(bookTitle)}.docx`);
  };

  return {
    content,
    copyContent,
    downloadDocx,
    downloadTxt,
    error,
    isGenerating,
    pauseGeneration,
    startGeneration,
    wordCount: countWords(content),
  };
}
