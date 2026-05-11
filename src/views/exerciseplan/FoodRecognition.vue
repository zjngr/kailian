<template>
  <div class="food-recognition">
    <!-- ===== Left Panel: Image / Upload ===== -->
    <div class="left-panel">
      <div class="left-inner">
        <!-- Header -->
        <div class="panel-header">
          <button class="header-back" @click="goBack">
            <el-icon :size="20"><ArrowLeft /></el-icon>
          </button>
          <div class="header-title-area">
            <h1 class="header-title">AI 智能识餐</h1>
            <p class="header-sub">拍照识别食物 · 分析营养结构</p>
          </div>
        </div>

        <!-- Upload zone (shown when no result or no image) -->
        <div class="upload-area" v-if="!result">
          <div
            class="drop-zone"
            :class="{ 'drag-over': isDragOver, 'has-image': previewUrl }"
            @click="triggerUpload"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
          >
            <input type="file" ref="fileInput" accept="image/*" class="hidden-input" @change="handleFileSelect" />
            <div v-if="!previewUrl" class="upload-placeholder">
              <div class="upload-icon-wrap">
                <el-icon :size="52"><Camera /></el-icon>
              </div>
              <p class="upload-title">点击上传食物照片</p>
              <p class="upload-hint">或拖拽图片到此处 · 支持 JPG / PNG</p>
            </div>
            <div v-else class="preview-wrap">
              <img :src="previewUrl" class="preview-img" alt="食物预览" />
              <div class="preview-overlay">
                <el-icon :size="28"><ZoomIn /></el-icon>
                <span>点击重新选择</span>
              </div>
            </div>
          </div>

          <!-- Food name input & buttons (before analysis) -->
          <template v-if="previewUrl">
            <div class="food-name-row">
              <el-icon :size="18"><EditPen /></el-icon>
              <input v-model="foodNameInput" class="food-name-input" placeholder="输入食物名称（可选）" maxlength="30" />
            </div>
            <div class="action-row">
              <button class="btn btn-outline" @click="resetUpload">
                <el-icon><Refresh /></el-icon> 重新选择
              </button>
              <button class="btn btn-primary" @click="startAnalysis">
                <el-icon><MagicStick /></el-icon> AI智能识别
              </button>
            </div>
          </template>
        </div>

        <!-- Result image preview (shown when result exists) -->
        <div class="result-image-area" v-if="result">
          <div class="result-img-card">
            <img :src="result.imageUrl || previewUrl" class="result-img" alt="食物图片" />
            <div class="result-img-badge">
              <el-icon :size="14"><Select /></el-icon> AI识别完成
            </div>
          </div>
          <div class="result-img-footer">
            <div class="result-food-icon">
              <el-icon :size="24"><Chicken /></el-icon>
            </div>
            <div class="result-food-info">
              <h2 class="result-food-name">{{ result.name }}</h2>
              <span class="result-food-tag">AI 智能识别</span>
            </div>
            <div class="result-calorie">
              <span class="result-cal-value">{{ result.calories }}</span>
              <span class="result-cal-unit">kcal</span>
            </div>
          </div>

          <!-- Quick actions below image -->
          <div class="result-quick-actions">
            <button class="btn btn-outline btn-sm" @click="resetAll">
              <el-icon><Refresh /></el-icon> 重新识别
            </button>
            <button class="btn btn-ghost btn-sm" @click="goBack">
              <el-icon><Back /></el-icon> 返回计划
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Right Panel: Data / Results ===== -->
    <div class="right-panel">
      <!-- Loading state -->
      <div class="loading-section" v-if="loading">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">{{ loadingText }}</p>
        <div class="loading-steps">
          <div class="loading-step" :class="{ done: loadingStep >= 1 }">
            <span class="step-indicator"></span><span>图像预处理</span>
          </div>
          <div class="loading-step" :class="{ done: loadingStep >= 2 }">
            <span class="step-indicator"></span><span>AI 食物识别</span>
          </div>
          <div class="loading-step" :class="{ done: loadingStep >= 3 }">
            <span class="step-indicator"></span><span>营养数据库匹配</span>
          </div>
          <div class="loading-step" :class="{ done: loadingStep >= 4 }">
            <span class="step-indicator"></span><span>生成评估报告</span>
          </div>
        </div>
      </div>

      <!-- Right placeholder (initial state) -->
      <div class="right-placeholder" v-if="!loading && !result">
        <div class="placeholder-icon">
          <el-icon :size="64"><Food /></el-icon>
        </div>
        <h3 class="placeholder-title">上传食物照片开始分析</h3>
        <p class="placeholder-desc">AI 将自动识别食物并分析热量、蛋白质、<br>碳水化合物、脂肪等营养成分</p>
        <div class="placeholder-features">
          <div class="placeholder-feat"><el-icon :size="16"><MagicStick /></el-icon> 智能识别食物种类</div>
          <div class="placeholder-feat"><el-icon :size="16"><DataAnalysis /></el-icon> 详细营养结构分析</div>
          <div class="placeholder-feat"><el-icon :size="16"><ChatLineSquare /></el-icon> 个性化饮食建议</div>
        </div>
      </div>

      <!-- Result content -->
      <div class="right-content" v-if="result && !loading">
        <!-- Nutrition breakdown -->
        <div class="section-card">
          <div class="section-card-header">
            <el-icon :size="20"><DataAnalysis /></el-icon>
            <span>营养结构分析</span>
          </div>
          <div class="nutri-list">
            <div class="nutri-item" v-for="n in nutritionData" :key="n.key">
              <div class="nutri-top">
                <span class="nutri-label">{{ n.label }}</span>
                <span class="nutri-val">{{ n.value }}g</span>
              </div>
              <div class="nutri-track">
                <div class="nutri-fill" :style="{ width: n.percent + '%', background: n.color }"></div>
              </div>
              <div class="nutri-bottom">
                <span class="nutri-pct">{{ n.percent }}%</span>
                <span class="nutri-rec" v-if="n.dailyPercent">推荐 {{ n.dailyPercent }}g/日</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Source distribution -->
        <div class="section-card">
          <div class="section-card-header">
            <el-icon :size="20"><PieChart /></el-icon>
            <span>热量来源分布</span>
          </div>
          <div class="distrib-row">
            <div class="distrib-bar" v-for="d in distribData" :key="d.key">
              <div class="distrib-bar-fill" :style="{ width: d.percent + '%', background: d.color }"></div>
            </div>
          </div>
          <div class="distrib-legend">
            <div class="distrib-item" v-for="d in distribData" :key="d.key">
              <span class="distrib-dot" :style="{ background: d.color }"></span>
              <span class="distrib-name">{{ d.label }}</span>
              <span class="distrib-val">{{ d.kcal }}kcal</span>
              <span class="distrib-pct">{{ d.percent }}%</span>
            </div>
          </div>
        </div>

        <!-- Health score + Suggestion side by side -->
        <div class="section-card health-card">
          <div class="health-row">
            <div class="health-ring-wrap">
              <svg class="health-ring" viewBox="0 0 120 120" width="110" height="110">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#ecf0f1" stroke-width="8" />
                <circle cx="60" cy="60" r="52" fill="none" :stroke="healthColor" stroke-width="8"
                  stroke-linecap="round" :stroke-dasharray="circumference"
                  :stroke-dashoffset="healthOffset" transform="rotate(-90 60 60)" class="health-ring-fill" />
              </svg>
              <div class="health-ring-center">
                <span class="health-ring-val" :style="{ color: healthColor }">{{ result.healthScore }}</span>
              </div>
            </div>
            <div class="health-info">
              <div class="health-label" :style="{ color: healthColor }">{{ healthLabel }}</div>
              <p class="health-desc">{{ healthDesc }}</p>
            </div>
          </div>
        </div>

        <div class="section-card suggestion-card">
          <div class="section-card-header">
            <el-icon :size="20"><ChatLineSquare /></el-icon>
            <span>AI 饮食建议</span>
          </div>
          <div class="suggestion-body">
            <div class="suggestion-icon">
              <el-icon :size="24"><MagicStick /></el-icon>
            </div>
            <p class="suggestion-text">{{ result.suggestion }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request.js'

const router = useRouter()
const goBack = () => router.push('/exercisePlan')

// File state
const fileInput = ref(null)
const previewUrl = ref('')
const isDragOver = ref(false)
const foodNameInput = ref('')
const uploadedFile = ref(null)

// Analysis state
const loading = ref(false)
const loadingStep = ref(0)
const loadingText = ref('')
const result = ref(null)

// Helper: revoke object URL to prevent memory leaks
const revokePreview = () => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
}
onUnmounted(revokePreview)

