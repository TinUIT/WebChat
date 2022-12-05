// UI Manager for the Chat app
function myjsapp(peerClient) {
    var chatHistory = {};
    function EventListeners() {
        Element.prototype.remove = function() {
            this.parentElement.removeChild(this);
        }
    }

    function appendToHistory(id, message, isSent) {
        if(chatHistory[id]) {
            var hist = chatHistory[id];
            var fromTxt = isSent ? 'send' : 'replies'
            var msg = $('<li class="'+fromTxt+'"> <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /></li>').append('<p>' + message + '<p>')
            hist.append(msg)
                .scrollTop(hist[0].scrollHeight);            
        }
    }

    function startPeerClient(username) {
        peerClient.connectToServerWithId(username);
    }
    // Show Username Modal
    if(username) {
        startPeerClient(username)
    }

    EventListeners();        

    return {
        createChatWindow: function(id) {
            var toPeerId = id;

            var history = document.getElementById("history")
            var message = document.getElementById("message")
            var sendBtn = document.getElementById("send")

            chatHistory[toPeerId] = history

            sendBtn.click(function(event) {
                var msgText = message.val().trim()
                if(msgText) {
                    peerClient.sendMessage(toPeerId, msgText)
                    appendToHistory(toPeerId, msgText, true)
                    message.val('').focus()
                }
            });
        },

        appendHistory : appendToHistory,
        updateOnlieUsers : function (users) {
            if(users.length == 0) {
                return
            }
            peerClient.connectToId(users[Math.floor(Math.random()*users.length)])
        }
    };
}

var myapp, peerapp;

$(document).ready(function () {
    myapp = myjsapp(peerapp);
});
