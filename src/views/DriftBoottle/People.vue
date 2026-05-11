<template>
  <!-- 主容器 -->
  <div class="drift-bottle-main">
    <!-- 顶部标题栏 -->
    <header class="header">
      <div class="header-content">
        <div><!-- 占位元素，保持左侧平衡 --></div>
        <h1 class="page-title">漂流瓶广场</h1>
        <div class="header-actions">
          <!-- 捞瓶子按钮 -->
          <button class="action-btn fish-btn" @click="fishBottle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            捞瓶子
          </button>
          <!-- 扔瓶子按钮 -->
          <button class="action-btn throw-btn" @click="showThrowModal = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            扔瓶子
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 漂流瓶列表容器 -->
      <div class="bottles-container">
        <!-- 循环渲染每个漂流瓶 -->
        <div
            v-for="bottle in bottles"
            :key="bottle.bid"
            class="bottle-item"
            :class="{ 'expanded': expandedBottle === bottle.bid }"
            :style="{
            top: bottle.randomTop,
            left: bottle.randomLeft,
            position: 'absolute'
            }"
            @click="toggleBottle(bottle.bid)"
        >

          <!-- 头像（初始状态） -->
          <div class="avatar-container" v-if="expandedBottle !== bottle.bid">
            <img :src="bottle.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" :alt="bottle.username" class="user-avatar" />
            <div class="avatar-glow"></div>
          </div>

          <!-- 展开的详细信息 -->
          <div class="bottle-details" v-if="expandedBottle === bottle.bid">
            <div class="bottle-header">
              <img :src="bottle.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" :alt="bottle.username" class="detail-avatar" />
              <div class="user-info">
                <h3 class="username">{{ bottle.username }}</h3>
              </div>
              <button class="close-btn" @click.stop="expandedBottle = null">×</button>
            </div>

            <div class="bottle-content">
              <p class="message">{{ bottle.content}}</p>
              <div class="tags">
                <span class="tag" >{{ bottle.tag }}</span>
              </div>
              <div class="meta-info">
                <span>回复次数：{{bottle.replies}}</span>
                <span style="margin-left: 150px" class="location">{{ bottle.location }}</span>
              </div>
            </div>

            <div class="bottle-actions">
              <button class="action-button reply-btn" @click="replyToBottle(bottle)">
                <span class="action-icon">💬</span>
                关注并回复
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-actions">
        <button class="bottom-btn" @click="refreshBottles">
          <span class="btn-icon">🔄</span>
          刷新
        </button>
      </div>
    </main>
    <!-- 扔瓶子模态框 -->
    <div v-if="showThrowModal" class="modal-overlay" @click="showThrowModal = false">
      <div class="throw-modal" @click.stop>
        <div class="modal-header">
          <h3>🌊 扔瓶子</h3>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label>标题</label>
            <input v-model="newbottle.title" type="text" placeholder="给你的瓶子起个标题..." maxlength="20">
          </div>

          <div class="form-group">
            <label>内容 <span class="required">*</span></label>
            <textarea v-model="newbottle.content" placeholder="写下你想分享的内容..." rows="6"
                      maxlength="500"></textarea>
          </div>

          <div class="form-group">
            <div>标签</div>
            <el-select
                v-model="newbottle.tag"
                placeholder="请选择运动类型"
                class="sport-type-select"
            >
              <el-option
                  v-for="sport in sportTypes"
                  :key="sport.name"
                  :label="sport.name"
                  :value="sport.name"
              />
            </el-select>
          </div>

          <div class="form-group">
            <label>位置</label>
            <input v-model="newbottle.location" type="text" placeholder="你在哪里？" maxlength="30">
          </div>


        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showThrowModal = false" :disabled="isThrowing">取消</button>
          <button class="confirm-btn" @click="throwBottle" :disabled="isThrowing">
            <span >🌊 扔出瓶子</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 捞瓶子模态框 -->
    <div v-if="showFishModal" class="modal-overlay" @click="showFishModal = false">
      <div class="fish-modal" @click.stop>
        <div class="fish-animation" v-if="isFishing">
          <div class="fishing-rod">
            <div class="rod-line"></div>
            <div class="hook">🎣</div>
          </div>
          <div class="water-waves">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>
          <p class="fishing-text">正在捞瓶子...</p>
        </div>

        <div class="caught-bottle" v-if="caughtBottle && !isFishing">
          <div class="bottle-animation">
            <div class="bottle-icon">🍶</div>
            <div class="sparkles">
              <span class="sparkle">✨</span>
              <span class="sparkle">⭐</span>
              <span class="sparkle">💫</span>
            </div>
          </div>
          <h3>恭喜！你捞到了一个瓶子</h3>
          <div class="bottle-content-card">
            <div class="bottle-header">
              <img :src="caughtBottle.avatar||'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" :alt="caughtBottle.username" class="caught-avatar" />
              <div class="caught-info">
                <h4>{{ caughtBottle.username }}</h4>
              </div>
            </div>
            <p class="caught-message">{{ caughtBottle.content }}</p>
            <div class="caught-tags">
              <span  :key="tag" class="caught-tag">{{caughtBottle.tag}}</span>
            </div>
            <div class="caught-meta">
              <span>回复次数：{{caughtBottle.replies}}</span>
              <span  style="margin-left: 300px">来自 {{ caughtBottle.location }}</span>
            </div>
          </div>
          <div class="fish-modal-actions">
            <button class="reply-btn" @click="replyToBottle(caughtBottle)">回复</button>

            <button class="close-btn" style="margin-right: 20px;margin-top: 20px" @click="closeFishModal">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {ref, onMounted, computed, reactive} from 'vue'
