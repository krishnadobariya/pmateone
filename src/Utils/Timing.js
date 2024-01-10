const moment = require('moment')

const slotsIn = [
    {
        time: "09:00"
    },
    {
        time: "09:30"
    },
    {
        time: "10:00"
    },
    {
        time: "10:30"
    },
    {
        time: "11:00"
    },
    {
        time: "11:30"
    },
    {
        time: "12:00"
    },
    {
        time: "12:30"
    },
    {
        time: "13:00"
    },
    {
        time: "13:30"
    },
    {
        time: "14:00"
    },
    {
        time: "14:30"
    },
    {
        time: "15:00"
    },
    {
        time: "15:30"
    },
    {
        time: "16:00"
    },
    {
        time: "16:30"
    },
    {
        time: "17:00"
    },
    {
        time: "17:30"
    },
    {
        time: "18:00"
    },
    {
        time: "18:30"
    },
    {
        time: "19:00"
    },
    {
        time: "19:30"
    },
    {
        time: "20:00"
    },
    {
        time: "20:30"
    },
    {
        time: "21:00"
    }

]
const GetDates = (startDate, daysToAdd, startAt, endsAt) => {
    const timeSlots = generateTimeSlots(startAt, endsAt);
    let aryDates = []
    for (let i = 1; i <= daysToAdd; i++) {
        let currentDate = new Date(startDate.setDate(startDate.getDate() + 1))
        aryDates.push({
            day: currentDate,
            startTime: startAt,
            endTime: endsAt,
            slots: timeSlots
        })
    }
    return aryDates
}

const fetchDates = (startDate, daysToAdd, timings) => {
    let aryDates = []
    for( let i = 0; i < timings.timings.length; i ++) {
        // console.log('timing----->', timings.timings[i])
        const timeSlots = generateTimeSlots(timings.timings[i].startTime, timings.timings[i].endTime);
            let currentDate = new Date(startDate.setDate(startDate.getDate() + 1))
            aryDates.push({
                day: currentDate,
                startTime: timings.timings[i].startTime,
                endTime: timings.timings[i].endTime,
                slots: timeSlots
            })
    }
    return aryDates
}

const GetDatesExisting = async (startDate, daysToAdd, timings, startAt, endsAt) => {
    const timeSlots = generateTimeSlots(startAt, endsAt);
    let aryDates = []
    for (let i = 1; i <= daysToAdd; i++) {
        let currentDate = new Date(startDate.setDate(startDate.getDate() + 1))
        let existingFlag = false
        for(let j = 0; j < timings.length; j ++) {
            let timingDate = new Date(timings[j].day)
            if(currentDate.setHours(0,0,0,0) === timingDate.setHours(0,0,0,0)) {
                timings[j].slots = timings[j].slots
                timings[j].startTime = startAt
                timings[j].endTime = endsAt
                aryDates.push(timings[j])
                existingFlag = true
            }
        }
        if(!existingFlag) {
            aryDates.push({
                day: currentDate,
                startTime: startAt,
                endTime: endsAt,
                slots: timeSlots
            })
        }
    }
    return aryDates
}


const generateOneDaySlots = async (startDate, daysToAdd, startAt, endsAt) => {
    return generateTimeSlots(startAt, endsAt)
}


const setSlotStatus = async (slots) => {
    var aryDates = []
    for (let i = 0; i < slots.timings.length; i++) {
        var slot = []
        for (let j = 0; j < slots.timings[i].slots.length; j++) {
            if (!isTimeBetween(`${moment(slots.timings[i].day).format('YYYY-MM-DD')}T${slots.timings[i].slots[j].time}`)) {
                slot.push(slots.timings[i].slots[j])
            } else {
                let obj = {
                    "status": "UNAVAILABLE",
                    "_id": slots.timings[i].slots[j]._id,
                    "time": slots.timings[i].slots[j].time
                }
                slot.push(obj)
            }
        }
        slots.timings[i].slots = slot
        aryDates.push(slots.timings[i])
    }
    return aryDates
}

