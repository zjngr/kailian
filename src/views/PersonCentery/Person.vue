<template>
  <section class="user-profile-container">

    <!-- 用户卡片 - 保持原有背景不变 -->
    <section class="user-card">
      <div class="card-header">
        <div class="user-bg-image">
          <img :src="data.user.backgroundImage || bgImageUrl" alt="背景图片" class="user-img" />
        </div>
        <div class="header-left">
          <div class="avatar-container">
            <img :src="data.user.avatar || userAvatar" alt="用户头像" class="avatar-img" />
          </div>
          <div class="user-info">
            <h2>{{ data.user.username }}</h2>

            <!-- 新增用户属性 -->
            <div class="user-attributes">
              <span class="attribute-item" v-if="data.user.userwork">{{ data.user.userwork }}</span>
              <span class="attribute-item" v-else> 未设置职业 </span>
              <span class="attribute-item" v-if="data.user.address">{{ data.user.address }}</span>
              <span class="attribute-item" v-else> 未设置地域</span>
              <span class="attribute-item" v-if="data.user.sex">{{ data.user.sex }}</span>
              <span class="attribute-item" v-else> 未设置性别 </span>
              <span class="attribute-item" v-if="data.user.age">{{ data.user.age }}岁</span>
              <span class="attribute-item" v-else> 未设置年龄 </span>
            </div>
            <p class="user-signature">{{ data.user.description }}</p>
          </div>
        </div>
        <!-- 参观用户自己的个人中心时才展示，别人的个人中心不展示       -->
        <div class="header-right" v-if="!data.isVisitAnotherUser">
          <button
              class="sign-btn"
              :class="{ signed: isDailySignIn }"
              @click="handleSignIn"
              :disabled="isDailySignIn"
          >
            {{ isDailySignIn ? '已签到' : '签到' }}
          </button>
          <p  class="sign-days-text">已累计签到 {{ data.user.totalSignInTime || 0}} 天</p>
        </div>

        <!-- 参观他人页面时显示关注和私信按钮 -->
        <div class="header-right" v-else>
          <!--  关注 ，私信 ，返回 按钮的父盒子        -->
          <div class="visit-user-actions">
            <button class="follow-btn" :class="{ followed: isFollowing }" @click="handleFollow">{{ isFollowing ? '已关注' : '关注' }}
            </button>
            <button class="message-btn" @click="handleMessage">
              <el-icon><ChatDotRound /></el-icon>私信
            </button>
            <button class="back-btn" @click="junpMePage">
              <el-icon><ArrowLeft /></el-icon>返回我的页面
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 其余代码保持不变 -->
    <!-- 主要内容区域 - 添加淡绿色背景 -->
    <section class="content-background">
      <!-- 六个数据项单独卡片 -->
      <section class="stats-card">
        <div class="sports-stats">
          <div class="stat-item">
            <span class="stat-value">{{ data.thisWeekExerciseTime || 0 }} min</span>
            <span class="stat-label">本周运动时长</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ data.user.totalSignInTime || 0 }} </span>
            <span class="stat-label">锻炼天数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">#{{ data.ranking }}</span>
            <span class="stat-label">积分排名</span>
          </div>
          <div class="stat-item" @click="currentView='posts'">
            <span class="stat-value">{{ data.user.posts || 0}} </span>
            <span class="stat-label">帖子数量</span>
          </div>
          <div class="stat-item" @click="junpFollowing()">
            <span class="stat-value">{{ attentionList.length || 0 }} </span>
            <span class="stat-label">关注列表</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ data.user.likes || 0 }}</span>
            <span class="stat-label">作品收获点赞</span>
          </div>
        </div>
      </section>

      <!-- 数据概览视图 -->
      <section v-if="currentView === 'summary'" class="content-layout">
        <!-- 左边区域 - 占据三分之二 -->
        <div class="left-column">
          <!-- 运动总结卡片 -->
          <div class="chart-card calories-chart">
            <div class="chart-header">
              <h3>运动总结</h3>
            </div>
            <div class="chart-content">
              <div class="chart-summary-container">
                <!-- 今日运动总结 -->
                <div class="today-summary">
                  <h4 class="summary-title">今日</h4>
                  <ul class="summary-list">
                    <li>
                      <span class="summary-label">目标运动时长</span>
                      <span class="summary-value">{{ data.exerciseData.todayAimExerciseTime }} 分钟</span>
                    </li>
                    <li>
                      <span class="summary-label">累计运动时长</span>
                      <span class="summary-value">{{ data.exerciseData.toadyExerciseTime }} 分钟</span>
                    </li>
                    <li>
                      <span class="summary-label">运动完成率</span>
                      <span class="summary-value">{{ data.exerciseData.completionRate }}  %</span>
                    </li>
                  </ul>
                </div>

                <!-- 本周运动总结 -->
                <div class="chart-summary">
                  <h4 class="summary-title">本周</h4>
                  <ul class="summary-list">
                    <li v-for="(item, index) in summaryData" :key="index">
                      <span class="summary-label">{{ item.label }}</span>
                      <span class="summary-value">{{ item.value }} 千卡</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 目标完成情况卡片 -->
          <div class="chart-card goal-chart">
            <div class="chart-header">
              <h3>本周目标完成情况</h3>
            </div>
            <div class="chart-content">
              <div class="goal-chart-container">
                <!-- 环形图区域 -->
                <div class="goal-chart-wrapper-container">
                  <div ref="goalChart" class="goal-chart-wrapper"></div>
                  <div class="goal-completion-text">已完成 {{ completedDays }}/{{ totalDays }}天</div>
                </div>
                <!-- 健康标语区域 -->
                <div class="health-slogan">
                  <p class="slogan-text">{{data.user.healthSlogan!=null?data.user.healthSlogan:healthSlogans[0]}}</p>
                  <button class="change-slogan-btn" @click="changeSlogan">换一条</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右边区域 - 占据三分之一 -->
        <div class="right-column">
          <!-- 设置卡片 -->
          <section class="settings-card">
            <div class="settings-header">
              <h3>设置中心</h3>
            </div>
            <div class="settings-content">
              <div
                  class="setting-item"
                  v-for="item in settings"
                  :key="item.id"
                  @click="navigateTo(item.path)"
              >
                <el-icon class="setting-icon"><component :is="item.icon" /></el-icon>
                <span class="setting-text">{{ item.text }}</span>

                <!-- 新公告数字提示 -->
                <div v-if="item.path === '/announcement' && unreadCount > 0" style="position: relative;margin-right: 8px;">
                  <span class="badge-number">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
                </div>

                <el-icon class="arrow-icon"><ArrowRight /></el-icon>
              </div>
            </div>
          </section>
          <!-- 训练计划卡片 -->
          <div class="today-plan-details" >
            <div class="plan-header">
              <h3>今日训练</h3>
            </div>
            <!-- 添加固定高度的容器 -->
            <div class="exercise-list-container">
              <ul class="exercise-list" style="cursor: pointer;">
                <li class="exercise-item"
                    v-for="(item, index) in filteredExercises || []"
                    :key="index" @click="router.push('/exercisePlan');">
                  <span class="exercise-name">{{ item.actionname }}</span>
                  <span v-if="item.isok===1" class="exercise-status in-progress">已完成</span>
                  <span v-else class="exercise-status pending">待完成</span>
                </li>
                <!-- 优化后的无训练计划状态 -->
                <li class=" no-exercises" v-if="(filteredExercises || []).length === 0">
                  <div class="no-exercises-content">
                    <el-icon class="no-exercises-icon"><Document /></el-icon>
                    <span class="no-exercises-text">暂无训练计划</span>
                    <button class="add-exercise-btn" @click="addExcercisePlan()">去添加</button>
                  </div>
                </li>
              </ul>
            </div>
            <div class="view-today-plan" @click="router.push('/exercisePlan');" style="cursor: pointer;">
              查看今日全部训练计划
            </div>
          </div>
        </div>
      </section>

      <!-- 全部帖子视图 -->
      <section v-if="currentView === 'posts'" class="all-posts-view">
        <div style="width: 1700px;">
          <div class="posts-scroll-box">
            <div class="posts-header">
              <h3 style="display: flex;flex-direction: row;margin-right: 0">全部帖子(共 {{ filteredPosts.length }} 篇)</h3>
              <el-button v-if="!data.isVisitAnotherUser" type="success" plain @click="currentView='summary'">切换数据概览面板</el-button>
            </div>
            <div class="posts-list" style=" max-height: 600px;">
              <div
                  class="post-item"
                  v-for="(post, index) in filteredPosts"
                  :key="index"
                  @click="navigateToPost(post)"
              >
                <div class="post-main">
                  <div class="post-header">
                    <h4 class="post-title">{{ post.title }}</h4>
                    <div class="post-meta">
                      <span class="post-date">{{ post.time }}</span>
                    </div>
                  </div>
                  <p class="post-content">{{ post.content || post.contents }}</p>
                  <div class="post-footer">
                    <div class="post-tags">
                      <span class="post-tag" v-if="post.sportType">
                        <el-icon><Collection /></el-icon>
                        {{ post.sportType }}
                      </span>
                      <span class="post-tag" v-if="post.sporttime">
                        <el-icon><Clock /></el-icon>
                        {{ post.sporttime }}
                      </span>
                      <span class="post-tag" v-if="post.calorie">
                        <el-icon><Document /></el-icon>
                        {{ post.calorie || 0 }}千卡
                      </span>
                    </div>
                    <div class="post-stats">
                      <span class="post-stat">
                         <svg  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
                         <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                         </svg>
                        {{ post.likes || 0 }}
                      </span>
                      <span class="post-stat">
                        <el-icon class="stat-icon"><ChatDotRound /></el-icon>
                        {{ post.comments || 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 我的帖子模块（仅在数据概览视图下显示） -->
      <section v-if="currentView === 'summary'" class="full-width-posts-container">
        <div class="chart-card posts-card">
          <div class="chart-header">
            <h3>我的帖子</h3>
            <button class="view-all-btn" @click="currentView = 'posts'">查看全部</button>
          </div>
          <div class="posts-list">
            <div class="posts-grid">
              <div class="post-item"
                   style="min-width: 308px"
                   v-for="(post, index) in filteredPosts.slice(0,3) || []"
                   :key="index"
                   @click="navigateToPost(post)">
                <div class="post-content">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <p class="post-excerpt">{{ post.contents }}</p>
                </div>
                <div class="post-meta">
                  <span class="post-date">{{ post.time }}</span>
                  <div class="post-stats">
                    <span class="post-stat"><el-icon class="stat-icon"><Message /></el-icon> {{ post.comments || 0 }}</span>

                    <span class="post-stat">
                     <svg   width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
                         <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                         </svg>
                         {{ post.likes || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="no-posts" v-if="(filteredPosts || []).length === 0">
              <el-icon class="no-posts-icon"><Document /></el-icon>
              <p>您还未发布帖子</p>
              <button class="create-post-btn" @click="navigateTo('/addCommunity')">发布第一条帖子</button>
            </div>
          </div>
        </div>
      </section>
    </section>

    <div  style=" height: 22px;"></div>
  </section>
</template>

<script setup>
import {ref, onMounted, computed, reactive,onUpdated,watch,nextTick } from 'vue';
import bgImage from '@/assets/bj.jpg'
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import request from '@/utils/request.js'
// 用户头像
import txImage from '@/assets/tx.jpg';
import {ElMessage} from "element-plus";

// 路由基础数据
const router = useRouter();
//合并数组用，当前登录用户的数据
const dateUser=ref(JSON.parse(localStorage.getItem("user")));
// 展示用户的id,用于判断当前个人中心页面展示谁的
const userId=ref(localStorage.getItem("userId"))
// 用户数据
const data = reactive({
  //用户信息（动态变量,展示用的数据，userId为空或者等于自己的用户id就展示自己的页面，否则展示别人的）
  //user:JSON.parse(localStorage.getItem("user")),
  user:((userId.value===null ||parseInt(userId.value)===parseInt(dateUser.value.id))?
      JSON.parse(localStorage.getItem("user")) : JSON.parse(localStorage.getItem("visitedUser"))),
  //现在是否在参观别的用户
  isVisitAnotherUser:!(userId.value===null ||parseInt(userId.value)===parseInt(dateUser.value.id)),
  //用户积分排第几名
  ranking:null,
  //训练项目的三个总结数据(目标运动时长,累计运动时长,运动完成率)
  exerciseData:{todayAimExerciseTime:0,toadyExerciseTime:0,completionRate:0},
  //用户本周运动时长
  thisWeekExerciseTime:0,
  //公告列表
  announcements:[]
});

//根据最后一次签到时间判断是否已签到
const isDailySignIn=computed(()=>{
  if (data.user.lastSignInTime === getLocalDate()){
    return true;
  }else return false;
})

// 各种属性
const userAvatar = ref(txImage);
const bgImageUrl = ref(bgImage)
// 添加关注状态
const isFollowing = ref(false);
// 健康标语数据集合
const healthSlogans = ref([
  "运动是健康的源泉，也是长寿的秘诀", "生命在于运动，健康在于锻炼", "每天锻炼一小时，健康生活一辈子", "运动让生活更美好，健康让人生更精彩",
  "迈开脚步，拥抱活力；挥洒汗水，收获健康","运动为生命注入能量，坚持让健康永驻身旁"
]);
//健康标语数组的索引
const currentSloganIndex = ref(0);
//用户所创建的全部帖子
const myPosts = ref([]);
// 图表相关
const goalChart = ref(null);
let goalChartInstance = null;
// 用户所关注的人列表(存储当前正在浏览的个人中心的用户的关注列表，自己的个人中心就存储自己的关注列表，参观别人的就展示别人的关注列表)
const attentionList=ref([])
//当参观别人的个人中心才使用，用于存储的自己的关注列表，判断是否已关注这个人
const attentionList2=ref([])

// 训练项目数据 - 初始为空
const exercises = reactive({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: []
})

// 饮食计划数据 - 按天存储
const dietPlans = reactive({
  monday: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  tuesday: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  wednesday: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  thursday: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  friday: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  saturday: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  sunday: {
    breakfast: [],
    lunch: [],
    dinner: []
  }
})
//用于接收七天里面的三餐数据
const sid=ref(1);
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const fast = ['breakfast', 'lunch', 'dinner']

// 本周目标数据
const totalDays = 7;
const completedDays = ref(1);  //星期一到今天（比如星期5）有几天是做完全部训练项目了
//const goalCompletionRate = Math.round((completedDays.value / totalDays) * 100);
const goalCompletionRate = computed(() => {
  return Math.round((completedDays.value / totalDays) * 100);
});

// 当前视图模式：自己的个人中心：summary(数据概览) 或 posts(全部帖子)； 访问别人：posts(全部帖子)
const currentView = ref(data.isVisitAnotherUser?'posts':'summary');

// 点赞列表
const LikesList = ref([
])


// 固定设置选项
const settings = ref([
  { id: 1, text: '密码设置', icon: 'Lock', path: '/privacy' },
  { id: 2, text: '公告消息', icon: 'Message', path: '/announcement' },
  { id: 3, text: '个人资料', icon: 'Avatar', path: '/profile' }
]);
//从本地获取当前用户对公告的阅读情况，以announcementReadStatus+userId为key
const userReadStatus = ref(JSON.parse(localStorage.getItem(`announcementReadStatus${dateUser.value.id}`)) || {})

// 计算未读公告数量
const unreadCount = computed(() => {
  return data.announcements.filter(announcement => !isAnnouncementRead(announcement.aid)).length
})

//关于摄入量的三个总结数据名+对应展示的值
const summaryData = ref([{ label: '总摄入量', value: 0}, { label: '日均摄入量',value: 0}, { label: '今日摄入量',value: 0}]);

//本地时间，例子2025-11-16
const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

//签到逻辑
const handleSignIn = () => {
  data.user.lastSignInTime=getLocalDate()  // 更新最后一次签到时间
  data.user.totalSignInTime += 1;  //签到次数加1
  data.user.points+=100;  //每天签到一次加100积分
  localStorage.setItem("user", JSON.stringify(data.user));
  request.put("user/update",data.user).then((res)=>{
    if(res.code === "200"){
      ElMessage.success("签到成功")
    }else{
      ElMessage.error(res.msg || "签到失败")
    }
  })
};

//处理关于摄入量的三个总结数据
const handleIntakeSummary = () => {
  let index=(new Date().getDay() + 6) % 7;  //获取当前星期几，索引值0-6分别对应周一到周日
  let totalIntake=0;  //总摄入量
  let todayIntake=0;  //今日摄入量

  // 遍历一周的数据计算总摄入量和天数
  for(let i=0;i<=index;i++){
    fast.forEach(meal => {
      let day = days[i];
      const mealData = dietPlans[day][meal];  //某一餐的食物列表
      if (mealData && mealData.length > 0) {
        mealData.forEach(item => {
          if (item.calorie) {
            totalIntake += parseInt(item.calorie) || 0;  //计算总摄入量
            if(day===days[index]) todayIntake+=parseInt(item.calorie) || 0;  //计算今日摄入量
          }
        });
      }
    });
  }
  summaryData.value[0].value=totalIntake;  //把结果值赋值给展示用的总摄入量
  summaryData.value[1].value=(totalIntake/(index+1)).toFixed(1);  //日均摄入量
  summaryData.value[2].value=todayIntake;
}

//处理五个训练项目的总结数据（目标运动时长,累计运动时长,运动完成率,本周有多少天全部训练做完了，本周运动时长）
const handleTrainingSummary = () => {
  let index=(new Date().getDay() + 6) % 7;  //获取当前星期几，索引值0-6分别对应周一到周日
  let todayCompletedExerciseCnt=0;  //一周内当天全部训练都完成了的天数,今日完成的训练项目数
  let toadyExerciseTime=0,todayAimExerciseTime=0; //今日运动时长,今日目标运动时长

  //处理前三个数据
  const todayExercises = exercises[days[index]];  // 获取今天的训练项目
  if (todayExercises && todayExercises.length > 0) {
    for(let i=0;i<todayExercises.length;i++){  //遍历每个训练项目
      let item = todayExercises[i];  //一个训练项目
      //判断是否设置了目标运动时长
      if(item.actiontimes!==null) todayAimExerciseTime += parseInt(item.actiontimes);  //今日目标运动时长
      if (item.isok === 1) {  //判断是否完成
        todayCompletedExerciseCnt++;  //今日完成的训练项目数
        //判断是否设置了目标运动时长
        if(item.actiontimes!==null) toadyExerciseTime +=parseInt(item.actiontimes);  //今日运动时长
      }
    }
  }

  //给展示变量赋值
  data.exerciseData.todayAimExerciseTime=todayAimExerciseTime;
  data.exerciseData.toadyExerciseTime=toadyExerciseTime;
  //被除数不为0，则计算完成率
  if(exercises[days[index]].length!==0) data.exerciseData.completionRate=((todayCompletedExerciseCnt*100)/exercises[days[index]].length);


  let completedDayCnt=0;  //临时变量，星期一到今天（比如星期5）有几天是做完全部训练项目了
  let thisWeekExerciseTime=0;  //临时变量,本周运动时长

  //计算两个数据（本周有多少天全部训练做完了+本周运动时长）
  for(let i=0;i<=index;i++){
    let dayExercises = exercises[days[i]];  //这一天的训练项目
    if (dayExercises && dayExercises.length > 0) {  //当天有训练数据且全部完成才算
      let flag=true;  //标志变量，判断当天的训练项目是否全部完成
      for(let j=0;j<dayExercises.length;j++){
        let item=dayExercises[j]
        if (item.isok !== 1) {
          flag=false;
        }else{
          //当前训练项目有运动时长，才加上
          if(item.actiontimes!==null) thisWeekExerciseTime+=parseInt(item.actiontimes);
        }
      }
      if(flag) completedDayCnt++;
    }
  }
  completedDays.value=completedDayCnt;  //赋值给对应的全局变量
  data.thisWeekExerciseTime=thisWeekExerciseTime;  //赋值给本周运动时长对应得展示变量
};
// 路由跳转
const navigateTo = (path) => {
  router.push(path);
};

// 检查公告是否已读
const isAnnouncementRead = (announcementId) => {
  return userReadStatus.value[announcementId] === true
}

//跳转到帖子详情页面
const navigateToPost = (post) => {
  localStorage.setItem("post",JSON.stringify(post));
  setTimeout(()=>{
    router.push('/showCommunity');
  },200)
};

//跳转到关注列表页面
const junpFollowing = () => {
  localStorage.setItem("theUserOfQueryingFollow",JSON.stringify(data.user))  //要查询关注列表的用户信息
  localStorage.setItem("attentionList",JSON.stringify(attentionList.value));  //关注列表
  setTimeout(()=>{
    router.push(`/following/${data.user.id}`);
  },200)
};

//切换健康标语
const changeSlogan = () => {
  currentSloganIndex.value = (currentSloganIndex.value + 1) % healthSlogans.value.length;
  data.user.healthSlogan = healthSlogans.value[currentSloganIndex.value];  //更新用户数据
};

// 初始化目标完成环形图
const initGoalChart = () => {
  if (!goalChart.value) return;
  if (goalChartInstance) goalChartInstance.dispose();

  goalChartInstance = echarts.init(goalChart.value);
  goalChartInstance.setOption({
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#4CAF50' },
            { offset: 1, color: '#81C784' }
          ])
        }
      },
      axisLine: {
        lineStyle: {
          width: 18,
          color: [[1, '#f0f5f0']]
        }
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      detail: {
        show: false,
        valueAnimation: true,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        formatter: `已完成 ${completedDays.value}/${totalDays}天`
      },
      data: [{ value: goalCompletionRate.value }]
    }]
  });
  window.addEventListener('resize', () => goalChartInstance?.resize());
};

