<template>
  <div v-if="isLoaded" >
    <EntryAnimation/>
  </div>

  <!-- 海报部分开始 -->
  <div class="home-banner">
    <div class="banner-container">
      <div class="banner-image">
        <video autoplay muted loop playsinline style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.9);"
               src="/videos/健身房.mp4">
        </video>
      </div>

      <div class="banner-content">
        <div class="content-box">
          <h1 class="banner-title">开启你的健康生活方式</h1>
          <p class="banner-subtitle">专业的动作指导，科学的训练计划，让健康运动成为生活的一部分</p>
          <button class="banner-btn" @click="router.push('/exercisePlan')">
            <span class="btn-text">开练</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- 海报部分结束 -->


  <!-- 核心功能卡片部分 -->
  <section class="features-section">
    <div class="section-title">
      <h2>探索核心功能</h2>
      <p>全方位的健康运动解决方案，助您开启健康生活之旅</p>
    </div>

    <div class="features-container">
      <div
          v-for="(feature, index) in features"
          :key="feature.key"
          class="feature-card"
          :class="`card-${feature.key}`"
          :style="{ transform: `translateY(${getCardOffset(index)}px)` }"
          ref="cardRefs"
      >
        <div class="card-icon">
          <component :is="feature.icon" class="icon" />
        </div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
        <el-button type="success" class="card-btn"  @click="tooljump(feature.url)">{{ feature.buttonText }}</el-button>
      </div>
    </div>
  </section>
  <!-- 核心功能卡片部分 -->

  <!-- 社区互动板块 -->
  <section class="community-section">
    <div class="community-title-container">
      <h2 class="community-title">活力社区 因运动相识</h2>
      <p class="community-subtitle">加入健身社区，分享运动成就与交流心得体会</p>
    </div>

    <div class="community-container" ref="communityContainer">
      <div class="community-poster" :style="{ backgroundImage: `url(${communityImage})` }">
        <div class="gradient-overlay"></div>
        <div class="floating-icons">
          <i class="el-icon-medal"></i>
          <i class="el-icon-thumb"></i>
          <i class="el-icon-user"></i>
        </div>
      </div>
      <div class="activity-intro">
        <div class="intro-icons">
          <div class="icon-item">
            <el-icon class="feature-icon" size="24"><Share /></el-icon>
            <span>健康分享</span>
          </div>
          <div class="icon-item">
            <el-icon class="feature-icon" size="24"><User /></el-icon>
            <span>运动伙伴</span>
          </div>
          <div class="icon-item">
            <el-icon class="feature-icon" size="24"><Lock /></el-icon>
            <span>私密环境</span>
          </div>
        </div>
        <h3>发现共同的健身伙伴 - 开启正向的社交旅程</h3>
        <p class="community-desc">
          在温馨氛围中找到兴趣相投的运动好友，无论你是健身达人还是初学者
          热情讨论运动经历，交流健身疑问，创建正能量健身圈子
          享受私密的健康分享环境，避开公共社交媒体的不相关干扰
        </p>
        <el-button type="success" class="community-btn" @click="tooljump('/chat')">
          <el-icon><Right /></el-icon>开启正能量社交圈
        </el-button>
        <div class="icon-wave">
          <el-icon><Connection /></el-icon>
        </div>
      </div>
    </div>
  </section>

  <!-- 活动宣发板块 -->
  <section class="events-section">
    <div class="section-header">
      <h2 class="section-title">体育赛事活动</h2>
      <p class="section-subtitle">参与精彩体育赛事，挑战自我极限，享受健康生活。我们为您精选各类体育极速赛事活动，总有一款适合您。</p>
    </div>

    <div class="events-container">
      <div
          class="event-card"
          v-for="(event, index) in events"
          :key="event.id"
          :ref="setEventCardRef"
      >
        <div class="card-image">
          <img :src="event.image">
        </div>
        <div class="card-content">
          <h3 class="event-title">
            <el-icon><Trophy /></el-icon>
            {{ event.title }}
          </h3>
          <div class="event-date">
            <el-icon><Calendar /></el-icon>
            {{ event.date }}
          </div>
          <p class="event-description">{{ event.description }}</p>
          <a :href="'http://'+ event.matchurl " target="_blank"  class="event-button">
            <el-icon><Ticket /></el-icon>
            立即报名
          </a>
        </div>
      </div>
    </div>
  </section>

  <!--动作库-->
  <section class="library-section">
    <div class="section-header">
      <h2 class="section-title">专业动作库</h2>
      <p class="section-subtitle">探索丰富健身极速动作，精准掌握每个细节，让训练更加科学高效</p>
    </div>

    <div class="library-container">
      <div class="floating-features">
        <div class="library-feature-card" v-for="(feature, index) in actionFeatures" :key="index">
          <div class="feature-icon">
            <el-icon><component :is="feature.icon" /></el-icon>
          </div>
          <div class="feature-text">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <div class="library-btn-container">
        <el-button type="success" class="library-btn" @click="goToExerciseLibrary">
          <el-icon><Collection /></el-icon>
          浏览动作库
        </el-button>
      </div>
    </div>
  </section>

  <!-- 知识问答板块 - 全宽背景 -->
  <section class="faq-section">
    <div class="section-header">
      <h2 class="faq-section-title">运动健康知识问答</h2>
      <p class="section-subtitle">解答常见运动健康疑问，帮助您科学锻炼，避免误区，享受健康生活</p>
    </div>

    <div class="faq-container">
      <!-- 装饰元素 -->
      <i class="el-icon leaf-decoration leaf-1"><MagicStick /></i>
      <i class="el-icon leaf-decoration leaf-2"><MagicStick /></i>

      <!-- 两列布局 -->
      <div class="faq-columns">
        <div class="faq-column">
          <div
              class="faq-item"
              v-for="(item, index) in currentPageFirstColumnItems"
              :key="'first-'+index"
              :class="{ active: activeIndex === currentPageFirstColumnItems.indexOf(item) }"
              @click="toggleFaq(currentPageFirstColumnItems.indexOf(item))"
          >
            <div class="faq-question">
              <span>
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
                {{ item.question }}
              </span>
              <el-icon class="toggle-icon"><ArrowDown /></el-icon>
            </div>
            <div class="faq-answer">
              <div class="answer-content">
                <el-icon class="answer-icon"><InfoFilled /></el-icon>
                <div>{{ item.answer }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="faq-column">
          <div
              class="faq-item"
              v-for="(item, index) in currentPageSecondColumnItems"
              :key="'second-'+index"
              :class="{ active: activeIndex === currentPageFirstColumnItems.length + index }"
              @click="toggleFaq(currentPageFirstColumnItems.length + index)"
          >
            <div class="faq-question">
              <span>
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
                {{ item.question }}
              </span>
              <el-icon class="toggle-icon"><ArrowDown /></el-icon>
            </div>
            <div class="faq-answer">
              <div class="answer-content">
                <el-icon class="answer-icon"><InfoFilled /></el-icon>
                <div>{{ item.answer }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页按钮 - 无限循环 -->
      <div class="pagination-controls">
        <el-button
            class="pagination-btn prev-btn"
            @click="goToPrevPage"
        >
          <el-icon><ArrowLeft /></el-icon>
          上一页
        </el-button>

        <el-button
            class="pagination-btn next-btn"
            @click="goToNextPage"
        >
          下一页
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <p class="footer-note">更多问题欢迎在社区中提问，我们的专业教练和健身达人会为您解答</p>
  </section>

</template>

<script setup>
import { ref, onMounted, computed, onBeforeUpdate, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import request from "@/utils/request.js";

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger);

// 路由
const router = useRouter();

// 加载入场动画
const isLoaded = ref(true);

// 功能卡片数据
const features = ref([
  {key: 'ai', title: 'AI教练', description: '个性化训练计划，动作识别纠错，实时健身指导', icon: 'MagicStick',
    buttonText: '开始体验',url:'/ai-coach'
  },
  {key: 'message', title: '漂流瓶', description: '匿名交流，寻找健身伙伴，分享运动心得', icon: 'Message',
    buttonText: '扔个瓶子',url:'/driftBottleMain'
  },
  {key: 'start', title: '开练', description: '精选训练课程，多种难度选择，全程跟练指导', icon: 'VideoPlay',
    buttonText: '立即开练',url:'/exercisePlan'
  },
  {key: 'events', title: '比赛宣传', description: '本地健身活动，线上挑战赛，健身达人分享会', icon: 'Calendar',
    buttonText: '查看活动',url:'/eventPromotion'
  },
  {key: 'library', title: '动作库', description: '1000+健身动作详解，分类检索，3D模型演示', icon: 'Collection',
    buttonText: '浏览极速动作',url:'/exercise-library'
  }
]);

// 活动数据 - 使用默认数据，等接口返回后替换
const events = ref([
  {
    id: 1,
    title: '城市马拉松',
    date: '2023年10月15日',
    description: '加入我们一年一度的城市马拉松活动，全程42.195公里，途经城市主要地标建筑和风景名胜区。',
    image: 'huodong.png'
  },
  {
    id: 2,
    title: '半程马拉松',
    date: '2023年11月5日',
    description: '半程马拉松（21.0975公里）适合想要挑战自我但尚未准备好全程马拉松的跑者。',
    image: 'huodong.png'
  },
  {
    id: 3,
    title: '健康欢乐跑',
    date: '2023年12月2日',
    description: '5公里健康欢乐跑，适合所有年龄段和体能水平的人士参与。',
    image: 'huodong.png'
  }
]);

// 其他数据保持不变...
//动作库数据
const actionFeatures = ref([
  {
    icon: 'Collection',
    title: '分类齐全',
    description: '按照身体部位、训练目标分类，轻松找到所需动作'
  },
  {
    icon: 'VideoPlay',
    title: '3D动画演示',
    description: '全方位视角展示极速动作细节，确保标准姿势'
  },
  {
    icon: 'Document',
    title: '详细说明',
    description: '包含动作要领、注意事项和常见错误纠正'
  },
  {
    icon: 'MagicStick',
    title: '个性化推荐',
    description: '根据您的健身目标和水平推荐最适合的动作'
  }
]);

// 知识问答数据 - 扩展更多问题
const faqItems = ref([
  {
    question: "运动前应该做哪些热身活动？",
    answer: "运动前应进行5-10分钟的热身，包括动态拉伸、关节活动和轻度有氧运动，如慢跑或跳绳，以提高心率和体温，预防运动损伤。"
  },
  {
    question: "每周应该进行多少次运动？",
    answer: "世界卫生组织建议成年人每周至少进行150分钟中等强度有氧运动，或75分钟高强度有氧运动，并结合2天以上的力量训练。"
  },
  {
    question: "什么时间运动效果最好？",
    answer: "运动效果因人而异，但研究表明下午4-6点人体体温最高，肌肉最灵活，是进行力量训练的好时机。早晨运动则有助于提升新陈代谢。"
  },
  {
    question: "运动后如何正确补充营养？",
    answer: "运动后30-60分钟内补充蛋白质和碳水化合物最为理想，比例约为1:3到1:4，如鸡胸肉配米饭或蛋白奶昔加香蕉，有助于肌肉恢复和糖原补充。"
  },
  {
    question: "如何避免运动过度？",
    answer: "注意身体的警告信号，如持续疲劳、运动表现下降、睡眠质量变差等。合理安排休息日，保证充足睡眠，并采用周期化极速训练计划。"
  },
  {
    question: "有氧运动和力量训练哪个更重要？",
    answer: "两者都重要且互补。有氧运动改善心血管健康，力量训练增强肌肉和骨骼。建议结合进行，根据个人目标调整比例。"
  },
  {
    question: "运动时应该如何正确呼吸？",
    answer: "力量训练时，发力时呼气，放松时吸气。有氧运动保持深而均匀的呼吸，避免憋气。瑜伽和拉伸配合动作进行呼吸。"
  },
  {
    question: "运动后肌肉酸痛怎么办？",
    answer: "轻度酸痛是正常现象，可通过轻度活动、拉伸、充足水分和蛋白质摄入缓解。剧烈疼痛可能需要休息和咨询专业人士。"
  },
  {
    question: "如何设定合理的健身目标？",
    answer: "使用SMART原则：具体、可衡量、可实现、相关和有时间限制。从小目标开始，逐步增加难度，定期评估进展。"
  },
  {
    question: "运动时应该喝多少水？",
    answer: "运动前2小时喝500ml，运动中每15-20分钟喝150-200ml，运动后根据体重减轻量补充，每减轻0.5kg喝500-700ml。"
  },
  {
    question: "如何选择合适的运动鞋？",
    answer: "根据运动类型选择专业鞋子，考虑足型、缓冲支持和合脚度。最好下午试鞋，因为脚部会轻微肿胀，留出脚趾活动空间。"
  },
  {
    question: "年龄大了还能开始运动吗？",
    answer: "任何时候开始运动都不晚。中老年人应从低强度开始，注重平衡、柔韧性和力量训练，并在专业人士指导下进行。"
  },
  {
    question: "空腹运动是否更有效？",
    answer: "空腹运动可能有助于脂肪燃烧，但可能导致能量不足。建议根据个人情况选择，低血糖者应避免空腹运动。"
  },
  {
    question: "如何提高运动耐力？",
    answer: "逐步增加训练时长和强度，加入间歇训练，保证充足休息和营养，特别是碳水化合物的摄入。"
  },
  {
    question: "运动后多久可以进食？",
    answer: "运动后30-60分钟是补充营养的最佳窗口期，此时身体对营养的吸收利用率最高。"
  },
  {
    question: "如何保持运动动力？",
    answer: "设定明确目标，记录进展，寻找运动伙伴，多样化训练内容，奖励自己，关注健康益处而非体重变化。"
  },
  {
    question: "运动后多久可以进食？",
    answer: "运动后30-60分钟是补充营养的最佳窗口期，此时身体对营养的吸收利用率最高。"
  },
  {
    question: "如何保持运动动力？",
    answer: "设定明确目标，记录进展，寻找运动伙伴，多样化训练内容，奖励自己，关注健康益处而非体重变化。"
  }
]);

// 分页相关变量
const itemsPerPage = 6;
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(faqItems.value.length / itemsPerPage));

// 当前页显示的问题
const currentPageItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return faqItems.value.slice(startIndex, startIndex + itemsPerPage);
});

