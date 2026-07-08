"use client";

import { useRef, useState } from "react";
import { Document, HeadingLevel, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import type { GenerateRequestBody, GenerationMode, GenerationStatus } from "@/types";
import { countWords, sanitizeFileName } from "@/utils/api";

interface GenerationOptions {
  initialContent: string;
  mode: GenerationMode;
  replaceContent: boolean;
}

interface GenerationResult {
  status: Exclude<GenerationStatus, "idle" | "generating">;
  content: string;
  addedWords: number;
  error: string | null;
}

interface ExportSection {
  title: string;
  content: string;
}

interface ChapterStateSnapshot {
  content: string;
  error: string | null;
  status: GenerationStatus;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastGenerationMode: GenerationMode;
  lastDeltaWords: number;
}

function buildDocParagraphs(sections: ExportSection[]) {
  return sections.flatMap((section) => {
    const paragraphs: Paragraph[] = [];

    if (section.title.trim()) {
      paragraphs.push(
        new Paragraph({
          text: section.title.trim(),
          heading: HeadingLevel.HEADING_1,
        }),
      );
    }

    const content = section.content.trim();
    const body = content
      ? content.split(/\n+/).map((paragraph) => new Paragraph(paragraph))
      : [new Paragraph("暂无内容")];

    paragraphs.push(...body);
    return paragraphs;
  });
}

export function useNovelGeneration() {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [currentMode, setCurrentMode] = useState<GenerationMode>("start");
  const [lastStartedAt, setLastStartedAt] = useState<string | null>(null);
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);
  const [lastDeltaWords, setLastDeltaWords] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contentRef = useRef("");
  const stopRequestedRef = useRef(false);

  const loadChapterState = (snapshot: ChapterStateSnapshot) => {
    contentRef.current = snapshot.content;
    setContent(snapshot.content);
    setError(snapshot.error);
    setStatus(snapshot.status === "generating" ? "paused" : snapshot.status);
    setCurrentMode(snapshot.lastGenerationMode);
    setLastStartedAt(snapshot.lastStartedAt);
    setLastCompletedAt(snapshot.lastCompletedAt);
    setLastDeltaWords(snapshot.lastDeltaWords);
    setIsGenerating(false);
  };

  const pauseGeneration = () => {
    stopRequestedRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsGenerating(false);
    setStatus("paused");
  };

  const startGeneration = async (
    payload: GenerateRequestBody,
    options: GenerationOptions,
  ): Promise<GenerationResult> => {
    abortControllerRef.current?.abort();
    stopRequestedRef.current = false;
    setError(null);
    setCurrentMode(options.mode);
    setLastDeltaWords(0);

    const baseContent = options.replaceContent ? "" : options.initialContent;
    contentRef.current = baseContent;
    setContent(baseContent);

    const baseWordCount = countWords(baseContent);
    setLastStartedAt(new Date().toISOString());
    setStatus("generating");
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let nextStatus: GenerationResult["status"] = "completed";
    let nextError: string | null = null;

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
            nextStatus = stopRequestedRef.current ? "paused" : "completed";
            break;
          }

          const parsed = JSON.parse(data) as { error?: string; text?: string };

          if (parsed.error) {
            throw new Error(parsed.error);
          }

          if (parsed.text) {
            const nextContent = `${contentRef.current}${parsed.text}`;
            contentRef.current = nextContent;
            setContent(nextContent);
          }
        }
      }
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        nextStatus = "paused";
      } else {
        nextStatus = "error";
        nextError = caughtError instanceof Error ? caughtError.message : "生成过程中发生未知错误。";
        setError(nextError);
      }
    } finally {
      abortControllerRef.current = null;
      setIsGenerating(false);
      setStatus(nextStatus);
      setLastCompletedAt(new Date().toISOString());
    }

    const addedWords = Math.max(countWords(contentRef.current) - baseWordCount, 0);
    setLastDeltaWords(addedWords);

    return {
      status: nextStatus,
      content: contentRef.current,
      addedWords,
      error: nextError,
    };
  };

  const copyText = async (value: string) => {
    if (!value.trim()) {
      return;
    }

    await navigator.clipboard.writeText(value);
  };

  const downloadTxt = (fileName: string, value: string) => {
    if (!value.trim()) {
      return;
    }

    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${sanitizeFileName(fileName)}.txt`);
  };

  const downloadMarkdown = (fileName: string, value: string) => {
    if (!value.trim()) {
      return;
    }

    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, `${sanitizeFileName(fileName)}.md`);
  };

  const downloadDocx = async (fileName: string, sections: ExportSection[]) => {
    if (!sections.some((section) => section.content.trim())) {
      return;
    }

    const doc = new Document({
      sections: [
        {
          children: buildDocParagraphs(sections),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${sanitizeFileName(fileName)}.docx`);
  };

  return {
    content,
    copyText,
    currentMode,
    downloadDocx,
    downloadMarkdown,
    downloadTxt,
    error,
    isGenerating,
    lastCompletedAt,
    lastDeltaWords,
    lastStartedAt,
    loadChapterState,
    pauseGeneration,
    startGeneration,
    status,
    wordCount: countWords(content),
  };
}
