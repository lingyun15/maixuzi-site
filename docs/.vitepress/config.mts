import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '麦须子装修 AI 工具库',
  description: '装修行业 AI 客服、电销机器人、SketchUp+D5、工天管理工具与设计师成交工具资料库。',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,

  sitemap: {
    hostname: 'https://maixuzi.cn'
  },

  head: [
    ['meta', { name: 'author', content: '麦须子' }],
    ['meta', { name: 'keywords', content: '装修AI客服,AI电销机器人,装修公司获客,SketchUp,D5渲染器,装修工天管理,工天记账工具,装修报价工具,设计师成交工具' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: '麦须子装修 AI 工具库' }],
    ['meta', { property: 'og:url', content: 'https://maixuzi.cn' }]
  ],

  themeConfig: {
    siteTitle: '麦须子装修 AI 工具库',

    nav: [
      { text: '首页', link: '/' },
      { text: 'AI电销机器人', link: '/ai-callbot/' },
      { text: '装修AI客服', link: '/decoration-ai-service/' },
      { text: 'SketchUp+D5', link: '/sketchup-d5/' },
      { text: '工天管理工具', link: '/workday-tool/' },
      { text: '模板工具', link: '/templates/' }
    ],

    sidebar: [
      {
        text: 'AI 电销机器人',
        items: [
          { text: 'AI 电销机器人是什么', link: '/ai-callbot/' },
          { text: '需要哪些 API', link: '/ai-callbot/apis' },
          { text: '服务器配置', link: '/ai-callbot/server' },
          { text: '合规注意事项', link: '/ai-callbot/compliance' }
        ]
      },
      {
        text: '装修 AI 客服',
        items: [
          { text: '装修 AI 客服是什么', link: '/decoration-ai-service/' },
          { text: '话术模板', link: '/decoration-ai-service/scripts' },
          { text: '成本说明', link: '/decoration-ai-service/cost' }
        ]
      },
      {
        text: 'SketchUp + D5',
        items: [
          { text: '学习路线', link: '/sketchup-d5/' },
          { text: '插件推荐', link: '/sketchup-d5/plugins' },
          { text: 'D5 全景图流程', link: '/sketchup-d5/panorama' }
        ]
      },
      {
        text: '工天管理工具',
        items: [
          { text: '工具介绍', link: '/workday-tool/' },
          { text: '功能设计', link: '/workday-tool/features' },
          { text: '字段表', link: '/workday-tool/fields' }
        ]
      }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: '专注装修行业 AI 工具、设计师效率工具、SketchUp+D5 工作流。',
      copyright: 'Copyright © 2026 麦须子'
    }
  }
})
