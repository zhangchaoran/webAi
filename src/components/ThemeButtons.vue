<template>
  <div class="theme-buttons">
    <button 
      class="theme-btn" 
      :class="{ active: currentTheme === 'dark' }"
      @click="setTheme('dark')"
    >
      🌙 深色
    </button>
    <button 
      class="theme-btn" 
      :class="{ active: currentTheme === 'light' }"
      @click="setTheme('light')"
    >
      ☀️ 浅色
    </button>
    <button 
      class="theme-btn" 
      :class="{ active: currentTheme === 'dynamic' }"
      @click="setTheme('dynamic')"
    >
      ✨ 光效
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)

const setTheme = (theme: 'dark' | 'light' | 'dynamic') => {
  themeStore.setTheme(theme)
}
</script>

<style scoped>
.theme-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.theme-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.theme-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}
</style>