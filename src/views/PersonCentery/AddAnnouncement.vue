<template>
  <section class="add-announcement-container">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-actions">
        <el-button class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
      </div>
      <div class="header-bg">
        <img :src="bgImageUrl" alt="背景图片" class="header-img" />
      </div>
      <div class="header-content">
        <h1 class="page-title">添加公告</h1><!--{{uploadedImages}}-->
        <p class="page-subtitle">发布新的健康运动公告</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <section class="content-background">
      <div class="add-announcement-content">
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <h3>公告信息</h3>
            </div>
          </template>
          <!-- 表格-->
          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="announcement-form">
            <!-- 公告标题-->
            <el-form-item label="公告标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入公告标题" maxlength="100" show-word-limit/>
            </el-form-item>
            <!-- 公告分类-->
            <el-form-item label="公告分类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择分类" class="category-select">
                <el-option v-for="category in announcementCategories" :key="category.id" :label="category.name" :value="category.id"/>
              </el-select>
            </el-form-item>
            <!-- 公告的简化内容-->
            <el-form-item label="简化内容" prop="content">
              <el-input v-model="formData.content" type="textarea" :rows="6" placeholder="请输入公告内容" maxlength="500" show-word-limit/>
            </el-form-item>
            <!-- 公告的详细内容-->
            <el-form-item label="详细内容" prop="details">
              <el-input v-model="formData.details" type="textarea" :rows="8" placeholder="请输入详细内容（可选）" maxlength="1000" show-word-limit/>
            </el-form-item>
            <!-- 公告的标签-->
            <el-form-item label="标签设置">
              <div class="tags-container">
                <el-tag v-for="tag in formData.tags" :key="tag" closable class="tag-item" @close="removeTag(tag)">{{ tag }}</el-tag>
                <el-input v-if="inputVisible" ref="inputRef" v-model="inputValue" class="tag-input" size="small" @keyup.enter="handleInputConfirm" @blur="handleInputConfirm"/>
                <el-button v-else class="add-tag-btn" size="small" @click="showInput">+ 添加标签
                </el-button>
              </div>
            </el-form-item>
            <!-- 是否特殊公告-->
            <el-form-item label="特殊公告">
              <el-switch v-model="formData.isSpecial" :active-value="1" :inactive-value="0" active-text="设为特殊公告" inactive-text="普通公告"/>
            </el-form-item>

            <el-form-item label="图片上传">
              <!-- 多图片上传组件 -->
              <div class="upload-section">
                <el-upload
                    action=""
                    list-type="picture-card"
                    :auto-upload="false"
                    :file-list="fileList"
                    :on-change="handleFileChange"
                    :on-remove="handleFileRemove"
                    :on-exceed="handleExceed"
                    :limit="maxFiles"
                    accept="image/*"
                    multiple
                    ref="uploadRef"
                >
                  <el-icon><Plus /></el-icon>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持上传最多 {{ maxFiles }} 张图片，单张图片不超过 2MB
                    </div>
                  </template>
                </el-upload>

                <!-- 清空图片列表按钮 -->
                <div class="upload-actions">
                  <el-button @click="handleClearFiles">清空列表</el-button>
                </div>
              </div>
            </el-form-item>

            <el-form-item>
              <div class="form-actions">
                <el-button type="primary" @click="submitForm" :loading="loading">
                  发布公告
                </el-button>
                <el-button @click="resetForm">重置</el-button>
                <el-button @click="goBack">取消</el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Delete } from '@element-plus/icons-vue'
import request from "@/utils/request.js";

const router = useRouter()

// 响应式数据
const bgImageUrl = ref('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')

// 表单数据
const formData = reactive({title: '', category: '',
  content: '',
  details: '',
  tags: [],
  isSpecial: 0,
  images: []
})

// 文件上传相关
const fileList = ref([])
const uploadedImages = ref([])
const maxFiles = 10
const uploadRef = ref()

// 表单引用
const formRef = ref(null)
const inputRef = ref(null)

// 标签输入相关
const inputVisible = ref(false)  // 是否显示标签输入框
const inputValue = ref('')

// 加载状态
const loading = ref(false)

// 公告分类
const announcementCategories = ref([
  { id: 'activity', name: '活动通知' },
  { id: 'health', name: '健康讲座' },
  { id: 'system', name: '系统公告' }
])

// 表单验证规则
const formRules = reactive({
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择公告分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 10, max: 500, message: '内容长度在 10 到 500 个字符', trigger: 'blur' }
  ]
})

// 方法
const goBack = () => {
  router.back()
}

// 标签操作
const removeTag = (tag) => {
  formData.tags = formData.tags.filter(t => t !== tag)
}

