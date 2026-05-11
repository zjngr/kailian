<template>
  <!-- 主聊天面板容器 -->
  <div class="chat-panel">
    <!-- 健康风格聊天容器 -->
    <div class="chat-container">
      <!-- 顶部装饰 -->
      <div class="chat-background"></div>

      <!-- 标题区域 - 健康主题样式 -->
      <div class="chat-title">
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
          <span style="font-weight:bold;letter-spacing:2px;color:#2e7d32;">健康生活智能助手</span>
          <el-tooltip content="历史会话" placement="bottom">
            <button class="title-btn" @click="showHistoryDrawer = true">
              <el-icon :size="18"><Clock /></el-icon>
            </button>
          </el-tooltip>
          <el-tooltip content="新会话" placement="bottom">
            <button class="title-btn" @click="newChat">
              <el-icon :size="18"><Plus /></el-icon>
            </button>
          </el-tooltip>
        </div>
        <div class="title-divider"></div>
      </div>

      <!-- 消息显示区域 -->
      <div ref="messagePanelRef" class="message-panel">
        <div class="message-list">
          <div :class="['message-item', item.type == 1 ? 'ai-item' : 'user-item']" v-for="(item, index) in messageList" :id="'item' + index" :key="item.id">
            <!-- 用户消息模板 - 头像在右侧 -->
            <template v-if="item.type == 0">
              <div class="message-content user-content">
                <div class="user-info">
                  <img :src="data.user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="user-avatar">
                </div>
                <div class="content-inner user-bubble">
                  <div v-if="!item.editing" class="message-text">{{ item.content }}</div>
                  <div v-else style="margin-top: 10px;">
                    <el-input type="textarea" :rows="3" v-model="item.editContent" placeholder="编辑您的问题..." style="margin-bottom: 10px;width:600px" ref="editInputRefs"></el-input>
                    <div style="display: flex;justify-content: flex-end;gap: 10px;">
                      <el-button size="small" @click="cancelEdit(item)">取消</el-button>
                      <el-button type="primary" size="small" @click="saveEdit(item)">保存</el-button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="message-actions user-actions">
                <el-tooltip content="复制" placement="top">
                  <div class="action-btn copy-btn" @click="copyMessage(item.content, index)" :class="{ copied: item.copied }">
                    <el-icon><CopyDocument /></el-icon>
                  </div>
                </el-tooltip>
                <el-tooltip content="编辑" placement="top" v-if="!item.editing">
                  <div class="action-btn edit-btn" @click="startEdit(item)" style="margin-right:65px">
                    <el-icon><Edit /></el-icon>
                  </div>
                </el-tooltip>
              </div>
            </template>

            <!-- AI消息模板 - 头像在左侧 -->
            <template v-else>
              <div class="message-content ai-content">
                <div class="ai-info" style=" margin-right: 15px;min-width: 60px;">
                  <div class="ai-icon">小健</div>
                </div>
                <div class="ai-bubble">
                  <MdPreview previewTheme="vuepress" :codeFoldable="false" editorId="preview" :modelValue="item.content.join('')"/>

                  <!-- 训练计划操作按钮 -->
                  <div v-if="item.showPlanActions" style="margin-top:15px;padding-top:15px;border-top:1px dashed #c8e6c9;">
                    <div style="font-size:14px;font-weight:600;color:#2e7d32;margin-bottom:12px;">
                      <el-icon><List /></el-icon> 训练计划操作
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                      <el-radio-group v-model="item.downloadFormat" size="small" style="margin-right: 10px;">
                        <el-radio-button label="excel">Excel格式</el-radio-button>
                        <el-radio-button label="pdf">PDF格式</el-radio-button>
                      </el-radio-group>
                      <el-button type="success" size="small" :disabled="planLoading" @click="downloadPlan(item)">
                        <el-icon><Download /></el-icon> 下载{{ item.downloadFormat === 'excel' ? 'Excel' : 'PDF' }}
                      </el-button>
                      <el-button type="primary" size="small" :disabled="planLoading" @click="savePlanToDb(item)">
                        <el-icon><Upload /></el-icon> 保存到我的计划
                      </el-button>
                    </div>
                  </div>

                  <!-- PDF 内联预览 -->
                  <div v-if="item.planPreviewUrl" style="margin-top:15px;border:1px solid #c8e6c9;border-radius:8px;overflow:hidden;">
                    <div style="background:#e8f5e9;padding:6px 12px;font-size:13px;color:#2e7d32;font-weight:600;">
                      <el-icon><Document /></el-icon> 训练计划预览
                    </div>
                    <iframe :src="item.planPreviewUrl" style="width:100%;height:500px;border:none;"></iframe>
                  </div>

                  <!-- 普通文件下载按钮 -->
                  <div style="margin-top:15px;text-align: right;animation: fadeIn 0.5s ease-out;" v-if="!item.showPlanActions && hasTableContent(item.content.join(''))" >
                    <el-radio-group v-model="item.downloadFormat" size="small" style="margin-right: 10px;">
                      <el-radio-button label="excel">Excel格式</el-radio-button>
                      <el-radio-button label="pdf">PDF格式</el-radio-button>
                    </el-radio-group>
                    <el-button type="success" size="small" :disabled="loading" @click="downloadFile(item.content.join(''), item.downloadFormat)">
                      <i class="el-icon-download"></i> 下载{{ item.downloadFormat === 'excel' ? 'Excel' : 'PDF' }}版本
                    </el-button>
                  </div>

                  <!-- 后续问题 -->
                  <div v-if="item.followUpQuestions && !item.loading&&!showQuickQuestions.value&&index!=0" style="margin-top:20px;padding-top: 15px;border-top: 1px dashed #c8e6c9;">
                    <div style="font-size:14px;color: #4caf50;margin-bottom:  10px;">您可能还想问：</div>
                    <div style="display: flex;gap: 10px;flex-wrap: wrap;">
                      <el-tag v-for="(question, qIndex) in item.followUpQuestions" :key="qIndex" @click="sendFollowUpQuestion(question)" class="question-tag">
                        {{ question }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="loading" v-if="item.loading">
                    <div class="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="message-actions ai-actions">
                <el-tooltip content="复制" placement="top">
                  <div class="action-btn copy-btn" @click="copyMessage(item.content.join(''), index)" :class="{ copied: item.copied }" v-if="!item.loading" style="margin-left:65px">
                    <el-icon><CopyDocument /></el-icon>
                  </div>
                </el-tooltip>
                <el-tooltip content="重新生成" placement="top" v-if="!item.loading">
                  <div class="action-btn regenerate-btn" @click="regenerateAnswer(index)">
                    <el-icon><Refresh /></el-icon>
                  </div>
                </el-tooltip>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 快捷问题提示 -->
      <div style="padding:15px 35px;background: #f1f8e9;border-top: 1px solid #c8e6c9;border-bottom: 1px solid #c8e6c9;" v-if="showQuickQuestions && messageList.length === 1">
        <div style="font-size: 14px;color: #4caf50;margin-bottom: 10px;">快捷提问：</div>
        <div  style="display: flex;gap: 10px;flex-wrap: wrap;">
          <el-tag v-for="(question, index) in quickQuestions" :key="index"
                  @click="sendQuickQuestion(question)" class="question-tag">{{ question }}
          </el-tag>
        </div>
      </div>

      <!-- 输入框区域 -->
      <div style="padding:15px 2px;background: rgba(241, 248, 233, 0.95);border-top: 1px solid #c8e6c9;box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.05);">
        <el-form :model="formData" ref="formDataRef" @submit.prevent>
          <el-form-item label="" prop="content" style="position: relative;">
            <el-input type="textarea" :rows="3" clearable placeholder="请输入关于健康生活的问题..." v-model="formData.content"
                      @keyup.ctrl.enter="sendMessage" class="message-input">
            </el-input>
            <div style="position: absolute;bottom: 12px;right: 15px;font-size: 13px;color: #689f38;background: rgba(255, 255, 255, 0.7);
            padding: 2px 10px;border-radius: 8px;">按 Ctrl + Enter 发送</div>
          </el-form-item>
          <div style="display: flex;justify-content: flex-end;gap: 15px;padding-top: 15px;">
            <el-button type="warning" @click="stopGenerating" :disabled="!loading" class="action-btn1 stop-btn">停止回答</el-button>
            <el-button type="success" @click="sendMessage" :disabled="loading" class="action-btn1 send-btn">发送</el-button>
          </div>
        </el-form>
      </div>
    </div>

    <!-- ===== 训练计划配置弹窗 ===== -->
    <el-dialog v-model="planDialogVisible" title="生成训练计划" width="520px" :close-on-click-modal="false" destroy-on-close>
      <div class="plan-dialog-body">
        <p style="color:#666;margin-bottom:20px;">请选择您的训练需求，AI将为您量身定制周训练计划</p>

        <div class="plan-field">
          <label class="plan-label">
            <el-icon :size="16"><User /></el-icon> 训练部位
          </label>
          <el-radio-group v-model="planForm.location" class="plan-tags">
            <el-radio-button value="腿部">腿部</el-radio-button>
            <el-radio-button value="背部">背部</el-radio-button>
            <el-radio-button value="胸部">胸部</el-radio-button>
            <el-radio-button value="肩部">肩部</el-radio-button>
          </el-radio-group>
        </div>

        <div class="plan-field">
          <label class="plan-label">
            <el-icon :size="16"><TrendCharts /></el-icon> 训练目标
          </label>
          <el-radio-group v-model="planForm.goal" class="plan-tags">
            <el-radio-button value="增肌">增肌</el-radio-button>
            <el-radio-button value="塑形">塑形</el-radio-button>
            <el-radio-button value="燃脂">燃脂</el-radio-button>
            <el-radio-button value="放松">放松</el-radio-button>
          </el-radio-group>
        </div>

        <div class="plan-field">
          <label class="plan-label">
            <el-icon :size="16"><Setting /></el-icon> 训练器械
          </label>
          <el-radio-group v-model="planForm.tool" class="plan-tags">
            <el-radio-button value="无器械">无器械</el-radio-button>
            <el-radio-button value="有器械">有器械</el-radio-button>
            <el-radio-button value="哑铃">哑铃</el-radio-button>
            <el-radio-button value="杠铃">杠铃</el-radio-button>
          </el-radio-group>
        </div>

        <div class="plan-field">
          <label class="plan-label">
            <el-icon :size="16"><Document /></el-icon> 导出格式
          </label>
          <el-radio-group v-model="planForm.format" class="plan-tags">
            <el-radio-button value="excel">Excel</el-radio-button>
            <el-radio-button value="pdf">PDF</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="planDialogVisible = false">取消</el-button>
        <el-button type="success" @click="generatePlan" :loading="planLoading" class="generate-plan-btn">
          <el-icon><MagicStick /></el-icon> 开始生成
        </el-button>
      </template>
    </el-dialog>

    <!-- ===== 保存成功提示弹窗 ===== -->
    <el-dialog v-model="saveSuccessVisible" title="保存成功" width="400px">
      <div style="text-align:center;padding:20px 0;">
        <el-icon :size="64" color="#67c23a"><SuccessFilled /></el-icon>
        <p style="font-size:18px;font-weight:600;color:#333;margin:16px 0 8px;">训练计划已保存</p>
        <p style="color:#999;font-size:14px;">计划已保存到「我的训练」中，您可以在页面中随时查看</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="saveSuccessVisible = false">知道了</el-button>
      </template>
    </el-dialog>

    <!-- ===== 历史会话抽屉 ===== -->
    <el-drawer v-model="showHistoryDrawer" title="历史会话" direction="ltr" size="320px">
      <div class="history-drawer-body">
        <div v-if="chatHistory.length === 0" class="history-empty">
          <el-icon :size="48" color="#c8e6c9"><ChatDotSquare /></el-icon>
          <p>暂无历史会话记录</p>
        </div>
        <div v-else class="history-list">
          <div v-for="(chat, index) in chatHistory" :key="chat.id" class="history-item" @click="loadChat(chat.id)">
            <div class="history-item-main">
              <div class="history-item-title">{{ chat.title }}</div>
              <div class="history-item-meta">
                <span>{{ chat.messageCount }}条消息</span>
                <span>{{ formatTime(chat.timestamp) }}</span>
              </div>
            </div>
            <button class="history-del-btn" @click.stop="deleteChat(chat.id, index)" title="删除">
              <el-icon><Delete /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import request from "@/utils/request.js";
import { ElMessage } from 'element-plus';
import router from "@/router/index.js";
import {ref, reactive, getCurrentInstance, nextTick, onMounted, onUpdated, onBeforeUnmount} from 'vue';

const { proxy } = getCurrentInstance();
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
});