//合并数组,并设置最多显示3个帖子
const filteredPosts = computed(() => {
  return  myPosts.value.map((post) => {
    const isLiked=ref(0);
    LikesList.value.forEach((item)=>{
      if (item.pid === post.pid){
        isLiked.value=1
      }
    })

    return {
      ...post,
      isLiked:isLiked.value,
      dateUser: dateUser.value
    }
  })
});

//返回今天星期几的英文名
const getCurrentDay = () => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days[(new Date().getDay() + 6) % 7];
};

// 训练计划数据
const todayExercises = ref([]);

// 过滤出最多3个训练项目
const filteredExercises = computed(() => {
  return todayExercises.value.slice(0, 3);
});

// 添加训练项目
const addExcercisePlan = ()=>{
  window.location.href='/exercisePlan';
}

// 处理关注/取消关注
const handleFollow = async () => {
  if(isFollowing.value){   //关注，则变为没关注
    request.delete('/user/deleteAttention',{params:{sid:dateUser.value.id,bsid:data.user.id}}).then(res=>{
      if(res.code==="200"){
        isFollowing.value=false  //更新关注状态
        ElMessage.success("取消关注"+data.user.username+"成功")
      }else ElMessage.success(res.msg || "取消关注失败")
    })
  }else{  //原本没关注，则变为关注
    let attention=reactive({sid:dateUser.value.id,bsid:data.user.id})
    request.post('/user/insertAttention',attention).then(res=>{
      if(res.code==="200"){
        isFollowing.value=true  //更新关注状态
        ElMessage.success("关注"+data.user.username+"成功")
      }else ElMessage.success(res.msg || "关注失败")
    })
  }
};

