<template>
  <section class="profile-container">
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
    <div class="bg-circle circle-3"></div>
    <div class="bg-circle circle-4"></div>
    <div class="bg-circle circle-5"></div>
    <div class="bg-circle circle-6"></div>
    <div class="bg-circle circle-7"></div>

    <div class="profile-card">
      <div class="modal-header">
        <h2>个人资料</h2>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 顶部区域：头像和背景图片 -->
          <div class="top-section">
            <!-- 头像区域开始 -->
            <div class="avatar-section">
              <div class="avatar-preview-wrapper">
                <el-upload  ref="avatarRef" action="http://localhost:9090/files/upload" :show-file-list="false" :on-success="handleAvatarSuccess">
                <div class="avatar-preview" :class="{ empty: !data.user.avatar }" >
                  <img v-if="data.user.avatar" :src="data.user.avatar" alt="用户头像" class="avatar-img" />
                  <div v-else class="avatar-placeholder">
                    <i class="camera-icon">📷</i>
                    <span>点击上传头像</span>
                  </div>
                  <div class="avatar-overlay">
                    <span>更换头像</span>
                  </div>
                </div>
                </el-upload>
                <!-- 将按钮移到头像正下方 -->
                <button type="button" class="avatar-edit-btn" @click="triggerBackgroundUpload('avatar')">
                  更换头像
                </button>
              </div>
              <input type="file" ref="avatarInput" class="avatar-input" accept="image/*" @change="onAvatarChange" />
            </div>
            <!-- 头像区域结束 -->

            <!-- 背景图片区域 -->
            <div class="background-section">
              <el-upload  ref="backgroundUploadRef" style="width: 630px" action="http://localhost:9090/files/upload" :show-file-list="false" :on-success="handleBackgroundSuccess">
                <div class="background-preview" :class="{ empty: !data.user.backgroundImage }" >
                  <!-- 盒子里的详细内容开始-->
                  <img v-if="data.user.backgroundImage" :src="data.user.backgroundImage" alt="背景图片" class="background-img" />
                  <div v-else class="background-placeholder">
                    <i class="background-icon">🌄</i>
                    <span>点击上传背景图片</span>
                  </div>
                  <!-- 盒子里的详细内容结束-->
                  <!-- 鼠标移动到该处时的灯笼展示效果开始-->
                  <div class="background-overlay">
                    <span>{{ data.user.backgroundImage ? '更换背景' : '上传背景' }}</span>
                  </div>
                  <!-- 鼠标移动到该处时的灯笼展示效果结束-->
                </div>
                <!--上传背景图片后的可选操作开始-->
              </el-upload>
              <!--操作按钮 -->
              <div class="background-actions">
                <button type="button" class="upload-btn" @click="triggerBackgroundUpload('background')">
                  {{ data.user.backgroundImage ? '更换背景' : '上传背景' }}
                </button>
                <button type="button" class="remove-btn" @click="removeBackground" v-if="data.user.backgroundImage">
                  移除
                </button>
                <input type="file" class="background-input" accept="image/*" @change="onBackgroundChange" />
              </div>
              <!--上传背景图片后的可选操作结束-->
            </div>
          </div>

          <!-- 主要内容区域 -->
          <div class="main-content">
            <div class="content-column">
              <!--账号信息（手机号）-->
              <div class="form-group">
                <label for="account" class="form-label required">账号</label>  <!--for属性作用：点击label时，屏幕阅读器会聚焦到对应的input-->
                <el-input id="account" v-model="data.user.phone" placeholder="请输入账号" required :disabled="true"/>
              </div>
              <!--用户名-->
              <div class="form-group">
                <label for="nickname" class="form-label required">昵称</label>
                <el-input id="nickname" v-model="data.user.username" placeholder="请输入昵称" required/>
              </div>
              <!--职业-->
              <div class="form-group">
                <label for="occupation" class="form-label">职业</label>
                <el-input id="occupation" v-model="data.user.userwork" placeholder="请输入职业"/>
              </div>
              <!--用户所在地区-->
              <div class="form-group">
                <label for="location" class="form-label">所在地</label>
                <el-input id="location" v-model="data.user.address" placeholder="请输入所在地"/>
              </div>
            </div>

            <div class="content-column">
              <!--性别单选框-->
              <div class="form-group">
                <label class="form-label">性别</label>
                <div class="radio-group">
                  <label class="radio-option" :class="{ active: data.user.sex === '男' }">
                    <input type="radio" name="gender" value="男" v-model="data.user.sex" hidden />
                    <span class="radio-label">男</span>
                  </label>
                  <label class="radio-option" :class="{ active: data.user.sex === '女' }">
                    <input type="radio" name="gender" value="女" v-model="data.user.sex" hidden />
                    <span class="radio-label">女</span>
                  </label>
                  <label class="radio-option" :class="{ active: data.user.sex === '其他' }">
                    <input type="radio" name="gender" value="其他" v-model="data.user.sex" hidden />
                    <span class="radio-label">其他</span>
                  </label>
                </div>
              </div>
              <!--年龄-->
              <div class="form-group">
                <label for="age" class="form-label">年龄</label>
                <el-input id="age" v-model="data.user.age" type="number" placeholder="请输入年龄" min="0" max="150"/>
              </div>
              <!--个人签名-->
              <div class="form-group">
                <label for="signature" class="form-label">个人签名</label>
                <el-input id="signature" v-model="data.user.description" type="textarea" placeholder="请输入个人签名" rows="3" maxlength="100"
                />
                <div class="char-count">{{ data.user.description!=null?data.user.description.length:0 }}/100</div>
              </div>
            </div>
          </div>
          <!--展示错误信息，如那些信息未填写，信息错误等-->
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        </form>
      </div>

      <div class="modal-footer">
        <button class="back-btn" @click=" router.go(-1);">返回</button>
        <button class="confirm-btn" @click="handleSubmit">保存修改</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted,reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from "@/utils/request.js"