// 将当前页问题分成两列
const currentPageFirstColumnItems = computed(() => {
  return currentPageItems.value.slice(0, Math.ceil(currentPageItems.value.length / 2));
});

const currentPageSecondColumnItems = computed(() => {
  return currentPageItems.value.slice(Math.ceil(currentPageItems.value.length / 2));
});

// 当前激活的问题索引
const activeIndex = ref(null);

// 功能按钮的跳转
const tooljump = (url) => {
  router.push(url);
}

// 无限循环切换页面
const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  } else {
    currentPage.value = 1;
  }
  activeIndex.value = null;
};

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  } else {
    currentPage.value = totalPages.value;
  }
  activeIndex.value = null;
};

// 切换问题显示
const toggleFaq = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

// 跳转动作库页面
const goToExerciseLibrary = () => {
  router.push('/exercise-library');
};

// 卡片引用
const cardRefs = ref([]);

// 图片加载函数
const getImageUrl = (name) => {
  return new URL(`../assets/${name}`, import.meta.url).href;
};

// 获取海报图片路径
const bannerImage = ref(getImageUrl('haibao.png'));
const communityImage = ref(getImageUrl('shequ.png'));

// 活动宣发卡片引用
let eventCardElements = [];

// 跳转到报名页面
const goToRegistration = (link) => {
  window.open('http://'+link);
};

