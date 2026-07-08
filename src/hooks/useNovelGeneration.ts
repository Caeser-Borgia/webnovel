"use client";

import { useRef, useState } from "react";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import type { GenerateRequestBody, GenerationStatus } from "@/types";
import { sanitizeFileName, countWords } from "@/utils/api";

export function useNovelGeneration() {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [lastDeltaWords, setLastDeltaWords] = useState(0);
  const [lastStartedAt, setLastStartedAt] = useState<string | null>(null);
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isGenerating = status === "generating";

  const pauseGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus("paused");
  };

  const resetContent = () => {
    setContent("");
    setError(null);
    setStatus("idle");
    setLastDeltaWords(0);
    setLastStartedAt(null);
    setLastCompletedAt(null);
  };

  const performGeneration = async (payload: GenerateRequestBody, appendMode: boolean) => {
    const now = new Date().toISOString();
    setLastStartedAt(now);

    if (!appendMode) {
      setContent("");
    }

    setError(null);
    setStatus("generating");
    setLastDeltaWords(0);

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
      let deltaWords = 0;

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
            setStatus("completed");
            setLastDeltaWords(deltaWords);
            setLastCompletedAt(new Date().toISOString());
            abortControllerRef.current = null;
            return;
          }

          const parsed = JSON.parse(data) as { error?: string; text?: string };

          if (parsed.error) {
            throw new Error(parsed.error);
          }

          if (parsed.text) {
            deltaWords += countWords(parsed.text);
            setContent((current) => current + parsed.text);
          }
        }
      }
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        setError(null);
      } else {
        const errorMsg = caughtError instanceof Error ? caughtError.message : "生成过程中发生未知错误。";
        setError(errorMsg);
        setStatus("error");
      }
    } finally {
      abortControllerRef.current = null;
      if (status === "generating") {
        setStatus("completed");
      }
    }
  };

  const startGeneration = async (payload: GenerateRequestBody) => {
    await performGeneration(payload, false);
  };

  const continueGeneration = async (payload: GenerateRequestBody) => {
    await performGeneration(payload, true);
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
    continueGeneration,
    downloadDocx,
    downloadTxt,
    error,
    isGenerating,
    lastCompletedAt,
    lastDeltaWords,
    lastStartedAt,
    pauseGeneration,
    resetContent,
    startGeneration,
    status,
    wordCount: countWords(content),
  };
}
