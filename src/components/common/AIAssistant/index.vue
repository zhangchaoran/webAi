<template>
  <div class="chat-container">
    <!-- 头部 -->
    <div class="chat-header">
      <h1>{{ title }}</h1>
      <button @click="clearChat" class="clear-btn" title="清空对话">
        🗑️ 清空
      </button>
    </div>

    <!-- 消息列表区域（滚动） -->
    <div class="messages-area" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>开始对话吧！</p>
        <span>输入问题，AI 会为你解答</span>
      </div>

      <!-- 消息列表 -->
      <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
        <div class="message-avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="message-content">
          <div class="message-text" v-html="renderMarkdown(msg.content)"></div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- 流式输出中的消息 -->
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

    <!-- 底部输入区域 -->
    <div class="input-area">
      <textarea 
        v-model="userInput" 
        @keydown.enter.prevent="handleSend"
        placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
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
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useAIChat } from './useAIChat'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'AI 助手'
})

// 自定义 renderer（给链接添加 target="_blank"）
const renderer = new marked.Renderer()
renderer.link = (href, title, text) => {
  return `<a href="${href}" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`
}

// 配置 marked
marked.setOptions({
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

// 使用 composable
const { 
  userInput, 
  loading, 
  errorMsg, 
  messages,           // 新增：消息历史
  streamingContent,   // 新增：流式内容
  sendMessageStream, 
  clearChat 
} = useAIChat()

// DOM 引用
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch([messages, streamingContent, loading], () => {
  scrollToBottom()
})

// 自动调整 textarea 高度
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

// 发送消息
const handleSend = async () => {
  if (!userInput.value.trim() || loading.value) return
  await sendMessageStream()
  autoResizeTextarea()
}

// 初始化后滚动到底部
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 900px;
  margin: 0 auto;
  background: #1e1e2e;
  color: #cdd6f4;
}

/* 头部 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #313244;
  border-bottom: 1px solid #45475a;
  flex-shrink: 0;
}

.chat-header h1 {
  margin: 0;
  font-size: 1.25rem;
}

.clear-btn {
  background: #f38ba8;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1e1e2e;
}

/* 消息区域 */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c7086;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
  font-size: 18px;
}

.empty-state span {
  font-size: 14px;
}

/* 消息气泡 */
.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #313244;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message.user .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 10px 14px;
  border-radius: 18px;
  background: #313244;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-text {
  background: #89b4fa;
  color: #1e1e2e;
}

.message-text.streaming {
  border-left: 3px solid #89b4fa;
}

.message-time {
  font-size: 11px;
  color: #6c7086;
  margin-top: 4px;
  padding: 0 8px;
}

/* Markdown 样式 */
.message-text :deep(pre) {
  background: #1e1e2e;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-text :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
}

.message-text :deep(p) {
  margin: 0 0 8px 0;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(ul), 
.message-text :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: #313244;
  border-radius: 20px;
  width: fit-content;
  margin-top: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #89b4fa;
  animation: bounce 1.4s infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

/* 输入区域 */
.input-area {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #313244;
  border-top: 1px solid #45475a;
  flex-shrink: 0;
}

.input-area textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #45475a;
  border-radius: 24px;
  background: #1e1e2e;
  color: #cdd6f4;
  font-family: inherit;
  font-size: 14px;
  resize: none;
  outline: none;
  transition: border 0.2s;
}

.input-area textarea:focus {
  border-color: #89b4fa;
}

.input-area textarea:disabled {
  opacity: 0.5;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #89b4fa;
  border: none;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}

.send-btn:active {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>