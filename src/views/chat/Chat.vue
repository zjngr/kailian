<template>
    <div class="chat-container">
        <!-- 左侧联系人面板 -->
        <div class="contacts-panel">
            <!-- 头部 -->
            <div class="contacts-header">
                <h2 class="contacts-title">联系人</h2>
                <div class="header-actions">
                    <el-icon class="search-icon" @click="showSearchDialog = true">
                        <Search />
                    </el-icon>
                    <el-icon class="add-icon" @click="showAddFriendDialog = true">
                        <Plus />
                    </el-icon>
                </div>
            </div>

            <!-- 导航标签 -->
            <div class="nav-tabs">
                <div v-for="tab in tabs" :key="tab.key" class="nav-tab" :class="{ active: activeTab === tab.key }"
                    @click="switchTab(tab.key)">
                    {{ tab.label }}
                </div>
            </div>

            <!-- 联系人列表 -->
            <div class="contacts-list">
                <div v-for="contact in filteredContacts" :key="contact.id" class="contact-item"
                    :class="{ active: selectedContact?.id === contact.id, pinned: contact.pinned }"
                    @click="selectContact(contact)">
                    <div class="contact-avatar" :class="{ active: selectedContact?.id === contact.id }">
                        <img v-if="contact.avatar" :src="contact.avatar" :alt="contact.username" />
                        <div v-else class="avatar-placeholder"></div>
                    </div>
                    <div class="contact-info">
                        <div class="contact-name" :class="{ active: selectedContact?.id === contact.id }">
                            {{ contact.username }}
                            <el-icon v-if="contact.pinned" class="pin-icon">
                                <Star />
                            </el-icon>
                        </div>
                        <div v-if="activeTab !== 'friends'" class="contact-last-message">{{ contact.lastMessage }}</div>
                        <div v-else class="contact-status">
                            <span v-if="contact.online === 1 " class="online-status">在线</span>
                            <span v-else class="offline-status">离线</span>
                        </div>
                    </div>
                    <div v-if="activeTab !== 'friends'" class="contact-time" style="margin-bottom: 20px">{{ contact.lasttime }}</div>
                    <div v-else class="contact-time">
                        <span v-if="contact.online" class="online-dot"></span>
                    </div>
                  <!-- 小红点 / 数字 -->
                  <span v-if="contact.unreadCount > 0" class="unread-badge">
                        {{ contact.unreadCount > 99 ? '99+' : contact.unreadCount }}</span>
                </div>
            </div>
        </div>

        <!-- 右侧聊天窗口 -->
        <div class="chat-panel">
            <!-- 聊天头部 -->
            <div class="chat-header"  v-if="selectedContact!==null">
                <div class="chat-user-info">
                    <div class="user-name">{{ selectedContact?.username || '选择联系人' }}</div>
                    <div v-if="selectedContact?.online" class="user-status">
                        <span class="status-dot"></span>
                        在线
                    </div>
                    <div v-else class="user-status">
                        离线
                    </div>
                </div>
                <div class="chat-actions">
                    <el-dropdown @command="handleChatAction" trigger="click" v-if="selectedContact">
                        <el-icon class="action-icon">
                            <MoreFilled />
                        </el-icon>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="pin" :class="{ 'pinned': selectedContact?.pinned }">
                                    <el-icon>
                                        <Star />
                                    </el-icon>
                                    {{ selectedContact?.pinned ? '取消置顶' : '置顶聊天' }}
                                </el-dropdown-item>
                                <el-dropdown-item command="deleteFriend" divided>
                                    <el-icon>
                                        <User />
                                    </el-icon>
                                    拉黑
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>

          <!--我关注了对面，但是对面没有关注我-->
          <p v-if="isAttentionoppose === true && isAttention2 === false" style="margin-left: 40%">对方关注你前，最多发送1条消息</p>
          <!--对面关注了我，但是我没有关注对面-->
          <div v-if="isAttentionoppose === false && isAttention2 === true" style="display: flex; margin-left: 30%">
            <p>对方已经关注了你，回关对方，成为好友，你们可以解锁无限畅聊，在此之前，你只能发一句话</p>
            <el-button type="primary"  size="small" :disabled="isAttention"  @click="addFriend(selectedContact)"
                       style="margin-left: 10px; margin-top: 13px; ">
              回关</el-button>
          </div>

            <!-- 消息区域 -->
            <div class="messages-area" ref="messagesArea">
                <div v-for="message in currentMessages" :key="message.id" class="message"
                    :class="{ 'message-sent':message.idOne===data.user.id, 'message-received':!(message.idOne===data.user.id)} ">
                    <div class="message-bubble">
                        <!-- 文本消息 -->
                        <div v-if="message.text !== null" class="message-text">
                            {{ message.text }}
                        </div>
                        <!-- 图片消息 -->
                        <div v-else class="message-image">
