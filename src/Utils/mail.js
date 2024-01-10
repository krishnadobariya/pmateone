let nodemailer = require('nodemailer');

const AWS = require('aws-sdk');

const SES_CONFIG = {
    accessKeyId: 'AKIA5BRN3AJEU32LTO6B',
    secretAccessKey: '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',
    region: 'ap-south-1',
};

let transporter = nodemailer.createTransport({
    SES: new AWS.SES(SES_CONFIG)
    })


let sendSms = (mobile, otp) => {
    const params = {
        Message: `Welcome! your mobile verification code is: ${otp}`,
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



let sendEmail = (recipientEmail, token) => {
    let resetUrl = `https://pet-forgotpassword/${token}`
    let params = {
        from: 'no-reply@supaw.co',
        to: recipientEmail,
        subject: 'Reset Your SuPaw Account Password',                // Subject line
        html: '<div><span>Dear User,</span><div><p>Please verify otp to reset your password.</p><br><p>Enter OTP to reset password '+token+'</p></p><br><p>Please do not share your password credentials with anyone and keep it stored safely.' +
            '</p><br><p>IMPORTANT: if this email is in your Spam folder mark it as “Not Spam” first. If you are receiving fraudulent emails from SuPaw, please forward this email to help@supaw.co</p><br></br><p>You have been registered with ' +
            recipientEmail +
            '</p><br><p>Thank you again for signing up with SuPaw. We look forward to working with you.</p></div><span>Best regards,</span><br><span>Team SuPaw.</span><br><u>https://supaw.co</u><div>',
        }
    return transporter.sendMail(params);
};

let sendEmailForEmailVerify = (recipientEmail, token) => {
    let resetUrl = `https://pet-forgotpassword/${token}`
    let params = {
        from: 'no-reply@supaw.co',
        to: recipientEmail,
        subject: 'Welcome to SuPaw - Your One-Stop App for Pet Care!',                // Subject line
        html: '<div><span>Dear User,</span><div><p>Please verify otp to verified gmail id.</p><br><p>Enter OTP to verified '+token+'</p></p><br><p>Please do not share your password credentials with anyone and keep it stored safely.' +
            '</p><br><p>IMPORTANT: if this email is in your Spam folder mark it as “Not Spam” first. If you are receiving fraudulent emails from SuPaw, please forward this email to help@supaw.co</p><br></br><p>You have been registered with ' +
            recipientEmail +
            '</p><br><p>Thank you again for signing up with SuPaw. We look forward to working with you.</p></div><span>Best regards,</span><br><span>Team SuPaw.</span><br><u>https://supaw.co</u><div>',
    }
    return transporter.sendMail(params);
};




module.exports = {
    sendEmail,
    sendSms,
    sendEmailForEmailVerify,
};
