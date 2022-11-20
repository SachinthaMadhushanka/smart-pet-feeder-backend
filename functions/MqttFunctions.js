const {client, petFeederIdPrev, resetTimer} = require("../configs/configs");
const PetFeeder = require('../models/pet-feeder');
const User = require('../models/user');
const mongoose = require("mongoose");
const {use} = require("express/lib/router");


// PetFeeder/Status
/*
    {
        "petFeederId": "0123456789"
    }
 */
exports.onReceivePetFeederStatus = (data) => {

    let dataJson = JSON.parse(data);

    PetFeeder.findById(petFeederIdPrev + dataJson.petFeederId)
        .then(petFeeder => {

            petFeeder.status = true;
            resetTimer();
            return petFeeder.save();
        })
        .catch(err => {
            const message = err.message;

            console.log(message);
        })
}


// PetFeeder/ScheduleStatus
/*
    {
        "petFeederId": "0123456789",
        "scheduleId": "6373a9a55dbe7273e74a14a1",
        "status": true
    }
 */
exports.onReceiveScheduleStatus = (data) => {
    let user;
    let dataJson = JSON.parse(data);
    let petFeeder;
    let feed_time;

    PetFeeder.findById(petFeederIdPrev + dataJson.petFeederId)
        .then(fetFeeder => {
            petFeeder = fetFeeder;
            return User.findById(fetFeeder.owner);
        })
        .then(owner => {
            user = owner;
            const index = user.ActiveSchedules.findIndex((schedule) => {
                return schedule._id.toString() === dataJson.scheduleId;
            });

            if (index < 4 && index >= 0) {

                // Add Schedule to History
                let history_schedule = {
                    _id: new mongoose.Types.ObjectId(),
                    title: user.ActiveSchedules[index].title,
                    date_time: user.ActiveSchedules[index].date_time,
                    status: dataJson.status
                }

                feed_time = history_schedule.date_time;


                user.ScheduleHistory.push(history_schedule)

                user.ActiveSchedules.splice(index, 1);
            } else {
                const error = new Error("Schedule Not found!");
                error.statusCode = 404;
                throw error;
            }
            return user.save();


        })
        .then((result) => {
            if (dataJson.status && petFeeder.remainingRounds > 0) {
                petFeeder.remainingRounds = petFeeder.remainingRounds - 1;
            }


            if (dataJson.status) {
                petFeeder.lastFeedTime = feed_time;

            }

            return petFeeder.save();
        })
        .catch(err => {
            const message = err.message;

            console.log(message);
        })
}


// PetFeeder/FillFoods
/*
    {
        "petFeederId": "0123456789"
    }
 */
exports.onReceiveFillFoods = (data) => {
    let dataJson = JSON.parse(data);

    PetFeeder.findById(petFeederIdPrev + dataJson.petFeederId)
        .then(petFeeder => {

            petFeeder.remainingRounds = 4;

            return petFeeder.save();
        })
        .catch(err => {
            const message = err.message;

            console.log(message);
        })
}


/*

[
    {
        "schedule_id":"6373a3c911a2c0fefbe94123",
        "date_time":"2022-11-15T17:35:00.000Z"
     },

     {
        "schedule_id":"6373a3d911a2c0fefbe94131",
        "date_time":"2022-11-15T17:36:00.000Z"
      }
]
 */


exports.publishSchedules = (schedules) => {
    client.publish('PetFeeder/Schedules', schedules, {retain: false, qos:1});
}


/*

    {
        "schedule_id":"6373a34e11a2c0fefbe94115",
        "date_time":"2022-11-15T14:33:50.353Z"
    }

 */
exports.publishFeedNow = (schedule) => {

    if (client.connected === true) {
        client.publish('PetFeeder/FeedNow', schedule, {retain: false, qos:1});
    }
}


/*

    {
        "schedule_id":"6373a34e11a2c0fefbe94115",
        "date_time":"2022-11-15T14:33:50.353Z"
    }

 */
exports.publishAskImage = () => {

    if (client.connected === true) {
        client.publish('PetFeeder/SeePet', "{}", {retain: false, qos:1});
    }
}
