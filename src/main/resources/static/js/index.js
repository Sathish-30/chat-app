const userNamePage = document.getElementById("username-page");
const chatPage = document.getElementById("chat-page");
const userNameForm = document.getElementById("usernameForm");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("message");
const messageArea = document.getElementById("messageArea");
const connectingElement = document.getElementById("connecting");

let stompClient = null;
let userName = null;

const color = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

const getAvatarColor = (messageSender) => {
    let hash = 0;
    for(let i = 0 ; i < messageSender.length ; i++){
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    return color[Math.abs(hash % color.length)];
}
const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);

    const messageElement = document.createElement("li");
    if(message.type === "JOIN"){
        messageElement.classList.add("event-message");
        message.content = message.sender + " joined!";
    }else if(message.type === "LEAVER"){
        messageElement.classList.add("event-message");
        message.content = message.sender + " left!";
    }else{
        messageElement.classList.add("chat-message");
        const avatarElement = document.createElement("i");
        const avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style.backgroundColor = getAvatarColor(message.sender);
        messageElement.appendChild(avatarElement);
        const userNameElement = document.createElement("span");
        const usernameText = document.createTextNode(message.sender);
        userNameElement.appendChild(usernameText);
        messageElement.appendChild(userNameElement);
    }

    const textElement = document.createElement("p");
    const messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

const onConnect = () => {
    // Subsribe to the public topic
    stompClient.subscribe("/topic/public", onMessageReceived)

    // Tell user name to the user
    stompClient.send('/app/chat.addUser', {} , JSON.stringify({sender : userName , type:'JOIN'}));
    connectingElement.classList.add('hidden');
}

const onError = () => {
    connectingElement.textContent = "Could not connect to the websocket server. Please refresh this page and try!";
    connectingElement.style.color = "red";
}

const connect = (event) => {
    userName = document.getElementById("name").value.trim();
    if(userName) {
        userNamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        let socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnect, onError);
    }
    event.preventDefault();
}

const sendMessage = (event) => {
    const messageContent = messageInput.value.trim();
    if(messageContent && stompClient){
        const chatMessage = {
            sender: userName,
            content: messageContent,
            type:"CHAT"
        };
        stompClient.send("/app/chat.sendMessage" , {} , JSON.stringify(chatMessage));
        messageInput.value = "";
    }
    event.preventDefault();
}



userNameForm.addEventListener("submit" , connect , true);
messageForm.addEventListener("submit" , sendMessage , true);