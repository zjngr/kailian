<template>
  <div class="sport-community">
    <div class="community-content">
      <!-- 左侧运动类型导航栏开始 -->
      <div class="sport-nav">
        <div class="nav-card">
          <div class="nav-header">
            <h3>联系人</h3>
          </div>
          <ul class="nav-list">
            <li 
              v-for="(sport, index) in sportTypes" 
              :key="index"
              :class="{ active: selectedSport === sport.name }"
              @click="selectSport(sport.name)"
            >
              <span class="nav-item-text">{{ sport.name }}</span>
            </li>
          </ul>
          
          <!-- 健康标语 -->
          <div class="health-quotes-container">
            <div class="health-quote quote-1">
              生命在于运动，健康源于锻炼
            </div>
            <div class="health-quote quote-2">
              每天运动一小时，健康生活一辈子
            </div>
          </div>
        </div>
      </div>
      <!-- 左侧运动类型导航栏结束 -->

      <!-- 中间帖子列表开始 -->
      <div class="posts-container">
        <div class="posts-card">
          <!-- 新增搜索栏开始 -->
          <div class="search-section">
            <div class="search-container">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索运动帖子..."
                class="search-input"
                clearable
                size="large"
              >
                <template #prefix>
                  <el-icon :size="20"><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" class="search-btn" @click="searchPosts" size="large">
                搜索
              </el-button>
            </div>
          </div>
          <!-- 新增搜索栏结束 -->

         <!--帖子展示开始-->
          <div 
            v-for="post in displayedPostsPage"
            :key="post.id"
            class="post-card"
          >
            <div class="post-header" >
              <el-avatar :src="post.dateUser.avatar" class="post-avatar" :size="48" />
              <div class="post-user-info">
                <span class="post-author">{{ post.dateUser.username }}</span>
                <span class="post-time">{{ post.time }}</span>
              </div>
            </div>
            <div @click="goToShow(post)">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-content">{{ post.content }}</p>
            <div class="post-images" v-if="post.images && post.images.length" >
              <el-image
                :src="post.images"
                alt="post image"
                class="post-image"
                fit="cover"
              >
              </el-image>
            </div>
            </div>
            <div class="post-stats">
              <span class="stat-text">{{ post.likes }}点赞</span>
              <span class="stat-text">{{ post.comments }}评论</span>
              <button style="margin-left: 800px;font-size: 30px;" class="delete-meal-button" v-if="data.user.id === post.sid" @click="deletepost(post.pid)">
                <el-icon class="delete-icon"><Delete /></el-icon>
              </button>
            </div>
          </div>
          <!--帖子展示结束-->

          <!-- 分页组件开始 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[3, 5, 10, 20]"
              :small="false"
              :disabled="false"
              layout="total, sizes, prev, pager, next, jumper"
              :total="displayedPosts.length"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
          <!-- 分页组件结束-->

        </div>
      </div>
      <!-- 中间帖子列表结束 -->

      <!-- 右侧积分排行榜开始 -->
      <div class="ranking-container">
        <div class="ranking-card">
          <div class="ranking-header">
            <h3>运动积分排行榜</h3>
          </div>
          <div class="ranking-list">
            <div 
              v-for="(user, index) in rankingList"
              :key="user.id"
              class="ranking-item"
            >
              <div class="ranking-info">
                <span class="rank-number" :class="getRankClass(index)">
                  {{ index + 1 }}
                </span>
                <el-avatar :src="user.avatar" class="ranking-avatar" :size="40" />
                <span class="ranking-name">{{ user.username }}</span>
              </div>
              <span class="ranking-score">{{ user.points }}分</span>
            </div>
          </div>
          
          <!-- 励志图片 -->
          <div class="motivational-image-container">
            <el-image 
              src="/src/assets/run.jpg"
              fit="cover"
              class="motivational-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </div>
      </div>
      <!-- 右侧积分排行榜结束 -->
    </div>

    <!-- 悬浮发帖按钮开始 -->
    <div class="float-post-btn" @click="goToAddForum">
      <el-icon :size="32"><Plus /></el-icon>
    </div>
    <!-- 悬浮发帖按钮结束 -->

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
const router = useRouter()
//获取用户信息
const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
});

//对应的发帖人
const dateUser=ref([

]);

// 搜索关键词
const searchKeyword = ref('')

// 运动类型列表
const sportTypes = ref([
  { name: '全部' }, { name: '跑步' }, { name: '游泳' }, { name: '骑行' }, { name: '瑜伽' }, { name: '健身' }, { name: '篮球' }, { name: '足球' }, { name: '网球' }, { name: '羽毛球' }
])

// 选中的运动类型
const selectedSport = ref('全部')

// 帖子数据
const posts = ref([

])

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(3)

// 显示的帖子（根据选中的运动类型和搜索关键词过滤）
const displayedPosts = computed(() => {
  let filteredPosts =  mergedPosts.value

  // 先根据运动类型过滤
  if (selectedSport.value !== '全部') {
    filteredPosts = filteredPosts.filter(post => post.sportType === selectedSport.value)
  }

  // 如果有搜索关键词，再根据标题进行搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(keyword)
    )
  }
  return filteredPosts
})

