<template>
  <div class="post-detail-container">
    <!-- 顶部操作栏开始 -->
    <div class="action-bar">
      <button class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon> 返回
      </button>
    </div>
    <!-- 顶部操作栏结束 -->

    <!-- 帖子详情内容 -->
    <div class="content-wrapper">
      <!-- 左侧主要内容 -->
      <div class="main-content">
        <!-- 帖子标题 -->
        <div class="post-card">
          <h1 class="post-title">{{ data.post.title }}</h1>

          <!-- 帖子信息开始 -->
          <div class="post-meta">

            <!--作者的信息开始-->
            <div class="author-info">
              <el-avatar :src="data.post.dateUser.avatar" class="author-avatar" :size="36" />
              <div class="author-details">
                <span class="author-name">{{ data.post.dateUser.username }}</span>
                <span class="post-time">{{ data.post.time }}</span>
              </div>
            </div>
            <!--作者的信息结束-->

            <!-- 交互按钮开始 -->
            <div class="post-actions">
              <div class="action-item" :class="{ 'active': data.post.isliked }" @click="togglePostLike(data.post.pid)">
                <el-icon :size="20">
                  <svg v-if=" data.post.isLiked === 0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="#ff3860" stroke="#ff3860" stroke-width="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </el-icon>
                <span class="action-text">{{ data.post.likes }}</span>
              </div>

              <div class="action-item">
                <el-icon :size="20"><ChatRound /></el-icon>
                <span class="action-text">{{ data.post.comments }}</span>
              </div>
            </div>
            <!-- 交互按钮结束 -->

          </div>
          <!-- 帖子信息结束 -->

        </div>

        <!-- 帖子正文 -->
        <div class="post-card">
          <div class="post-content" v-html="data.post.contents"></div>

          <!-- 帖子图片 -->
          <div class="post-image-container" v-if="data.post.images">
            <el-image
                :src="data.post.images"
                alt="post image"
                class="post-image"
                lazy
                fit="cover"
            >
            </el-image>
          </div>
        </div>

        <!-- 运动数据开始（如果是运动帖子） -->
        <div class="post-card" v-if="data.post.sportType">
          <div class="section-title">运动数据</div>
          <div class="sport-data-grid">
            <div class="sport-data-item" v-if="data.post.sporttime">
              <div class="data-label">时长</div>
              <div class="data-value">{{data.post.sporttime }} 分钟</div>
            </div>
            <div class="sport-data-item" v-if="data.post.calorie">
              <div class="data-label">消耗</div>
              <div class="data-value">{{ data.post.calorie }} 卡路里</div>
            </div>
            <div class="sport-data-item" v-if="data.post.sportType">
              <div class="data-label">类型</div>
              <div class="data-value">{{ data.post.sportType }}</div>
            </div>
          </div>
        </div>
        <!-- 运动数据结束（如果是运动帖子） -->

        <!-- 评论区开始 -->
        <div class="post-card comments-section" ref="commentsSection">
          <!-- 展示评论数 -->
          <div class="section-title">
            <el-icon><ChatRound /></el-icon>
            评论 ({{ data.post.comments }})
          </div>
          <!-- 评论输入框 -->
          <div class="comment-input-area">
            <el-input
                v-model="newComment"
                type="textarea"
                placeholder="请输入您的评论..."
                :rows="3"
                class="comment-textarea"
            />
            <div class="comment-actions-bar">
              <el-button
                  type="primary"
                  @click="submitComment"
                  :disabled="!newComment.trim()"
                  class="submit-comment-btn"
              >
                发布评论
              </el-button>
            </div>
          </div>

          <!--展示评论-->
          <div class="comments-container">
            <div
                v-for="comment in displayedComments"
                :key="comment.sid"
                class="comment-item"
                :class="{ 'is-author': comment.sid=== data.post.sid }"
            >
              <div class="comment-header">
                <el-avatar :src="comment.avatar" class="comment-avatar" :size="36" />
                <div class="comment-author-info">
                  <div class="comment-author">
                    {{ comment.username }}
                    <span v-if="comment.sid === data.post.sid" class="author-badge">作者</span>
                  </div>
                </div>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>

            <!-- 查看更多评论按钮 -->
            <div class="load-more" v-if="showLoadMore">
              <button @click="loadMoreComments" class="load-more-btn">
                查看更多评论 ({{ remainingCommentsCount }}条)
              </button>
            </div>

            <div class="no-more-comments" v-if="!showLoadMore && mergedPosts.length > 0">
              <el-icon><Check /></el-icon>
              <span>已显示所有评论</span>
            </div>

          </div>
        </div>
        <!-- 评论区结束 -->
      </div>

      <!-- 右侧信息 -->
      <div class="sidebar">
        <!-- 作者信息和安全守则容器 -->
        <div class="sidebar-sticky-container">

          <!-- 作者信息卡片开始 -->
          <div class="post-card author-card">
            <div class="section-title">作者信息</div>
            <div class="author-profile">
              <el-avatar :src="data.post.dateUser.avatar" class="author-avatar-large" :size="50" />
              <div class="author-name-large">{{ data.post.dateUser.username }}</div>
              <div class="author-bio">运动爱好者，分享健康生活</div>
              <div class="author-stats">
                <div class="stat">
                  <span class="stat-number">{{data.post.dateUser.posts}}</span>
                  <span class="stat-label">帖子</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ data.post.dateUser.fans}}</span>
                  <span class="stat-label">粉丝</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ data.post.dateUser.likes }}</span>
                  <span class="stat-label">获赞</span>
                </div>
              </div>
              <button v-if="!realattention" @click="togglePostAttention()" class="follow-btn">关注</button>
              <button v-else  @click="togglePostAttention()" class="follow-btn">已关注</button>
            </div>
          </div>
          <!-- 作者信息卡片结束 -->

          <!-- 运动安全黄金守则开始 -->
          <div class="post-card safety-rules">
            <div class="section-title">运动安全黄金守则</div>
            <div class="safety-rules-content">
              <div
                  v-for="rule in safetyRules"
                  :key="rule.id"
                  class="rule-item"
              >
                <div class="rule-number">{{ rule.number }}</div>
                <div class="rule-text">{{ rule.content }}</div>
              </div>
            </div>
          </div>
          <!-- 运动安全黄金守则结束 -->

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick ,computed} from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Edit, ChatRound, Share, Picture, Bottom, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from "@/utils/request.js";

