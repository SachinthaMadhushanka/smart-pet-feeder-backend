const mqtt = require("mqtt");
const PetFeeder = require("../models/pet-feeder");
const {petFeederIdPrev} = require("./configs");
exports.mqtt_options = {
    clientId: "mqttjs01",

    // host: 'broker.hivemq.com',
    port: 1883,
    protocol: 'mqtts',
    // username: 'sachi.lifef@gmail.com',
    // password: 'Sachi2018'
}

exports.petFeederIdPrev = "ffffffffffffff";

exports.API_URL = process.env.URL || "http://localhost:8000:";
// exports.API_URL = "https://smart-pet-feeder-backend.herokuapp.com";

let mqtt_client = mqtt.connect("mqtt://test.mosquitto.org", {clientId: "mqtt-tester89667"});

exports.client = mqtt_client;

let petFeederId = "0123456789";
let timout = 3;
const resetPetFeederON = () => {
    PetFeeder.findById("ffffffffffffff" + petFeederId)
        .then(petFeeder => {

            // Change this later to false
            petFeeder.status = true;

            return petFeeder.save();
        })
        .catch(err => {
            const message = err.message;

            console.log(message);
        })
}

let timer = setInterval(() => {
    resetPetFeederON(petFeederId);
}, timout * 60 * 1000);

exports.resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => {
        resetPetFeederON(petFeederId);
    }, timout * 60 * 1000);
}