// 2. 导入Vue Router功能
// useRouter: 用于获取路由实例，进行页面导航等操作
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
// 导入路由
import router from "@/router/index.js";

const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
  //关注列表
  AttentionList:{sid:null,bsid:null},
});

// 4. 初始化路由实例


const isThrowing = ref(false)

//用户的关注列表
const attentionlist=ref([

]);

// 5. 定义响应式数据（状态管理）
// expandedBottle: 存储当前被点击展开的瓶子ID，null表示没有瓶子被展开
const expandedBottle = ref(null)

// showThrowModal: 控制"扔瓶子"模态框的显示状态，true为显示，false为隐藏
const showThrowModal = ref(false)

// showFishModal: 控制"捞瓶子"模态框的显示状态
const showFishModal = ref(false)

// isFishing: 标识是否正在执行捞瓶子操作，用于显示捞取动画
const isFishing = ref(false)

// caughtBottle: 存储成功捞取到的瓶子数据对象
const caughtBottle = ref(null)


// 6. 定义漂流瓶数据数组
// bottles: 存储当前页面上显示的所有漂流瓶数据
const bottles = ref([])

//原数据
const bottless=ref([

])

//对应的扔出瓶子的的人
const dateUser=ref([

]);

if(!data.user){
  router.push('/login')
}

//扔出瓶子的模板
const newbottle = reactive({
  sid:data.user.id,
  title:null,
  content:null,
  tag:null,
  location:null,
  replies:0
})


// 运动类型列表
const sportTypes = ref([
  { name: '跑步' }, { name: '游泳' }, { name: '骑行' },
  { name: '瑜伽' }, { name: '健身' }, { name: '篮球' },
  { name: '足球' }, { name: '网球' }, { name: '羽毛球' }
])

//捞到瓶子的数据
const bottlelist=({
  bid:null,
  sid:null
})

//合并瓶子和其扔瓶子的人的数据
const mergedBottle= computed(() => {
  // 1. 把 dateUser 转成 Map，key 是配对字段
  const detailMap = new Map(
      dateUser.value.map(item => [item.id, item])
  )

  // 2. 遍历 comments，按配对字段查找并合并
  return bottless.value.map(bottle => ({
    ...bottle,
    ...detailMap.get(bottle.sid)
  }))
})


// 7. 生成随机漂流瓶数据的函数
const generateRandomBottles = () => {
  //存储随机展示数据的函数
  const bottleData = ref([])

  // 循环生成随机位置的漂流瓶数据(最多12个)
  for (let i = 0; i <Math.min(mergedBottle.value.length,12);i++) {
    // 生成随机位置（百分比）
    const randomTop = Math.random() * 80 + 10; // 10% 到 90% 之间的随机值
    const randomLeft = Math.random() * 80 + 10; // 10% 到 90% 之间的随机值

    // 构建单个漂流瓶对象
    bottleData.value.push({
      ...mergedBottle.value[i],
      // 页面定位相关属性
      randomTop: randomTop + '%',
      randomLeft: randomLeft + '%',
    });
  }

  // 将生成的数据赋值给响应式变量
  bottles.value = bottleData.value;
}