<!--                            <img :src="message.picture" :alt="message.text" @click="previewImage(message.imageUrl)" />-->
                          <el-image style="max-width: 200px" :src="message.picture" :preview-src-list="[message.picture]" fit="contain"/>
                        </div>
                        <div class="message-time">{{ message.time }}</div>
                    </div>
                </div>
            </div>

            <!-- 输入区域 -->
            <div class="input-area" v-if="selectedContact!==null">
                <div class="input-actions">
                    <el-icon class="input-icon" @click="toggleEmojiPicker">
                        <svg t="1760842341283" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="1715" width="48" height="48">
                            <path
                                d="M512 986.88c-241.493333 0-438.186667-196.693333-438.186667-438.186667S270.506667 110.506667 512 110.506667 950.186667 307.2 950.186667 548.693333 753.493333 986.88 512 986.88z m0-791.04c-194.56 0-352.853333 158.293333-352.853333 352.853333s158.293333 352.853333 352.853333 352.853334 352.853333-158.293333 352.853333-352.853334S706.56 195.84 512 195.84z"
                                fill="#8a8a8a" p-id="1716"></path>
                            <path
                                d="M512 769.706667a221.866667 221.866667 0 0 1-177.493333-89.173334 42.496 42.496 0 0 1 8.96-59.733333 42.496 42.496 0 0 1 59.733333 8.96 134.826667 134.826667 0 0 0 109.226667 55.04c43.093333 0 82.773333-20.053333 108.8-54.613333 14.08-18.773333 40.96-22.613333 59.733333-8.533334 18.773333 14.08 22.613333 40.96 8.533333 59.733334A224.128 224.128 0 0 1 512 769.706667zM376.32 556.8c-23.466667 0-42.666667-19.2-42.666667-42.666667v-56.746666c0-23.466667 19.2-42.666667 42.666667-42.666667s42.666667 19.2 42.666667 42.666667v56.746666c0 23.466667-18.773333 42.666667-42.666667 42.666667zM622.08 556.8c-23.466667 0-42.666667-19.2-42.666667-42.666667v-56.746666c0-23.466667 19.2-42.666667 42.666667-42.666667s42.666667 19.2 42.666667 42.666667v56.746666c0 23.466667-19.2 42.666667-42.666667 42.666667z"
                                fill="#8a8a8a" p-id="1717"></path>
                        </svg>
                    </el-icon>
                  <el-upload
                      action="http://localhost:9090/files/upload"
                      :show-file-list="false"
                      :on-success="handleCoverSuccess"
                  >
                      <el-icon class="input-icon" >
                        <Picture />
                      </el-icon>
                  </el-upload>

                </div>
                <input v-model="newMessage" type="text" placeholder="输入消息..." class="message-input"
                    @keyup.enter="sendMessage" />
                <el-icon class="send-icon" @click="sendMessage">
                    <Position />
                </el-icon>

                <!-- 表情包选择器 -->
                <div v-if="showEmojiPicker" class="emoji-picker" @click.stop>
                    <div class="emoji-picker-header">
                        <span class="emoji-title">选择表情</span>
                        <el-icon class="close-emoji" @click="showEmojiPicker = false">
                            <Close />
                        </el-icon>
                    </div>
                    <div class="emoji-grid">
                        <div v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="selectEmoji(emoji)">
                            {{ emoji }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 添加好友弹窗 -->
    <el-dialog v-model="showAddFriendDialog" title="搜素用户" width="400px" :before-close="handleCloseAddFriend">
        <div class="add-friend-content">
            <div class="search-section">
                <el-input v-model="searchKeyword" placeholder="搜索用户昵称" class="search-input" @input="searchUsers">
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
            </div>

            <div class="search-results" v-if="searchResults.length > 0">
                <div class="result-title">搜索结果</div>
                <div v-for="user in searchResults" :key="user.id" class="user-item">
                    <div class="user-avatar">
                        <img v-if="user.avatar" :src="user.avatar" :alt="user.username" />
                        <div v-else class="avatar-placeholder"></div>
                    </div>
                    <div class="user-info">
                        <div class="user-name">{{user.username}}</div>
                        <div class="user-id">ID: {{ user.id }}</div>
                    </div>
                    <el-button type="primary" size="small" :disabled="isAttention"
                        @click="addFriend(user)">
                        {{ isAttention? '已关注' : '关注' }}
                    </el-button>
                </div>
            </div>

            <div class="no-results" v-else-if="searchKeyword && !isSearching">
                未找到相关用户
            </div>
        </div>
    </el-dialog>

    <!-- 搜索弹窗 -->
    <el-dialog v-model="showSearchDialog" title="搜索联系人" width="400px">
        <div class="search-contacts-content">
            <el-input v-model="contactSearchKeyword" placeholder="搜索联系人" class="search-input">
                <template #prefix>
                    <el-icon>
                        <Search />
                    </el-icon>
                </template>
            </el-input>

            <div class="search-contacts-results" v-if="filteredContactsBySearch.length > 0">
                <div v-for="contact in filteredContactsBySearch" :key="contact.id" class="contact-search-item"
                    @click="selectContact(contact); showSearchDialog = false">
                    <div class="contact-avatar">
                        <img v-if="contact.avatar" :src="contact.avatar" :alt="contact.username" />
                        <div v-else class="avatar-placeholder"></div>
                    </div>
                    <div class="contact-info">
                        <div class="contact-name">{{ contact.username }}</div>
                        <div class="contact-last-message">{{ contact.lastMessage }}</div>
                    </div>
                </div>
            </div>

            <div class="no-results" v-else-if="contactSearchKeyword && filteredContactsBySearch.length === 0">
                未找到相关联系人
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted ,reactive} from 'vue'
import request from "@/utils/request.js";
// 导入路由
import router from "@/router/index.js";
import {ElMessage,ElImageViewer} from "element-plus";
import {Plus} from "@element-plus/icons-vue";

// 响应式数据
const activeTab = ref('recent')
const selectedContact = ref(null)
const newMessage = ref('')
const messagesArea = ref(null)


// 添加好友相关数据
const showAddFriendDialog = ref(false)
const showSearchDialog = ref(false)
const searchKeyword = ref('')
const contactSearchKeyword = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const isAttention= ref(false)
const isAttention2= ref(true)
const isAttentionoppose= ref(null)

//获取用户信息
const data = reactive({
  user: JSON.parse(localStorage.getItem("user")),
  //关注列表
  AttentionList:{sid:null,bsid:null},
  AttentionLists:[],
});

if(!data.user){
  router.push('/login')
}
//对应的聊天室的人
const dateUser=ref([
]);

//对应的聊天室的所有聊天记录
const messagelists=ref([
]);


// 表情包和图片相关数据
const showEmojiPicker = ref(false)
const emojiList = ref([
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
    '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾'
])

