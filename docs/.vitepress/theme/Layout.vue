<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #layout-bottom>
      <a class="mxz-admin-link" href="/admin/" target="_blank" rel="noopener" title="内容管理后台">⚙</a>
    </template>
  </Layout>
</template>
