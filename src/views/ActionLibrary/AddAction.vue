<template>
  <div class="publish-container">
    <!-- 顶部操作栏 -->
    <div class="btn-group">
      <button class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon> 返回
      </button>
      <button class="save-btn" style="margin-left: 15px" @click="saveAction">
        <el-icon><Check /></el-icon> 保存
      </button>
    </div>

    <!-- 主体内容 -->
    <div class="content-grid">
      <!-- 左侧信息 -->
      <div class="left-column">
        <!-- 动作名称 -->
        <div class="form-card">
          <div class="section-title">
            <el-icon><Edit /></el-icon>
            动作名称
          </div>
          <input v-model="form.name" class="title-input" placeholder="请输入动作名称" />
        </div>

        <!-- 动作标签 -->
        <div class="form-card">
          <div class="section-title">
            <el-icon><PriceTag /></el-icon>
            运动标签
          </div>
          <div class="tag-container">
            <el-select
                v-model="form.tooltag"
                placeholder="训练器械"
                class="tag-select"
                filterable
                clearable
            >
              <el-option
                  v-for="equipment in equipmentOptions"
                  :key="equipment"
                  :label="equipment"
                  :value="equipment"
              />
            </el-select>
            <el-select
                v-model="form.goaltag"
                placeholder="训练目标"
                class="tag-select"
                filterable
                clearable
            >
              <el-option
                  v-for="goal in goalOptions"
                  :key="goal"
                  :label="goal"
                  :value="goal"
              />
            </el-select>
            <el-select
                v-model="form.locationtag"
                placeholder="训练部位"
                class="tag-select"
                filterable
                clearable
            >
              <el-option
                  v-for="area in areaOptions"
                  :key="area"
                  :label="area"
                  :value="area"
              />
            </el-select>
          </div>
        </div>

        <!-- 动作图片 -->
        <div class="form-card" >
          <div class="section-title">
            <el-icon><Picture /></el-icon>
            动作图片
          </div >
          <div style="width:100%;">
            <el-upload
                action="http://localhost:9090/files/upload"
                :show-file-list="false"
                :on-success="handleImageSuccess"
            >
              <div class="upload-area" style="justify-content: center;justify-items: center;align-items: center;align-content: center;">
                <div v-if="!form.image">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-text">上传动作图片</div>
                  <div class="upload-info">支持JPG/PNG格式</div>
                </div>
                <img v-else :src="form.image" class="upload-preview" />
              </div>
            </el-upload>
            </div>
        </div>

        <!-- 动作视频 -->
        <div class="form-card">
          <div class="section-title">
            <el-icon><VideoPlay /></el-icon>
            动作视频
          </div>
          <div style="width:100%;">
          <el-upload
              action="http://localhost:9090/videos/upload"
              :show-file-list="false"
              :on-success="handleVideoSuccess"
          >
            <div class="upload-area">
              <div v-if="!form.video">
                <el-icon class="upload-icon"><VideoPlay /></el-icon>
                <div class="upload-text">上传动作视频</div>
                <div class="upload-info">支持MP4格式</div>
              </div>
              <video v-else :src="form.video" controls class="preview-video"></video>
            </div>
          </el-upload>
        </div>
          </div>
      </div>

      <!-- 右侧信息 -->
      <div class="right-column">
        <!-- 动作描述 -->
        <div class="form-card" >
          <div class="section-title">
            <el-icon><Document /></el-icon>
            动作描述
          </div>
          <div class="textarea-container">
            <textarea v-model="form.description" class="description-input" placeholder="详细描述动作的做法和要点"></textarea>
          </div>
        </div>

        <!-- 注意事项 -->
        <div class="form-card">
          <div class="section-title">
            <el-icon><Warning /></el-icon>
            注意事项
          </div>
          <div class="textarea-container">
            <textarea v-model="form.notice" class="description-input" placeholder="记录动作的注意事项和安全提示"></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive,ref,onMounted} from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from "@/utils/request.js";

const router = useRouter()

// 表单数据
const form = reactive({
  name: '',     // 动作名称
  locationtag: '',// 训练部位
  goaltag: '',     // 训练目标
  tooltag: '',     // 训练器械
  image: '',    // 动作图片
  video: '',    // 动作视频
  description: '',  // 动作描述
  notice: ''    // 注意事项
})
//器械多选框
const equipmentOptions = [
  '无器械', '有器械', '哑铃', '杠铃'
]
//目标多选框
const goalOptions = [
  '增肌', '塑形', '燃脂', '放松'
]
//部位多选框
const areaOptions = [
  '腿部', '背部', '胸部', '肩部'
]

// 处理图片上传成功
const handleImageSuccess = (res) => {
  form.image = res.data
  ElMessage.success('图片上传成功')
}

// 处理视频上传成功
const handleVideoSuccess = (res) => {
  form.video = res.data
  ElMessage.success('视频上传成功')
}

// 返回上一页
const goBack = () => {
  router.push('/exercise-library')
}

// 保存动作
const saveAction = async () => {
  // 表单验证
  if (!form.name.trim()) return ElMessage.warning('动作名称不能为空')
  if (!form.locationtag || !form.goaltag || !form.tooltag) ElMessage.warning('请填写完整的运动标签')
  //保存数据到数据库
  request.post("action/insertAction",form).then((res)=>{
    if(res.code === "200"){
      // 返回动作库页面
      router.push('/exercise-library')
    }else{
      ElMessage.error(rse.msg)
    }
  })
}

// 组件挂载时初始化
onMounted(() => {

  window.scrollTo(0,0)
})
</script>

