<template>
  <div class="action-library">
    <!-- 主要内容区域 -->
    <div class="library-main">

      <!-- 左侧分类导航 -->
      <div class="sidebar-nav">
        <div class="nav-section">
          <h2 class="nav-title">训练部位</h2>
          <div class="nav-items">
            <div
                v-for="part in bodyParts"
                :key="part"
                class="nav-item"
                :class="{ active: selectedBodyPart === part }"
                @click="selectBodyPart(part)"
            >
              <!-- 使用 Element Plus 图标 -->
              <el-icon v-if="part === '腿部'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C13.1 2 14 2.9 14 4V20C14 21.1 13.1 22 12 22S10 21.1 10 20V4C10 2.9 10.9 2 12 2ZM8 4C9.1 4 10 4.9 10 6V18C10 19.1 9.1 20 8 20S6 19.1 6 18V6C6 4.9 6.9 4 8 4ZM16 4C17.1 4 18 4.9 18 6V18C18 19.1 17.1 20 16 20S14 19.1 14 18V6C14 4.9 14.9 4 16 4Z" fill="currentColor"/></svg></el-icon>
              <el-icon v-else-if="part === '背部'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 5C18.9 5 18 5.9 18 7V17C18 18.1 18.9 19 20 19C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5ZM4 7C4 5.9 4.9 5 6 5C7.1 5 8 5.9 8 7V17C8 18.1 7.1 19 6 19C4.9 19 4 18.1 4 17V7ZM12 6C10.9 6 10 6.9 10 8V16C10 17.1 10.9 18 12 18S14 17.1 14 16V8C14 6.9 13.1 6 12 6Z" fill="currentColor"/></svg></el-icon>
              <el-icon v-else-if="part === '胸部'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4C14.2 4 16 5.8 16 8C16 10.2 14.2 12 12 12C9.8 12 8 10.2 8 8C8 5.8 9.8 4 12 4ZM12 2C8.7 2 6 4.7 6 8C6 11.3 8.7 14 12 14C15.3 14 18 11.3 18 8C18 4.7 15.3 2 12 2ZM12 16C7.6 16 4 19.6 4 24H6C6 19.6 9.6 16 12 16ZM12 16C16.4 16 20 19.6 20 24H22C22 19.6 18.4 16 12 16Z" fill="currentColor"/></svg></el-icon>
              <el-icon v-else-if="part === '肩部'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11H15V13H9V11ZM9 7H15V9H9V7ZM9 15H13V17H9V15ZM12 2C8.1 2 5 5.1 5 9V15C5 16.1 5.9 17 7 17H17C18.1 17 19 16.1 19 15V9C19 5.1 15.9 2 12 2ZM17 15H7V9C7 6.2 9.2 4 12 4C14.8 4 17 6.2 17 9V15Z" fill="currentColor"/></svg></el-icon>
              {{ part }}
            </div>
          </div>
        </div>

        <div class="nav-section">
          <h2 class="nav-title">训练目标</h2>
          <div class="nav-items">
            <div
                v-for="goal in trainingGoals"
                :key="goal"
                class="nav-item"
                :class="{ active: selectedGoal === goal }"
                @click="selectGoal(goal)"
            >
              <!-- 使用 Element Plus 图标 -->
              <el-icon v-if="goal === '增肌'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2H11V11H2V13H11V22H13V13H22V11H13V2Z" fill="currentColor"/></svg></el-icon>
              <el-icon v-else-if="goal === '塑形'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L8 6H11V14H13V6H16L12 2ZM18 10V22H20V10H18ZM4 10V22H6V10H4Z" fill="currentColor"/></svg></el-icon>
              <el-icon v-else-if="goal === '燃脂'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13.76 3.29 13.5 3.5 13.39 3.5C13.15 3.5 12.93 3.42 12.95 3.23C12.96 2.81 13.18 2.5 13.5 2.25C13.08 2.77 12.55 3.25 12 3.5C11.45 3.25 10.92 2.77 10.5 2.25C10.82 2.5 11.04 2.81 11.05 3.23C11.07 3.42 10.85 3.5 10.61 3.5C10.5 3.5 10.24 3.29 10.05 3C11 4.85 10.67 7.26 9.18 8.72C8.54 9.35 7.78 9.78 7.11 10.38C6.85 10.64 6.57 10.9 6.34 11.2C4.78 13.74 5.75 17.21 8 18.5C9.06 19.1 10 19.41 11 19.43V19.5C11 20.33 11.67 21 12.5 21C13.33 21 14 20.33 14 19.5V19.43C15 19.41 15.94 19.1 17 18.5C19.25 17.21 20.22 13.74 18.66 11.2H17.66ZM9.76 15.62C9.28 15.13 9 14.5 9 13.8C9 12.5 10.2 11.5 11.5 11.5S14 12.5 14 13.8C14 14.5 13.72 15.13 13.24 15.62C12.76 16.1 12.13 16.4 11.5 16.4S10.24 16.1 9.76 15.62Z" fill="currentColor"/></svg></el-icon>
              <el-icon v-else-if="goal === '放松'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20ZM16.5 9C17.3 9 18 8.3 18 7.5S17.3 6 16.5 6S15 6.7 15 7.5S15.7 9 16.5 9ZM7.5 9C8.3 9 9 8.3 9 7.5S8.3 6 7.5 6S6 6.7 6 7.5S6.7 9 7.5 9ZM12 17C13.5 17 15 16.2 15.8 15H8.2C9 16.2 10.5 17 12 17Z" fill="currentColor"/></svg></el-icon>
              {{ goal }}
            </div>
          </div>
        </div>

        <div class="nav-section">
          <h2 class="nav-title">训练器械</h2>
          <div class="nav-items">
            <div
                v-for="equipment in equipments"
                :key="equipment"
                class="nav-item"
                :class="{ active: selectedEquipment === equipment }"
                @click="selectEquipment(equipment)"
            >
              <!-- 使用 Element Plus 图标 -->
              <el-icon v-if="equipment === '无器械'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20ZM12 17C13.5 17 15 16.2 15.8 15H8.2C9 16.2 10.5 17 12 17Z" fill="currentColor"/></svg></el-icon>
              <el-icon v-else-if="equipment === '有器械'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6H4C2.9 6 2 6.9 2 8V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16V8C22 6.9 21.1 6 20 6ZM20 16H4V8H20V16ZM16 10H8V12H16V10Z" fill="currentColor"/></svg></el-icon>
              <el-icon v-else-if="equipment === '哑铃'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 7H17V5C17 3.9 16.1 3 15 3H9C7.9 3 7 3.9 7 5V7H5C3.9 7 3 7.9 3 9V15C3 16.1 3.9 17 5 17H7V19C7 20.1 7.9 21 9 21H15C16.1 21 17 20.1 17 19V17H19C20.1 17 21 16.1 21 15V9C21 7.9 20.1 7 19 7ZM9 5H15V7H9V5ZM19 15H17V9H19V15ZM15 19H9V17H15V19ZM15 15H9V9H15V15ZM7 15H5V9H7V15Z" fill="currentColor"/></svg></el-icon>
              <el-icon v-else-if="equipment === '杠铃'" class="nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6H4C2.9 6 2 6.9 2 8V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16V8C22 6.9 21.1 6 20 6ZM20 16H4V8H20V16ZM8 10H6V14H8V10ZM18 10H16V14H18V10Z" fill="currentColor"/></svg></el-icon>
              {{ equipment }}
            </div>
          </div>
        </div>
      </div>

      <!-- 中间内容区域 -->
      <div class="main-content">
        <!-- 动作展示区域 -->
        <div class="actions-section">
          <!-- 搜索栏 -->
          <div class="section-header">
            <h1 class="banner-title">动作库</h1>
            <div class="search-container">
              <el-input
                  v-model="searchKeyword"
                  placeholder="搜索动作..."
                  class="action-search"
                  clearable
                  @keyup.enter="searchActions"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" class="search-button" @click="searchActions">
                搜索
              </el-button>
            </div>
            <div class="action-count">共 {{ filteredActions.length }} 个动作</div>
          </div>

          <!-- 动作网格视图 -->
          <div class="actions-grid">
            <div
                v-for="action in displayedActionsPage"
                :key="action.aid"
                class="action-card"
            >
              <div class="card-video">
                <el-image
                    :src="action.image"
                    alt="action video"
                    class="action-video"
                    lazy
                    fit="cover"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon class="error-icon"><VideoPlay /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>

              <div class="card-content">
                <h3 class="action-name">{{ action.name }}</h3>
                <div class="action-tags">
                  <el-tag class="action-tag" type="success" effect="plain">{{ action.locationtag }}</el-tag>
                  <el-tag class="action-tag" type="success" effect="plain">{{ action.goaltag }}</el-tag>
                  <el-tag class="action-tag" type="success" effect="plain">{{ action.tooltag }}</el-tag>
                  <div class="card-actions">
                  <el-button
                    v-if="data.newExercise"
                    type="primary"
                    style="background:#f1ca09;margin-left: 72px;margin-bottom: 3px"
                    @click="showinsertplan(action)"
                >
                  添加计划
                </el-button>
                  </div>
                </div>



                <div class="card-actions" style="margin-right: 20px">
                  <el-button
                      v-if="data.user.id === 1"
                      type="primary"
                      style="background:red;"
                      @click="deleteaction(action)"
                  >
                    删除视频
                  </el-button>

                  <el-button
                      type="primary"
                      @click="viewActionDetail(action)"
                  >
                    动作详情
                  </el-button>

                  <el-button
                      type="primary"
                      @click="showDialog(action)"
                  >
                    观看视频
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页组件 -->
          <div class="pagination-container">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[6, 9, 12, 18]"
                :small="false"
                :disabled="false"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredActions.length"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>

      <!-- 右侧动作详情侧边栏 -->
      <div v-if="selectedAction" class="action-detail-sidebar">
        <div class="sidebar-content">
          <div class="sidebar-header">
            <h2>{{ selectedAction.name }}</h2>
            <el-button class="close-btn" @click="closeActionDetail" circle>
              <el-icon><Close /></el-icon>
            </el-button>
          </div>

          <div class="sidebar-body">
            <!-- 目标肌群 -->
            <div class="detail-section">
              <h3>目标肌群</h3>
              <div class="muscle-group">
                <p>{{ selectedAction.locationtag}}</p>
                <div class="muscle-image-placeholder">
                  <el-image
                      :src="selectedAction.image"
                      alt="muscle group"
                      class="muscle-image"
                      fit="cover"
                  >
                    <template #placeholder>
                      <div class="image-slot loading-icon2">
                        <el-icon class="loading-icon loading-icon2"><Picture /></el-icon>
                      </div>
                    </template>
                    <template #error>
                      <div class="image-slot">
                        <el-icon class="error-icon"><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
            </div>

            <!-- 动作要领 -->
            <div class="detail-section">
              <h3>动作要领</h3>
              <div class="instruction-content">
                <p>{{selectedAction.description }}</p>
              </div>
            </div>

            <!-- 注意事项 -->
            <div class="detail-section">
              <h3>注意事项</h3>
              <div class="precautions-content">
                <p>{{ selectedAction.notice}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 悬浮发动作按钮开始 -->
      <div v-if="ids ===1" class="float-post-btn" @click="goToAddForum">
        <el-icon :size="32"><Plus /></el-icon>
      </div>
      <!-- 悬浮发帖按钮结束 -->
    </div>

    <!--视频展示弹框-->
    <el-dialog
        v-model="isImagePopupVisible" custom-class="video-dialog" width="800px"  style="border-radius: 20px;">
      <!-- 标题 -->
      <div class="video-title" style="margin-bottom: 20px;margin-top: -20px">{{lookAction.name}}演示视频</div>

      <!-- 视频播放器 -->
      <div style="border: 12px solid #81c784;border-radius: 20px">
      <video
          ref="videoPlayer"
          class="video-player"
          :src="lookAction.video"
          controls>
      </video>
     </div>
        <!-- 操作按钮 -->
      <div class="dialog-actions">
        <el-button
            class="close-btn"
            style="border: 3px solid #81c784;"
            @click="clickss"
        >
          关闭视频
        </el-button>
      </div>
    </el-dialog>

    <!-- 添加训练项目表单 -->
    <el-dialog v-model="isinsertplanVisible" class="add-exercise-form" style="border-radius: 12px">
      <div class="form-group">
      <h1 style="margin-left: 40%">添加{{data.newExercise.dayss}}的计划</h1>
      </div>
      <div class="form-group">
        <label>项目名称</label>
        <input type="text" v-model="data.newExercise.actionname" readonly disabled placeholder="例如：深蹲">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>休息时间(分钟)</label>
          <input type="number" v-model="data.newExercise.freetime" placeholder="例如：90">
        </div>
        <div class="form-group">
          <label>组数/次数</label>
          <input type="text" v-model="data.newExercise.actiontimes" placeholder="例如：4组 x 10次">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>消耗的卡路里(卡)</label>
          <input type="number" v-model="data.newExercise.calorie" placeholder="例如：消耗1000">
        </div>

        <div class="form-group">
          <label>预计时间(分钟)</label>
          <input type="number" v-model="data.newExercise.plantime" placeholder="例如：15">
        </div>
      </div>


      <div class="form-actions">
        <button class="cancel-button" @click="cancelAddExercise">取消</button>
        <button class="save-button" @click="addNewExercise">保存</button>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import {ref, computed, onMounted, reactive} from 'vue'
import request from "@/utils/request.js";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
  newExercise: JSON.parse(localStorage.getItem("newExercise")),
});



