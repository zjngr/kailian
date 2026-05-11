<template>
  <div class="training-app">
    <div class="main-container">
      <!-- 训练计划部分 (60%) -->
      <section class="training-plan">
        <!-- 周计划导航栏 -->
        <div class="week-navigation">
          <div class="week-header">
            <h2 class="week-title">本周训练计划</h2>
            <div class="week-dates">{{ weekDates }}</div>
          </div>

          <div class="days-container">
            <div class="day-card"
                 v-for="(day, index) in weekDays"
                 :key="index"
                 :class="{
                   active: activeDay === index,
                   completed: day.completed,
                   today: day.isToday
                 }"
                 @click="setActiveDay(index)">
              <div class="day-name">{{ day.name }}</div>
              <div class="day-date">{{ day.date }}</div>
              <div class="day-stats">
                <div class="completion-dot" v-if="day.completed"></div>
                <div class="completion-percent" v-if="day.completed">{{ day.completion }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 训练计划内容 -->
        <div class="training-content">
          <div class="section-header">
            <h3 class="section-title">{{ activeDayName }}训练计划</h3>
            <div class="day-stats-summary">
              <div class="stat-item">
                <div class="stat-value">{{ activeDayExercises.length }}</div>
                <div class="stat-label">训练项目</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ activeDayCompletion }}%</div>
                <div class="stat-label">完成率</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ activeDayTime }}分钟</div>
                <div class="stat-label">预计时间</div>
              </div>
            </div>
          </div>

          <!-- 添加训练项目按钮 -->
          <div class="add-exercise-section">
            <button class="add-button" @click="showAddExerciseForm()">
              <el-icon class="icon"><Plus /></el-icon> 添加训练项目
            </button>
          </div>

          <!-- 固定高度的训练项目区域 -->
          <div class="training-items-container">
            <div class="training-items" :class="{ 'empty': activeDayExercises.length === 0 }">
              <div v-if="activeDayExercises.length === 0" class="no-exercises">
                <div class="no-exercises-icon">
                  <el-icon class="icon"><InfoFilled /></el-icon>
                </div>
                <div class="no-exercises-text">今日无训练计划</div>
                <div class="no-exercises-hint">点击上方按钮添加训练项目</div>
              </div>

              <div v-else class="training-items-scroll">
                <div class="training-item" v-for="(exercise, index) in activeDayExercises" :key="index">
                  <div class="exercise-content">
                    <div class="exercise-header">
                      <h3 class="exercise-name" style="font-size: 30px">{{ exercise.actionname }}</h3>
                    </div>

                    <div class="exercise-details">
                      <div class="exercise-info" style="font-size: 15px">
                        <span>
                          <el-icon class="info-icon"><Refresh /></el-icon>
                          运动组数:
                          {{ exercise.actiontimes }}
                        </span>
                        <span>
                          <el-icon class="info-icon"><Timer /></el-icon>
                          休息时间
                          {{ exercise.freetime }}分钟
                        </span>
                        <span>
                          <el-icon><Football /></el-icon>
                          消耗卡路里
                          {{ exercise.calorie }}卡
                        </span>
                        <span>
                          <el-icon class="info-icon"><Timer /></el-icon>
                          预计花费时间
                          {{ exercise.plantime }}分钟
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="exercise-actions">
                    <div class="completed-toggle">
                      <input
                          type="checkbox"
                          v-model="exercise.isok"
                          :true-value="1"
                          :false-value="0"
                          :disabled="!isTodayActiveDay"
                          @click="chooseok(exercise)"
                      >
                      <label>已完成</label>
                    </div>
                    <div class="action-buttons">
                      <button class="watch-button" @click="showVideo(exercise)">
                        <el-icon class="watch-icon"><VideoPlay /></el-icon> 观看动作
                      </button>
                      <button class="delete-button" @click="deleteExercise(exercise)">
                        <el-icon class="delete-icon"><Delete /></el-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 进度条动画 -->
          <div class="progress-container">
            <div class="progress-header">
            <div class="progress-title">今日完成进度</div>
            <div class="progress-percent">{{ activeDayCompletion }}%</div>
          </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: activeDayCompletion + '%' }"></div>
            </div>
          </div>

          <!-- AI 动作识别入口 -->
          <div class="ai-workout-entry" @click="goToExerciseTracking">
            <div class="ai-workout-icon">
              <el-icon :size="28"><VideoCamera /></el-icon>
            </div>
            <div class="ai-workout-text">
              <div class="ai-workout-title">AI 智能动作计数</div>
              <div class="ai-workout-desc">打开摄像头，自动识别动作并计数</div>
            </div>
            <div class="ai-workout-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </section>

      <!-- 饮食计划部分 (40%) -->
      <section class="diet-plan">
        <!-- 早餐的饮食计划-->
        <div class="section-header">
          <h2 class="section-title">{{ activeDayName }}饮食计划</h2>
        </div>

        <!-- AI智能饮食识别入口 -->
        <div class="ai-diet-entry" @click="goToFoodRecognition">
          <div class="ai-diet-icon">
            <el-icon :size="28"><MagicStick /></el-icon>
          </div>
          <div class="ai-diet-text">
            <div class="ai-diet-title">AI智能饮食建议</div>
            <div class="ai-diet-desc">拍照识别食物，分析热量与营养</div>
          </div>
          <el-icon class="ai-diet-arrow"><ArrowRight /></el-icon>
        </div>

        <!-- 早餐 -->
        <div class="meal-section">
          <div class="meal-header">
            <h3 class="meal-title">早餐</h3>
            <button class="add-button" @click="showAddMealForm('breakfast')">
              <el-icon class="icon"><Plus /></el-icon> 添加餐食
            </button>
          </div>

          <!-- 添加早餐表单 -->
          <div class="add-meal-form" v-if="showAddForm === 'breakfast'">
            <div class="form-row">
              <div class="form-group">
                <label>餐食名称</label>
                <input type="text" v-model="newMeal.fastname" placeholder="例如：蛋白质燕麦粥">
              </div>

            </div>
            <div class="form-row">
              <div class="form-group">
                <label>卡路里(kcal)</label>
                <input type="number" v-model="newMeal.calorie" placeholder="例如：450">
              </div>

              <div class="form-group">
                <label>碳水(g)</label>
                <input type="number" v-model="newMeal.carbohydrate" placeholder="例如：60">
              </div>

              <div class="form-group">
                <label>蛋白质(g)</label>
                <input type="number" v-model="newMeal.protein" placeholder="例如：25">
              </div>
            </div>

            <div class="form-actions">
              <button class="cancel-button" @click="cancelAddMeal">取消</button>
              <button class="save-button" @click="addNewMeal('breakfast')">保存</button>
            </div>
          </div>

          <!--早餐表-->
          <div v-if="activeDayMeals.breakfast.length === 0" class="no-meals">
            <div class="no-meals-icon">
              <el-icon class="icon"><Food /></el-icon>
            </div>
            <div class="no-meals-text">暂无早餐计划</div>
            <div class="no-meals-hint">点击上方按钮添加餐食</div>
          </div>

          <!--展示数据库中的早餐表-->
          <div class="meal-card" v-for="(meal, index) in activeDayMeals.breakfast" :key="'breakfast-'+index">
            <div class="meal-card-header">
              <div class="meal-card-title">{{ meal.fastname }}</div>
              <button class="delete-meal-button" @click="deleteMeal('breakfast', index,meal.fastname)">
                <el-icon class="delete-icon"><Delete /></el-icon>
              </button>
            </div>
            <div class="meal-card-content">
                <div class="nutrient-info">
                <span>
                  <el-icon class="info-icon"><Fire /></el-icon>
                  {{ meal.calorie }} kcal
                </span>
                  <span>
                  <el-icon class="info-icon"><Grape /></el-icon>
                  {{ meal.carbohydrate }}g 碳水
                </span>
                  <span>
                  <el-icon class="info-icon"><Chicken /></el-icon>
                  {{ meal.protein }}g 蛋白质
                </span>
                </div>
              </div>
            </div>
          </div>

        <!-- 午餐 -->
        <div class="meal-section">
            <div class="meal-header">
              <h3 class="meal-title">午餐</h3>
              <button class="add-button" @click="showAddMealForm('lunch')">
                <el-icon class="icon"><Plus /></el-icon> 添加餐食
              </button>
            </div>

            <!-- 添加午餐表单 -->
            <div class="add-meal-form" v-if="showAddForm === 'lunch'">
              <div class="form-row">
                <div class="form-group">
                  <label>餐食名称</label>
                  <input type="text" v-model="newMeal.fastname" placeholder="例如：鸡胸肉沙拉">
                </div>
              </div>



              <div class="form-row">
                <div class="form-group">
                  <label>卡路里(kcal)</label>
                    <input type="number" v-model="newMeal.calorie" placeholder="例如：550">
              </div>

              <div class="form-group">
                <label>碳水(g)</label>
                <input type="number" v-model="newMeal.carbohydrate" placeholder="例如：45">
              </div>

              <div class="form-group">
                <label>蛋白质(g)</label>
                <input type="number" v-model="newMeal.protein" placeholder="例如：40">
              </div>
            </div>

            <div class="form-actions">
              <button class="cancel-button" @click="cancelAddMeal">取消</button>
              <button class="save-button" @click="addNewMeal('lunch')">保存</button>
            </div>
          </div>

          <div v-if="activeDayMeals.lunch.length === 0" class="no-meals">
            <div class="no-meals-icon">
              <el-icon class="icon"><Food /></el-icon>
            </div>
            <div class="no-meals-text">暂无午餐计划</div>
            <div class="no-meals-hint">点击上方按钮添加餐食</div>
          </div>

          <div class="meal-card" v-for="(meal, index) in activeDayMeals.lunch" :key="'lunch-'+index">
            <div class="meal-card-header">
              <div class="meal-card-title">{{ meal.fastname }} </div>
              <button class="delete-meal-button" @click="deleteMeal('lunch', index,meal.fastname)">
                <el-icon class="delete-icon"><Delete /></el-icon>
              </button>
            </div>
            <div class="meal-card-content">
              <div class="nutrient-info">
                <span>
                  <el-icon class="info-icon"><Fire /></el-icon>
                  {{ meal.calorie }} kcal
                </span>
                <span>
                  <el-icon class="info-icon"><Grape /></el-icon>
                  {{ meal.carbohydrate }}g 碳水
                </span>
                <span>
                  <el-icon class="info-icon"><Chicken /></el-icon>
                  {{ meal.protein }}g 蛋白质
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 晚餐 -->
        <div class="meal-section">
          <div class="meal-header">
            <h3 class="meal-title">晚餐</h3>
            <button class="add-button" @click="showAddMealForm('dinner')">
              <el-icon class="icon"><Plus /></el-icon> 添加餐食
            </button>
          </div>

          <!-- 添加晚餐表单 -->
          <div class="add-meal-form" v-if="showAddForm === 'dinner'">
            <div class="form-row">
              <div class="form-group">
                <label>餐食名称</label>
                <input type="text" v-model="newMeal.fastname" placeholder="例如：烤三文鱼">
              </div>
            </div>


            <div class="form-row">
              <div class="form-group">
                <label>卡路里(kcal)</label>
                <input type="number" v-model="newMeal.calorie" placeholder="例如：480">
              </div>

              <div class="form-group">
                <label>碳水(g)</label>
                <input type="number" v-model="newMeal.carbohydrate" placeholder="例如：35">
              </div>

              <div class="form-group">
                <label>蛋白质(g)</label>
                <input type="number" v-model="newMeal.protein" placeholder="例如：35">
              </div>
            </div>

            <div class="form-actions">
              <button class="cancel-button" @click="cancelAddMeal">取消</button>
              <button class="save-button" @click="addNewMeal('dinner')">保存</button>
            </div>
          </div>

          <div v-if="activeDayMeals.dinner.length === 0" class="no-meals">
            <div class="no-meals-icon">
              <el-icon class="icon"><Food /></el-icon>
            </div>
            <div class="no-meals-text">暂无晚餐计划</div>
            <div class="no-meals-hint">点击上方按钮添加餐食</div>
          </div>

          <div class="meal-card" v-for="(meal, index) in activeDayMeals.dinner" :key="'dinner-'+index">
          <div class="meal-card-header">
            <div class="meal-card-title">{{ meal.fastname }} </div>
            <button class="delete-meal-button" @click="deleteMeal('dinner', index , meal.fastname)">
              <el-icon class="delete-icon"><Delete /></el-icon>
            </button>
          </div>
          <div class="meal-card-content">
            <div class="nutrient-info">
                <span>
                  <el-icon class="info-icon"><Fire /></el-icon>
                  {{ meal.calorie }} kcal
                </span>
              <span>
                <el-icon class="info-icon"><Grape /></el-icon>
                    {{ meal.carbohydrate }}g 碳水
                </span>
              <span>
                  <el-icon class="info-icon"><Chicken /></el-icon>
                  {{ meal.protein }}g 蛋白质
                </span>
            </div>
          </div>
        </div>
    </div>

    <div class="motivation">
      <el-icon class="quote-icon"><QuoteLeft /></el-icon>
      健康的身体是灵魂的客厅，有病的身体则是灵魂的禁闭室
      <el-icon class="quote-icon"><QuoteRight /></el-icon>
    </div>4

    </section>
  </div>

    <!--视频展示弹框-->
    <el-dialog
        v-model="isImagePopupVisible" custom-class="video-dialog" width="800px"  style="border-radius: 20px;">
      <!-- 标题 -->
      <div class="video-title" style="margin-bottom: 20px;margin-top: -20px">{{lookAction.actionname}}演示视频</div>

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
            style="border: 3px solid #81c784; font-size: 25px"
            @click="clickss"
        >
          关闭视频
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
import router from "@/router/index.js";

