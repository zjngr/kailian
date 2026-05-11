<template>
  <div class="outer-container">
    <video autoplay muted loop playsinline class="video-background">
      <source src="/videos/健身房2.mp4" type="video/mp4">
    </video>
    <div class="video-overlay"></div>
    <div class="login-container">
      <div class="left-panel">
        <div class="logo">
          <div class="logo-icon">
            <i class="fas fa-heartbeat"></i>
          </div>
          <div class="logo-text">健康运动</div>
        </div>
        <h1 class="slogan">开启您的健康生活之旅</h1>
      </div>
      <div class="right-panel">
        <div class="form-container">
          <button class="btn btn-login pulse" @click="retuenOn()" style="width: 100px; margin-left: 300px ">返回主页</button>
          <div class="welcome-text">
            <h2 class="welcome-title">欢迎登录</h2>
            <p class="welcome-subtitle">请登录您的账户继续您的健康旅程</p>
          </div>

          <form @submit.prevent="login">
            <div class="form-group">
              <label for="phone">电话号码</label>
              <div class="input-with-icon">
                <i class="fas fa-phone"></i>
                <input
                    type="tel"
                    id="phone"
                    class="form-control"
                    placeholder="输入您的电话号码"
                    v-model="form.phone"
                    :class="{'has-error': errors.phone}"
                >
              </div>
              <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <div class="input-with-icon">
                <i class="fas fa-lock"></i>
                <input
                    type="password"
                    id="password"
                    class="form-control"
                    placeholder="输入您的密码"
                    v-model="form.password"
                >
              </div>
              <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            </div>

            <button type="submit" class="btn btn-login pulse">登录</button>
          </form>
        </div>

        <div class="signup-link">
          还没有账户? <router-link to="/register">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from "@/utils/request.js";

const form = ref({
  phone: '',
  password: '',
  remember: false
})

const errors = ref({
  phone: '',
  password: ''
})

const retuenOn=()=>{
  window.location="/"
}

const login=async()=>{
  request.post('/user/login',form.value).then(res=>{
    if (res.code === '200') {
      localStorage.setItem('token',res.data)
      checkToken()
      ElMessage.success("登录成功")
      setTimeout(()=>{
        location.href='/'
      },500)
    }else{
      ElMessage.error(res.msg);
    }
  })
}

const checkToken=async()=>{
  request.get('/user/currentUser', {
    headers: {
      'Authorization': localStorage.getItem('token')}}).then(res=>{
    if(res.code === '200'){
      localStorage.setItem('user',JSON.stringify(res.data))
    }
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@300;400;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.outer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 2;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 580px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.6s ease-out;
  position: relative;
  z-index: 3;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  color: white;
  padding: 40px 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: left center;
}

.left-panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>');
  background-size: 100% 100%;
  z-index: -1;
}

.left-panel:hover {
  transform: perspective(1000px) rotateY(-5deg) scale(1.02);
  box-shadow: 0 0 40px rgba(76, 175, 80, 0.5);
}

.left-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  transition: none;
  z-index: 2;
}

.left-panel:hover::after {
  animation: flash 1.5s ease-out;
}

@keyframes flash {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 80px;
  margin-top: 0;
  position: relative;
  z-index: 10;
}

.logo-icon {
  font-size: 32px;
  margin-right: 12px;
  background: rgba(255, 255, 255, 0.2);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
}

.left-panel:hover .logo-icon {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.5s ease;
}