// 处理私信
const handleMessage = () => {
  // 跳转到私信页面或打开私信对话框
  router.push(`/chat?userId=${data.user.id}`);
};

//返回我的个人页面
const junpMePage=  async ()=>{
  localStorage.setItem("userId",JSON.stringify(dateUser.value.id));
  localStorage.removeItem("visitedUser")//清空访问的其它用户信息的缓存
  window.location.href = '/person';

}


// 检查关注状态
const checkFollowStatus = async () => {
  //查看索引
  let index = attentionList2.value.findIndex(item => parseInt(item.sid) === parseInt(dateUser.value.id) && parseInt(item.bsid) === parseInt(data.user.id));
  //根据是否在关注列表中确认关注状态
  if(index<0||index>=attentionList2.value.length) isFollowing.value=false;
  else isFollowing.value=true
};

//初始化数据
const initData=async ()=>{
  sid.value = parseInt(data.user.id);  //用户id

  try {
    //获取用户一周七天里面的三餐数据
    // 双重循环遍历所有日期和餐食类型
    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < fast.length; j++) {
        const wid = days[i];
        const did = fast[j];
        await request.get("fastplanlist/selectfastplan", {
          params: {sid: sid.value, wid: wid, did: did}
        }).then((res) => {
          if (res.code === '200') {
            // 将返回的数据赋值到对应的饮食计划中
            dietPlans[wid][did] = res.data;
          } else {
            ElMessage.error(res.msg);
          }
        });
      }
    }
    handleIntakeSummary();
  }catch (e) {
    ElMessage.error("初始化一周三餐的数据失败")
  }

  try{
    //获取训练计划的数据
    for (let i = 0; i < days.length; i++) {
      const wid = days[i];
      await request.get("Excerciseplanlist/selectExcerciseplanlist",{params:{sid:sid.value,wid:wid }
      }).then((res)=>{
        if (res.code === '200') {
          // 将返回的数据赋值到对应的饮食计划中
          exercises[wid] = res.data;
        } else {
          ElMessage.error(res.msg);
        }
      })
    }
    handleTrainingSummary();
  }catch (e){
    ElMessage.error("获取训练计划的数据失败")
  }

  //获取用户的排名信息
  request.get(`/user/queryUserRankByUserId/${sid.value}`).then((res)=>{
    if(res.code === "200"){
      data.ranking=res.data
    }else{
      ElMessage.error(res.msg || "获取用户的排名信息失败")
    }
  })

  //获取用户所关注的用户列表(查询对应用户的关注列表。特别注意：当参观别人的个人中心页面时这是被参观人的关系列表，不是自己的)
  request.get(`/user/selectAttentionById/${sid.value}`).then((res)=>{
    if(res.code === '200'){
      attentionList.value=res.data
    }else{
      ElMessage.error(res.msg || "获取用户所关注的用户列表失败")
    }
  })

  //当参观别人的个人中心页面时，需要查询自己的关注列表
  if(data.isVisitAnotherUser){
    request.get(`/user/selectAttentionById/${dateUser.value.id}`).then((res)=>{
      if(res.code === '200'){
        attentionList2.value=res.data
        //在参观别人的个人中心,
        if(data.isVisitAnotherUser) checkFollowStatus();
      }else{
        ElMessage.error(res.msg || "获取用户所关注的用户列表失败")
      }
    })
  }

  //获取今天的训练项目
  request.get("/Excerciseplanlist/selectExcerciseplanlist",
      {params:{sid:sid.value,wid:getCurrentDay()}}).then((res)=>{
    if(res.code === '200'){
      todayExercises.value=res.data
    }else ElMessage.error(res.msg || "获取今天的训练项目成功")

  })

  //获取帖子的数据
  await request.get(`posts/selectAllByUserId/${sid.value}`).then((res) => {
    if (res.code === '200') {
      myPosts.value = res.data
    } else {
      ElMessage.error(res.msg);
    }
  })

  //获取用户点赞列表的信息
  request.get(`user/selectLikesList/${data.user.id}`).then((res) => {
    if (res.code === '200') {
      LikesList.value.push(res.data)
    } else {
      ElMessage.error(res.msg)
    }
  })




  //获得所有的公告数据
  request.get(`/announcement/selectAll`).then((res)=>{
    if(res.code === '200'){
      data.announcements=res.data  //公告数据
    }else{ ElMessage.error(res.msg || "获取所有的公告数据失败")}
  })
}