// 标签页数据
const tabs = [
    { key: 'recent', label: '最近聊天' },
    { key: 'friends', label: '好友列表' },
]


// 联系人数据
const contacts = ref([])

// 根据分组信息来筛选有效的聊天对象
const filteredContacts = computed(() => {
    if (activeTab.value === 'recent') {
        // 最近聊天：显示有消息记录的联系人，置顶的排在前面，然后按最后消息时间排序
        return mergedcontacts.value
            .sort((a, b) => {
                // 置顶的排在前面
                if (a.pinned && !b.pinned) return -1
                if (!a.pinned && b.pinned) return 1
            })
    } else if (activeTab.value === 'friends') {
        // 好友列表：只显示个人好友，不显示群组，置顶的排在前面
        return mergedcontacts.value
            .filter(contact => contact.isfriend === 1)
            .sort((a, b) => {
                if (a.pinned && !b.pinned) return -1
                if (!a.pinned && b.pinned) return 1
                return 0
            })
    }
    return mergedcontacts.value
})

//获取消息到表格
const currentMessages = computed(() => {
    return selectedContact.value?.messages || []
})

//根据搜索栏里的关键字对数据进行匹配，将名字对应匹配到的数据保存到数组当中
const filteredContactsBySearch = computed(() => {
    if (!contactSearchKeyword.value) return []
    return mergedcontacts.value.filter(contact =>
        contact.username.toLowerCase().includes(contactSearchKeyword.value.toLowerCase())
    )
})

// 方法
const switchTab = (tabKey) => {
    activeTab.value = tabKey
}

//将聊天界面跳转到联系人当中选择的页面，并将聊天页面的数据写入划到最底部
const selectContact = (contact) => {
    selectedContact.value = contact
    //判断一下是对方是否关注了我
    request.get(`user/selectAttentionById/${selectedContact.value.id}`).then((res)=>{
      if (res.code==="200"){
        isAttentionoppose.value=true
        data.AttentionLists=res.data
        data.AttentionLists.forEach((item)=>{
         if (item.bsid === data.user.id){
           isAttentionoppose.value=false
         }
       })
    }
    })
  //判断一下是我是否关注了对方
  request.get(`user/selectAttentionById/${data.user.id}`).then((res)=>{
    if (res.code==="200"){
      isAttention2.value=true
      data.AttentionLists=res.data
      data.AttentionLists.forEach((item)=>{
        if (item.bsid === selectedContact.value.id){
          isAttention2.value=false
        }
      })
    }
  })

  //将后端的所有消息都修改为1已读
  let opp = { ...selectedContact.value };
  opp.idOne = selectedContact.value.idOne === data.user.id ? selectedContact.value.idTwo : selectedContact.value.idOne;
  opp.idTwo = data.user.id;
  request.put("messagelist/updateByTwoId",opp);

  //将前端的数据做修改
  selectedContact.value.unreadCount=0
  messagelists.value.forEach(roomMessages => {
    // 找到属于当前聊天室的那一条
    if (!roomMessages.length) return
    const first = roomMessages[0]
    const match = (first.idOne === selectedContact.value.idOne && first.idTwo === selectedContact.value.idTwo) || (first.idTwo === selectedContact.value.idOne && first.idOne === selectedContact.value.idTwo)
    if (!match) return

    // 把“对方发的且未读”的消息标成已读
    roomMessages.forEach(msg => {
      if (msg.idOne !== data.user.id && msg.sent === 2) {
        msg.sent = 1
      }
    })
  })

    // 滚动到底部
    nextTick(() => {
        scrollToBottom()
    })
}

//图片上传成功处理
const handleCoverSuccess = async (res) => {
  // 同步条件
  if (!(isAttentionoppose.value === false && isAttention2.value === false)) {
    try {
      const res = await request.get('messagelist/selectByTwoId', {params: {idOne: data.user.id, idTwo: selectedContact.value.id}});
      let one =0
      for (let i = 0; i < res.data.length; i++) {
        const item = res.data[i]   // 当前这条消息
        // 3. 判断：如果这条消息自己发的
        if (item.idOne === data.user.id ) {
          one+=1   // 计数器加 1
        }
      }

      if (one > 0) {
        ElMessage.error('您不能继续发送消息了哦');
        return;
      }
    } catch (e) {
      ElMessage.error('网络错误');
      return;
    }
  }

//生成时间格式
  const options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  };
  const formattedTime = new Date().toLocaleString('zh-CN', options)
      .replace(/\//g, '-').replace(',', '');

//封装消息的队列
  const message = {
    idOne: data.user.id,
    idTwo: selectedContact.value.id,
    text: null,
    time: formattedTime,
    sent: 2,//默认没有阅读过
    picture: res.data
  }
  //封装消息到后台
  request.post("messagelist/insertMessaqe",message)

  //更新聊天室的最新状态
  request.get("chatroom/selectBytwoId",{params:{idOne:data.user.id ,idTwo:selectedContact.value.id}}).then((res)=>{
    //更新聊天室的数据
    res.data.lastMessage='[图片]'
    res.data.lasttime=message.time
    request.put("chatroom/updateBytwoId",res.data,{params:{idOne:data.user.id ,idTwo:selectedContact.value.id}})
  })

  //前端消息封装
  selectedContact.value.messages.push(message)
  filteredContacts.value.forEach(contact => {
    if ((contact.idOne === data.user.id && contact.idTwo === selectedContact.value.id) ||
        (contact.idTwo === data.user.id && contact.idOne === selectedContact.value.id)) {
      contact.lastMessage = '[图片]'
      contact.lasttime = message.time
    }
  });
}

