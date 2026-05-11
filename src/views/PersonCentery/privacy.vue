<template>
  <section class="privacy-container">
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
    <div class="bg-circle circle-3"></div>
    <div class="bg-circle circle-4"></div>
    <div class="bg-circle circle-5"></div>
    <div class="bg-circle circle-6"></div>
    <div class="bg-circle circle-7"></div>

    <div class="password-modal">
      <div class="modal-header">
        <h2>修改密码</h2>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="oldPassword" class="form-label">原密码</label>
            <el-input
                id="oldPassword"
                v-model="oldPassword"
                type="password"
                placeholder="请输入原密码"
                class="form-input"
                required
            />
          </div>

          <div class="form-group">
            <label for="newPassword" class="form-label">新密码</label>
            <el-input
                id="newPassword"
                v-model="newPassword"
                type="password"
                placeholder="请输入新密码"
                class="form-input"
                required
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认新密码</label>
            <el-input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                class="form-input"
                required
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button
            class="confirm-btn"
            @click="handleSubmit"
        >
          确认修改
        </button>
        <button
            class="back-btn"
            @click=" router.go(-1);"
        >
          返回
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref,reactive,onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElInput,ElMessage } from 'element-plus';
import request from "@/utils/request.js";

const router = useRouter();

//用户信息
const data=reactive({
  user:JSON.parse(localStorage.getItem('user'))
})

// 密码数据
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');

// 表单验证
const validateForm = () => {
  if (!oldPassword.value) {
    errorMessage.value = '请输入原密码';
    return false;
  }

  if (!newPassword.value) {
    errorMessage.value = '请输入新密码';
    return false;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的新密码不一致';
    return false;
  }

  if(data.user.password !== oldPassword.value){
    errorMessage.value = '原密码错误';
    return false
  }

  if (newPassword.value === oldPassword.value) {
    errorMessage.value = '新密码不能与原密码相同';
    return false;
  }

  errorMessage.value = '';
  return true;
};

// 提交表单
const handleSubmit = () => {
  if (!validateForm()) return;

  data.user.password=newPassword.value  //赋新值
  request.put("user/update",data.user).then((res)=>{
    if(res.code === "200"){
      //更新缓存
      localStorage.setItem('user', JSON.stringify(data.user))
      // 提交成功提示
      ElMessage.success('密码修改成功');
      setTimeout(() => {
        window.location.href='/person'
      },1000)
    }else{
      ElMessage.error(res.msg)
    }
  })
};

// 组件挂载时初始化
onMounted(() => {
  window.scrollTo(0,0)
})
</script>

<style scoped>
:root, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.privacy-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  height: 100vh;
  background-color: #f0f7f0;
  padding: 20px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0) 70%);
  border: 2px solid rgba(76, 175, 80, 0.3); /* 圆形边框 */
  z-index: 0;
  animation: float 12s infinite ease-in-out;
  opacity: 0.9;
}

.circle-1 {
  width: 700px;
  height: 700px;
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.circle-2 {
  width: 500px;
  height: 500px;
  bottom: -150px;
  right: -150px;
  animation-delay: 2s;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0) 70%);
  border-width: 1.5px;
}

.circle-3 {
  width: 400px;
  height: 400px;
  top: 40%;
  right: 15%;
  animation-delay: 4s;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0) 70%);
  border-width: 1px;
}

.circle-4 {
  width: 300px;
  height: 300px;
  top: 20%;
  right: 10%;
  animation-delay: 1s;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.07) 0%, rgba(76, 175, 80, 0) 70%);
}

.circle-5 {
  width: 350px;
  height: 350px;
  bottom: 25%;
  left: 10%;
  animation-delay: 3s;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.09) 0%, rgba(76, 175, 80, 0) 70%);
}

.circle-6 {
  width: 250px;
  height: 250px;
  top: 60%;
  right: 30%;
  animation-delay: 5s;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.06) 0%, rgba(76, 175, 80, 0) 70%);
}

.circle-7 {
  width: 450px;
  height: 450px;
  top: 10%;
  left: 30%;
  animation-delay: 6s;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0) 70%);
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(50px, -30px) rotate(2deg); }
  50% { transform: translate(20px, 40px) rotate(0deg); }
  75% { transform: translate(-40px, 20px) rotate(-2deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

.password-modal {
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.modal-header {
  background-color: #4CAF50;
  color: white;
  padding: 18px 20px;
  text-align: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.modal-body {
  padding: 30px 25px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding-left: 15px;
}

.form-label {
  width: 100px;
  text-align: right;
  margin-right: 10px;
  color: #333;
  font-size: 15px;
  font-weight: 500;
}

.form-input {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
  padding: 8px;
  background-color: #fef0f0;
  border-radius: 4px;
}

.modal-footer {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  gap: 15px;
}

.confirm-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.2s;
}

.confirm-btn:hover {
  background-color: #388E3C;
}

.back-btn {
  background-color: #f0f0f0;
  color: #666;
  border: none;
  padding: 10px 25px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .form-group {
    padding-left: 5px;
  }

  .form-label {
    width: 90px;
    font-size: 14px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 10px;
  }

  .confirm-btn, .back-btn {
    width: 100%;
  }

  .bg-circle {
    border-width: 1px;
  }

  /* 响应式调整圆形大小 */
  .circle-1 { width: 500px; height: 500px; }
  .circle-2 { width: 400px; height: 400px; }
  .circle-3 { width: 300px; height: 300px; }
  .circle-4 { width: 200px; height: 200px; }
  .circle-5 { width: 250px; height: 250px; }
  .circle-6 { width: 180px; height: 180px; }
  .circle-7 { width: 350px; height: 350px; }
}
</style>