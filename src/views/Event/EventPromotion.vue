<template>
  <!-- 轮播图部分 -->
  <section class="activity-carousel-section">
    <div class="carousel-container">
      <swiper
          :modules="modules"
          :slides-per-view="1"
          :space-between="0"
          :autoplay="{ delay: 5000, disableOnInteraction: false }"
          :pagination="{ clickable: true, el: '.swiper-pagination' }"
          :loop="true"
          :navigation="{ nextEl: '.carousel-control.next', prevEl: '.carousel-control.prev' }"
          class="carousel"
      >
        <swiper-slide v-for="(poster, index) in posters" :key="index">
          <div class="carousel-slide">
            <img :src="poster.image" :alt="poster.anmae" class="carousel-image">
            <div class="carousel-overlay">
              <div class="event-content">
                <h2 class="event-title">{{ poster.aname }}</h2>

                <!-- 保留活动详情 -->
                <div class="event-description">
                  {{ poster.acontent }}
                </div>

                <div class="event-info-container">
                  <div class="event-info">
                    <el-icon class="info-icon"><Clock /></el-icon>
                    <span>{{ poster.adatatime }}</span>
                  </div>
                  <div class="event-info">
                    <el-icon class="info-icon"><Location /></el-icon>
                    <span>{{ poster.alocation }}</span>
                  </div>
                </div>
                <a :href="'http://'+poster.matchurl" target="_blank" class="btn-register">
                  去官网报名
                  <el-icon class="btn-icon"><Right /></el-icon>
                </a>
              </div>
            </div>
          </div>
        </swiper-slide>

        <!-- 导航按钮 -->
        <button class="carousel-control prev">
          <el-icon class="control-icon"><ArrowLeft /></el-icon>
        </button>
        <button class="carousel-control next">
          <el-icon class="control-icon"><ArrowRight /></el-icon>
        </button>

        <!-- Swiper自带的分页器容器 -->
        <div class="swiper-pagination"></div>
      </swiper>
    </div>
  </section>

  <!-- 活动卡片部分 -->
  <section class="activity-cards-section">
    <!-- 搜索和分类过滤 -->
    <div class="filters-container">
      <div class="search-container">
        <div class="search-box">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
              type="text"
              v-model="searchQuery"
              placeholder="搜索活动名称或地点..."
              class="search-input"
              @input="handleSearchInput"
          >
        </div>
      </div>

      <div class="category-filter">
        <div class="category-buttons">
          <button
              class="category-button"
              :class="{ active: selectedCategory === '全部' }"
              @click="selectCategory('全部')"
          >
            全部
          </button>
          <button
              v-for="category in categories"
              :key="category"
              class="category-button"
              :class="{ active: selectedCategory === category }"
              @click="selectCategory(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </div>

    <!-- 活动卡片网格 -->
    <div class="activity-grid">
      <div
          v-for="(activity, index) in paginatedActivities"
          :key="activity.aid"
          class="activity-card"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="openActivityDetail(activity)"
      >
        <div class="card-image-container">
          <img :src="activity.image" :alt="activity.aname" class="card-image">
          <div class="card-category-tag">{{ activity.matchtype }}</div>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ activity.aname }}</h3>

          <!-- 单行活动详情 -->
          <div class="card-description">
            {{ activity.acontent }}
          </div>

          <div class="card-info">
            <div class="info-item">
              <el-icon class="info-icon"><Calendar /></el-icon>
              <span>{{ activity.adatatime }}</span>
            </div>
            <div class="info-item">
              <el-icon class="info-icon"><Location /></el-icon>
              <span>{{ activity.alocation }}</span>
            </div>
          </div>

          <!-- 保留去官网报名按钮 -->
          <div class="card-footer">
            <a :href="'http://'+activity.matchurl" target="_blank" class="card-button" @click.stop>
              去官网报名
              <el-icon class="button-icon"><ArrowRight /></el-icon>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <div class="custom-pagination">
        <button
            class="pagination-button"
            :disabled="currentPage === 1"
            @click="goToPage(1)"
        >
          首页
        </button>

        <button
            class="pagination-button"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
        >
          &lt;
        </button>

        <!-- 页码按钮 -->
        <template v-for="page in visiblePages" :key="page">
          <button
              v-if="page === '...'"
              class="pagination-ellipsis"
              disabled
          >
            ...
          </button>
          <button
              v-else
              class="pagination-button"
              :class="{ active: currentPage === page }"
              @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </template>

        <button
            class="pagination-button"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
        >
          &gt;
        </button>

        <button
            class="pagination-button"
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
        >
          末页
        </button>

        <div class="page-jump">
          <span>跳至</span>
          <input
              type="number"
              v-model="jumpPage"
              min="1"
              :max="totalPages"
              @keyup.enter="jumpToPage"
          >
          <span>页</span>
          <button class="jump-button" @click="jumpToPage">确定</button>
        </div>
      </div>
    </div>
  </section>

  <!-- 活动详情弹窗 -->
  <el-dialog
      v-model="detailDialogVisible"
      width="80%"
      top="5vh"
      class="activity-detail-dialog"
      :close-on-click-modal="false"
      align-center
  >
    <!-- 自定义标题 -->
    <template #header>
      <div class="dialog-header">
        <h2 class="dialog-title">
          <el-icon class="title-icon"><Promotion /></el-icon>
          {{ selectedActivity.aname }}
        </h2>
      </div>
    </template>

    <div class="detail-container">
      <div class="detail-image-container">
        <img :src="(selectedActivity.image)" :alt="selectedActivity.aname" class="detail-image">
      </div>

      <div class="detail-content">
        <div class="detail-meta">
          <div class="detail-category">
            <el-icon><PriceTag /></el-icon>
            {{ selectedActivity.matchtype }}
          </div>
          <div class="detail-date">
            <el-icon><Calendar /></el-icon>
            {{ selectedActivity.adatatime }}
          </div>
          <div class="detail-location">
            <el-icon><Location /></el-icon>
            {{ selectedActivity.alocation }}
          </div>
        </div>

        <div class="detail-description">
          {{ selectedActivity.acontent }}
        </div>

        <div class="detail-actions">
          <el-button type="primary" class="detail-button" @click="goToRegistration(selectedActivity.matchurl)">
            <el-icon class="button-icon"><Promotion /></el-icon>
            去官网报名
          </el-button>
          <el-button class="detail-button" @click="closeDetailDialog">
            <el-icon class="button-icon"><Back /></el-icon>
            返回
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 添加可拖动的"添加活动"按钮 -->
  <div
      ref="dragButton"
      class="draggable-add-button"
      :style="{ left: buttonPosition.x + 'px', top: buttonPosition.y + 'px' }"
      @mousedown="startDrag"
  >
    <el-icon><Plus /></el-icon>
    <div class="add-button-tooltip">添加活动</div>
  </div>