// 生命周期
onMounted( async () => {
  window.scrollTo(0,0)
  await initData();
  initGoalChart();
});

// 监听completedDays变化,确保图表数据的更新
watch(completedDays, (newValue) => {
  if (goalChartInstance) {
    updateGoalChart();
  }
});

// 更新图表函数
const updateGoalChart = () => {
  if (!goalChartInstance) return;

  goalChartInstance.setOption({
    series: [{
      data: [{ value: goalCompletionRate.value }],
      detail: {
        formatter: `已完成 ${completedDays.value}/${totalDays}天`
      }
    }]
  });
};

// 监听currentView变化,确保图表更新
watch(currentView, (newValue) => {
  if (newValue === 'summary') {
    // 确保DOM已经更新完成
    nextTick(() => {
      initGoalChart();
    });
  }
});

// 清理图表
window.addEventListener('beforeunload', () => {
  goalChartInstance?.dispose();
});


</script>

<style scoped>
/* 新公告数字提示样式 */
.badge-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ff4757, #ff3838);
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  padding: 0 6px;
  animation: badgeBounce 0.6s ease-in-out;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  z-index: 2;
}

/* 数字弹跳动画 */
@keyframes badgeBounce {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 鼠标悬停效果 */
.setting-item:hover .badge-number {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/*添加前*/
/* 参观用户时的操作按钮样式 */
.visit-user-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.follow-btn, .message-btn, .back-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  justify-content: center;
}

.follow-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
}

