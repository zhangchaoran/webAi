// stores/theme.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeType = 'dark' | 'light' | 'dynamic'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeType>('dark')

  // 切换主题
  const setTheme = (theme: ThemeType) => {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('global-theme', theme)
    // 触发 ECharts 主题更新事件
    window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }))
  }

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('global-theme') as ThemeType | null
    if (savedTheme && ['dark', 'light', 'dynamic'].includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      setTheme('dark')
    }
  }

  return { currentTheme, setTheme, initTheme }
})