</template>

<script setup>
import { ref, reactive, computed, watch,onMounted, } from 'vue';
import {Promotion, Tickets, Location, Plus, Clock, Right, ArrowLeft, ArrowRight, Search, Calendar, Back, PriceTag} from '@element-plus/icons-vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import {ElMessage} from "element-plus";

// 导入Swiper样式
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import request from "@/utils/request.js";
const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
});


const modules = [Autoplay, Pagination, Navigation];

// 添加拖动按钮状态
const dragButton = ref(null);
const buttonPosition = reactive({ x: 1750, y: 800 });
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let buttonStartX = 0;
let buttonStartY = 0;

// 开始拖动
const startDrag = (e) => {
  isDragging = false; // 重置拖动状态
  const button = dragButton.value;

  // 记录初始位置
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  buttonStartX = buttonPosition.x;
  buttonStartY = buttonPosition.y;

  // 添加事件监听
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);

  // 防止文本选择
  e.preventDefault();
};

// 拖动中 - 直接操作DOM样式提升性能
const onDrag = (e) => {
  isDragging = true; // 标记为拖动状态

  // 计算新位置
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  const newX = buttonStartX + dx;
  const newY = buttonStartY + dy;

  // 直接设置元素位置，避免响应式更新延迟
  const button = dragButton.value;
  button.style.left = `${newX}px`;
  button.style.top = `${newY}px`;

  // 防止文本选择
  e.preventDefault();
};

// 停止拖动
const stopDrag = (e) => {
  // 移除事件监听
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);

  // 更新位置状态
  const button = dragButton.value;
  buttonPosition.x = parseInt(button.style.left);
  buttonPosition.y = parseInt(button.style.top);

  // 如果是拖动操作，不触发点击事件
  if (isDragging) {
    // 重置拖动状态
    isDragging = false;
    return;
  }

  // 如果是点击操作，触发功能
  openAddActivityDialog();
};