const router = useRouter()

if(!data.user){
  router.push('/login')
}
const ids=data.user.id;
// 搜索关键词
const searchKeyword = ref('')

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(9)
const isImagePopupVisible = ref(false)
const isinsertplanVisible = ref(false)

// 选中的分类
const selectedBodyPart = ref('')
const selectedGoal = ref('')
const selectedEquipment = ref('')

// 选中的动作详情
const selectedAction = ref(null)

// 训练部位
const bodyParts = ref(['腿部', '背部', '胸部', '肩部'])

//观看动作
const lookAction= ref()

// 训练目标
const trainingGoals = ref(['增肌', '塑形', '燃脂', '放松'])

// 训练器械
const equipments = ref(['无器械', '有器械', '哑铃', '杠铃'])

// 动作数据
const actions = ref([])

// 计算属性
// 过滤后的动作
const filteredActions = computed(() => {
  let filtered = actions.value

  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(action =>
        action.name.toLowerCase().includes(keyword)
    )
  }

  // 根据训练部位过滤
  if (selectedBodyPart.value) {
    filtered = filtered.filter(action =>
        action.locationtag.includes(selectedBodyPart.value)
    )
  }

  // 根据训练目标过滤
  if (selectedGoal.value) {
    filtered = filtered.filter(action =>
        action.goaltag.includes(selectedGoal.value)
    )
  }

  // 根据训练器械过滤
  if (selectedEquipment.value) {
    filtered = filtered.filter(action =>
        action.tooltag.includes(selectedEquipment.value)
    )
  }
  return filtered
})