// Upload handlers
const triggerUpload = () => fileInput.value?.click()

const handleFileSelect = (e) => {
  const f = e.target.files?.[0]
  if (f) processFile(f)
}

const handleDrop = (e) => {
  isDragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) processFile(f)
}

const processFile = (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过10MB')
    return
  }
  revokePreview()
  previewUrl.value = URL.createObjectURL(file)
  uploadedFile.value = file
  result.value = null
}

const resetUpload = () => {
  revokePreview()
  previewUrl.value = ''
  uploadedFile.value = null
  result.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const resetAll = () => {
  resetUpload()
  foodNameInput.value = ''
}

// Analysis
const startAnalysis = async () => {
  if (!uploadedFile.value) return
  loading.value = true
  loadingStep.value = 0
  result.value = null

  const steps = ['图像预处理…', 'AI 食物识别…', '营养数据库匹配…', '生成评估报告…']
  const timer = setInterval(() => {
    loadingStep.value++
    if (loadingStep.value <= steps.length) {
      loadingText.value = steps[loadingStep.value - 1]
    }
  }, 700)

  loadingText.value = steps[0]

  try {
    const formData = new FormData()
    formData.append('file', uploadedFile.value)
    formData.append('foodName', foodNameInput.value || '')

    const res = await request.post('/api/food-recognize', formData, {
      timeout: 60000
    })

    if (res.code === '200' && res.data) {
      result.value = res.data
    } else {
      ElMessage.error(res.msg || '识别失败，请重试')
    }
  } catch (err) {
    console.error('AI识别失败:', err)
    ElMessage.error('AI识别请求失败，请检查网络或后端服务')
  } finally {
    clearInterval(timer)
    loading.value = false
  }
}

// Computed display data
const nutritionData = computed(() => {
  const r = result.value
  if (!r) return []
  const items = [
    { key: 'protein', label: '蛋白质', value: r.protein || 0, color: 'linear-gradient(135deg, #FF6B35, #E85D26)', dailyPercent: 65 },
    { key: 'carbs', label: '碳水化合物', value: r.carbs || 0, color: 'linear-gradient(135deg, #F9A825, #F57F17)', dailyPercent: 300 },
    { key: 'fat', label: '脂肪', value: r.fat || 0, color: 'linear-gradient(135deg, #00B894, #00A381)', dailyPercent: 60 },
    { key: 'fiber', label: '膳食纤维', value: r.fiber || 0, color: 'linear-gradient(135deg, #55E6C1, #00B894)', dailyPercent: 25 },
  ]
  const total = items.reduce((s, i) => s + i.value, 0) || 1
  return items.map(i => ({ ...i, percent: Math.round((i.value / total) * 100) }))
})

const distribData = computed(() => {
  const r = result.value
  if (!r) return []
  const pCal = (r.protein || 0) * 4
  const cCal = (r.carbs || 0) * 4
  const fCal = (r.fat || 0) * 9
  const total = pCal + cCal + fCal || 1
  return [
    { key: 'protein', label: '蛋白质', kcal: pCal, color: '#FF6B35', percent: Math.round(pCal / total * 100) },
    { key: 'carbs', label: '碳水', kcal: cCal, color: '#F9A825', percent: Math.round(cCal / total * 100) },
    { key: 'fat', label: '脂肪', kcal: fCal, color: '#00B894', percent: Math.round(fCal / total * 100) },
  ]
})

const circumference = 2 * Math.PI * 52
const healthOffset = computed(() => {
  if (!result.value) return circumference
  const pct = (result.value.healthScore || 0) / 100
  return circumference * (1 - pct)
})

const healthColor = computed(() => {
  if (!result.value) return '#95a5a6'
  const s = result.value.healthScore
  if (s >= 85) return '#00B894'
  if (s >= 70) return '#F9A825'
  if (s >= 55) return '#FF6B35'
  return '#E85D26'
})

const healthLabel = computed(() => {
  if (!result.value) return ''
  const s = result.value.healthScore
  if (s >= 85) return '非常健康'
  if (s >= 70) return '较为健康'
  if (s >= 55) return '一般'
  return '建议优化'
})

const healthDesc = computed(() => {
  if (!result.value) return ''
  const s = result.value.healthScore
  if (s >= 85) return '营养结构均衡，热量适中，非常适合日常食用！'
  if (s >= 70) return '整体较为健康，可适当增加蔬菜摄入以完善营养比例。'
  if (s >= 55) return '营养结构有待改善，建议控制油脂和碳水，增加优质蛋白。'
  return '热量偏高或营养失衡，建议减少高油高糖食物，多选择天然食材。'
})
</script>

<style scoped>
/* ========== Root Layout: Left-Right Full Screen ========== */
.food-recognition {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(160deg, #FFF5EE 0%, #F0FFF4 50%, #FFF8F0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ========== Left Panel ========== */
.left-panel {
  width: 42%;
  min-width: 420px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.left-panel::after {
  content: '';
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(255, 107, 53, 0.2), rgba(0, 184, 148, 0.2), transparent);
}

.left-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 28px 36px 24px;
  overflow-y: auto;
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.header-back {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: none;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #2c3e50;
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.1);
  transition: all 0.2s;
  flex-shrink: 0;
}
.header-back:hover {
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.2);
  transform: translateX(-2px);
}

.header-title-area { flex: 1; }
.header-title {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #FF6B35, #00B894);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1.3;
}
.header-sub {
  font-size: 13px;
  color: #95a5a6;
  margin: 2px 0 0;
  letter-spacing: 0.5px;
}

/* ========== Upload Area (Left Panel) ========== */
.upload-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.drop-zone {
  border: 2px dashed rgba(255, 107, 53, 0.3);
  border-radius: 24px;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.35s ease;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.drop-zone:hover {
  border-color: #FF6B35;
  background: rgba(255, 107, 53, 0.05);
  transform: scale(1.008);
  box-shadow: 0 12px 40px rgba(255, 107, 53, 0.12);
}
.drop-zone.drag-over {
  border-color: #00B894;
  background: rgba(0, 184, 148, 0.08);
  transform: scale(1.015);
  box-shadow: 0 0 0 4px rgba(0, 184, 148, 0.12);
}
.drop-zone.has-image {
  border-style: solid;
  border-color: rgba(0, 184, 148, 0.3);
  cursor: pointer;
  padding: 0;
}
.drop-zone.has-image:hover { border-color: #00B894; }

.hidden-input { display: none; }

.upload-placeholder { text-align: center; padding: 36px 20px; }
.upload-icon-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFF0E8, #FF6B35);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  color: #fff;
  box-shadow: 0 8px 28px rgba(255, 107, 53, 0.25);
  transition: transform 0.3s;
}
.drop-zone:hover .upload-icon-wrap { transform: scale(1.08) rotate(-5deg); }
.upload-title { font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 6px; }
.upload-hint { font-size: 13px; color: #95a5a6; }

.preview-wrap { width: 100%; height: 320px; position: relative; }
.preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.preview-overlay {
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; color: #fff; font-size: 14px; font-weight: 500;
  opacity: 0; transition: opacity 0.3s;
}
.preview-wrap:hover .preview-overlay { opacity: 1; }

.food-name-row {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
  border-radius: 14px; padding: 0 16px; margin-top: 16px;
  border: 1px solid rgba(255, 107, 53, 0.15);
  transition: border-color 0.25s; color: #7f8c8d;
}
.food-name-row:focus-within { border-color: #FF6B35; box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1); }
.food-name-input { flex: 1; border: none; outline: none; padding: 14px 0; font-size: 14px; color: #2c3e50; background: transparent; }
.food-name-input::placeholder { color: #b0bec5; }

.action-row { display: flex; gap: 12px; margin-top: 18px; justify-content: center; }

/* ========== Buttons ========== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-sm { padding: 9px 20px; font-size: 13px; }

.btn-primary {
  background: linear-gradient(135deg, #FF6B35, #F57F17);
  color: #fff;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.35);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255, 107, 53, 0.5); }
.btn-primary:active { transform: translateY(0); }

.btn-outline {
  background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
  color: #2c3e50; border: 1px solid rgba(255, 107, 53, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.btn-outline:hover { background: #fff; border-color: #FF6B35; box-shadow: 0 4px 16px rgba(255, 107, 53, 0.15); }

.btn-ghost {
  background: transparent; color: #7f8c8d; border: 1px solid rgba(0, 0, 0, 0.08);
}
.btn-ghost:hover { background: rgba(255, 107, 53, 0.06); color: #FF6B35; border-color: rgba(255, 107, 53, 0.2); }

/* ========== Result Image (Left Panel) ========== */
.result-image-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.result-img-card {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.12);
  max-height: 360px;
}
.result-img { width: 100%; height: 100%; max-height: 360px; object-fit: cover; display: block; }
.result-img-badge {
  position: absolute; top: 14px; right: 14px;
  background: linear-gradient(135deg, #FF6B35, #E85D26);
  color: #fff; font-size: 12px; font-weight: 600;
  padding: 5px 14px; border-radius: 20px;
  display: flex; align-items: center; gap: 4px;
  backdrop-filter: blur(6px); box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.result-img-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 107, 53, 0.08);
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.06);
}
.result-food-icon {
  width: 44px; height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #FFF0E8, #FF6B35);
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.25);
}
.result-food-info { flex: 1; }
.result-food-name { font-size: 20px; font-weight: 800; color: #1a1a2e; margin: 0 0 3px; }
.result-food-tag {
  font-size: 11px; color: #00B894;
  background: rgba(0, 184, 148, 0.1);
  padding: 2px 10px; border-radius: 20px; font-weight: 600;
}
.result-calorie { text-align: right; }
.result-cal-value {
  font-size: 30px; font-weight: 800;
  background: linear-gradient(135deg, #FF6B35, #E85D26);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.result-cal-unit { display: block; font-size: 11px; color: #95a5a6; margin-top: 2px; }

.result-quick-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* ========== Right Panel ========== */
.right-panel {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  padding: 28px 40px 32px;
  display: flex;
  flex-direction: column;
}

/* Placeholder (initial state) */
.right-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
}
.placeholder-icon {
  width: 100px; height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(0, 184, 148, 0.1));
  display: flex; align-items: center; justify-content: center;
  color: #FF6B35;
  margin-bottom: 8px;
}
.placeholder-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0; }
.placeholder-desc { font-size: 14px; color: #95a5a6; line-height: 1.6; margin: 0; }
.placeholder-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}
.placeholder-feat {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #7f8c8d;
  background: rgba(255,255,255,0.6);
  padding: 10px 18px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

/* ========== Loading (Right Panel) ========== */
.loading-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.spinner-ring {
  width: 48px; height: 48px;
  border: 3px solid rgba(255, 107, 53, 0.15);
  border-top-color: #FF6B35;
  border-right-color: #00B894;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.loading-text {
  font-size: 18px; font-weight: 700;
  background: linear-gradient(135deg, #FF6B35, #00B894);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.loading-steps {
  display: flex; flex-direction: column; gap: 14px;
  text-align: left; min-width: 220px;
}
.loading-step {
  display: flex; align-items: center; gap: 12px;
  font-size: 15px; color: #b0bec5; transition: all 0.35s;
}
.loading-step.done { color: #2c3e50; }
.step-indicator {
  width: 12px; height: 12px; border-radius: 50%;
  background: #e0e0e0; transition: all 0.35s; flex-shrink: 0;
}
.loading-step.done .step-indicator {
  background: #00B894;
  box-shadow: 0 0 12px rgba(0, 184, 148, 0.5);
}

/* ========== Right Content (Results) ========== */
.right-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fadeUp 0.5s ease-out;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Section card */
.section-card {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(8px);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.06);
  border: 1px solid rgba(255, 107, 53, 0.06);
}
.section-card-header {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 700; color: #1a1a2e;
  margin-bottom: 16px;
}

/* Nutrition */
.nutri-list { display: flex; flex-direction: column; gap: 14px; }
.nutri-top { display: flex; justify-content: space-between; margin-bottom: 6px; }
.nutri-label { font-size: 14px; font-weight: 600; color: #2c3e50; }
.nutri-val { font-size: 14px; font-weight: 700; color: #1a1a2e; }
.nutri-track { height: 8px; background: rgba(0, 0, 0, 0.06); border-radius: 4px; overflow: hidden; }
.nutri-fill { height: 100%; border-radius: 4px; transition: width 1s ease-out; }
.nutri-bottom { display: flex; justify-content: space-between; margin-top: 4px; }
.nutri-pct { font-size: 11px; color: #95a5a6; }
.nutri-rec { font-size: 11px; color: #b0bec5; }

/* Distribution */
.distrib-row {
  display: flex; height: 10px; border-radius: 5px;
  overflow: hidden; gap: 2px; margin-bottom: 14px;
}
.distrib-bar { height: 100%; border-radius: 5px; transition: width 1s ease-out; }
.distrib-bar-fill { height: 100%; border-radius: 5px; }
.distrib-legend { display: flex; justify-content: space-around; }
.distrib-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #7f8c8d;
}
.distrib-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.distrib-name { font-weight: 600; color: #2c3e50; }
.distrib-val { color: #95a5a6; }
.distrib-pct { color: #b0bec5; min-width: 30px; text-align: right; }

/* Health score */
.health-row { display: flex; align-items: center; gap: 18px; }
.health-ring-wrap {
  position: relative; width: 110px; height: 110px; flex-shrink: 0;
}
.health-ring { width: 100%; height: 100%; }
.health-ring-fill { transition: stroke-dashoffset 1.2s ease-out; filter: drop-shadow(0 0 6px currentColor); }
.health-ring-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.health-ring-val { font-size: 30px; font-weight: 800; line-height: 1; }
.health-info { flex: 1; }
.health-label { font-size: 20px; font-weight: 800; margin-bottom: 4px; transition: color 0.5s; }
.health-desc { font-size: 13px; color: #7f8c8d; line-height: 1.6; margin: 0; }

/* Suggestion */
.suggestion-body {
  display: flex; gap: 14px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(0, 184, 148, 0.05));
  border-radius: 14px; padding: 16px;
  border-left: 4px solid #FF6B35;
}
.suggestion-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(135deg, #FFF0E8, #FF6B35);
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
}
.suggestion-text { font-size: 14px; color: #444; line-height: 1.7; margin: 0; }
</style>
