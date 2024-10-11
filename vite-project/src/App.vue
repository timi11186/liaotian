<script setup>
import { ref, onMounted } from "vue";
const userInfo = ref({
  userId: "",
});
const yourMessage = ref(""); // 你自己的消息
const messageList = ref([]);
const onlineList = ref([]);
let ws = null;

const sendMessage = () => {
  if (yourMessage.value) {
    ws.send(
      JSON.stringify({
        type: "message",
        userId: userInfo.value.userId,
        content: yourMessage.value,
      })
    ); // 发送消息

    yourMessage.value = "";
  }
};

const initWebsocket = () => {
  ws = new WebSocket("ws://localhost:8888/");
  console.log(ws);

  ws.onopen = () => {
    console.log("websocket连接成功");
    ws.send(
      JSON.stringify({
        type: "init",
        userId: userInfo.value.userId,
        content: "欢迎来到聊天室",
      })
    );
  };

  ws.onerror = () => {
    console.log("websocket连接失败");
  };

  ws.onmessage = (data) => {
    const message = JSON.parse(data.data);
    switch (message.type) {
      case "tips":
        console.log(message.content);
        break;
      case "message":
        messageList.value.push(message);
        break;
      case "onlineList":
        onlineList.value = message.list;
        break;
      default:
        break;
    }
  };

  ws.onclose = () => {
    console.log("websocket连接关闭");
  };
};

onMounted(() => {
  userInfo.value.userId = new Date().getTime().toString().slice(8);
  initWebsocket();
});
</script>

<template>
  <div class="app">
    <div class="chat-container">
      在线人数{{ onlineList.length }}
      <div class="chat-room">
        <div class="message-item" v-for="(item, index) in messageList" :key="index">
          <div class="flex-left" v-if="item.userId !== userInfo.userId">
            <div class="avatar">
              {{ "W" + item.userId }}
            </div>
            <div style="margin-left: 10px" class="message-content">
              {{ item.content }}
            </div>
          </div>
          <div v-else class="flex-right">
            <div class="message-content" style="margin-right: 10px">
              {{ item.content }}
            </div>
            <div class="avatar">
              {{ "W" + item.userId }}
            </div>
          </div>
        </div>
      </div>
      <div class="send-box">
        <input class="message-input" type="text" v-model="yourMessage" @keyup.enter="sendMessage" />
        <button class="send-btn" @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #fff;
  display: grid;
  place-items: center;
}

.chat-container {
  width: 600px;
  height: 600px;
  overflow: hidden;
  background: #eae3e3;
  border-radius: 8px;
}

.chat-room {
  height: calc(100% - 100px);
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
  background: #ecd5d5;
}
.message-item {
  width: 80%;
  margin: 0 auto;
  margin-bottom: 10px;
}

.flex-left {
  display: flex;
  justify-content: flex-start;
}

.flex-right {
  display: flex;
  justify-content: flex-end;
}

.avatar {
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #fafafa;
}

.message-content {
  min-height: 30px;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
}

.send-box {
  height: 80px;
  display: flex;
  align-items: center;
}

.message-input {
  height: 60px;
  flex: 1;
}

.send-btn {
  width: 150px;
  height: 60px;
  line-height: 60px;
  text-align: center;
}
</style>
