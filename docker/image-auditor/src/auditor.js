/*
 This program simulates an auditor, which joins a multicast
 group in order to receive sounds emitted by musicians.
 The measures are transported in json payloads with the following format:
   {"timestamp":1394656712850,"location":"kitchen","temperature":22.5}
 Usage: to start the station, use the following command in a terminal
   node station.js
*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple
 * application-level protocol
 */
const protocol = require('./auditor-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');
const moment = require('moment');
const net = require('net');

const HashMap = require('hashmap');
var map = new HashMap();
var sound = new HashMap();
sound.set("ti-ta-ti", "piano");
sound.set("pouet", "trumpet");
sound.set("trulu", "flute");
sound.set("gzi-gzi", "violin");
sound.set("boum-boum", "drum");

// let's create a TCP server
const server = net.createServer();

// it reacts to events: 'listening', 'connection', 'close', etc.
// register callback functions, to be invoked when the events
// occur (everything happens on the same thread)
server.on('listening', callbackFunctionToCallWhenSocketIsBound);
server.on('connection', callbackFunctionToCallWhenNewClientHasArrived);

//Start listening on port 2205
server.listen(protocol.PROTOCOL_PORT);

// This callback is called when the socket is bound and is in
// listening mode. We don't need to do anything special.
function callbackFunctionToCallWhenSocketIsBound() {

    console.log("The socket is bound and listening");
    console.log("Socket value: %j", server.address());
}

// This callback is called after a client has connected.
function callbackFunctionToCallWhenNewClientHasArrived(socket) {

    console.log("A new TCP client has arrived : " + socket.address().address);
    var activeMusicians = [];

    map.forEach(function(value, key) {
        if (!(moment().diff(moment(value.activeSince), "seconds") <= 5)) {
            map.delete(key);
        } else {
            activeMusicians.push(value);
        }

    });

    socket.write(JSON.stringify(activeMusicians));
    socket.pipe(socket);
    socket.end();
    console.log("TCP client leaved.")
}


/*
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const socket = dgram.createSocket('udp4');
socket.bind(protocol.PROTOCOL_MULTICAST_PORT, function() {
    console.log("Joining multicast group");
    socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

function Musician(uuid, instrument, activeSince) {
    this.uuid = uuid;
    this.instrument = instrument;
    this.activeSince = activeSince;
}

/*
 * This call back is invoked when a new datagram has arrived.
 */
socket.on('message', function(msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);
    var object = JSON.parse(msg);
    var musician = new Musician(object.uuid, sound.get(object.sound), object.timestamp);
    map.set(object.uuid, musician);
});