// 当前页显示的动作
const displayedActionsPage = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredActions.value.slice(start, end)
})

// 方法
// 搜索动作
const searchActions = () => {
  currentPage.value = 1
}

// 选择训练部位
const selectBodyPart = (part) => {
  selectedBodyPart.value = selectedBodyPart.value === part ? '' : part//如果值不相同就变为相同
  currentPage.value = 1//把页码恢复为1
}

// 选择训练目标
const selectGoal = (goal) => {
  selectedGoal.value = selectedGoal.value === goal ? '' : goal
  currentPage.value = 1
}

// 选择训练器械
const selectEquipment = (equipment) => {
  selectedEquipment.value = selectedEquipment.value === equipment ? '' : equipment
  currentPage.value = 1
}

// 查看动作详情
const viewActionDetail = (action) => {
  selectedAction.value = action
}

// 关闭动作详情
const closeActionDetail = () => {
  selectedAction.value = null
}

// 分页相关方法
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

//跳转页面
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 跳转到发帖页面
const goToAddForum = () => {
  router.push('/addAction')
}

//删除视频
const deleteaction=(action)=>{
  request.delete(`action/deleteActionByAid/${action.aid}`).then((res)=>{
     if(res.code === "200"){
       refreshData()
     }else{
       ElMessage.error(res.msg)
     }
  })
}

