import { ref } from 'vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function useAIChat(chartData?: any) {
  const userInput = ref('')
  const loading = ref(false)
  const errorMsg = ref('')
  const streamingContent = ref('')
  const messages = ref<Message[]>([])
  
  const API_KEY = import.meta.env.VITE_AI_API_KEY
  const DEEPSEEK_API = 'https://api.siliconflow.cn/v1/chat/completions'

  // System Prompt
    
  const SYSTEM_PROMPT = `
  
  你是 **Gemini-Pro**，一个乐于助人、能力强大的通用 AI 助手。

  **你的核心原则：**
   **乐于提供帮助**：对于用户的任何问题，都要**主动尝试提供最直接、最有价值的信息或解决方案**。永远不要先说“我是一个AI，无法...”
  【图表数据】（仅供必要时参考）
  - 柱形图（bar）：周销售额
  - 柱线混合图（linebar）：月销量和增长率
  - 扇形图（pie）：商品销售占比
  - 漏斗图（funnel）：销售转化

  【操作图表的特殊格式】
  只有当用户明确要求修改数据时，才在回复末尾加上标记：
  [COMMAND]{"action": "updateBar", "category": "周一", "value": 180}[/COMMAND]

  可用的 action：
  - updateBar：修改柱形图，需要 category 和 value
  - updatePie：修改扇形图，需要 name 和 value
  - updateFunnel：修改漏斗图，需要 name 和 value
  - reset：重置所有数据

  【重要规则】
  1. 绝大多数情况下，正常回复用户即可，不要输出 [COMMAND]
  2. 只有用户明确说"改成"、"修改为"、"设置为"等修改指令时，才添加 [COMMAND]
  3. 用户问问题、聊天、写代码时，正常回复，不要用 JSON 格式
  4. 回复使用自然语言和 Markdown 格式
  `

  // 从内容中提取指令
  const extractCommands = (content: string): any[] => {
    const commands: any[] = []
    const regex = /\[COMMAND\](.*?)\[\/COMMAND\]/gs
    let match
    while ((match = regex.exec(content)) !== null) {
      try {
        const cmd = JSON.parse(match[1])
        commands.push(cmd)
      } catch (e) {
        console.warn('解析指令失败:', match[1])
      }
    }
    return commands
  }

  // 移除内容中的指令标记
  const removeCommandMarkers = (content: string): string => {
    return content.replace(/\[COMMAND\].*?\[\/COMMAND\]/gs, '').trim()
  }

  // 执行图表指令
  const executeCommands = (commands: any[]) => {
    if (!chartData) return false
    if (!Array.isArray(commands) || commands.length === 0) return false
    
    for (const cmd of commands) {
      switch (cmd.action) {
        case 'updateBar':
          const barIdx = chartData.barData.value.categories.indexOf(cmd.category)
          if (barIdx !== -1) chartData.barData.value.values[barIdx] = cmd.value
          break
        case 'updateLineBar':
          const lbIdx = chartData.lineBarData.value.categories.indexOf(cmd.category)
          if (lbIdx !== -1) {
            if (cmd.sales !== undefined) chartData.lineBarData.value.sales[lbIdx] = cmd.sales
            if (cmd.growth !== undefined) chartData.lineBarData.value.growth[lbIdx] = cmd.growth
          }
          break
        case 'updatePie':
          const pieItem = chartData.pieData.value.find((p: any) => p.name === cmd.name)
          if (pieItem) pieItem.value = cmd.value
          break
        case 'updateFunnel':
          const funnelItem = chartData.funnelData.value.find((f: any) => f.name === cmd.name)
          if (funnelItem) funnelItem.value = cmd.value
          break
        case 'reset':
          if (chartData.resetAllData) chartData.resetAllData()
          break
      }
    }
    return true
  }

  const sendMessageStream = async (): Promise<void> => {
    const trimmedInput = userInput.value.trim()
    if (!trimmedInput || loading.value) return
    
    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now()
    })
    
    userInput.value = ''
    loading.value = true
    streamingContent.value = ''
    errorMsg.value = ''
    
    // 构建数据上下文
    let dataContext = ''
    if (chartData && chartData.buildDataContext) {
      dataContext = chartData.buildDataContext()
    }
    
    // 准备 API 消息
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `当前数据：\n${dataContext}\n\n用户：${trimmedInput}` }
    ]
    
    try {
      const response = await fetch(DEEPSEEK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3',
          messages: apiMessages,
          stream: true,  // 保持流式
          temperature: 0.3
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
      }
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('无法读取响应流')
      
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      
      // 流式读取
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
      
      // 流式结束，处理完整内容
      const cleanContent = removeCommandMarkers(fullContent)
      const commands = extractCommands(fullContent)
      
      // 执行指令
      if (commands.length > 0) {
        executeCommands(commands)
      }
      
      // 保存 AI 消息
      messages.value.push({
        role: 'assistant',
        content: cleanContent,
        timestamp: Date.now()
      })
      
      streamingContent.value = ''
      
    } catch (error: any) {
      console.error('请求失败:', error)
      errorMsg.value = error.message || '请求失败'
      messages.value.push({
        role: 'assistant',
        content: `抱歉，请求失败：${error.message}`,
        timestamp: Date.now()
      })
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
    messages,
    sendMessageStream,
    clearChat
  }
}