// 打开添加活动页面
const openAddActivityDialog = () => {
  const targetUrl = '/eventUpload';
  window.open(targetUrl, '_blank');
};


// 海报数据 - 添加描述
const posters = ref([
]);

// 活动数据 - 添加描述
const activities = ref([

]);

// 分类数据
const categories = ref(["马拉松", "徒步", "自行车", "登高赛", "骑行","其他"]);

// 搜索和过滤状态
const searchQuery = ref("");
const selectedCategory = ref("全部");

// 分页状态 - 2行4列（每页8个卡片）
const currentPage = ref(1);
const itemsPerPage = ref(8);
const jumpPage = ref("");

// 详情弹窗状态
const detailDialogVisible = ref(false);

const selectedActivity = ref({

});

// 修复搜索功能 - 在整个数据集上搜索
const filteredActivities = computed(() => {
  // 处理搜索词：去除空格并转为小写
  const searchTerm = searchQuery.value.trim().toLowerCase();

  return activities.value.filter(activity => {
    // 匹配搜索词（活动名称或地点）
    const matchesSearch =
        searchTerm === "" ||
        activity.aname.toLowerCase().includes(searchTerm) ||
        activity.alocation.toLowerCase().includes(searchTerm);

    // 匹配分类
    const matchesCategory =
        selectedCategory.value === "全部" ||
        activity.matchtype === selectedCategory.value;
        return matchesSearch && matchesCategory;
  });
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(filteredActivities.value.length / itemsPerPage.value);
});

// 分页后的活动数据
const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredActivities.value.slice(start, end);
});

// 计算可见的页码
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    let startPage = Math.max(1, currentPage.value - 2);
    let endPage = Math.min(totalPages.value, currentPage.value + 2);

    if (currentPage.value <= 3) {
      endPage = maxVisible;
    } else if (currentPage.value >= totalPages.value - 2) {
      startPage = totalPages.value - maxVisible + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (startPage > 1) {
      if (startPage > 2) {
        pages.unshift("...");
      }
      pages.unshift(1);
    }

    if (endPage < totalPages.value) {
      if (endPage < totalPages.value - 1) {
        pages.push("...");
      }
      pages.push(totalPages.value);
    }
  }

  return pages;
});

// 跳转到指定页面
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 跳转到输入框指定的页面
const jumpToPage = () => {
  const page = parseInt(jumpPage.value);
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    goToPage(page);
  }
  jumpPage.value = "";
};

// 重置到第一页
const resetToFirstPage = () => {
  currentPage.value = 1;
};

// 选择分类并重置到第一页
const selectCategory = (category) => {
  selectedCategory.value = category;
  currentPage.value = 1;
};

// 处理搜索输入
const handleSearchInput = () => {
  // 当用户开始搜索时，重置分类为"全部"
  selectedCategory.value = "全部";
  resetToFirstPage();
};

// 监听过滤后的活动变化
watch(filteredActivities, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
});

// 打开活动详情
const openActivityDetail = (activity) => {
  selectedActivity.value = activity;
  detailDialogVisible.value = true;
};

// 关闭详情弹窗
const closeDetailDialog = () => {
  detailDialogVisible.value = false;
};

// 跳转到报名页面
const goToRegistration = (link) => {
  window.open('http://'+link);
};

//更新数据
const refreshDate=()=>{
  //获取数据
 request.get("eventshare/selectevent").then((res)=>{
   if (res.code === "200"){
     activities.value=res.data;
   }else{
     ElMessage.error(res.msg)
   }
 })
  //获取最新的三个数据
  request.get("eventshare/selectnewevent").then((res)=>{
    if (res.code === "200"){
      posters.value=res.data;
    }else{
      ElMessage.error(res.msg)
    }
  })
}

// 生命周期
onMounted(() => {
  window.scrollTo(0,0)
  if(data.user===null){
    window.location="/login"
  }
  refreshDate()
})
</script>

<style scoped>
/* 轮播图部分 */
.activity-carousel-section {
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.carousel-container {
  width: 100%;
  max-width: 100%; /* 确保X轴占满 */
  margin: 0 auto;
}

.carousel {
  position: relative;
  height: 700px; /* 增大高度 */
  overflow: hidden;
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%);
  display: flex;
  align-items: center;
  padding: 0 10%;
}