//发送信息的后台处理
const sendMessage = async () => {
  // 同步条件
  if (!(isAttentionoppose.value === false && isAttention2.value === false)) {
    try {
      const res = await request.get('messagelist/selectByTwoId', {params: {idOne: data.user.id, idTwo: selectedContact.value.id}});
      let one =0
      for (let i = 0; i < res.data.length; i++) {
        const item = res.data[i]   // 当前这条消息
        // 3. 判断：如果这条消息自己发的
        if (item.idOne === data.user.id ) {
          one+=1   // 计数器加 1
        }
      }

      if (one > 0) {
        ElMessage.error('您不能继续发送消息了哦');
        return;
      }
    } catch (e) {
      ElMessage.error('网络错误');
      return;
    }
  }

    //确定有值则继续
    if (!newMessage.value.trim() || !selectedContact.value ) return

   //生成时间格式
  const options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  };
  const formattedTime = new Date().toLocaleString('zh-CN', options)
      .replace(/\//g, '-').replace(',', '');

    //封装消息的队列
    const message = {
        idOne: data.user.id,
        idTwo: selectedContact.value.id,
        text: newMessage.value,
        time: formattedTime,
        sent: 2,//默认没有阅读过
        picture:null
    }
    //封装消息到后台
    request.post("messagelist/insertMessaqe",message)

   //更新聊天室的最新状态
   request.get("chatroom/selectBytwoId",{params:{idOne:data.user.id ,idTwo:selectedContact.value.id}}).then((res)=>{
     //更新聊天室的数据
     res.data.lastMessage=message.text
     res.data.lasttime=message.time
     request.put("chatroom/updateBytwoId",res.data,{params:{idOne:data.user.id ,idTwo:selectedContact.value.id}})
   })

    //前端消息封装
    selectedContact.value.messages.push(message)
    filteredContacts.value.forEach(contact => {
    if ((contact.idOne === data.user.id && contact.idTwo === selectedContact.value.id) ||
        (contact.idTwo === data.user.id && contact.idOne === selectedContact.value.id)) {
      contact.lastMessage = message.text;
      contact.lasttime = message.time
    }
  });
    newMessage.value = ''


    // 滚动到底部
    nextTick(() => {
        scrollToBottom()
    })
}

