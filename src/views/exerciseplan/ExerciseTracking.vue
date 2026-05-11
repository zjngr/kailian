<template>
  <div class="exercise-tracking">
    <!-- Left: Camera view -->
    <div class="camera-section">
      <div class="camera-header">
        <button class="back-btn" @click="goBack">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </button>
        <h1 class="page-title">AI 动作识别计数</h1>
      </div>

      <div class="camera-wrapper">
        <!-- Hidden video for pose detection -->
        <video ref="videoRef" playsinline class="hidden-video"></video>
        <!-- Canvas for drawing skeleton overlay -->
        <canvas ref="canvasRef" class="overlay-canvas"></canvas>

        <!-- Loading overlay -->
        <div v-if="loadingModel" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>{{ loadingText }}</p>
        </div>

        <!-- Start prompt -->
        <div v-if="!cameraReady && !loadingModel" class="start-prompt">
          <div class="prompt-icon">
            <el-icon :size="64"><VideoCamera /></el-icon>
          </div>
          <h2>准备好开始锻炼了吗？</h2>
          <p>请确保光线充足，全身在摄像头范围内</p>
          <button class="start-btn" @click="startExercise">
            <el-icon :size="20"><VideoCamera /></el-icon> 打开摄像头开始
          </button>
        </div>

        <!-- Camera error -->
        <div v-if="cameraError" class="start-prompt">
          <div class="prompt-icon">
            <el-icon :size="64"><WarningFilled /></el-icon>
          </div>
          <h2>无法打开摄像头</h2>
          <p>{{ cameraError }}</p>
          <button class="start-btn" @click="startExercise">重试</button>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls" v-if="cameraReady">
        <div class="control-row">
          <label class="exercise-label">选择动作：</label>
          <select v-model="currentExercise" class="exercise-select" @change="resetCounts">
            <option v-for="ex in exerciseList" :key="ex.key" :value="ex.key">{{ ex.name }}</option>
          </select>
        </div>
        <div class="control-row">
          <button class="btn btn-danger" @click="stopExercise" v-if="cameraReady">
            <el-icon><Close /></el-icon> 关闭摄像头
          </button>
          <button class="btn btn-outline" @click="resetCounts">
            <el-icon><Refresh /></el-icon> 重置计数
          </button>
        </div>
      </div>
    </div>

    <!-- Right: Stats panel -->
    <div class="stats-section">
      <div class="stats-header">
        <h2>锻炼数据</h2>
      </div>

      <!-- Exercise info -->
      <div class="exercise-info-card">
        <div class="exercise-icon">
          <el-icon :size="32"><MagicStick /></el-icon>
        </div>
        <div class="exercise-meta">
          <span class="meta-label">当前动作</span>
          <span class="meta-value">{{ currentExerciseName }}</span>
        </div>
      </div>

      <!-- Rep counter -->
      <div class="rep-counter">
        <div class="rep-number">{{ repCount }}</div>
        <div class="rep-label">完成次数</div>
        <div class="rep-stage" :class="repStageClass">{{ repStageText }}</div>
      </div>

      <!-- Timer & Calories -->
      <div class="stats-grid">
        <div class="stat-card">
          <el-icon :size="24"><Timer /></el-icon>
          <div class="stat-number">{{ formattedTime }}</div>
          <div class="stat-label">锻炼时长</div>
        </div>
        <div class="stat-card">
          <el-icon :size="24"><Lightning /></el-icon>
          <div class="stat-number">{{ caloriesBurned }}</div>
          <div class="stat-label">消耗卡路里</div>
        </div>
      </div>

      <!-- Reps per minute -->
      <div class="stat-card wide">
        <el-icon :size="24"><TrendCharts /></el-icon>
        <div class="stat-number">{{ rpm }}</div>
        <div class="stat-label">每分钟次数 (RPM)</div>
      </div>

      <!-- Body keypoint confidence -->
      <div class="confidence-bar" v-if="cameraReady">
        <div class="confidence-label">
          <span>姿态检测质量</span>
          <span :style="{ color: confidenceColor }">{{ confidencePercent }}%</span>
        </div>
        <div class="confidence-track">
          <div class="confidence-fill" :style="{ width: confidencePercent + '%', background: confidenceColor }"></div>
        </div>
      </div>

      <!-- Pose skeleton legend -->
      <div class="legend-card" v-if="cameraReady">
        <div class="legend-title">骨骼关键点</div>
        <div class="legend-items">
          <div class="legend-item"><span class="dot" style="background:#4caf50"></span> 高置信度</div>
          <div class="legend-item"><span class="dot" style="background:#ff9800"></span> 中等置信度</div>
          <div class="legend-item"><span class="dot" style="background:#f44336"></span> 低置信度</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const goBack = () => router.push('/exercisePlan')