<style scoped>
.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.publish-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  padding: 1.5rem;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 按钮区域样式 */
.btn-group {
  justify-content: flex-end;
  padding-top: 1rem;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}

.save-btn {
  background: linear-gradient(135deg, #27AE60, #66bb6a);
  border: none;
  color: white;
  padding: 0.75rem 2.25rem;
  font-weight: 500;
  border-radius: 0.625rem;
  font-size: 1.3125rem; /* 21px */
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(39, 174, 96, 0.3);
}

.save-btn:hover {
  background: linear-gradient(135deg, #219653, #4caf50);
  transform: translateY(-0.125rem);
  box-shadow: 0 0.375rem 0.9375rem rgba(39, 174, 96, 0.4);
}

.back-btn {
  color: #27AE60;
  background: #fff;
  border: 0.0625rem solid #27AE60;
  padding: 0.75rem 1.75rem;
  font-weight: 500;
  border-radius: 0.625rem;
  font-size: 1.3125rem; /* 21px */
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: #f0f9f0;
  transform: translateY(-0.125rem);
}

/* 主体内容区样式 */
.content-grid {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 1.25rem;
  min-height: calc(100vh - 11.25rem);
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* 表单卡片通用样式 */
.form-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.1);
  border: 0.0625rem solid #eee;
  transition: all 0.3s ease;
  overflow: hidden;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding: 25px;
}

.form-card:hover {
  transform: translateY(-0.1875rem);
  box-shadow: 0 0.375rem 0.9375rem rgba(39, 174, 96, 0.25);
}

.section-title {
  height: 2.5rem;
  font-size: 1.4375rem; /* 23px */
  color: #27AE60;
  font-weight: 600;
  margin-bottom: 1.125rem;
  position: relative;
  padding-left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  height: 1.25rem;
  width: 0.25rem;
  background: #27AE60;
  border-radius: 0.125rem;
}

/* 标题输入区域 */
.title-input {
  border: 0.125rem solid #e0e0e0;
  font-size: 19px;
  padding: 0.75rem 0.9375rem;
  color: #333;
  font-weight: 500;
  width: 100%;
  outline: none;
  transition: all 0.3s ease;
  border-radius: 0.625rem;
  box-sizing: border-box;
  height: 2.5rem; /* 调整高度 */
}

.title-input:focus {
  border-color: #a5d6a7;
  box-shadow: 0 0 0 0.125rem rgba(39, 174, 96, 0.2);
}

.title-input::placeholder {
  color: #ccc;
}

/* 标签选择区域 */
.tag-container {
  display: flex;
  flex-direction: column;
  gap: 0.9375rem;
  margin-bottom: 0.9375rem;
}

.tag-select {
  width: 100%;
}

/* 上传容器 */
.upload-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* 图片上传区域 */
 .video-uploader {
  width: 80%;
  cursor: pointer;
  display: block;
}

.upload-area {
  border: 0.125rem dashed #e0e0e0;
  border-radius: 0.75rem;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 1.875rem;
  text-align: center;
  height: 300px;
  width: 780px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-sizing: border-box;
  flex: 1;
}

.upload-area:hover {
  border-color: #a5d6a7;
  background-color: #f0f9f0;
}

.image-preview, .video-preview {
  padding: 0;
  height: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  width: 100%;
  height: 18.75rem;
  object-fit: cover;
  border-radius: 0.75rem;
  display: block;
}

.preview-video {
  width: 100%;
  height: 18.75rem;
  object-fit: cover;
  border-radius: 0.75rem;
  display: block;
}

.upload-icon {
  font-size: 2.8125rem;
  color: #27AE60;
  margin-bottom: 0.75rem;
}

.upload-text {
  color: #27AE60;
  font-weight: 500;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.upload-info {
  font-size: 1.0625rem;
  color: #999;
  margin: 0;
  line-height: 1.4;
}

/* 描述输入区域容器 */
.textarea-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 25rem;
}

/* 描述输入区域 */
.description-input {
  width: 100%;
  padding: 0.9375rem;
  border: 0.125rem solid #e0e0e0;
  border-radius: 0.75rem;
  font-size: 1.25rem; /* 20px */
  resize: none;
  transition: all 0.3s ease;
  line-height: 1.6;
  flex: 1;
  box-sizing: border-box;
}

.description-input:focus {
  border-color: #a5d6a7;
  box-shadow: 0 0 0 0.125rem rgba(39, 174, 96, 0.2);
  outline: none;
}



/* 响应式布局优化 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 45% 55%;
  }

  .textarea-container {
    min-height: 18.75rem;
  }

  .upload-area {
    height: 15rem;
  }

  .preview-image, .preview-video {
    height: 15rem;
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .publish-container {
    padding: 0.9375rem;
  }

  .btn-group {
    flex-direction: column;
    gap: 0.9375rem;
    align-items: stretch;
  }

  .back-btn, .save-btn {
    justify-content: center;
  }

  .upload-area {
    height: 15rem;
    padding: 1.25rem;
  }

  .preview-image, .preview-video {
    height: 15rem;
  }

  .textarea-container {
    min-height: 15rem;
  }

  .section-title {
    font-size: 1.3125rem; /* 21px */
    height: 2.25rem;
  }

  .title-input {
    font-size: 1.25rem; /* 20px */
    padding: 0.625rem 0.75rem;
  }

  .description-input {
    font-size: 1.125rem; /* 18px */
    padding: 0.75rem;
  }

  .upload-text {
    font-size: 1.125rem; /* 18px */
  }

  .upload-info {
    font-size: 1rem; /* 16px */
  }
}

</style>