.left-panel:hover .logo-text {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.slogan {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-top: 120px;
  white-space: nowrap;
  position: relative;
  z-index: 10;
  transition: all 0.5s ease;
}

.left-panel:hover .slogan {
  transform: translateY(-5px);
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
}

.right-panel {
  flex: 1;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.form-container {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.welcome-text {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 15px;
  color: #888;
  font-size: 16px;
}

.form-control {
  width: 100%;
  padding: 12px 12px 12px 45px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
  background: white;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.has-error {
  border-color: #f44336 !important;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-login {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  color: white;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.signup-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.signup-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
}

.signup-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    max-width: 90%;
  }

  .left-panel {
    padding: 30px 20px;
    min-height: auto;
  }

  .slogan {
    font-size: 24px;
    margin-top: 30px;
  }

  .logo {
    margin-bottom: 30px;
  }

  .right-panel {
    padding: 30px 20px;
  }
}
</style>

<!--
<template>
  <div class="outer-container">
    &lt;!&ndash; 粒子画布开始·&ndash;&gt;
    <canvas id="particles-canvas"></canvas>
    &lt;!&ndash; 粒子画布结束&ndash;&gt;
    &lt;!&ndash;中部数据开始&ndash;&gt;
    <div class="login-container">
      &lt;!&ndash;左布局开始&ndash;&gt;
      <div class="left-panel">
        <div class="logo">
          <div class="logo-icon">
            <i class="fas fa-heartbeat"></i>
          </div>
          <div class="logo-text">健康运动</div>
        </div>
        <h1 class="slogan">开启您的健康生活之旅</h1>
      </div>
      &lt;!&ndash;左布局结束&ndash;&gt;

      &lt;!&ndash;右布局开始&ndash;&gt;
      <div class="right-panel">
        <div class="form-container">
          <button class="btn btn-login pulse" @click="retuenOn()" style="width: 100px; margin-left: 300px ">返回主页</button>
          <div class="welcome-text">
            <h2 class="welcome-title">欢迎登录</h2>
            <p class="welcome-subtitle">请登录您的账户继续您的健康旅程</p>
          </div>

          <form @submit.prevent="login">
            <div class="form-group">
              <label for="phone">电话号码</label>
              <div class="input-with-icon">
                <i class="fas fa-phone"></i>
                <input
                    type="tel"
                    id="phone"
                    class="form-control"
                    placeholder="输入您的电话号码"
                    v-model="form.phone"
                    :class="{'has-error': errors.phone}"
                >
              </div>
              <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <div class="input-with-icon">
                <i class="fas fa-lock"></i>
                <input
                    type="password"
                    id="password"
                    class="form-control"
                    placeholder="输入您的密码"
                    v-model="form.password"

                >
              </div>
              <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            </div>

            <button type="submit" class="btn btn-login pulse">登录</button>
          </form>
        </div>

        <div class="signup-link">
          还没有账户? <router-link to="/register">立即注册</router-link>
        </div>
      </div>
      &lt;!&ndash;右布局结束&ndash;&gt;
    </div>
    &lt;!&ndash;中部数据结束&ndash;&gt;
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import request from "@/utils/request.js";

// 表单数据
const form = ref({
  phone: '',
  password: '',
  remember: false
})

// 错误信息
const errors = ref({
  phone: '',
  password: ''
})

// 粒子动画相关
const animationId = ref(null)
const particles = ref([])

//返回首页
const retuenOn=()=>{
  window.location="/"
}

// 表单提交
const login=async()=>{
  request.post('/user/login',form.value).then(res=>{
    if (res.code === '200') {//登录成功
      //存储token信息
      localStorage.setItem('token',res.data)
      //发起token
      //解析token获取用户信息请求
      checkToken()
      ElMessage.success("登录成功")
      setTimeout(()=>{
        location.href='/'
      },500)
    }else{
      ElMessage.error(res.msg);
    }
  })
}
//解析token获取用户信息请求
const checkToken=async()=>{
  request.get('/user/currentUser', {
    headers: {
      'Authorization': localStorage.getItem('token')}}).then(res=>{
    if(res.code === '200'){
      //存储后台返回的数据
      localStorage.setItem('user',JSON.stringify(res.data))
    }
  })
}



// 粒子动画方法
const initParticles = () => {
  const canvas = document.getElementById('particles-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 创建粒子
  createParticles()

  // 动画循环
  animateParticles(ctx, canvas)

  // 窗口大小调整
  window.addEventListener('resize', handleResize)
}

const createParticles = () => {
  particles.value = []
  // 增加粒子数量
  const particleCount = Math.min(window.innerWidth * 0.15, 150)

  for (let i = 0; i < particleCount; i++) {
    particles.value.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      // 增大粒子尺寸
      size: Math.random() * 5 + 2,
      speedX: Math.random() * 3 - 1.5,
      speedY: Math.random() * 3 - 1.5,
      color: `rgba(76, 175, 80, ${Math.random() * 0.5 + 0.2})`
    })
  }
}

const animateParticles = (ctx, canvas) => {
  const animate = () => {
    updateParticles(canvas)
    drawParticles(ctx)
    animationId.value = requestAnimationFrame(animate)
  }

  animate()
}

const updateParticles = (canvas) => {
  for (let i = 0; i < particles.value.length; i++) {
    const p = particles.value[i]

    p.x += p.speedX
    p.y += p.speedY

    // 边界检查
    if (p.x > canvas.width) p.x = 0
    if (p.x < 0) p.x = canvas.width
    if (p.y > canvas.height) p.y = 0
    if (p.y < 0) p.y = canvas.height
  }
}

const drawParticles = (ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  for (let i = 0; i < particles.value.length; i++) {
    const p = particles.value[i]

    // 添加发光效果
    ctx.shadowBlur = 10
    ctx.shadowColor = p.color

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.fill()

    // 重置阴影效果
    ctx.shadowBlur = 0

    // 连线
    for (let j = i + 1; j < particles.value.length; j++) {
      const p2 = particles.value[j]
      const dx = p.x - p2.x
      const dy = p.y - p2.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(76, 175, 80, ${0.2 * (1 - distance/100)})`
        ctx.lineWidth = 0.8 // 增加连线宽度
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }
    }
  }
}

const handleResize = () => {
  const canvas = document.getElementById('particles-canvas')
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  createParticles()
}

// 生命周期钩子
onMounted(() => {
  window.scrollTo(0,0)
  initParticles()
})

onBeforeUnmount(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@300;400;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

/* 粒子画布样式 */
#particles-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Noto Serif SC', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow-x: hidden;
}

.outer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 1;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 580px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.6s ease-out;
  position: relative;
  z-index: 2;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  color: white;
  padding: 40px 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: left center;
}

.left-panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
   width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>');
  background-size: 100% 100%;
  z-index: -1;
}

/* 炫酷悬停效果 */
.left-panel:hover {
  transform: perspective(1000px) rotateY(-5deg) scale(1.02);
  box-shadow: 0 0 40px rgba(76, 175, 80, 0.5);
}

.left-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  transition: none;
  z-index: 2;
}

.left-panel:hover::after {
  animation: flash 1.5s ease-out;
}

@keyframes flash {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 80px;
  margin-top: 0;
  position: relative;
  z-index: 10;
}

.logo-icon {
  font-size: 32px;
  margin-right: 12px;
  background: rgba(255, 255, 255, 0.2);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
   justify-content: center;
  transition: all 0.5s ease;
}

.left-panel:hover .logo-icon {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.5s ease;
}

.left-panel:hover .logo-text {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.slogan {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-top: 120px;
  white-space: nowrap;
  position: relative;
  z-index: 10;
  transition: all 0.5s ease;
}

.left-panel:hover .slogan {
  transform: translateY(-5px);
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
}

.right-panel {
  flex: 1;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  background: #fff;
  position: relative;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome-text {
  margin-bottom: 40px;
  margin-top: 10px;
  text-align: center;
}

.welcome-title {
  font-size: 42px;
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 12px;
  font-weight: 800;
  letter-spacing: -1px;
  font-family: 'Noto Serif SC', serif;
  position: relative;
  display: inline-block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.welcome-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.welcome-subtitle {
  color: #5a6e77;
  font-size: 18px;
  letter-spacing: 0.5px;
  font-weight: 500;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 25px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
  letter-spacing: 0.3px;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  font-size: 18px;
}

.form-control {
  width: 100%;
  padding: 15px 15px 15px 50px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  color: #34495e;
  letter-spacing: 0.3px;
}

.form-control:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
}

.has-error {
  border-color: #e74c3c;
}

.has-error:focus {
  box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.2);
}

.error-message {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 8px;
   font-weight: 500;
  letter-spacing: 0.2px;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #4CAF50;
  cursor: pointer;
}

.remember-me label {
  color: #34495e;
  cursor: pointer;
  font-weight: 500;
}

.forgot-password {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  letter-spacing: 0.2px;
}

.forgot-password:hover {
  text-decoration: underline;
  color: #388E3C;
}

.btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.btn-login {
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-login:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.signup-link {
  text-align: center;
  font-size: 15px;
  color: #7f8c8d;
  letter-spacing: 0.2px;
  margin-top: auto;
  padding-top: 20px;
}

.signup-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  transition: all 0.2s;
}

.signup-link a:hover {
  text-decoration: underline;
  color: #388E3C;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    height: auto;
  }

  .left-panel, .right-panel {
    padding: 30px;
  }

  .slogan {
    font-size: 28px;
    margin-top: 30px;
  }
}

@media (max-width: 480px) {
  .login-container {
    border-radius: 15px;
  }

  .left-panel, .right-panel {
    padding: 20px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }

  .logo-text {
    font-size: 24px;
  }

  .slogan {
    font-size: 24px;
    margin-top: 20px;
  }

  .welcome-title {
    font-size: 32px;
  }
}
</style>-->