// ---- DOM refs ----
const videoRef = ref(null)
const canvasRef = ref(null)

// ---- State ----
const loadingModel = ref(true)
const loadingText = ref('加载AI模型中...')
const cameraReady = ref(false)
const cameraError = ref('')
const repCount = ref(0)
const repStage = ref('') // 'up' | 'down' | ''
const currentExercise = ref('pushup')
const confidencePercent = ref(0)
const elapsedSeconds = ref(0)
const caloriesBurned = ref(0)

let detector = null
let animFrameId = null
let mediaStream = null
let timerInterval = null
let lastCountTime = 0
let stage = null
let angleHistory = []
const MIN_REP_TIME = 0.4
const SMOOTHING_WINDOW = 5

// ---- Exercise Config (from Good-GYM) ----
const EXERCISE_CONFIG = {
  pushup: { name: '俯卧撑', downAngle: 130, upAngle: 160, keypoints: { left: [5, 7, 9], right: [6, 8, 10] }, isLeg: false },
  situp: { name: '仰卧起坐', downAngle: 145, upAngle: 160, keypoints: { left: [5, 11, 15], right: [6, 12, 16] }, isLeg: false },
  bicep_curl: { name: '弯举', downAngle: 60, upAngle: 160, keypoints: { left: [5, 7, 9], right: [6, 8, 10] }, isLeg: false },
  squat: { name: '深蹲', downAngle: 110, upAngle: 160, keypoints: { left: [11, 13, 15], right: [12, 14, 16] }, isLeg: false },
  lateral_raise: { name: '侧平举', downAngle: 30, upAngle: 80, keypoints: { left: [11, 5, 7], right: [12, 6, 8] }, isLeg: false },
  overhead_press: { name: '推举', downAngle: 100, upAngle: 150, keypoints: { left: [11, 5, 7], right: [12, 6, 8] }, isLeg: false },
  crunch: { name: '卷腹', downAngle: 170, upAngle: 150, keypoints: { left: [5, 11, 15], right: [6, 12, 16] }, isLeg: false },
  pullup: { name: '引体向上', downAngle: 140, upAngle: 70, keypoints: { left: [5, 7, 9], right: [6, 8, 10] }, isLeg: false },
  leg_raise: { name: '抬腿', downAngle: 130, upAngle: 160, keypoints: { left: [5, 11, 15], right: [6, 12, 16] }, isLeg: true },
  knee_raise: { name: '抬膝', downAngle: 110, upAngle: 160, keypoints: { left: [11, 13, 15], right: [12, 14, 16] }, isLeg: true }
}

const exerciseList = Object.entries(EXERCISE_CONFIG).map(([key, v]) => ({ key, name: v.name }))
const currentExerciseName = computed(() => EXERCISE_CONFIG[currentExercise.value]?.name || '')

// ---- Computed ----
const formattedTime = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
  const s = elapsedSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const rpm = computed(() => {
  if (elapsedSeconds.value < 10) return '0.0'
  return (repCount.value / (elapsedSeconds.value / 60)).toFixed(1)
})

const confidenceColor = computed(() => {
  if (confidencePercent.value >= 70) return '#4caf50'
  if (confidencePercent.value >= 40) return '#ff9800'
  return '#f44336'
})

const repStageClass = computed(() => {
  if (repStage.value === 'up') return 'stage-up'
  if (repStage.value === 'down') return 'stage-down'
  return ''
})

const repStageText = computed(() => {
  if (repStage.value === 'up') return '↑ 上升'
  if (repStage.value === 'down') return '↓ 下降'
  return '待检测'
})

