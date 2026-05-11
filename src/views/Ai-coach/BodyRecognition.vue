<template>
  <div class="body-recognition">
    <!-- ===== Left Panel: Camera / Image ===== -->
    <div class="left-panel">
      <div class="left-inner">
        <!-- Header -->
        <div class="panel-header">
          <button class="header-back" @click="goBack">
            <el-icon :size="20"><ArrowLeft /></el-icon>
          </button>
          <div class="header-title-area">
            <h1 class="header-title">AI 体态识别</h1>
            <p class="header-sub">实时分析 · 智能评估</p>
          </div>
        </div>

        <!-- Camera / Image area -->
        <div class="camera-area">
          <!-- Idle: no camera yet -->
          <div v-if="status === 'idle'" class="idle-placeholder">
            <div class="idle-icon-wrap">
              <el-icon :size="56"><Camera /></el-icon>
            </div>
            <p class="idle-title">准备好开始体态识别了吗？</p>
            <p class="idle-hint">请确保光线充足，正对摄像头</p>
          </div>

          <!-- Live webcam (shown during collecting / analyzing) -->
          <div v-if="status === 'collecting' || status === 'analyzing'" class="camera-view">
            <video ref="videoRef" autoplay playsinline class="video-feed"></video>
            <div class="camera-overlay">
              <div class="camera-frame">
                <div class="frame-corner tl"></div><div class="frame-corner tr"></div>
                <div class="frame-corner bl"></div><div class="frame-corner br"></div>
              </div>
            </div>
            <!-- Scanning animation when collecting -->
            <div v-if="status === 'collecting'" class="scan-line"></div>
            <div v-if="status === 'collecting'" class="collecting-hint">正在采集特征...</div>
          </div>

          <!-- Captured image (shown during result) -->
          <div v-if="capturedImage && status === 'result'" class="captured-preview">
            <img :src="capturedImage" class="captured-img" alt="人像" />
          </div>
        </div>

        <!-- Status / Controls -->
        <div class="control-bar">
          <!-- Idle: start button -->
          <div v-if="status === 'idle'" class="idle-actions">
            <button class="btn btn-primary btn-lg" @click="startRecognition">
              <el-icon :size="20"><VideoCamera /></el-icon> 开始识别
            </button>
            <button class="btn btn-outline" @click="triggerUpload">
              <el-icon><Upload /></el-icon> 上传照片
            </button>
            <input type="file" ref="fileInput" accept="image/*" class="hidden-input" @change="handleFileSelect" />
          </div>

          <!-- Collecting phase -->
          <div v-if="status === 'collecting'" class="collecting-bar">
            <span class="collecting-label">特征采集中，请保持姿势...</span>
          </div>

          <!-- Error fallback: camera not available -->
          <div v-if="cameraFailed" class="fallback-row">
            <span class="fallback-text">无法打开摄像头</span>
            <button class="btn btn-outline btn-sm" @click="triggerUpload">
              <el-icon><Upload /></el-icon> 上传照片
            </button>
            <input type="file" ref="fileInput" accept="image/*" class="hidden-input" @change="handleFileSelect" />
          </div>

          <!-- After results: action buttons -->
          <div v-if="status === 'result' && result" class="action-row">
            <div class="desc-row">
              <el-icon :size="16"><EditPen /></el-icon>
              <input v-model="userDesc" class="desc-input" placeholder="补充信息（选填）" maxlength="60" />
            </div>
            <div class="action-btns">
              <button class="btn btn-outline" @click="resetAll">
                <el-icon><Refresh /></el-icon> 重新识别
              </button>
              <button class="btn btn-primary" @click="reAnalyze">
                <el-icon><MagicStick /></el-icon> 再次分析
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Right Panel: Results ===== -->
    <div class="right-panel">
      <!-- Idle: welcome -->
      <div class="right-placeholder" v-if="status === 'idle'">
        <div class="placeholder-icon">
          <el-icon :size="64"><User /></el-icon>
        </div>
        <h3 class="placeholder-title">AI 体态识别</h3>
        <p class="placeholder-desc">通过摄像头分析您的体态、体型<br>并给出针对性的健康与运动建议</p>
        <div class="placeholder-features">
          <div class="placeholder-feat"><el-icon :size="16"><MagicStick /></el-icon> 体型智能判断</div>
          <div class="placeholder-feat"><el-icon :size="16"><DataAnalysis /></el-icon> 体态全面评估</div>
          <div class="placeholder-feat"><el-icon :size="16"><ChatLineSquare /></el-icon> 个性化健身方案</div>
        </div>
      </div>

      <!-- Collecting phase -->
      <div class="loading-section" v-if="status === 'collecting'">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">正在采集面部与体态特征...</p>
        <p class="loading-hint">请正对摄像头，保持自然站立</p>
      </div>

      <!-- Analyzing phase -->
      <div class="loading-section" v-if="status === 'analyzing'">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">AI 正在分析您的体态...</p>
        <div class="loading-steps">
          <div class="loading-step" :class="{ done: loadingStep >= 1 }">
            <span class="step-indicator"></span><span>图像预处理</span>
          </div>
          <div class="loading-step" :class="{ done: loadingStep >= 2 }">
            <span class="step-indicator"></span><span>体态特征提取</span>
          </div>
          <div class="loading-step" :class="{ done: loadingStep >= 3 }">
            <span class="step-indicator"></span><span>健康数据分析</span>
          </div>
          <div class="loading-step" :class="{ done: loadingStep >= 4 }">
            <span class="step-indicator"></span><span>生成评估报告</span>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="right-content" v-if="status === 'result' && result">
        <!-- Body type & score -->
        <div class="result-header">
          <div class="result-type-area">
            <span class="result-label">体型判断</span>
            <span class="result-type">{{ result.bodyType }}</span>
          </div>
          <div class="result-score-area">
            <svg class="score-ring" viewBox="0 0 100 100" width="80" height="80">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#ecf0f1" stroke-width="6" />
              <circle cx="50" cy="50" r="42" fill="none" :stroke="healthColor" stroke-width="6"
                stroke-linecap="round" :stroke-dasharray="scoreCircum"
                :stroke-dashoffset="scoreOffset" transform="rotate(-90 50 50)" class="score-ring-fill" />
            </svg>
            <div class="score-center">
              <span class="score-val" :style="{ color: healthColor }">{{ result.healthScore }}</span>
            </div>
          </div>
        </div>

        <!-- Posture -->
        <div class="section-card">
          <div class="section-card-header">
            <el-icon :size="18"><User /></el-icon>
            <span>体态评估</span>
          </div>
          <p class="posture-text">{{ result.posture }}</p>
        </div>

        <!-- Body data -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-label">BMI 估值</span>
            <span class="stat-val">{{ result.bmiEstimate }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">体脂率估值</span>
            <span class="stat-val">{{ result.bodyFatEstimate }}<small>%</small></span>
          </div>
        </div>

        <!-- Strengths & Weaknesses -->
        <div class="section-card">
          <div class="section-card-header">
            <el-icon :size="18"><SuccessFilled /></el-icon>
            <span>体型优势</span>
          </div>
          <div class="tag-list">
            <span class="tag tag-success" v-for="s in result.strengths" :key="s">{{ s }}</span>
          </div>
        </div>
        <div class="section-card">
          <div class="section-card-header">
            <el-icon :size="18"><WarningFilled /></el-icon>
            <span>需要改善</span>
          </div>
          <div class="tag-list">
            <span class="tag tag-warning" v-for="w in result.weaknesses" :key="w">{{ w }}</span>
          </div>
        </div>

        <!-- Advice sections -->
        <div class="section-card advice-card">
          <div class="section-card-header">
            <el-icon :size="18"><TrendCharts /></el-icon>
            <span>运动建议</span>
          </div>
          <p class="advice-text">{{ result.exerciseAdvice }}</p>
        </div>
        <div class="section-card advice-card diet-card">
          <div class="section-card-header">
            <el-icon :size="18"><Chicken /></el-icon>
            <span>饮食建议</span>
          </div>
          <p class="advice-text">{{ result.dietAdvice }}</p>
        </div>

        <div class="section-card advice-card posture-card">
          <div class="section-card-header">
            <el-icon :size="18"><UserFilled /></el-icon>
            <span>体态改善</span>
          </div>
          <p class="advice-text">{{ result.postureAdvice }}</p>
        </div>

        <!-- Overall suggestion -->
        <div class="section-card suggestion-card">
          <div class="section-card-header">
            <el-icon :size="18"><ChatLineSquare /></el-icon>
            <span>综合建议</span>
          </div>
          <div class="suggestion-body">
            <div class="suggestion-icon">
              <el-icon :size="20"><MagicStick /></el-icon>
            </div>
            <p class="suggestion-text">{{ result.suggestion }}</p>
          </div>
        </div>

        <!-- Bottom actions -->
        <div class="bottom-actions">
          <button class="btn btn-outline" @click="resetAll">
            <el-icon><Refresh /></el-icon> 重新识别
          </button>
          <button class="btn btn-ghost" @click="goBack">
            <el-icon><Back /></el-icon> 返回AI教练
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request.js'

const router = useRouter()
const goBack = () => router.push('/ai-coach')

// ---- State ----
const videoRef = ref(null)
const fileInput = ref(null)
const capturedImage = ref('')
const userDesc = ref('')
const analyzing = ref(false)
const loadingStep = ref(0)
const result = ref(null)
const cameraFailed = ref(false)
const collectProgress = ref(0)
const status = ref('idle') // idle → collecting → analyzing → result

let mediaStream = null
let collectTimer = null
let analysisTimer = null

// ---- Camera ----
const startCamera = async () => {
  try {
    // Reset state
    capturedImage.value = ''
    result.value = null
    analyzing.value = false
    cameraFailed.value = false
    status.value = 'collecting'
    collectProgress.value = 0

    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    })
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }

    // Start collection progress animation, then auto-capture
    startCollectCountdown()
  } catch (err) {
    console.error('摄像头启动失败:', err)
    cameraFailed.value = true
    status.value = 'result' // show fallback
    ElMessage.error('无法打开摄像头: ' + (err.message || '请检查权限'))
  }
}

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
}