.follow-btn.followed {
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

.follow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.message-btn {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
}

.message-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.back-btn {
  background: linear-gradient(135deg, #9E9E9E, #757575);
  color: white;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(158, 158, 158, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .visit-user-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .follow-btn, .message-btn, .back-btn {
    min-width: 100px;
    font-size: 12px;
    padding: 8px 16px;
  }
}
/*添加后*/

/* 全部帖子视图样式 */
.all-posts-view {
  width: 100%;
  max-width: 1320px;
  height: 760px;
  margin: 40px 500px 0;
  padding: 0 16.5px;
  box-sizing: border-box;
}

.posts-scroll-box {
  width: 50%;
  height: 730px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.posts-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fff8, #f0f7f0);
  border-bottom: 1px solid #e8f5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.posts-header h3 {
  margin: 0;
  color: #2e7d32;
  font-size: 18px;
  font-weight: 600;
}

.posts-list {
  margin-top: 13.2px;
  max-height: 520px;
  overflow-y: auto;
  padding: 0;
}

/* 自定义滚动条 */
.posts-list::-webkit-scrollbar {
  width: 6px;
}

.posts-list::-webkit-scrollbar-track {
  background: #f1f8e9;
}

.posts-list::-webkit-scrollbar-thumb {
  background: #c8e6c9;
  border-radius: 3px;
}

.posts-list::-webkit-scrollbar-thumb:hover {
  background: #4CAF50;
}

.post-item {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f7f0;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.post-item:hover {
  background: #f8fff8;
  transform: translateX(4px);
  box-shadow: inset 4px 0 0 #4CAF50;
}

.post-item:last-child {
  border-bottom: none;
}

.post-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.post-title {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  flex: 1;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.post-date {
  color: #7f8c8d;
  font-size: 12px;
  white-space: nowrap;
}

.post-content {
  margin: 0;
  color: #5d6d7e;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.post-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
  color: #2e7d32;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.post-stats {
  display: flex;
  gap: 16px;
}

.post-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #7f8c8d;
  font-size: 12px;
}

.stat-icon {
  font-size: 12px;
  color: #4CAF50;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .view-toggle-container {
    position: relative;
    top: 0;
    margin: 20px auto;
    width: 90%;
  }

  .toggle-buttons {
    width: 100%;
  }

  .toggle-btn {
    min-width: auto;
    flex: 1;
    padding: 10px 16px;
  }

  .posts-scroll-box {
    width: 90%;
  }

  .posts-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .post-header {
    flex-direction: column;
    gap: 8px;
  }

  .post-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .post-stats {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .posts-scroll-box {
    width: 95%;
  }

  .post-item {
    padding: 16px 20px;
  }

  .post-tags {
    flex-direction: column;
    align-items: flex-start;
  }
}

.today-plan-details {
  background-color: white;
  border-radius: 8.8px;
  padding: 16.5px;
  box-shadow: 0 4.4px 13.2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  min-height: 231px;
  display: flex;
  flex-direction: column;
}

/* 新增固定高度容器 */
.exercise-list-container {
  flex: 1;
  min-height: 132px;
  margin: 13.2px 0;
  overflow-y: auto;
}

.exercise-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exercise-item {
  display: flex;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px dashed #c8e6c9;
  font-size: 15.4px;
}

.exercise-item:last-child {
  border-bottom: none;
}

.view-today-plan {
  text-align: center;
  margin-top: auto;
  color: #4CAF50;
  cursor: pointer;
  font-size: 14.3px;
  padding: 4.4px 0;
  transition: color 0.2s ease;
  border-top: 1px dashed #c8e6c9;
  padding-top: 11px;
}

/* 全局设置防止横向滚动 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden;
  width: 100%;
  min-height: 100vh;
}

.user-profile-container {
  padding: 0 0 44px 0;
  color: #333;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* 用户卡片样式 - 保持原有背景不变 */
.user-card {
  border-radius: 0;
  padding: 77px 0 27px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
  min-height: 220px;
  position: relative;
}

.user-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 220px;
  overflow: hidden;
  z-index: -1;
}

.user-img {
  width: 100%;
  height: auto;
  object-position: 70% 30%;
  min-height: 100%;
}

/* 主要内容区域  */
.content-background {
  background: linear-gradient(135deg, #f0f7f0 0%, #e8f5e9 50%, #f0f7f0 100%);
  width: 100%;
  padding: 0;
  margin: 0;
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  max-width: 1320px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-start;
  max-width: 66%;
}

.avatar-container {
  margin-right: 22px;
  width: 99px;
  height: 99px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  border: 3.3px solid #4CAF50;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-info {
  flex-grow: 1;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  text-align: left;
}

.user-info h2 {
  margin: 0 0 8.8px 0;
  font-size: 35.2px;
}

/* 新增用户属性样式 */
.user-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 12px 0;
}

.attribute-item {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.attribute-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%);
}

.user-signature {
  margin: 0;
  font-size: 19.8px;
  font-style: italic;
  max-width: 330px;
}

.sign-days-text {
  margin: 8.8px 0 0 0;
  color: #ffffff;
  font-size: 17.6px;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8.8px;
  flex: 1;
  max-width: 27.5%;
  justify-content: center;
}

.sign-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 13.2px 31.9px;
  border-radius: 22px;
  cursor: pointer;
  font-size: 19.8px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2.2px 8.8px rgba(76, 175, 80, 0.3);
  min-width: 132px;
}

.sign-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  transform: translateY(-2.2px);
  box-shadow: 0 4.4px 13.2px rgba(76, 175, 80, 0.4);
}

