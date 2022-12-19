peerapp = (function() {
    'use strict';

    console.log("Peer client started");

    var PEER_SERVER = 'nhom6ltw.herokuapp.com';
    var PORT = 443;
    var connectedPeers = {};
    var myPeerID;
    var peer;

    // Compatibility shim
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Connect to server
    function connectToServerWithId(peerId) {
        myPeerID = peerId;
        myPeerID = myPeerID.toLowerCase();
        if(peer && peer.disconnected == false) {
            peer.disconnect()
        }
        peer = new Peer(myPeerID, { host: PEER_SERVER, port: PORT, path: '/', secure: true});  
        peerCallbacks(peer);
    }    
    console.log(peer)
    initializeLocalMedia({'audio': true, 'video': true});
    // Data channel
    // Handle a Text and File connection objects
    function connect(c) {
        console.log(c.peer)
        // Handle a chat connection.
        if (c.label === 'chat') {
            // myapp.createChatWindow(c.peer)
            c.on('data', function(data) {
                console.log(c.peer + ' : ' + data);
                // Append data to chat history
                myapp.appendHistory(c.peer, data)   
            });

            c.on('close', function() {
                delete connectedPeers[c.peer];
                // myapp.closeChatWindow(c.peer)
            });
            connectedPeers[c.peer] = c;
        }
    }
    function peerCallbacks(peer) {
        peer.on('open', function(id) {
            console.log('My peer ID is: ' + id);
            console.log(new Date());
            
            fetchOnlinePeers();
        });

        peer.on('connection', connect);

        peer.on('call', function(call) {
            console.log("Receiving a call")
            console.log(call)
            // New call requests from users
            // Ask Confirm before accepting call
            // if(window.incomingCall) {
            //     window.incomingCall.answer()
            //     setTimeout(function () {
            //         window.incomingCall.close();
            //         window.incomingCall = call
            //         myapp.showIncomingCall(call.peer);
            //     }, 1000)
            // } else {
            if(window.existingCall) {
                console.log("call")
                rejectIncomingCall(call)
            } else {
                var metadata = {'audio': true, 'video': true}
        
                initializeLocalMedia(metadata, function() {
                    call.answer(window.localStream);
                    myapp.showVideoCall(metadata);
                    callConnect(call)
                });
            }
            // }
        });

        peer.on('close', function(conn) {
            // New connection requests from users
            console.log("Peer connection closed");
        });

        peer.on('disconnected', function(conn) {
            console.log("Peer connection disconnected : " + conn);
            console.log(new Date());
            if(conn != myPeerID) {
                return
            }            
            setTimeout(function () {
                connectToServerWithId();
            }, 5000);
            
            // peer.reconnect()
        });

        peer.on('error', function(err) {
            console.log(new Date());
            console.log("Peer connection error:")
            console.log(err)
            if("unavailable-id" == err.type) {
                // ID Already taken, so assigning random ID after 3 attempts
                peerIdAlreadyTakenCount++;
                if(peerIdAlreadyTakenCount >= 3) {
                    peerIdAlreadyTakenCount = 0;
                    myPeerID = generateRandomID(4);
                }
            } else if ("peer-unavailable" == err.type) {
                myapp.showError(err.message)
            }
        });
    }
    function connectToId(id) {
        if(!id || peer.disconnected)
            return;
        var requestedPeer = id;
        if (!connectedPeers[requestedPeer]) {
            // Create 2 connections, one labelled chat and another labelled file.
            var c = peer.connect(requestedPeer, {
                label: 'chat',
                serialization: 'none',
                metadata: { message: 'hi i want to chat with you!' }
            });
            c.on('open', function() {
                connect(c);
            });
            c.on()
            c.on('error', function(err) { alert(err); });
        }
    }

    function sendMessage(peerId, msgText) {
        
        if(connectedPeers[peerId]) {
            var conn = connectedPeers[peerId]
            conn.send(msgText)
            console.log(conn)
        }
    }

    // Make sure things clean up properly.
    window.onunload = window.onbeforeunload = function(e) {
        if (!!peer && !peer.destroyed) {
            peer.destroy();
        }
    };

    
    function initializeLocalMedia(options, callback) {

        if(options) {
            options['audio'] = true;
            if(options['video'])
                options['video'] = true;
        } else {
            options['audio'] = true;
            options['video'] = false;
        }

        // Get audio/video stream
        navigator.getUserMedia(options, function(stream) {
            // Set your video displays
            window.localStream = stream;
            myapp.setMyVideo(window.localStream)
            if(callback)
                callback();
        }, function(err) {
            console.log("The following error occurred: initializeLocalMedia" + err.name);
            alert('Unable to call ' + err.name)
        });
    }

    function callConnect(call) {
        
        // Hang up on an existing call if present
        if (window.existingCall) {
            window.existingCall.close();
        }

        // Wait for stream on the call, then set peer video display
        call.on('stream', function(stream) {
            console.log(stream)
            myapp.setTheirVideo(stream)
        });

        // UI stuff
        window.existingCall = call;
        call.on('close', function() {
            console.log("Call Ending")
            myapp.closeVideoCall()
        });
    }

    function makeCall(callerID, isVideoCall) {
        console.log("Calling..." +  callerID)
        
        var options = {audio: true};
        if(isVideoCall)
            options['video'] = true;

        initializeLocalMedia(options, function() {
            var call = peer.call(callerID, window.localStream, { 'metadata' : options });
            callConnect(call)
        });
    }
    function muteVideo(status) {
        if(status == false)
            status = false
        else 
            status = true
        if(window.localStream) {
            var videoTracks = window.localStream.getVideoTracks()
            if(videoTracks && videoTracks[0])
                videoTracks[0].enabled = status;
        }
    }
    function muteAudio(status) {
        if(status == false)
            status = false
        else 
            status = true
        if(window.localStream) {
            var audioTracks = window.localStream.getAudioTracks()
            if(audioTracks && audioTracks[0])
                audioTracks[0].enabled = status;
        }
    }

    function fetchOnlinePeers() {
        $.ajax("https://" + PEER_SERVER + "/peerjs/" + myPeerID + "/onlineusers")
        .done(function( data ) {
            // console.log(data);
            if(data.msg == 'Success') {
                data.users.splice(data.users.indexOf(myPeerID), 1)
                myapp.updateOnlieUsers(data.users)
            }
        });
    }

    // Update Online users on every 5 seconds
    setInterval(function () {
        fetchOnlinePeers()
    }, 5000)

    return {
        makeCall : makeCall,
        sendMessage : sendMessage,
        connectToId : connectToId,
        connectToServerWithId : connectToServerWithId,
        muteVideo : muteVideo,
        muteAudio : muteAudio,
    }
})();
