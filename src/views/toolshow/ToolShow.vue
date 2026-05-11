<template>
  <div class="om-viewer" style="height: 1000px" :class="{ 'light-mode': isLightMode }">
    <!-- 顶部栏 -->
    <header class="top-bar">
      <div class="logo">3D器材模拟展示</div>
      <div class="tools">
        <button class="tool-btn theme-toggle" @click="toggleTheme">
          {{ isDarkTheme ? 'Light' : 'Dark' }}
        </button>
        <!-- 添加开灯按钮 -->
        <button class="tool-btn light-toggle" @click="toggleLight">
          {{ isLightMode ? '关灯' : '开灯' }}
        </button>
      </div>
    </header>

    <!-- 主体区 -->
    <div class="main-box">
      <!-- 左侧树形分类 -->
      <aside class="side-tree">
        <h3 class="tree-title">Equipment Categories</h3>
        <div
            v-for="cat in categories"
            :key="cat.label"
            class="tree-item"
            :class="{ open: cat.open }"
        >
          <div class="tree-label" @click="toggleOpen(cat)">
            <span class="arrow">{{ cat.open ? '▼' : '▶' }}</span>
            {{ cat.label }}
          </div>
          <transition name="slide">
            <div v-if="cat.open" class="tree-children">
              <div
                  v-for="child in cat.children"
                  :key="child"
                  class="tree-child"
                  :class="{ active: activeCat === child }"
                  @click="selectCat(child)"
              >
                {{ child }}
              </div>
            </div>
          </transition>
        </div>
      </aside>

      <!-- 右侧展示 -->
      <section class="show-area">
        <div class="viewer-header">
          <h2 class="model-title">{{ activeCat }}</h2>
          <div class="view-controls">
            <button class="control-btn" @click="resetView">Reset</button>
            <button class="control-btn" @click="toggleAutoRotate">
              {{ autoRotate ? 'Stop' : 'Auto' }}
            </button>
            <button class="control-btn" @click="toggleWireframe">
              {{ wireframeMode ? 'Solid' : 'Wireframe' }}
            </button>
          </div>
        </div>

        <div ref="mount" class="canvas" @mouseenter="pauseAuto" @mouseleave="resumeAuto"></div>


        <div class="thumb-strip">
          <div class="thumb-title">器材展示条</div>
          <div class="thumb-scroll">
            <div
                v-for="(item, i) in list"
                :key="i"
                class="thumb-cell"
                :class="{ active: activeThumb === i }"
                @click="switchThumb(i)"
            >
              <div class="thumb-label">{{ item }}</div>
              <img :src="thumbs[i]" :alt="item" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
/* -------------------- 引入 -------------------- */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { onMounted, onBeforeUnmount, ref, reactive, watch } from 'vue'

/* -------------------- 响应式数据 -------------------- */
const mount = ref(null)
const activeCat = ref('商用跑步机')
const activeThumb = ref(0)
const thumbs = ref([])
const isDarkTheme = ref(true)
const isLightMode = ref(false) // 新增：控制是否开灯模式
const wireframeMode = ref(false)
const autoRotate = ref(true)

const stats = reactive({
  vertices: 0,
  triangles: 0
})

const modelInfo = ref('Professional treadmill with interactive display panel and adjustable settings.')

/* 健身器材分类树 */
const categories = reactive([
  {
    label: 'Cardio Machines',
    open: true,
    children: ['商用跑步机', '椭圆机', '动感单车', '划船机']
  },
  {
    label: 'Strength Equipment',
    open: false,
    children: ['史密斯机', '哑铃架', '卧推架', '高位下拉']
  },
  {
    label: 'Free Training',
    open: false,
    children: ['瑜伽垫', '药球', '壶铃', '战绳']
  },
  {
    label: 'Accessories',
    open: false,
    children: ['泡沫轴', '拉力带', '健腹轮', '平衡盘']
  }
])

/* 与分类保持同步的模型名称列表 */
const list = ref(categories.flatMap(c => c.children))

/* -------------------- Three 对象 -------------------- */
let scene, camera, renderer, controls, currentMesh, ambientLight, directionalLight, ground
let autoTimer = null
let autoPaused = false
let animFrameId = null

/* 共享材质（避免每次 createMesh 重复创建） */
const _metalDark = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.9 })
const _metalLight = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.4, metalness: 0.8 })
const _plasticBlack = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0.1 })
const _plasticBlue = new THREE.MeshStandardMaterial({ color: 0x409eff, roughness: 0.3, metalness: 0.2, emissive: 0x102030, emissiveIntensity: 0.2 })
const _rubber = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9, metalness: 0 })
const _screen = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 1, emissive: 0x00a8ff, emissiveIntensity: 0.5 })
const _cableMat = new THREE.MeshStandardMaterial({ color: 0x888888 })
const _ropeMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 })

/* -------------------- 生命周期 -------------------- */
onMounted(() => {
  window.scrollTo(0,0)
  initThree()
  loadModel(activeCat.value)
  // 延迟生成缩略图，不阻塞首次渲染
  if (window.requestIdleCallback) {
    requestIdleCallback(() => genThumbs(), { timeout: 3000 })
  } else {
    setTimeout(() => genThumbs(), 200)
  }
  animate()
  updateStats()

  // 监听模型切换
  watch(activeCat, (newVal) => {
    loadModel(newVal)
    updateModelInfo(newVal)
    updateStats()
  })

  // 标签页隐藏时暂停动画，节省 GPU
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId)
  renderer.dispose()
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  clearTimeout(autoTimer)
})