.event-content {
  max-width: 800px;
  text-align: left;
}

.event-title {
  font-size: 4.5rem; /* 增大字体 */
  font-weight: 900;
  color: #fff;
  margin-bottom: 30px;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  letter-spacing: 1px;
  line-height: 1.2;
}

/* 活动详情样式 */
.event-description {
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  line-height: 1.6;

  /* 多行省略号样式 */
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制2行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 3.2em; /* 2行高度 */

  /* 浏览器兼容性 */
  display: -moz-box;
  -moz-box-orient: vertical;
  -moz-line-clamp: 2;

  /* 标准语法 */
  display: -webkit-box;
  display: -ms-flexbox;
  -webkit-box-orient: vertical;
  -ms-box-orient: vertical;
  box-orient: vertical;

  /* 添加过渡效果 */
  transition: max-height 0.3s ease;
}

/* 可选：悬停时显示完整内容 */
.carousel-slide:hover .event-description {
  -webkit-line-clamp: unset;
  max-height: 500px; /* 足够大的高度显示所有内容 */
}

.event-info-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 40px;
}

.event-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem; /* 增大字体 */
  color: #fff;
  font-weight: 500;
}

.info-icon {
  font-size: 2.2rem; /* 增大图标 */
  color: #28a745;
}

.btn-register {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  border: none;
  padding: 22px 55px; /* 增大按钮 */
  font-size: 1.6rem; /* 增大字体 */
  font-weight: 700;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-register:hover {
  background: linear-gradient(135deg, #218838 0%, #19692c 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.7);
}

.btn-icon {
  font-size: 1.8rem; /* 增大图标 */
  transition: transform 0.3s ease;
}

.btn-register:hover .btn-icon {
  transform: translateX(5px);
}

/* 左右控制按钮 */
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 60px; /* 增大按钮 */
  height: 60px; /* 增大按钮 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0.7;
}

.carousel-control:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  opacity: 1;
}

.control-icon {
  font-size: 2.0rem; /* 增大图标 */
  color: white;
  font-weight: bold;
}

.carousel-control.prev {
  left: 30px;
}

.carousel-control.next {
  right: 30px;
}

/* 自定义Swiper分页器样式 */
:deep(.swiper-pagination) {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 15px;
  z-index: 10;
  width: 100%;
}

:deep(.swiper-pagination-bullet) {
  width: 16px; /* 增大圆点 */
  height: 16px; /* 增大圆点 */
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0;
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #28a745;
  transform: scale(1.3); /* 增大缩放 */
}

/* 响应式 */
@media (max-width: 1200px) {
  .carousel {
    height: 650px; /* 保持较大高度 */
  }
  .event-title {
    font-size: 4.0rem; /* 保持较大字体 */
  }
}

/* 活动卡片部分 */
.activity-cards-section {
  width: 100%;
  max-width: 1550px; /* 限制最大宽度 */
  margin: 40px auto; /* 居中 */
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 80, 20, 0.1);
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
}

.search-container {
  display: flex;
  justify-content: center;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #28a745;
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 2px solid #e0e0e0;
  border-radius: 30px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 2px 15px rgba(40, 167, 69, 0.2);
}

.category-filter {
  display: flex;
  justify-content: center;
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.category-button {
  padding: 8px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-button:hover:not(.active) {
  border-color: #28a745;
  color: #28a745;
}

.category-button.active {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

/* 活动网格 - 强制2行4列布局 */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 强制4列 */
  gap: 20px; /* 减小间距 */
  margin-bottom: 40px;
  width: 100%;
}

/* 卡片样式 - 优化大小 */
.activity-card {
  background: white;
  border-radius: 12px; /* 减小圆角 */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 减小阴影 */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 保留动画 */
  height: 380px; /* 增加高度以容纳按钮 */
  display: flex;
  flex-direction: column;
  position: relative;
  animation: cardEntrance 0.6s ease-out forwards; /* 保留动画 */
  opacity: 0;
  transform: translateY(20px);
  cursor: pointer;
}

@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.activity-card:hover {
  transform: translateY(-8px); /* 保留悬停动画 */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12); /* 保留悬停效果 */
}

.card-image-container {
  position: relative;
  height: 150px; /* 减小高度 */
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease; /* 保留动画 */
}

.activity-card:hover .card-image {
  transform: scale(1.05); /* 保留悬停动画 */
}

.card-category-tag {
  position: absolute;
  top: 10px; /* 减小位置 */
  left: 10px; /* 减小位置 */
  background: rgba(40, 167, 69, 0.9);
  color: white;
  padding: 4px 12px; /* 减小内边距 */
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 2;
}

.card-content {
  padding: 15px; /* 减小内边距 */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.1rem; /* 减小字体 */
  font-weight: 700;
  margin-bottom: 10px; /* 减小间距 */
  color: #333;
  line-height: 1.4;
}

/* 单行活动详情 */
.card-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
  height: 1.5em; /* 单行高度 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* 强制单行 */
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 减小间距 */
  margin-bottom: 15px; /* 减小间距 */
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px; /* 减小间距 */
  font-size: 0.85rem; /* 减小字体 */
  color: #666;
}

