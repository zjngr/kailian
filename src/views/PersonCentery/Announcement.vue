<template>
  <section class="announcement-container">
    <!-- 页面顶部区域 -->
    <div class="page-header">
      <div class="header-actions">
        <el-button class="back-btn" @click="router.push('/person')">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <!--  data.user.role === 'ADMIN'，为管理员才能添加公告      -->
        <el-button v-if="data.user.role === 'ADMIN'" type="success" class="add-btn" @click="navigateToAdd">
          <el-icon><Plus /></el-icon>添加公告
        </el-button>
      </div>
      <!--  背景图片 -->
      <div class="header-bg">
        <img :src="bgImageUrl" alt="背景图片" class="header-img" />
      </div>
      <div class="header-content">
        <h1 class="page-title">健康运动公告</h1>
        <p class="page-subtitle">最新活动通知与健康资讯</p>
        <!-- 未读公告提示 -->
        <div class="unread-indicator" v-if="unreadCount > 0">
          <el-tag type="danger" size="large">
            <el-icon><Bell /></el-icon>未读公告: {{ unreadCount }} 条
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <section class="content-background">
      <div class="announcement-content">
        <!-- 公告筛选和搜索区域 -->
        <div class="filter-section">
          <!-- 选择何种类型公告的按钮  -->
          <div class="filter-left">
            <el-button v-for="category in announcementCategories" :key="category.id" :class="{ active: activeCategory === category.id }"
                       @click="activeCategory = category.id" class="category-btn">{{ category.name }}
            </el-button>
          </div>
          <!-- 搜索框  -->
          <div class="filter-right">
            <el-input v-model="searchKeyword" placeholder="搜索公告..." class="search-input" :prefix-icon="Search"/>
          </div>
        </div>

        <!-- 公告列表 -->
        <div class="announcement-list" ref="announcementListRef">
          <div v-for="(announcement, index) in paginatedAnnouncements" :key="announcement.aid" class="announcement-item"
              :class="{ featured: announcement.isSpecial === 1,unread: !isAnnouncementRead(announcement.aid)}" :data-index="index">
            <!-- 未读标识 -->
            <div class="unread-dot" v-if="!isAnnouncementRead(announcement.aid)"></div>

            <div class="announcement-badge" v-if="announcement.isSpecial === 1">
              <el-icon><StarFilled /></el-icon>推荐
            </div>

            <!-- 管理员操作按钮 -->
            <div class="admin-actions" v-if="data.user.role === 'ADMIN'">
              <el-button type="danger" size="small" circle @click="deleteAnnouncement(announcement.aid)" class="delete-btn">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <div class="announcement-main">
              <!-- 公告图片展示 -->
              <div class="announcement-image-container" v-if="parseImagesByComma(announcement.images) && parseImagesByComma(announcement.images).length > 0">
                <el-carousel :interval="5000" height="200px" indicator-position="outside" class="announcement-carousel">
                  <el-carousel-item v-for="(image, idx) in parseImagesByComma(announcement.images)" :key="idx">
                    <img :src="image" :alt="'公告图片' + (idx + 1)" class="announcement-image" />
                  </el-carousel-item>
                </el-carousel>
              </div>

              <div class="announcement-header">
                <h3 class="announcement-title">
                  {{ announcement.title }}
                  <el-tag v-if="!isAnnouncementRead(announcement.aid)" type="danger" size="small" class="unread-tag">
                    新公告
                  </el-tag>
                </h3>
                <div class="announcement-meta">
                  <span class="announcement-date">{{ announcement.createTime }}</span>
                  <span class="announcement-category" :class="announcement.category">
                    {{ getCategoryName(announcement.category) }}
                  </span>
                </div>
              </div>

              <p class="announcement-summary">{{ announcement.content }}</p>

              <div class="announcement-footer">
                <div class="announcement-tags">
                  <span v-for="tag in parseTags(announcement.tags)" :key="tag" class="announcement-tag">{{ tag }}
                  </span>
                </div>
                <div class="announcement-actions">
                  <span class="view-count">
                    <el-icon><View /></el-icon>
                    {{ announcement.pageView || 0 }}
                  </span>
                  <el-button type="success" plain size="small" @click="viewAnnouncementDetail(announcement)">查看详情</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredAnnouncements.length === 0" class="empty-state">
          <el-icon class="empty-icon"><DocumentDelete /></el-icon>
          <p>暂无相关公告</p>
          <el-button type="success" @click="resetFilters">重置筛选条件</el-button>
        </div>

        <!-- 分页控件 -->
        <div v-if="filteredAnnouncements.length > 0" class="pagination-section">
          <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20]"
              :small="true"
              :disabled="false"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredAnnouncements.length"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </section>

    <!-- 公告详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="currentAnnouncement?.title" width="60%" class="announcement-dialog">
      <div v-if="currentAnnouncement" class="announcement-detail">
        <div class="detail-meta">
          <span class="detail-date">{{ currentAnnouncement.createTime }}</span>
          <span class="detail-category" :class="currentAnnouncement.category">
            {{ getCategoryName(currentAnnouncement.category) }}
          </span>
          <span class="detail-views">
            <el-icon><View /></el-icon>
            浏览: {{ currentAnnouncement.pageView || 0 }}
          </span>
          <el-tag v-if="!isAnnouncementRead(currentAnnouncement.aid)" type="danger" size="small">
            新公告
          </el-tag>
        </div>

        <div class="detail-content">
          <p>{{ currentAnnouncement.content }}</p>

          <div v-if="currentAnnouncement.contents" class="detail-expanded">
            <h4>活动详情</h4>
            <p>{{ currentAnnouncement.contents }}</p>
          </div>

          <div v-if="parseImagesByComma(currentAnnouncement.images) && parseImagesByComma(currentAnnouncement.images).length > 0" class="detail-images">
            <h4>相关图片</h4>
            <div class="image-grid">
              <img
                  v-for="(image, idx) in parseImagesByComma(currentAnnouncement.images)"
                  :key="idx"
                  :src="image"
                  :alt="'公告图片' + (idx + 1)"
                  class="detail-image"
                  @click="openImagePreview(parseImagesByComma(currentAnnouncement.images), idx)"
              />
            </div>
          </div>
        </div>

        <div class="detail-tags">
          <span v-for="tag in parseTags(currentAnnouncement.tags)" :key="tag" class="detail-tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片预览 -->
    <el-image-viewer v-if="imagePreviewVisible" :url-list="previewImages" :initial-index="previewImageIndex" @close="imagePreviewVisible = false"/>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, View, StarFilled, DocumentDelete, ArrowLeft, Plus, Delete, Bell } from '@element-plus/icons-vue'