const startCollectCountdown = () => {
  collectProgress.value = 0
  const duration = 10000 // 10s collection
  const interval = 50
  const step = (interval / duration) * 100
  let progress = 0

  collectTimer = setInterval(() => {
    progress += step
    if (progress >= 100) {
      progress = 100
      collectProgress.value = 100
      clearInterval(collectTimer)
      collectTimer = null
      // Auto-capture and analyze
      doAutoCapture()
    } else {
      collectProgress.value = Math.round(progress)
    }
  }, interval)
}

const doAutoCapture = () => {
  if (!videoRef.value) return

  // Capture frame
  const canvas = document.createElement('canvas')
  canvas.width = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoRef.value, 0, 0)
  capturedImage.value = canvas.toDataURL('image/jpeg', 0.85)

  status.value = 'analyzing'
  startAnalysis()
}

// ---- Analysis ----
const startAnalysis = async () => {
  if (!capturedImage.value) return
  analyzing.value = true
  loadingStep.value = 0

  // Loading step animation
  analysisTimer = setInterval(() => {
    loadingStep.value++
  }, 700)

  try {
    const blob = dataURLtoBlob(capturedImage.value)
    const formData = new FormData()
    formData.append('file', blob, 'body.jpg')
    formData.append('description', userDesc.value || '')

    const res = await request.post('/api/body-recognize', formData, { timeout: 60000 })

    if (res.code === '200' && res.data) {
      result.value = res.data
      status.value = 'result'
      stopCamera()
    } else {
      ElMessage.error(res.msg || '分析失败，请重试')
      resetAll()
    }
  } catch (err) {
    console.error('体态分析失败:', err)
    ElMessage.error('分析请求失败，请检查网络或后端服务')
    resetAll()
  } finally {
    clearInterval(analysisTimer)
    analysisTimer = null
    analyzing.value = false
  }
}

