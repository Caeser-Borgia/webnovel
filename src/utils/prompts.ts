import type { NovelStyle } from "@/types";

const STYLE_TEMPLATES: Record<NovelStyle, string> = {
  网文: `你是一位专业的网络小说作家，擅长创作高燃、强节奏、强代入感的网文故事。

故事设定：
- 书名：《{bookTitle}》
- 主角：{mainCharacter}
- 基本设定：{setting}

写作要求：
1. 开篇要快，尽快进入矛盾和冲突。
2. 场景描写要具体，人物心理要贴着剧情推进。
3. 对话要有辨识度，避免空泛抒情。
4. 每一段都要推动情节、情绪或信息变化。
5. 结尾要留下继续读下去的动力。

前文内容（供参考）：
{previousContent}

请继续这个故事，生成下一段内容，保持连贯、自然、可继续衔接。`,
  科幻: `你是一位专业的科幻小说作家，擅长写出兼具想象力、压迫感和未来细节的故事。

故事设定：
- 书名：《{bookTitle}》
- 主角：{mainCharacter}
- 基本设定：{setting}

写作要求：
1. 世界规则要清晰，科技设定要服务剧情。
2. 场景具备视觉感和空间感。
3. 保持悬念与探索感，逐步揭示真相。
4. 人物选择要受科技、制度或环境约束。
5. 收尾保留下一段推进空间。

前文内容（供参考）：
{previousContent}

请继续这个故事，生成下一段内容，保持风格统一和逻辑一致。`,
  言情: `你是一位专业的言情小说作家，擅长塑造情绪层次、人物张力与关系推进。

故事设定：
- 书名：《{bookTitle}》
- 主角：{mainCharacter}
- 基本设定：{setting}

写作要求：
1. 感情推进要自然，有细节和互动支撑。
2. 对话要能体现人物关系变化。
3. 兼顾情绪、场景与剧情，不要只有内心戏。
4. 保留明显的关系钩子和情节期待。
5. 文风细腻但不要拖慢节奏。

前文内容（供参考）：
{previousContent}

请继续这个故事，生成下一段内容，保持人物关系的连贯性。`,
  悬疑: `你是一位专业的悬疑小说作家，擅长制造信息差、压迫感和反转。

故事设定：
- 书名：《{bookTitle}》
- 主角：{mainCharacter}
- 基本设定：{setting}

写作要求：
1. 通过细节埋线索，不要直接解释答案。
2. 节奏稳中有压，持续制造未知感。
3. 每个场景都要带来新的疑点或发现。
4. 人物言行要有隐藏动机。
5. 结尾需要抛出新的问题或危险。

前文内容（供参考）：
{previousContent}

请继续这个故事，生成下一段内容，保持悬疑氛围和线索连续性。`,
  奇幻: `你是一位专业的奇幻小说作家，擅长描绘宏大世界、神秘规则和冒险质感。

故事设定：
- 书名：《{bookTitle}》
- 主角：{mainCharacter}
- 基本设定：{setting}

写作要求：
1. 世界观要有神秘感，但信息释放要克制。
2. 强调环境、氛围和异世界感官体验。
3. 主角行动需要目标明确、代价真实。
4. 战斗、探索或遭遇要推动人物成长。
5. 结尾保留新的旅程动机。

前文内容（供参考）：
{previousContent}

请继续这个故事，生成下一段内容，保持奇幻世界的沉浸感与连续性。`,
};

function clipPreviousContent(previousContent: string) {
  const normalized = previousContent.trim();

  if (!normalized) {
    return "暂无前文，请从故事开篇开始。";
  }

  if (normalized.length <= 6000) {
    return normalized;
  }

  return `以下是前文末尾摘要，请确保自然衔接：\n${normalized.slice(-6000)}`;
}

export function getNovelPrompt(
  style: NovelStyle,
  bookTitle: string,
  mainCharacter: string,
  setting: string,
  previousContent: string,
) {
  return STYLE_TEMPLATES[style]
    .replace("{bookTitle}", bookTitle)
    .replace("{mainCharacter}", mainCharacter)
    .replace("{setting}", setting || "作者暂未补充，请你自行补足合理的世界观与冲突起点。")
    .replace("{previousContent}", clipPreviousContent(previousContent));
}