if(!data.user){
  router.push('/login')
}

const formData = ref({ content: '' });
const currentChatId = ref(null); // null = new unsaved chat
const showHistoryDrawer = ref(false);
const chatHistory = ref(loadHistoryFromStorage());

const messageList = ref([
  {
    type: 1,
    content: ['您好！我是健康生活智能助手小健，专注于提供健康生活方式建议。\n我的能力主要包括：\n1. 饮食建议：提供均衡饮食和营养搭配方案\n2. 运动指导：推荐适合不同人群的锻炼方式\n3. 训练计划：针对性制定周训练计划并生成PDF/Excel\n4. 人像识别：通过摄像头分析体态、体型，给出健康建议\n5. 作息优化：帮助制定科学的作息时间表\n6. 疾病预防：分享常见健康问题的预防方法\n\n您可以输入"我要生成训练计划"生成专属计划，或输入"人像识别"进行AI体态分析！'],
    loading: false,
    id: Date.now(),
    followUpQuestions: [],
    downloadFormat: 'excel'
  }
]);
const loading = ref(false);
const planLoading = ref(false);
const messagePanelRef = ref(null);
const showQuickQuestions = ref(true);
let eventSource = null;
const editInputRefs = ref([]);
const shouldAutoScroll = ref(true);

// 训练计划相关
const planDialogVisible = ref(false);
const saveSuccessVisible = ref(false);
const planForm = ref({
  location: '胸部',
  goal: '增肌',
  tool: '哑铃',
  format: 'excel'
});
const currentPlanMessage = ref(null);