.info-icon {
  font-size: 1.0rem; /* 减小图标 */
  color: #28a745;
}

/* 卡片底部按钮 */
.card-footer {
  margin-top: auto;
  padding-top: 10px;
}

.card-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #28a745;
  color: white;
  padding: 8px 16px; /* 减小内边距 */
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease; /* 保留动画 */
  box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3);
  width: fit-content;
}

.card-button:hover {
  background: #218838;
  transform: translateY(-2px); /* 保留悬停动画 */
  box-shadow: 0 6px 15px rgba(40, 167, 69, 0.4);
}

.button-icon {
  font-size: 1.0rem; /* 减小图标 */
  transition: transform 0.3s ease; /* 保留动画 */
}

.card-button:hover .button-icon {
  transform: translateX(3px); /* 保留悬停动画 */
}

/* 分页组件 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
}

.custom-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-button {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pagination-button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #c0c0c0;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.pagination-ellipsis {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: default;
  font-size: 0.9rem;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 15px;
}

.page-jump input {
  width: 55px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
}

.jump-button {
  height: 34px;
  padding: 0 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.jump-button:hover {
  background: #218838;
}

/* 详情弹窗样式 */
.activity-detail-dialog {
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-dialog) {
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90vh;
  overflow: auto;
}

/* 自定义标题样式 */
.dialog-header {
  width: 100%;
  text-align: center;
  padding: 20px 0;
}

.dialog-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #28a745;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-icon {
  font-size: 2.5rem;
  color: #28a745;
}

.detail-container {
  display: flex;
  gap: 40px;
  background: linear-gradient(135deg, #f5f9f5 0%, #e5f0e5 100%);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  max-height: 70vh; /* 增加最大高度 */
  overflow-y: auto; /* 添加滚动条 */
}

.detail-image-container {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-category,
.detail-date,
.detail-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 15px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.detail-category {
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.detail-date {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.detail-location {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.detail-description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #444;
  margin-bottom: 30px;
  flex-grow: 1;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.detail-actions {
  display: flex;
  gap: 15px;
  margin-top: auto;
}

.detail-button {
  padding: 12px 25px;
  font-size: 1.1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.detail-button:first-child {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  border: none;
}

.detail-button:first-child:hover {
  background: linear-gradient(135deg, #218838 0%, #19692c 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
}

.detail-button:last-child {
  background: white;
  color: #28a745;
  border: 1px solid #28a745;
}

.detail-button:last-child:hover {
  background: rgba(40, 167, 69, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(40, 167, 69, 0.2);
}

.button-icon {
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.detail-button:hover .button-icon {
  transform: translateX(5px);
}

/* 响应式调整 */
@media (max-width: 992px) {
  .detail-container {
    flex-direction: column;
  }

  .detail-image {
    max-height: 400px;
    object-fit: cover;
  }
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .activity-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .activity-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }
}

/* 添加可拖动按钮样式 */
.draggable-add-button {
  position: fixed;
  z-index: 9999;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  font-size: 24px;
  user-select: none;
}

.draggable-add-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.draggable-add-button:active {
  transform: scale(0.95);
}

/* 添加按钮的tooltip样式 */
.draggable-add-button {
  position: fixed;
  z-index: 9999;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  font-size: 24px;
  user-select: none;
  will-change: transform; /* 优化动画性能 */
}

.draggable-add-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.draggable-add-button:active {
  transform: scale(0.95);
}

/* 添加按钮的tooltip样式 */
.add-button-tooltip {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.draggable-add-button:hover .add-button-tooltip {
  opacity: 1;
}

</style>