// 9. 切换瓶子展开状态的函数
// 参数id: 要展开或收起的瓶子ID
const toggleBottle = (bid) => {
  // 如果点击的是已展开的瓶子，则收起（设置为null）
  // 如果点击的是其他瓶子，则展开该瓶子
  expandedBottle.value = expandedBottle.value === bid ? null : bid
}


// 11. 扔瓶子函数
// 处理用户扔出新瓶子的操作
const throwBottle = () => {
  isThrowing.value = true

  // 检查输入内容是否非空（去除首尾空格）
    request.post("bottle/insert",newbottle).then((res)=>{
      if (res.code === '200'){
        ElMessage.success("添加成功")
        window.location="/driftBottleMain"
      }else{
        ElMessage.error(res.msg)
      }
    })
    // 关闭模态框
    isThrowing.value = false

    // 清空输入内容
    newbottle.value = ''

    // 这里可以添加成功提示 toast 等用户反馈
}

// 12. 刷新瓶子函数
// 重新生成并显示新的漂流瓶
const refreshBottles = () => {
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

  // 先移除所有瓶子的动画效果
  const bottleElements = document.querySelectorAll('.bottle-item')
  bottleElements.forEach(bottle => {
    bottle.style.animation = 'none' // 清除CSS动画
    bottle.style.transform = 'scale(0)' // 缩小到0（消失效果）
    bottle.style.opacity = '0' // 完全透明
  })

  // 300毫秒后（等待消失动画完成）重新生成瓶子
  setTimeout(() => {
    generateRandomBottles() // 生成新的随机瓶子数据

    // 50毫秒后（等待DOM更新）添加出现动画
    setTimeout(() => {
      const newBottleElements = document.querySelectorAll('.bottle-item')
      newBottleElements.forEach(bottle => {
        // 添加过渡效果
        bottle.style.transition = 'transform 0.5s ease, opacity 0.5s ease'
        bottle.style.transform = 'scale(1)' // 放大到正常尺寸
        bottle.style.opacity = '1' // 完全不透明
      })

      // 500毫秒后（等待出现动画完成）清除过渡效果
      setTimeout(() => {
        newBottleElements.forEach(bottle => {
          bottle.style.transition = '' // 恢复默认过渡效果
        })
      }, 500)
    }, 50)
  }, 300)
}

// 13. 捞瓶子功能主函数(ok)
// 处理用户捞瓶子的操作
const fishBottle = () => {
  showFishModal.value = true // 显示捞瓶子模态框
  isFishing.value = true // 设置为捞取中状态
  caughtBottle.value = null // 清空之前捞到的瓶子

  // 设置随机捞取时间（2-4秒），模拟网络请求延迟
  const fishingTime = Math.random() * 2000 + 2000

  // 设置定时器模拟捞取过程
  setTimeout(() => {
    // 生成捞瓶子数据池
    const fishableBottles = bottles.value

    // 随机选择一个瓶子
    const randomIndex = Math.floor(Math.random() * fishableBottles.length)
    caughtBottle.value = fishableBottles[randomIndex]

    //存储捞瓶子的数据
    bottlelist.bid=caughtBottle.value.bid
    bottlelist.sid=data.user.id

    request.post("bottle/insertbottleList",bottlelist);
    isFishing.value = false // 捞取完成
  }, fishingTime)

}

// 14. 关闭捞瓶子模态框函数
const closeFishModal = () => {
  showFishModal.value = false // 隐藏模态框
  isFishing.value = false // 重置捞取状态
  caughtBottle.value = null // 清空捞到的瓶子数据
  window.location="/driftBottleMain"
}

