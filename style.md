组合式函数  Composables
  利用Vue的组合式Api来封装和复用 有状态逻辑的函数


钩子函数

  onMounted 组件实例后被成功挂在后调用
     在Vue 2的组件中，mounted钩子用于执行那些需要在组件实例挂载到DOM之后运行的代码，这通常包括DOM操作、数据请求等。



vue3

实例隔离



常用特性 

Componsition API

函数式编程 
```js



疑问？？？？？
Q: createApp  mount  挂载多个值 整体是否互通 
有什么弊端 
A: 就是正常挂载 视频是为了让观众看清楚


课后作业  
实现一个弹框 用于不同场景 
<script>


<script />
```



# Vue3 新特性

## Vue3 Vue2 响应式原理区别

Object.defineProperty

```js
const initData = {
  value:1
}
const data = {}
Object.keys(initData).forEach(key => {
  Object.defineProperty(data,key,{
    get() {
      console.log('访问', key)
      return initData[key]
    }
    set(v) {
      console.log('修改'，key)
      initData[key] = v
    }
  })
})
## 将initData对象的值赋值给data,当initData对象的值发生改变时，没有触发data的改变，需要手动触发
Vue.set(target,key,value)
set的实现原理

1.对target做判断 null undefined boolean number，target是基本类型会报错
2.数组： splice Array.prototype.slice 相当于手动触发一次响应式更新
3.对象：
 1.key 是否存在 target[key] = value
 2.vue2 依赖收集触发defindeReactive

```

Proxy

```js
const proxy = new proxy(target, handler)

const initdata = {
  value: 1,
}
const proxy = new Proxy(initdata, {
  get: function (target, key, receiver) {
    // Reflect做拦截操作
    console.log('访问', key)
    return Reflect.get(target, key, receiver)
  },
  set: function (target, key, value, receiver) {
    console.log('修改', key)
    Reflect.set(target, key, value, receiver)
  },
})
```

## Vue3

pnpm create vite-app demo
pnpm install

<!-- 入口文件 -->

vue2 是单例模式
new Vue({})
this.xxx

createApp(App).mount('#app)

Vue3 支持多实例，有实例隔离

vue2 mixin 冲突命名

## composition API

hooks 函数式编程范式
setup 类似 vue2 中的 created 或者 beforeCreated 之前执行的
vue3 没有 beforeCreate created 钩子函数，都是用 setup

data metheds watch 都在 setup 中实现

reactive 是通过 proxy 实现的,是一个函数,递归响应式创建

shallowReactive 只针对最上层的对象做响应式创建

ref 根据当前传的值，创建响应式对象。在 setup 中可以通过.value 的方式来获取
toRef

readonly shallowReadonly isReadonly

## 生命周期

vue2: beforeCreate created beforeMount mounted updated

vue3: setup onBeforeMout onMounted

### 新 API renderTracked VDOM 虚拟 DOM 重新渲染时调用的

beforeMount 后面 mounted 前面执行

### renderTriggered 当 DOM 重新被渲染触发的，做了什么事情导致视图更新的时候触发的

在 beforeUpdate 前执行

组件销毁： beforeUnmount unmounted

监听报错
errorCaptured() {
// handle error
return false
}

定义全局变量

## 全局配置

### vue2

Vue.prototype.$api
Vue.prototype.$bus = new Vue()
Vue.mixin

### vue3 全局配置

// 全局变量使用
// const app = createApp(App).mount('#app')
// app.config.gloablProperties.\$http ={

// }
// 在实例页面