const router = useRouter();

// 表单数据
const errorMessage = ref('');  // 错误信息，如那些信息未填写，信息错误等


// 上传相关
const avatarInput = ref(null);
const backgroundUploadRef = ref(null);
const avatarRef = ref(null);

//用户信息
const data=reactive({
  user:JSON.parse(localStorage.getItem('user'))
})

const handleAvatarUpload = () => {
  avatarInput.click();
};

//图片上传成功处理
const handleAvatarSuccess = (res) => (data.user.avatar = res.data)
const handleBackgroundSuccess = (res) => (data.user.backgroundImage = res.data)

//背景图片下面按钮触发的上传图片方法
const triggerBackgroundUpload = (type) => {
  let fileInput;
  if(type==='background') {
    fileInput = backgroundUploadRef?.value.$el?.querySelector('input[type="file"]');
  }else{
    fileInput = avatarRef?.value.$el?.querySelector('input[type="file"]');
  }
  if (fileInput) {
    fileInput.click();
  }
};

const onAvatarChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      data.user.avatar = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const onBackgroundChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      data.user.backgroundImage = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

//移除背景图片
const removeBackground = () => {
  data.user.backgroundImage = '';
};

const validateForm = () => {
  if (!data.user.username.trim()) {
    errorMessage.value = '昵称不能为空';
    return false;
  }
  if (data.user.age && (data.user.age < 0 || data.user.age > 150)) {
    errorMessage.value = '请输入有效的年龄';
    return false;
  }
  errorMessage.value = '';
  return true;
};

//保存修改
const handleSubmit = () => {
  if (!validateForm()) return;  // 验证表单
  request.put("user/update",data.user).then((res)=>{
    if(res.code === "200"){
      ElMessage.success('修改成功');
      localStorage.setItem('user', JSON.stringify(data.user))
      setTimeout(() => {
        window.location.href='/person'
      },1000)
    }else{
      ElMessage.error(res.msg)
    }
  })
};

onMounted(() => {
  window.scrollTo(0,0)
});
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f7f0;
  padding: 20px;
  position: relative;
  overflow: auto; /* 允许容器滚动 */
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0) 70%);
  border: 2px solid rgba(76, 175, 80, 0.3);
  z-index: 0;
  animation: float 12s infinite ease-in-out;
}

.circle-1 { width: 700px; height: 700px; top: -200px; left: -200px; animation-delay: 0s; }
.circle-2 { width: 500px; height: 500px; bottom: -150px; right: -150px; animation-delay: 2s; }
.circle-3 { width: 400px; height: 400px; top: 40%; right: 15%; animation-delay: 4s; }
.circle-4 { width: 300px; height: 300px; top: 20%; right: 10%; animation-delay: 1s; }
.circle-5 { width: 350px; height: 350px; bottom: 25%; left: 10%; animation-delay: 3s; }
.circle-6 { width: 250px; height: 250px; top: 60%; right: 30%; animation-delay: 5s; }
.circle-7 { width: 450px; height: 450px; top: 10%; left: 30%; animation-delay: 6s; }

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(50px, -30px) rotate(2deg); }
  50% { transform: translate(20px, 40px) rotate(0deg); }
  75% { transform: translate(-40px, 20px) rotate(-2deg); }
}

.profile-card {
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 关键：允许内容区域压缩 */
  height: auto; /* 改为自动高度，适应内容 */
  max-height: none; /* 移除最大高度限制 */
}

