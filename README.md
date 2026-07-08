# WebNovel Writer 本地网站版

[![GitHub stars](https://img.shields.io/github/stars/Caeser-Borgia/webnovel?style=social)](https://github.com/Caeser-Borgia/webnovel)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)

用任意大模型（DeepSeek、Claude、通义千问等）**本地生成百万字网文小说**。无需服务器，只需输入 API Key。

基于 [lingfengQAQ/webnovel-writer](https://github.com/lingfengQAQ/webnovel-writer) 的创作思路，改造成可本地运行的 Next.js 网站版。

---

## 🌟 核心特性

- **三步创作流程**：配置 API → 设置故事 → 实时生成
- **支持多种大模型**：DeepSeek、Claude、通义千问 等任意兼容 OpenAI 协议的 API
- **零基础友好**：只需输入 API 地址和 Key，无需编程知识
- **流式实时显示**：观看小说逐字生成，支持暂停/重新开始
- **智能提示词**：内置网文、科幻、言情、悬疑等多种风格的模板
- **本地隐私保护**：API Key 只保存在浏览器，永不上传服务器
- **便捷导出**：支持下载 TXT 或 DOCX 格式，直接可用

---

## 📦 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/Caeser-Borgia/webnovel.git
cd webnovel

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问：**[http://localhost:3000](http://localhost:3000)**

### 生产构建

```bash
npm run build
npm run start
```

---

## 🚀 使用步骤

### 步骤 1：配置 API

在第一页填写：

| 字段 | 说明 | 示例 |
|------|------|------|
| **API 地址** | 大模型的接口地址 | `https://api.deepseek.com/chat/completions` |
| **API Key** | 从大模型平台获取的密钥 | `sk-xxxxxxxxxxxxx` |
| **模型名称** | 具体使用的模型 | `deepseek-chat` |
| **小说风格** | 创作风格选择 | 网文 / 科幻 / 言情 / 悬疑 |

**配置会自动保存到本地**，下次打开无需重新输入。

### 步骤 2：设置故事

在第二页填写故事基本信息：

- **书名**（必填）：你的小说标题
- **主角名字**（必填）：主人公名字
- **基本设定**（可选）：世界观、剧情框架等背景介绍

这些信息会被注入到 AI 提示词中，确保生成的内容符合你的设定。

### 步骤 3：开始创作

点击”开始创作”后：

1. **实时生成**：观看文本逐字生成，流式输出
2. **字数统计**：实时显示已生成字数
3. **灵活控制**：
   - **暂停**：停止生成
   - **重新开始**：清空内容，从头生成
   - **复制**：一键复制全文到剪贴板
   - **下载**：导出为 TXT 或 DOCX 格式

---

## 🔌 API 配置指南

### DeepSeek

1. 访问 [platform.deepseek.com](https://platform.deepseek.com/)
2. 注册/登录，进入 API 管理页面
3. 创建新的 API Key
4. 填入配置：
   - API 地址：`https://api.deepseek.com/chat/completions`
   - 模型名：`deepseek-chat`

### Anthropic Claude

1. 访问 [console.anthropic.com](https://console.anthropic.com/)
2. 创建 API Key
3. 填入配置：
   - API 地址：`https://api.anthropic.com/v1/messages`
   - 模型名：`claude-3-5-sonnet-20241022`

> ⚠️ Claude 官方 API 响应格式与 OpenAI 有差异，当前版本需要使用代理服务或兼容层。

### 阿里云通义千问

1. 访问 [bailian.console.aliyun.com](https://bailian.console.aliyun.com/)
2. 获取 API Key
3. 填入配置：
   - API 地址：`https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`
   - 模型名：`qwen-max`

### 其他模型

如果你使用了代理服务（如 OpenAI 兼容层）或其他大模型，只要接口兼容 OpenAI `chat/completions` 格式，都可以正常使用。

---

## ⚙️ 后端 API 说明

### 端点

```http
POST /api/generate
```

### 请求体

```json
{
  “apiUrl”: “https://api.deepseek.com/chat/completions”,
  “apiKey”: “sk-xxxxxxxxxxxxx”,
  “model”: “deepseek-chat”,
  “style”: “网文”,
  “bookTitle”: “我穿越了，但我不想修仙”,
  “mainCharacter”: “李火旺”,
  “setting”: “主角穿越到修仙世界，但并不想修仙”,
  “previousContent”: “”
}
```

### 响应

返回 Server-Sent Events (SSE) 流式响应，实时传输生成的文本。

---

## 💡 提示词风格

### 内置风格

当前支持 4 种内置风格，自动调整提示词以适应不同的创作需求：

1. **网文**：高燃、爽感、快节奏
2. **科幻**：硬科幻、设定详尽、逻辑严密
3. **言情**：细腻心理描写、情感递进
4. **悬疑**：节奏压抑、线索交织、烧脑

### 自定义提示词

如需自定义提示词模板，编辑 `src/utils/prompts.ts` 文件。

示例模板结构：
```typescript
export function getNovelPrompt(style, bookTitle, mainCharacter, setting, previousContent) {
  const templates = {
    '网文': '你是专业网文作家...',
    // 添加更多风格
  };
  
  return templates[style]
    .replace('{bookTitle}', bookTitle)
    .replace('{mainCharacter}', mainCharacter)
    .replace('{setting}', setting)
    .replace('{previousContent}', previousContent);
}
```

---

## 📋 FAQ

### Q：API Key 会被保存到服务器吗？
**A：不会。** API Key 只保存在浏览器的 `localStorage`，所有 API 调用都是从你的浏览器直接发起的。

### Q：生成的文本质量怎样？
**A：** 质量取决于：
- 你使用的大模型能力（Claude > DeepSeek > 其他）
- 内置或自定义的提示词质量
- 你输入的故事设定详尽程度

建议先用 DeepSeek 测试（价格便宜），再用 Claude 获取高质量内容。

### Q：能生成多长的小说？
**A：** 理论上无限长。每次生成 3000-5000 字，可以持续点”重新开始”生成下一段，累积成百万字。

### Q：支持哪些导出格式？
**A：** 当前支持：
- **TXT**（纯文本）
- **DOCX**（Word 文档）

### Q：能否在服务器上部署？
**A：** 可以。这是一个标准的 Next.js 应用，可以部署到：
- Vercel（官方推荐）
- Railway
- Heroku
- 自建服务器

---

## 🛠️ 技术栈

- **前端**：Next.js 14 + React 18 + TypeScript
- **样式**：Tailwind CSS
- **后端**：Next.js API Routes（Node.js）
- **流式处理**：Server-Sent Events (SSE)
- **导出**：file-saver + docx

---

## 📝 开发指南

### 项目结构

```
webnovel/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/route.ts    # 生成 API 端点
│   │   ├── page.tsx                  # 主页面（路由控制）
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ConfigPanel.tsx           # 配置面板
│   │   ├── StorySetup.tsx            # 故事设置
│   │   └── GenerationView.tsx        # 生成界面
│   ├── hooks/
│   │   └── useNovelGeneration.ts     # SSE 管理 Hook
│   ├── utils/
│   │   ├── prompts.ts                # 提示词模板
│   │   └── api.ts                    # API 工具函数
│   └── types/
│       └── index.ts                  # 类型定义
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

### 本地开发

```bash
# 开发模式（热更新）
npm run dev

# 构建
npm run build

# 检查 TypeScript
npm run type-check

# 代码格式检查（可选）
npm run lint
```

### 添加新的风格模板

1. 编辑 `src/utils/prompts.ts`
2. 在 `templates` 对象中添加新风格
3. 在 `ConfigPanel.tsx` 的风格选项中添加新选项
4. 测试生成效果

---

## ⚠️ 注意事项

1. **费用承担**：所有 API 调用费用由你自己承担，工具本身完全免费
2. **隐私安全**：API Key 只存储在本地浏览器，不会发送给第三方
3. **网络要求**：需要能访问你使用的大模型 API 服务
4. **速度限制**：取决于大模型的速度和你的网络速度

---

## 🤝 贡献

欢迎 PR 和 Issue！

常见的改进方向：
- 新增小说风格模板
- 优化提示词效果
- 支持更多导出格式
- UI/UX 改进

---

## 📄 许可证

本项目采用 **GPL-3.0** 许可证，继承自原项目。

根据 GPL-3.0，如果你基于本项目进行修改和发布，**必须**：
- 公开你的源代码
- 标明所有修改
- 保留原许可证

详见 [LICENSE](LICENSE) 文件。

---

## 致谢

- 原项目：[lingfengQAQ/webnovel-writer](https://github.com/lingfengQAQ/webnovel-writer)
- 框架：[Next.js](https://nextjs.org/)
- 大模型：DeepSeek、Claude、通义千问等

---

## 📞 反馈和支持

- 提 Issue：[GitHub Issues](https://github.com/Caeser-Borgia/webnovel/issues)
- 讨论：[GitHub Discussions](https://github.com/Caeser-Borgia/webnovel/discussions)

**祝你创作愉快！** 🎉