// 当前页显示的帖子
const displayedPostsPage = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return displayedPosts.value.slice(start, end)
})

// 积分排行榜数据
const rankingList = ref([

])

// 点赞列表
const LikesList = ref([

])



// 选择运动类型
const selectSport = (sport) => {
  selectedSport.value = sport
  // 切换运动类型时重置到第一页
  currentPage.value = 1
}

// 搜索帖子
const searchPosts = () => {
  // 搜索时重置到第一页
  currentPage.value = 1
}

// 跳转到发帖页面
const goToAddForum = () => {
  router.push('/addCommunity')
}

// 跳转到观看页面
const goToShow = (post) => {
  localStorage.setItem('post',JSON.stringify(post))
  router.push('/showCommunity')
}

// 获取排名样式
const getRankClass = (index) => {
  if (index === 0) {
    return 'first'
  } else if (index === 1) {
    return 'second'
  } else if (index === 2) {
    return 'third'
  }
  return ''
}

// 分页相关方法
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

//合并数组
const mergedPosts = computed(() =>{
     return posts.value.map((post, index) => {
       //对应的发帖人
       const dateUser2=ref([]);
       dateUser.value.forEach((item)=>{
         if (item.id===post.sid){
           dateUser2.value=item
         }
       })
       const isLiked=ref(0);
       LikesList.value.forEach((item)=>{
         if (item.pid === post.pid){
           isLiked.value=1
         }
       })
       return {
         ...post,
         isLiked:isLiked.value,
         dateUser: dateUser2.value
       }
    })
});


const deletepost=(pid)=>{
  request.delete(`posts/deleteposts/${pid}`).then((res)=>{
    if (res.code==='200'){
      refreshDate();
      ElMessage.success("删除帖子成功")
    }else{
      ElMessage.error(res.msg)
    }
  })
}