const router = useRouter()

// 帖子数据
const data = reactive({
  post: JSON.parse(localStorage.getItem("post")),
  user: JSON.parse(localStorage.getItem("user")),
  //点赞列表的雏形
  likesList:{sid:null,pid:null},
  //评论列表
  comment:{sid:null,pid:null,content:null},
  //关注列表
  AttentionList:{sid:null,bsid:null},
});

// 添加交互状态字段
const posts = ref([

]);

//对应的发表评论的人
const dateUser=ref([

]);


//up信息
const up = reactive({
  value:{}
})

//用户的关注列表
const attentionlist=ref([

]);
//用户是否关注了帖子的发布者
const realattention=ref(false)

// 评论数据
const comments = ref([])
const newComment = ref('')
const commentsSection = ref(null)

// 评论分页相关
const displayedCommentCount = ref(4) // 初始显示4条评论
const showLoadMore = computed(() => mergedPosts.value.length > displayedCommentCount.value)

// 计算显示的评论
const displayedComments = computed(() => {
  return mergedPosts.value.slice(0, displayedCommentCount.value)
})

// 计算剩余评论数量
const remainingCommentsCount = computed(() => {
  return mergedPosts.value.length - displayedCommentCount.value
})

// 加载更多评论
const loadMoreComments = () => {
  // 每次加载4条评论
  displayedCommentCount.value += 4

  // 如果已经显示所有评论，不再显示加载更多按钮
  if (displayedCommentCount.value >= mergedPosts.value.length) {
    displayedCommentCount.value = mergedPosts.value.length
  }
}