/* ==========================================================
   界面交互函数
   ========================================================== */
function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value
  if (isDarkTheme.value) {
    // 暗色主题
    scene.background = new THREE.Color(0x1a1a1a)
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50)
    ambientLight.intensity = 0.4
    if (ground) {
      ground.material.color.set(0x222222)
    }
  } else {
    // 亮色主题（但不是全白）
    scene.background = new THREE.Color(0xf0f0f0)
    scene.fog = new THREE.Fog(0xf0f0f0, 10, 50)
    ambientLight.intensity = 0.6
    if (ground) {
      ground.material.color.set(0xdddddd)
    }
  }
}

// 新增：开灯/关灯功能
function toggleLight() {
  isLightMode.value = !isLightMode.value

  if (isLightMode.value) {
    // 开灯模式：全白背景
    scene.background = new THREE.Color(0xffffff)
    scene.fog = null // 移除雾效，让画面更清晰

    // 增强灯光
    ambientLight.intensity = 1.0
    directionalLight.intensity = 2.5

    // 调整地面颜色为浅灰色
    if (ground) {
      ground.material.color.set(0xeeeeee)
      ground.material.roughness = 0.3 // 更光滑
    }
  } else {
    // 关灯模式：回到当前主题
    if (isDarkTheme.value) {
      // 回到暗色主题
      scene.background = new THREE.Color(0x1a1a1a)
      scene.fog = new THREE.Fog(0x1a1a1a, 10, 50)
      ambientLight.intensity = 0.4
      if (ground) {
        ground.material.color.set(0x222222)
        ground.material.roughness = 0.6
      }
    } else {
      // 回到亮色主题
      scene.background = new THREE.Color(0xf0f0f0)
      scene.fog = new THREE.Fog(0xf0f0f0, 10, 50)
      ambientLight.intensity = 0.6
      if (ground) {
        ground.material.color.set(0xdddddd)
        ground.material.roughness = 0.6
      }
    }
  }
}

function toggleAutoRotate() {
  autoRotate.value = !autoRotate.value
  controls.autoRotate = autoRotate.value
}

function toggleWireframe() {
  wireframeMode.value = !wireframeMode.value
  if (currentMesh) {
    currentMesh.traverse((obj) => {
      if (obj.isMesh) {
        obj.material.wireframe = wireframeMode.value
      }
    })
  }
}

function resetView() {
  controls.reset()
  camera.position.set(5, 3, 8)
  controls.update()
}

function pauseAuto() {
  controls.autoRotate = false
  autoPaused = true
}

function resumeAuto() {
  if (autoPaused && autoRotate.value) {
    autoTimer = setTimeout(() => {
      controls.autoRotate = true
      autoPaused = false
    }, 1000)
  }
}

/* ==========================================================
   1. 初始化 Three（物理灯光 + 线性空间）
   ========================================================== */
function initThree() {
  const width = mount.value.clientWidth
  const height = mount.value.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a1a)
  scene.fog = new THREE.Fog(0x1a1a1a, 10, 50)

  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  camera.position.set(5, 3, 8)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  mount.value.appendChild(renderer.domElement)

  /* 灯光 */
  ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
  directionalLight.position.set(10, 20, 15)
  directionalLight.castShadow = true
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 80
  directionalLight.shadow.camera.left = -15
  directionalLight.shadow.camera.right = 15
  directionalLight.shadow.camera.top = 15
  directionalLight.shadow.camera.bottom = -15
  directionalLight.shadow.mapSize.set(2048, 2048)
  scene.add(directionalLight)

  /* 地面 */
  const groundGeo = new THREE.PlaneGeometry(50, 50)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.6,
    metalness: 0.2
  })
  ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  /* 控制器 */
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 3
  controls.maxDistance = 25
  controls.autoRotate = autoRotate.value
  controls.autoRotateSpeed = 0.6
  controls.maxPolarAngle = Math.PI / 2.1

  window.addEventListener('resize', onResize)
}

/* ==========================================================
   2. 精致程序化健身器材模型库
   ========================================================== */