import { gsap } from 'gsap'
import request from "@/utils/request.js";

const router = useRouter()

// 模拟数据 - 根据数据库字段名修改
const data = reactive({
  user: JSON.parse(localStorage.getItem("user")) ,
  //接受后端的数据（公告列表）
  announcements: []
})

// 当前用户阅读状态存储，
const userReadStatus = ref(JSON.parse(localStorage.getItem(`announcementReadStatus${data.user.id}`)) || {})

// 响应式数据
const bgImageUrl = ref('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')
const activeCategory = ref('all')  // 当前激活的分类
const searchKeyword = ref('')   // 搜索关键字
const currentPage = ref(1)  // 当前页码
const pageSize = ref(5)  // 每页显示的记录数
const detailVisible = ref(false)  //详情弹窗的显示状态
const currentAnnouncement = ref(null)  // 当前查看的公告对象
const announcementListRef = ref(null)      // 公告列表容器元素
const imagePreviewVisible = ref(false)
const previewImages = ref([])
const previewImageIndex = ref(0)


// 解析图片数据,把images字符串以逗号为分隔符解析为图片数组
const parseImagesByComma = (imagesData) => {
  // 如果数据为空，返回空数组
  if (!imagesData) return []

  // 如果是字符串，按逗号分隔
  if (typeof imagesData === 'string') {
    return imagesData
        .split(',') // 按逗号分割
        .map(img => img.trim()) // 去除前后空格
        .filter(img => img !== '') // 过滤空字符串
  }
}

// 计算未读公告数量
const unreadCount = computed(() => {
  return data.announcements.filter(announcement => !isAnnouncementRead(announcement.aid)).length
})

// 检查公告是否已读
const isAnnouncementRead = (announcementId) => {
  return userReadStatus.value[announcementId] === true
}

// 解析标签字符串为数组
const parseTags = (tags) => {
  if (!tags) return []
  return tags.split(',').map(tag => tag.trim())
}

// 查看公告详情时自动标记为已读
const viewAnnouncementDetail = (announcement) => {
  currentAnnouncement.value = announcement  // 当前展示公告的数据
  detailVisible.value = true  //显示详情弹窗
  // 自动标记为已读
  if (!isAnnouncementRead(announcement.aid)) {  // 判断是否已读
      userReadStatus.value[announcement.aid] = true  // 标记为已读
      //更新缓存
      localStorage.setItem(`announcementReadStatus${data.user.id}`, JSON.stringify(userReadStatus.value))
      // 更新后端阅读量
      request.post(`/announcement/addViews/${data.user.id}/${announcement.aid}`).then(res => {
        if(res.code !== "200") ElMessage.error(res.msg || "系统错误，阅读量+1失败")
      })
      // 更新前端阅读量
      data.announcements.map(item => { if (item.aid === announcement.aid) { item.pageView++ }
    })
  }
}

const navigateToAdd = () => {
  router.push('/addAnnouncement')
}

const announcementCategories = ref([
  { id: 'all', name: '全部' },
  { id: 'activity', name: '活动通知' },
  { id: 'health', name: '健康信息' },
  { id: 'system', name: '系统公告' }
])

// 计算过滤后的公告列表,默认为全部
const filteredAnnouncements = computed(() => {
  let filtered = data.announcements

  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
  }
  //内容或标题有搜索词
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword)
    )
  }
  //先展示未读的，再按时间逆序
  filtered=filtered.sort((a,b)=>{
    // 如果未读，排在前面
    const result= (isAnnouncementRead(b.aid)?-1:1)-(isAnnouncementRead(a.aid)?-1:1)
    if(result!==0) return result  //已排出顺序，返回
    return new Date(b.createTime) - new Date(a.createTime)  //同为已读或未读，按时间逆序
  })
  //返回处理后的列表
  return filtered
})

