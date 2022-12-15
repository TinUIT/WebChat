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
        $('#mute-video').click(function (event) {
            if($(this).hasClass('fas fa-video')) {
                $('#mute-video').removeClass('fas fa-video').toggleClass('fas fa-video-slash')
                // End established call
                peerClient.muteVideo(false);
            } else {
                $('#mute-video').removeClass('fas fa-video-slash').toggleClass("fas fa-video")
                peerClient.muteVideo(true);
            }
        });
        $('#mute-mic').click(function (event) {
            if($(this).hasClass('fa-microphone')) {
                $(this).removeClass('fa-microphone').toggleClass('fa-microphone-slash')
                // End established call
                console.log("a");
            } else {
                $(this).removeClass('fa-microphone-slash').toggleClass("fa-microphone")
            }
        })
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
        setMyVideo : function (stream) {
            // $('#my-video').prop('src', stream);
            var video = document.getElementById('my-video');
            if (typeof video.srcObject == "object") {
                video.srcObject = stream;
            } else {
                video.src = URL.createObjectURL(stream);
            }
        },
        updateOnlieUsers : function (users) {
            if(users.length == 0) {
                return
            }
            
            var random = Math.floor(Math.random()*users.length)
            if (toPeerId==null) {
                toPeerId=users[random]
                peerClient.connectToId(toPeerId)
                $('.contact-profile').append('<p>'+toPeerId+'</p>')
                console.log(toPeerId)
            }
        }
    };
}

var myapp, peerapp;

$(document).ready(function () {
    myapp = myjsapp(peerapp);
});