const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
});

// 当前活动日期
const activeDay = ref(1) // 默认选择周二

// 获取当前日期信息
const today = new Date()
const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1 // 将周日(0)转换为6

//观看动作
const lookAction= ref()

//弹窗参数
const isImagePopupVisible = ref(false)

// 生成本周日期数据
const generateWeekDays = () => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const weekDays = []

  // 获取本周一的日期
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)

    const month = date.getMonth() + 1
    const day = date.getDate()

    weekDays.push({
      name: days[i],
      date: `${month}/${day}`,
      isToday: i === todayIndex,
      completed: false,
      completion: 0
    })
  }

  return weekDays
}

// 本周日期数据
const weekDays = reactive(generateWeekDays())

// 设置今天为活动日
activeDay.value = todayIndex

// 本周日期范围
const weekDates = computed(() => {
  const start = weekDays[0].date
  const end = weekDays[6].date
  return `${start} - ${end}`
})

// 活动日名称
const activeDayName = computed(() => {
  return weekDays[activeDay.value].name
})

// 设置活动日期
const setActiveDay = (dayIndex) => {
  activeDay.value = dayIndex
}

// 检查当前活动日是否是今天
const isTodayActiveDay = computed(() => {
  return activeDay.value === todayIndex
})

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

// 当前活动日的饮食计划
const activeDayMeals = computed(() => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  return dietPlans[days[activeDay.value]]
})