// 运动安全黄金守则
const safetyRules = ref([
  { id: 1, number: '1.', content: '运动前充分热身，避免肌肉拉伤' },
  { id: 2, number: '2.', content: '选择合适的运动装备，保护关节和身体' },
  { id: 3, number: '3.', content: '循序渐进增加运动强度，避免过度训练' },
  { id: 4, number: '4.', content: '保持充足水分补充，防止脱水' },
  { id: 5, number: '5.', content: '运动后进行拉伸放松，帮助肌肉恢复' },
  { id: 6, number: '6.', content: '注意运动环境安全，避免意外伤害' }
])

//合并评论数组
const mergedPosts = computed(() => {
  // 1. 把 dateUser 转成 Map，key 是配对字段
  const detailMap = new Map(
      dateUser.value.map(item => [item.id, item])
  )

  // 2. 遍历 comments，按配对字段查找并合并
  return comments.value.map(comment => ({
    ...comment,
    ...detailMap.get(comment.sid)
  }))
})

// 返回上一页
const goBack = () => {
  router.go(-1)
}

//删除后端点赞列表的方法
const deleteForumLikeList = async (sid,pid) => {
  try {
    const res = await request.delete("posts/deleteLikesList", {
      params: { sid ,pid} // 将 id 作为查询参数传递
    });
    if (res.code === '200') { // 注意这里应该是 !== 而不是 !(
      ElMessage.success("取消点赞成功")
    }else{
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error('请求失败:', error);
    ElMessage.error('请求失败');
  }
};

// 点赞功能（传入 pid）
const togglePostLike = (pid) => {
  // 找到 posts 中的原始对象
  const postss = posts.value.find(p => p.pid === pid);

  //开始点赞
  if (data.post.isLiked === 0){
    //封装点赞列表
    data.likesList.sid=data.user.id;
    data.likesList.pid=postss.pid;
    //记录点赞列表
    request.post("posts/insertLikesList",data.likesList).then((res) => {
      if (res.code === '200') {
        ElMessage.success("点赞成功")
      }else{
        ElMessage.error(res.msg)
      }
    })
    //保存好新的帖子列表
    postss.likes+=1;//目前帖子的获赞数加1
    up.value.likes+=1;//发布帖子的用户获赞数加1
    request.put("posts/update",postss)//更新帖子
    request.put("user/update",up.value)//更新发布帖子的作者信息
    //更新前端的帖子信息
    data.post.likes+=1;
    data.post.dateUser.likes+=1;
    data.post.isLiked=1;
    localStorage.setItem('post',JSON.stringify(data.post))
  }else{//取消点赞
    //删除点赞列表
    deleteForumLikeList(data.user.id,postss.pid)
    postss.likes-=1;//目前帖子的获赞数减1
    up.value.likes-=1;//发布帖子的用户获赞数减1
    request.put("posts/update",postss)//更新帖子
    request.put("user/update",up.value)//更新发布帖子的作者信息
    //更新前端的帖子信息
    data.post.likes-=1;
    data.post.dateUser.likes-=1;
    data.post.isLiked=0;
    localStorage.setItem('post',JSON.stringify(data.post))
  }
};

// 提交评论
const submitComment = () => {
  // 找到 posts 中的原始对象
  const postss = posts.value.find(p => p.pid === data.post.pid);

  //判断评论内容是否为空
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  //封装新的评论列表
  data.comment.sid=data.user.id;
  data.comment.pid=data.post.pid;
  data.comment.content=newComment.value

  //保存帖子
  request.post("/posts/insertComment",data.comment).then((res)=>{
    if (res.code === '200') {
      //帖子数据更新到数据库
      postss.comments+=1//帖子的获赞数+1
      request.put("posts/update",postss)//保存帖子的值到后端
      //更新前端的帖子评论数
      data.post.comments+=1;
      localStorage.setItem('post',JSON.stringify(data.post))
      //刷新一下页面
      refreshDate()
      ElMessage.success("发表成功")
    }else{
      ElMessage.error(res.msg)
    }
  })
}

//删除后端关注列表的方法
const deleteForumAttentionList = async (sid,bsid) => {
  try {
    const res = await request.delete("user/deleteAttention", {
      params: { sid ,bsid} // 将 id 作为查询参数传递
    });
    if (res.code === '200') { // 注意这里应该是 !== 而不是 !(
      ElMessage.success("取消关注成功")
    }else{
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error('请求失败:', error);
    ElMessage.error('请求失败');
  }
};

//关注功能
const togglePostAttention=()=>{
  //自己不能关注自己
  if(data.user.id===data.post.sid){
    ElMessage.error("不能关注自己哦")
    return;
  }

  //开始关注
  if (!realattention.value){
    //封装关注列表
    data.AttentionList.sid=data.user.id;
    data.AttentionList.bsid=data.post.sid;
    //记录关注列表
    request.post("user/insertAttention",data.AttentionList).then((res) => {
      if (res.code === '200') {
        ElMessage.success("关注成功")
        //重新获取用户的信息
        request.get(`user/selectById/${data.user.id}`).then((utf)=>{
          data.user=utf.data;
          //保存好新的帖子列表
          data.user.attention+=1;//用户的关注量加1
          data.post.dateUser.fans+=1;//用户粉丝量加1
          request.put("user/update",data.user)//更新用户本身的信息
          request.put("user/update",data.post.dateUser)//更新发布帖子的作者信息
          localStorage.setItem('user',JSON.stringify(data.user))
          localStorage.setItem('post',JSON.stringify(data.post))
        })
      }else{
        ElMessage.error(res.msg)
      }
    })
    //创建一个新的聊天室
    const newContact = ref({
      idOne: data.user.id,
      idTwo: data.post.sid,
      lastMessage: null,
      pinned1: 0,
      pinned2: 0,
      notlike1:0,
      notlike2:0,
      lasttime: '2025-11-20 04:02:51',
      isfriend:0
    })
    //保存消息到后台
    request.post("chatroom/insertChatRoom",newContact.value).then((res)=>{
      if (res.data === null ){
        //说明聊天室存在
        //将聊天室的notlike的值设置为0
        request.get("chatroom/selectBytwoId",{params:{idOne:data.user.id,idTwo:data.post.sid}}).then((aqs)=>{
          if (aqs.data.idOne === data.user.id){
            aqs.data.notlike1=0;
          } else{
            aqs.data.notlike2=0;
          }
          request.put("chatroom/updateBytwoId",aqs.data,{params:{idOne:aqs.data.idOne,idTwo:aqs.data.idTwo}}).then((res)=>{
            if (res.code==="200"){
              setTimeout(()=>{
                window.location.reload()
              },500)
            }else{
              setTimeout(()=>{
                window.location.reload()
              },500)
            }
          })
        })
      }
      //判断二人是否成为了好友
      request.get(`user/selectAttentionById/${data.post.sid}`).then((aqs)=>{
        if (aqs.code==="200"){
          data.AttentionLists=aqs.data
          data.AttentionLists.forEach((item)=>{
            if (item.bsid === data.user.id){
              //对面关注了我，则修改聊天室词缀isfriend为1
              request.get("chatroom/selectBytwoId",{params:{idOne:data.user.id , idTwo:data.post.sid}}).then((cas)=>{
                if (cas.code==="200"){
                  cas.data.isfriend=1;
                  request.put("chatroom/updateBytwoId",cas.data,{params:{idOne:cas.data.idOne , idTwo:cas.data.idTwo}}).then((juc)=>{
                    if (juc.code ==="200"){
                      setTimeout(()=>{
                        window.location.reload();
                      },500)
                    }
                  })
                }
              })
            }
          })
        }
      })
      setTimeout(()=>{
        window.location.reload();
      },500)
    })
  }else{//取消关注
    //删除关注列表
    const one = data.user.attention;
    const two=ref(null);
    deleteForumAttentionList(data.user.id,data.post.sid)
     request.get(`user/selectById/${data.user.id}`).then((bbc)=>{
       two.value= bbc.data.attention;
     })

    if (one !== two.value) {
      //重新获取用户的信息
      request.get(`user/selectById/${data.user.id}`).then((utf) => {
        data.user = utf.data;
        //保存好新的帖子列表
        data.user.attention -= 1;//用户的关注量减1
        data.post.dateUser.fans -= 1;//用户粉丝量减1
        request.put("user/update", data.user)//更新用户本身的信息
        request.put("user/update", data.post.dateUser)//更新发布帖子的作者信息
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('post', JSON.stringify(data.post))
      })
    }
    //将聊天室的notliked的值换成1
    request.get("chatroom/selectBytwoId",{params:{idOne:data.user.id,idTwo:data.post.sid}}).then((res)=>{
      if (res.data.idOne === data.user.id){
        res.data.notlike1=1;
      } else{
        res.data.notlike2=1;
      }
      res.data.isfriend=0;
      request.put("chatroom/updateBytwoId",res.data,{params:{idOne:res.data.idOne,idTwo:res.data.idTwo}}).then((aqs)=>{
        if (aqs.code==="200"){
          //判断双方是否互相拉黑了，假设是，则删除聊天室,并删除全部的聊天记录
          if (res.data.notlike1===1 && res.data.notlike2===1){
            //删除聊天室
            request.delete("chatroom/deleteChatRoom",{params:{idOne:res.data.idOne,idTwo:res.data.idTwo}})
            //删除全部的聊天记录
            request.delete("messagelist/deleteByTwoId",{params:{idOne:res.data.idOne,idTwo:res.data.idTwo}})
          }
          setTimeout(()=>{
            window.location.reload();
          },500)
        }else{
          ElMessage.error(res.msg)
        }
      })
    })
  }
}

const refreshDate=()=>{
  //获取所有的帖子信息
  request.get("/posts/selectAll").then((res) => {
    if (res.code === '200') {
      posts.value = res.data
    }else{
      ElMessage.error(res.msg)
    }
  })

  //获取发布帖子的up信息
  request.get(`user/selectById/${data.post.dateUser.id}`).then((res) => {
    if (res.code === '200') {
      up.value = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  })

  //确定是否点赞过了这个帖子
  request.get(`user/selectLikesList/${data.user.id}`).then((res) => {
    if (res.code === '200') {
      data.LikesList = res.data;
      //观察用户是否点赞了这个视频
      data.LikesList.forEach((item) => {
        if (item.pid === data.post.pid) {
          data.post.isLiked=1;
          localStorage.setItem('post',JSON.stringify(data.post))
        }
      })
    } else ElMessage.error(res.msg);
  })

  //根据帖子的id查询对应的所有帖子评论
  request.get(`posts/selectByPid/${data.post.pid}`).then((res)=>{
    if (res.code === '200') {
      comments.value = res.data;
      //获取评论者的信息
      comments.value.forEach((item)=>{
        request.get(`user/selectById/${item.sid}`).then((res) => {
          if (res.code === '200'){
            dateUser.value.push(res.data);
          }else{
            ElMessage.error(res.msg)
          }
        })
      })
    } else {
      ElMessage.error(res.msg);
    }
  })

  //根据用户的id查找对应的关注列表
  request.get(`user/selectAttentionById/${data.user.id}`).then((res)=>{
    if (res.code === '200') {
      attentionlist.value = res.data;
      //观察用户是否关注了这个up
      attentionlist.value.forEach((item) => {
        if (item.bsid === data.post.sid) {
          realattention.value=true;
        }
      })
    } else {
      ElMessage.error(res.msg);
    }
  })
}
// 组件挂载时加载评论
onMounted(() => {
  window.scrollTo(0,0)
  refreshDate()
})



</script>

<style scoped>
.post-detail-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  padding: 30px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 操作栏样式 */
.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 15px;
}

.back-btn, .edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.back-btn {
  color: #27AE60;
  background: #fff;
   border: 1px solid #27AE60;
}

.back-btn:hover {
  background: #f0f9f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2);
}

.edit-btn {
  color: #fff;
  background: linear-gradient(135deg, #27AE60, #66bb6a);
  border: none;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #219653, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

/* 内容区域布局 */
.content-wrapper {
  display: grid;
  grid-template-columns: 4fr 1fr;
  gap: 25px;
}

.main-content, .sidebar {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 卡片通用样式 */
.post-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 25px;
  border: 1px solid #eee;
  transition: all 0.3s ease;
  overflow: hidden;
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(39, 174, 96, 0.25);
}

.section-title {
  height: 35px;
  font-size: 1.2rem;
  color: #27AE60;
  font-weight: 600;
  margin-bottom: 20px;
  position: relative;
  padding-left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  height: 22px;
  width: 4px;
  background: #27AE60;
  border-radius: 2px;
}

/* 帖子标题 */
.post-title {
  font-size: 1.9rem;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.5px;
}

/* 帖子元信息 */
.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.author-name {
  font-weight: 600;
  color: #27AE60;
  font-size: 1.1rem;
}

.post-time {
  font-size: 0.9rem;
  color: #888;
}

/* 帖子交互按钮 */
.post-actions {
  display: flex;
  gap: 25px;
  justify-content: flex-end;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 1rem;
  padding: 8px 15px;
  border-radius: 10px;
}

.action-item:hover {
  color: #27AE60;
  background-color: #f0f9f0;
  transform: translateY(-2px);
}

.action-item.liked {
  color: #ff3860;
}

.action-item.favorited {
  color: #ffc107;
}

/* 帖子正文内容 */
.post-content {
  line-height: 1.9;
  font-size: 1.05rem;
  color: #444;
  margin: 25px 0;
  padding: 10px 0;
}

.post-content :deep(p) {
  margin: 0 0 20px 0;
  line-height: 1.9;
}

.post-content :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 15px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 帖子图片 */
.post-image {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
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
  border-radius: 12px;
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

/* 运动数据网格 */
.sport-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.sport-data-item {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #f0f9f0, #e8f5e9);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.sport-data-item:hover {
  transform: translateY(-3px);
}

.data-label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.data-value {
  font-weight: 700;
  color: #27AE60;
  font-size: 1.1rem;
}

/* 作者卡片 */
.author-card {
  text-align: center;
  position: relative;
  top: 0;
}

.author-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.author-avatar-large {
  width: 60px;
  height: 60px;
  border: 3px solid #e0e0e0;
  margin: 10px 0;
}

.author-name-large {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.author-bio {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

.author-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin: 10px 0;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-number {
  font-weight: 700;
  color: #27AE60;
  font-size: 1.2rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #888;
}

.follow-btn {
  background: linear-gradient(135deg, #27AE60, #66bb6a);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.follow-btn:hover {
  background: linear-gradient(135deg, #219653, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(39, 174, 96, 0.4);
}

/* 帖子图片容器 */
.post-image-container {
  text-align: center;
  margin-top: 25px;
  padding: 15px 0;
}

.post-image {
  width: 300px;
  height: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

/* 评论区样式 */
.comments-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 25px;
  border: 1px solid #eee;
  transition: all 0.3s ease;
  overflow: hidden;
}

.comment-input-area {
  padding-bottom: 25px;
  border-bottom: 1px solid #eee;
  margin-bottom: 25px;
}

.comment-input-area .el-textarea {
  margin-bottom: 15px;
}

.comment-input-area .el-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  padding: 15px;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.comment-input-area .el-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2);
  border-color: #27AE60;
}

.comment-textarea {
  margin-bottom: 15px;
}

.comment-actions-bar {
  display: flex;
  justify-content: flex-end;
}

.submit-comment-btn {
  background: linear-gradient(135deg, #27AE60, #66bb6a);
  border: none;
  color: white;
  padding: 10px 28px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.submit-comment-btn:hover {
  background: linear-gradient(135deg, #219653, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(39, 174, 96, 0.4);
}

.submit-comment-btn:active {
  transform: translateY(0);
}

.comment-item {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  transition: all 0.3s ease;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item:hover {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.comment-item.is-author {
  border-left: 3px solid #27AE60;
  background-color: #f0f9f0;
}

.comment-item.is-author:hover {
  background-color: #e8f5e9;
}

.comment-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
}

.comment-author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-author {
  font-weight: 600;
   color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-badge {
  background: #27AE60;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.comment-time {
  font-size: 0.8rem;
  color: #999;
}

.comment-content {
  margin: 12px 0 15px 48px;
  line-height: 1.7;
  color: #444;
  font-size: 1rem;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.comment-item:hover .comment-content {
  background-color: #f0f0f0;
}

.comment-item.is-author .comment-content {
  background-color: #e1f5e1;
  border-left: 3px solid #27AE60;
}

.comment-item.is-author:hover .comment-content {
  background-color: #d0f0d0;
}

.comment-like {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #999;
  font-size: 0.85rem;
  background-color: #f5f5f5;
}

.comment-like:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}

.comment-like.liked {
  color: #ff3860;
  background-color: #fff5f7;
  box-shadow: 0 2px 6px rgba(255, 56, 96, 0.2);
}

.comment-like svg {
  transition: all 0.3s ease;
}

.load-more, .no-more-comments, .no-comments {
  text-align: center;
  padding: 20px 0;
  color: #666;
}

.load-more-btn {
  background: linear-gradient(135deg, #27AE60, #66bb6a);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  width: 100%;
  margin-top: 15px;
}

.load-more-btn:hover {
  background: linear-gradient(135deg, #219653, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(39, 174, 96, 0.4);
}

.no-more-comments {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #27AE60;
  padding: 15px 0;
  font-weight: 500;
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #999;
}

.no-comments p {
  margin: 0;
}

.infinite-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 15px;
  color: #27AE60;
  font-size: 0.9rem;
}

/* 侧边栏固定容器 */
.sidebar-sticky-container {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 运动安全黄金守则 */
.safety-rules {
  position: relative;
  top: 0;
}

.safety-rules-content {
  background: linear-gradient(135deg, #e8f5e9 0%, #f0f9f0 100%);
  border-radius: 12px;
  padding: 20px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px 0;
  border-bottom: 1px dashed #d0e5d0;
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-number {
  font-weight: 700;
  color: #27AE60;
  min-width: 24px;
  background: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(39, 174, 96, 0.2);
}

.rule-text {
  color: #333;
  line-height: 1.6;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
    flex-direction: row;
    gap: 25px;
  }

  .author-card, .safety-rules {
    width: 50%;
    flex: 1;
  }

  .author-card {
    top: 0;
  }

  .safety-rules {
    top: 0;
  }
}

@media (max-width: 768px) {
  .post-detail-container {
    padding: 15px;
  }

  .action-bar {
    flex-direction: column;
  }

  .post-title {
    font-size: 1.5rem;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .post-actions {
    width: 100%;
    justify-content: space-around;
  }

  .post-content {
    font-size: 1rem;
  }

  .post-images {
    grid-template-columns: 1fr;
  }

  .sport-data-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .sidebar {
    flex-direction: column;
  }

  .author-card, .safety-rules {
    width: 100%;

  }}
</style>
