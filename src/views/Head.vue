<template>
  <!-- ==================== 导航栏部分开始 ==================== -->
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo">
        <img src="/logo.png" style="width: 75px;height: 75px">
        <router-link to="/">
          <span class="logo-text">健康运动</span>
        </router-link>
      </div>

      <ul class="navbar-menu">
        <li class="navbar-item" v-for="(item, index) in menuItems" :key="index">
          <router-link
              :to="item.path"
              class="navbar-link"
          >
            <span class="menu-text">{{ item.text }}</span>
          </router-link>
        </li>
      </ul>

      <div v-if="data.user==null" class="navbar-auth">
        <router-link to="/login" class="btn btn-login" >登录</router-link>
        <router-link to="/register" class="btn btn-register">注册</router-link>
      </div>

      <div v-if="data.user!=null" style="display: flex; gap: 2.5rem;">
        <el-menu :ellipsis="false" mode="horizontal"  router :default-active="router.currentRoute.value.path" style="border-radius: 10px; background-color:#7fef8e; width: 220px;">
          <el-sub-menu index="1" style="display: flex;width: 180px;">
            <template #title>
              <img :src="data.user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" style="width: 50px;height: 45px;border-radius: 50%;">
              <span style="margin-left: 20px; color: #151515">{{ data.user.username }}</span>
            </template>
            <el-menu-item  @click="goToPerson">
              <el-icon><User /></el-icon><!--记得更新一下用户的数据-->
              <sapn>个人中心</sapn>
            </el-menu-item>
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
                <span>返回主页</span>
            </el-menu-item>
            <el-menu-item @click="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>

    </div>
  </nav>
  <!-- ==================== 导航栏部分结束 ==================== -->

  <!--详细内容开始-->
  <div class="content" style="margin-top: -20px">
    <RouterView />
  </div>

  <!-- ========================页脚开始====================== -->
  <footer class="health-footer">
    <div class="footer-wave">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
      </svg>
    </div>

    <div class="footer-content">
      <!-- 关于我们 -->
      <div class="footer-section">
        <h3 class="footer-title">关于健康运动</h3>
        <p class="footer-text">将运动融于生活，让健康始于行动。我们致力于提供专业的健身指导，科学的训练计划，让健康运动成为您生活的一部分。</p>
        <div class="footer-badges">
          <span class="badge">科学健身</span>
          <span class="badge">专业指导</span>
          <span class="badge">健康生活</span>
          <span class="badge">美满人生</span>
        </div>
      </div>

      <!-- 快速链接 -->
      <div class="footer-section" style="padding-left: 50px">
        <h3 class="footer-title">快速导航</h3>
        <div class="footer-links">
          <router-link to="/head/home" class="footer-link">首页</router-link>
          <router-link to="/training" class="footer-link">训练课程</router-link>
          <router-link to="/ai-coach" class="footer-link">AI教练</router-link>
          <router-link to="/exercise-library" class="footer-link">动作库</router-link>
          <router-link to="/community极" class="footer-link">健身社区</router-link>
          <router-link to="/events" class="footer-link">赛事活动</router-link>
        </div>
      </div>

      <!-- 联系我们 -->
      <div class="footer-section">
        <h3 class="footer-title">联系我们</h3>
        <div class="contact-info">
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon><Phone /></el-icon>
            </div>
            <div class="contact-details">
              <span class="contact-label">咨询热线</span>
              <span class="contact-value">400-888-8888</span>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon><Message /></el-icon>
            </div>
            <div class="contact-details">
              <span class="contact-label">电子邮箱</span>
              <span class="contact-value">service@healthsports.com</span>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="contact-details">
                <span class="contact-label">公司地址</span>
                <span class="contact-value">广州市从化区温泉大道88号健康大厦</span>
              </div>
            </div>
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="contact-details">
              <span class="contact-label">办公时间</span>
              <span class="contact-value">周一至周五: 9:00-18:00</span>
              <span class="contact-value">周末: 10:00-16:00</span>
            </div>
          </div>
          </div>
        </div>

        <!-- 关注我们 -->
        <div class="footer-section">
          <h3 class="footer-title">关注我们</h3>
          <p class="footer-text">关注我们的社交媒体，获取最新健身资讯和健康小贴士</p>
          <div class="social-grid">
            <div v-for="(item, index) in services" :key="index" class="social-item" @click="showImage(item.src)">
              <div class="social-content">
                <img :src="item.icon" class="social-icon" :alt="item.name" draggable="false"/>
                <span class="social-name">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright">© 2025 健康运动 - 让运动成为生活的一部分。保留所有权利。</div>
          <div class="footer-legal">
            <a href="#" class="legal-link">隐私政策极</a>
            <a href="#" class="legal-link">服务条款</a>
            <a href="#" class="legal-link">免责声明</a>
          </div>
        </div>
      </div>

      <!-- 装饰元素 -->
      <div class="footer-decoration">
        <div class="decoration-item decoration-1"></div>
        <div class="decoration-item decoration-2"></div>
        <div clas="decoration-item decoration-3"></div>
      </div>
  </footer>

  <!-- ===================== 图片预览弹出层开始 ==========================-->
  <el-dialog  v-model="isImagePopupVisible" style="height: 440px; width: 500px;">
    <img :src="currentImage" style=" margin-top:-10px;margin-left: 34px; height:400px; width: 400px; ">
  </el-dialog>
  <!-- ===================== 图片预览弹出层结束 ==========================-->

