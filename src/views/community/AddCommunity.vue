<template>
  <div class="publish-container">
    <!-- 顶部操作栏 -->
    <div class="btn-group">
      <button class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon> 返回
      </button>
      <button class="save-btn" @click="savePost">
        <el-icon><Check /></el-icon> 发布
      </button>
    </div>

    <!-- 主体栅格 -->
    <div class="content-grid">
      <!-- 左侧信息 -->
      <div class="left-column">
        <!-- 标题 -->
        <div class="form-card">
          <div class="section-title">帖子标题</div>
          <input v-model="form.title" class="title-input" placeholder="给帖子起个响亮的标题" />
        </div>


        <!-- 发帖时间 -->
        <div class="form-card">
          <div class="section-title">发帖时间</div>
          <el-date-picker
              v-model="form.time"
              type="datetime"
              placeholder="选择日期时间"
              class="picker"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </div>

        <!-- 运动类型 -->
        <div class="form-card">
          <div class="section-title">运动类型</div>
          <el-select 
            v-model="form.sportType" 
            placeholder="请选择运动类型" 
            class="sport-type-select"
          >
            <el-option 
              v-for="sport in sportTypes" 
              :key="sport.name" 
              :label="sport.name" 
              :value="sport.name"
            />
          </el-select>
        </div>

        <!-- 运动数据 -->
        <div class="form-card">
          <div class="section-title">运动数据</div>
          <div class="sport-data-grid">
            <div class="sport-data-item">
              <label>时长 (分钟)</label>
              <el-input-number 
                v-model="form.sporttime"
                :min="0" 
                class="sport-data-input"
                placeholder="运动时长"
              />
            </div>
            <div class="sport-data-item">
              <label>消耗 (卡路里)</label>
              <el-input-number 
                v-model="form.calorie"
                :min="0" 
                class="sport-data-input"
                placeholder="消耗卡路里"
              />
            </div>
          </div>
        </div>

        <!-- 封面 -->
        <div class="form-card">
          <div class="section-title">封面</div>
          <el-upload
              action="http://localhost:9090/files/upload"
              :show-file-list="false"
              :on-success="handleCoverSuccess"
          >
            <div v-if="form.images" class="upload-area image-preview">
              <img :src="form.images" class="cover" />
            </div>
            <div v-else class="upload-area">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">上传封面图片</div>
              <div class="upload-info">推荐尺寸: 1920×1080, 支持JPG/PNG格式</div>
            </div>
          </el-upload>
        </div>
      </div>

      <!-- 右侧富文本 -->
      <div class="right-column">
        <div class="form-card editor-section">
          <div class="section-title">正文内容</div>
          <Toolbar class="toolbar" :editor="editorRef" :mode="mode" />
          <Editor
              v-model="form.contents"
              :mode="mode"
              :defaultConfig="editorConfig"
              @onCreated="handleCreated"
              class="editor"
          />
        </div>
        
        <!-- 简介 -->
        <div class="form-card">
          <div class="section-title">简介</div>
          <textarea v-model="form.content" class="description-input" placeholder="一句话介绍帖子亮点"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onBeforeUnmount, shallowRef } from 'vue'
import { ArrowLeft, Check, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElInputNumber } from 'element-plus'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { useRouter } from 'vue-router'
import request from "@/utils/request.js";

/* ---------- wangeditor ---------- */
const editorRef = shallowRef()
const mode = 'default'
const router = useRouter()

const handleCreated = (editor) => (editorRef.value = editor)
onBeforeUnmount(() => editorRef.value?.destroy())

/* ---------- 表单 ---------- */
const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
});

const form = reactive({
  sid: data.user.id,  // 作者id
  time: '',       // 发布时间
  title: '',      // 帖子标题
  content: '',    // 帖子简述
  contents: '',   // 帖子的内容
  images: '',     // 展示图片地址
  likes: 0,     // 展示帖子的获赞数
  comments: 0,     // 展示帖子的获得评论数
  sportType: '',  // 运动类型
  sporttime: '', // 运动时长
  calorie: '', // 消耗卡路里
  isLiked: 0, //
})

// 工具：去除 <p> </p> 标签
const stripPTags = (html) => html.replace(/<\/?p[^>]*>/g, '');

// 运动类型列表
const sportTypes = ref([
  { name: '跑步' }, { name: '游泳' }, { name: '骑行' },
  { name: '瑜伽' }, { name: '健身' }, { name: '篮球' },
  { name: '足球' }, { name: '网球' }, { name: '羽毛球' }
])

