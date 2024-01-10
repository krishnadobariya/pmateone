const otpGenerate = () => {
    let otp = Math.floor(100000 + Math.random() * 9000);
    console.log(otp)
    return otp;
}

module.exports = otpGenerate