.sign-btn:disabled {
  background: #81C784;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.stats-card {
  background-color: #ffffff;
  width: 100%;
  padding: 16.5px 0;
  box-shadow: 0 2.2px 8.8px rgba(0, 0, 0, 0.05);
  margin: 0;
}

.sports-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 16.5px;
  overflow-x: hidden;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: auto;
  padding: 13.2px 8.8px;
  position: relative;
  cursor: pointer;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background-color: #e0e0e0;
}

.stat-value {
  font-size: 35.2px;
  font-weight: bold;
  color: #4CAF50;
  margin-top: 4.4px;
  transition: transform 0.3s ease;
}

.stat-item:hover .stat-value {
  transform: translateY(-8.8px) scale(1.1);
}

.stat-label {
  font-size: 14.3px;
  color: #666;
  font-weight: 500;
}

/* 主要内容区域 */
.content-layout {
  display: flex;
  gap: 22px;
  width: 100%;
  max-width: 1320px;
  margin: 22px auto 0;
  box-sizing: border-box;
  padding: 0 16.5px;
}

.left-column {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.chart-card {
  background-color: white;
  border-radius: 8.8px;
  padding: 16.5px;
  box-shadow: 0 4.4px 13.2px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-3.3px);
  box-shadow: 0 6.6px 17.6px rgba(0, 0, 0, 0.15);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16.5px;
  border-bottom: 1px solid #e8f5e9;
  padding-bottom: 11px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 17.6px;
  font-weight: 600;
}