function createMesh(name) {
  const g = new THREE.Group()

  // 辅助函数：创建圆角立方体
  function roundedBox(width, height, depth, radius = 0.1) {
    const shape = new THREE.Shape()
    shape.moveTo(-width/2 + radius, -height/2)
    shape.lineTo(width/2 - radius, -height/2)
    shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius)
    shape.lineTo(width/2, height/2 - radius)
    shape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2)
    shape.lineTo(-width/2 + radius, height/2)
    shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius)
    shape.lineTo(-width/2, -height/2 + radius)
    shape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2)

    const extrudeSettings = {
      depth: depth - radius * 2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }

  // 辅助函数：创建圆柱体
  function createCylinder(height, radius, material, pos = [0, 0, 0]) {
    const geo = new THREE.CylinderGeometry(radius, radius, height, 16)
    const mesh = new THREE.Mesh(geo, material)
    mesh.position.set(...pos)
    mesh.castShadow = true
    return mesh
  }

  switch (name) {
    case '商用跑步机':
      const frame = new THREE.Mesh(roundedBox(2.2, 0.2, 1.1, 0.05), _metalDark)
      frame.position.y = 0.1

      const belt = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.03, 0.9), _rubber)
      belt.position.y = 0.215

      const beltLines = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.01, 0.02), _plasticBlack)
      for(let i = -4; i <= 4; i++) {
        const line = beltLines.clone()
        line.position.z = i * 0.1
        line.position.y = 0.23
        g.add(line)
      }

      const panelBase = new THREE.Mesh(roundedBox(0.65, 0.8, 0.12, 0.02), _metalLight)
      panelBase.position.set(0, 0.8, -0.5)

      const screenArea = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.02), _screen)
      screenArea.position.set(0, 0.8, -0.56)

      // 修改：使用实心圆柱代替空心管
      const leftHandle = createCylinder(0.8, 0.02, _metalDark, [-0.8, 0.6, 0])
      const rightHandle = createCylinder(0.8, 0.02, _metalDark, [0.8, 0.6, 0])

      const leg1 = createCylinder(1.2, 0.04, _metalDark, [-0.8, 0.6, 0.4])
      const leg2 = createCylinder(1.2, 0.04, _metalDark, [0.8, 0.6, 0.4])
      const leg3 = createCylinder(1.2, 0.04, _metalDark, [-0.8, 0.6, -0.4])
      const leg4 = createCylinder(1.2, 0.04, _metalDark, [0.8, 0.6, -0.4])

      const buttonGeo = new THREE.SphereGeometry(0.02, 16, 16)
      for(let i = -2; i <= 2; i++) {
        const button = new THREE.Mesh(buttonGeo, _plasticBlue)
        button.position.set(i * 0.1, 0.6, -0.56)
        g.add(button)
      }

      g.add(frame, belt, panelBase, screenArea, leftHandle, rightHandle, leg1, leg2, leg3, leg4)
      break

    case '椭圆机':
      const ellipticalMainFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.8), _metalDark)
      ellipticalMainFrame.position.y = 0.075

      const flywheelCover = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 32), _metalLight)
      flywheelCover.position.set(0.6, 0.3, 0)
      flywheelCover.rotation.z = Math.PI/2

      const ellipticalLeftPedal = new THREE.Mesh(roundedBox(0.4, 0.05, 0.25, 0.02), _metalDark)
      ellipticalLeftPedal.position.set(-0.4, 0.1, 0.2)
      const ellipticalRightPedal = ellipticalLeftPedal.clone()
      ellipticalRightPedal.position.set(0.4, 0.1, -0.2)

      const ellipticalLinkageGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8)
      const ellipticalLeftLink = new THREE.Mesh(ellipticalLinkageGeo, _metalDark)
      ellipticalLeftLink.position.set(-0.4, 0.6, 0.2)
      ellipticalLeftLink.rotation.z = Math.PI/4
      const ellipticalRightLink = new THREE.Mesh(ellipticalLinkageGeo, _metalDark)
      ellipticalRightLink.position.set(0.4, 0.6, -0.2)
      ellipticalRightLink.rotation.z = -Math.PI/4

      // 修改：使用实心圆柱代替空心管
      const ellipticalLeftArm = createCylinder(0.6, 0.02, _metalDark, [-0.6, 0.8, 0.3])
      ellipticalLeftArm.rotation.x = Math.PI/6
      const ellipticalRightArm = createCylinder(0.6, 0.02, _metalDark, [0.6, 0.8, -0.3])
      ellipticalRightArm.rotation.x = Math.PI/6

      const ellipticalPanel = new THREE.Mesh(roundedBox(0.3, 0.25, 0.05, 0.01), _plasticBlue)
      ellipticalPanel.position.set(0, 1.0, 0.15)

      g.add(ellipticalMainFrame, flywheelCover, ellipticalLeftPedal, ellipticalRightPedal, ellipticalLeftLink, ellipticalRightLink, ellipticalLeftArm, ellipticalRightArm, ellipticalPanel)
      break

    case '动感单车':
      const bikeBaseFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.6), _metalDark)
      bikeBaseFrame.position.y = 0.05

      // 修改：使用实心圆柱
      const seatPost = createCylinder(0.8, 0.03, _metalDark, [-0.3, 0.5, 0])
      seatPost.rotation.z = -Math.PI/8

      const bikeSeat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.25), _plasticBlack)
      bikeSeat.position.set(-0.45, 0.85, 0)
      bikeSeat.rotation.z = -Math.PI/8

      const handlePost = createCylinder(0.7, 0.03, _metalDark, [0.3, 0.5, 0])
      handlePost.rotation.z = Math.PI/8

      const handlebar = createCylinder(0.6, 0.02, _metalDark, [0.5, 1.0, 0])
      handlebar.rotation.y = Math.PI/2

      const bikeWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32), _metalLight)
      bikeWheel.position.set(0.5, 0.3, 0)
      bikeWheel.rotation.z = Math.PI/2

      const crankGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8)
      const crank = new THREE.Mesh(crankGeo, _metalDark)
      crank.position.set(0.5, 0.3, 0)

      const bikePedalGeo = new THREE.BoxGeometry(0.15, 0.02, 0.08)
      const leftPedalCycle = new THREE.Mesh(bikePedalGeo, _metalDark)
      leftPedalCycle.position.set(0.67, 0.3, 0)
      const rightPedalCycle = new THREE.Mesh(bikePedalGeo, _metalDark)
      rightPedalCycle.position.set(0.33, 0.3, 0)

      g.add(bikeBaseFrame, seatPost, bikeSeat, handlePost, handlebar, bikeWheel, crank, leftPedalCycle, rightPedalCycle)
      break

    case '划船机':
      const rowerRail = new THREE.Mesh(roundedBox(2.5, 0.1, 0.4, 0.03), _metalDark)
      rowerRail.position.y = 0.05

      const rowerSeat = new THREE.Mesh(roundedBox(0.35, 0.08, 0.3, 0.02), _plasticBlack)
      rowerSeat.position.set(0, 0.15, 0)

      const footPedal = new THREE.Mesh(roundedBox(0.4, 0.03, 0.25, 0.01), _plasticBlack)
      footPedal.position.set(-1.0, 0.15, 0)

      const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.4, 32),
          new THREE.MeshStandardMaterial({
            color: 0x0066cc,
            roughness: 0.1,
            metalness: 0.2,
            transparent: true,
            opacity: 0.7
          }))
      waterTank.position.set(1.0, 0.3, 0)

      const ropeGeo = new THREE.CylinderGeometry(0.008, 0.008, 1.2, 8)
      const rope = new THREE.Mesh(ropeGeo, new THREE.MeshStandardMaterial({ color: 0x444444 }))
      rope.position.set(0.6, 0.4, 0)

      const rowerHandle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.03), _plasticBlack)
      rowerHandle.position.set(0, 0.4, 0)

      g.add(rowerRail, rowerSeat, footPedal, waterTank, rope, rowerHandle)
      break

    case '史密斯机':
      const columnLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 0.1), _metalDark)
      columnLeft.position.set(-0.6, 1.25, 0)
      const columnRight = columnLeft.clone()
      columnRight.position.set(0.6, 1.25, 0)

      const topBeam = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.1), _metalDark)
      topBeam.position.set(0, 2.4, 0)

      const guideRail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.0, 0.05), _metalLight)
      guideRail.position.set(0, 1.0, 0)

      const slider = new THREE.Mesh(roundedBox(0.15, 0.3, 0.15, 0.02), _metalDark)
      slider.position.set(0, 1.0, 0)

      const smithBarbell = createCylinder(1.2, 0.02, _metalDark, [0, 1.0, 0])
      smithBarbell.rotation.x = Math.PI/2

      const smithWeightGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.04, 32)
      const leftSmithWeight = new THREE.Mesh(smithWeightGeo, _metalLight)
      leftSmithWeight.position.set(-0.7, 1.0, 0)
      const rightSmithWeight = leftSmithWeight.clone()
      rightSmithWeight.position.set(0.7, 1.0, 0)

      const safetyPin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), _plasticBlue)
      safetyPin.position.set(0, 0.8, 0.1)

      g.add(columnLeft, columnRight, topBeam, guideRail, slider, smithBarbell, leftSmithWeight, rightSmithWeight, safetyPin)
      break

    case '哑铃架':
      const dumbbellRackBase = new THREE.Mesh(roundedBox(2.0, 1.2, 0.5, 0.05), _metalDark)
      dumbbellRackBase.position.y = 0.6

      const dumbbellPostGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8)
      for(let i = -2; i <= 2; i++) {
        const post = new THREE.Mesh(dumbbellPostGeo, _metalDark)
        post.position.set(i * 0.4, 0.6, 0.2)
        g.add(post)
      }

      const dumbbellBarGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8)
      const dumbbellBar1 = new THREE.Mesh(dumbbellBarGeo, _metalDark)
      dumbbellBar1.position.set(0, 0.2, 0.2)
      dumbbellBar1.rotation.z = Math.PI/2
      const dumbbellBar2 = dumbbellBar1.clone()
      dumbbellBar2.position.y = 1.0

      const dumbbellWeightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 16)
      const dumbbellHandleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8)

      for(let i = 0; i < 3; i++) {
        const leftDumbbellWeight1 = new THREE.Mesh(dumbbellWeightGeo, _metalLight)
        leftDumbbellWeight1.position.set(-0.8 + i*0.4, 0.3, -0.1)
        const leftDumbbellWeight2 = leftDumbbellWeight1.clone()
        leftDumbbellWeight2.position.x = -0.65 + i*0.4
        const leftDumbbellHandle = new THREE.Mesh(dumbbellHandleGeo, _plasticBlack)
        leftDumbbellHandle.position.set(-0.725 + i*0.4, 0.3, -0.1)

        const rightDumbbellWeight1 = new THREE.Mesh(dumbbellWeightGeo, _metalLight)
        rightDumbbellWeight1.position.set(-0.8 + i*0.4, 0.3, 0.1)
        const rightDumbbellWeight2 = rightDumbbellWeight1.clone()
        rightDumbbellWeight2.position.x = -0.65 + i*0.4
        const rightDumbbellHandle = new THREE.Mesh(dumbbellHandleGeo, _plasticBlack)
        rightDumbbellHandle.position.set(-0.725 + i*0.4, 0.3, 0.1)

        g.add(leftDumbbellWeight1, leftDumbbellWeight2, leftDumbbellHandle, rightDumbbellWeight1, rightDumbbellWeight2, rightDumbbellHandle)
      }

      g.add(dumbbellRackBase, dumbbellBar1, dumbbellBar2)
      break

    case '卧推架':
      const benchPressFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.0), _metalDark)
      benchPressFrame.position.y = 0.05

      const bench = new THREE.Mesh(roundedBox(1.8, 0.15, 0.6, 0.03), _plasticBlack)
      bench.position.set(0, 0.125, -0.1)

      const backrest = new THREE.Mesh(roundedBox(0.8, 0.1, 0.6, 0.02), _plasticBlack)
      backrest.position.set(0.4, 0.2, -0.1)
      backrest.rotation.x = Math.PI/6

      const benchSupportLeft = createCylinder(1.2, 0.03, _metalDark, [-0.5, 0.7, 0.3])
      const benchSupportRight = createCylinder(1.2, 0.03, _metalDark, [0.5, 0.7, 0.3])

      const rackHook = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.1), _metalDark)
      rackHook.position.set(-0.5, 0.85, 0.3)
      const rackHook2 = rackHook.clone()
      rackHook2.position.set(0.5, 0.85, 0.3)

      const safetyArm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.05), _metalDark)
      safetyArm.position.set(0, 0.5, 0.3)

      g.add(benchPressFrame, bench, backrest, benchSupportLeft, benchSupportRight, rackHook, rackHook2, safetyArm)
      break

    case '高位下拉':
      const latFrame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.5, 0.8), _metalDark)
      latFrame.position.y = 1.25

      const latWeightGeo = new THREE.BoxGeometry(0.5, 0.05, 0.5)
      for(let i = 0; i < 10; i++) {
        const weight = new THREE.Mesh(latWeightGeo, _metalLight)
        weight.position.set(0, 0.1 + i*0.05, 0.3)
        g.add(weight)
      }

      const latBar = createCylinder(1.0, 0.02, _metalDark, [0, 1.8, 0])
      latBar.rotation.x = Math.PI/2

      const cableGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.5, 8)
      const cable = new THREE.Mesh(cableGeo, new THREE.MeshStandardMaterial({ color: 0x888888 }))
      cable.position.set(0, 1.5, 0.3)

      const latSeat = new THREE.Mesh(roundedBox(0.4, 0.1, 0.4, 0.02), _plasticBlack)
      latSeat.position.set(0, 0.5, -0.2)

      const thighPad = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.1), _rubber)
      thighPad.position.set(0, 0.3, -0.2)

      g.add(latFrame, latBar, cable, latSeat, thighPad)
      break

    case '瑜伽垫':
      const matGeo = new THREE.BoxGeometry(1.8, 0.02, 0.6)
      const mat = new THREE.Mesh(matGeo, new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        roughness: 0.8,
        bumpScale: 0.02
      }))
      mat.position.y = 0.01

      const texture = new THREE.CanvasTexture(createMatTexture())
      mat.material.map = texture
      mat.material.needsUpdate = true

      mat.rotation.x = Math.PI * 0.05
      mat.rotation.z = Math.PI * 0.02

      const matStrapGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.7, 8)
      const matStrap = new THREE.Mesh(matStrapGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }))
      matStrap.position.set(0, 0.1, 0)
      matStrap.rotation.y = Math.PI/2

      g.add(mat, matStrap)
      break

    case '药球':
      const medballGeo = new THREE.SphereGeometry(0.2, 32, 32)
      const medball = new THREE.Mesh(medballGeo, new THREE.MeshStandardMaterial({
        color: 0xFF5722,
        roughness: 0.5,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1
      }))

      const medballPatternGeo = new THREE.TorusGeometry(0.15, 0.02, 8, 16)
      const medballPattern = new THREE.Mesh(medballPatternGeo, new THREE.MeshStandardMaterial({ color: 0xFFFFFF }))
      medballPattern.rotation.x = Math.PI/2

      g.add(medball, medballPattern)
      break

    case '壶铃':
      const kettlebellBellGeo = new THREE.SphereGeometry(0.18, 32, 32)
      const kettlebellBell = new THREE.Mesh(kettlebellBellGeo, _metalDark)

      const kettlebellHandleGeo = new THREE.TorusGeometry(0.1, 0.03, 8, 16)
      const kettlebellHandle = new THREE.Mesh(kettlebellHandleGeo, _metalLight)
      kettlebellHandle.position.y = 0.15

      const kettlebellBaseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.05, 16)
      const kettlebellBase = new THREE.Mesh(kettlebellBaseGeo, _metalDark)
      kettlebellBase.position.y = -0.15

      g.add(kettlebellBell, kettlebellHandle, kettlebellBase)
      break

    case '战绳':
      const battleRopeBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.4), _metalDark)
      battleRopeBase.position.y = 0.05

      const battleRopeAnchor = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), _metalDark)
      battleRopeAnchor.position.set(0, 0.2, 0)

      const ropeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.2, 0),
        new THREE.Vector3(0.5, 0.8, 0.2),
        new THREE.Vector3(0.8, 1.2, -0.3),
        new THREE.Vector3(0.6, 1.5, 0.5),
        new THREE.Vector3(0, 1.8, 0)
      ])

      const ropeTube = new THREE.TubeGeometry(ropeCurve, 64, 0.03, 8, false)
      const ropeMesh = new THREE.Mesh(ropeTube, new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
      }))

      const ropeEnd = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), _plasticBlack)
      ropeEnd.position.set(0, 1.95, 0)

      g.add(battleRopeBase, battleRopeAnchor, ropeMesh, ropeEnd)
      break

    case '泡沫轴':
      const foamRollerGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 32)
      const foamRoller = new THREE.Mesh(foamRollerGeo, new THREE.MeshStandardMaterial({
        color: 0x2196F3,
        roughness: 0.6
      }))

      const foamBumpGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.03, 32)
      for(let i = -4; i <= 4; i++) {
        const bump = new THREE.Mesh(foamBumpGeo, new THREE.MeshStandardMaterial({
          color: 0x1976D2,
          roughness: 0.5
        }))
        bump.position.y = i * 0.1
        g.add(bump)
      }

      const foamEndCapGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.05, 32)
      const foamEndCap1 = new THREE.Mesh(foamEndCapGeo, _plasticBlack)
      foamEndCap1.position.y = 0.525
      const foamEndCap2 = foamEndCap1.clone()
      foamEndCap2.position.y = -0.525

      g.add(foamRoller, foamEndCap1, foamEndCap2)
      break

    case '拉力带':
      const bandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.4, 0.1, 0),
        new THREE.Vector3(-0.2, 0.2, 0.1),
        new THREE.Vector3(0, 0.15, 0),
        new THREE.Vector3(0.2, 0.2, -0.1),
        new THREE.Vector3(0.4, 0.1, 0)
      ])

      const bandGeo = new THREE.TubeGeometry(bandCurve, 32, 0.025, 8, false)
      const band = new THREE.Mesh(bandGeo, new THREE.MeshStandardMaterial({
        color: 0xFF4081,
        roughness: 0.4,
        transparent: true,
        opacity: 0.8
      }))

      const resistanceBandHandleGeo = new THREE.BoxGeometry(0.1, 0.05, 0.05)
      const leftBandHandle = new THREE.Mesh(resistanceBandHandleGeo, _plasticBlack)
      leftBandHandle.position.set(-0.45, 0.1, 0)
      const rightBandHandle = leftBandHandle.clone()
      rightBandHandle.position.set(0.45, 0.1, 0)

      g.add(band, leftBandHandle, rightBandHandle)
      break

    case '健腹轮':
      const abWheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 32)
      const abWheel = new THREE.Mesh(abWheelGeo, _plasticBlue)

      const abHubGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8)
      const abHub = new THREE.Mesh(abHubGeo, _metalLight)

      const abHandleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8)
      const abHandleLeft = new THREE.Mesh(abHandleGeo, _plasticBlack)
      abHandleLeft.position.set(-0.15, 0, 0)
      abHandleLeft.rotation.x = Math.PI/2
      const abHandleRight = abHandleLeft.clone()
      abHandleRight.position.set(0.15, 0, 0)
      abHandleRight.rotation.x = Math.PI/2

      g.add(abWheel, abHub, abHandleLeft, abHandleRight)
      break

    case '平衡盘':
      const balanceDiscGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 32)
      const balanceDisc = new THREE.Mesh(balanceDiscGeo, new THREE.MeshStandardMaterial({
        color: 0x9C27B0,
        roughness: 0.4
      }))

      const balanceBumpGeo = new THREE.SphereGeometry(0.05, 16, 16)
      for(let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const bump = new THREE.Mesh(balanceBumpGeo, new THREE.MeshStandardMaterial({
          color: 0x7B1FA2
        }))
        bump.position.set(Math.cos(angle) * 0.15, 0.04, Math.sin(angle) * 0.15)
        g.add(bump)
      }

      const balanceBottomGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.02, 32)
      const balanceBottom = new THREE.Mesh(balanceBottomGeo, _rubber)
      balanceBottom.position.y = -0.03

      g.add(balanceDisc, balanceBottom)
      break
  }

  g.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })

  return g
}