//公告的展示数据列表
const paginatedAnnouncements = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAnnouncements.value.slice(start, end)
})

//获取分类名称
const getCategoryName = (categoryId) => {
  const category = announcementCategories.value.find(cat => cat.id === categoryId)
  return category ? category.name : '未知'
}

//重置过滤器
const resetFilters = () => {
  activeCategory.value = 'all'
  searchKeyword.value = ''
  currentPage.value = 1
}
//改变分页大小
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}
//改变当前页码
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}
//删除公告
const deleteAnnouncement = async (aid) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这条公告吗？此操作不可撤销。',
        '删除公告',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    //后端删除公告
    request.delete(`/announcement/deleteById/${parseInt(aid)}`).then(res=>{
      if(res.code==="200"){
        ElMessage.success("删除成功")
        //要被删除数据的索引
        const index = data.announcements.findIndex(item => item.aid === aid)
        if (index !== -1) {
          data.announcements.splice(index, 1)  //删除该公告
          // 同时删除阅读状态
          delete userReadStatus.value[aid]
          localStorage.setItem(`announcementReadStatus${data.user.id}`, JSON.stringify(userReadStatus.value))  //更新缓存
          ElMessage.success('公告删除成功')
          //当前页没有数据了（因为刚删除了最后一个公告）
          if (paginatedAnnouncements.value.length === 0 && currentPage.value > 1) {
            currentPage.value -= 1
          }
        }
      }else ElMessage.error(res.msg || "删除失败")
    })
  } catch (error) {
    console.log('取消删除公告')
  }
}

//图片预览
const openImagePreview = (images, index) => {
  previewImages.value = images
  previewImageIndex.value = index
  imagePreviewVisible.value = true
}

//每一个公告项的初始化动画
const initAnimations = () => {
  if (!announcementListRef.value) return

  const items = announcementListRef.value.querySelectorAll('.announcement-item')
  gsap.fromTo(items, {
    opacity: 0,
    y: 30
  }, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out'
  })
}

const initData=()=>{
  request.get("/announcement/selectAll").then((res)=>{
    if(res.code==="200"){
       data.announcements=res.data
    }else{
      ElMessage.error(res.msg ||"获取公告失败")
    }
  })
}

onMounted( () => {
  window.scrollTo(0,0)
  initData();
  nextTick(() => {
    initAnimations()
  })
})

watch(() => paginatedAnnouncements.value, () => {
  nextTick(() => {
    initAnimations()
  })
})
</script>

<style scoped>
/* 未读公告相关样式 - 简化清晰版本 */
.unread-indicator {
  margin-top: 15px;
}

.unread-dot {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  z-index: 2;
}

.announcement-item.unread {
  border-left: 4px solid #f56c6c;
  background: #fff;
}

.announcement-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.unread-tag {
  margin-left: 10px;
}

/* 原有样式保持不变 */
.announcement-container {
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

.add-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
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

.announcement-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.category-btn {
  border: 1px solid #4CAF50;
  color: #4CAF50;
  background: transparent;
  transition: all 0.3s ease;
}

.category-btn.active,
.category-btn:hover {
  background: #4CAF50;
  color: white;
  transform: translateY(-2px);
}

.filter-right {
  min-width: 300px;
}

.search-input {
  width: 100%;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.announcement-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  border-left: 4px solid #4CAF50;
}

.announcement-item.featured {
  border-left-color: #FF9800;
  background: linear-gradient(135deg, #fff9e6 0%, white 100%);
}

.announcement-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.announcement-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: #FF9800;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.admin-actions {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 2;
}

.delete-btn {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
}

.delete-btn:hover {
  background: #f44336;
  color: white;
  transform: scale(1.1);
}

.announcement-main {
  position: relative;
  z-index: 1;
}

.announcement-image-container {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.announcement-carousel {
  border-radius: 8px;
}

.announcement-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.announcement-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

.announcement-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.announcement-category {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.announcement-category.activity { background: #e8f5e9; color: #2e7d32; }
.announcement-category.health { background: #e3f2fd; color: #1565c0; }
.announcement-category.system { background: #f3e5f5; color: #7b1fa2; }

.announcement-summary {
  color: #5d6d7e;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.announcement-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.announcement-tag {
  background: #f1f8e9;
  color: #2e7d32;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.announcement-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #c8e6c9;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.announcement-dialog {
  border-radius: 12px;
}

.detail-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8f5e9;
  flex-wrap: wrap;
}

.detail-content {
  line-height: 1.8;
  margin-bottom: 20px;
}

.detail-expanded {
  background: #f8fff8;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
}

.detail-images {
  margin-top: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.detail-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.detail-image:hover {
  transform: scale(1.05);
}

.detail-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-tag {
  background: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .page-header {
    height: 200px;
  }

  .page-title {
    font-size: 2rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-right {
    min-width: auto;
  }

  .announcement-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .announcement-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .announcement-actions {
    align-self: flex-end;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>