// 滚动到底部
const scrollToBottom = () => {
    if (messagesArea.value) {
        messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
}

// 在好友列表当中根据搜索栏的提示获取数据搜索用户
const searchUsers = () => {
  //key的值不存在则查询不到
    if (!searchKeyword.value.trim()) {
        searchResults.value = []
        return
    }

    isSearching.value = true

  //查找对应的值来判断
    request.get(`user/selectByName/${searchKeyword.value}`).then((res)=>{
      if (res.code==="200"){
        searchResults.value=res.data
        isAttention.value=false
        //判断是否关注了该用户
        request.get(`user/selectAttentionById/${data.user.id}`).then((aqs)=>{
          aqs.data.forEach((item)=>{
            if(item.bsid === searchResults.value[0].id){
              isAttention.value=true
            }
          })
        })
      }else{
        ElMessage.error(res.msg)
      }
    })
    isSearching.value = false
}

// 添加好友
const addFriend = (user) => {
    //判断一下是不是自己
  if(data.user.id === user.id){
    ElMessage.error("你不能关注自己哦")
    return;
  }
    //创建一个新的聊天室
    const newContact = ref({
        idOne: data.user.id,
        idTwo: user.id,
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
        //说明聊天室已经存在
        //将聊天室的notlike的值设置为0
        request.get("chatroom/selectBytwoId",{params:{idOne:data.user.id,idTwo:user.id}}).then((aqs)=>{
          if (aqs.data.idOne === data.user.id){
            aqs.data.notlike1=0;
          } else{
            aqs.data.notlike2=0;
          }
          request.put("chatroom/updateBytwoId",aqs.data,{params:{idOne:aqs.data.idOne,idTwo:aqs.data.idTwo}}).then(()=>{
              setTimeout(()=>{
                window.location.reload()
              },500)
          })
        })
      }
    })
    //封装关注列表
    data.AttentionList.sid=data.user.id;
    data.AttentionList.bsid=user.id;
    //记录关注列表
   request.post("user/insertAttention",data.AttentionList).then((res) => {
     if (res.code === '200') {
       ElMessage.success("关注成功")
       //重新获取用户的信息
       request.get(`user/selectById/${data.user.id}`).then((utf)=>{
        data.user=utf.data;
        //保存好新的帖子列表
        data.user.attention+=1;//用户的关注量加1
        user.fans+=1;//用户粉丝量加1
        request.put("user/update",data.user)//更新用户本身的信息
        request.put("user/update",user)//更新发布帖子的作者信息
        localStorage.setItem('user',JSON.stringify(data.user))
       })
       //判断二人是否成为了好友
        request.get(`user/selectAttentionById/${user.id}`).then((aqs)=>{
        if (aqs.code==="200"){
          data.AttentionLists=aqs.data
          data.AttentionLists.forEach((item)=>{
            if (item.bsid === data.user.id){
              //对面关注了我，则修改聊天室词缀isfriend为0
              request.get("chatroom/selectBytwoId",{params:{idOne:data.user.id , idTwo:user.id}}).then((cas)=>{
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
    }else{
      ElMessage.error(res.msg)
    }
  })

}

// 关闭添加好友弹窗
const handleCloseAddFriend = () => {
    showAddFriendDialog.value = false
    searchKeyword.value = ''
    searchResults.value = []
}

// 切换表情选择器
const toggleEmojiPicker = () => {
    showEmojiPicker.value = !showEmojiPicker.value
}

// 选择表情
const selectEmoji = (emoji) => {
    newMessage.value += emoji
    showEmojiPicker.value = false
}

// 处理聊天操作下拉菜单
const handleChatAction = async (command) => {
    if (!selectedContact.value) return
    switch (command) {
        // 切换置顶状态
        case 'pin':
            if(selectedContact.value.idOne===data.user.id){
              request.get("chatroom/selectBytwoId",
                  {params:{idOne:selectedContact.value.idOne,idTwo:selectedContact.value.idTwo}}).then((res)=>{
                   if (res.code==="200"){
                     //假设正确查找到了数据,修改置顶的信息
                      res.data.pinned1=res.data.pinned1? 0:1
                     request.put("chatroom/updateBytwoId",
                         res.data,{params:{idOne:selectedContact.value.idOne,idTwo:selectedContact.value.idTwo}}).then((aqs)=>{
                       if(aqs.code==="200"){
                         //一切成功则切换状态
                         selectedContact.value.pinned=selectedContact.value.pinned? 0:1
                       }else{
                         ElMessage.error("废了")
                       }
                     })
                   }else{
                     ElMessage.error(res.msg)
                   }
              })
            }else{
              request.get("chatroom/selectBytwoId",
                  {params:{idOne:selectedContact.value.idOne,idTwo:selectedContact.value.idTwo}}).then((res)=>{
                if (res.code==="200"){
                  //假设正确查找到了数据,修改置顶的信息
                  res.data.pinned2=res.data.pinned2? 0:1
                  request.put("chatroom/updateBytwoId",
                      res.data,{params:{idOne:selectedContact.value.idOne,idTwo:selectedContact.value.idTwo}}).then((aqs)=>{
                    if(aqs.code==="200"){
                      //一切成功则切换状态
                      selectedContact.value.pinned=selectedContact.value.pinned? 0:1
                    }else{
                      ElMessage.error(res.msg)
                    }
                  })
                }else{
                  ElMessage.error(res.msg)
                }
              })
            }

            // 显示提示
            ElMessage({
                message: selectedContact.value.pinned ? `已取消置顶 ${selectedContact.value.username}` : `已将 ${selectedContact.value.username} 置顶`,
                type: 'success',
                duration: 2000,
                showClose: true
            })
          setTimeout(() => {
            window.location.reload();  // 刷新整个页面
          }, 500);
            break
        // 删除聊天
        case 'deleteFriend':
          //做消息的确认
          await ElMessageBox.confirm(
              `确定要拉黑好友 "${selectedContact.value.username}" 吗？拉黑后聊天记录将无法恢复,假设你关注了对方则关注也会被取消`,
              '拉黑',
              {
                confirmButtonText: '确定拉黑',
                cancelButtonText: '取消',
                type: 'warning',
                confirmButtonClass: 'el-button--primary',
                customClass: 'custom-message-box'
              }
          )
            const one=selectedContact.value.fans
            const two=ref(null)
          //删除用户的关注列表
          request.delete("user/deleteAttention",{params:{sid:data.user.id,bsid:selectedContact.value.id}}).then((res)=>{
            request.get(`user/selectById/${selectedContact.value.id}`).then((utf)=>{
              two.value=utf.data.fans
            })
            if (res.code === "200" && one !== two){
              //修改后端的被取关方和取关方的数据
              //重新获取用户的信息
              request.get(`user/selectById/${data.user.id}`).then((utf)=>{
                data.user=utf.data;
                //保存好新的帖子列表
                data.user.attention-=1;//用户的关注量减1
                selectedContact.value.fans-=1;//被关注用户粉丝量减1
                request.put("user/update",data.user)//更新用户本身的信息
                request.put("user/update",selectedContact.value)//更新被关注用户信息
                localStorage.setItem('user',JSON.stringify(data.user))
              })
            }
          })
          ElMessage.success("取关成功")
          //将聊天室的notlike的值设置为1
          if (selectedContact.value.idOne === data.user.id){
            selectedContact.value.notlike1=1;
          } else{
            selectedContact.value.notlike2=1;
          }
          selectedContact.value.isfriend=0;
          request.put("chatroom/updateBytwoId",selectedContact.value,{params:{idOne:selectedContact.value.idOne,idTwo:selectedContact.value.idTwo}}).then((res)=>{
            if (res.code==="200"){
              //判断双方是否互相拉黑了，假设是，则删除聊天室,并删除全部的聊天记录
              if (selectedContact.value.notlike1===1 && selectedContact.value.notlike2===1){
                //则删除聊天室
                request.delete("chatroom/deleteChatRoom",{params:{idOne:selectedContact.value.idOne,idTwo:selectedContact.value.idTwo}})
                //删除全部的聊天记录
                request.delete("messagelist/deleteByTwoId",{params:{idOne:selectedContact.value.idOne,idTwo:selectedContact.value.idTwo}})
              }
              setTimeout(()=>{
                window.location.reload()
              },500)
            }else{
             ElMessage.error(res.msg)
            }
          })
    }
}

//合并聊天室和聊天人以及聊天数据的数据
const mergedcontacts = computed(() => {
  //将用户详情数组转为 Map，key 是用户 ID
  const detailMap = new Map(
      dateUser.value.map(item => [item.id, item])
  )

  const currentUserId = data.user.id


  //遍历 contacts 合并数据
  return contacts.value.map(contact => {
    // 获取聊天对象 ID
    const otherUserId = currentUserId === contact.idOne ? contact.idTwo : contact.idOne

    //针对值来判断pinned是哪个
    const pinned = currentUserId === contact.idOne ? contact.pinned1 : contact.pinned2

    // 在 messagelists 中查找匹配的消息记录
    const messageList = messagelists.value.find(roomMessages => {
      // 空数组跳过
      if (roomMessages.length === 0) return false

      // 取第一条消息判断聊天室归属
      const firstMsg = roomMessages[0]
      return (currentUserId === firstMsg.idOne && otherUserId === firstMsg.idTwo) || (currentUserId === firstMsg.idTwo && otherUserId === firstMsg.idOne)
    }) || ref([]) // 如果没找到返回 null

    // 1. 先准备一个变量，用来累加未读条数，起始是 0
    let unreadCount = 0
    // 2. 把消息一条条拿出来看
    for (let i = 0; i < messageList.length; i++) {
      const item = messageList[i]   // 当前这条消息
      // 3. 判断：如果这条消息是别人发的，并且状态是 2（未读）
      if (item.idOne !== data.user.id && item.sent === 2) {
        unreadCount = unreadCount + 1   // 计数器加 1
      }
    }

    return {
      ...contact,
      ...detailMap.get(otherUserId),
      messages: messageList,
      pinned:pinned,
      unreadCount:unreadCount
    }
  })
})

//数据刷新
const refreshDate=()=>{
  //获取当前用户的用户所有聊天室的信息
  request.get(`chatroom/selectByid/${data.user.id}`).then((res)=>{
    if (res.code==="200"){
      //剔除被取关的对象
      res.data.forEach((item)=>{
         if (item.idOne === data.user.id){
           if (item.notlike1 === 0) contacts.value.push(item)
         }else{
           if (item.notlike2 === 0) contacts.value.push(item)

         }
      })
      contacts.value.forEach((item) => {
        //查找所有聊天室所对应的聊天人的信息
          request.get(`user/selectById/${item.idOne!==data.user.id?item.idOne:item.idTwo}`).then((res) => {
            if (res.code === '200') {
              dateUser.value.push(res.data);
            } else {
              ElMessage.error(res.msg)
            }
          })

        //查找对应的所有聊天记录
        request.get("messagelist/selectByTwoId",{params:{idOne:data.user.id,idTwo:item.idOne!==data.user.id?item.idOne:item.idTwo}}).then((res)=>{
          if (res.code === "200"){
            messagelists.value.push(res.data);
          }else{
            ElMessage.error(res.msg)
          }
        })
      })
    }else{
      ElMessage.error(res.msg)
    }
  })

}

// 初始化
onMounted(() => {
  window.scrollTo(0,0)
    // 默认选择第一个联系人
    if (contacts.value.length > 0) {
        selectContact(contacts.value[0])
    }

    //刷新数据
    refreshDate()

  //新的内容开始
  connectWebsocket();
  //新的内容结束
})


//新的内容开始
// WebSocket 实例
const ws = ref(null)

// 重连定时器引用
const reconnectTimer = ref(null)

// 心跳定时器引用
const heartbeatTimer = ref(null)

// 防止重复连接的标志，解决 WebSocket 多次触发 onopen 的问题，为true表示正在连接中，就不继续该执行该连接websocket的方法（connectWebsocket）了
let isConnecting = false

/**
 * 连接 WebSocket
 *
 * 功能：建立与后端的 WebSocket 连接，实现消息的实时接收
 *
 * 技术要点：
 * 1. URL 参数传递 userId（通过查询参数）
 * 2. 心跳机制：每60秒发送一次心跳包
 * 3. 自动重连：连接关闭后3秒尝试重新连接
 * 4. 消息处理：根据消息类型执行不同操作
 */
const connectWebsocket=() =>{
  //防止重连,为true表示正在连接中，就不继续该执行该方法了。
  if(isConnecting){
    console.log("正在连接中，跳过")
    return
  }

  // 清除重连定时器
  if(reconnectTimer.value){
    clearTimeout(reconnectTimer.value)
    reconnectTimer.value=null
  }

  // 标记为正在连接
  isConnecting = true

  // WebSocket的连接地址格式：ws://localhost:8080/ws/{id},路径参数是当前用户ID
  const wsUrl = `ws://localhost:9090/ws/${data.user.id}`
  //创建Websocket实例
  ws.value=new WebSocket(wsUrl);

  //websocket连接成功的回调方法
  ws.value.onopen = () =>{
    isConnecting = false //恢复原值

    console.log("ws连接成功,onopen方法触发了")

    // 清除重连定时器
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }

    // 启动心跳机制。为什么要心跳？
    // 1. 保持连接活跃，防止服务器因长时间无活动而关闭连接
    // 2. 检测连接是否真的可用（网络是否断开）
    // if (heartbeatTimer.value){
    //   clearInterval(heartbeatTimer.value)
    // }
    // heartbeatTimer.value = setInterval(()=>{ // 只有连接处于 OPEN 状态时才发送心跳,每60秒发送一次
    //   if(ws.value && ws.value.readyState === WebSocket.OPEN){
    //     ws.value.send(JSON.stringify({ type:'HEARTBEAT' }))
    //   }
    // },60000)
  }

  //ws收到消息的回调方法
  ws.value.onmessage = (event) =>{
    try{
      //解析得到的JSON消息
      const MessageData = JSON.parse(event.data)

      //根据消息类型执行不同操作
      if (MessageData.type === 'CHAT') {
        //封装消息的队列
        const message = {
          idOne: MessageData.senderId,
          idTwo: MessageData.receiverId,
          text: MessageData?.text??null,
          time: MessageData.time,
          sent: MessageData.sent,
          picture:MessageData?.picture??null
        }

        //获取对方用户ID
        const senderId = MessageData.senderId

        //判断当前是否正在与发送者聊天
        const isCurrentChat = selectedContact.value !== null && selectedContact.value?.id === senderId

        //1. 更新 messagelists 中的消息列表 - 找到并添加
        let messageListUpdated = false
        for (let i = 0; i < messagelists.value.length; i++) {
          const roomMessages = messagelists.value[i]
          if (roomMessages.length > 0) {
            const firstMsg = roomMessages[0]
            const isMatch = (firstMsg.idOne === data.user.id && firstMsg.idTwo === senderId) ||
                (firstMsg.idTwo === data.user.id && firstMsg.idOne === senderId)
            if (isMatch) {
              roomMessages.push(message)
              messageListUpdated = true
              break
            }
          }
        }

        //如果没找到对应的消息列表，就创建一个新的
        if (!messageListUpdated) {
          messagelists.value.push([message])
        }

        //2. 更新 contacts 中的最后消息、时间和未读计数
        contacts.value.forEach(contact => {
          const isMatch = (contact.idOne === data.user.id && contact.idTwo === senderId) ||
              (contact.idTwo === data.user.id && contact.idOne === senderId)

          if (isMatch) {
            contact.lastMessage = MessageData.lastMessage
            contact.lasttime = MessageData.time

            // 把消息塞进 messages
            if (!contact.messages) {
              contact.messages = []
            }
            contact.messages.push(message)
          }
        })

        //3. 如果当前正在与发送者聊天，更新 selectedContact 的消息列表
        if (isCurrentChat && MessageData.receiverId === data.user.id) {
          const opp = ref({
            idOne: null,
            idTwo: null,
            text: null,
            time: null,
            sent: null,
            picture: null
          })
          opp.idOne = senderId;
          opp.idTwo = data.user.id;
          request.put("messagelist/updateByTwoId",opp);
          //标志为已读
          if(isCurrentChat === true) message.sent=1;
          nextTick(() => {
            scrollToBottom()
          })
        }
      }else if (MessageData.type === 'CONNECT') {
        // 连接响应消息
        console.log('收到连接响应消息:', MessageData.message)
      } else if (MessageData.type === 'HEARTBEAT') {
        // 心跳响应
        console.log('收到心跳响应')
      } else if (MessageData.type === 'ONLINE_STATUS') {
        // 好友在线状态变更通知
        console.log('收到别人在线状态变更通知:', MessageData)
        // 更新 dateUser 中对应好友的在线状态
        const userIndex = dateUser.value.findIndex(u => u.id === MessageData.userId)
        if (userIndex !== -1) {
          dateUser.value[userIndex].online = MessageData.online
          dateUser.value = [...dateUser.value]
        }
        // 更新 contacts 中对应联系人
        contacts.value.forEach(contact => {
          const isMatch = (contact.idOne === data.user.id && contact.idTwo === MessageData.userId) ||
              (contact.idTwo === data.user.id && contact.idOne === MessageData.userId)
          if (isMatch) {
            contact.online = MessageData.online
          }
        })
        // 更新当前聊天窗口中用户的在线状态
        if (selectedContact.value !== null && selectedContact.value?.id === MessageData.userId) {
          selectedContact.value.online = MessageData.online
        }
      }
    }catch(error){
      console.error('解析消息失败:', error)
    }
  }

  // WebSocket 错误回调
  ws.value.onerror = (error) => {
    console.error('WebSocket 错误:', error)
    isConnecting = false
  }

  // WebSocket 关闭回调
  ws.value.onclose = (event) => {
    console.log('WebSocket 连接关闭:', event.code, event.reason)
    isConnecting = false

    // 清除心跳定时器
    if (heartbeatTimer.value) {
      clearInterval(heartbeatTimer.value)
      heartbeatTimer.value = null
    }

    // 清除旧的连接（移除所有事件监听器）
    if (ws.value) {
      ws.value.onopen = null
      ws.value.onmessage = null
      ws.value.onerror = null
      ws.value.onclose = null
      ws.value = null
    }

    // 延迟重连
    // 使用 setTimeout 而非 setInterval，因为每次重连是独立的
    if (!reconnectTimer.value) {
      console.log('3秒后尝试重新连接...')
      reconnectTimer.value = setTimeout(() => {
        reconnectTimer.value = null
        connectWebsocket()
      }, 3000)
    }
  }
}

//对websocket的值进行清理
onUnmounted(() => {
  // 关闭 WebSocket 连接
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }

  // 清除重连定时器
  if (reconnectTimer.value) {
    clearTimeout(reconnectTimer.value)
    reconnectTimer.value = null
  }

  // 清除心跳定时器
  if (heartbeatTimer.value) {
    clearInterval(heartbeatTimer.value)
    heartbeatTimer.value = null
  }
})

</script>

<style scoped>
/* 主容器 */
.chat-container {
    display: flex;
    height: 80vh;
    background-color: #f5f5f5;
    border: 3px solid var(--el-color-success);
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    padding-bottom: 2px;
    box-sizing: border-box;
}

/* 左侧面板 */
.contacts-panel {
    width: 300px;
    height: 800px;
    background-color: white;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
}

.contacts-header {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.contacts-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #2e7d32;
}

.header-actions {
    display: flex;
    gap: 12px;
}

.search-icon,
.add-icon {
    width: 20px;
    height: 20px;
    color: #666;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.search-icon:hover,
.add-icon:hover {
    background-color: #f0f0f0;
}

.add-icon {
    background-color: #2e7d32;
    color: white;
    border-radius: 50%;
}

.add-icon:hover {
    background-color: #45a049;
}

/* 导航标签 */
.nav-tabs {
    display: flex;
    border-bottom: 1px solid #e0e0e0;
}

.nav-tab {
    flex: 1;
    padding: 12px 16px;
    text-align: center;
    cursor: pointer;
    color: #666;
    font-size: 14px;
    transition: all 0.2s;
    position: relative;
}

.nav-tab.active {
    color: #2e7d32;
    font-weight: 500;
}

.nav-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #4CAF50;
}

/* 联系人列表 */
.contacts-list {
    flex: 1;
    overflow-y: auto;
}

.contact-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #f0f0f0;
}

.contact-item:hover {
    background-color: #f8f8f8;
}

.contact-item.active {
    background-color: #e8f5e8;
}

.contact-item.pinned {
    background-color: #fff3e0;
    border-left: 3px solid #ff9800;
}

.contact-item.pinned.active {
    background-color: #e8f5e8;
}

.contact-name.active {
    color: #3a843e;
    font-weight: 500;
}

.pin-icon {
    width: 12px;
    height: 12px;
    color: #ff9800;
    margin-left: 4px;
}

/* 头像和用户信息 */
.contact-avatar,
.user-avatar {
    width: 40px;
    height: 40px;
    margin-right: 12px;
    flex-shrink: 0;
}

.unread-badge {
  background: #ff4141;
  color: #fff;
  font-size: 10px;
  line-height: 1;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  box-shadow: 0 0 0 2px #fff;
}

.contact-avatar.active {
    border-radius: 50%;
    border: 2px solid #2e7d32;
}

.contact-avatar img,
.user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ddd;
}

.contact-info,
.user-info {
    flex: 1;
    min-width: 0;
}

.contact-name,
.user-name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 2px;
}

.contact-last-message {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.contact-status {
    font-size: 12px;
    margin-top: 2px;
}

.online-status {
    color: #4CAF50;
    font-weight: 500;
}

.offline-status {
    color: #999;
}

.online-dot {
    width: 8px;
    height: 8px;
    background-color: #4CAF50;
    border-radius: 50%;
    display: inline-block;
}

.contact-time {
    font-size: 11px;
    color: #999;
    flex-shrink: 0;
    margin-left: 8px;
}

/* 右侧聊天面板 */
.chat-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: white;
    height: 800px;
}

.chat-header {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 2px;
}

.user-status {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #4CAF50;
}

.status-dot {
    width: 6px;
    height: 6px;
    background-color: #4CAF50;
    border-radius: 50%;
    margin-right: 4px;
}

.chat-actions {
    display: flex;
    gap: 12px;
}

.action-icon {
    width: 20px;
    height: 20px;
    color: #666;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.action-icon:hover {
    background-color: #f0f0f0;
}

/* 消息区域 */
.messages-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #fafafa;
}

.message {
    margin-bottom: 16px;
    display: flex;
}

.message-sent {
    justify-content: flex-end;
}

.message-received {
    justify-content: flex-start;
}

.message-bubble {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 18px;
    position: relative;
}

.message-sent .message-bubble {
    background-color: #4CAF50;
    color: white;
    border-bottom-right-radius: 4px;
}

.message-received .message-bubble {
    background-color: white;
    color: #333;
    border: 1px solid #e0e0e0;
    border-bottom-left-radius: 4px;
}

.message-text {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 4px;
}

.message-time {
    font-size: 11px;
    opacity: 0.7;
    text-align: right;
}

.message-received .message-time {
    text-align: left;
}

.message-emoji {
    font-size: 24px;
    line-height: 1.2;
    margin-bottom: 4px;
}

.message-image {
    margin-bottom: 4px;
}

.message-image img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
    object-fit: cover;
}

.message-image img:hover {
    transform: scale(1.02);
}

/* 输入区域 */
.input-area {
    position: relative;
    padding: 20px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: white;
}

.input-actions {
    display: flex;
    gap: 8px;
}

.input-icon {
    width: 20px;
    height: 20px;
    color: #666;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.input-icon:hover {
    background-color: #f0f0f0;
}

.message-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.message-input:focus {
    border-color: #4CAF50;
}

.send-icon {
    width: 20px;
    height: 20px;
    color: white;
    background-color: #4CAF50;
    border-radius: 50%;
    cursor: pointer;
    padding: 8px;
    transition: background-color 0.2s;
}

.send-icon:hover {
    background-color: #45a049;
}

/* 表情包选择器 */
.emoji-picker {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -4px 20px rgba(46, 125, 50, 0.15);
    z-index: 10000;
    width: 500px;
    max-height: 200px;
    overflow: hidden;
    min-height: 100px;
    backdrop-filter: blur(10px);
    border-top: 3px solid #2e7d32;
}

.emoji-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e8f5e8;
    background: linear-gradient(135deg, #f8f9fa, #e8f5e8);
    border-radius: 12px 12px 0 0;
}

.emoji-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
}