</template>

<script setup>
import { ref, reactive,onMounted } from 'vue'
import { Location, Message, Phone, User, House, SwitchButton } from "@element-plus/icons-vue";
import router from "@/router/index.js"
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

const data = reactive({
  user:null
});

//解析token获取用户信息请求
const checkToken=async()=>{
  request.get('/user/currentUser', {
    headers: {
      'Authorization': localStorage.getItem('token')}}).then(res=>{
    if(res.code === '200'){
      //存储后台返回的数据
      data.user=res.data
    }
  })
}


// 导航栏数据
const menuItems = ref([
  { text: '首页', path: '/head/home' },
  { text: '运动社区', path: '/community' },
  { text: '训练计划', path: '/exercisePlan' },
  { text: 'AI教练', path: '/ai-coach' },
  { text: '动作库', path: '/exercise-library' },
  { text: '模拟器材', path: '/toolshow' },
  { text: '漂流瓶', path: '/driftBottleMain' },
  { text: '比赛宣传', path: '/eventPromotion' },
  { text: '健身伙伴', path: '/chat' }
]);

//退出方法
const logout = () => {
  data.user.online=0
  //获取最新用户信息
  request.get(`user/selectById/${data.user.id}`).then((res)=>{
    data.user=res.data
  })
  //修改用户状态
  // request.put('/user/update',data.user).then(res=>{
  //   if (res.code === '200') {//注册成功
  //     ElMessage.success("修改状态成功")
  //   }else{
  //     ElMessage.error(res.msg);
  //   }
  // })
  //该方法还是更新操作，不过多了一步向ws发送退出登录的操作
  request.put('/user/updateAndNoticeWebSocket',data.user).then(res=>{
    if (res.code === '200') {//注册成功
      ElMessage.success("修改状态成功")
    }else{
      ElMessage.error(res.msg);
    }
  })

  //删除后台的token
  request.delete('/user/logout',{headers: {'Authorization': localStorage.getItem('token')}})

  localStorage.removeItem("user");
  window.location.reload();
  location.href = '/';
}

const isImagePopupVisible = ref(false);
const currentImage = ref(null);

// 保持原有的获取图片函数
const getImageUrl = (name) => {
  return new URL(`../assets/${name}`, import.meta.url).href;
}

// 页脚配置
const services = [
  { name: '微信', icon: getImageUrl('wechat.png'), src: getImageUrl('wechat1.jpg') },
  { name: 'QQ', icon: getImageUrl('qq.png'), src: getImageUrl('qq1.jpg') },
  { name: 'B站', icon: getImageUrl('bilibili.png'), src: getImageUrl('bilibili1.jpg') },
  { name: '抖音', icon: getImageUrl('music.png'), src: getImageUrl('music1.jpg') }
]

const showImage= (src) => {
  currentImage.value = src;
  isImagePopupVisible.value = true;
}

const goToPerson=()=>{
  localStorage.setItem("userId", data.user.id)
  window.location.href = '/person';
}

// 生命周期钩子
onMounted(() => {
  checkToken()
})
</script>

<style scoped>
/* 导航栏样式 */
.navbar {
  background-color: #f8f9fa;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 1.1rem 0;
  border-bottom: 2px solid #e8f5e9;
  margin-bottom: 30px;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2.5rem;
}

.navbar-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: auto;
}

.navbar-logo a {
  font-size: 2.1rem;
  font-weight: 800;
  color: #2e7d32;
  text-decoration: none;
  display: flex;
  align-items: center;
  white-space: nowrap;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
}

.logo-text {
  letter-spacing: 0.5px;
  font-size: 1.2em;
  line-height: 1;
}

