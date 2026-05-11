<template>
  <section class="following-container">
    <!-- 页面标题 -->
    <div class="page-title">
      <button class="back-button" @click="router.go(-1);">
        <span class="back-icon"></span> 返回
      </button>
      <h2>{{(parseInt(data.user.id)===parseInt(userId)?"我的关注":data.theUserOfQueryingFollow.username+"的关注")}}</h2>
    </div>

    <!-- 关注列表 - 两列布局 -->
    <div class="following-grid">
      <!-- 关注用户项 -->
      <div
          class="following-item"
          v-for="(user, index) in paginatedUsers"
          :key="user.id"
      >
        <!-- 点击头像跳转到用户首页 -->
        <div class="user-avatar" @click="navigateToUserHome(user)">
          <img :src="user.avatar" alt="用户头像" class="avatar-img">
        </div>
        <div class="user-info">
          <!-- 点击昵称跳转到用户首页 -->
          <h3 class="user-name" @click="navigateToUserHome(user)">{{ user.username }}</h3>
          <!-- 新增用户签名 -->
          <p class="user-signature" v-if="user.description">{{ user.description }}</p>
          <p class="user-signature placeholder" v-else>暂无签名</p>
        </div>
        <!-- 关注/取消关注按钮 -->
        <button class="follow-btn" :class="{ 'unfollow-btn':getAttentionState(user.id)===1 }" @click="toggleFollow(user)">
          {{  operationName(user.id) }}
        </button>
      </div>
    </div>

    <!-- 无关注时显示 -->
    <div class="no-following" v-if="paginatedUsers.length === 0">
      <p>暂无关注的用户</p>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-container" v-if="totalPages > 0">
      <div class="custom-pagination">
        <button class="pagination-button" :disabled="currentPage === 1" @click="goToPage(1)">
          首页
        </button>

        <button class="pagination-button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          &lt;
        </button>

        <!-- 页码按钮 -->
        <template v-for="page in visiblePages" :key="page">
          <button v-if="page === '...'" class="pagination-ellipsis" disabled>
            ...
          </button>
          <button v-else class="pagination-button" :class="{ active: currentPage === page }" @click="goToPage(page)">
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
</template>