// 设置卡片引用的函数
const setEventCardRef = (el) => {
  if (el && !eventCardElements.includes(el)) {
    eventCardElements.push(el);
  }
}

// 社区容器引用
const communityContainer = ref(null);

// 入场动画
const entryAnimation = async () => {
  try {
    if (sessionStorage.getItem('isLoaded') != null) {
      isLoaded.value = false;
    } else {
      await new Promise(resolve => setTimeout(resolve, 2300));
      isLoaded.value = false;
      sessionStorage.setItem("isLoaded", "false");
    }
  } catch (e) {
    console.warn('Entry animation error:', e);
    isLoaded.value = false;
  }
}

// 在组件更新前清空引用数组
onBeforeUpdate(() => {
  eventCardElements = [];
});

// 卡片错位偏移量
const getCardOffset = (index) => {
  const offsets = [0, -40, 40, -20, 0];
  return offsets[index] || 0;
}

// 核心功能动画
const initAnimations = () => {
  if (!cardRefs.value || cardRefs.value.length === 0) return;

  cardRefs.value.forEach((card, index) => {
    if (!card) return;

    gsap.fromTo(card,
        {
          y: 100,
          opacity: 0,
          scale: 0.8
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.8)",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none"
          },
          delay: index * 0.2
        }
    );
  });
}

// 社区动画
const initCommunityAnimation = () => {
  if (!communityContainer.value) return;

  gsap.fromTo(communityContainer.value,
      {
        y: 200,
        opacity: 0,
        scale: 0.95
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "elastic.out(1, 0.8)",
        scrollTrigger: {
          trigger: communityContainer.value,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      }
  );
}

// 初始化活动宣发GSAP动画
const initEventsAnimations = () => {
  if (eventCardElements.length === 0) return;

  eventCardElements.forEach((card, index) => {
    if (!card) return;

    gsap.fromTo(card,
        {
          y: 100,
          opacity: 0,
          scale: 0.9,
          rotation: -5
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none"
          },
          delay: index * 0.2
        }
    );
  });
}

// 初始化FAQ动画
const initFaqAnimations = () => {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item, index) => {
    gsap.fromTo(item,
        {
          y: 50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none none"
          },
          delay: index * 0.1
        }
    );
  });
};

// 数据格式化函数 - 根据接口返回数据结构适配
const formatEventData = (data) => {
  if (!data || !Array.isArray(data)) {
    return events.value; // 返回默认数据
  }

  return data.map((event, index) => {
    return {
      id: event.aid || event.id || index + 1,
      title: event.aname || event.title || `活动 ${index + 1}`,
      date: formatDate(event.adatatime || event.date) || '日期待定',
      description: event.acontent || event.description || '活动详情待更新',
      image: event.image || 'huodong.png',
      matchurl:event.matchurl

    };
  });
};

// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  } catch (error) {
    return dateString;
  }
};

// 初始化数据
const initData = async () => {
  try {
    const res = await request.get("/eventshare/selectnewevent");

    if (res.code === "200" && res.data) {
      // 直接替换数据，Vue会自动更新DOM
      events.value = formatEventData(res.data);  //数据经过处理了
    }
  } catch (error) {
    console.error('数据加载失败:', error);
    // 保持默认数据，不显示错误信息
  }
};

// 重新初始化动画（数据更新后调用）
const reinitAnimations = () => {
  // 销毁所有现有的ScrollTrigger
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.animation) {
      trigger.animation.progress(0).kill();
    }
    trigger.kill();
  });

  // 等待DOM更新后重新初始化动画
  nextTick(() => {
    setTimeout(() => {
      initAnimations();
      initCommunityAnimation();
      initEventsAnimations();
      initFaqAnimations();

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }, 300);
  });
}

