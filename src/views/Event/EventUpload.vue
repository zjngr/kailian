<template>
  <div class="fullscreen-publish-container">
    <div class="publish-card">
      <div class="card-content">
        <div class="form-grid">
          <!-- 左侧表单区域 -->
          <div class="form-column">
            <div class="form-header">
              <h1>
                <el-icon class="header-icon"><Promotion /></el-icon>
                发布新活动
              </h1>
            </div>

            <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                label-position="top"
            >
              <el-form-item label="活动名称" prop="title">
                <el-input
                    v-model="formData.aname"
                    placeholder="请输入活动名称"
                    clearable
                    class="styled-input"
                >
                  <template #prefix>
                    <el-icon><Tickets /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="活动分类" prop="category">
                <el-select
                    v-model="formData.matchtype"
                    placeholder="请选择活动分类"
                    clearable
                    class="styled-select"
                >
                  <el-option
                      v-for="category in categories"
                      :key="category"
                      :label="category"
                      :value="category"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="活动地点" prop="location">
                <el-input
                    v-model="formData.alocation"
                    placeholder="请输入详细活动地点"
                    clearable
                    class="styled-input"
                >
                  <template #prefix>
                    <el-icon><Location /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-row :gutter="15">
                <el-col :span="12">
                  <el-form-item label="活动日期" prop="date">
                    <el-date-picker
                        v-model="formData.adatatime"
                        type="datetime"
                        placeholder="选择日期"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        class="styled-datepicker"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="报名官网链接" prop="registrationLink">
                <el-input
                    v-model="formData.matchurl"
                    placeholder="请输入报名官网链接"
                    clearable
                    class="styled-input"
                >
                  <template #prepend>
                    https://
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
          </div>

          <!-- 右侧表单区域 -->
          <div class="form-column">
            <el-form-item label="活动说明" prop="description">
              <el-input
                  v-model="formData.acontent"
                  type="textarea"
                  :rows="6"
                  placeholder="请详细描述活动内容、规则、注意事项等信息"
                  clearable
                  class="styled-textarea"
              />
            </el-form-item>

            <br>

            <el-form-item label="活动图片" prop="description">
            <div class="form-card">

              <el-upload
                  action="http://localhost:9090/files/upload"
                  :show-file-list="false"
                  :on-success="handleImageSuccess"
              >
                <div v-if="formData.image" class="upload-area image-preview" >
                  <img :src="formData.image" class="cover" style="margin-left: 50px; width: 500px;height: 300px" />
                </div>
                <div v-else class="upload-area" style="margin-left: 50px; width: 500px;height: 300px">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-text">上传封面图片</div>
                  <div class="upload-info">推荐尺寸: 1920×1080, 支持JPG/PNG格式</div>
                </div>
              </el-upload>
            </div>
          </el-form-item>
            <div class="submit-section">
              <button class="submit-button" @click="validateAndSubmit">
                <el-icon class="button-icon"><Promotion /></el-icon>
                发布活动
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import {Promotion, Tickets, Location, Plus} from '@element-plus/icons-vue';
import {ElMessage} from "element-plus";
import request from "@/utils/request.js";

// 表单数据
const formData = reactive({

});



// 分类选项
const categories = [
  "马拉松", "徒步", "自行车", "登高赛", "骑行","其他"
];

// 图片预览
const formRef = ref(null); // 添加表单引用


// 提交表单
const validateAndSubmit = async () => {
  request.post("eventshare/insertevent",formData).then((res)=>{
    if(res.code === "200"){
      ElMessage.success("保存成功")
      window.location.href="/eventUpload"
    }else{
      ElMessage.error(res.msg)
    }
  })
};

// 处理图片上传成功
const handleImageSuccess = (res) => {
  formData.image = res.data
  ElMessage.success('图片上传成功')
}

</script>

<style scoped>
/* 图片上传区域 */
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
/* 表单卡片通用样式 */
.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 25px;
  border: 1px solid #eee;
  transition: all 0.3s ease;
  overflow: hidden;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.form-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(39, 174, 96, 0.25);
}

.section-title {
  height: 40px;
  font-size: 1.15rem;
  color: #27AE60;
  font-weight: 600;
  margin-bottom: 18px;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  height: 20px;
  width: 4px;
  background: #27AE60;
  border-radius: 2px;
}

.fullscreen-publish-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f9f0 0%, #e0f0e8 100%);
  overflow: hidden;
  position: relative;
}

.publish-card {
  width: 90vw;
  height: 85vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  z-index: 10;
  display: flex;
  border: 1px solid #e0f0e0;
}

.card-content {
  flex: 1;
  padding: 40px;
  position: relative;
  z-index: 4;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  height: 100%;
}

.form-column {
  display: flex;
  flex-direction: column;
  background: rgba(245, 255, 245, 0.3);
  padding: 25px;
  border-radius: 12px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.form-header {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0f0e0;
}

.form-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e7e34;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-icon {
  color: #28a745;
  font-size: 2.2rem;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 600;
  color: #2c3e50;
  padding-bottom: 8px;
  font-size: 1rem;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.styled-input, .styled-datepicker, .styled-timepicker {
  border-radius: 10px;
  border: 1px solid #d0e0d0;
  transition: all 0.3s ease;
  height: 46px;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
}

.styled-input:hover, .styled-datepicker:hover, .styled-timepicker:hover {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.15);
}

.styled-input:focus, .styled-datepicker:focus, .styled-timepicker:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
}

.styled-textarea {
  border-radius: 10px;
  border: 1px solid #d0e0d0;
  transition: all 0.3s ease;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
}

.styled-textarea:hover {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.15);
}

.styled-textarea:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
}

.styled-select {
  width: 100%;
}

.styled-select .el-select__wrapper {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #d0e0d0;
  height: 46px;
  padding: 0 12px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.styled-select .el-select__wrapper:hover {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.15);
}

.styled-select .el-select__wrapper:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
}

.styled-select .el-select__selection {
  width: 100%;
}

.styled-select .el-select__popper {
  width: 100%;
  min-width: 100%;
}

.styled-select .el-select-dropdown {
  width: 100%;
  min-width: 100%;
  border-radius: 10px;
  border: 1px solid #d0e0d0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.image-upload-container {
  width: 100%;
  height: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
}

.upload-area {
  width: 100%;
  height: 100%;
  max-width: 100%;
  border: 2px dashed #c0d8c0;
  border-radius: 10px;
  padding: 25px;
  text-align: center;
  background: rgba(248, 255, 248, 0.7);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.upload-area:hover {
  border-color: #28a745;
  background: rgba(232, 255, 232, 0.7);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.upload-icon {
  font-size: 3.2rem;
  color: #28a745;
  margin-bottom: 15px;
  transition: transform 0.3s ease;
}

.upload-area:hover .upload-icon {
  transform: scale(1.1);
}

.upload-text {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 5px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.upload-area:hover .upload-text {
  color: #28a745;
}

.upload-hint {
  font-size: 0.95rem;
  color: #7f8c8d;
  transition: color 0.3s ease;
}

.upload-area:hover .upload-hint {
  color: #555;
}

.image-preview {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.submit-section {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.submit-button {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  border: none;
  padding: 15px 55px;
  font-size: 1.3rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.submit-button:hover::before {
  transform: translateX(100%);
}

.submit-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(40, 167, 69, 0.6);
}

.button-icon {
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.submit-button:hover .button-icon {
  transform: translateX(5px);
}
</style>