<script setup>
import { ref,reactive, computed,onMounted  } from 'vue';
import { useRouter,useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
// 导入用户头像
import userAvatar from '@/assets/tx.jpg';
import request from "@/utils/request.js";

// 路由实例
const router = useRouter();
const route = useRoute();
const userId= route.params.id

//存储各种数据
const data=reactive( {
  // 当前登录用户信息
  user:JSON.parse(localStorage.getItem("user")),
  // 当前要查询谁的关注列表
  theUserOfQueryingFollow:JSON.parse(localStorage.getItem("theUserOfQueryingFollow"))
})

// 关注关注用户列表数据（添加签名信息）
const followingUsers=ref([]);
// 用于存储attentionList的值来做参数访问后端
const attentionList=ref([])
//按钮的文本，“关注”或“取消关注”，查到的数据都是已经关注的，所以一开始，另外

// 分页相关配置 - 修改为每页显示8个
const currentPage = ref(1);
const itemsPerPage = ref(8); // 每页显示8个用户（两列×四行）
const jumpPage = ref('');

// 数组存储对每一个已关注用户的关注状态
const attentionState = ref(new Map())

// 过滤后的用户列表
const filteredUsers = computed(() => {
  return followingUsers.value;
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

// 分页后的用户数据
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

// 获取关注状态
const getAttentionState=(id)=>{
  const userId = parseInt(id);

  // 如果是自己，返回2（不能关注自己）
  if (userId === parseInt(data.user.id)) {
    return 2;
  }

  // 从 Map 中获取关注状态
  return attentionState.value.get(userId) ? 1 : 0;
}

//展示的操作名称（关注，取消关注，不能关注自己）
const operationName=(id)=>{
   let num=getAttentionState(id);
   if(num===0){return "关注" }
   else if(num===1){return "取消关注"}
   else return "不能关注自己"
}

// 切换关注状态
const toggleFollow = (user) => {
  if(parseInt(user.id)===parseInt( data.user.id)) return;  //是自己
  let flag=attentionState.value.get(user.id);  //获取我对当前用户的关注状态
  if(flag){  //原本关注，则取消关注
    console.log("111")
    request.delete("user/deleteAttention",{params:{sid:data.user.id,bsid:user.id}}).then((res)=>{
      if(res.code==='200'){
        attentionState.value.set(user.id, false);  //更新关注状态
        ElMessage.success("取消对("+user.username+")关注成功");
        //更新缓存数据,只有在用户修改自己关注的列表时才更新
        if(parseInt(data.user.id)===parseInt(userId)){
          attentionList.value=attentionList.value.filter(item=>item.bsid!==user.id);
          localStorage.setItem("attentionList",JSON.stringify(attentionList.value))
        }
      }else{
        ElMessage.success(res.msg || "取消对("+user.username+")关注成功");
      }
    })
  }else{  //未关注，则关注
    console.log("22")
    let attentionlist={sid:data.user.id,bsid:user.id}
    request.post("user/insertAttention",attentionlist).then((res)=>{
      if(res.code==='200'){
        attentionState.value.set(user.id, true);  //更新关注状态
        ElMessage.success("关注"+user.username+"成功");
        //更新缓存数据,只有在用户修改自己关注的列表时才更新
        if(parseInt(data.user.id)===parseInt(userId)) {
          attentionList.value.push({sid: data.user.id, bsid: user.id});   //添加新的关系到attentionList
          localStorage.setItem("attentionList", JSON.stringify(attentionList.value))
        }
      }else{
        ElMessage.success(res.msg ||"关注"+user.username+"失败");
      }
    })
  }
};

// 跳转到用户首页
const navigateToUserHome = (user) => {
  localStorage.setItem("userId", user.id)
  localStorage.setItem("visitedUser",JSON.stringify(user));
  router.push(`/person`);
};

//初始化数据
const initData = () => {
  //获取attentionList数据
  let term=JSON.parse(localStorage.getItem("attentionList"))
  attentionList.value=term
  //获取关注用户列表
  request.post(`user/selectUsersByAttentionList`,attentionList.value).then((res)=>{
    if(res.code==='200'){
      followingUsers.value=res.data  //存储关注用户列表
          if(parseInt(data.user.id)===parseInt(userId)){  //这是查询我自己的关注列表，所以查询到的用户都是已经关注的
            // 用attentionState存储对每一个已关注用户的关注状态
            followingUsers.value.map((user) => {
              attentionState.value.set(user.id, true);
            })
          }
          else{  //这是别人的关注列表，我自己不一定关注了这个人所关注的用户，所以需要查询我是否关注了这些人
             request.get(`/user/selectAttentionById/${data.user.id}`).then((res) => {
               if(res.code==='200'){
                 attentionList.value=res.data
                 //给我关注的用户添加已关注的记录
                 attentionList.value.map((item) => {
                   attentionState.value.set(item.bsid, true);
                 })
               }else {
                 ElMessage.error(res.msg || "获取我所关注的用户列表失败")
               }
             })
          }
    }else{
      ElMessage.error("获取用户信息失败")
    }
  })
}

onMounted(() => {
  window.scrollTo(0,0)
  initData()
})

</script>

<style scoped>
/* 样式部分保持不变 */
.following-container {
  padding: 20px;
  background-color: #f0f7f0;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-title {
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  position: relative;
}

.page-title h2 {
  font-size: 24px;
  color: #333;
  margin: 0 auto; /* 居中标题 */
}

/* 返回按钮样式 */
.back-button {
  position: absolute;
  left: 0;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.back-button:hover {
  background: #388E3C;
  transform: translateY(-2px);
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

/* 两列网格布局 */
.following-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

/* 用户项样式 - 调整高度以容纳签名 */
.following-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  min-height: 90px; /* 增加最小高度以容纳签名 */
}

.following-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  border: 2px solid #4CAF50;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
  margin-right: 15px;
}

.user-name {
  font-size: 18px;
  color: #333;
  margin: 0 0 5px 0; /* 增加底部间距 */
  cursor: pointer;
  transition: color 0.2s ease;
}

.user-name:hover {
  color: #4CAF50;
}

/* 新增签名样式 */
.user-signature {
  font-size: 14px;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 无签名时的占位样式 */
.user-signature.placeholder {
  color: #aaa;
  font-style: italic;
}

/* 关注/取消关注按钮样式 */
.follow-btn {
  padding: 10px 20px;
  font-size: 16px;
  background: white;
  color: #4CAF50;
  border: 1px solid #4CAF50;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(76, 175, 80, 0.2); /* 调整阴影颜色 */
  white-space: nowrap;
  min-width: 110px;
}

.follow-btn:hover {
  background: #f1f8e9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.4);
}

.unfollow-btn {
  background: white;
  color: #f44336;
  border: 1px solid #f44336;
  box-shadow: 0 2px 5px rgba(244, 67, 54, 0.2);
}

.unfollow-btn:hover {
  background: #ffebee;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

/* 无关注时显示 */
.no-following {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 10px;
  color: #666;
  font-size: 16px;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 10px 0;
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
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.pagination-ellipsis {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
}

.page-jump input {
  width: 50px;
  height: 34px;
  padding: 0 5px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
}

.jump-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.jump-button:hover {
  background: #388E3C;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .following-grid {
    grid-template-columns: 1fr; /* 手机设备显示一列 */
  }

  .following-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .follow-btn {
    align-self: flex-end;
    margin-top: 5px;
  }

  .user-signature {
    white-space: normal;
    overflow: visible;
  }

  /* 小屏幕下返回按钮样式调整 */
  .back-button {
    position: relative;
    margin-bottom: 10px;
  }

  .page-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title h2 {
    margin: 0;
  }
}
</style>