const quickQuestions = ref([
  "如何开始健康饮食？",
  "适合办公室的简单运动有哪些？",
  "如何改善睡眠质量？",
  "减压的有效方法有哪些？",
  "我要生成训练计划",
  "人像识别"
]);

const sendQuickQuestion = (question) => {
  formData.value.content = question;
  if (question.includes('训练计划')) {
    showQuickQuestions.value = false;
    planDialogVisible.value = true;
    formData.value.content = '';
    return;
  }
  sendMessage();
  showQuickQuestions.value = false;
};

const sendFollowUpQuestion = (question) => {
  formData.value.content = question;
  if (question.includes('训练计划') || question.includes('生成计划')) {
    planDialogVisible.value = true;
    formData.value.content = '';
    return;
  }
  sendMessage();
};

const copyMessage = async (content, index) => {
  try {
    await navigator.clipboard.writeText(content);
    messageList.value[index].copied = true;
    ElMessage.success('已复制到剪贴板');
    setTimeout(() => {
      if (messageList.value[index]) {
        messageList.value[index].copied = false;
      }
    }, 1000);
  } catch (err) {
    ElMessage.error('复制失败'+err);
  }
};

const startEdit = (item) => {
  shouldAutoScroll.value=false;
  item.editing = true;
  item.editContent = item.content;
  nextTick(() => {
    const index = messageList.value.findIndex(msg => msg.id === item.id);
    if (editInputRefs.value[index] && editInputRefs.value[index].focus) {
      editInputRefs.value[index].focus();
    }
  });
};