//展示弹窗的函数
const showDialog=(action)=>{
  lookAction.value=action;
  isImagePopupVisible.value=true
}

//关闭弹窗
const clickss=()=>{
  isImagePopupVisible.value=false
}

//展示添加页面的弹窗
const showinsertplan=(plan)=>{
   data.newExercise.actionname=plan.name
   data.newExercise.video=plan.video
   isinsertplanVisible.value=true;
}

//关闭弹窗
const cancelAddExercise = () => {
  isinsertplanVisible.value=false;
}

//保存对应的计划
const addNewExercise=()=>{
   request.post("Excerciseplanlist/insertExcerciseplanlist",data.newExercise).then((res)=>{
     if(res.code === "200"){
       //清除后台返回的数据
       localStorage.setItem('newExercise',JSON.stringify(null))
       ElMessage.success("添加计划成功")
       setTimeout(function() {
         window.location.href = "/exercisePlan";
       }, 1000);
     }else{
       ElMessage.error(res.msg)
     }
   })
}

//更新数据
const refreshData=()=>{
  //查询所有的数据
  request.get("action/selectALL").then((res)=>{
    actions.value=res.data
  })
}

// 组件挂载时初始化
onMounted(() => {
  window.scrollTo(0,0)
  if(data.user===null){
    window.location="/login"
  }
  // 可以在这里添加初始化逻辑
  refreshData();


})
</script>