// 瑜伽垫纹理生成函数
function createMatTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#4CAF50'
  ctx.fillRect(0, 0, 256, 256)

  ctx.strokeStyle = '#388E3C'
  ctx.lineWidth = 2

  for(let i = 0; i < 256; i += 16) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 256)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(256, i)
    ctx.stroke()
  }

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('YOGA', 128, 128)

  return canvas
}

/* ==========================================================
   3. 加载/切换模型
   ========================================================== */
function loadModel(name) {
  if (currentMesh) scene.remove(currentMesh)

  currentMesh = createMesh(name)
  currentMesh.scale.set(2, 2, 2)
  currentMesh.position.set(0, 0, 0)

  // 应用线框模式
  if (wireframeMode.value) {
    currentMesh.traverse((obj) => {
      if (obj.isMesh) {
        obj.material.wireframe = true
      }
    })
  }

  scene.add(currentMesh)
  activeThumb.value = list.value.indexOf(name)
}

/* ==========================================================
   4. 缩略图实时生成（单个渲染器复用，避免 16 个独立 GPU 上下文）
   ========================================================== */
function genThumbs() {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 150
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setSize(200, 150)
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const camera = new THREE.PerspectiveCamera(35, 200 / 150, 0.1, 100)
  camera.position.set(4, 2, 6)

  const scene = new THREE.Scene()
  scene.background = null
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(5, 10, 7)
  scene.add(dirLight)

  thumbs.value = list.value.map(name => {
    const mesh = createMesh(name)
    mesh.scale.set(1.5, 1.5, 1.5)
    scene.add(mesh)
    renderer.render(scene, camera)
    scene.remove(mesh)
    const url = canvas.toDataURL('image/png')
    // 及时释放几何体内存
    mesh.traverse(o => { if (o.isMesh) o.geometry.dispose() })
    return url
  })

  renderer.dispose()
}