const cancelEdit = (item) => {
  shouldAutoScroll.value = false;
  item.editing = false;
  item.editContent = '';
  setTimeout(() => { shouldAutoScroll.value = true; }, 100);
};

const saveEdit = (item) => {
  if (!item.editContent || item.editContent.trim() === '') {
    ElMessage.warning('请输入内容');
    return;
  }
  item.content = item.editContent;
  item.editing = false;
  item.editContent = '';
  formData.value.content = item.content;
  sendMessage();
};

const regenerateAnswer = (index) => {
  if (index > 0 && messageList.value[index - 1].type === 0) {
    const userMessage = messageList.value[index - 1].content;
    formData.value.content = userMessage;
    sendMessage();
  } else {
    ElMessage.warning('无法重新生成回答');
  }
};

const sendMessage = () => {
  const message = formData.value.content;
  if (!message) {
    ElMessage({ type: 'warning', message: '请输入内容', duration: 2000 });
    return;
  }

  // 检测是否与人像识别/体态分析相关
  if (/人像识别|体态分析|身体评估|体态识别|健康评估/i.test(message)) {
    router.push('/body-recognition')
    formData.value.content = ''
    return
  }

  // 检测是否与训练计划相关
  if (/训练计划|生成计划|健身计划|制定计划|周计划/i.test(message)) {
    planDialogVisible.value = true;
    formData.value.content = '';
    return;
  }

  messageList.value.push({
    type: 0,
    content: message,
    id: Date.now() + 1,
    editing: false,
    editContent: '',
    copied: false
  });

  messageList.value.push({
    type: 1,
    content: [],
    loading: true,
    id: Date.now() + 2,
    followUpQuestions: [],
    copied: false,
    downloadFormat: 'excel',
    showPlanActions: false
  });
  loading.value = true;

  scrollToBottom();

  if (eventSource) eventSource.close();

  eventSource = new EventSource(`http://localhost:9090/api/stream?message=${encodeURIComponent(message)}`);
  formData.value.content = '';

  eventSource.onmessage = (event) => {
    let response = event.data;
    if (response === 'end') {
      eventSource.close();
      const lastMessage = messageList.value[messageList.value.length - 1];
      const fullContent = lastMessage.content.join('');
      lastMessage.showPdfButton = fullContent.includes('[系统提示：此内容适合表格展示]');
      generateAiFollowUpQuestions(fullContent);
      return;
    }
    try {
      const data = JSON.parse(response);
      if (data && data.content) {
        messageList.value[messageList.value.length - 1].content.push(data.content);
        scrollToBottom();
      }
    } catch (error) {
      console.error('解析消息错误:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('EventSource错误:', error);
    if (eventSource) eventSource.close();
    if (messageList.value.length > 0 && messageList.value[messageList.value.length - 1].loading) {
      messageList.value[messageList.value.length - 1].loading = false;
      messageList.value[messageList.value.length - 1].content.push('\n\n[回答已中断]');
    }
    loading.value = false;
    scrollToBottom();
  };
};

const generateAiFollowUpQuestions = async (lastMessage) => {
  request.post('/api/generate-questions', JSON.stringify({message:lastMessage}))
    .then((res) => {
      if (res.code === '200') {
        if (messageList.value.length > 0) {
          const lastItem = messageList.value[messageList.value.length - 1];
          lastItem.followUpQuestions = res.data;
          lastItem.loading = false;
          loading.value = false;
          scrollToBottom();
          saveCurrentChat();
        }
      } else { throw new Error(res.msg || '生成后续问题失败'); }
    })
    .catch(error => {
      console.error('生成后续问题失败:', error);
      if (messageList.value.length > 0) {
        const lastItem = messageList.value[messageList.value.length - 1];
        lastItem.followUpQuestions = [
          "健康习惯具体要如何开始执行",
          "可以做哪些简单的健康运动",
          "有哪些替代方案或妥协建议？",
          "我要生成训练计划"
        ];
        lastItem.loading = false;
        loading.value = false;
        scrollToBottom();
        saveCurrentChat();
      }
    });
};

// ===== 历史会话管理 =====
const STORAGE_KEY = 'ai_chat_history'
const SESSION_KEY = 'ai_current_session'

function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory.value))
  } catch (e) {
    console.error('保存历史记录失败:', e)
  }
}

function getHistoryTitle() {
  for (const msg of messageList.value) {
    if (msg.type === 0 && msg.content) {
      const t = msg.content.trim()
      return t.length > 30 ? t.slice(0, 30) + '...' : t
    }
  }
  return '新会话'
}

