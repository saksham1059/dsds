// Your Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBAWt0_iZAZijVi1rrKOUjMGYHtyw9HQ64",
  authDomain: "aaravchat-44e73.firebaseapp.com",
  projectId: "aaravchat-44e73",
  storageBucket: "aaravchat-44e73.appspot.com",
  messagingSenderId: "234190306046",
  appId: "1:234190306046:web:dcc3e28dbc134dca1003af",
  measurementId: "G-3GB9TJSLT7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

document.addEventListener("DOMContentLoaded", function() {
  var messageInput = document.getElementById("messageInput");
  var chatContainer = document.getElementById("chatContainer");
  var sendButton = document.getElementById("sendButton");
  
  // Default username for Kindle user
  var username = "a Kindle user";

  sendButton.addEventListener("click", function() {
    var messageContent = messageInput.value.trim();
    if (messageContent !== "") {
      firebase.database().ref("messages").push().set({
        username: username,
        content: messageContent
      });
      messageInput.value = "";
    }
  });

  firebase.database().ref("messages").on("child_added", function(snapshot) {
    var message = snapshot.val();
    var messageElement = document.createElement("div");
    messageElement.classList.add("message");

    var usernameElement = document.createElement("span");
    usernameElement.classList.add("message-username");
    usernameElement.innerText = message.username + ": ";
    messageElement.appendChild(usernameElement);

    var contentElement = document.createElement("span");
    contentElement.classList.add("message-content");
    contentElement.innerText = message.content;
    messageElement.appendChild(contentElement);

    // Display images and provide download links for supported files
    if (message.fileUrl) {
      if (message.fileType.startsWith('image/')) {
        const imageElement = document.createElement('img');
        imageElement.src = message.fileUrl;
        imageElement.style.maxWidth = "200px";
        messageElement.appendChild(imageElement);
      } else if (message.fileType === 'application/epub+zip') {  // EPUB files
        const fileLink = document.createElement('a');
        fileLink.href = message.fileUrl;
        fileLink.innerText = "Download EPUB";
        fileLink.target = "_blank";
        messageElement.appendChild(fileLink);
      } else if (message.fileType === 'text/plain') {  // TXT files
        const fileLink = document.createElement('a');
        fileLink.href = message.fileUrl;
        fileLink.innerText = "Download TXT";
        fileLink.target = "_blank";
        messageElement.appendChild(fileLink);
      }
    }

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
});