// ---- Init ----
onMounted(async () => {
  await initTF()
})

onBeforeUnmount(() => {
  stopCamera()
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (timerInterval) clearInterval(timerInterval)
})

async function initTF() {
  try {
    loadingText.value = '加载TensorFlow.js框架...'

    // Load TF.js from CDN (avoid Vite bundling issues)
    // Order matters: core → converter (provides loadGraphModel) → backend → pose-detection
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.22.0/dist/tf-core.min.js')
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.22.0/dist/tf-converter.min.js')
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.22.0/dist/tf-backend-webgl.min.js')
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js')

    const tf = window.tf
    const poseDetection = window.poseDetection

    if (!tf || !poseDetection) {
      throw new Error('CDN加载失败')
    }

    loadingText.value = '初始化TensorFlow.js...'
    await tf.ready()
    await tf.setBackend('webgl')

    loadingText.value = '加载姿态检测模型 (MoveNet)...'
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    )

    loadingModel.value = false
  } catch (err) {
    console.error('TF.js init error:', err)
    loadingModel.value = false
    cameraError.value = 'AI模型加载失败: ' + (err.message || '未知错误')
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = () => reject(new Error('脚本加载失败: ' + src))
    document.head.appendChild(script)
  })
}

// ---- Camera ----
async function startExercise() {
  if (!detector) {
    ElMessage.warning('模型尚未加载完成，请稍候')
    return
  }
  cameraError.value = ''

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    })
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await videoRef.value.play()

      // Set canvas size to match video
      const canvas = canvasRef.value
      canvas.width = videoRef.value.videoWidth || 640
      canvas.height = videoRef.value.videoHeight || 480

      cameraReady.value = true
      startTimer()
      detectLoop()
    }
  } catch (err) {
    cameraError.value = '无法打开摄像头: ' + (err.message || '请检查权限')
  }
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
  cameraReady.value = false
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = null
}

function stopExercise() {
  stopCamera()
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
  const canvas = canvasRef.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

// ---- Timer ----
function startTimer() {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    // Rough calorie estimate: ~8 cal/min for moderate exercise
    caloriesBurned.value = Math.round((elapsedSeconds.value / 60) * 8)
  }, 1000)
}

// ---- Pose Detection Loop ----
async function detectLoop() {
  if (!cameraReady.value || !detector) return

  try {
    const poses = await detector.estimatePoses(videoRef.value, {
      flipHorizontal: true,
      maxPoses: 1
    })

    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw mirrored video
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(videoRef.value, 0, 0, -canvas.width, canvas.height)
    ctx.restore()

    if (poses && poses.length > 0) {
      const keypoints = poses[0].keypoints
      drawSkeleton(ctx, keypoints, canvas.width, canvas.height)
      drawKeypoints(ctx, keypoints, canvas.width, canvas.height)

      // Confidence
      const validKps = keypoints.filter(k => k.score > 0.1)
      const avgConf = validKps.reduce((s, k) => s + k.score, 0) / (validKps.length || 1)
      confidencePercent.value = Math.round(avgConf * 100)

      // Count reps
      countExercise(keypoints)
    } else {
      confidencePercent.value = 0
    }

    animFrameId = requestAnimationFrame(detectLoop)
  } catch (err) {
    console.error('Detection error:', err)
    animFrameId = requestAnimationFrame(detectLoop)
  }
}

// ---- Rep Counting (ported from Good-GYM) ----
function calculateAngle(a, b, c) {
  if (!a || !b || !c) return null
  if (a.score < 0.2 || b.score < 0.2 || c.score < 0.2) return null

  const ax = a.x, ay = a.y
  const bx = b.x, by = b.y
  const cx = c.x, cy = c.y

  const baLen = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
  const bcLen = Math.sqrt((cx - bx) ** 2 + (cy - by) ** 2)
  if (baLen < 0.001 || bcLen < 0.001) return null

  const dot = (ax - bx) * (cx - bx) + (ay - by) * (cy - by)
  let cosAngle = dot / (baLen * bcLen)
  cosAngle = Math.max(-1, Math.min(1, cosAngle))
  return Math.acos(cosAngle) * (180 / Math.PI)
}

