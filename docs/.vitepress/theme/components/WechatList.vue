<script setup lang="ts">
import { data as posts } from '../wechat.data'
</script>

<template>
  <div class="wechat-list">
    <article v-for="post in posts" :key="post.url" class="wechat-card">
      <div class="wechat-meta">
        <span v-if="post.date">{{ post.date }}</span>
        <span v-if="post.category">{{ post.category }}</span>
      </div>
      <h2>
        <a :href="post.url">{{ post.title }}</a>
      </h2>
      <p v-if="post.description">{{ post.description }}</p>
      <div class="wechat-actions">
        <a :href="post.url">阅读网站版</a>
        <a v-if="post.wechat_url" :href="post.wechat_url" target="_blank" rel="noopener">微信原文</a>
      </div>
    </article>
  </div>
</template>

<style scoped>
.wechat-list {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.wechat-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 18px 20px;
  background: var(--vp-c-bg-soft);
}

.wechat-card h2 {
  margin: 8px 0;
  border-top: 0;
  padding-top: 0;
  font-size: 20px;
}

.wechat-card p {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
}

.wechat-meta {
  display: flex;
  gap: 10px;
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.wechat-actions {
  display: flex;
  gap: 12px;
  margin-top: 14px;
  font-size: 14px;
}
</style>
