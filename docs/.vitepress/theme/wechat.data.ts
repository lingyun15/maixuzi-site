import { createContentLoader } from 'vitepress'

export interface WechatPost {
  title: string
  description?: string
  date?: string
  category?: string
  wechat_url?: string
  url: string
}

export default createContentLoader('wechat/*.md', {
  excerpt: false,
  transform(raw): WechatPost[] {
    return raw
      .filter((item) => !item.url.endsWith('/wechat/'))
      .map((item) => ({
        title: item.frontmatter.title || item.url.split('/').pop() || '未命名文章',
        description: item.frontmatter.description || '',
        date: item.frontmatter.date || '',
        category: item.frontmatter.category || '',
        wechat_url: item.frontmatter.wechat_url || '',
        url: item.url
      }))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  }
})