onMounted(async () => {
  // 安全网：5秒后强制隐藏入场动画
  const safetyTimer = setTimeout(() => { isLoaded.value = false; }, 5000);

  // 1. 先执行入场动画
  await entryAnimation();
  clearTimeout(safetyTimer);

  // 2. 初始化默认数据的动画
  setTimeout(() => {
    initAnimations();
    initCommunityAnimation();
    initEventsAnimations();
    initFaqAnimations();

    ScrollTrigger.refresh();
  }, 100);

  // 3. 异步加载数据（不阻塞页面展示）
  initData().then(() => {
    // 数据加载完成后重新初始化动画
    reinitAnimations();
  });
});

// 暴露方法供父组件调用
defineExpose({
  replayAnimations: reinitAnimations
});
</script>
<!--<script setup>
import { ref, onMounted,computed, onBeforeUpdate } from 'vue';
import {useRouter,useRoute} from 'vue-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger)

// 功能卡片数据
const features = ref([
  {key: 'ai', title: 'AI教练', description: '个性化训练计划，动作识别纠错，实时健身指导', icon: 'MagicStick',
    buttonText: '开始体验',url:'/ai-coach'
  },
  {key: 'message', title: '漂流瓶', description: '匿名交流，寻找健身伙伴，分享运动心得', icon: 'Message',
    buttonText: '扔个瓶子',url:'/driftBottleMain'
  },
  {key: 'start', title: '开练', description: '精选训练课程，多种难度选择，全程跟练指导', icon: 'VideoPlay',
    buttonText: '立即开练',url:'/exercisePlan'
  },
  {key: 'events', title: '比赛宣传', description: '本地健身活动，线上挑战赛，健身达人分享会', icon: 'Calendar',
    buttonText: '查看活动',url:'/eventPromotion'
  },
  {key: 'library', title: '动作库', description: '1000+健身动作详解，分类检索，3D模型演示', icon: 'Collection',
    buttonText: '浏览极速动作',url:'/exercise-library'
  }
])

//加载入场动画
const isLoaded=ref(true);

// 活动数据
const events = ref([
  {
    id: 1,
    title: '城市马拉松',
    date: '2023年10月15日',
    description: '加入我们一年一度的城市马拉松活动，全程42.195公里，途经城市主要地标建筑和风景名胜区。无论您是专业选手还是业余爱好者，这都将是一次难忘的体验。',
    image: 'huodong.png'
  },
  {
    id: 2,
    title: '半程马拉松',
    date: '2023年11月5日',
    description: '半程马拉松（21.0975公里）适合想要挑战自我但尚未准备好全程马拉松的跑者。路线经过精心设计，平坦且风景优美，让您在奔跑中享受乐趣。',
    image: 'huodong.png'
  },
  {
    id: 3,
    title: '健康欢乐跑',
    date: '2023年12月2日',
    description: '5公里健康欢乐跑，适合所有年龄段和体能水平的人士参与。活动注重参与和乐趣而非竞赛，是家庭和朋友团体共同体验运动乐趣的完美选择。',
    image: 'huodong.png'
  }
])

//动作库数据
const actionFeatures = ref([
  {
    icon: 'Collection',
    title: '分类齐全',
    description: '按照身体部位、训练目标分类，轻松找到所需动作'
  },
  {
    icon: 'VideoPlay',
    title: '3D动画演示',
    description: '全方位视角展示极速动作细节，确保标准姿势'
  },
  {
    icon: 'Document',
    title: '详细说明',
    description: '包含动作要领、注意事项和常见错误纠正'
  },
  {
    icon: 'MagicStick',
    title: '个性化推荐',
    description: '根据您的健身目标和水平推荐最适合的动作'
  }
]);

//路由
const router=useRouter()

// 知识问答数据 - 扩展更多问题
const faqItems = ref([
  {
    question: "运动前应该做哪些热身活动？",
    answer: "运动前应进行5-10分钟的热身，包括动态拉伸、关节活动和轻度有氧运动，如慢跑或跳绳，以提高心率和体温，预防运动损伤。"
  },
  {
    question: "每周应该进行多少次运动？",
    answer: "世界卫生组织建议成年人每周至少进行150分钟中等强度有氧运动，或75分钟高强度有氧运动，并结合2天以上的力量训练。"
  },
  {
    question: "什么时间运动效果最好？",
    answer: "运动效果因人而异，但研究表明下午4-6点人体体温最高，肌肉最灵活，是进行力量训练的好时机。早晨运动则有助于提升新陈代谢。"
  },
  {
    question: "运动后如何正确补充营养？",
    answer: "运动后30-60分钟内补充蛋白质和碳水化合物最为理想，比例约为1:3到1:4，如鸡胸肉配米饭或蛋白奶昔加香蕉，有助于肌肉恢复和糖原补充。"
  },
  {
    question: "如何避免运动过度？",
    answer: "注意身体的警告信号，如持续疲劳、运动表现下降、睡眠质量变差等。合理安排休息日，保证充足睡眠，并采用周期化极速训练计划。"
  },
  {
    question: "有氧运动和力量训练哪个更重要？",
    answer: "两者都重要且互补。有氧运动改善心血管健康，力量训练增强肌肉和骨骼。建议结合进行，根据个人目标调整比例。"
  },
  {
    question: "运动时应该如何正确呼吸？",
    answer: "力量训练时，发力时呼气，放松时吸气。有氧运动保持深而均匀的呼吸，避免憋气。瑜伽和拉伸配合动作进行呼吸。"
  },
  {
    question: "运动后肌肉酸痛怎么办？",
    answer: "轻度酸痛是正常现象，可通过轻度活动、拉伸、充足水分和蛋白质摄入缓解。剧烈疼痛可能需要休息和咨询专业人士。"
  },
  {
    question: "如何设定合理的健身目标？",
    answer: "使用SMART原则：具体、可衡量、可实现、相关和有时间限制。从小目标开始，逐步增加难度，定期评估进展。"
  },
  {
    question: "运动时应该喝多少水？",
    answer: "运动前2小时喝500ml，运动中每15-20分钟喝150-200ml，运动后根据体重减轻量补充，每减轻0.5kg喝500-700ml。"
  },
  {
    question: "如何选择合适的运动鞋？",
    answer: "根据运动类型选择专业鞋子，考虑足型、缓冲支持和合脚度。最好下午试鞋，因为脚部会轻微肿胀，留出脚趾活动空间。"
  },
  {
    question: "年龄大了还能开始运动吗？",
    answer: "任何时候开始运动都不晚。中老年人应从低强度开始，注重平衡、柔韧性和力量训练，并在专业人士指导下进行。"
  },
  {
    question: "空腹运动是否更有效？",
    answer: "空腹运动可能有助于脂肪燃烧，但可能导致能量不足。建议根据个人情况选择，低血糖者应避免空腹运动。"
  },
  {
    question: "如何提高运动耐力？",
    answer: "逐步增加训练时长和强度，加入间歇训练，保证充足休息和营养，特别是碳水化合物的摄入。"
  },
  {
    question: "运动后多久可以进食？",
    answer: "运动后30-60分钟是补充营养的最佳窗口期，此时身体对营养的吸收利用率最高。"
  },
  {
    question: "如何保持运动动力？",
    answer: "设定明确目标，记录进展，寻找运动伙伴，多样化训练内容，奖励自己，关注健康益处而非体重变化。"
  },
  {
    question: "运动后多久可以进食？",
    answer: "运动后30-60分钟是补充营养的最佳窗口期，此时身体对营养的吸收利用率最高。"
  },
  {
    question: "如何保持运动动力？",
    answer: "设定明确目标，记录进展，寻找运动伙伴，多样化训练内容，奖励自己，关注健康益处而非体重变化。"
  }
]);

