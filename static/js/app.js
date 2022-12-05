// UI Manager for the Chat app
function myjsapp(peerClient) {
    var toPeerId = null;
    var chatHistory = {};
    var history = $('#history')

    chatHistory[toPeerId] = history

    function EventListeners() {
        Element.prototype.remove = function() {
            this.parentElement.removeChild(this);
        }

        $('#send').click(function(event) {
            var msgText =  $('#message').val()
            if(msgText) {
                console.log(toPeerId);
                peerClient.sendMessage(toPeerId, msgText)
                appendToHistory(toPeerId, msgText, true)
                $('#message').val('').focus()
            }
        });
    }

    function appendToHistory(id, message, isSent) {
        var fromTxt = isSent ? 'replies':'sent';
        console.log(message);
        var msg = $('<li class="'+fromTxt+'"> <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /></li>').append('<p>' + message + '</p>')
        history.append(msg)
    }

    function startPeerClient(username) {
        peerClient.connectToServerWithId(username);
    }
    // Show Username Modal
    if(username) {
        startPeerClient(username)
        console.log(username)
    }

    EventListeners();        

    return {
        appendHistory : appendToHistory,
        updateOnlieUsers : function (users) {
            if(users.length == 0) {
                return
            }
            var random = Math.floor(Math.random()*users.length)
            if (toPeerId==null) {
                toPeerId=users[random]
                peerClient.connectToId(toPeerId)
                console.log(toPeerId)
            }
        }
    };
}

var myapp, peerapp;

$(document).ready(function () {
    myapp = myjsapp(peerapp);
});
