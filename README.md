# maixuzi.cn 网站项目

麦序子是一个面向装修公司、室内设计师、设计工作室和施工团队的装修行业 AI 工具资料库。

网站地址：<https://maixuzi.cn>

当前内容方向包括：

- AI 电销机器人
- 装修 AI 客服
- 装修公司获客
- SketchUp + D5 工作流
- 装修工地工天管理工具
- 装修报价与设计师成交工具
- 微信服务号内容同步

本项目使用 VitePress + Cloudflare Pages 构建，目标是让装修行业相关内容更容易被搜索引擎和 AI Agent 发现、读取和引用。

## 本地运行

```bash
npm install
npm run docs:dev
```

## 构建

```bash
npm run docs:build
```

## Cloudflare Pages 配置

- Build command: `npm run docs:build`
- Build output directory: `docs/.vitepress/dist`

## 重要文件

- `docs/public/llms.txt`
- `docs/public/robots.txt`
- `docs/.vitepress/config.mts`