// 15. 回复捞到的瓶子函数
const replyToBottle = (bottle) => {
  //封装关注列表
  data.AttentionList.sid=data.user.id;
  data.AttentionList.bsid=bottle.sid;
  const isok=ref(1)
  attentionlist.value.forEach((item)=>{
    if(item.sid === bottle.sid){
      isok.value=1
    }
  })
  bottle.replies+=1;
  request.put("bottle/updateBottle",bottle)

  if(isok) {
    //记录关注列表
    request.post("user/insertAttention", data.AttentionList).then((res) => {
      if (res.code === '200') {
        ElMessage.success("关注成功")
        //重新获取用户的信息
        request.get(`user/selectById/${data.user.id}`).then((utf) => {
          data.user = utf.data;
          //保存好新的帖子列表
          data.user.attention += 1;//用户的关注量加1
          bottle.fans += 1;//用户粉丝量加1
          request.put("user/update", data.user)//更新用户本身的信息
          request.put("user/update", bottle)//更新发布帖子的作者信息
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('post', JSON.stringify(bottle))
        })
      } else {
        ElMessage.error(res.msg)
      }
    })
    //创建一个新的聊天室
    const newContact = ref({
      idOne: data.user.id,
      idTwo: bottle.sid,
      lastMessage: null,
      pinned1: 0,
      pinned2: 0,
      notlike1: 0,
      notlike2: 0,
      lasttime: '2025-11-20 04:02:51',
      isfriend: 0
    })
    //保存消息到后台
    request.post("chatroom/insertChatRoom", newContact.value).then((res) => {
      if (res.data === null) {
        //说明聊天室存在
        //将聊天室的notlike的值设置为0
        request.get("chatroom/selectBytwoId", {params: {idOne: data.user.id, idTwo: bottle.sid}}).then((aqs) => {
          if (aqs.data.idOne === data.user.id) {
            aqs.data.notlike1 = 0;
          } else {
            aqs.data.notlike2 = 0;
          }
          request.put("chatroom/updateBytwoId", aqs.data, {
            params: {
              idOne: aqs.data.idOne,
              idTwo: aqs.data.idTwo
            }
          }).then((res) => {
            if (res.code === "200") {
              setTimeout(() => {
                window.location.reload()
              }, 500)
            } else {
              setTimeout(() => {
                window.location.reload()
              }, 500)
            }
          })
        })
      }
      //判断二人是否成为了好友
      request.get(`user/selectAttentionById/${bottle.sid}`).then((aqs) => {
        if (aqs.code === "200") {
          data.AttentionLists = aqs.data
          data.AttentionLists.forEach((item) => {
            if (item.bsid === data.user.id) {
              //对面关注了我，则修改聊天室词缀isfriend为1
              request.get("chatroom/selectBytwoId", {params: {idOne: data.user.id, idTwo: bottle.sid}}).then((cas) => {
                if (cas.code === "200") {
                  cas.data.isfriend = 1;
                  request.put("chatroom/updateBytwoId", cas.data, {
                    params: {
                      idOne: cas.data.idOne,
                      idTwo: cas.data.idTwo
                    }
                  }).then((juc) => {
                    if (juc.code === "200") {
                      setTimeout(() => {
                        window.location.reload();
                      }, 500)
                    }
                  })
                }
              })
            }
          })
        }
      })
      setTimeout(() => {
        window.location = '/chat';
      }, 500)
    })
  }

  setTimeout(()=>{
    window.location = '/chat';
  },500)
}

//数据刷新
const refreshDate=()=>{
  //查找所有的瓶子信息
  request.get(`bottle/selectAllnuid/${data.user.id}`).then((res)=>{
    if (res.code === '200'){
      bottless.value=res.data
      //查找所有瓶子所对应的扔瓶人的信息
      bottless.value.forEach((item) => {
        request.get(`user/selectById/${item.sid}`).then((res) => {
          if (res.code === '200') {
            dateUser.value.push(res.data);
          } else {
            ElMessage.error(res.msg)
          }
        })
      })
    }else{
      ElMessage.error(res.msg)
    }
  })
}


// 17. 组件挂载生命周期钩子
// 当组件被挂载到DOM后执行
onMounted(() => {
  window.scrollTo(0,0)
  refreshDate()
  setTimeout(() => {
    generateRandomBottles() // 延迟1秒后执行
  }, 400)
})

