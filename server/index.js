const { WebSocketServer } = require("ws");
const WebSocket = require("ws");

const onlineList = [];

// 我们的 port 是 8888
const wss = new WebSocketServer({ port: 8888 });
// 如果有ws 就表明我们已经初始化成功
if (wss) {
  console.log("websocket Initialized successfully on port: " + 8888);
}

wss.on("connection", function connection(ws, request) {
  let welCome = JSON.stringify({
    type: "tips",
    content: "欢迎加入聊天室，开始畅聊吧～",
  });
  // 初始化时发送欢迎的消息
  ws.send(welCome, { binary: false }); // binary 表示是否是文件

  ws.on("error", console.error);

  // 注册收到消息的事件
  ws.on("message", async function message(data) {
    const message = JSON.parse(data);
    switch (message.type) {
      // 用户在连接成功以后会发送消息 我们会在此获取用户信息
      case "init":
        if (message.userId) {
          // 为当前用户的 ws连接绑定 用户id 用于用户断开链接时 改变用户在线状态
          ws.userId = message.userId;
          // 上线
          keepLatestOnlineList("online", message);
        }
        break;
      // 群发消息
      case "message":
        wss.clients.forEach(function each(client) {
          // readyState、WebSocket.OPEN 他们都是 1 表示当前链接是打开状态
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message), { binary: false });
          }
        });
        break;
      default:
        break;
    }
  });

  // 被动断开 说明用户已经离开网站了 我们维护在线列表
  ws.on("close", function () {
    keepLatestOnlineList("close", { userId: ws.userId });
  });
});

function keepLatestOnlineList(type, message) {
  let index = onlineList.findIndex((item) => item.userId === message.userId);
  switch (type) {
    case "online":
      if (index === -1) {
        onlineList.push({
          userId: message.userId,
        });
      }
      console.log(message.nickname + " 上线了...");
      break;
    case "close":
      if (index !== -1) {
        onlineList.splice(index, 1);
        console.log("有用户断开连接...");
      }
      break;
    default:
      break;
  }

  // 群发在线人数
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      let message = JSON.stringify({
        type: "onlineList",
        list: onlineList,
      });
      client.send(message, { binary: false });
    }
  });
}
