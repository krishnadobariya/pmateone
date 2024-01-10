require('dotenv').config();

const twilio = require('twilio');
const AWS = require("aws-sdk");

const accountSid = 'ACb786fb7b30212cc5bc4285c6c7f4e365';
const authToken = 'c0dac21d07efe101d3a84256e9978ee3';
const from = '+441622320458';

const SES_CONFIG = {
    accessKeyId: 'AKIA5BRN3AJEU32LTO6B',
    secretAccessKey: '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',
    region: 'ap-south-1',
};


const sendSmsByTwilio = (sms, phone) => {
    const client = twilio(accountSid, authToken);
    client.messages.create(
        {
            body: sms,
            // eslint-disable-next-line object-shorthand
            from: from,
            to: `+91${phone}`,
        },
    )
        .then((message) => {
            console.log(('message-->', message));
            // eslint-disable-next-line object-shorthand
            return message;
        })
        .catch((error) => {
            console.log(('err-->', error));
            // eslint-disable-next-line object-shorthand
            return error;
        });
};

let sendSms = (mobile, otp) => {
    const params = {
        Message: `Use OTP ${otp} to log into your SuPaw account. Do not share the OTP or your number with anyone`,
        PhoneNumber: mobile,
    };

    return new AWS.SNS(SES_CONFIG).publish(params).promise()
        .then(message => {
            console.log('OTP SEND SUCCESS', message);
        })
        .catch(err => {
            console.log('Error ',err)
            return err;});
};

module.exports = { sendSmsByTwilio, sendSms };
