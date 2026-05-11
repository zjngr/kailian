<template>
  <div class="outer-container">
    <video autoplay muted loop playsinline class="video-background">
      <source src="/videos/健身房2.mp4" type="video/mp4">
    </video>
    <div class="video-overlay"></div>
    <div class="register-container">
      <div class="left-panel">
        <div class="logo">
          <div class="logo-icon">
            <i class="fas fa-heartbeat"></i>
          </div>
          <div class="logo-text">健康运动</div>
        </div>
        <h1 class="slogan">开启您的健康生活之旅</h1>
        <p class="subtext">加入我们，追踪您的运动数据，达成健康目标，与社区分享您的进步，让每一天都充满活力！</p>
        <div class="benefits">
          <div class="benefit-item">
            <i class="fas fa-chart-line"></i>
            <div class="benefit-content">
              <h3>数据追踪</h3>
              <p>记录每日运动数据，分析健康趋势</p>
            </div>
          </div>
          <div class="benefit-item">
            <i class="fas fa-trophy"></i>
            <div class="benefit-content">
              <h3>成就系统</h3>
              <p>完成挑战，解锁成就徽章</p>
            </div>
          </div>
          <div class="benefit-item">
            <i class="fas fa-users"></i>
            <div class="benefit-content">
              <h3>社区互动</h3>
              <p>与志同道合的运动爱好者交流</p>
            </div>
          </div>
        </div>
      </div>
      <div class="right-panel">
        <div class="welcome-text">
          <h2 class="welcome-title">创建账户</h2>
          <p class="welcome-subtitle">加入健康运动社区，开始您的健康旅程</p>
        </div>

        <form @submit.prevent="resgister">
          <div class="form-group">
            <label for="username">用户名</label>
            <div class="input-with-icon">
              <i class="fas fa-user"></i>
              <input
                  type="text"
                  id="username"
                  class="form-control"
                  placeholder="设置您的用户名"
                  v-model="form.username"
                  :class="{'has-error': errors.username}"
              >
            </div>
            <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
          </div>

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
                  placeholder="设置您的密码"
                  v-model="form.password"
                  :class="{'has-error': errors.password}"
              >
            </div>
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <div class="input-with-icon">
              <i class="fas fa-lock"></i>
              <input
                  type="password"
                  id="confirmPassword"
                  class="form-control"
                  placeholder="再次输入密码"
                  v-model="form.confirmPassword"
                  :class="{'has-error': errors.confirmPassword}"
              >
            </div>
            <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
          </div>

          <button type="submit" class="btn btn-register pulse">注册账户</button>
        </form>

        <div class="login-link">
          已有账户? <router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from "@/utils/request.js";

const form = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  let isValid = true
  if (!form.value.username) {
    errors.value.username = '设置您的用户名'
    isValid = false
  }
  if (!form.value.phone) {
    errors.value.phone = '输入您的电话号码'
    isValid = false
  }
  if (!form.value.password) {
    errors.value.password = '设置您的密码'
    isValid = false
  }
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = '再次输入密码'
    isValid = false
  }
  return isValid
}