function saveCurrentChat() {
  // Don't save if only the welcome message exists
  if (messageList.value.length <= 1) return

  const title = getHistoryTitle()
  const messages = messageList.value.map(m => ({
    type: m.type,
    content: m.type === 1 ? (Array.isArray(m.content) ? m.content : [m.content]) : m.content,
    id: m.id,
    followUpQuestions: m.followUpQuestions || [],
    downloadFormat: m.downloadFormat || 'excel',
    showPlanActions: m.showPlanActions || false,
    planPreviewUrl: m.planPreviewUrl || '',
    planFileId: m.planFileId || ''
  }))

  if (currentChatId.value) {
    // Update existing chat
    const idx = chatHistory.value.findIndex(c => c.id === currentChatId.value)
    if (idx !== -1) {
      chatHistory.value[idx].title = title
      chatHistory.value[idx].messages = messages
      chatHistory.value[idx].messageCount = messages.length
      chatHistory.value[idx].timestamp = Date.now()
    } else {
      currentChatId.value = null
    }
  }

  if (!currentChatId.value) {
    // Create new chat
    const entry = {
      id: Date.now(),
      title,
      messages,
      messageCount: messages.length,
      timestamp: Date.now()
    }
    chatHistory.value.unshift(entry)
    currentChatId.value = entry.id
  }

  saveHistoryToStorage()
}

function loadChat(id) {
  const entry = chatHistory.value.find(c => c.id === id)
  if (!entry) return

  // Confirm if current chat has content
  if (messageList.value.length > 1) {
    saveCurrentChat()
  }

  // Restore messages
  messageList.value = entry.messages.map(m => ({
    type: m.type,
    content: m.type === 1 ? (Array.isArray(m.content) ? [...m.content] : [m.content]) : m.content,
    id: m.id || Date.now(),
    loading: false,
    editing: false,
    editContent: '',
    copied: false,
    followUpQuestions: m.followUpQuestions || [],
    downloadFormat: m.downloadFormat || 'excel',
    showPlanActions: m.showPlanActions || false,
    planPreviewUrl: m.planPreviewUrl || '',
    planFileId: m.planFileId || ''
  }))

  // Don't set currentChatId — keeps loaded history as read-only snapshot.
  // Any new messages will create a fresh history entry on save,
  // preserving the original history intact.
  currentChatId.value = null
  showHistoryDrawer.value = false
  showQuickQuestions.value = false
  nextTick(scrollToBottom)
}

function newChat() {
  if (messageList.value.length > 1) {
    saveCurrentChat()
  }

  clearSession() // 清除持久化的会话，下次进入显示欢迎页

  // Reset to welcome message
  messageList.value = [{
    type: 1,
    content: ['您好！我是健康生活智能助手小健，专注于提供健康生活方式建议。\n我的能力主要包括：\n1. 饮食建议：提供均衡饮食和营养搭配方案\n2. 运动指导：推荐适合不同人群的锻炼方式\n3. 训练计划：针对性制定周训练计划并生成PDF/Excel\n4. 人像识别：通过摄像头分析体态、体型，给出健康建议\n5. 作息优化：帮助制定科学的作息时间表\n6. 疾病预防：分享常见健康问题的预防方法\n\n您可以输入"我要生成训练计划"生成专属计划，或输入"人像识别"进行AI体态分析！'],
    loading: false,
    id: Date.now(),
    followUpQuestions: [],
    downloadFormat: 'excel'
  }]
  currentChatId.value = null
  formData.value.content = ''
  showQuickQuestions.value = true
  nextTick(scrollToBottom)
}

function deleteChat(id, index) {
  chatHistory.value.splice(index, 1)
  saveHistoryToStorage()
  if (currentChatId.value === id) {
    currentChatId.value = null
  }
  ElMessage.success('已删除')
}

function formatTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  if (d.toDateString() === now.toDateString()) {
    return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return `昨天 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const stopGenerating = () => {
  if (eventSource) { eventSource.close(); eventSource = null; }
  if (messageList.value.length > 0) {
    const lastItem = messageList.value[messageList.value.length - 1];
    if (lastItem.loading) {
      lastItem.loading = false;
      lastItem.content.push('\n\n[已停止]');
      loading.value = false;
      scrollToBottom();
    }
  }
};

const scrollToBottom = () => {
  if (!shouldAutoScroll.value) return;
  nextTick(() => {
    if (messagePanelRef.value) {
      messagePanelRef.value.scrollTop = messagePanelRef.value.scrollHeight;
    }
  });
};

// ===== 训练计划生成 =====
const generatePlan = async () => {
  planLoading.value = true;

  // 关闭弹窗
  planDialogVisible.value = false;

  // 在聊天中添加用户消息
  const userText = `我要生成训练计划：部位=${planForm.value.location}，目标=${planForm.value.goal}，器械=${planForm.value.tool}`;
  messageList.value.push({
    type: 0,
    content: userText,
    id: Date.now() + 1,
    editing: false,
    editContent: '',
    copied: false
  });

  // 添加AI加载消息
  const aiMsgId = Date.now() + 2;
  messageList.value.push({
    type: 1,
    content: [],
    loading: true,
    id: aiMsgId,
    followUpQuestions: [],
    copied: false,
    downloadFormat: planForm.value.format,
    showPlanActions: false
  });
  loading.value = true;
  scrollToBottom();

  try {
    // 1. 查询动作库
    const queryRes = await request.post('/api/query-actions', {
      location: planForm.value.location,
      goal: planForm.value.goal,
      tool: planForm.value.tool
    });

    // 2. 生成训练计划
    const planRes = await fetch(`http://localhost:9090/api/generate-training-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: planForm.value.location,
        goal: planForm.value.goal,
        tool: planForm.value.tool,
        format: planForm.value.format
      })
    });

    if (!planRes.ok) {
      const errData = await planRes.json().catch(() => ({}));
      throw new Error(errData.error || '生成失败');
    }

    const result = await planRes.json();
    const fileId = result.fileId;
    const format = result.format || planForm.value.format;

    // 3. 构造AI消息内容（简洁提示即可）
    const planSummary = `您的专属训练计划已生成完毕！请在下方操作下载或保存到我的计划。`;

    const aiMsg = messageList.value.find(m => m.id === aiMsgId);
    if (aiMsg) {
      aiMsg.content = [planSummary];
      aiMsg.loading = false;
      aiMsg.showPlanActions = true;
      aiMsg.planFileId = fileId;
      aiMsg.planFormat = format;
      aiMsg.planForm = { ...planForm.value };

      // PDF: HTTP URL (http://localhost:9090) 用于 iframe 预览和 window.open
      // Chrome 对 http:// 来源的 PDF 没有 file:// 安全限制
      if (format === 'pdf') {
        aiMsg.planPreviewUrl = `http://localhost:9090/api/preview/${fileId}`;
      } else {
        // Excel: 从预览端点获取 blob，用于 <a download> 下载
        const fileResp = await fetch(`http://localhost:9090/api/preview/${fileId}`);
        aiMsg.planBlob = await fileResp.blob();
      }
      currentPlanMessage.value = aiMsg;
    }
    loading.value = false;
    scrollToBottom();

    ElMessage.success('训练计划生成成功！');
  } catch (err) {
    console.error('生成训练计划失败:', err);
    const aiMsg = messageList.value.find(m => m.id === aiMsgId);
    if (aiMsg) {
      aiMsg.content = ['训练计划生成失败: ' + err.message + '\n\n请检查后端服务是否正常，或稍后重试。'];
      aiMsg.loading = false;
    }
    loading.value = false;
    ElMessage.error('生成失败: ' + err.message);
    scrollToBottom();
  } finally {
    planLoading.value = false;
  }
};