/* ==========================================================
   5. 更新模型信息
   ========================================================== */
function updateModelInfo(name) {
  const infoMap = {
    '商用跑步机': 'Professional treadmill with interactive display panel and adjustable settings.',
    '椭圆机': 'Elliptical trainer for low-impact cardio workout with adjustable resistance.',
    '动感单车': 'Indoor cycling bike with adjustable seat and handlebars for intense cardio.',
    '划船机': 'Rowing machine with water resistance system for full-body workout.',
    '史密斯机': 'Smith machine with guided barbell for safe weight training.',
    '哑铃架': 'Dumbbell rack with organized storage for various weight sizes.',
    '卧推架': 'Bench press station with adjustable backrest and safety bars.',
    '高位下拉': 'Lat pulldown machine for back muscle development.',
    '瑜伽垫': 'High-density yoga mat with non-slip surface for comfort.',
    '药球': 'Medicine ball for functional training and core exercises.',
    '壶铃': 'Kettlebell for dynamic strength and cardio workouts.',
    '战绳': 'Battle rope for high-intensity interval training.',
    '泡沫轴': 'Foam roller for muscle recovery and myofascial release.',
    '拉力带': 'Resistance band for strength training and stretching.',
    '健腹轮': 'Ab roller wheel for core strengthening exercises.',
    '平衡盘': 'Balance disc for stability training and rehabilitation.'
  }
  modelInfo.value = infoMap[name] || 'Professional fitness equipment for training.'
}

