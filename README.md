# WebNovel Writer 本地网站版

基于 [lingfengQAQ/webnovel-writer](https://github.com/lingfengQAQ/webnovel-writer) 的创作思路，改造成可本地运行的 Next.js 网站版。

## 功能

- 三步创作流程：配置模型 -> 填写故事设定 -> 实时生成内容
- 支持自定义 API 地址、API Key、模型名、小说风格
- 通过 `/api/generate` 本地路由代理上游模型接口
- 流式显示生成文本，支持暂停、重新开始、复制、导出 TXT / DOCX
- 配置和故事信息保存在浏览器 `localStorage`

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 使用方式

1. 在配置页填写 API 地址、API Key、模型名和小说风格。
2. 在故事页填写书名、主角名字和基本设定。
3. 点击“开始创作”后，页面会通过本地 `/api/generate` 路由流式显示模型输出。

## API 说明

请求发送到本地接口：

```http
POST /api/generate
```

请求体示例：

```json
{
  "apiUrl": "https://api.deepseek.com/chat/completions",
  "apiKey": "sk-xxxxx",
  "model": "deepseek-chat",
  "style": "网文",
  "bookTitle": "我穿越了，但我不想修仙",
  "mainCharacter": "李火旺",
  "setting": "主角穿越到修仙世界，但并不想修仙",
  "previousContent": ""
}
```

当前后端按 OpenAI 兼容流式接口发送请求，因此最适合直接填写兼容 `chat/completions` 的地址。

## 获取 API Key

- DeepSeek: [platform.deepseek.com](https://platform.deepseek.com/)
- Anthropic Claude: [console.anthropic.com](https://console.anthropic.com/)
- 阿里云百炼 / 通义千问: [bailian.console.aliyun.com](https://bailian.console.aliyun.com/)

如果你使用的是代理服务或统一网关，请填写它提供的兼容地址。

## 许可证

原项目采用 GPL-3.0，本改造版保留 GPL-3.0 许可证，请一并遵守其分发要求。