function smoothAngle(angle) {
  if (angle === null) return null
  angleHistory.push(angle)
  if (angleHistory.length > SMOOTHING_WINDOW) angleHistory.shift()
  if (angleHistory.length < 3) return angle

  const sorted = [...angleHistory].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const std = Math.sqrt(angleHistory.reduce((s, v) => s + (v - median) ** 2, 0) / angleHistory.length)
  const filtered = angleHistory.filter(v => Math.abs(v - median) <= 2 * std)
  return filtered.reduce((s, v) => s + v, 0) / filtered.length
}

function countExercise(keypoints) {
  const config = EXERCISE_CONFIG[currentExercise.value]
  if (!config) return

  const kp = config.keypoints
  const mapKp = (idx) => keypoints[idx] || null

  const leftAngle = calculateAngle(mapKp(kp.left[0]), mapKp(kp.left[1]), mapKp(kp.left[2]))
  const rightAngle = calculateAngle(mapKp(kp.right[0]), mapKp(kp.right[1]), mapKp(kp.right[2]))

  if (leftAngle === null || rightAngle === null) return

  if (config.isLeg) {
    // Leg exercises: count each leg independently
    countLegSide(leftAngle, kp.left, config)
    countLegSide(rightAngle, kp.right, config)
    const avg = (leftAngle + rightAngle) / 2
    return
  }

  const avgAngle = (leftAngle + rightAngle) / 2
  const smoothed = smoothAngle(avgAngle)
  if (smoothed === null) return

  const { upAngle, downAngle } = config

  if (smoothed > upAngle) {
    stage = 'up'
    repStage.value = 'up'
  } else if (smoothed < downAngle && stage === 'up' && checkRepTiming()) {
    stage = 'down'
    repStage.value = 'down'
    repCount.value++
    lastCountTime = Date.now()
  }
}

function countLegSide(angle, keypointIndices, config) {
  const { upAngle, downAngle } = config
  if (angle > upAngle) {
    stage = 'up'
    repStage.value = 'up'
  } else if (angle < downAngle && stage === 'up' && checkRepTiming()) {
    stage = 'down'
    repStage.value = 'down'
    repCount.value++
    lastCountTime = Date.now()
  }
}

function checkRepTiming() {
  return (Date.now() - lastCountTime) > MIN_REP_TIME * 1000
}

function resetCounts() {
  repCount.value = 0
  stage = null
  repStage.value = ''
  angleHistory = []
  lastCountTime = 0
  elapsedSeconds.value = 0
  caloriesBurned.value = 0
}

// ---- Skeleton Drawing ----
const SKELETON_PAIRS = [
  [5, 7], [7, 9],      // left arm
  [6, 8], [8, 10],     // right arm
  [5, 11], [6, 12],    // torso
  [11, 13], [13, 15],  // left leg
  [12, 14], [14, 16],  // right leg
  [5, 6],              // shoulders
  [11, 12]             // hips
]

function drawSkeleton(ctx, keypoints, w, h) {
  ctx.save()
  for (const [i, j] of SKELETON_PAIRS) {
    const a = keypoints[i]
    const b = keypoints[j]
    if (a.score > 0.3 && b.score > 0.3) {
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = a.score > 0.5 && b.score > 0.5 ? '#4caf50' : '#ff9800'
      ctx.lineWidth = 3
      ctx.stroke()
    }
  }
  ctx.restore()
}

function drawKeypoints(ctx, keypoints, w, h) {
  ctx.save()
  for (const kp of keypoints) {
    if (kp.score > 0.2) {
      ctx.beginPath()
      ctx.arc(kp.x, kp.y, kp.score > 0.5 ? 5 : 3, 0, 2 * Math.PI)
      ctx.fillStyle = kp.score > 0.6 ? '#4caf50' : kp.score > 0.3 ? '#ff9800' : '#f44336'
      ctx.fill()
      if (kp.score > 0.5) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
  }
  ctx.restore()
}
</script>

<style scoped>
.exercise-tracking {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #fff;
}

/* ===== Camera Section ===== */
.camera-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  min-width: 0;
}

.camera-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.back-btn {
  width: 40px; height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.08);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.back-btn:hover { background: rgba(255,255,255,0.15); }