// 添加训练项目
const showAddExerciseForm = ()=>{
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayKey = days[activeDay.value]
  //传递数组
  newExercise.dayss=activeDayName.value;
  newExercise.wid=dayKey;
  newExercise.sid=data.user.id;
  //存储后台返回的数据
  localStorage.setItem('newExercise',JSON.stringify(newExercise))
  window.location.href='/exercise-library';
}

//修改项目
const chooseok=(excercise)=>{
   excercise.isok=Math.abs(excercise.isok-1)
   request.put("/Excerciseplanlist/updateExcerciseplanlist",excercise).then((res)=>{
     if (res.code === '200') {
        refreshData()
     } else {
       ElMessage.error(res.msg);
     }
   })
}

//计划的表格
const newExercise = reactive({
  sid: null,
  wid: null,
  actionname:null,
  actiontimes:null,
  freetime: null,
  calorie: null,
  plantime:null,
  video:null,
  dayss:null
})

//展示视频弹窗的函数
const showVideo=(action)=>{
  lookAction.value=action;
  isImagePopupVisible.value=true
}

//关闭弹窗
const clickss=()=>{
  isImagePopupVisible.value=false
}

// 删除训练项目
const deleteExercise = (excercise) => {
    request.delete("Excerciseplanlist/deleteExcerciseplanlist",{params:{ sid:excercise.sid,wid:excercise.wid,
      actionname:excercise.actionname}
    }).then((res)=>{
      if (res.code === '200') {
        refreshData()
        ElMessage.success("删除计划成功")
      } else {
        ElMessage.error(res.msg);
      }
    })
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const fast = ['breakfast', 'lunch', 'dinner']
// 活动日的训练项目
const activeDayExercises = computed(() => {
  return exercises[days[activeDay.value]]
})

// 活动日完成率
const activeDayCompletion = computed(() => {
  const completed = activeDayExercises.value.filter(e => e.isok).length
  const total = activeDayExercises.value.length
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

// 活动日预计时间
const activeDayTime = computed(() => {
  return activeDayExercises.value.reduce((sum, exercise) => sum + (exercise.plantime || 0), 0)
})

// 更新完成率到周数据
const updateWeekCompletion = () => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  for (let i = 0; i < 7; i++) {
    const dayExercises = exercises[days[i]]
    const completed = dayExercises.filter(e => e.completed).length
    const total = dayExercises.length
    weekDays[i].completion = total > 0 ? Math.round((completed / total) * 100) : 0
    weekDays[i].completed = weekDays[i].completion === 100
  }
}

// 当活动日改变时更新完成率
watch(activeDay, () => {
  updateWeekCompletion()
})

// 当训练项目完成改变时更新完成率
watch(() => exercises, () => {
  updateWeekCompletion()
}, { deep: true })

// 添加餐食表单状态
const showAddForm = ref(null) // 'breakfast', 'lunch', 'dinner' 或 null

//餐食参数
const newMeal = reactive({
  sid:0,
  wid:'',
  did:'',
  fastname: '',
  calorie: 0,
  carbohydrate: 0,
  protein: 0
})

// 显示添加餐食表单
const showAddMealForm = (mealType) => {
  showAddForm.value = mealType
  resetMealForm()
}

// 添加新餐食
const addNewMeal = (mealType) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayKey = days[activeDay.value]
  newMeal.sid=data.user.id;
  newMeal.wid=dayKey;
  newMeal.did=mealType;
  request.post("fastplanlist/insertfastplan",newMeal).then((res)=>{
    if (res.code === '200') {
      ElMessage.success("添加餐食成功")
      resetMealForm()
      refreshData()
    } else {
      ElMessage.error(res.msg);
    }
  })

  // 重置表单
  resetMealForm()
  showAddForm.value = null
}

// 删除餐食
const deleteMeal = (mealType, index,fastname) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayKey = days[activeDay.value]

  //删除菜单
  request.delete("fastplanlist/deletefastplan", {
    params: { sid:data.user.id , wid: dayKey, did: mealType,fastname: fastname }
  }).then((res) => {
    if (res.code === '200') {
      ElMessage.success("删除成功")
      resetMealForm()
      refreshData()
    } else {
      ElMessage.error(res.msg);
    }
  });
}