// ---- Re-analysis with updated description ----
const reAnalyze = () => {
  capturedImage.value = ''
  result.value = null
  status.value = 'collecting'
  collectProgress.value = 0
  startCamera()
}

const resetAll = () => {
  capturedImage.value = ''
  result.value = null
  userDesc.value = ''
  status.value = 'collecting'
  collectProgress.value = 0
  startCamera()
}

// ---- Upload fallback ----
const triggerUpload = () => fileInput.value?.click()

const handleFileSelect = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (!f.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    capturedImage.value = ev.target.result
    status.value = 'analyzing'
    startAnalysis()
  }
  reader.readAsDataURL(f)
}

// ---- Helpers ----
function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',')
  const mime = parts[0].match(/:(.*?);/)[1]
  const bytes = atob(parts[1])
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

// ---- Computed ----
const scoreCircum = 2 * Math.PI * 42
const scoreOffset = computed(() => {
  if (!result.value) return scoreCircum
  const pct = (result.value.healthScore || 0) / 100
  return scoreCircum * (1 - pct)
})

const healthColor = computed(() => {
  if (!result.value) return '#95a5a6'
  const s = result.value.healthScore
  if (s >= 85) return '#00B894'
  if (s >= 70) return '#F9A825'
  if (s >= 55) return '#FF6B35'
  return '#E85D26'
})

