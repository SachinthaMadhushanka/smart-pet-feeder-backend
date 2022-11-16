const express = require("express");

const mongoose = require("mongoose");

const bodyParser = require("body-parser");

const authUserRoutes = require("./routes/user");

const authAdminRoutes = require("./routes/admin");

const configs = require("./configs/configs")
const mqtt_functions = require("./functions/MqttFunctions");

const client = configs.client;

// client.publish('my/test/topic', 'Hello');

// setup the callbacks
client.on('connect', function () {
    console.log('MQTT Server Connected');
});

client.on('error', function (error) {
    console.log(error);
});

client.on('message', (topic, message) => {
    // called each time a message is received


    if (topic === "PetFeeder/Status") {
        mqtt_functions.onReceivePetFeederStatus(message.toString());
    } else if (topic === "PetFeeder/ScheduleStatus") {
        mqtt_functions.onReceiveScheduleStatus(message.toString());
    }else if(topic === "PetFeeder/FillFoods"){
        mqtt_functions.onReceiveFillFoods(message.toString());
    }
});


client.subscribe(["PetFeeder/Status", "PetFeeder/ScheduleStatus", "PetFeeder/FillFoods"]);


const app = express();


app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    next();
});


app.use("/auth/user", authUserRoutes);

app.use("/auth/admin", authAdminRoutes);


app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;

    res.status(status).json({message: message});
});

const port = process.env.PORT || 8000;

mongoose.connect('mongodb+srv://Shenal:SmartPetFeeder2021@cluster0.y3bkj.mongodb.net/Smart-Pet-Feeder?retryWrites=true&w=majority')
    .then(result => {
        console.log("Database connected !")
        app.listen(port);
    })
    .catch(err => {
        console.log("Database connection failed")
    })
