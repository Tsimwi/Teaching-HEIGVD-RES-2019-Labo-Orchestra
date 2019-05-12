/*
 This program simulates a musician, which plays an instrument in an orchestra. Every second, the instrument
 emits a sound on a multicast group. Other programs can join the group and receive the sound. The
 sounds are transported in json payloads with the following format:

   {"uuid":"aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60","sound":"gzi-gzi","timestamp":""}

 Usage: to start a musician, type the following command in a terminal
   node thermometer.js location temperature variation

 Sources : RES course (thermometer lab)
*/

const protocol = require('./auditor-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

const moment = require('moment');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams
 */
let s = dgram.createSocket('udp4');

/*
 * Generates random uuid value
 */
const uuidv4 = require('uuid/v4');

/*
 * We'll use hashmaps to store key/value pairs (instrument/sound)
 */
const HashMap = require('hashmap');
let map = new HashMap();
map.set("piano", "ti-ta-ti");
map.set("trumpet", "pouet");
map.set("flute", "trulu");
map.set("violin", "gzi-gzi");
map.set("drum", "boum-boum");

/*
 * Let's define a javascript class for our musician. The constructor accepts
 * an uuid and an instrument
 */
function Musician(instrument) {

    this.uuid = uuidv4();
    this.instrument = instrument;

    Musician.prototype.update = function () {
        /*
         * Let's create the sound as a dynamic javascript object,
         * add the 3 properties (uuid, sound and timestamp)
         * and serialize the object to a JSON string
         */

        let sound = {
            uuid: this.uuid,
            sound: map.get(this.instrument),
            timestamp: moment()
    };
        let payload = JSON.stringify(sound);

        /*
         * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
         * the multicast address. All subscribers to this address will receive the message.
         */
        message = new Buffer(payload);

        s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
            console.log("Sending payload: " + payload + " via port " + s.address().port);
        });

    }

    /*
     * Let's take and send a measure every 1000 ms
     */
    setInterval(this.update.bind(this), 1000);

}

/*
 * Let's get the thermometer properties from the command line attributes
 * Some error handling wouldn't hurt here...
 */
let instrument = process.argv[2];

/*
 * Let's create a new musician - the regular publication of sounds will
 * be initiated within the constructor
 */
let m1 = new Musician(instrument);