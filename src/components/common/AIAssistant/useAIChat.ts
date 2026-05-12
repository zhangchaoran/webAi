import { ref } from 'vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function useAIChat() {
  const userInput = ref('')
  const loading = ref(false)
  const errorMsg = ref('')
  const streamingContent = ref('')
  
  // 消息历史（核心新增）
  const messages = ref<Message[]>([])
  
  const API_KEY = import.meta.env.VITE_AI_API_KEY
  const DEEPSEEK_API = 'https://api.siliconflow.cn/v1/chat/completions'

  const sendMessageStream = async (): Promise<void> => {
    const trimmedInput = userInput.value.trim()
    if (!trimmedInput || loading.value) return
    
    // 添加用户消息到历史
    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now()
    }
    messages.value.push(userMessage)
    
    // 清空输入框
    userInput.value = ''
    loading.value = true
    streamingContent.value = ''
    errorMsg.value = ''
    
    // 准备历史上下文（供 AI 理解对话）
    const apiMessages = messages.value.map(m => ({
      role: m.role,
      content: m.content
    }))
    
    try {
      const res = await fetch(DEEPSEEK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3',
          messages: apiMessages,  // 发送完整历史
          stream: true,
          temperature: 0.7,
          max_tokens: 2000
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error?.message || `HTTP ${res.status}`)
      }
      
      const reader = res.body?.getReader()
      if (!reader) throw new Error('无法读取响应流')
      
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue
          
          if (trimmedLine.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmedLine.slice(6))
              const content = json.choices[0]?.delta?.content || ''
              if (content) {
                fullContent += content
                streamingContent.value = fullContent
              }
            } catch (e) {
              console.warn('解析失败:', trimmedLine)
            }
          }
        }
      }
      
      // 流式结束后，保存 AI 消息到历史
      if (fullContent) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullContent,
          timestamp: Date.now()
        }
        messages.value.push(assistantMessage)
      }
      setTimeout(() => {
        streamingContent.value = ''
      }, 50)
      
    } catch (error: any) {
      console.error('请求失败:', error)
      errorMsg.value = error.message || '请求失败'
    } finally {
      loading.value = false
    }
  }
  

  const clearChat = (): void => {
    messages.value = []
    userInput.value = ''
    errorMsg.value = ''
    streamingContent.value = ''
  }
  
  return {
    userInput,
    loading,
    errorMsg,
    streamingContent,
    messages,        // 导出消息历史
    sendMessageStream,
    clearChat
  }
}