// ---- Lifecycle ----
onMounted(() => {
  // Camera starts only when user clicks "开始识别"
})

onBeforeUnmount(() => {
  stopCamera()
  if (collectTimer) clearInterval(collectTimer)
  if (analysisTimer) clearInterval(analysisTimer)
})

// ---- Manual start ----
const startRecognition = async () => {
  status.value = 'collecting'
  await startCamera()
}
</script>

<style scoped>
/* ========== Root Layout ========== */
.body-recognition {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(160deg, #F0FFF4 0%, #E8F5E9 50%, #FFF8F0 100%);
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
  background: linear-gradient(180deg, transparent, rgba(46, 125, 50, 0.2), rgba(255, 107, 53, 0.2), transparent);
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
  margin-bottom: 20px;
  flex-shrink: 0;
}
.header-back {
  width: 40px; height: 40px;
  border-radius: 14px;
  border: none;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #2c3e50;
  box-shadow: 0 2px 12px rgba(46, 125, 50, 0.1);
  transition: all 0.2s; flex-shrink: 0;
}
.header-back:hover {
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.2);
  transform: translateX(-2px);
}
.header-title-area { flex: 1; }
.header-title {
  font-size: 24px; font-weight: 800;
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; margin: 0; line-height: 1.3;
}
.header-sub {
  font-size: 13px; color: #95a5a6; margin: 2px 0 0; letter-spacing: 0.5px;
}

/* Camera area */
.camera-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
.camera-view {
  width: 100%;
  height: 100%;
  min-height: 320px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: #000;
  border: 2px solid rgba(46, 125, 50, 0.2);
}
.video-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.camera-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.camera-frame {
  position: absolute;
  inset: 15%;
}
.frame-corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border-color: rgba(76, 175, 80, 0.7);
  border-style: solid;
}
.frame-corner.tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-radius: 6px 0 0 0; }
.frame-corner.tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-radius: 0 6px 0 0; }
.frame-corner.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-radius: 0 0 0 6px; }
.frame-corner.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-radius: 0 6px 0 0; }