function updateStats() {
  if (!currentMesh) return

  let vertices = 0
  let triangles = 0

  currentMesh.traverse((obj) => {
    if (obj.isMesh && obj.geometry) {
      vertices += obj.geometry.attributes.position.count
      triangles += obj.geometry.index ? obj.geometry.index.count / 3 : obj.geometry.attributes.position.count / 3
    }
  })

  stats.vertices = vertices
  stats.triangles = triangles
}

/* ==========================================================
   6. 动画循环 & 可见性（标签页隐藏时暂停）
   ========================================================== */
function animate() {
  animFrameId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

function onVisibilityChange() {
  if (document.hidden) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  } else if (!animFrameId) {
    animate()
  }
}

/* ==========================================================
   7. 窗口resize
   ========================================================== */
function onResize() {
  const w = mount.value.clientWidth
  const h = mount.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

/* ==========================================================
   8. 分类 & 缩略图交互
   ========================================================== */
function toggleOpen(cat) {
  cat.open = !cat.open
}

function selectCat(name) {
  activeCat.value = name
  const index = list.value.indexOf(name)
  if (index !== -1) {
    activeThumb.value = index
  }
}

function switchThumb(idx) {
  activeThumb.value = idx
  activeCat.value = list.value[idx]
}
</script>

<style scoped>
/* 开灯模式下的样式覆盖 */
.om-viewer.light-mode {
  background: #ffffff !important;
  color: #333333 !important;
}

.om-viewer.light-mode .top-bar {
  background: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: #333333 !important;
}

.om-viewer.light-mode .logo {
  background: linear-gradient(90deg, #333333, #666666) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.om-viewer.light-mode .tool-btn {
  background: rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: #333333 !important;
}

.om-viewer.light-mode .tool-btn:hover {
  background: rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(0, 0, 0, 0.2) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.om-viewer.light-mode .light-toggle {
  background: rgba(255, 215, 0, 0.2) !important;
  border-color: rgba(255, 215, 0, 0.5) !important;
  color: #b8860b !important;
}

.om-viewer.light-mode .light-toggle:hover {
  background: rgba(255, 215, 0, 0.3) !important;
  border-color: rgba(255, 215, 0, 0.7) !important;
}

.om-viewer.light-mode .side-tree {
  background: rgba(255, 255, 255, 0.9) !important;
  border-right: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: #333333 !important;
}

.om-viewer.light-mode .tree-title {
  color: #666666 !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.om-viewer.light-mode .tree-label {
  color: #444444 !important;
}

.om-viewer.light-mode .tree-label:hover {
  background: rgba(0, 0, 0, 0.05) !important;
  color: #000000 !important;
}

.om-viewer.light-mode .arrow {
  color: #409eff !important;
}

.om-viewer.light-mode .tree-child {
  color: #666666 !important;
}

.om-viewer.light-mode .tree-child:hover {
  color: #333333 !important;
  background: rgba(64, 158, 255, 0.1) !important;
  border-left-color: rgba(64, 158, 255, 0.5) !important;
}

.om-viewer.light-mode .tree-child.active {
  color: #409eff !important;
  background: rgba(64, 158, 255, 0.15) !important;
}

.om-viewer.light-mode .show-area {
  background: rgba(255, 255, 255, 0.9) !important;
}

.om-viewer.light-mode .viewer-header {
  background: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.om-viewer.light-mode .model-title {
  color: #333333 !important;
}

.om-viewer.light-mode .control-btn {
  background: rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: #333333 !important;
}

.om-viewer.light-mode .control-btn:hover {
  background: rgba(0, 0, 0, 0.1) !important;
}

.om-viewer.light-mode .canvas::after {
  background: radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.1) 100%) !important;
}

.om-viewer.light-mode .info-panel {
  background: rgba(255, 255, 255, 0.95) !important;
  border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.om-viewer.light-mode .info-content h3 {
  color: #333333 !important;
}

.om-viewer.light-mode .info-content p {
  color: #666666 !important;
}

.om-viewer.light-mode .stats {
  color: #888888 !important;
}

.om-viewer.light-mode .stats span::before {
  color: #409eff !important;
}

.om-viewer.light-mode .thumb-strip {
  background: rgba(255, 255, 255, 0.95) !important;
  border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.om-viewer.light-mode .thumb-title {
  color: #666666 !important;
}

.om-viewer.light-mode .thumb-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05) !important;
}

.om-viewer.light-mode .thumb-scroll::-webkit-scrollbar-thumb {
  background: rgba(64, 158, 255, 0.5) !important;
}

.om-viewer.light-mode .thumb-cell {
  border-color: transparent !important;
}

.om-viewer.light-mode .thumb-cell:hover {
  border-color: rgba(64, 158, 255, 0.3) !important;
}

.om-viewer.light-mode .thumb-cell.active {
  border-color: #409eff !important;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3) !important;
}

.om-viewer.light-mode .thumb-label {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6)) !important;
  color: #fff !important;
}

