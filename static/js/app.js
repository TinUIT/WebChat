// UI Manager for the Chat app
function myjsapp(peerClient) {
    var chatHistory = {};
    var chatPanel = {};
    function EventListeners() {
        Element.prototype.remove = function() {
            this.parentElement.removeChild(this);
        }

        $('.end-call').click(function (event) {
            // clear CSS for mute buttons
            $('.mute-audio, .mute-video').removeClass('btn-success').addClass('btn-secondary')
            // End established call
            peerClient.endCall();
        })
        
        $('.accept-call').click(function (event) {
            // End established call
            peerClient.acceptIncomingCall();
        })
        $('.reject-call').click(function (event) {
            // End established call
            peerClient.rejectIncomingCall();
        })

        $('.mute-audio').click(function (event) {
            if($(this).hasClass('btn-secondary')) {
                $(this).removeClass('btn-secondary').addClass('btn-success')
                // End established call
                peerClient.muteAudio(false);
            } else {
                $(this).removeClass('btn-success').addClass('btn-secondary')
                peerClient.muteAudio(true);
            }
        })
        $('.mute-video').click(function (event) {
            if($(this).hasClass('btn-secondary')) {
                $(this).removeClass('btn-secondary').addClass('btn-success')
                // End established call
                peerClient.muteVideo(false);
            } else {
                $(this).removeClass('btn-success').addClass('btn-secondary')
                peerClient.muteVideo(true);
            }
        })
    }

    function appendToHistory(id, message, isSent) {
        if(chatHistory[id]) {
            var hist = chatHistory[id];
            var fromTxt = isSent ? 'You' : id
            var msg = $('<li><b>' + fromTxt + ': </b></li>').append('<span>' + message + '</span')
            hist.append(msg)
                .scrollTop(hist[0].scrollHeight);            
        }
    }

    function startPeerClient(username) {
        cookie.set('username', username);
        peerClient.connectToServerWithId(username);
    }
    // Show Username Modal
    if(username) {
        $('#user-name').val(username)
        startPeerClient(username)
    }

    EventListeners();        

    return {
        createChatWindow: function(id) {
            var toPeerId = id;
            var panel = $('<div class="panel panel-primary chat-div"><div class="panel-heading"></div>' +
                '<div class="panel-body"></div><div class="panel-footer">' +
                '<div class="form-inline"><div class="form-group">' +
                '</div></div></div></div>')

            var title = $('<span class="panel-title"></span>').text(toPeerId)
            var history = $('<ul class="chatHistory"></ul>')
            var message = $('<input type="text" class="form-control" placeholder="Enter Message">')
            var sendBtn = $('<button type="button" class="btn btn-outline-primary">Send</button>')
            var callButton = $('<a class="portfolio-link">');
            var videoCall = $('<i class="fa fa-video-camera fa-2x call-icon" aria-hidden="true"></i>');
            var audioCall = $('<i class="fa fa-phone fa-2x call-icon" aria-hidden="true"></i></a>');

            callButton.append(audioCall).append(videoCall);

            chatHistory[toPeerId] = history
            chatPanel[toPeerId] = panel

            $('.panel-heading', panel).append(title).append(callButton)
            $('.panel-body', panel).append('<span class="text-primary">You can now start chatting</span>').append(history)
            $('.form-group', panel).append(message).append(sendBtn)
            $('.chat-container > div').append(panel);
            $('.panel-heading', panel).click(function () {
                var panelBody = $(".panel-body, .panel-footer", $(this).parent());
                if(panelBody.hasClass("hide")) {
                    panelBody.removeClass("hide")
                    panel.removeClass('min')
                } else {
                    panel.addClass('min')
                    panelBody.addClass("hide")
                }                
            })

            sendBtn.click(function(event) {
                var msgText = message.val().trim()
                if(msgText) {
                    peerClient.sendMessage(toPeerId, msgText)
                    appendToHistory(toPeerId, msgText, true)
                    message.val('').focus()
                }
            });

            audioCall.click(function (event) {
                var isVideoCall = false;
                peerClient.makeCall(toPeerId, isVideoCall);
                return false
            })

            videoCall.click(function (event) {
                var isVideoCall = true;
                peerClient.makeCall(toPeerId, isVideoCall);
                return false
            })
        },

        appendHistory : appendToHistory,

        closeChatWindow : function (id) {
            if(chatPanel[id]) {
                chatPanel[id].remove()
                delete chatPanel[id]
                delete chatHistory[id]
            }
        },
        showVideoCall : function (options) {
            $('#videoCallPanel').modal('show')
            if(options['video'])
                $('#videoCallPanel .title').text('Video Call')
            else
                $('#videoCallPanel .title').text('Voice Call')
        },
        showIncomingCall : function (peerId, options) {
            $('#callConfirmationModal').modal('show')
            if(options['video'])
                var txt = "Incoming Video call from : " + peerId
            else
                var txt = "Incoming Voice call from : " + peerId
            $('#callConfirmationModal .peer-name').text(txt)
        },
        closeVideoCall : function () {
            $('.end-call').click()
        },
        setTheirVideo : function (stream) {
            var video = document.getElementById('their-video');
            if (typeof video.srcObject == "object") {
                video.srcObject = stream;
            } else {
                video.src = URL.createObjectURL(stream);
            }
        },
        setMyVideo : function (stream) {
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
            peerClient.connectToId(users[Math.floor(Math.random()*users.length)])
            for (var i = 0; i < users.length; i++) {
                var usr = '<li class="peeruser">'+ users[i] + '</li>'
                list.append(usr);
            }
        }
    };
}

var myapp, peerapp;

$(document).ready(function () {
    myapp = myjsapp(peerapp);
});
