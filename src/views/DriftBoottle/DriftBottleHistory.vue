<template>
    <div class="my-bottles-page">

        <!-- 统计信息 -->
        <div class="stats-section">
            <div class="stat-card">
                <div class="stat-number">{{ receivedReplies}}</div>
                <div class="stat-label">收到回复</div>
            </div>
        </div>

              <!-- 瓶子列表 -->
              <div class="section-header" style="margin-left: 50px">
              <h2>我发出的瓶子</h2>
            </div>

              <div class="bottles-container" v-if="filteredBottles.length > 0">
                <div
                    v-for="bottle in paginatedBottles"
                    :key="bottle.id"
                    class="bottle-card"
                >
                  <div class="bottle-header" style="display:flex;">
                    <img :src="data.user.avatar ||'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" :alt="bottle.username" class="user-avatar" />
                    <div class="user-info">
                      <h3 class="username">{{ data.user.username }}</h3>
                    </div>
                  </div>

                  <div class="bottle-content" style="font-size: 17px">
                    <p>{{ bottle.content }}</p>
                    <div class="tags" >
                      <span  style="font-size: 15px" class="tag">{{ bottle.tag }}</span>
                    </div>
                  </div>

                  <div class="bottle-footer" style="display: flex">
                    <div class="bottle-stats">
                      <span class="distance" style="font-size: 17px">📍 {{ bottle.location }}</span>
                    </div>
                    <div style="margin-left: 80%">
                      <button class="action-btn delete-btn" @click="deleteBottleHandler(bottle.bid)" title="删除瓶子">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                              d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
                              stroke="currentColor" stroke-width="2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                </div>

              <!-- 分页组件 -->
              <div class="pagination-container" v-if="filteredBottles.length > 0 && totalPages > 1">
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

                <!-- 空状态 -->
                <div v-if="filteredBottles.length === 0" class="empty-state">
                    <div class="empty-icon">🌊</div>
                    <h3>还没有发出瓶子</h3>
                    <p>扔出你的第一个瓶子，开始你的漂流之旅吧！</p>
                </div>
            </div>



        <!-- 删除确认对话框 -->
        <div v-if="showDeleteConfirm" class="modal-overlay">
            <div class="confirm-modal" @click.stop>
                <div class="confirm-header">
                    <h3>🗑️ 确认删除</h3>
                </div>
                <div class="confirm-content">
                    <p>确定要删除这个瓶子吗？</p>
                    <p class="confirm-warning">此操作不可恢复！</p>
                </div>
                <div class="confirm-actions">
                    <button class="confirm-btn cancel" @click="cancelDelete">取消</button>
                    <button class="confirm-btn delete" @click="confirmDelete">删除</button>
                </div>
            </div>
        </div>
</template>

<script setup>
import {ref, computed, onMounted, watch, reactive} from 'vue'
import {ElMessage} from "element-plus";
import request from "@/utils/request.js";

//用户信息
const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
});

//用户扔出瓶子的数量
const filteredBottles =ref(() => {

})


//收到的回复数量
const receivedReplies=ref(0)
const showDeleteConfirm=ref(false)
const DeleteBid=ref(null)

// 分页相关状态
const currentPage = ref(1)
const itemsPerPage = 3 // 每页显示3个瓶子

// 分页后的瓶子数据
const paginatedBottles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBottles.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredBottles.value.length / itemsPerPage)
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

//开启删除弹框
const deleteBottleHandler=(bid)=>{
  showDeleteConfirm.value=true
  DeleteBid.value=bid
}
//取消删除弹窗
const cancelDelete=()=>{
  showDeleteConfirm.value=false
}

//删除瓶子
const confirmDelete=()=>{
  request.delete("bottle/delete",{params: { bid:DeleteBid.value }}).then((res)=>{
    if (res.code === '200') {
      ElMessage.success("删除成功")
      showDeleteConfirm.value=false
      refreshDate()
    } else {
      ElMessage.error(res.msg);
    }
  })
}


const refreshDate=()=>{
  request.get(`bottle/selectBySid/${data.user.id}`).then((res)=>{
    if( res.code === "200"){
      filteredBottles.value=res.data
      filteredBottles.value.forEach((item)=>{
        receivedReplies.value+=item.replies
      })
    }else{
      ElMessage.error(res.msg)
    }
  })
}

