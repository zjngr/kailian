<template>
  <div class="loading-container">
    <!-- Floating particles -->
    <div class="particles-container" ref="particlesContainer">
      <div v-for="n in 15" :key="n" class="particle"></div>
    </div>

    <!-- Center content -->
    <div class="center-content">
      <!-- Sports icons row -->
      <div class="icons-row" ref="iconsRow">
        <!-- Runner SVG icon -->
        <svg class="sport-icon runner" ref="runnerIcon" viewBox="0 0 100 100" width="76" height="76">
          <circle cx="50" cy="18" r="10" fill="#fff" opacity="0.95"/>
          <line x1="50" y1="28" x2="40" y2="65" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.95"/>
          <line x1="48" y1="38" x2="72" y2="28" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
          <line x1="48" y1="38" x2="25" y2="50" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
          <line x1="40" y1="65" x2="62" y2="82" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.95"/>
          <line x1="40" y1="65" x2="20" y2="88" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.95"/>
        </svg>

        <!-- Heart icon -->
        <svg class="sport-icon heart" ref="heartIcon" viewBox="0 0 100 100" width="46" height="46">
          <path d="M50 88C25 67 5 47 5 28 5 13 18 4 30 8c7 2 13 7 20 15 7-8 13-13 20-15 12-4 25 5 25 20 0 19-20 39-45 60z"
            fill="#ff4757" opacity="0.95"/>
        </svg>
      </div>

      <!-- Main text -->
      <div class="text-animation" ref="textAnimation">
        <span v-for="(char, index) in chars" :key="index" class="char"
          :ref="el => { if (el) charElements[index] = el }">
          {{ char }}
        </span>
      </div>

      <!-- ECG pulse line -->
      <div class="ecg-wrapper" ref="ecgWrapper">
        <svg viewBox="0 0 240 28" width="240" height="28" class="ecg-svg">
          <path d="M0 14 L65 14 L75 3 L85 25 L95 14 L140 14 L150 3 L160 25 L170 14 L240 14"
            fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" ref="ecgPath"/>
        </svg>
      </div>

      <!-- Loading dots -->
      <div class="loading-row" ref="loadingRow">
        <span v-for="n in 3" :key="n" class="load-dot"
          :ref="el => { if (el) dots[n-1] = el }"></span>
      </div>
    </div>

    <!-- Bottom subtitle -->
    <div class="bottom-subtitle" ref="bottomSubtitle">科学运动 · 健康生活</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';

const chars = ['运', '动', '健', '康'];
const charElements = ref([]);
const dots = ref([]);

const particlesContainer = ref(null);
const iconsRow = ref(null);
const runnerIcon = ref(null);
const heartIcon = ref(null);
const textAnimation = ref(null);
const ecgWrapper = ref(null);
const ecgPath = ref(null);
const loadingRow = ref(null);
const bottomSubtitle = ref(null);

// Store GSAP animation references for cleanup
const gsapTimeline = ref(null);
const gsapAnimations = ref([]);

onMounted(() => {
  try {
    startAnimation();
  } catch (e) {
    console.warn('EntryAnimation error:', e);
  }
});

onUnmounted(() => {
  // Kill all GSAP animations to prevent memory leaks
  if (gsapTimeline.value) gsapTimeline.value.kill();
  gsapAnimations.value.forEach(anim => anim.kill());
});