.modal-header {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 20px;
  text-align: center;
  flex-shrink: 0; /* 固定头部高度 */
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.modal-body {
  padding: 30px;
  overflow-y: auto; /* 允许内容区域滚动 */
  flex: 1; /* 关键：占据剩余空间 */
  min-height: 0; /* 关键：允许内容区域压缩 */
}

.top-section {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 30px;
  margin-bottom: 30px;
  align-items: start; /* 顶部对齐 */
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px; /* 确保头像区域有最小宽度 */
}

/* 修改：头像预览包装器，使按钮位于头像正下方 */
.avatar-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px; /* 添加间距，使按钮与头像稍微隔开 */
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e8f5e8;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
  flex-shrink: 0; /* 防止头像被压缩 */
}

.avatar-preview:hover {
  transform: scale(1.05);
  border-color: #4CAF50;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  gap: 8px;
  padding: 10px;
  font-size: 12px;
  text-align: center;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 12px;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

/* 修改：按钮样式保持不变，但位置已通过父容器调整 */
.avatar-edit-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  width: auto; /* 确保按钮宽度自适应内容 */
  white-space: nowrap; /* 防止按钮文字换行 */
}

.avatar-edit-btn:hover {
  background: #388E3C;
}

.background-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0; /* 允许背景区域收缩 */
}

.background-preview {
  width: 630px;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px dashed #d0d0d0;
  background: #fafafa;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0; /* 防止背景预览被压缩 */
}

.background-preview:hover {
  border-color: #4CAF50;
}

.background-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  gap: 5px;
  font-size: 12px;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 12px;
}

.background-preview:hover .background-overlay {
  opacity: 1;
}

.background-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap; /* 允许按钮换行 */
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  min-width: 0; /* 允许内容区域收缩 */
}

.form-group {
  margin-bottom: 20px;
  min-width: 0; /* 允许表单组收缩 */
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap; /* 防止标签文字换行 */
}

.form-label.required::after {
  content: '*';
  color: #f56c6c;
  margin-left: 4px;
}

.radio-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap; /* 允许选项换行 */
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #e8f5e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  white-space: nowrap; /* 防止选项文字换行 */
}

.radio-option:hover {
  border-color: #4CAF50;
}

.radio-option.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.char-count {
  color: #999;
  font-size: 12px;
  text-align: right;
  margin-top: 5px;
}

.upload-btn, .remove-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap; /* 防止按钮文字换行 */
}

.upload-btn {
  background: #4CAF50;
  color: white;
}

.upload-btn:hover {
  background: #388E3C;
}

.remove-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e0e0e0;
}

.remove-btn:hover {
  background: #e9ecef;
}

.avatar-input, .background-input {
  display: none;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
  padding: 10px;
  background: #fef0f0;
  border-radius: 6px;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  flex-shrink: 0; /* 固定底部高度 */
  flex-wrap: wrap; /* 允许按钮换行 */
}

.confirm-btn, .back-btn {
  padding: 10px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
  min-width: 120px;
  white-space: nowrap; /* 防止按钮文字换行 */
}

.confirm-btn {
  background: #4CAF50;
  color: white;
}

.confirm-btn:hover {
  background: #388E3C;
}

.back-btn {
  background: #f0f0f0;
  color: #666;
}

.back-btn:hover {
  background: #e0e0e0;
}

/* 响应式设计 - 针对小屏幕优化 */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
    align-items: flex-start; /* 顶部对齐，避免垂直居中导致内容被截断 */
  }

  .profile-card {
    max-width: 100%;
    border-radius: 10px;
  }

  .modal-body {
    padding: 20px;
  }

  .top-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .avatar-section {
    align-items: center;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modal-footer {
    flex-direction: row; /* 保持水平排列 */
    gap: 10px;
  }

  .confirm-btn, .back-btn {
    width: auto; /* 恢复自动宽度 */
    flex: 1; /* 平均分配空间 */
  }

  .radio-group {
    justify-content: center; /* 居中对齐单选按钮 */
  }
}

/* 针对超小屏幕的优化 */
@media (max-width: 480px) {
  .modal-body {
    padding: 15px;
  }

  .top-section {
    gap: 15px;
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
  }

  .main-content {
    gap: 15px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .modal-footer {
    flex-direction: column; /* 超小屏幕改为垂直排列 */
  }

  .confirm-btn, .back-btn {
    width: 100%;
  }

  .background-actions {
    flex-direction: column; /* 超小屏幕背景按钮垂直排列 */
    align-items: center;
  }

  .upload-btn, .remove-btn {
    width: 100%;
    max-width: 200px;
  }
}

/* 针对极小屏幕的优化 */
@media (max-width: 360px) {
  .modal-body {
    padding: 10px;
  }

  .top-section {
    gap: 10px;
  }

  .avatar-preview {
    width: 80px;
    height: 80px;
  }

  .avatar-placeholder, .background-placeholder {
    font-size: 10px;
  }

  .form-label {
    font-size: 13px;
  }

  .radio-option {
    padding: 8px 15px;
    font-size: 13px;
  }
}
</style>