/* 基础样式 */
.om-viewer {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
  color: #e0e0e0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  transition: all 0.3s ease;
}

.top-bar {
  height: 60px;
  background: rgba(30, 30, 30, 0.95);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #409eff, #6cb7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tools {
  display: flex;
  gap: 12px;
}

.tool-btn {
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.3);
  color: #409eff;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.tool-btn:hover {
  background: rgba(64, 158, 255, 0.2);
  border-color: rgba(64, 158, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.main-box {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.side-tree {
  width: 260px;
  background: rgba(24, 24, 24, 0.8);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px 0;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.tree-title {
  padding: 0 20px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #888;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.tree-item {
  user-select: none;
}

.tree-label {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #ccc;
}

.tree-label:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.arrow {
  font-size: 10px;
  margin-right: 10px;
  color: #409eff;
  transition: transform 0.3s ease;
}

.tree-children {
  padding-left: 30px;
  overflow: hidden;
}

.tree-child {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #aaa;
  transition: all 0.3s ease;
  border-left: 2px solid transparent;
}

.tree-child:hover {
  color: #fff;
  background: rgba(64, 158, 255, 0.1);
  border-left-color: rgba(64, 158, 255, 0.5);
}

.tree-child.active {
  color: #409eff;
  font-weight: 600;
  background: rgba(64, 158, 255, 0.15);
  border-left-color: #409eff;
}

.show-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(26, 26, 26, 0.8);
  position: relative;
  transition: all 0.3s ease;
}

.viewer-header {
  padding: 20px 28px;
  background: rgba(24, 24, 24, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.model-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.view-controls {
  display: flex;
  gap: 12px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.canvas {
  flex: 1;
  cursor: grab;
  position: relative;
  overflow: hidden;
}

.canvas:active {
  cursor: grabbing;
}

.canvas::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%);
  transition: all 0.3s ease;
}

.info-panel {
  padding: 20px 28px;
  background: rgba(24, 24, 24, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.info-content h3 {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 18px;
}

.info-content p {
  margin: 0 0 16px 0;
  color: #aaa;
  line-height: 1.6;
  font-size: 14px;
}

.stats {
  display: flex;
  gap: 24px;
  color: #888;
  font-size: 13px;
}

.stats span {
  display: flex;
  align-items: center;
}

.stats span::before {
  content: '•';
  color: #409eff;
  margin-right: 8px;
  font-size: 16px;
}

.thumb-strip {
  padding: 20px 28px;
  background: rgba(24, 24, 24, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.thumb-title {
  font-size: 16px;
  font-weight: 600;
  color: #888;
  margin-bottom: 16px;
}

.thumb-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.thumb-scroll::-webkit-scrollbar {
  height: 6px;
}

.thumb-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.thumb-scroll::-webkit-scrollbar-thumb {
  background: rgba(64, 158, 255, 0.5);
  border-radius: 3px;
}

.thumb-cell {
  width: 160px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
}

.thumb-cell:hover {
  transform: translateY(-4px);
  border-color: rgba(64, 158, 255, 0.3);
}

.thumb-cell.active {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.thumb-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: #fff;
  padding: 12px;
  font-size: 13px;
  font-weight: 500;
  z-index: 1;
  text-align: center;
}

.thumb-cell img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.thumb-cell:hover img {
  transform: scale(1.05);
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .side-tree {
    width: 220px;
  }

  .thumb-cell {
    width: 140px;
  }
}

@media (max-width: 768px) {
  .main-box {
    flex-direction: column;
  }

  .side-tree {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .thumb-scroll {
    gap: 12px;
  }

  .thumb-cell {
    width: 120px;
  }

  .thumb-cell img {
    height: 80px;
  }
}
</style>