const startAnimation = () => {
  // === Particles ===
  const particleEls = particlesContainer.value?.querySelectorAll('.particle') || [];
  particleEls.forEach((el) => {
    const size = Math.random() * 7 + 3;
    gsap.set(el, {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight + 100,
      width: size,
      height: size,
      opacity: Math.random() * 0.35 + 0.08,
      backgroundColor: `rgba(255,255,255,${Math.random() * 0.25 + 0.08})`,
      borderRadius: '50%',
      position: 'absolute'
    });
    const anim = gsap.to(el, {
      y: -120,
      opacity: 0,
      duration: 4 + Math.random() * 5,
      delay: Math.random() * 3,
      repeat: -1,
      ease: "none"
    });
    gsapAnimations.value.push(anim);
  });

  // === Guard: ensure all required refs exist ===
  const allRefs = [iconsRow.value, runnerIcon.value, heartIcon.value, ecgWrapper.value, loadingRow.value, bottomSubtitle.value];
  if (allRefs.some(r => !r)) return;

  // === Initial states ===
  gsap.set([iconsRow.value, ecgWrapper.value, loadingRow.value, bottomSubtitle.value], { opacity: 0 });
  gsap.set(iconsRow.value, { y: -40, scale: 0.4 });
  gsap.set(runnerIcon.value, { rotation: -20 });
  gsap.set(heartIcon.value, { scale: 0 });

  // Text chars - guard against empty
  if (charElements.value.length >= 4) {
    charElements.value.forEach((el) => {
      if (el) gsap.set(el, { opacity: 0, scale: 0.4 });
    });
    gsap.set(charElements.value[0], { x: -450 });
    gsap.set(charElements.value[1], { y: -450 });
    gsap.set(charElements.value[2], { y: 450 });
    gsap.set(charElements.value[3], { x: 450 });
  }

  // ECG path hide via stroke-dasharray
  const ecgEl = ecgPath.value;
  let ecgLength = 0;
  if (ecgEl) {
    ecgLength = ecgEl.getTotalLength();
    gsap.set(ecgEl, { strokeDasharray: ecgLength, strokeDashoffset: ecgLength });
  }

  // Loading dots - guard against empty
  if (dots.value.length >= 3) {
    gsap.set(dots.value, { scale: 0, opacity: 0 });
  }

  // === Master Timeline ===
  const tl = gsap.timeline();
  gsapTimeline.value = tl;

  // 1. Icons entrance
  tl.to(iconsRow.value, {
    opacity: 1, y: 0, scale: 1,
    duration: 0.7,
    ease: "back.out(1.7)"
  })
  .to(runnerIcon.value, {
    rotation: 0,
    duration: 0.6,
    ease: "elastic.out(1, 0.5)"
  }, "-=0.3")
  .to(heartIcon.value, {
    scale: 1,
    duration: 0.5,
    ease: "back.out(3)"
  }, "-=0.2");

  // 2. Character entrance from 4 directions
  if (charElements.value.length >= 4) {
    tl.to(charElements.value[0], {
      opacity: 1, x: 0, y: 0, scale: 1,
      duration: 1.0,
      ease: "elastic.out(1, 0.5)"
    }, "+=0.15")
    .to(charElements.value[1], {
      opacity: 1, x: 0, y: 0, scale: 1,
      duration: 1.0,
      ease: "elastic.out(1, 0.5)"
    }, "<0.15")
    .to(charElements.value[2], {
      opacity: 1, x: 0, y: 0, scale: 1,
      duration: 1.0,
      ease: "elastic.out(1, 0.5)"
    }, "<0.15")
    .to(charElements.value[3], {
      opacity: 1, x: 0, y: 0, scale: 1,
      duration: 0.8,
      ease: "power2.out"
    }, "<0.15");

    // 3. Correct overshoot for last two chars
    tl.to([charElements.value[2], charElements.value[3]], {
      x: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.6)"
    }, ">0.1");
  }

  // 4. ECG line drawing
  if (ecgEl) {
    tl.to(ecgEl, {
      strokeDashoffset: 0,
      duration: 0.9,
      ease: "power2.inOut"
    }, "-=0.3");
  }

  // 5. Subtitle fade in
  tl.to(bottomSubtitle.value, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.2");

  // 6. Loading dots
  if (dots.value.length >= 3) {
    tl.to(dots.value, {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      ease: "back.out(2.5)",
      stagger: 0.15
    }, "-=0.3");
  }

  // 7. Overall bounce
  tl.to(textAnimation.value, {
    scale: 1.05,
    duration: 0.35,
    ease: "power2.inOut",
    yoyo: true,
    repeat: 1
  }, "+=0.15");

  // === Looping independent animations ===
  const heartAnim = gsap.to(heartIcon.value, {
    scale: 1.2,
    duration: 0.35,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1,
    repeatDelay: 0.9,
    delay: 1.5
  });
  gsapAnimations.value.push(heartAnim);

  const runnerAnim = gsap.to(runnerIcon.value, {
    y: -5,
    duration: 0.55,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    delay: 2
  });
  gsapAnimations.value.push(runnerAnim);
};
</script>

<style scoped>
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #1a6b3c, #2d8a5e, #0d4f2b, #1a8a5c);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.center-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icons-row {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 16px;
}

.sport-icon {
  filter: drop-shadow(0 3px 10px rgba(0, 0, 0, 0.2));
}

.text-animation {
  display: flex;
  gap: 18px;
  perspective: 1000px;
  margin-bottom: 6px;
}

.char {
  font-size: 82px;
  font-weight: 800;
  color: #fff;
  text-shadow:
    0 4px 20px rgba(0, 0, 0, 0.15),
    0 0 50px rgba(255, 255, 255, 0.08);
  letter-spacing: 6px;
  line-height: 1.2;
}

.ecg-wrapper {
  margin-top: 4px;
  height: 28px;
  display: flex;
  justify-content: center;
  overflow: visible;
}

.ecg-svg {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.25));
}

.loading-row {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}

.load-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
}

.bottom-subtitle {
  position: absolute;
  bottom: 60px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 6px;
  font-weight: 300;
}
</style>
