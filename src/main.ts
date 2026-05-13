import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'  /**
 * pinia 是vue的专属管理状态库 vuex的替代品
 *  优势 
 * 1 提供更加简洁的API 去掉了 mutation 
 * 2 提供符合组合式的api风格 和vue3新语法统一
 * 3 去掉了modules的概念 每一个store都是一个独立的个体
 * 4 搭配TS一起使用提供一个可靠的类型推断 
 */

import App from './App.vue'


import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(ElementPlus)

app.use(createPinia())
app.use(router)

// 将router挂载到全局属性，方便在组件外使用
app.config.globalProperties.$router = router

app.mount('#app') // 把vue的实例gua zai