.chart-content {
  width: 100%;
  height: 100%;
}

/* 优化运动总结样式结构 */
.chart-summary-container {
  display: flex;
  gap: 16.5px;
  width: 100%;
  justify-content: space-between;
}

.today-summary, .chart-summary {
  flex: 1;
  background-color: #f8fcf9;
  border-radius: 8.8px;
  padding: 16.5px;
  box-sizing: border-box;
  border: 1px solid #e8f5e9;
  transition: all 0.3s ease;
}

.today-summary:hover, .chart-summary:hover {
  transform: translateY(-2.2px);
  box-shadow: 0 4.4px 8.8px rgba(0, 0, 0, 0.1);
}

.summary-title {
  margin: 0 0 13.2px 0;
  color: #2e7d32;
  font-size: 16.5px;
  font-weight: 600;
  padding-bottom: 8.8px;
  border-bottom: 1px dashed #dcedc8;
}

.summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.summary-list li {
  display: flex;
  justify-content: space-between;
  padding: 8.8px 0;
  border-bottom: 1px dashed #dcedc8;
  font-size: 14.3px;
}

.summary-list li:last-child {
  border-bottom: none;
}

.summary-label {
  color: #666;
}

.summary-value {
  font-weight: 600;
  color: #2e7d32;
}

/* 简化目标完成情况样式结构 */
.goal-chart-container {
  display: flex;
  align-items: center;
  gap: 22px;
  height: 154px;
}

.goal-chart-wrapper-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.goal-chart-wrapper {
  width: 132px;
  height: 132px;
}

.goal-completion-text {
  color: #2e7d32;
  font-size: 15.4px;
  font-weight: bold;
  margin-top: 8.8px;
  text-align: center;
}

.health-slogan {
  flex: 1;
  padding: 13.2px;
  background-color: #f1f8e9;
  border-radius: 8.8px;
  border: 1px solid #dcedc8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
}

.slogan-text {
  margin: 0 0 11px 0;
  color: #2e7d32;
  font-size: 15.4px;
  line-height: 1.5;
  font-style: italic;
}

.change-slogan-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5.5px 11px;
  border-radius: 4.4px;
  cursor: pointer;
  font-size: 13.2px;
  transition: all 0.2s ease;
}

.change-slogan-btn:hover {
  background-color: #388E3C;
}

