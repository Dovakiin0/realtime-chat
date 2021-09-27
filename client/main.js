var socket = io();
var login_page = document.querySelector(".login");
var chat_page = document.querySelector(".chat");
var room_id = document.querySelector(".chat-room-id p");

var createbtn = document.querySelector(".create-btn");
var joinbtn = document.querySelector(".join-btn");
var sendbtn = document.querySelector(".send-msg-btn");
var messagebox = document.querySelector(".message-input");
var connected_users = document.querySelector(".connected-users");

login_page.style.display = "flex";
chat_page.style.display = "none";

var current_room_id;

createbtn.addEventListener("click", function () {
  var username = document.querySelector(".username").value;
  if (username) {
    var randomString = Math.random().toString(36).substring(7);
    socket.emit("room-create", randomString);

    socket.on("room-created", (code) => {
      current_room_id = code;
      socket.emit("new-user", { code, username });
      socket.on("roomUsers", ({ room, users }) => {
        room_id.innerHTML = code;
        connected_users.innerHTML = "";
        for (let user of users) {
          if (room === current_room_id) {
            var el = document.createElement("p");
            el.innerHTML = user.username;
            connected_users.appendChild(el);
          }
        }
      });
      login_page.style.display = "none";
      chat_page.style.display = "flex";
    });
  } else {
    alert("Please enter Username");
  }
});

joinbtn.addEventListener("click", function () {
  var username = document.querySelector(".username").value;
  var roomid = document.querySelector(".roomid").value;
  if (!username) {
    alert("Please enter Username");
  } else if (!roomid) {
    alert("Please enter Room ID");
  } else {
    socket.emit("room-join", roomid.trim());
    socket.on("room-joined", (code) => {
      current_room_id = code;
      socket.emit("new-user", { code, username });
      socket.on("roomUsers", ({ room, users }) => {
        room_id.innerHTML = code;
        connected_users.innerHTML = "";
        for (let user of users) {
          if (room === current_room_id) {
            var el = document.createElement("p");
            el.innerHTML = user.username;
            connected_users.appendChild(el);
          }
        }
      });
      login_page.style.display = "none";
      chat_page.style.display = "flex";
    });
  }
});

var messages = document.querySelector(".messages");

socket.on("message", (msg) => {
  var el = document.createElement("div");
  el.innerHTML = `
  <div class="message text-gray-400">${msg}</div>`;
  messages.appendChild(el);
});

sendbtn.addEventListener("click", () => {
  var message = document.querySelector(".message-input").value;
  socket.emit("chatMessage", message);
});

socket.on("chat", (obj) => {
  var el = document.createElement("div");
  el.innerHTML = `
  <div class="message bg-blue-100 p-2 m-2">
  <div class="flex justify-between">
    <p class="text-purple-400">${obj.username}</p>
    <p class="text-gray-400">${obj.time}</p>
  </div>
  <p>${obj.text}</p>
</div>
  `;
  messages.appendChild(el);
});
message.innerText = "";
