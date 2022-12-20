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
        peer.on('open', fetchOnlinePeers);
        peer.on('connection', connect);
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
    }    
    console.log(peer)
    // Data channel
    // Handle a Text and File connection objects
    function connect(c) {

        // Handle a chat connection.
        if (c.label === 'chat') {
            // myapp.createChatWindow(c.peer)
            console.log(c.peer)
            c.on('data', function(data) {
                //console.log(c.peer + ' : ' + data);
                // Append data to chat history
                var message = data.split("+$$$+")
                myapp.appendHistory(c.peer, message[0])   
                peid = message[1]
            });

            c.on('close', function() {
                delete connectedPeers[c.peer];
                // myapp.closeChatWindow(c.peer)
            });
            connectedPeers[c.peer] = c;
        }
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
                metadata: { message: userid }
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
            conn.send(msgText + "+$$$+" +userid )
            console.log(conn)
        }
    }

    // Make sure things clean up properly.
    window.onunload = window.onbeforeunload = function(e) {
        if (!!peer && !peer.destroyed) {
            peer.destroy();
        }
    };


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
        sendMessage : sendMessage,
        connectToId : connectToId,
        connectToServerWithId : connectToServerWithId,
    }
})();