onMounted(() => {
  window.scrollTo(0,0)
  refreshDate()
})
</script>

<style scoped>

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


.bottles-container {
  display: grid;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.bottles-container {
  display: grid;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.stats-section {
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.stat-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-number {
    font-size: 32px;
    font-weight: 700;
    color: white;
    margin-bottom: 8px;
}

.stat-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.section-header h2 {
    color: white;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
}

.bottles-list {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 400px);
    gap: 20px;
    overflow-y: auto;
    padding-right: 8px;
}


/* Firefox 隐藏滚动条 */
.bottles-list {
    scrollbar-width: none;
}

.bottle-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
}

.bottle-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.bottle-card.has-replies {
    border-left: 4px solid #4ade80;
}


.bottle-content {
    margin-bottom: 16px;
}


.tag {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.bottle-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
}

.replies-header h4 {
    color: white;
    margin: 0 0 12px 0;
    font-size: 16px;
}




.reply-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}



.bottle-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
}

.action-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
}

.action-btn:hover::before {
    transform: translateX(100%);
}


.delete-btn {
    color: #27ac92;
    box-shadow: 0 4px 15px rgba(255, 154, 158, 0.3);
}

.delete-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(255, 154, 158, 0.4);
    color: #b02a5b;
}

.action-btn:active {
    transform: translateY(0) scale(0.95);
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
}

.empty-state p {
    margin: 0 0 24px 0;
    color: rgba(255, 255, 255, 0.7);
}


/* 模态框样式 */
.modal-overlay {
    position: fixed;
    top: 100px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}
.modal-header h3 {
    color: white;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
}


.form-group label {
    display: block;
    color: #2c3e50;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 14px;
}



.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    font-size: 16px;
    background: #f8f9fa;
    color: #2c3e50;
    box-sizing: border-box;
    transition: all 0.3s ease;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
    color: #6c757d;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #2ECC71;
    background: white;
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
}

.mood-option input {
    display: none;
}

.mood-option span {
    color: #2c3e50;
    font-size: 14px;
    font-weight: 500;
}

.mood-option.active span {
    color: white;
}


.confirm-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid #dee2e6;
}



.confirm-btn {
    background: #2ECC71;
    color: white;
    border-color: #2ECC71;
}

.confirm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* 确认对话框样式 */
.confirm-modal {
    background: white;
    border-radius: 16px;
    padding: 0;
    min-width: 400px;
    max-width: 500px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.confirm-header {
    background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);
    padding: 20px 24px;
    text-align: center;
}

.confirm-header h3 {
    color: white;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.confirm-content {
    padding: 24px;
    text-align: center;
}

.confirm-content p {
    margin: 0 0 8px 0;
    color: #2c3e50;
    font-size: 16px;
}

.confirm-warning {
    color: #e74c3c !important;
    font-weight: 600;
    font-size: 14px !important;
}

.confirm-actions {
    display: flex;
    gap: 12px;
    padding: 20px 24px;
    background: #f8f9fa;
}

.confirm-actions .confirm-btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.confirm-actions .confirm-btn.cancel {
    background: #6c757d;
    color: white;
}

.confirm-actions .confirm-btn.cancel:hover {
    background: #5a6268;
    transform: translateY(-1px);
}

.confirm-actions .confirm-btn.delete {
    background: #2ECC71;
    color: white;
}

.confirm-actions .confirm-btn.delete:hover {
    background: #27AE60;
    transform: translateY(-1px);
}

@keyframes scaleIn {
    from {
        transform: scale(0.9);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

@media (max-width: 768px) {

    .stats-section {
        padding: 0 16px;
        grid-template-columns: 1fr;
    }

    .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }


    .bottle-actions {
        justify-content: flex-start;
        gap: 6px;
    }

    .action-btn {
        width: 36px;
        height: 36px;
    }

    .confirm-modal {
        min-width: 300px;
        max-width: 90vw;
        margin: 20px;
    }

    .bottles-list {
        max-height: calc(100vh - 450px);
    }
}
</style>
