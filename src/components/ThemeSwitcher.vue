<template>
  <div class="theme-switcher">
    <select v-model="currentTheme" @change="onThemeChange" class="theme-select">
      <option value="dark">🌙 深色主题</option>
      <option value="light">☀️ 浅色主题</option>
      <option value="dynamic">✨ 光效主题</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'global-theme'
const currentTheme = ref('dark')

const setTheme = (theme: string) => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY, theme)
}

const onThemeChange = () => {
  setTheme(currentTheme.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'dark'
  currentTheme.value = savedTheme
  setTheme(savedTheme)
})
</script>

<style scoped>
.theme-switcher {
  display: inline-block;
}

.theme-select {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.theme-select:hover {
  background: var(--accent-color);
  color: white;
}
</style>