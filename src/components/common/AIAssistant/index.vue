<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>{{ title }}</h1>
      <button @click="clearChat" class="clear-btn" title="清空对话">🗑️ 清空</button>
    </div>

    <div class="messages-area" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>开始对话吧！</p>
        <span>输入问题，AI 会为你解答，也可以要求修改图表数据</span>
      </div>

      <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
        <div class="message-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
        <div class="message-content">
          <div class="message-text" v-html="renderMarkdown(msg.content)"></div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <div v-if="loading && streamingContent" class="message assistant">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="message-text streaming" v-html="renderMarkdown(streamingContent)"></div>
          <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <textarea v-model="userInput" @keydown.enter.prevent="handleSend" placeholder="例如：把周一的销售额改成 180 万" rows="1" :disabled="loading" ref="textareaRef"></textarea>
      <button @click="handleSend" :disabled="loading || !userInput.trim()" class="send-btn">{{ loading ? '⏳' : '📤' }}</button>
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
  chartData?: {
    barData: any
    lineBarData: any
    pieData: any
    funnelData: any
    buildDataContext: () => string
    resetAllData: () => void
  }
}

const props = withDefaults(defineProps<Props>(), { title: 'AI 助手' })

const renderer = new marked.Renderer()
renderer.link = (href, title, text) => `<a href="${href}" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`

marked.setOptions({
  renderer,
  highlight: (code, lang) => lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value,
  breaks: true,
  gfm: true
})

const renderMarkdown = (content: string) => content ? marked.parse(content) : ''
const formatTime = (timestamp?: number) => timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

const { userInput, loading, messages, streamingContent, sendMessageStream, clearChat } = useAIChat(props.chartData)

const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const scrollToBottom = () => nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight })
watch([messages, streamingContent, loading], () => scrollToBottom())

const autoResizeTextarea = () => nextTick(() => { if (textareaRef.value) { textareaRef.value.style.height = 'auto'; textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px' } })
watch(userInput, () => autoResizeTextarea())

const handleSend = async () => { if (!userInput.value.trim() || loading.value) return; await sendMessageStream(); autoResizeTextarea() }
onMounted(() => scrollToBottom())
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.chat-header h1 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.clear-btn {
  background: var(--danger-color);
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: white;
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
  color: var(--text-secondary);
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
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--text-primary);
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
  background: var(--message-assistant-bg);
  color: var(--message-assistant-text);
  line-height: 1.4;
  word-wrap: break-word;
  font-size: 13px;
}

.message.user .message-text {
  background: var(--message-user-bg);
  color: var(--message-user-text);
}

.message-text.streaming {
  border-left: 3px solid var(--accent-color);
}

.message-time {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 2px;
  padding: 0 8px;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  margin: 4px 0;
  padding-left: 20px;
  list-style-position: outside;
}

.message-text :deep(li) {
  margin: 2px 0;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: normal;
}

.message-text :deep(li p) {
  margin: 0;
  display: inline;
}

.message-text :deep(ul ul),
.message-text :deep(ol ul),
.message-text :deep(ul ol),
.message-text :deep(ol ol) {
  margin: 2px 0;
  padding-left: 20px;
}

.message-text {
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}

.message-text :deep(pre) {
  background: var(--bg-primary);
  padding: 8px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 4px 0;
}

.message-text :deep(code) {
  font-family: monospace;
  font-size: 11px;
  color: var(--text-primary);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 6px 10px;
  background: var(--bg-card);
  border-radius: 16px;
  width: fit-content;
  margin-top: 4px;
}

.typing-indicator span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent-color);
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
  background: var(--bg-header);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.input-area textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  resize: none;
  outline: none;
}

.input-area textarea:focus {
  border-color: var(--accent-color);
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-color);
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: white;
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