.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  height: 100%;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.navbar-menu::-webkit-scrollbar {
  display: none;
}

.navbar-item {
  margin: 0 0.4rem;
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 100%;
}

.navbar-link {
  color: #333;
  text-decoration: none;
  padding: 0.9rem 1.1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1.18rem;
  display: flex;
  align-items: center;
  position: relative;
  white-space: nowrap;
  height: 100%;
}

.menu-text {
  margin-left: 8px;
  letter-spacing: 0.5px;
  font-size: 1.15rem;
}

.navbar-link:hover {
  color: #2e7d32;
  background-color: rgba(46, 125, 50, 0.15);
  transform: translateY(-2px);
}

.navbar-link::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  width: 0;
  height: 3px;
  background: #2e7d32;
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 2px;
}

.navbar-link:hover::after {
  width: 80%;
}

.navbar-auth {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 1rem;
  margin-left: auto;
}

.btn {
  padding: 1rem 1.9rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  white-space: nowrap;
  height: 100%;
  font-size: 1.15rem;
}

.btn-text {
  font-size: 1.1rem;
}

.btn-login {
  background-color: transparent;
  color: #2e7d32;
  border: 2px solid #2e7d32;
}

.btn-login:hover {
  background-color: #2e7d32;
  color: white;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-register {
  background-color: #2e7d32;
  color: white;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-register:hover {
  background-color: #1b5e20;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 125, 50, 0.4);
}

/* 页脚样式 */
.health-footer {
  background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%);
  color: #ffffff;
  position: relative;
  padding: 60px 0 0;
  margin-top: 60px;
  overflow: hidden;
}

.footer-wave {
  position: absolute;
  top: -2px;
  left: 0;
  width: 100%;
  line-height: 0;
}

.footer-wave svg {
  width: 100%;
  height: 60px;
}

.footer-wave .shape-fill {
  fill: #e8f5e9;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
  position: relative;
  z-index: 2;
}

.footer-section {
  padding: 0px 15px;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.footer-title {
  color: #a3e4b9;
  font-size: 1.5rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 10px;
  margin-bottom: 12px;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #52b788, #40916c);
  border-radius: 2px;
}

.footer-text {
  color: #d8f3dc;
  line-height: 1.6;
  font-size: 1rem;
  flex-grow: 1;
  margin-bottom: 15px;
}

.footer-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
  padding-bottom: 90px;
}

.badge {
  background: rgba(163, 228, 185, 0.15);
  color: #d8f3dc;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(163, 228, 185, 0.3);
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: #d8f3dc;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 8px 0;
  font-size: 1rem;
  position: relative;
  width: fit-content;
}

.footer-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: #52b788;
  transition: width 0.3s ease;
}

.footer-link:hover {
  color: #52b788;
  transform: translateX(5px);
}

.footer-link:hover::before {
  width: 100%;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.contact-icon {
  background: rgba(163, 228, 185, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(163, 228, 185, 0.2);
}

.contact-icon .el-icon {
  color: #52b788;
  font-size: 1.2rem;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-label {
  color: #a3e4b9;
  font-size: 0.9rem;
  font-weight: 500;
}

.contact-value {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.social-item {
  background: rgba(163, 228, 185, 0.1);
  border: 1px solid rgba(163, 228, 185, 0.2);
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.social-item:hover {
  transform: translateY(-5px);
  background: rgba(163, 228, 185, 0.2);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.social-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.social-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.social-name {
  color: #d8f3dc;
  font-size: 0.9rem;
  font-weight: 500;
}

.footer-bottom {
  border-top: 1px solid rgba(163, 228, 185, 0.3);
  padding: 20px 0;
  background: rgba(27, 67, 50, 0.5);
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.copyright {
  color: #a3e4b9;
  font-size: 0.9rem;
}

.footer-legal {
  display: flex;
  gap: 20px;
}

.legal-link {
  color: #d8f3dc;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: #52b788;
}

.footer-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-item {
  position: absolute;
  border-radius: 50%;
  background: rgba(163, 228, 185, 0.05);
}

.decoration-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 5%;
  animation: float 8s infinite ease-in-out;
}

.decoration-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  right: 10%;
  animation: float 10s infinite ease-in-out 2s;
}

.decoration-3 {
  width: 100px;
  height: 100px;
  top: 40%;
  right: 20%;
  animation: float 12s infinite ease-in-out 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(3deg);
  }
  66% {
    transform: translateY(10px) rotate(-3deg);
  }
}
</style>
