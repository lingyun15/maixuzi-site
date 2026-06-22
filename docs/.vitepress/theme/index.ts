import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import WechatList from './components/WechatList.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('WechatList', WechatList)
  }
}