//显示标签输入框
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}
// 输入标签完成
const handleInputConfirm = () => {
  if (inputValue.value && inputValue.value.trim()) {
    const newTag = inputValue.value.trim()
    if (!formData.tags.includes(newTag)) {
      formData.tags.push(newTag)
    }
    inputValue.value = ''
  }
  inputVisible.value = false
}

// 文件上传操作
const handleFileChange = (file, files) => {
  // 验证文件大小（2MB）
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    fileList.value = fileList.value.filter(item => item.uid !== file.uid)
    return
  }

  fileList.value = files
}

const handleFileRemove = (file, files) => {
  fileList.value = files
}

const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${maxFiles} 张图片`)
}

// 清空图片列表
const handleClearFiles = () => {
  if (fileList.value.length === 0) {
    ElMessage.info('列表已为空')
    return
  }

  ElMessageBox.confirm('确定要清空所有图片吗？', '提示', {
    type: 'warning'
  }).then(() => {
    fileList.value = []
    ElMessage.success('已清空图片列表')
  })
}

// 上传图片到服务器
const handleUploadImagesWithFetch = async () => {
  try {
    // 创建 FormData 对象, 将文件添加到里面
    const formData = new FormData()
    //文件数据放进formData
    fileList.value.forEach(file => {
      if (file.raw) {
        formData.append('files', file.raw)
      }
    })
    // 发送请求
    const response = await fetch('http://localhost:9090/files/uploadMultiple', {
      method: 'POST', body: formData
    })

    const result = await response.json()

    if (result.code === "200") {
      const successUrls = result.data || []
      uploadedImages.value = [...uploadedImages.value, ...successUrls]
      fileList.value = []
    } else {
      ElMessage.error(result.msg || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败: ' + (error.message || '未知错误'))
  }
}

// 提交表单
const submitForm = async () => {
  if(!formRef.value) return ;
  try {
    await formRef.value.validate()
    if(fileList.length !== 0){ await handleUploadImagesWithFetch()}  //上传图片列表

    loading.value = true

    // 添加的公告数据
    const submitData = {
      title: formData.title,
      category: formData.category,
      content: formData.content,
      contents: formData.details,
      tags: formData.tags.join(','),
      isSpecial: formData.isSpecial ? 1 : 0,
      images: uploadedImages.value.join(','),
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      pageView: 0
    }

    const response = await request.post('/announcement/insert', submitData)

    if (response.code === "200") {
      ElMessage.success('公告发布成功！')
      await router.push('/announcement')
    } else {
      ElMessage.error(response.msg || '发布失败')
    }

  } catch (error) {
    ElMessage.error('发布失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    formData.tags = []
    fileList.value = []
    uploadedImages.value = []
    inputValue.value = ''
    inputVisible.value = false
  }
}

// 组件挂载时初始化
onMounted(() => {
  window.scrollTo(0,0)
})
</script>

<style scoped>
.add-announcement-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f7f0 0%, #e8f5e9 50%, #f0f7f0 100%);
}

.page-header {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.header-content {
  position: relative;
  z-index: 2;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-actions {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  justify-content: space-between;
  z-index: 3;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.page-title {
  font-size: 3rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.page-subtitle {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
}

.content-background {
  padding: 40px 0;
}

.add-announcement-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.form-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8f5e9;
}

.card-header h3 {
  margin: 0;
  color: #2e7d32;
  font-size: 1.3rem;
  font-weight: 600;
}

.announcement-form {
  padding: 20px;
}

.category-select {
  width: 100%;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tag-item {
  background: #f1f8e9;
  color: #2e7d32;
  border: 1px solid rgba(76, 175, 80, 0.2);
  margin-right: 8px;
}

.tag-input {
  width: 100px;
}

.add-tag-btn {
  background: #f1f8e9;
  color: #2e7d32;
  border: 1px dashed #4CAF50;
}

.add-tag-btn:hover {
  background: #e8f5e9;
  border-color: #2E7D32;
}

/* 上传区域样式 */
.upload-section {
  width: 100%;
}

.upload-actions {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.upload-result {
  margin-top: 20px;
  padding: 20px;
  background: #f8fff8;
  border-radius: 8px;
  border: 1px solid #e8f5e9;
}

.upload-result h4 {
  margin: 0 0 15px 0;
  color: #2e7d32;
  font-size: 1.1rem;
}

.image-preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.image-preview-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-preview-item:hover {
  transform: translateY(-2px);
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 5px;
  right: 5px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    height: 200px;
  }

  .page-title {
    font-size: 2rem;
  }

  .announcement-form {
    padding: 15px;
  }

  .form-actions {
    flex-direction: column;
  }

  .upload-actions {
    flex-direction: column;
  }

  .image-preview-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>