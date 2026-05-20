<template>
  <div class="chat-container">
    <!-- 头部 -->
    <div class="chat-header">
      <h1>{{ title }}</h1>
      <button @click="clearChat" class="clear-btn" title="清空对话">
        🗑️ 清空
      </button>
    </div>

    <!-- 消息列表区域 -->
    <div class="messages-area" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>开始对话吧！</p>
        <span>输入问题，AI 会为你解答，也可以要求修改图表数据</span>
      </div>

      <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
        <div class="message-avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="message-content">
          <div class="message-text" v-html="renderMarkdown(msg.content)"></div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <div v-if="loading && streamingContent" class="message assistant">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="message-text streaming" v-html="renderMarkdown(streamingContent)"></div>
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <textarea 
        v-model="userInput" 
        @keydown.enter.prevent="handleSend"
        placeholder="例如：把周一的销售额改成 180 万"
        rows="1"
        :disabled="loading"
        ref="textareaRef"
      ></textarea>
      <button @click="handleSend" :disabled="loading || !userInput.trim()" class="send-btn">
        {{ loading ? '⏳' : '📤' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useAIChat } from './useAIChat'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface Props {
  title?: string
  // 接收图表数据（从父组件传入）
  chartData?: {
    barData: any
    lineBarData: any
    pieData: any
    funnelData: any
    buildDataContext: () => string
    resetAllData: () => void
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: 'AI 助手'
})

// 配置 marked
const renderer = new marked.Renderer()
renderer.link = (href, title, text) => {
  return `<a href="${href}" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`
}

marked.setOptions({
  renderer,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

const renderMarkdown = (content: string) => {
  if (!content) return ''
  return marked.parse(content)
}

const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 使用 composable，传入图表数据
const { 
  userInput, 
  loading, 
  messages, 
  streamingContent, 
  sendMessageStream, 
  clearChat 
} = useAIChat(props.chartData)

const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch([messages, streamingContent, loading], () => {
  scrollToBottom()
})

const autoResizeTextarea = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
    }
  })
}

watch(userInput, () => {
  autoResizeTextarea()
})

const handleSend = async () => {
  if (!userInput.value.trim() || loading.value) return
  await sendMessageStream()
  autoResizeTextarea()
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
/* 你的原有样式保持不变 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e2e;
  color: #cdd6f4;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #313244;
  border-bottom: 1px solid #45475a;
  flex-shrink: 0;
}

.chat-header h1 {
  margin: 0;
  font-size: 1rem;
}

.clear-btn {
  background: #f38ba8;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #1e1e2e;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c7086;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.message {
  display: flex;
  gap: 8px;
  animation: fadeIn 0.3s ease;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #313244;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}

.message-content {
  max-width: 75%;
  display: flex;
  flex-direction: column;
}

.message.user .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 8px 12px;
  border-radius: 16px;
  background: #313244;
  line-height: 1.4;
  word-wrap: break-word;
  font-size: 13px;
}

.message.user .message-text {
  background: #89b4fa;
  color: #1e1e2e;
}

.message-text.streaming {
  border-left: 3px solid #89b4fa;
}

.message-time {
  font-size: 10px;
  color: #6c7086;
  margin-top: 2px;
  padding: 0 8px;
}
/* 修复列表样式 - 添加这些 */
.message-text :deep(ul),
.message-text :deep(ol) {
  margin: 4px 0;
  padding-left: 20px;  /* 增加左内边距，让列表缩进 */
  list-style-position: outside;  /* 标记在外面，保证对齐 */
}

.message-text :deep(li) {
  margin: 2px 0;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: normal;
}

/* 确保列表项内容不超出边框 */
.message-text :deep(li p) {
  margin: 0;
  display: inline;
}

/* 嵌套列表 */
.message-text :deep(ul ul),
.message-text :deep(ol ul),
.message-text :deep(ul ol),
.message-text :deep(ol ol) {
  margin: 2px 0;
  padding-left: 20px;
}

/* 强制所有内容换行，防止溢出 */
.message-text {
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}
.message-text :deep(pre) {
  background: #1e1e2e;
  padding: 8px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 4px 0;
}

.message-text :deep(code) {
  font-family: monospace;
  font-size: 11px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 6px 10px;
  background: #313244;
  border-radius: 16px;
  width: fit-content;
  margin-top: 4px;
}

.typing-indicator span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #89b4fa;
  animation: bounce 1.4s infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: #313244;
  border-top: 1px solid #45475a;
  flex-shrink: 0;
}

.input-area textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #45475a;
  border-radius: 20px;
  background: #1e1e2e;
  color: #cdd6f4;
  font-family: inherit;
  font-size: 13px;
  resize: none;
  outline: none;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #89b4fa;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>