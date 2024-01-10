let moment        = require('moment')


const requestIp = require('request-ip');
let geoip = require('geoip-lite');



const DATE_FORMAT = 'YYYY-MM-DD - hh:mm A';
const DATE_FORMAT_INPUT_TAG = 'YYYY-MM-DDTHH:mm';
const DATE_FORMAT_WITHOUT_TIME = 'YYYY-MM-DD';
const SECOND_TO_HOURS_DURATION = 'H[h] m[m]';
const SECOND_TO_MINS_DURATION = 'm[m] s[s]';
const TIME_FORMAT = 'hh:mm A';



module.exports={
  localToUTC:(dateIn, defaultValue = 'N/A')=>{
      return moment(dateIn).isValid() ? moment(dateIn).utc() : defaultValue
        },


 utcToLocal:(dateIn, defaultValue = 'N/A')=>{
     return moment(dateIn).isValid()
               ? moment(dateIn).local().format(DATE_FORMAT)
               : defaultValue;

},


 inputFormat:(dateIn, defaultValue = 'N/A')=>{
     return dateIn.isValid()
               ? dateIn.format(DATE_FORMAT_INPUT_TAG)
               : defaultValue
},

 getTimeAccordingTimezone:(req)=>{
  const clientIp = requestIp.getClientIp(req);
       let payload = geoip.lookup(clientIp)
          let exactTime = 'N/A'
         if(!payload){
           return exactTime
         }else{
           let time = moment().format(DATE_FORMAT_INPUT_TAG)
            let exactTime = time.toLocaleString('en-US', { timeZone: payload.timezone })
           console.log('timezone-->', exactTime)
           return exactTime
         }

},

}
