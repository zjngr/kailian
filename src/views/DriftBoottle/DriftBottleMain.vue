<template>
  <div class="drift-bottle-app">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <img src="../../assets/icons/icon_app_logo.svg" alt="运动漂流瓶" class="app-logo" />
        <h1 class="app-title">运动漂流瓶</h1>
      </div>

    </header>
    <div class="main-container">
      <!-- 左侧功能操作区 -->
      <aside class="left-sidebar">
        <div class="action-buttons">
          <button class="action-btn" :class="{ 'drift-btn': activeButton === 'drift-bottle' }"
            @click="setActiveButton('drift-bottle'); router.push('/driftBottleMain')">
            <img src="../../assets/icons/icon_fish_bottle.svg" alt="漂流瓶" class="btn-icon" />
            <span>漂流瓶</span>
          </button>

          <button class="action-btn" :class="{ 'drift-btn': activeButton === 'inbox' }"
            @click="setActiveButton('inbox'); router.push('/driftBottleMain/receivedBottles')">
            <img src="../../assets/icons/icon_inbox.svg" alt="收到的瓶子" class="btn-icon" />
            <span>收到的瓶子</span>
          </button>

          <button class="action-btn" :class="{ 'drift-btn': activeButton === 'sent' }"
            @click="setActiveButton('sent'); router.push('/driftBottleMain/driftBottleHistory')">
            <img src="../../assets/icons/icon_sent.svg" alt="发出的瓶子" class="btn-icon" />
            <span>发出的瓶子</span>
          </button>
        </div>
      </aside>

      <!-- 中间内容展示区 -->
      <main class="main-content">
        <!-- 子路由内容 -->
        <router-view />
      </main>

      <!-- 右侧信息统计与热门标签区 -->
      <aside class="right-sidebar">
        <div class="my-data">
          <div class="section-title">
            <img src="../../assets/icons/icon_chart.svg" alt="我的数据" class="section-icon" />
            <h2>我的数据</h2>
          </div>
          <div class="data-list">
            <div class="data-item">
              <img src="../../assets/icons/icon_sent_small.svg" alt="扔出瓶子" class="data-icon" />
              <span>扔出瓶子 {{throwlength}}</span>
            </div>
            <div class="data-item">
              <img src="../../assets/icons/icon_fish_bottle_small.svg" alt="捞到瓶子" class="data-icon" />
              <span>捞到瓶子 {{receivelength}}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted,reactive} from 'vue'
import { useRouter} from 'vue-router'
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

//路由跳转
const router = useRouter()


//获取用户信息
const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
});


// 当前激活的按钮
const activeButton = ref('drift-bottle')

//用户扔出瓶子的个数
const throwlength=ref();

//用户捞到瓶子的个数
const receivelength=ref();

// 设置激活的按钮
const setActiveButton = (buttonName) => {
  activeButton.value = buttonName
}

// 生命周期
onMounted(() => {
  window.scrollTo(0,0)
  request.get(`bottle/selectBySid/${data.user.id}`).then((res)=>{
    if (res.code === "200"){
      throwlength.value=res.data.length;
    }else{
      ElMessage.error(res.msg)
    }
  })
  request.get(`bottle/selectBottleListBySid/${data.user.id}`).then((res)=>{
    if (res.code === "200"){
      receivelength.value=res.data.length;
    }else{
      ElMessage.error(res.msg)
    }
  })

})
</script>

<style scoped>
.drift-bottle-app {
  min-height: 100vmin;
  box-sizing: border-box;
  background: linear-gradient(135deg, #2ECC71 0%, #27AE60 25%, #16A085 50%, #1ABC9C 75%, #2ECC71 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  position: relative;
  overflow: hidden;
}

/* 顶部导航栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;

}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo {
  width: 18px;
  height: 18px;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}
.header-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 主容器 */
.main-container {
  display: flex;
  min-height: calc(100vh - 73px);
  position: relative;
  z-index: 10;
}

/* 左侧边栏 */
.left-sidebar {
  width: 220px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;
}

.drift-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #2ECC71;
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  padding: 16px 24px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.drift-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #27AE60;
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* 主内容区 */
.main-content {
  position: relative;
  flex: 1;
  min-height: calc(100vh - 73px);
  padding: 20px;
  overflow-y: auto;
}


/* 右侧边栏 */
.right-sidebar {
  width: 260px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  width: 18px;
  height: 18px;
}

.section-title h2 {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.data-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
}

.data-icon {
  width: 16px;
  height: 16px;
}

.hot-tags .section-title h2 {
  color: white;
}
</style>