// 分页相关变量
const itemsPerPage = 6; // 每页显示6个问题
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(faqItems.value.length / itemsPerPage));

// 当前页显示的问题
const currentPageItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return faqItems.value.slice(startIndex, startIndex + itemsPerPage);
});

// 将当前页问题分成两列
const currentPageFirstColumnItems = computed(() => {
  return currentPageItems.value.slice(0, Math.ceil(currentPageItems.value.length / 2));
});

const currentPageSecondColumnItems = computed(() => {
  return currentPageItems.value.slice(Math.ceil(currentPageItems.value.length / 2));
});

//功能按钮的跳转
const tooljump=  (url)=>{
   router.push(url)
}

// 无限循环切换页面
const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  } else {
    currentPage.value = 1; // 循环到第一页
  }
  activeIndex.value = null; // 重置展开的问题
};

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value&#45;&#45;;
  } else {
    currentPage.value = totalPages.value; // 循环到最后一页
  }
  activeIndex.value = null; // 重置展开的问题
};


// 当前激活的问题索引
const activeIndex = ref(null);

// 切换问题显示
const toggleFaq = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

//跳转动作库页面
const goToExerciseLibrary = () => {
  router.push('/exercise-library')
};

// 卡片引用
const cardRefs = ref([])

// 图片加载函数
const getImageUrl = (name) => {
  return new URL(`../assets/${name}`, import.meta.url).href;
};

// 获取海报图片路径
const  bannerImage = ref(getImageUrl('haibao.png'));

// 获取社区图片路径
const communityImage = ref(getImageUrl('shequ.png'))

// 活动宣发卡片引用
const eventCardRefs = ref([])
let eventCardElements = []

// 设置卡片引用的函数
const setEventCardRef = (el) => {
  if (el) {
    eventCardElements.push(el)
  }
}

//入场动画
const entryAnimation=async ()=>{
  // 模拟数据加载
  if (sessionStorage.getItem('isLoaded')!=null) {  //检查 sessionStorage中是否存在 isLoaded标记
    isLoaded.value= false;
  }else{await new Promise(resolve => setTimeout(resolve, 2300));   //创建一个 （2.3秒）的延时，模拟加载动画的展示时间
    isLoaded.value = false;
    sessionStorage.setItem("isLoaded", false)}
}

// 在组件更新前清空引用数组
onBeforeUpdate(() => {
  eventCardElements = []
})

//核心功能动画
// 初始化GSAP动画
const initAnimations = () => {
  cardRefs.value.forEach((card, index) => {
    gsap.fromTo(card,
        {
          y: 100,
          opacity: 0,
          scale: 0.8
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.8)",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none"
          },
          delay: index * 0.2
        }
    )
  })
}

// 卡片错位偏移量
const getCardOffset = (index) => {
  const offsets = [0, -40, 40, -20, 0]
  return offsets[index] || 0
}

// 重播动画方法
const replayAnimations = () => {
  gsap.to(cardRefs.value, {
    opacity: 0,
    y: 100,
    scale: 0.8,
    duration: 0.5,
    onComplete: () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.refresh())
      gsap.to(cardRefs.value, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "elastic.out(1, 0.8)"
      })
    }
  })
}

//社区动画
// 获取卡片容器引用
const communityContainer = ref(null)

// 初始化社区GSAP动画
const initCommunityAnimation = () => {
  if (!communityContainer.value) return

  gsap.fromTo(communityContainer.value,
      {
        y: 200,
        opacity: 0,
        scale: 0.95
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "elastic.out(1, 0.8)",
        scrollTrigger: {
          trigger: communityContainer.value,
          start: "top 90%",
          toggleActions: "play none none none",
          markers: false
        }
      }
  )
}

// 初始化活动宣发GSAP动画
const initEventsAnimations = () => {
  // 确保DOM元素已加载
  setTimeout(() => {
    eventCardElements.forEach((card, index) => {
      if (card) {
        gsap.fromTo(card,
            {
              y: 100,
              opacity: 0,
              scale: 0.9,
              rotation: -5
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.8,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none",
                markers: false
              },
              delay: index * 0.2
            }
        )
      }
    })
  }, 300) // 增加延迟确保DOM完全加载
}

// 初始化动画
const initFaqAnimations = () => {
  gsap.utils.toArray('.faq-item').forEach((item, index) => {
    gsap.fromTo(item,
        {
          y: 50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none none"
          },
          delay: index * 0.1
        }
    );
  });
};

//初始化数据
const initData=async ()=>{
  //获取最新的三个数据
  request.get("eventshare/selectnewevent").then((res)=>{
    if (res.code === "200"){
      events.value=res.data;
    }else{
      ElMessage.error(res.msg)
    }
  })
}

onMounted(  async () => {
   await entryAnimation() //入场动画
   await initData();  //初始化数据
  // 确保DOM完全加载后初始化动画
  setTimeout(() => {
    initAnimations()
    initCommunityAnimation()
    initEventsAnimations()

    // 刷新ScrollTrigger以确保正确计算位置
    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 500)
  }, 100)

  setTimeout(() => {
    initFaqAnimations(); // 使用新的函数名称
    ScrollTrigger.refresh();
  }, 100);

  return {
    faqItems,
    currentPage,
    activeIndex,
    toggleFaq,
    currentPageFirstColumnItems,
    currentPageSecondColumnItems,
    goToNextPage,
    goToPrevPage
  };

})