.close-emoji {
    width: 16px;
    height: 16px;
    color: #666;
    cursor: pointer;
    padding: 2px;
    border-radius: 2px;
    transition: background-color 0.2s;
}

.close-emoji:hover {
    background-color: #e0e0e0;
}

.emoji-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
    padding: 12px;
    max-height: 120px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #2e7d32 #f0f0f0;
}

.emoji-grid::-webkit-scrollbar {
    width: 6px;
}

.emoji-grid::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #2e7d32, #4caf50);
    border-radius: 3px;
    transition: background 0.2s ease;
}

.emoji-grid::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #1b5e20, #2e7d32);
}

.emoji-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: 22px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    user-select: none;
    pointer-events: auto;
    margin: 2px;
}

.emoji-item:hover {
    background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
}

.emoji-item:active {
    transform: scale(0.95);
    background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
}

/* 弹窗样式 */
.add-friend-content,
.search-contacts-content {
    padding: 10px 0;
}

.search-section {
    margin-bottom: 20px;
}

.search-input {
    width: 100%;
}

.search-results,
.search-contacts-results {
    max-height: 300px;
    overflow-y: auto;
    margin-top: 15px;
}

.result-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
    font-weight: 500;
}

.user-item,
.contact-search-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;
}

.user-item:last-child,
.contact-search-item:last-child {
    border-bottom: none;
}

.contact-search-item:hover {
    background-color: #f8f8f8;
}

.user-id {
    font-size: 12px;
    color: #999;
}

.no-results {
    text-align: center;
    color: #999;
    padding: 20px 0;
    font-size: 14px;
}

/* 图片预览 */
.image-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    cursor: pointer;
}

.image-preview-img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
}

/* 滚动条 */
.contacts-list::-webkit-scrollbar,
.messages-area::-webkit-scrollbar {
    width: 4px;
}

.contacts-list::-webkit-scrollbar-track,
.messages-area::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.contacts-list::-webkit-scrollbar-thumb,
.messages-area::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
}

.contacts-list::-webkit-scrollbar-thumb:hover,
.messages-area::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 下拉菜单 */
.el-dropdown-menu__item.pinned {
    color: #ff9800;
}

.el-dropdown-menu__item.pinned .el-icon {
    color: #ff9800;
}

</style>
