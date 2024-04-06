import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// Your Firebase configuration
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "aaravchat-44e73.firebaseapp.com",
  projectId: "aaravchat-44e73",
  storageBucket: "aaravchat-44e73.appspot.com",
  messagingSenderId: "234190306046",
  appId: "1:234190306046:web:dcc3e28dbc134dca1003af",
  measurementId: "G-3GB9TJSLT7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Audio effects initialization
var sendAudio = new Audio('s.mp3');
var receiveAudio = new Audio('g.mp3');

document.addEventListener("DOMContentLoaded", function() {
  var messageInput = document.getElementById("messageInput");
  var fileInput = document.getElementById("fileInput");
  var chatContainer = document.getElementById("chatContainer");
  var sendButton = document.getElementById("sendButton");
  var usernameContainer = document.getElementById("usernameContainer");
  var usernameInput = document.getElementById("usernameInput");
  var usernameSubmit = document.getElementById("usernameSubmit");
  var username = null;

  // Initially, hide the chat and input containers
  chatContainer.style.display = 'none';
  document.querySelector(".input-container").style.display = 'none';

  function setUsername() {
    var inputUsername = usernameInput.value.trim();
    if (inputUsername !== "") {
      username = inputUsername;
      usernameContainer.style.display = "none";
      chatContainer.style.display = 'block';
      document.querySelector(".input-container").style.display = 'flex';
    }
  }

  usernameSubmit.addEventListener("click", setUsername);
  usernameInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      setUsername();
    }
  });

  sendButton.addEventListener("click", function() {
    var messageContent = messageInput.value.trim();
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const storageRef = firebase.storage().ref('uploads/' + new Date().getTime() + "-" + file.name);
      const uploadTask = storageRef.put(file);
      uploadTask.on('state_changed', null, null, () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          firebase.database().ref("messages").push().set({
            username: username,
            content: messageContent,
            fileUrl: downloadURL,
            fileType: file.type
          });
          messageInput.value = "";
          fileInput.value = "";  // Reset file input
          sendAudio.play();
        });
      });
    } else if (messageContent !== "") {
      firebase.database().ref("messages").push().set({
        username: username,
        content: messageContent
      });
      messageInput.value = "";
      sendAudio.play();
    }
  });

  // Function to process spoilers within a message
  function processSpoilers(message) {
    return message.replace(/\|\|([^|]+)\|\|/g, '<span class="spoiler-text" onclick="revealSpoiler(this)">$1</span>');
  }
  
  // Function to process message content and embed links
  function processMessageContent(message) {
    // Regular expressions to detect different types of links
    const imageRegex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
    const videoRegex = /\.(mp4|webm|ogg|mov)$/i;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    
    // Replace image links with embedded images
    message = message.replace(imageRegex, '<img src="$&" class="embedded-image" />');
    
    // Replace video links with embedded videos
    message = message.replace(videoRegex, '<video src="$&" class="embedded-video" controls />');
    
    // Replace YouTube links with embedded YouTube videos
    message = message.replace(youtubeRegex, '<iframe width="560" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>');
    
    return message;
  }

  firebase.database().ref("messages").on("child_added", async function(snapshot) {
    var message = snapshot.val();
    var messageElement = document.createElement("div");
    messageElement.classList.add("message");

    var usernameElement = document.createElement("span");
    usernameElement.classList.add("message-username");
    usernameElement.innerText = message.username + ": ";
    messageElement.appendChild(usernameElement);

    var contentElement = document.createElement("span");
    contentElement.classList.add("message-content");

    if (message.content.includes("@gemini")) {
      const genAI = new GoogleGenerativeAI("YOUR_API_KEY"); // Replace YOUR_API_KEY with your actual API key
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = "Respond to: " + message.content;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      contentElement.innerHTML = text;
    } else {
      contentElement.innerHTML = processSpoilers(processMessageContent(message.content));
    }

    messageElement.appendChild(contentElement);

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (message.username !== username) {
        receiveAudio.play();
    }
  });

  usernameContainer.style.display = "flex";
});

// Function to reveal spoiler text
function revealSpoiler(element) {
    element.style.background = 'none';
    element.style.color = '#DCDDDE';
}
