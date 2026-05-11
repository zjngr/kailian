<template>
  <div class="received-bottles-page">
    <div class="page-header">
      <h2>收到的瓶子</h2>
      <p>这里展示你捞到的漂流瓶</p>
    </div>

    <div class="bottles-container" v-if="receivedBottles.length > 0">
      <div
          v-for="bottle in paginatedBottles"
          :key="bottle.id"
          class="bottle-card"
      >
        <div class="bottle-header" style="display:flex">
          <img :src="bottle.avatar ||'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" :alt="bottle.username" class="user-avatar" />
          <div class="user-info">
            <h3 class="username">{{ bottle.username }}</h3>
          </div>
        </div>

        <div class="bottle-content">
          <p>{{ bottle.content }}</p>
          <div class="tags">
            <span :key="tag" class="tag">{{ bottle.tag }}</span>
          </div>
        </div>

        <div class="bottle-footer">
          <div class="bottle-stats">
            <span class="distance">📍 {{ bottle.location }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">📭</div>
      <h3>还没有收到瓶子</h3>
      <p>快去捞瓶子吧，看看别人分享了什么有趣的内容！</p>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-container" v-if="receivedBottles.length > 0 && totalPages > 1">
      <div
          v-for="page in totalPages"
          :key="page"
          class="page-item"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
      >
        {{ page }}
      </div>
    </div>

  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch, reactive} from 'vue'
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
});

//对应的扔出瓶子的的人
const dateUser=ref([

]);

// 模拟收到的瓶子数据
const mergedBottle = ref([])

// 分页相关状态
const currentPage = ref(1)
const itemsPerPage = 3 // 每页显示3个瓶子

//合并瓶子和其扔瓶子的人的数据
const receivedBottles= computed(() => {
  // 1. 把 dateUser 转成 Map，key 是配对字段
  const detailMap = new Map(
      dateUser.value.map(item => [item.id, item])
  )

  // 2. 遍历 comments，按配对字段查找并合并
  return mergedBottle.value.map(bottle => ({
    ...bottle,
    ...detailMap.get(bottle.sid)
  }))
})

// 分页后的瓶子数据
const paginatedBottles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return receivedBottles.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(receivedBottles.value.length / itemsPerPage)
})

// 切换页码
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 监听页码变化，确保不超过总页数
watch(totalPages, (newTotalPages) => {
  if (currentPage.value > newTotalPages && newTotalPages > 0) {
    currentPage.value = newTotalPages
  }
})




onMounted(() => {
  window.scrollTo(0,0)
   //获取捞到的瓶子的id
  request.get(`bottle/selectBottleListBySid/${data.user.id}`).then((res)=>{
    if (res.code==="200"){
      for (let i=0;i<res.data.length;i++){
        request.get(`bottle/selectByBid/${res.data[i]}`).then((item)=>{
          if (item.code==="200"){
            mergedBottle.value.push(item.data);
            request.get(`user/selectById/${item.data.sid}`).then((res) => {
              if (res.code === '200') {
                dateUser.value.push(res.data);
              } else {
                ElMessage.error(res.msg)
              }
            })
          }else{
            ElMessage.error(res.msg)
          }
        })
      }

    }else{
     ElMessage.error(res.msg);
    }
  })
})
</script>

<style scoped>
.received-bottles-page {
  padding: 20px;
  background: linear-gradient(135deg, #2ECC71 0%, #27AE60 25%, #16A085 50%, #1ABC9C 75%, #2ECC71 100%);
  min-height: 100vh;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Ping极ang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-header p {
  font-size: 16px;
  opacity: 0.9;
}

.bottles-container {
  display: grid;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.bottle-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.bottle-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.user-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 600;
}

.user-info p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.bottle-content p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.9);
}


.tag {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.bottle-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.bottle-stats {
  display: flex;
  gap: 15px;
}

.bottle-stats span {
  font-size: 14px;
  opacity: 0.9;
}

.bottle-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: rgba(255, 255, 255, 0.7);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.page-item {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin: 0 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.25s;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.page-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.page-item.active {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.no-data-tip p {
  margin-bottom: 20px;
  font-size: 16px;
}
</style>