const isTimeBetween = (startTime) => {
    // console.log('startTime-------><><>', startTime)
    const start = moment(startTime, 'YYYY-MM-DD H:mm');
    const current = moment().add(6, 'hours').format('YYYY-MM-DD H:mm');
    console.log('start-------><><>', start, current, moment().format("YYYY-MM-DD HH:mm"))
    return start.isBefore(moment(current));
};

// isTimeBetween(`${moment('2023-02-27').format('YYYY-MM-DD')}T11:30`)


const compareTwoTimesForCancelAppointment = (startTime) => {
    const start = moment(startTime, 'H:mm')
        .subtract(2, "hour");
    const current = moment()
    console.log('compareTwoTimesForCancelAppointment---->', start, current)
    return current.isBefore(start);
};

const compareTwoTimesForRescheduleAppointment = (startTime) => {
    const start = moment(startTime, 'H:mm')
        .subtract(1, "hour");
    const current = moment()
    console.log('compareTwoTimesForRescheduleAppointment---->', start, current)
    return current.isBefore(start);
};

// Get Time Slot From and end
const addMinutes = (time, minutes) => {
    const date = new Date(
        new Date("01/01/2015 " + time).getTime() + minutes * 60000
    );
    const tempTime =
        (date.getHours().toString().length == 1
            ? "0" + date.getHours()
            : date.getHours()) +
        ":" +
        (date.getMinutes().toString().length == 1
            ? "0" + date.getMinutes()
            : date.getMinutes()) +
        ":" +
        (date.getSeconds().toString().length == 1
            ? "0" + date.getSeconds()
            : date.getSeconds());
    return tempTime
}

const getTimeSlots = (starttime, endtime, interval) => {
    const timeslots = [{time: starttime, status: ""}];

    while (starttime != endtime) {
        starttime = addMinutes(starttime, interval)
        timeslots.push({time: starttime, status: ""})
    }

    return timeslots
}


const getMinutesHrsString = f => {
    if (f.toString().length === 1) {
        return `0${f}`
    }
    return f
}

const disableTodaysAppointmentIdPassedOrComingInAnHour = time => {
    const currentTime = new Date()
    currentTime.setSeconds(0)
    currentTime.setHours(11) // need to remove
    let _minutes = currentTime.getMinutes()
    _minutes = _minutes + 60
    currentTime.setMinutes(_minutes)
    const arr = time.split(":")
    const _time = new Date().setHours(arr[0], arr[1], 0)
    return currentTime > _time
}
const currenttTimeIs60MinsLessThanSelected = time => {
    let currentTime = new Date()
    currentTime.setSeconds(0)
    let _minutes = currentTime.getMinutes()
    _minutes = _minutes
    currentTime.setMinutes(_minutes)
    currentTime = new Date(currentTime)
    console.log(currentTime, time, currentTime < time)
    return currentTime < time
}


const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

module.exports = {
    currenttTimeIs60MinsLessThanSelected,
    disableTodaysAppointmentIdPassedOrComingInAnHour,
    getMinutesHrsString,
    getTimeSlots,
    GetDates,
    GetDatesExisting,
    isTimeBetween,
    setSlotStatus,
    compareTwoTimes: compareTwoTimesForCancelAppointment,
    compareTwoTimesForRescheduleAppointment,
    generateOneDaySlots,
    fetchDates,
    formatDate
}





function generateTimeSlots(start, end) {
    console.log('stasEnd---->', start, end)
    const slots = [];
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    const slotDurationInMinutes = 30;
    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
        const slotStartTime = currentTime.toTimeString().slice(0, 5);
        currentTime.setMinutes(currentTime.getMinutes() + slotDurationInMinutes);
        const slotEndTime = currentTime.toTimeString().slice(0, 5);

        slots.push({ time: slotStartTime });
    }

    return slots;
}

