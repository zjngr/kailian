import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
      {path: '/',redirect:'/head/home'},
      {path: '/head',component:() => import('../views/Head.vue'),children:[
              {path: 'home', name: 'Home', meta:{title:'首页'},component: () => import('../views/Home.vue'),},
              {path:'/community',name:'Community',meta:{title:'社区'},component:()=>import("../views/community/Community.vue"),},
              {path:'/addCommunity',name:'AddCommunity',meta:{title:'帖子添加'},component:()=>import("../views/community/AddCommunity.vue"),},
              {path:'/showCommunity',name:'ShowCommunity',meta:{title:'帖子展示'},component:()=>import("../views/community/ShowCommunity.vue"),},
              {path:'/exercisePlan',name:'ExercisePlan',meta:{title:'训练计划'},component:()=>import("../views/exerciseplan/ExercisePlan.vue"),},
              {path:'/ai-coach',name:'Ai-Coach',meta:{title:'AI教练'},component:()=>import("../views/Ai-coach/Ai-Coach.vue"),},
              // 漂流瓶主页面路由
              {path: '/driftBottleMain', name: 'DriftBottleMain', component: ()=>import("../views/DriftBoottle/DriftBottleMain.vue"), meta: { title: '漂流瓶' }, children: [
                      {path: '', name: 'DriftBottlePeople', component: ()=>import('../views/DriftBoottle/People.vue'), meta: { title: '漂流瓶广场' }},
                      {path: 'receivedBottles', name: 'ReceivedBottles', component: ()=>import('../views/DriftBoottle/ReceivedBottles.vue'), meta: { title: '收到的瓶子' }},
                      {path: 'driftBottleHistory', name: 'DriftBottleHistory', component: ()=>import('../views/DriftBoottle/DriftBottleHistory.vue'), meta: { title: '发出的瓶子' }}
                  ]},
              {path:'/exercise-library',name:'Exercise-Library',meta:{title:'动作库'},component:()=>import("../views/ActionLibrary/ActionLibrary.vue"),},
              {path:'/addAction',name:'AddAction',meta:{title:'添加动作'},component:()=>import("../views/ActionLibrary/AddAction.vue"),},
              {path:'/eventPromotion',name:'EventPromotion',meta:{title:'比赛推荐'},component:()=>import("../views/Event/EventPromotion.vue"),},
              {path:'/eventUpload',name:'EventUpload',meta:{title:'比赛上传'},component:()=>import("../views/Event/EventUpload.vue"),},
              {path:'/chat',name:'Chat',meta:{title:'健康交友'},component:()=>import("../views/chat/Chat.vue"),},
              {path:'/food-recognition',name:'FoodRecognition',meta:{title:'AI饮食识别'},component:()=>import("../views/exerciseplan/FoodRecognition.vue"),},
              {path:'/body-recognition',name:'BodyRecognition',meta:{title:'AI体态识别'},component:()=>import("../views/Ai-coach/BodyRecognition.vue"),},
              {path:'/exercise-tracking',name:'ExerciseTracking',meta:{title:'AI动作计数'},component:()=>import("../views/exerciseplan/ExerciseTracking.vue"),},

              {path: '/person', name: 'Person', meta:{title:'个人中心'},component: () => import('../views/PersonCentery/Person.vue'),},
              {path: '/profile', name: 'Profile', meta:{title:'用户详细信息'},component: () => import('../views/PersonCentery/profile.vue'),},
              {path: '/privacy', name: 'Privacy', meta:{title:'修改密码'},component: () => import('../views/PersonCentery/privacy.vue'),},
              {path: '/following/:id', name: 'Following', meta:{title:'关注列表'},component: () => import('../views/PersonCentery/Following.vue'),},
              {path: '/announcement', name: 'Announcement', meta:{title:'公告'},component: () => import('../views/PersonCentery/Announcement.vue'),},
              {path: '/addAnnouncement', name: 'AddAnnouncement', meta:{title:'添加公告'},component: () => import('../views/PersonCentery/AddAnnouncement.vue'),},
              {path: '/toolshow', name: 'toolshow', meta:{title:'3d模型'},component: () => import('../views/toolshow/ToolShow.vue'),},
          ]},
      {path: '/entryAnimation', name: 'EntryAnimation', meta:{title:'进场动画'},component: () => import('../components/EntryAnimation.vue'),},
      {path: '/404', name: 'NotFound', meta:{title:'404找不到页面'},component: () => import('../views/404.vue'),},
      {path: '/login', name: '登录', meta:{title:'登录'},component: () => import('../views/nomarl/Login.vue'),},
      {path: '/register', name: '注册', meta:{title:'注册'},component: () => import('../views/nomarl/Register.vue'),},
  ],
})
//from将要进行跳转的当前route对象(跳转前的一些操作)
//to:跳转后route对象(跳转后的一些操作)
//next():调用该方法后，才能进入下一个钩子
//beforeEach 表示跳转之前的一些操作
router.beforeEach((to, from, next) => {
    console.log('Setting favicon and title'); // 调试信息
    document.title = to.meta.title || '默认标题';
    const faviconPath = import.meta.env.BASE_URL + 'logo.png';
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = faviconPath + '?v=' + new Date().getTime();

    const oldLinks = document.querySelectorAll("link[rel~='icon']");
    oldLinks.forEach(oldLink => {
        document.head.removeChild(oldLink);
    });

    document.head.appendChild(link);
    next();
});
export default router