</script>
<style scoped>
.drift-bottle-main {
  min-height: 100vh;
  background: linear-gradient(135deg, #2ECC71 0%, #27AE60 25%, #16A085 50%, #1ABC9C 75%, #2ECC71 100%);
  position: relative;
  overflow: hidden;
}

/* 头部样式 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fish-btn {
  background: rgba(52, 152, 219, 0.9);
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.fish-btn:hover {
  background: rgba(41, 128, 185, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.throw-btn {
  background: rgba(46, 204, 113, 0.9);
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.throw-btn:hover {
  background: rgba(39, 174, 96, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

/* 主内容区域 */
.main-content {
  position: relative;
  min-height: calc(100vh - 80px);
  padding: 20px;
}

.wave {
  position: absolute;
  width: 200%;
  height: 200px;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 50%;
  animation: wave 25s infinite linear;
  box-shadow: 0 0 50px rgba(255, 255, 255, 0.1);
}
@keyframes wave {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 瓶子容器 */
.bottles-container {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 600px;
}

.bottle-item {
  animation: float 6s ease-in-out infinite;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.bottle-item:hover {
  transform: scale(0.7);
}

.bottle-item.expanded {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  z-index: 1000;
}


/* 头像容器 */
.avatar-container {
  position: relative;
  width: 60px;
  height: 60px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-glow {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: all 0.4s ease;
  z-index: -1;
  filter: blur(2px);
}

.bottle-item:hover .avatar-glow {
  opacity: 1;
  animation: pulse 2s infinite;
}

.bottle-item:hover .user-avatar {
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 1);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 详细信息 */
.bottle-details {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  max-width: 400px;
  animation: expandIn 0.3s ease-out;
  position: relative;
  margin: 20px;
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.bottle-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.detail-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}


.close-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border: none;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  transition: all 0.2s ease;
  z-index: 10;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
}

.close-btn:hover {
  background: #ff5252;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.bottle-content .message {
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag {
  background: #E8F5E8;
  color: #2ECC71;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #D4F1D4;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 16px;
}

.bottle-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #f8f9fa;
}


/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.bottom-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.95);
}

.btn-icon {
  font-size: 18px;
}

/* 模态框 */
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

.throw-modal {
  background: white;
  border-radius: 20px;
  padding: 0;
  min-width: 500px;
  max-width: 600px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%);
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(46, 204, 113, 0.2);
}

.modal-header h3 {
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-content {
  padding: 30px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.required {
  color: #ff6b6b;
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

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.05);
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #dee2e6;
}

.cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border-color: #dee2e6;
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


/* 捞瓶子模态框样式 */
.fish-modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  min-width: 400px;
  max-width: 500px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* 捞瓶子动画 */
.fish-animation {
  padding: 40px 20px;
}

.fishing-rod {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.rod-line {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 2px;
  height: 60px;
  background: #8B4513;
  transform: translateX(-50%);
  animation: fishingLine 2s ease-in-out infinite;
}

.hook {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  animation: fishingHook 2s ease-in-out infinite;
}

@keyframes fishingLine {
  0%, 100% { height: 60px; }
  50% { height: 80px; }
}

@keyframes fishingHook {
  0%, 100% { transform: translateX(-50%) translateY(0px); }
  50% { transform: translateX(-50%) translateY(20px); }
}

.water-waves {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.water-waves .wave {
  width: 20px;
  height: 20px;
  background: #3498DB;
  border-radius: 50%;
  animation: wave 1.5s ease-in-out infinite;
}

.water-waves .wave:nth-child(1) { animation-delay: 0s; }
.water-waves .wave:nth-child(2) { animation-delay: 0.3s; }
.water-waves .wave:nth-child(3) { animation-delay: 0.6s; }

@keyframes wave {
  0%, 100% { transform: scale(1) translateY(0); opacity: 0.7; }
  50% { transform: scale(1.2) translateY(-10px); opacity: 1; }
}

.fishing-text {
  font-size: 18px;
  color: #2c3e50;
  margin: 20px 0;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 捞到瓶子的样式 */
.caught-bottle {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bottle-animation {
  position: relative;
  margin: 20px 0;
}

.bottle-icon {
  font-size: 60px;
  animation: bounce 0.8s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

.sparkles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 20px;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle:nth-child(1) {
  top: -40px;
  left: -30px;
  animation-delay: 0s;
}

.sparkle:nth-child(2) {
  top: -30px;
  right: -30px;
  animation-delay: 0.5s;
}

.sparkle:nth-child(3) {
  bottom: -40px;
  left: -20px;
  animation-delay: 1s;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1); }
}

.bottle-content-card {
  background: linear-gradient(135deg, #f0f9f4 0%, #e8f5e8 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
}

.bottle-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.caught-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.caught-info h4 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.caught-message {
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
  margin: 12px 0;
}

.caught-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 12px 0;
}

.caught-tag {
  background: #E8F5E8;
  color: #2ECC71;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #D4F1D4;
}

.caught-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c757d;
}

.fish-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.fish-modal-actions button {
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.reply-btn {
  background: #3498DB;
  color: white;
}

.reply-btn:hover {
  background: #2980B9;
}
.close-btn {
  background: #95A5A6;
  color: white;
}

.close-btn:hover {
  background: #7F8C8D;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
  
  .bottle-details {
    min-width: 280px;
    max-width: 90vw;
  }
  
  .throw-modal {
    min-width: 300px;
    max-width: 90vw;
    margin: 20px;
  }
  
  .bottles-container {
    min-height: 400px;
  }
}
</style>