// 下载训练计划
const downloadPlan = async (item) => {
  const format = item.downloadFormat || item.planFormat || 'excel';
  const ext = format === 'excel' ? 'xlsx' : 'pdf';
  const form = item.planForm || planForm.value;
  const filename = `${form.location}${form.goal}训练计划.${ext}`;

  // PDF: 打开 HTTP URL 新标签（http:// 来源无 file:// 安全限制）
  if (format === 'pdf') {
    if (!item.planPreviewUrl) {
      ElMessage.warning('计划数据不存在，请重新生成');
      return;
    }
    window.open(item.planPreviewUrl, '_blank');
    return;
  }

  // Excel: 使用 blob 触发下载
  if (!item.planBlob) {
    ElMessage.warning('计划数据不存在，请重新生成');
    return;
  }
  const url = window.URL.createObjectURL(item.planBlob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// 保存训练计划到数据库
const savePlanToDb = async (item) => {
  const userIdVal = data.user ? (typeof data.user.id === 'number' ? data.user.id : parseInt(data.user.id)) : 0;
  if (!userIdVal) {
    ElMessage.warning('请先登录');
    return;
  }

  planLoading.value = true;
  try {
    const form = item.planForm || planForm.value;

    const queryRes = await request.post('/api/query-actions', {
      location: form.location,
      goal: form.goal,
      tool: form.tool
    });

    if (queryRes.code !== '200') throw new Error('查询动作库失败');

    const actions = queryRes.data || [];
    if (actions.length === 0) {
      ElMessage.warning('未找到匹配的动作，请调整需求');
      return;
    }

    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const planItems = [];

    for (let dayIdx = 0; dayIdx < weekDays.length; dayIdx++) {
      const day = weekDays[dayIdx];
      if (dayIdx === 6) continue; // 周日休息

      const dayActionCount = 3 + (dayIdx % 2);
      for (let i = 0; i < dayActionCount; i++) {
        const actionIdx = (dayIdx * 3 + i) % actions.length;
        const action = actions[actionIdx];
        planItems.push({
          wid: day,
          actionname: action.name,
          actiontimes: '4组x12次',
          freetime: 60,
          calorie: 80 + Math.floor(Math.abs(action.name.length * 37) % 200),
          plantime: 15 + Math.floor(Math.abs(action.name.length * 13) % 30),
          video: action.video || ''
        });
      }
    }

    const saveRes = await request.post('/api/save-plan', {
      userId: userIdVal,
      planItems: planItems
    });

    if (saveRes.code === '200') {
      saveSuccessVisible.value = true;
    } else {
      ElMessage.error(saveRes.msg || '保存失败');
    }
  } catch (err) {
    console.error('保存计划失败:', err);
    ElMessage.error('保存失败: ' + err.message);
  } finally {
    planLoading.value = false;
  }
};

// ===== 原有文件下载 =====
const downloadFile = async (content, format) => {
  try {
    loading.value = true;
    let cleanContent = content;
    if (content.includes('[系统提示：此内容适合表格展示')) {
      cleanContent = content.split('[系统提示：此内容适合表格展示')[0].trim();
    }
    if (!cleanContent || cleanContent.trim().length === 0) {
      ElMessage.warning('没有可下载的内容');
      return;
    }
    const endpoint = format === 'excel' ? '/api/generate-excel' : '/api/generate-pdf';
    const response = await fetch(`http://localhost:9090${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({content: cleanContent}),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP错误! 状态码: ${response.status}, 详情: ${errorText}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = extractFirstLine(cleanContent)+`.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ElMessage.success(`${format === 'excel' ? 'Excel' : 'PDF'}下载成功！`);
  } catch (error) {
    console.error('文件下载详细错误:', error);
    ElMessage.error(`下载失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

const hasTableContent = (content) => {
  if (content.includes('[系统提示：此内容适合表格展示]')) return true;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].trim().startsWith('|') && lines[i].includes('|')) {
      if (lines[i + 1] && lines[i + 1].includes('|') && lines[i + 1].includes('---')) return true;
    }
  }
  return false;
};

const extractFirstLine = (content) => {
  if (!content) return '文档';
  const lines = content.split('\n');
  for (let line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 0) return trimmedLine;
  }
  return '文档';
};

// ===== 会话持久化：切页面回来后恢复 =====
function saveSession() {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      messages: messageList.value.map(m => ({
        type: m.type,
        content: m.type === 1 ? (Array.isArray(m.content) ? m.content : [m.content]) : m.content,
        id: m.id,
        followUpQuestions: m.followUpQuestions || [],
        downloadFormat: m.downloadFormat || 'excel',
        showPlanActions: m.showPlanActions || false,
        planPreviewUrl: m.planPreviewUrl || '',
        planFileId: m.planFileId || ''
      })),
      showQuickQuestions: showQuickQuestions.value,
      timestamp: Date.now()
    }))
  } catch (e) { console.error('保存会话失败:', e) }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const session = JSON.parse(raw)
    if (!session.messages || session.messages.length === 0) return false

    messageList.value = session.messages.map(m => ({
      type: m.type,
      content: m.type === 1 ? (Array.isArray(m.content) ? [...m.content] : [m.content]) : m.content,
      id: m.id || Date.now(),
      loading: false,
      editing: false,
      editContent: '',
      copied: false,
      followUpQuestions: m.followUpQuestions || [],
      downloadFormat: m.downloadFormat || 'excel',
      showPlanActions: m.showPlanActions || false,
      planPreviewUrl: m.planPreviewUrl || '',
      planFileId: m.planFileId || ''
    }))
    showQuickQuestions.value = session.showQuickQuestions !== undefined ? session.showQuickQuestions : false
    return true
  } catch { return false }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

onMounted(() => {
  // 恢复之前的会话，而不是新建欢迎消息
  if (!loadSession()) {
    scrollToBottom()
  }
  window.scrollTo(0, 0);
  nextTick(scrollToBottom)
});

onBeforeUnmount(() => {
  saveSession()
})

onUpdated(() => {
  if (shouldAutoScroll.value) scrollToBottom();
});
</script>

<style lang="scss" scoped>
/* 健康主题样式 */
.chat-panel {
  background: #e8f5e9;
  padding: 20px;
  box-sizing: border-box;
  min-height: 98vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}

.chat-container {
  height: 90vh;
  min-height: 700px;
  width: 95%;
  max-width: 1400px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.15);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid #c8e6c9;
}

.chat-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/backgroundImage.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.4;
  pointer-events: none;
  filter: blur(0.8px);
}

.chat-title {
  padding: 20px 0;
  text-align: center;
  position: relative;
  color: #2e7d32;
  margin: 25px auto 15px;
  width: 85%;
  max-width: 500px;
  font-size: 24px;
  letter-spacing: 1px;
}

.title-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #4caf50, transparent);
  position: absolute;
  left: 0;
  right: 0;
  bottom: -10px;
  width: 80%;
  margin: 0 auto;
}

.message-panel {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 30px 20px;
  scroll-behavior: smooth;
  position: relative;
}

.message-panel::-webkit-scrollbar { width: 8px; }
.message-panel::-webkit-scrollbar-track { background: #f1f8e9; border-radius: 10px; }
.message-panel::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #4caf50, #2e7d32); border-radius: 10px; }
.message-panel::-webkit-scrollbar-thumb:hover { background: #1b5e20; }

.message-list { margin: 0 auto; width: 100%; padding-bottom: 20px; display: flex; flex-direction: column; gap: 25px; }
.message-item { animation: fadeIn 0.4s ease-out forwards; display: flex; flex-direction: column; }
.message-item.user-item { align-self: flex-end; max-width: 80%; align-items: flex-end; }
.message-item.ai-item { align-self: flex-start; max-width: 80%; align-items: flex-start; }

.message-content { display: flex; align-items: flex-start; }
.message-content.user-content { flex-direction: row-reverse; }
.user-info { margin-left: 15px; min-width: 60px; display: flex; flex-direction: column; align-items: center; }
.ai-info { margin-right: 15px; min-width: 60px; display: flex; flex-direction: column; align-items: center; }

.user-avatar {
  width: 50px; height: 50px; border-radius: 50%; object-fit: cover;
  border: 2px solid #a5d6a7; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.ai-icon {
  width: 50px; height: 50px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white; font-weight: bold; font-size: 16px; margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.user-bubble, .ai-bubble {
  padding: 18px; font-size: 16px; line-height: 1.6;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.1);
  border-radius: 12px; position: relative; transition: all 0.3s ease; max-width: 600px;
}

.user-bubble {
  background: linear-gradient(135deg, #4caf50, #2e7d32); color: white;
  border-radius: 18px 18px 4px 18px;
}
.user-bubble:after {
  content: ''; position: absolute; right: -10px; top: 20px;
  width: 0; height: 0;
  border-top: 12px solid transparent; border-bottom: 12px solid transparent;
  border-left: 12px solid #4caf50;
}

.ai-bubble {
  background: #ffffff; color: #2e7d32;
  border-radius: 18px 18px 18px 4px; border: 1px solid #c8e6c9;
}
.ai-bubble:before {
  content: ''; position: absolute; left: -10px; top: 20px;
  width: 0; height: 0;
  border-top: 12px solid transparent; border-bottom: 12px solid transparent;
  border-right: 12px solid #fff;
}

.message-actions { display: flex; align-items: center; gap: 8px; margin-top: 8px; width: 100%; opacity: 0.7; transition: opacity 0.3s ease; }
.message-actions.user-actions { justify-content: flex-end; padding-right: 10px; }
.message-actions.ai-actions { justify-content: flex-start; padding-left: 10px; }
.message-item:hover .message-actions { opacity: 1; }

.action-btn {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s ease;
  background: #e8f5e9; color: #4caf50; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.action-btn:hover { transform: scale(1.1); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); }
.action-btn.copy-btn:hover { background: #4caf50; color: white; }
.action-btn.edit-btn:hover { background: #2196f3; color: white; }
.action-btn.regenerate-btn:hover { background: #ff9800; color: white; }
.action-btn.copied { background: #4caf50; color: white; }

.question-tag {
  cursor: pointer; transition: all 0.3s ease;
  background: linear-gradient(to right, #e8f5e9, #c8e6c9); color: #2e7d32; border: none;
}
.question-tag:hover { background: linear-gradient(to right, #c8e6c9, #a5d6a7); transform: translateY(-2px); }

.loading { text-align: center; padding: 15px 0 5px; }
.loading-dots { display: flex; justify-content: center; align-items: center; height: 20px; }
.loading-dots div {
  width: 12px; height: 12px; background: linear-gradient(to right, #4caf50, #2e7d32);
  border-radius: 50%; margin: 0 5px; animation: loading-dots 1.4s infinite ease-in-out both;
}
.loading-dots div:nth-child(1) { animation-delay: -0.32s; }
.loading-dots div:nth-child(2) { animation-delay: -0.16s; }

.action-btn1 {
  border-radius: 12px; font-weight: 600; font-size: 15px;
  padding: 12px 25px; transition: all 0.3s ease;
  display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.action-btn1:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15); }
.action-btn1:active { transform: translateY(0); }
.stop-btn { background: linear-gradient(to right, #ff9800, #f57c00); color: #fff; }
.stop-btn:hover { background: linear-gradient(to right, #f57c00, #e65100); }
.send-btn { background: linear-gradient(to right, #4caf50, #2e7d32); color: #fff; }
.send-btn:hover { background: linear-gradient(to right, #2e7d32, #1b5e20); }

@keyframes fadeIn { to {opacity: 1;} }
@keyframes loading-dots {
  0%, 80%, 100% { transform: scale(0.6); }
  40% { transform: scale(1); }
}

/* ===== 训练计划弹窗样式 ===== */
.plan-dialog-body {
  padding: 10px 0;
}
.plan-field {
  margin-bottom: 22px;
}
.plan-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}
.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.plan-tags .el-radio-button {
  --el-radio-button-checked-bg-color: #2e7d32;
  --el-radio-button-checked-border-color: #2e7d32;
  --el-radio-button-checked-text-color: #fff;
}
.generate-plan-btn {
  --el-button-bg-color: #2e7d32;
  --el-button-border-color: #2e7d32;
  --el-button-hover-bg-color: #1b5e20;
  --el-button-hover-border-color: #1b5e20;
}

/* ===== 标题按钮 ===== */
.title-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(46, 125, 50, 0.2);
  background: rgba(255,255,255,0.8);
  color: #2e7d32;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.25s;
}
.title-btn:hover {
  background: #2e7d32; color: #fff;
  border-color: #2e7d32; transform: scale(1.05);
}

/* ===== 历史抽屉 ===== */
.history-drawer-body {
  padding: 0 4px;
}
.history-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 20px; gap: 16px;
  color: #95a5a6; font-size: 14px;
}
.history-list {
  display: flex; flex-direction: column; gap: 6px;
}
.history-item {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 16px; border-radius: 12px;
  background: rgba(232, 245, 233, 0.5);
  cursor: pointer; transition: all 0.2s;
  border: 1px solid transparent;
}
.history-item:hover {
  background: #e8f5e9; border-color: #c8e6c9;
}
.history-item-main {
  flex: 1; min-width: 0;
}
.history-item-title {
  font-size: 14px; font-weight: 600; color: #2c3e50;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 4px;
}
.history-item-meta {
  font-size: 12px; color: #95a5a6; display: flex; gap: 12px;
}
.history-del-btn {
  width: 28px; height: 28px; border-radius: 8px;
  border: none; background: transparent; color: #b0bec5;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.history-del-btn:hover {
  background: rgba(229, 57, 53, 0.1); color: #e53935;
}
</style>