const resgister=async()=>{
  const isValid = validateForm();
  if (!isValid) return
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword='两次密码输入不一致'
    errors.value.password='两次密码输入不一致'
    return
  }
  request.post('/user/register',form.value).then(res=>{
    if (res.code === '200') {
      ElMessage.success("注册成功")
      setTimeout(()=>{
        location.href='/login'
      },500)
    }else{
      ElMessage.error(res.msg);
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

.register-container {
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
  font-size: 40px;
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
  margin-bottom: 40px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
  white-space: nowrap;
  position: relative;
  z-index: 10;
  transition: all 0.5s ease;
}

.left-panel:hover .slogan {
  transform: translateY(-5px);
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
}

.subtext {
  font-size: 17px;
  line-height: 1.7;
  opacity: 0.92;
  max-width: 90%;
  font-weight: 300;
  letter-spacing: 0.3px;
  position: relative;
  z-index: 10;
  transition: all 0.5s ease;
}

.left-panel:hover .subtext {
  transform: translateY(5px);
  opacity: 1;
}

.benefits {
  margin-top: 30px;
  position: relative;
  z-index: 10;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  transition: all 0.5s ease;
}

.left-panel:hover .benefit-item {
  transform: translateX(10px);
}

.benefit-item i {
  font-size: 24px;
  background: rgba(255, 255, 255, 0.2);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  transition: all 0.5s ease;
}

.left-panel:hover .benefit-item i {
  transform: rotate(15deg);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

.benefit-content h3 {
  font-size: 18px;
  margin-bottom: 5px;
  font-weight: 600;
}

.benefit-content p {
  font-size: 14px;
  opacity: 0.9;
}

.right-panel {
  flex: 1;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  background: #fff;
  position: relative;
  z-index: 2;
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

.btn-register {
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-register:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.login-link {
  text-align: center;
  font-size: 15px;
  color: #7f8c8d;
  letter-spacing: 0.2px;
  margin-top: auto;
  padding-top: 20px;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  transition: all 0.2s;
}

.login-link a:hover {
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

@media (max-width: 900px) {
  .register-container {
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
  .register-container {
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
</style>

<!--
<template>
  <div class="outer-container">
    &lt;!&ndash; 粒子画布开始 &ndash;&gt;
    <canvas id="particles-canvas"></canvas>
    &lt;!&ndash; 粒子画布结束 &ndash;&gt;

    &lt;!&ndash; 中部布局开始 &ndash;&gt;
    <div class="register-container">
      &lt;!&ndash; 左布局开始 &ndash;&gt;
      <div class="left-panel">
        <div class="logo">
          <div class="logo-icon">
            <i class="fas fa-heartbeat"></i>
          </div>
          <div class="logo-text">健康运动</div>
        </div>
        <h1 class="slogan">开启您的健康生活之旅</h1>
        <p class="subtext">加入我们，追踪您的运动数据，达成健康目标，与社区分享您的进步，让每一天都充满活力！</p>
        <div class="benefits">
          <div class="benefit-item">
            <i class="fas fa-chart-line"></i>
            <div class="benefit-content">
              <h3>数据追踪</h3>
              <p>记录每日运动数据，分析健康趋势</p>
            </div>
          </div>
          <div class="benefit-item">
            <i class="fas fa-trophy"></i>
            <div class="benefit-content">
              <h3>成就系统</h3>
              <p>完成挑战，解锁成就徽章</p>
            </div>
          </div>
          <div class="benefit-item">
            <i class="fas fa-users"></i>
            <div class="benefit-content">
              <h3>社区互动</h3>
              <p>与志同道合的运动爱好者交流</p>
            </div>
          </div>
        </div>
      </div>
      &lt;!&ndash; 左布局结束 &ndash;&gt;

      &lt;!&ndash; 右布局开始 &ndash;&gt;
      <div class="right-panel">
        <div class="welcome-text">
          <h2 class="welcome-title">创建账户</h2>
          <p class="welcome-subtitle">加入健康运动社区，开始您的健康旅程</p>
        </div>

        <form @submit.prevent="resgister">
          <div class="form-group">
            <label for="username">用户名</label>
            <div class="input-with-icon">
              <i class="fas fa-user"></i>
              <input
                  type="text"
                  id="username"
                  class="form-control"
                  placeholder="设置您的用户名"
                  v-model="form.username"
                  :class="{'has-error': errors.username}"
              >
            </div>
            <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
          </div>

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
                  placeholder="设置您的密码"
                  v-model="form.password"
                  :class="{'has-error': errors.password}"
              >
            </div>
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <div class="input-with-icon">
              <i class="fas fa-lock"></i>
              <input
                  type="password"
                  id="confirmPassword"
                  class="form-control"
                  placeholder="再次输入密码"
                  v-model="form.confirmPassword"
                  :class="{'has-error': errors.confirmPassword}"
              >
            </div>
            <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
          </div>

          <button type="submit" class="btn btn-register pulse">注册账户</button>
        </form>

        <div class="login-link">
          已有账户? <router-link to="/login">立即登录</router-link>
        </div>
      </div>
      &lt;!&ndash; 右布局结束 &ndash;&gt;

    </div>
    &lt;!&ndash; 中部布局结束 &ndash;&gt;
  </div>
</template>

<script setup>
import { reactive, onMounted, onBeforeUnmount, ref } from 'vue'
import request from "@/utils/request.js";

// 表单数据
const form = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 错误信息
const errors = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 粒子动画相关
const animationId = ref(null)
const particles = ref([])

// 表单验证
const validateForm = () => {
  let isValid = true
  if (!form.value.username) {
    errors.value.username = '设置您的用户名'
    isValid = false
  }
  if (!form.value.phone) {
    errors.value.phone = '输入您的电话号码'
    isValid = false
  }
  if (!form.value.password) {
    errors.value.password = '设置您的密码'
    isValid = false
  }
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = '再次输入密码'
    isValid = false
  }
  return isValid
}

// 表单提交
//判断注册逻辑
const resgister=async()=>{
  //判断数据是否都填写完毕
  const isValid = validateForm();
  if (!isValid) return
  //判断两次密码输入是否一致
  if (form.value.password !== form.value. confirmPassword) {
    errors.value. confirmPassword='两次密码输入不一致'
    errors.value.password='两次密码输入不一致'
    return
  }
  request.post('/user/register',form.value).then(res=>{
    if (res.code === '200') {//注册成功
      ElMessage.success("注册成功")
      setTimeout(()=>{
        location.href='/login'
      },500)
    }else{
      ElMessage.error(res.msg);
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

.register-container {
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
  font-size: 40px;
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
  margin-bottom: 40px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
  white-space: nowrap;
  position: relative;
  z-index: 10;
  transition: all 0.5s ease;
}

.left-panel:hover .slogan {
  transform: translateY(-5px);
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
}

.subtext {
  font-size: 17px;
  line-height: 1.7;
  opacity: 0.92;
  max-width: 90%;
  font-weight: 300;
  letter-spacing: 0.3px;
  position: relative;
  z-index: 10;
  transition: all 0.5s ease;
}

.left-panel:hover .subtext {
  transform: translateY(5px);
  opacity: 1;
}

.benefits {
  margin-top: 30px;
  position: relative;
  z-index: 10;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  transition: all 0.5s ease;
}

.left-panel:hover .benefit-item {
  transform: translateX(10px);
}

.benefit-item i {
  font-size: 24px;
  background: rgba(255, 255, 255, 0.2);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  transition: all 0.5s ease;
}

.left-panel:hover .benefit-item i {
  transform: rotate(15deg);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

.benefit-content h3 {
  font-size: 18px;
  margin-bottom: 5px;
  font-weight: 600;
}

.benefit-content p {
  font-size: 14px;
  opacity: 0.9;
}

.right-panel {
  flex: 1;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  background: #fff;
  position: relative;
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

.btn-register {
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-register:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.login-link {
  text-align: center;
  font-size: 15px;
  color: #7f8c8d;
  letter-spacing: 0.2px;
  margin-top: auto;
  padding-top: 20px;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  transition: all 0.2s;
}

.login-link a:hover {
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
  .register-container {
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
  .register-container {
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
