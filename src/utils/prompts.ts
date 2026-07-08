import type { CharacterCard, GenerateRequestBody, NovelStyle, PlotPoint, StorySetupData } from "@/types";

const STYLE_SYSTEM_PROMPTS: Record<NovelStyle, string> = {
  网文: `你是一名擅长创作长篇网文的职业作者。
请保持强情节推进、明确冲突、稳定爽点和持续可追读性。
输出必须是小说正文，不要写大纲、解释、标题注释或创作说明。`,
  科幻: `你是一名擅长长篇科幻连载的职业作者。
请保持世界规则自洽、科技设定服务剧情，并让悬念和探索感持续推进。
输出必须是小说正文，不要写设定说明或作者旁白。`,
  言情: `你是一名擅长长篇言情连载的职业作者。
请保持关系推进自然、情绪层次清晰、互动有张力，并兼顾剧情进展。
输出必须是小说正文，不要写解析或提纲。`,
  悬疑: `你是一名擅长长篇悬疑连载的职业作者。
请持续制造信息差、压迫感和新疑点，让线索递进但不要一次性解释完。
输出必须是小说正文，不要写破案总结或结构分析。`,
  奇幻: `你是一名擅长长篇奇幻连载的职业作者。
请保持世界氛围、规则感和冒险推进，让人物成长与遭遇相互推动。
输出必须是小说正文，不要写世界设定说明书。`,
};

function clipText(value: string, maxLength: number, keepTail = false) {
  const normalized = value.trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return keepTail ? normalized.slice(-maxLength) : normalized.slice(0, maxLength);
}

function formatField(label: string, value: string, maxLength: number, keepTail = false) {
  const clipped = clipText(value, maxLength, keepTail);
  return clipped ? `${label}：${clipped}` : "";
}

function getRoundGoal(targetWords: number, currentWordCount: number) {
  const remainingWords = Math.max(targetWords - currentWordCount, 0);

  if (remainingWords === 0) {
    return "当前字数已达到或超过目标字数，本轮只需自然推进一小段，不要强行拉长。";
  }

  const suggestedWords = Math.min(Math.max(Math.round(remainingWords * 0.35), 800), 2200);
  return `当前章节目标总字数为 ${targetWords} 字，当前已写 ${currentWordCount} 字。本轮请优先新增约 ${suggestedWords} 字，宁可自然收束，也不要生硬凑字数。`;
}

function buildCharacterContext(characters: CharacterCard[] | undefined) {
  if (!characters || characters.length === 0) {
    return "";
  }

  const charLines = characters.map((char) => {
    const parts = [
      char.name,
      `(${char.role})`,
      char.description.slice(0, 60),
      char.status ? `当前：${char.status.slice(0, 40)}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return `  • ${parts}`;
  });

  return "主要角色状态：\n" + charLines.join("\n");
}

function buildPlotContext(plots: PlotPoint[] | undefined) {
  if (!plots || plots.length === 0) {
    return "";
  }

  const unresolvedPlots = plots.filter((p) => !p.resolved);
  if (unresolvedPlots.length === 0) {
    return "";
  }

  const plotLines = unresolvedPlots.slice(0, 8).map((p) => {
    const label = `[${p.type}]`;
    const desc = p.description.slice(0, 50);
    const chapter = p.chapter ? `（${p.chapter}出现）` : "";
    return `  • ${label} ${p.title}${chapter} - ${desc}`;
  });

  return "未回收伏笔/情节点：\n" + plotLines.join("\n");
}


export function buildChapterSummary(
  story: StorySetupData,
  chapterTitle: string,
  content: string,
  existingSummary = "",
) {
  const summaryParts = [
    formatField("章节", chapterTitle, 80),
    formatField("已有摘要", existingSummary, 180),
    formatField("当前目标", story.openingGoal, 120),
    formatField("核心冲突", story.coreConflict, 160),
    formatField("最近正文尾段", content, 260, true),
  ].filter(Boolean);

  return summaryParts.join("\n");
}

function buildStoryStateSummary(body: GenerateRequestBody) {
  const chapterSummary = body.chapterSummary.trim()
    ? body.chapterSummary.trim()
    : buildChapterSummary(body, body.chapterTitle, body.previousContent);

  const parts = [
    formatField("书名", body.bookTitle, 80),
    formatField("章节标题", body.chapterTitle, 80),
    formatField("主角", body.mainCharacter, 120),
    formatField("故事简介", body.storyIntro, 240),
    formatField("基础设定", body.setting, 260),
    formatField("世界观", body.worldSetting, 260),
    formatField("主角人设", body.protagonistProfile, 220),
    formatField("主要配角", body.supportingCharacters, 220),
    formatField("势力与阵营", body.factions, 200),
    formatField("核心矛盾", body.coreConflict, 200),
    formatField("开篇目标", body.openingGoal, 180),
    formatField("文风补充要求", body.styleNotes, 180),
    formatField("本章状态摘要", chapterSummary, 400),
  ].filter(Boolean);

  // 添加角色上下文
  const characterContext = buildCharacterContext(body.characters);
  if (characterContext) {
    parts.push(characterContext);
  }

  // 添加伏笔上下文
  const plotContext = buildPlotContext(body.plots);
  if (plotContext) {
    parts.push(plotContext);
  }

  return parts.join("\n");
}

export function getNovelPrompt(body: GenerateRequestBody) {
  const previousTail = clipText(body.previousContent, 2400, true);
  const modeInstruction =
    body.generationMode === "continue"
      ? "这是对当前章节的续写。请无缝接在已有正文后面，不要重复已经发生的内容。"
      : body.generationMode === "restart"
        ? "这是对当前章节的重写。请忽略旧正文，从本章开头重新生成。"
        : "这是新章节的首次生成。请从本章开头自然展开。";

  const systemPrompt = [STYLE_SYSTEM_PROMPTS[body.style], body.systemPrompt.trim()]
    .filter(Boolean)
    .join("\n\n");

  const userPrompt = [
    "请根据以下信息继续创作长篇小说正文：",
    "",
    buildStoryStateSummary(body),
    "",
    "写作要求：",
    "1. 保持人物、设定、冲突和叙事口吻前后一致。",
    "2. 本轮只输出小说正文，不要输出标题、注释、总结、分点说明或括号提示。",
    "3. 如果是续写，必须顺着最近情节推进，避免改写前文或重复铺垫。",
    "4. 让每一段都推动剧情、人物关系、信息揭示或情绪变化中的至少一项。",
    "5. 结尾保留继续写下去的动力，但不要每次都生硬断在悬念句。",
    `6. ${getRoundGoal(body.targetWords, body.currentWordCount)}`,
    body.additionalRequirements.trim() ? `7. 附加写作要求：${clipText(body.additionalRequirements, 220)}` : "",
    "",
    `生成模式：${modeInstruction}`,
    "",
    "最近正文参考：",
    previousTail || "暂无正文，请直接从本章开头写起。",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}