/* 右边区域样式 */
.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.settings-card {
  background-color: white;
  border-radius: 8.8px;
  padding: 28px;
  box-shadow: 0 4.4px 13.2px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.settings-header {
  margin-bottom: 13.2px;
}

.settings-header h3 {
  margin: 0;
  color: #333;
  font-size: 17.6px;
  font-weight: 600;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 13.2px;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 11px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #e6f0e6;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  transform: translateX(5.5px);
}

.setting-icon {
  font-size: 19.8px;
  color: #3d6b3d;
  margin-right: 13.2px;
}

.setting-text {
  flex-grow: 1;
  font-size: 15.4px;
  color: #3d6b3d;
}

.arrow-icon {
  font-size: 15.4px;
  color: #7aa87a;
}

.today-plan-details:hover {
  transform: translateY(-3.3px);
  box-shadow: 0 6.6px 17.6px rgba(0, 0, 0, 0.15);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 13.2px;
}

.plan-header h3 {
  margin: 0;
  color: #333;
  font-size: 17.6px;
  font-weight: 600;
}

.exercise-name {
  color: #2d552d;
}

.exercise-status {
  font-size: 12.1px;
  padding: 3.3px 8.8px;
  border-radius: 11px;
  font-weight: 500;
}

.exercise-status.in-progress {
  background-color: #e8f5e9;
  color: #3d6b3d;
}

.exercise-status.pending {
  background-color: #c8e6c9;
  color: #2d552d;
}

.no-exercises-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 11px;
  text-align: center;
}

.no-exercises-icon {
  font-size: 33px;
  color: #c8e6c9;
}

.no-exercises-text {
  font-size: 15.4px;
  color: #666;
}

.add-exercise-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 8.8px 17.6px;
  border-radius: 22px;
  cursor: pointer;
  font-size: 14.3px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2.2px 8.8px rgba(76, 175, 80, 0.3);
  margin-top: 5.5px;
}

.add-exercise-btn:hover {
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  transform: translateY(-2.2px);
  box-shadow: 0 4.4px 13.2px rgba(76, 175, 80, 0.4);
}

.view-today-plan:hover {
  color: #388E3C;
  text-decoration: underline;
}

/* 我的帖子模块样式 */
.full-width-posts-container {
  width: 100%;
  max-width: 1320px;
  margin: 22px auto 0;
  box-sizing: border-box;
  padding: 0 16.5px;
}

.posts-card {
  background-color: white;
  border-radius: 8.8px;
  padding: 16.5px;
  box-shadow: 0 4.4px 13.2px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.posts-card:hover {
  transform: translateY(-3.3px);
  box-shadow: 0 6.6px 17.6px rgba(0, 0, 0, 0.15);
}

.view-all-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: 1px solid #2E7D32;
  padding: 4.4px 11px;
  border-radius: 4.4px;
  cursor: pointer;
  font-size: 14.3px;
  transition: all 0.2s ease;
  box-shadow: 0 2.2px 8.8px rgba(76, 175, 80, 0.3);
}

.view-all-btn:hover {
  background: linear-gradient(135deg, #66BB6A, #4CAF50);
  color: white;
  box-shadow: 0 4.4px 13.2px rgba(76, 175, 80, 0.4);
}

.posts-grid {
  display: flex;
  gap: 16.5px;
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8.8px;
}

.post-item {
  flex: 1;
  min-width: 830px;
  max-width: calc(33.333% - 11px);
  padding: 13.2px;
  border-radius: 6.6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.post-item:hover {
  transform: translateY(-5.5px);
  border-left-color: #4CAF50;
  background-color: #f1f8e9;
}

.post-title {
  margin: 0 0 6.6px 0;
  color: #333;
  font-size: 16.5px;
  font-weight: 600;
}

.post-excerpt {
  margin: 0 0 8.8px 0;
  color: #666;
  font-size: 14.3px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.1px;
  color: #999;
  margin-top: auto;
}

.post-date {
  font-style: italic;
}

.post-stats {
  display: flex;
  gap: 13.2px;
}

.post-stat {
  display: flex;
  align-items: center;
  gap: 3.3px;
}

.stat-icon {
  font-size: 14.3px;
  color: #4CAF50;
}

.no-posts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 44px 16.5px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 6.6px;
  min-height: 198px;
}

.no-posts-icon {
  font-size: 46.2px;
  color: #c8e6c9;
  margin-bottom: 13.2px;
}

.no-posts p {
  margin: 0 0 16.5px 0;
  color: #666;
  font-size: 16.5px;
}

.create-post-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 6.6px 16.5px;
  border-radius: 4.4px;
  cursor: pointer;
  font-size: 14.3px;
  transition: all 0.2s ease;
}

.create-post-btn:hover {
  background-color: #388E3C;
  transform: translateY(-2.2px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content-layout, .full-width-posts-container {
    flex-direction: column;
    padding: 0 11px;
  }

  .left-column, .right-column {
    flex: none;
    width: 100%;
  }

  .card-header {
    flex-direction: column;
    align-items: center;
    gap: 16.5px;
    padding: 0 16.5px;
  }

  .header-left, .header-right {
    max-width: 100%;
    justify-content: center;
    text-align: center;
  }

  .user-info {
    text-align: center;
  }

  .header-right {
    align-self: center;
  }

  .user-card {
    min-height: 242px;
    padding: 33px 0 22px;
  }

  .sports-stats {
    flex-wrap: wrap;
  }

  .stat-item {
    flex: 0 0 50%;
    margin-bottom: 8.8px;
  }

  .stat-item:not(:last-child)::after {
    display: none;
  }

  .goal-chart-container {
    flex-direction: column;
    height: auto;
    gap: 27.5px;
  }

  .goal-chart-wrapper {
    margin-left: 0;
    margin-right: 0;
  }

  .chart-summary-container {
    flex-direction: column;
  }

  .today-summary, .chart-summary {
    flex: none;
    width: 100%;
    margin-bottom: 13.2px;
  }

  .today-summary:last-child, .chart-summary:last-child {
    margin-bottom: 0;
  }

  .posts-card {
    padding: 13.2px;
  }

  .posts-grid {
    flex-direction: column;
  }

  .post-item {
    max-width: 100%;
    min-width: auto;
    padding: 11px;
  }

  .no-posts {
    padding: 22px 8.8px;
  }
}

@media (min-width: 1200px) {
  .card-header {
    padding: 0 44px;
  }
}
</style>