// 重置餐食表单
const resetMealForm = () => {
  Object.assign(newMeal, {
    fastname: '',
    description: '',
    calorie: 0,
    carbohydrate: 0,
    protein: 0
  })
}

// 取消添加餐食
const cancelAddMeal = () => {
  resetMealForm()
  showAddForm.value = null
}


let sid=ref(null);

//刷新数据
const refreshData = () => {
  sid.value = data.user.id;
  // 双重循环遍历所有日期和餐食类型
  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < fast.length; j++) {
      const wid = days[i];
      const did= fast[j];
      request.get("fastplanlist/selectfastplan", {
        params: { sid: sid.value, wid: wid, did: did }
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
  //获取训练计划的数据
  for (let i = 0; i < days.length; i++) {
    const wid = days[i];
    request.get("Excerciseplanlist/selectExcerciseplanlist",{params:{sid:sid.value,wid:wid }
    }).then((res)=>{
      if (res.code === '200') {
        // 将返回的数据赋值到对应的饮食计划中
        exercises[wid] = res.data;
      } else {
        ElMessage.error(res.msg);
      }
    })
  }
  updateWeekCompletion()
}


// AI饮食识别跳转
const goToFoodRecognition = () => {
  window.location.href = '/food-recognition'
}

// AI动作计数跳转
const goToExerciseTracking = () => {
  router.push('/exercise-tracking')
}

onMounted(async () => {
  window.scrollTo(0,0)
  if(data.user===null){
    window.location="/login"
  }
  refreshData()
})

</script>

<style scoped>
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
  color: #e9eee7;
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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.training-app {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

.main-container {
  display: flex;
  gap: 25px;
  margin: 0;
  padding: 20px;
  width: 100%;
}

section {
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  background: white;
  transition: transform 0.3s ease;
}

section:hover {
  transform: translateY(-5px);
}

.training-plan {
  flex: 6;
  border-top: 5px solid #27ae60;
  display: flex;
  flex-direction: column;
}

.diet-plan {
  flex: 4;
  border-top: 5px solid #2ecc71;
}

/* 周计划导航栏 */
.week-navigation {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.week-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.week-dates {
  font-size: 1rem;
  color: #7f8c8d;
  font-weight: 500;
}

.days-container {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.day-card {
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 15px 5px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #e0e0e0;
  position: relative;
}

.day-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.day-card.active {
  background: linear-gradient(to bottom, #eafaf1, #d4f5e1);
  border: 2px solid #27ae60;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.15);
}

.day-card.completed {
  background: linear-gradient(to bottom, #eafaf1, #d4f5e1);
}

.day-card.today {
  border: 2px solid #ff9800;
  background: linear-gradient(to bottom, #fff8e1, #ffecb3);
}

.day-card.today::after {
  content: '今天';
  position: absolute;
  top: -8px;
  right: 10px;
  background: #ff9800;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.day-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.day-date {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.day-stats {
  min-height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.completion-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #27ae60;
}

.completion-percent {
  font-size: 0.8rem;
  font-weight: 600;
  color: #27ae60;
  margin-left: 5px;
}

/* 训练内容 */
.training-content {
  flex: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ecf0f1;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
}

.day-stats-summary {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #27ae60;
}

.stat-label {
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* 添加按钮样式 */
.add-button {
  background: linear-gradient(to right, #2ecc71, #1abc9c);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(46, 204, 113, 0.4);
}

/* 图标样式 */
.icon {
  font-size: 1.2rem;
  vertical-align: middle;
}

.info-icon {
  font-size: 1rem;
  margin-right: 5px;
}

.watch-icon {
  font-size: 1rem;
  margin-right: 5px;
}

.delete-icon {
  font-size: 1rem;
}

.quote-icon {
  font-size: 1.2rem;
  color: #2ecc71;
  margin: 0 5px;
}

/* 添加表单样式 */
.add-exercise-section, .add-meal-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.2);
  outline: none;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.cancel-button, .save-button {
  padding: 8px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
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

/* 固定高度的训练项目区域 */
.training-items-container {
  margin-bottom: 25px;
}

.training-items {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 320px; /* 固定高度 */
  display: flex;
  flex-direction: column;
}

.training-items.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #f8f9fa, #eafaf1);
}

.no-exercises {
  text-align: center;
  padding: 20px;
}

.no-exercises-icon {
  font-size: 3rem;
  color: #2ecc71;
  margin-bottom: 15px;
}

.no-exercises-text {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.no-exercises-hint {
  font-size: 1rem;
  color: #7f8c8d;
  max-width: 300px;
  line-height: 1.5;
}

.training-items-scroll {
  overflow-y: auto;
  height: 100%;
  padding-right: 10px;
}

/* 自定义滚动条 */
.training-items-scroll::-webkit-scrollbar {
  width: 8px;
}

.training-items-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.training-items-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.training-items-scroll::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.training-item {
  display: flex;
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid #27ae60;
}

.training-item:last-child {
  margin-bottom: 0;
}

.training-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.exercise-content {
  flex: 1;
  padding-right: 20px;
}

.exercise-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.exercise-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-right: 15px;
}

.exercise-details {
  display: flex;
  flex-direction: column;
}

.exercise-info {
  display: flex;
  font-size: 0.95rem;
  color: #7f8c8d;
  margin-bottom: 10px;
  gap: 15px;
}

.exercise-info span {
  display: flex;
  align-items: center;
}
.exercise-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 180px;
  border-left: 1px solid #e0e0e0;
  padding-left: 20px;
  gap: 15px;
}

.completed-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.completed-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #27ae60;
  cursor: pointer;
}

.completed-toggle input[type="checkbox"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.completed-toggle label {
  font-size: 1rem;
  color: #2c3e50;
  cursor: pointer;
  font-weight: 500;
}

.completed-toggle input[type="checkbox"]:disabled + label {
  color: #7f8c8d;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.watch-button {
  background: linear-gradient(to right, #2ecc71, #1abc9c);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
}

.watch-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(46, 204, 113, 0.4);
}

.delete-button {
  background: #ff6b6b;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: #ff5252;
  transform: scale(1.05);
}

/* 进度条动画 */
.progress-container {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 2px solid #ecf0f1;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-title {
  font-weight: 600;
  color: #2c3e50;
}

.progress-percent {
  font-weight: 700;
  color: #27ae60;
}

.progress-bar {
  height: 10px;
  background: #ecf0f1;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #2ecc71, #1abc9c);
  border-radius: 5px;
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 饮食计划部分 */
.meal-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.meal-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.meal-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
}

.add-meal-form {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  margin: 15px 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.no-meals {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  margin: 15px 0;
}

.no-meals-icon {
  font-size: 2.5rem;
  color: #2ecc71;
  margin-bottom: 10px;
}

.no-meals-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.no-meals-hint {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.meal-card {
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 3px solid #2ecc71;
}

.meal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.meal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.meal-card-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #27ae60;
  display: flex;
  align-items: center;
}

.meal-card-content {
  padding-left: 5px;
}

.nutrient-info {
  display: flex;
  margin-top: 10px;
  font-size: 0.85rem;
  color: #7f8c8d;
  flex-wrap: wrap;
  gap: 15px;
}

.nutrient-info span {
  display: flex;
  align-items: center;
}

.delete-meal-button {
  background: #ff6b6b;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
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

.motivation {
  text-align: center;
  font-style: italic;
  color: #7f8c8d;
  margin-top: 25px;
  padding: 15px;
  background: #eafaf1;
  border-radius: 10px;
  font-size: 1.1rem;
}

/* AI饮食识别入口 */
.ai-diet-entry {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border: 1px solid #a5d6a7;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-diet-entry:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.25);
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
}

.ai-diet-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);
}

.ai-diet-text {
  flex: 1;
}

.ai-diet-title {
  font-size: 15px;
  font-weight: 700;
  color: #1b5e20;
  margin-bottom: 3px;
}

.ai-diet-desc {
  font-size: 12px;
  color: #388e3c;
}

.ai-diet-arrow {
  font-size: 18px;
  color: #43a047;
  transition: transform 0.3s ease;
}

.ai-diet-entry:hover .ai-diet-arrow {
  transform: translateX(4px);
}

/* AI 动作计数入口 */
.ai-workout-entry {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 14px;
  padding: 14px 18px;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-workout-entry:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.25);
  background: linear-gradient(135deg, #16213e, #1a1a2e);
}

.ai-workout-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2e7d32, #4caf50);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.ai-workout-text {
  flex: 1;
}

.ai-workout-title {
  font-size: 15px;
  font-weight: 700;
  color: #81c784;
  margin-bottom: 3px;
}

.ai-workout-desc {
  font-size: 12px;
  color: #a5d6a7;
}

.ai-workout-arrow {
  font-size: 18px;
  color: #4caf50;
  transition: transform 0.3s ease;
}

.ai-workout-entry:hover .ai-workout-arrow {
  transform: translateX(4px);
}

.quote-icon {
  color: #2ecc71;
  margin: 0 5px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .days-container {
    flex-wrap: wrap;
  }

  .day-card {
    min-width: calc(33.33% - 10px);
    margin-bottom: 10px;
  }

  .training-item {
    flex-direction: column;
  }

  .exercise-actions {
    border-left: none;
    border-top: 1px solid #e0e0e0;
    padding-top: 15px;
    padding-left: 0;
    margin-top: 15px;
    width: 100%;
  }

  .nutrient-info {
    flex-direction: column;
    gap: 5px;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .watch-button, .delete-button {
    width: 100%;
    border-radius: 25px;
  }

  .delete-button {
    height: auto;
    padding: 8px;
  }

  .meal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }

  .training-items {
    height: 280px; /* 在移动设备上稍微降低高度 */
  }
}
</style>