//图片上传成功处理
const handleCoverSuccess = (res) => (form.images = res.data)

//返回方法
const goBack = () => {
  router.push('/community')
}

//加入新的帖子
const savePost = async () => {
  if (!form.title.trim()) return ElMessage.warning('标题不能为空')
  if (!form.content.trim()) return ElMessage.warning('简介不能为空')
  if (!form.contents.trim()) return ElMessage.warning('内容不能为空')
  if (!form.time) return ElMessage.warning('发布时间不能为空')
  if (!form.sporttime) return ElMessage.warning('消耗时间不能为空')
  if (!form.calorie) return ElMessage.warning('消耗的卡路里不能为空')
  if (!form.sportType) return ElMessage.warning('请选择运动类型')
  form.contents = stripPTags(form.contents)
try{
  request.post('posts/insert',form).then(res => {
    if (res.code === '200') {
      data.user.posts+=1;
      request.put("user/update",data.user)
      ElMessage.success('帖子发布成功');
      setTimeout(() => {
        window.location.href = '/community';
      }, 500);
    } else {
      ElMessage.error(res.msg || '帖子发布失败');
    }
  })
} catch (error) {
  ElMessage.error('请求失败: ' + error.message);
}
}

//富文本配置
const editorConfig = {
  placeholder: '请输入帖子内容...',
  MENU_CONF: {}
}


</script>

<style scoped>
.publish-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  padding: 30px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 按钮区域样式 */
.btn-group {
  display: flex;
  margin-bottom: 10px;
  gap: 15px;
}

.save-btn {
  background: linear-gradient(135deg, #27AE60, #66bb6a);
  border: none;
  color: white;
  padding: 12px 36px;
  font-weight: 500;
  border-radius: 10px;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.save-btn:hover {
  background: linear-gradient(135deg, #219653, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(39, 174, 96, 0.4);
}

.back-btn {
  color: #27AE60;
  background: #fff;
  border: 1px solid #27AE60;
  padding: 12px 28px;
  font-weight: 500;
  border-radius: 10px;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: #f0f9f0;
  transform: translateY(-2px);
}

/* 主体内容区样式 */
.content-grid {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 25px;
  min-height: calc(100vh - 180px);
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.right-column {
  height: fit-content;
  min-height: 100%;
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

/* 标题输入区域 */
.title-input {
  border: 2px solid #e0e0e0;
  font-size: 1.1rem;
  padding: 12px 15px;
  color: #333;
  font-weight: 500;
  width: 100%;
  outline: none;
  transition: all 0.3s ease;
  border-radius: 10px;
  box-sizing: border-box;
}

.title-input:focus {
  border-color: #a5d6a7;
  box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2);
}

.title-input::placeholder {
  color: #ccc;
}

/* 运动类型选择器 */
.sport-type-select {
  width: 100%;
}

/* 运动数据网格 */
.sport-data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.sport-data-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sport-data-item label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.sport-data-input {
  width: 100%;
}

/* 描述输入区域 */
.description-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  resize: none;
  transition: all 0.3s ease;
  line-height: 1.6;
  min-height: 200px;
  box-sizing: border-box;
}

.description-input:focus {
  border-color: #a5d6a7;
  box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2);
  outline: none;
}

/* 日期选择器 */
.picker {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
}


.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 30px;
  text-align: center;
  height: 100%;
  width: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
  box-sizing: border-box;
}

.upload-area:hover {
  border-color: #a5d6a7;
  background-color: #f0f9f0;
}

.image-preview {
  padding: 0;
  height: auto;
}

.cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.upload-icon {
  font-size: 45px;
  color: #27AE60;
  margin-bottom: 12px;
}

.upload-text {
  color: #27AE60;
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 8px;
}

.upload-info {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
  line-height: 1.4;
}

/* 富文本区域 */
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.toolbar {
  border-bottom: 1px solid #e0e0e0;
  border-radius: 12px 12px 0 0;
}

.editor {
  flex: 1;
  border-radius: 0 0 12px 12px;
  min-height: 500px;
}

/* 响应式布局优化 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 45% 55%;
  }
  
  .sport-data-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .editor-section {
    height: auto;
  }

  .editor {
    min-height: 500px;
  }

  .publish-container {
    padding: 15px;
  }
  
  .sport-data-grid {
    grid-template-columns: 1fr;
  }
}
</style>