/* Scanning line */
.scan-line {
  position: absolute;
  left: 5%;
  right: 5%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4caf50, transparent);
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.6), 0 0 24px rgba(76, 175, 80, 0.3);
  animation: scanMove 1.5s ease-in-out infinite;
  pointer-events: none;
}
@keyframes scanMove {
  0% { top: 10%; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { top: 85%; opacity: 0; }
}

.collecting-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

/* Idle placeholder */
.idle-placeholder {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255,255,255,0.6);
  border-radius: 20px;
  border: 2px dashed rgba(46, 125, 50, 0.3);
  width: 100%;
}
.idle-icon-wrap {
  width: 96px; height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8F5E9, #4caf50);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px; color: #fff;
  box-shadow: 0 8px 28px rgba(46, 125, 50, 0.25);
}
.idle-title { font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 6px; }
.idle-hint { font-size: 13px; color: #95a5a6; }
.idle-actions { display: flex; gap: 12px; justify-content: center; }
.btn-lg { padding: 16px 36px; font-size: 16px; }

.captured-preview {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(46, 125, 50, 0.2);
  max-height: 400px;
}
.captured-img {
  width: 100%;
  height: 100%;
  max-height: 400px;
  object-fit: contain;
  display: block;
  background: #f5f5f5;
}

/* Control bar */
.control-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  flex-shrink: 0;
}

/* Collecting progress */
.collecting-bar {
  display: flex;
  align-items: center;
  justify-content: center;
}
.collecting-label {
  font-size: 14px;
  color: #2e7d32;
  font-weight: 600;
}