// 暴露方法供父组件调用
defineExpose({
  replayAnimations
})
</script>-->

<style scoped>

/* 海报 */
.home-banner {
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
  margin-top: 0;
  z-index: 2;
}

.banner-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.banner-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.banner-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
}

.content-box {
  background: rgba(255, 255, 255, 0.78);
  border-radius: 20px;
  padding: 3.5rem 4.5rem;
  max-width: 780px;
  text-align: center;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transform: translateY(15px);
  animation: floatUp 1s ease-out forwards;
  opacity: 0;
}

.banner-title {
  font-size: 3.4rem;
  font-weight: 800;
  color: #2e7d32;
  margin-bottom: 1.5rem;
  line-height: 1.25;
  letter-spacing: 0.5px;
}

.banner-subtitle {
  font-size: 1.45rem;
  color: #424242;
  line-height: 1.7;
  margin-bottom: 2.8rem;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
  font-weight: 500;
}

/* 按钮优化部分 */
.banner-btn {
  background: linear-gradient(to bottom right, #2e7d32, #4caf50);
  color: white;
  border: none;
  padding: 1.3rem 4.2rem;
  font-size: 1.4rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.35);
  position: relative;
  overflow: hidden;
  letter-spacing: 1px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.banner-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom right, #43a047, #388e3c);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1;
}

.banner-btn .btn-text {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.banner-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(76, 175, 80, 0.5);
}

.banner-btn:hover::after {
  opacity: 1;
}

.banner-btn:hover .btn-text {
  transform: scale(1.08);
}

/* 动画效果 */
@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}



