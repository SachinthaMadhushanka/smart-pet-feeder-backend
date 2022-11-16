const mqtt = require("mqtt");
const configs = require("./configs");
exports.mqtt_options = {
    clientId:"mqttjs01",

    // host: 'broker.hivemq.com',
    port: 1883,
    protocol: 'mqtts',
    // username: 'sachi.lifef@gmail.com',
    // password: 'Sachi2018'
}

exports.petFeederIdPrev = "ffffffffffffff";

exports.API_URL = "http://localhost:8000:";
// export const API_URL = "https://smart-pet-feeder-backend.herokuapp.com";

let mqtt_client = mqtt.connect("mqtt://test.mosquitto.org", {clientId:"mqtt-tester12345"});

exports.client = mqtt_client;