/* Fallback */
.fallback-row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}
.fallback-text { font-size: 14px; color: #e53935; }
.hidden-input { display: none; }

/* Action rows */
.action-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.desc-row {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
  border-radius: 14px; padding: 0 16px;
  border: 1px solid rgba(46, 125, 50, 0.15);
  transition: border-color 0.25s; color: #7f8c8d;
}
.desc-row:focus-within { border-color: #4caf50; box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1); }
.desc-input {
  flex: 1; border: none; outline: none; padding: 14px 0;
  font-size: 14px; color: #2c3e50; background: transparent;
}
.desc-input::placeholder { color: #b0bec5; }
.action-btns { display: flex; gap: 12px; justify-content: center; }

/* ========== Buttons ========== */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 24px; border-radius: 50px;
  font-size: 14px; font-weight: 600; border: none;
  cursor: pointer; transition: all 0.3s ease; white-space: nowrap;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary {
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  color: #fff; box-shadow: 0 4px 20px rgba(46, 125, 50, 0.35);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(46, 125, 50, 0.5); }
.btn-outline {
  background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
  color: #2c3e50; border: 1px solid rgba(46, 125, 50, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.btn-outline:hover { background: #fff; border-color: #4caf50; box-shadow: 0 4px 16px rgba(46, 125, 50, 0.15); }
.btn-ghost {
  background: transparent; color: #7f8c8d; border: 1px solid rgba(0, 0, 0, 0.08);
}
.btn-ghost:hover { background: rgba(46, 125, 50, 0.06); color: #2e7d32; border-color: rgba(46, 125, 50, 0.2); }
.btn-sm { padding: 8px 16px; font-size: 13px; }

/* ========== Right Panel ========== */
.right-panel {
  flex: 1; height: 100vh; overflow-y: auto;
  padding: 28px 40px 32px;
  display: flex; flex-direction: column;
}

/* Loading section */
.loading-section {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 20px;
}
.spinner-ring {
  width: 48px; height: 48px;
  border: 3px solid rgba(46, 125, 50, 0.15);
  border-top-color: #2e7d32; border-right-color: #4caf50;
  border-radius: 50%; animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text {
  font-size: 18px; font-weight: 700;
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; margin: 0;
}
.loading-hint {
  font-size: 14px; color: #95a5a6; margin: -10px 0 0;
}
.loading-steps { display: flex; flex-direction: column; gap: 14px; min-width: 200px; }
.loading-step { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #b0bec5; transition: all 0.35s; }
.loading-step.done { color: #2c3e50; }
.step-indicator {
  width: 12px; height: 12px; border-radius: 50%;
  background: #e0e0e0; transition: all 0.35s; flex-shrink: 0;
}
.loading-step.done .step-indicator {
  background: #4caf50; box-shadow: 0 0 12px rgba(76, 175, 80, 0.5);
}

/* Right placeholder */
.right-placeholder {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  gap: 16px;
}
.placeholder-icon {
  width: 100px; height: 100px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(76, 175, 80, 0.1));
  display: flex; align-items: center; justify-content: center;
  color: #4caf50; margin-bottom: 8px;
}
.placeholder-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0; }
.placeholder-desc { font-size: 14px; color: #95a5a6; line-height: 1.6; margin: 0; }
.placeholder-features { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.placeholder-feat {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; color: #7f8c8d;
  background: rgba(255,255,255,0.6);
  padding: 10px 18px; border-radius: 12px;
}

/* Right content */
.right-content {
  display: flex; flex-direction: column;
  gap: 14px; animation: fadeUp 0.5s ease-out;
}
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* Result header */
.result-header {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.88); border-radius: 18px;
  padding: 20px; box-shadow: 0 4px 20px rgba(46, 125, 50, 0.06);
  border: 1px solid rgba(46, 125, 50, 0.06);
}
.result-type-area { display: flex; flex-direction: column; gap: 4px; }
.result-label { font-size: 13px; color: #95a5a6; }
.result-type { font-size: 28px; font-weight: 800; color: #1a1a2e; }
.result-score-area { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.score-ring { width: 100%; height: 100%; }
.score-ring-fill { transition: stroke-dashoffset 1.2s ease-out; filter: drop-shadow(0 0 4px currentColor); }
.score-center {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
.score-val { font-size: 22px; font-weight: 800; line-height: 1; }

/* Section card */
.section-card {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(8px); border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.06);
  border: 1px solid rgba(46, 125, 50, 0.06);
}
.section-card-header {
  display: flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 700; color: #1a1a2e;
  margin-bottom: 12px;
}
.posture-text { font-size: 15px; color: #444; line-height: 1.7; margin: 0; }

/* Stats row */
.stats-row { display: flex; gap: 12px; }
.stat-card {
  flex: 1; background: rgba(255,255,255,0.88);
  border-radius: 16px; padding: 16px; text-align: center;
  border: 1px solid rgba(46, 125, 50, 0.06);
}
.stat-label { display: block; font-size: 12px; color: #95a5a6; margin-bottom: 6px; }
.stat-val { font-size: 28px; font-weight: 800; color: #2e7d32; }
.stat-val small { font-size: 14px; font-weight: 600; }

/* Tags */
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.tag {
  display: inline-block; padding: 6px 14px; border-radius: 20px;
  font-size: 13px; font-weight: 600;
}
.tag-success { background: rgba(76, 175, 80, 0.12); color: #2e7d32; }
.tag-warning { background: rgba(255, 152, 0, 0.12); color: #e65100; }

/* Advice */
.advice-text { font-size: 14px; color: #555; line-height: 1.7; margin: 0; }

/* Suggestion */
.suggestion-body {
  display: flex; gap: 14px;
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.05), rgba(76, 175, 80, 0.05));
  border-radius: 14px; padding: 16px;
  border-left: 4px solid #4caf50;
}
.suggestion-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(135deg, #E8F5E9, #4caf50);
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}
.suggestion-text { font-size: 14px; color: #444; line-height: 1.7; margin: 0; }

/* Bottom actions */
.bottom-actions {
  display: flex; gap: 12px; justify-content: center;
  padding: 8px 0 20px;
}
</style>