.page-title {
  font-size: 22px; font-weight: 700; margin: 0;
  background: linear-gradient(135deg, #4caf50, #81c784);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.camera-wrapper {
  flex: 1;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  min-height: 300px;
}

.hidden-video {
  display: none;
}

.overlay-canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.8);
  gap: 20px;
  z-index: 10;
}

.loading-spinner {
  width: 48px; height: 48px;
  border: 3px solid rgba(76, 175, 80, 0.2);
  border-top-color: #4caf50;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-overlay p {
  font-size: 16px; color: #aaa; margin: 0;
}

.start-prompt {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(0,0,0,0.7);
  z-index: 10;
  text-align: center;
  padding: 40px;
}

.prompt-icon {
  width: 100px; height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.05));
  display: flex; align-items: center; justify-content: center;
  color: #4caf50;
}

.start-prompt h2 { font-size: 22px; font-weight: 700; margin: 0; color: #fff; }
.start-prompt p { font-size: 14px; color: #95a5a6; margin: 0; }

.start-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 32px; border-radius: 50px;
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  color: #fff; font-size: 16px; font-weight: 600;
  border: none; cursor: pointer;
  transition: all 0.3s; margin-top: 8px;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.35);
}
.start-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(76, 175, 80, 0.5); }

/* Controls */
.controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  flex-shrink: 0;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exercise-label {
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  white-space: nowrap;
}

.exercise-select {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.08);
  color: #fff;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  max-width: 200px;
}

.exercise-select:focus { border-color: #4caf50; }

.exercise-select option {
  background: #1a1a2e;
  color: #fff;
}

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 10px;
  font-size: 14px; font-weight: 600; border: none;
  cursor: pointer; transition: all 0.25s;
  white-space: nowrap;
}

.btn-danger {
  background: rgba(229, 57, 53, 0.2);
  color: #ef5350;
  border: 1px solid rgba(229, 57, 53, 0.3);
}
.btn-danger:hover { background: rgba(229, 57, 53, 0.35); }

.btn-outline {
  background: rgba(255,255,255,0.08);
  color: #ccc;
  border: 1px solid rgba(255,255,255,0.15);
}
.btn-outline:hover { background: rgba(255,255,255,0.15); color: #fff; }

/* ===== Stats Section ===== */
.stats-section {
  width: 340px;
  min-width: 340px;
  height: 100vh;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0,0,0,0.3);
  border-left: 1px solid rgba(255,255,255,0.06);
  overflow-y: auto;
}

.stats-header h2 {
  font-size: 18px; font-weight: 700; margin: 0;
  color: #81c784;
}

/* Exercise info card */
.exercise-info-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06);
}

.exercise-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.05));
  display: flex; align-items: center; justify-content: center;
  color: #4caf50;
  flex-shrink: 0;
}

.exercise-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label { font-size: 12px; color: #95a5a6; }
.meta-value { font-size: 20px; font-weight: 700; color: #fff; }

/* Rep counter */
.rep-counter {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.03));
  border-radius: 18px;
  border: 1px solid rgba(76, 175, 80, 0.15);
}

.rep-number {
  font-size: 72px;
  font-weight: 800;
  background: linear-gradient(135deg, #4caf50, #81c784);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 8px;
}

.rep-label {
  font-size: 14px;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.rep-stage {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
}

.stage-up {
  color: #81c784;
  background: rgba(76, 175, 80, 0.15);
}

.stage-down {
  color: #ff9800;
  background: rgba(255, 152, 0, 0.15);
}

/* Stats grid */
.stats-grid {
  display: flex;
  gap: 12px;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06);
  color: #81c784;
}

.stat-card.wide {
  flex-direction: row;
  justify-content: center;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
}

.stat-card .stat-label {
  font-size: 12px;
  color: #95a5a6;
  text-align: center;
}

/* Confidence bar */
.confidence-bar {
  padding: 14px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
}

.confidence-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #95a5a6;
  margin-bottom: 8px;
}

.confidence-track {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.2s, background 0.3s;
}

/* Legend */
.legend-card {
  padding: 14px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  margin-bottom: 10px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #95a5a6;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