//刷新数据
const refreshDate=()=>{
  //获取用户点赞列表的信息
  request.get(`user/selectLikesList/${data.user.id}`).then((res) => {
    if (res.code === '200') {
      LikesList.value.push(res.data)
    } else {
      ElMessage.error(res.msg)
    }
  })
  //获取帖子的数据
  request.get("posts/selectAll").then((res) => {
    if (res.code === '200') {
      posts.value = res.data
      posts.value.forEach((item) => {
        //获取作者的信息
        request.get(`user/selectById/${item.sid}`).then((res) => {
          if (res.code === '200') {
            dateUser.value.push(res.data);
          } else {
            ElMessage.error(res.msg)
          }
        })
      })
    } else {
      ElMessage.error(res.msg);
    }
  })

  //获取积分前十的对象
  request.get("user/selectrankpoints").then((res)=>{
    if (res.code === '200') {
      rankingList.value = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  })
}

//生命钩子函数
onMounted(() => {
  if(data.user===null){
    window.location="/login"
  }
  window.scrollTo(0,0)
 refreshDate()
});

</script>

<style scoped>
.delete-meal-button {
  background: #ff6b6b;
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-meal-button:hover {
  background: #ff5252;
  transform: scale(1.05);
}
.sport-community {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  min-height: 100vh;
  padding: 20px 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 内容区域 */
.community-content {
  display: flex;
  margin: 0 auto;
  padding: 0 30px;
  gap: 25px;
  min-height: calc(100vh - 40px);
}

/* 左侧导航栏 */
.sport-nav {
  flex: 0.6;
}

.nav-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.nav-header h3 {
  margin: 0 0 20px 0;
  color: #27AE60;
  border-bottom: 2px solid #a5d6a7;
  padding-bottom: 15px;
  font-weight: 600;
  font-size: 24px;
  text-align: center;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  padding: 15px 20px;
  margin-bottom: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.nav-list li:hover {
  background-color: #f0f9f0;
  color: #27AE60;
  transform: translateX(5px);
}

.nav-list li.active {
  background: linear-gradient(90deg, #e8f5e9, #c8e6c9);
  color: #27AE60;
  font-weight: bold;
  border-left: 4px solid #a5d6a7;
}

/* 励志图片 */
.motivational-image-container {
  margin-top: 30px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.motivational-image {
  width: 100%;
  height: 200px;
}

/* 中间帖子列表 */
.posts-container {
  flex: 2;
}

.posts-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 搜索区域 */
.search-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.search-container {
  display: flex;
  width: 100%;
  gap: 15px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 50px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 50px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  border-color: #a5d6a7;
}

.search-btn {
  border-radius: 50px;
  background: linear-gradient(135deg, #27AE60, #66bb6a);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  padding: 14px 35px;
  height: 50px;
  display: flex;
  align-items: center;
}

.search-btn:hover {
  background: linear-gradient(135deg, #1e8449, #2e7d32);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(39, 174, 96, 0.5);
}

.posts-header h2 {
  color: #333;
  margin: 0 0 30px 0;
  font-weight: 600;
  font-size: 28px;
  text-align: center;
}

.post-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #eee;
  border-left: 4px solid #a5d6a7;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(39, 174, 96, 0.25);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.post-avatar {
  margin-right: 20px;
}

.post-user-info {
  display: flex;
  flex-direction: column;
}

.post-author {
  font-weight: 600;
  color: #66bb6a;
  margin-bottom: 5px;
  font-size: 20px;
}

.post-time {
  font-size: 16px;
  color: #888;
}

.post-title {
  color: #333;
  margin: 20px 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  border-left: 3px solid #a5d6a7;
  padding-left: 10px;
}

.post-content {
  color: #495057;
  line-height: 1.8;
  margin-bottom: 25px;
  font-size: 18px;
  font-weight: 400;
  text-align: justify;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.post-image {
  width: 100%;
  border-radius: 12px;
  aspect-ratio: 1;
  object-fit: cover;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #999;
  font-size: 16px;
}

.image-slot .dot {
  animation: dot 2s infinite steps(3, start);
  overflow: hidden;
}

@keyframes dot {
  33% { content: '.' }
  66% { content: '..' }
  100% { content: '...' }
}

.post-stats {
  display: flex;
  gap: 8px;
  padding-top: 25px;
  border-top: 1px solid #eee;
  justify-content: flex-start;
  flex-wrap: wrap;
  font-weight: 500;
  font-size: 16px;
  color: #6c757d;
}

.stat-separator {
  color: #ccc;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 右侧排行榜 */
.ranking-container {
  flex: 0.7;
}

.ranking-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.ranking-header h3 {
  margin: 0 0 25px 0;
  color: #27AE60;
  text-align: center;
  border-bottom: 2px solid #a5d6a7;
  padding-bottom: 20px;
  font-weight: 600;
  font-size: 24px;
}

.ranking-list {
  margin-bottom: 30px;
}

.ranking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 12px;
  border-bottom: 1px solid #eee;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background-color: #f0f9f0;
  border-radius: 8px;
  transform: translateX(5px);
}

.ranking-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.rank-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 16px;
  background-color: #f0f0f0;
  color: #999;
  transition: all 0.3s ease;
}

.rank-number.first {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: white;
  transform: scale(1.1);
}

.rank-number.second {
  background: linear-gradient(135deg, #c0c0c0, #a9a9a9);
  color: white;
  transform: scale(1.05);
}

.rank-number.third {
  background: linear-gradient(135deg, #cd7f32, #a0522d);
  color: white;
  transform: scale(1.05);
}

.ranking-avatar {
  width: 40px;
  height: 40px;
}

.ranking-name {
  font-weight: 600;
  color: #212529;
  font-size: 18px;
}

.ranking-score {
  font-weight: bold;
  color: #008000;
  font-size: 18px;
}

/* 健康标语 */
.health-quotes-container {
  margin-top: auto;
}

.health-quote {
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.2);
  border: 1px solid #a5d6a7;
  transition: all 0.3s ease;
}

.health-quote:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.health-quote:last-child {
  margin-bottom: 0;
}

.quote-1 {
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
}

.quote-2 {
  background: linear-gradient(135deg, #a5d6a7, #81c784);
}

.quote-3 {
  background: linear-gradient(135deg, #81c784, #4caf50);
  color: white;
}

/* 悬浮发帖按钮 */
.float-post-btn {
  position: fixed;
  bottom: 50px;
  right: 50px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #27AE60, #66bb6a);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(39, 174, 96, 0.4);
  transition: all 0.3s ease;
  z-index: 99;
  color: white;
}

.float-post-btn:hover {
  transform: scale(1.15) rotate(90deg);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.6);
  background: linear-gradient(135deg, #219653, #4caf50);
}

/* 发帖对话框 */
.post-dialog :deep(.el-dialog__header) {
  background: linear-gradient(90deg, #27AE60, #2ECC71);
  color: white;
  padding: 25px;
}

.post-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 22px;
}

.post-dialog :deep(.el-dialog__body) {
  padding: 30px;
}

.post-dialog :deep(.el-dialog__footer) {
  padding: 20px 30px;
}

.post-dialog :deep(.el-form-item__label) {
  font-size: 18px;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .community-content {
    flex-direction: column;
    padding: 0 20px;
  }
  
  .sport-nav,
  .posts-container,
  .ranking-container {
    width: 100%;
  }
  
  .nav-card,
  .posts-card,
  .ranking-card {
    padding: 20px;
    border-radius: 16px;
  }
  
  .search-container {
    gap: 15px;
  }
  
  .search-btn {
    font-size: 16px;
    padding: 12px 20px;
  }
  
  .post-title {
    font-size: 20px;
  }
  
  .post-content {
    font-size: 16px;
  }
  
  .post-author {
    font-size: 18px;
  }
  
  .float-post-btn {
    width: 60px;
    height: 60px;
    bottom: 30px;
    right: 20px;
  }
  
  .health-quotes-container {
    margin-top: 30px;
  }
}
</style>