<style scoped>

/* 添加表单样式 */
.add-exercise-form {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

label {
  display: inline-block;
  width: 120px;
  text-align: right;
  margin-right: 15px;
  font-size: 14px;
  color: #333;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

input:focus {
  outline: none;
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.2);
  outline: none;
}

.form-row {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 15px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.cancel-button,
.save-button {
  padding: 10px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  min-width: 80px;
}

.cancel-button {
  background: #f8f9fa;
  color: #7f8c8d;
  border: 1px solid #e0e0e0;
}

.cancel-button:hover {
  background: #e9ecef;
}

.save-button {
  background: linear-gradient(to right, #2ecc71, #1abc9c);
  color: white;
  border: none;
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(46, 204, 113, 0.4);
}

/* 弹框样式 */
.video-dialog >>> .el-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(94, 191, 132, 0.25);
}

.video-dialog >>> .el-dialog__header {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  padding: 16px 20px;
  margin: 0;
  border-bottom: 1px solid #d0e8d2;
}

.video-dialog >>> .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #2e7d32;
}

.video-dialog >>> .el-dialog__headerbtn {
  top: 16px;
  font-size: 18px;
}

.video-dialog >>> .el-dialog__headerbtn:hover .el-dialog__close {
  color: #4caf50;
}

.video-dialog >>> .el-dialog__body {
  background: linear-gradient(to bottom, #f1f8e9, #e8f5e9);
  padding: 30px;
}

/* 视频播放器 */
.video-player {
  width: 100%;
  height: 340px;
  border-radius: 12px;
  background-color: #000;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

/* 标题 */
.video-title {
  margin-top: 20px;
  font-size: 30px;
  font-weight: 600;
  color: #141514;
  text-align: center;
}

/* 操作按钮 */
.dialog-actions {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

.close-btn {
  background: linear-gradient(135deg, #0ae113, #8fe18f);
  border: none;
  color: #32e70a;
  padding: 24px 60px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: linear-gradient(135deg, #81c784, #66bb6a);
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.2);
  transform: translateY(-2px);
}

.close-btn:active {
  transform: translateY(0);
}
/* 悬浮添加动作按钮 */
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

/*新增的样式开始*/
.action-library {
  background-color: #e8f5e9;
  padding: 0;
  font-size: 20px;
}

/* 主要内容区域 */
.library-main {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  margin: 20px auto;
  padding: 0 20px;
  position: relative;
}

/* 左侧导航 */
.sidebar-nav {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 20px;
  height: 890px;
}

.nav-section {
  margin-bottom: 20px;
}

.nav-section:last-child {
  margin-bottom: 0;
}

.nav-title {
  color: #333;
  margin: 0 0 12px 0;
  font-size: 1.4rem;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #a5d6a7;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  padding: 12px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
}

.nav-icon {
  width: 24px;
  height: 24px;
  font-size: 18px;
}

.nav-item:hover {
  background-color: #e8f5e9;
  color: #1b5e20;
}

.nav-item.active {
  background-color: #c8e6c9;
  color: #1b5e20;
  font-weight: bold;
  border-right: 3px solid #66bb6a;
}

/* 中间内容区域 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: calc(100vh - 100px);
}

/* 动作展示区域 */
.actions-section {
  background: #f1f8e9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.banner-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  color: #1b5e20;
  flex: 1;
}

.search-container {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.action-search {
  flex: 1;
  min-width: 250px;
}

.action-search :deep(.el-input__wrapper) {
  border-radius: 24px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  height: 40px;
  border: 1px solid #a5d6a7;
}

.action-search :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #66bb6a;
}

.search-button {
  border-radius: 24px;
  background: linear-gradient(135deg, #4caf50, #81c784);
  color: white;
  border: 2px solid #4caf50;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 10px 20px;
  height: 40px;
}

.search-button:hover {
  background: linear-gradient(135deg, #66bb6a, #4caf50);
  border: 2px solid #66bb6a;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.action-count {
  color: #666;
  font-size: 1.1rem;
  flex-basis: 100%;
  text-align: right;
}

/* 动作网格视图 */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.action-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border: 1px solid #ddd;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(165, 214, 167, 0.4);
  border-color: #a5d6a7;
}

.card-video {
  height: 180px;
  overflow: hidden;
}

.action-video {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.action-card:hover .action-video {
  transform: scale(1.05);
}

.card-content {
  padding: 15px;
}

.action-name {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.action-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 15px;
}

.action-tag {
  margin: 0;
  border-radius: 10px;
}

.action-tag :deep(.el-tag__content) {
  font-weight: 500;
  font-size: 1rem;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.card-actions :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
  font-size: 1.1rem;
  padding: 10px 20px;
}

.card-actions :deep(.el-button--primary) {
  background: linear-gradient(135deg, #4caf50, #81c784);
  border: none;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.card-actions :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #66bb6a, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.4);
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding-top: 15px;
  border-top: 1px solid #ddd;
  margin-top: auto;
}

.pagination-container :deep(.el-pagination) {
  font-size: 1.1rem;
}

.pagination-container :deep(.el-pager li) {
  font-size: 1.1rem;
  min-width: 36px;
  height: 36px;
  line-height: 36px;
}

.pagination-container :deep(.btn-prev),
.pagination-container :deep(.btn-next) {
  width: 36px;
  height: 36px;
}

/* 图片占位符 */
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #999;
}

.loading-icon,
.error-icon {
  font-size: 1.8rem;
}

/* 动作详情侧边栏 */
.action-detail-sidebar {
  position: fixed;
  top: 97px;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  font-size: 18px;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #a5d6a7 0%, #80cbc4 100%);
}

.sidebar-header h2 {
  margin: 0;
  color: #1b5e20;
  font-size: 1.8rem;
  font-weight: 700;
}

.close-btn {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #1b5e20;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.1rem;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f8fff8;
}

.detail-section {
  margin-bottom: 25px;
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.detail-section h3 {
  color: #1b5e20;
  margin: 0 0 12px 0;
  font-size: 1.4rem;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #c8e6c9;
}

.muscle-group p {
  margin: 12px 0;
  color: #555;
  font-size: 1.1rem;
  line-height: 1.5;
}

.muscle-image-placeholder {
  height: 180px;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.muscle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.instruction-content ol,
.precautions-content ul {
  padding-left: 20px;
  margin: 0;
}

.instruction-content li,
.precautions-content li {
  margin-bottom: 10px;
  color: #555;
  line-height: 1.5;
  font-size: 1.1rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-detail-sidebar {
    width: 350px;
  }

  .nav-item {
    font-size: 1.1rem;
  }

  .banner-title {
    font-size: 1.8rem;
  }

  .search-button {
    font-size: 1rem;
  }

  .action-name {
    font-size: 1.4rem;
  }

  .detail-section h3 {
    font-size: 1.3rem;
  }
}

@media (max-width: 768px) {
  .library-main {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-container {
    width: 100%;
  }

  .action-search {
    flex: 1;
    width: auto;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .nav-item {
    padding: 10px 12px;
    font-size: 1rem;
  }

  .sidebar-nav {
    position: relative;
    top: 0;
  }

  .action-detail-sidebar {
    width: 100%;
  }

  .action-count {
    text-align: left;
  }

  .action-name {
    font-size: 1.3rem;
  }

  .detail-section h3 {
    font-size: 1.2rem;
  }
}
</style>