/* 功能卡片部分样式 */
.features-section {
  min-height: 88vh;
  padding: 1.5rem 1rem;
  background: linear-gradient(to bottom, #e9f7e3, #f8fdf0);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.features-section .section-title {
  text-align: center;
  margin-bottom: 4rem;
  animation: fadeIn 0.8s ease-out forwards;
  max-width: 800px;
  z-index: 10;
}

.features-section .section-title h2 {
  font-size: 2.6rem;
  font-weight: 800;
  color: #2e7d32;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

.features-section .section-title h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 5px;
  background: #4caf50;
  border-radius: 3px;
}

.features-section .section-title p {
  font-size: 1.2rem;
  color: #555;
  line-height: 1.7;
  margin: 0;
}

/* 卡片容器 - 保持水平滚动 */
.features-container {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 1.5rem;
  max-width: 2000px;
  width: 100%;
  padding: 0 15px;
  box-sizing: border-box;
  margin: 0 auto;
  overflow-x: auto;
  scrollbar-width: none;
}

.features-container::-webkit-scrollbar {
  display: none;
}

/* 卡片基础样式 */
.feature-card {
  margin-top: 50px;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  padding: 1.3rem;
  box-shadow:
      0 15px 30px rgba(76, 175, 80, 0.15),
      0 8px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.4s ease;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
  width: 200px;
  flex-shrink: 0;
}

/* 卡片错位效果 */
.card-ai { transform: translateY(-24px) !important; }
.card-message { transform: translateY(28px) !important; }
.card-start { transform: translateY(-24px) !important; }
.card-events { transform: translateY(28px) !important; }
.card-library { transform: translateY(-24px) !important; }

/* 卡片悬停效果 */
.feature-card:hover {
  transform: translateY(-10px) !important;
  box-shadow:
      0 20px 45px rgba(76, 175, 80, 0.25),
      0 12px 25px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* 卡片图标样式 */
.card-icon {
  width: 85px;
  height: 85px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  transition: all 0.4s ease;
}

.feature-card:hover .card-icon {
  transform: scale(1.08);
  background: rgba(76, 175, 80, 0.15);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 3.2rem;
  color: #2e7d32;
}

/* 卡片文字样式 */
.feature-card h3 {
  font-size: 1.65rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 700;
}

.feature-card p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1.8rem;
  font-size: 1rem;
  flex-grow: 1;
}

/* 按钮样式 */
.card-btn {
  padding: 0.9rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.3s ease;
  background-color: #4caf50;
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.card-btn:hover {
  transform: translateY(-4px);
  background-color: #43a047;
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  border-radius: 18px 18px 0 0;
  z-index: 2;
}

.card-ai::before { background: linear-gradient(90deg, #ff6b6b, #ff8e53); }
.card-message::before { background: linear-gradient(90deg, #4facfe, #00f2fe); }
.card-start::before { background: linear-gradient(90deg, #42e695, #3bb2b8); }
.card-events::before { background: linear-gradient(90deg, #ff9a9e, #fad0c4); }
.card-library::before { background: linear-gradient(90deg, #a18cd1, #fbc2eb); }

/* 响应式设计 */
@media (max-width: 1400px) {
  .features-container {
    max-width: 1200px;
    gap: 1.2rem;
  }

  .feature-card {
    width: 225px;
    padding: 1.6rem;
  }
}

@media (max-width: 1200px) {
  .features-container {
    max-width: 1100px;
    gap: 1rem;
  }

  .feature-card {
    width: 210px;
    padding: 1.5rem;
  }

  .card-icon {
    width: 80px;
    height: 80px;
  }

  .icon {
    font-size: 3rem;
  }

  .feature-card h3 {
    font-size: 1.55rem;
  }

  .feature-card p {
    font-size: 0.95rem;
  }
}

@media (max-width: 992px) {
  .features-section {
    padding: 4rem 1rem;
  }

  .section-title {
    margin-bottom: 3rem;
  }

  .section-title h2 {
    font-size: 2.3rem;
  }

  .section-title p {
    font-size: 1.1rem;
  }

  .features-container {
    gap: 1rem;
    max-width: 950px;
  }

  .feature-card {
    width: 220px;
    transform: translateY(0) !important;
  }

  .feature-card:hover {
    transform: translateY(-8px) !important;
  }

  .card-icon {
    width: 75px;
    height: 75px;
  }

  .icon {
    font-size: 2.8rem;
  }

  .feature-card h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .features-container {
    padding: 0 10px;
    max-width: 800px;
  }

  .feature-card {
    width: 220px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 社区互动板块 - 全宽淡绿色背景 */
.community-section {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-bottom: 0px;
  padding: 80px 0;
  overflow: visible;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.15);
  border-radius: 0;
}

.community-title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
  margin-bottom: 60px;
  max-width: 1280px;
  padding: 0 40px;
}

.community-title {
  margin: 10px 0 15px;
  font-size: 2.5rem;
  color: #1c704f;
  background: linear-gradient(to bottom, #37a86c, #1c704f);
  -webkit-background-clip: text;
  background-clip: text;
  font-weight: 800;
  letter-spacing: 1px;
  position: relative;
  display: inline-block;
}

.community-title::after {
  content: '';
  display: block;
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #37a86c, #1c704f);
  border-radius: 2px;
  margin: 15px auto;
}

.community-subtitle {
  font-size: 1.3rem;
  color: #000000;
  max-width: 600px;
  margin: 15px auto 0;
  line-height: 1.6;
}

/* 主题区域设计动画 */
.community-container {
  display: flex;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  box-shadow:
      0 20px 45px rgba(0, 55, 42, 0.15),
      0 10px 20px rgba(76, 175, 80, 0.15);
  transform-style: preserve-3d;
  transition: transform 0.4s ease, box-shadow 0.3s ease;
  height: 480px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.community-container::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 70%;
  width: 30px;
  height: 300px;
  background: linear-gradient(to bottom, transparent, rgba(108, 226, 165, 0.25), transparent);
  transform: rotateZ(25deg);
  animation: light-sweep 8s infinite linear;
}

@keyframes light-sweep {
  0% { left: -50px; }
  100% { left: calc(100% + 50px); }
}

.community-poster {
  flex: 1;
  background-color: #a4f1d4;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  padding: 0;
  transition: transform 0.35s ease-out 110ms;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.community-poster::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(27, 94, 62, 0.1), transparent);
  z-index: 1;
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(
      0deg,
      rgba(15, 61, 36, 0.4) -4.13%,
      rgba(1, 22, 18, 0) 80.95%
  );
  z-index: 2;
}

.floating-icons {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}

.floating-icons i {
  position: absolute;
  font-size: 2.2rem;
  color: rgba(255, 255, 255, 0.7);
  animation: float-element 8s infinite ease-in-out;
}

.floating-icons i:nth-child(1) {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.floating-icons i:nth-child(2) {
  top: 40%;
  left: 75%;
  animation-delay: -2s;
}

.floating-icons i:nth-child(3) {
  top: 70%;
  left: 30%;
  animation-delay: -4s;
}

@keyframes float-element {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-10px, -15px); }
  50% { transform: translate(5px, 10px); }
  75% { transform: translate(10px, -5px); }
}

.activity-intro {
  flex: 1.2;
  background:
      linear-gradient(to bottom, #f0fcf7, #effef9);
  padding: 40px 50px;
  position: relative;
}

.activity-intro::after {
  content: '';
  width: 200%;
  left: -50%;
  border-radius: 40%;
  background: rgba(203, 253, 218, 0.14);
  transform: rotate(-3deg);
  transform-origin: top center;
  height: 6%;
  top: 15px;
  position: absolute;
}

.icon-wave {
  position: absolute;
  right: 30px;
  bottom: 35px;
  font-size: 2.5rem;
  color: rgba(27, 94, 62, 0.15);
  animation: pulse 3s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

/* 修复图标排列问题 - 确保图标横向排列 */
.intro-icons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
  gap: 15px;
  flex-wrap: nowrap; /* 添加此属性防止换行 */
}

.intro-icons::after {
  content: '';
  width: 95px;
  position: absolute;
  border-bottom: 2.2px dotted #57b99a85;
  bottom: -7px;
  left: 0;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
  min-width: 80px; /* 添加最小宽度防止挤压 */
}

.feature-icon {
  background-color: #23ad7821;
  height: 52px;
  width: 52px;
  color: #38b97a;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  padding: 8px;
  font-size: 1.4rem;
}

.icon-item span {
  font-size: 0.95rem;
  color: #3a6b52;
  font-weight: 500;
  text-align: center;
}

.icon-item:hover .feature-icon {
  background-color: #34cc8f3f;
  color: #107a4f;
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(52, 152, 103, 0.3);
}

.activity-intro h3 {
  font-weight: 650;
  font-size: 1.8rem;
  color: #136142;
  line-height: 1.4;
  margin: 20px 0 15px;
}

.community-desc {
  line-height: 1.85;
  margin-bottom: 25px;
  text-align: justify;
  letter-spacing: 0;
  font-size: 1.15rem;
  font-weight: 410;
  padding-right: 15px;
  border-left: 4px solid #90ddd9;
  padding-left: 20px;
  color: #205341;
}

.community-btn {
  min-height: 55px;
  width: 300px;
  position: relative;
  background: linear-gradient(45deg,#27b67f,#3bb77d) !important;
  color: white !important;
  border: 0 !important;
  font-weight: 600;
  border-radius: 12px;
  font-size: 1.15rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(27, 147, 95, 0.4);
  overflow: hidden;
  padding: 0 25px;
}

.community-btn .el-icon {
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.community-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(27, 147, 95, 0.6);
}

.community-btn:hover .el-icon {
  transform: translateX(5px);
}

.community-btn:active {
  transform: translateY(0);
}

.community-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left 0.6s ease;
}

.community-btn:hover::after {
  left: 100%;
}

.community-container:hover {
  transform: translateY(-6px);
  box-shadow:
      0 35px 70px rgba(8, 101, 60, 0.25),
      0 15px 25px rgba(78,189,110,0.3);
}

.community-container:hover .community-poster {
  transform: scale(1.03);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-12px) rotate(1.5deg);
  }
  50% {
    transform: translateY(8px) rotate(-1.5deg);
  }
  75% {
    transform: translateY(-8px) rotate(1deg);
  }
}

/* 活动宣发板块 - 全宽淡绿色背景 */
.events-section {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 60px 0;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.15);
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.events-section .section-header {
  text-align: center;
  margin-bottom: 50px;
}

.events-section .section-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #2d6a4f;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.events-section .section-title::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 5px;
  background: linear-gradient(90deg, #40916c, #95d5b2);
  border-radius: 3px;
}

.events-section .section-subtitle {
  font-size: 1.2rem;
  color: #000000;
  max-width: 700px;
  margin: 25px auto 0;
  line-height: 1.7;
  font-weight: 500;
}

.events-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 35px;
  margin-top: 0px;
}

.event-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-top: 5px solid #40916c;
}

.event-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 25px 30px -10px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  position: relative;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.event-card:hover .card-image img {
  transform: scale(1.08);
}

.card-content {
  padding: 28px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.event-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d6a4f;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.event-date {
  color: #40916c;
  font-weight: 500;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
}

.event-description {
  color: #52796f;
  line-height: 1.7;
  margin-bottom: 25px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 1.05rem;
}

.event-button {
  background: linear-gradient(90deg, #40916c, #74c69d);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.05rem;
  box-shadow: 0 4px 10px rgba(116, 198, 157, 0.3);
}

.event-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(116, 198, 157, 0.4);
  background: linear-gradient(90deg, #347a5a, #5cb48a);
}

.events-section .events-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 80px; /* 这里修改为您想要的间距值 */
  margin-top: 40px;
}

/*动作库*/
.library-section {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 60px 0;
  background-color: #e8f5e9;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-header,
.library-container {
  width: 100%;
  max-width: 1100px;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #2d6a4f;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 5px;
  background: linear-gradient(90deg, #40916c, #95d5b2);
  border-radius: 3px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #000000;
  max-width: 700px;
  margin: 25px auto 0;
  line-height: 1.7;
  text-align: center;
  font-weight: 500;
}

.library-container {
  position: relative;
  background: linear-gradient(135deg, #d8f3dc, #b7e4c7);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
  min-height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.floating-features {
  position: relative;
  height: 320px;
  margin-bottom: 35px;
}

.library-feature-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  animation: float 8s infinite ease-in-out;
  width: 260px;
  transition: all 0.3s ease;
  border: 1px solid rgba(100, 200, 150, 0.2);
}

.library-feature-card:hover {
  transform: scale(1.06) !important;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.18);
  z-index: 10;
}

.library-feature-card:nth-child(1) {
  top: -5%;
  left: 8%;
  animation-delay: 0s;
}

.library-feature-card:nth-child(2) {
  top: -4%;
  right: 20%;
  animation-delay: -2s;
}

.library-feature-card:nth-child(3) {
  bottom: -10%;
  left: 20%;
  animation-delay: -4s;
}

.library-feature-card:nth-child(4) {
  bottom: -8%;
  right: 8%;
  animation-delay: -6s;
}

.feature-icon {
  font-size: 2.2rem;
  color: #40916c;
  background: rgba(100, 200, 150, 0.12);
  padding: 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 1.3rem;
  color: #2d6a4f;
  margin-bottom: 8px;
  font-weight: 700;
}

.feature-text p {
  color: #52796f;
  font-size: 0.95rem;
  line-height: 1.5;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-12px) rotate(1.5deg);
  }
  50% {
    transform: translateY(8px) rotate(-1.5deg);
  }
  75% {
    transform: translateY(-8px) rotate(1deg);
  }
}

.library-btn-container {
  text-align: center;
  margin-top: 15px;
}

.library-btn {
  background: linear-gradient(90deg, #40916c, #74c69d);
  color: white;
  border: none;
  padding: 20px 45px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 1.4rem;
  box-shadow: 0 8px 20px rgba(116, 198, 157, 0.45);
  margin: 0 auto;
  letter-spacing: 1px;
}

.library-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(116, 198, 157, 0.55);
  background: linear-gradient(90deg, #347a5a, #5cb48a);
}

.library-btn .el-icon {
  font-size: 1.6rem;
}


/* 知识问答板块 - 全宽背景 */
.faq-section {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 80px 0;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
  width: 100%;
  max-width: 1100px;
  padding: 0 20px;
}

/* 使用特定类名避免样式冲突 */
.faq-section-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #2d6a4f;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.faq-section-title::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 5px;
  background: linear-gradient(90deg, #40916c, #95d5b2);
  border-radius: 3px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #000000;
  max-width: 700px;
  margin: 25px auto 0;
  line-height: 1.7;
  font-weight: 500;
}

.faq-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.faq-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #40916c, #74c69d);
}

/* 两列布局 */
.faq-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.faq-column {
  display: flex;
  flex-direction: column;
}

.faq-item {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  background: #fff;
  cursor: pointer;
}

.faq-item:last-child {
  margin-bottom: 0;
}

.faq-item:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.faq-question {
  padding: 18px 20px;
  background: rgba(100, 200, 150, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #2d6a4f;
  transition: all 0.3s ease;
}

.faq-question:hover {
  background: rgba(100, 200, 150, 0.15);
}

.faq-question span {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-icon {
  color: #40916c;
  font-size: 1.3rem;
}

.toggle-icon {
  color: #40916c;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.faq-answer {
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #f8fdf8;
  color: #52796f;
  line-height: 1.6;
}

.faq-item.active .faq-answer {
  padding: 20px;
  max-height: 300px;
}

.faq-item.active .toggle-icon {
  transform: rotate(180deg);
}

.answer-content {
  display: flex;
  gap: 15px;
}

.answer-icon {
  color: #74c69d;
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.footer-note {
  text-align: center;
  margin-top: 30px;
  color: #52796f;
  font-size: 1rem;
  max-width: 1100px;
  padding: 0 20px;
}

.leaf-decoration {
  position: absolute;
  opacity: 0.1;
  z-index: 0;
}

.leaf-1 {
  top: -20px;
  right: -20px;
  font-size: 120px;
  color: #40916c;
  transform: rotate(30deg);
}

.leaf-2 {
  bottom: -30px;
  left: -30px;
  font-size: 150px;
  color: #74c69d;
  transform: rotate(-15deg);
}

/* 分页按钮样式 - 无限循环 */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.pagination-btn {
  background: linear-gradient(90deg, #40916c, #74c69d);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(116, 198, 157, 0.3);
}

.pagination-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(116, 198, 157, 0.4);
  background: linear-gradient(90deg, #347a5a, #5cb48a);
}

.pagination-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .faq-columns {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .faq-section {
    padding: 60px 0;
  }

  .faq-section-title {
    font-size: 2.4rem;
  }
}

@media (max-width: 768px) {
  .faq-container {
    padding: 25px 20px;
  }

  .faq-section {
    padding: 40px 0;
  }

  .faq-section-title {
    font-size: 2.2rem;


  }

  .section-subtitle {
    font-size: 1.1rem;
  }

  .faq-question span {
    font-size: 1rem;
  }

  .answer-content {
    flex-direction: column;
    gap: 10px;
  }

  .answer-icon {
    align-self: flex-start;
  }

  .pagination-btn {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style>