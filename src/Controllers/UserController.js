const apiResponse = require("../Components/apiresponse");
const { body, sanitizeBody, validationResult } = require("express-validator");
const User = require("../Models/UserModel");
const otpGenerate = require("../Utils/OtpGenerator");
const { sendEmail, sendEmailForEmailVerify } = require("../Utils/mail");
const multer = require("multer");
const { sendSms } = require("../Utils/sendSMS");
const {awsStorageUploadImageOrIcons} = require("../Utils/fileUploadStream");
const formidable = require("formidable");
const {createToken} = require("../Config/Authentications");
const DIR = "./Public/Images";

const storageImage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, DIR);
  },
  filename: (req, file, callBack) => {
    const generateOtp = Math.floor(100000 + Math.random() * 900000);
    callBack(null, `images_${generateOtp}_${file.originalname}`);
  },
});

const uploadImages = multer({ storage: storageImage });

/**
 * User Normal Registration By EmailId directly.
 * @type {ValidationChain[]}
 */
module.exports.registration = [
  body("fullName")
    .isLength({ min: 1 })
    .trim()
    .withMessage("fullName must be specified."),
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("email must be specified."),
  body("mobile")
      .isLength({ min: 1 })
      .trim()
      .withMessage("email must be specified."),
  body("role")
      .isLength({ min: 1 })
      .trim()
      .withMessage("role must be specified."),
  body("email")
      .isLength({ min: 1 })
      .trim()
      .withMessage("email must be specified.")
    .custom((value) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("E-mail already in use");
        }
      });
    }),
  body("password")
    .isLength({ min: 1 })
    .trim()
    .withMessage("password must be specified."),
  sanitizeBody("email").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {

        req.body.email.toLowerCase();
        if(req.body.phone) {
          const user = await User.findOne({ phone: req.body.phone, isDeleted: false })
          if(user) {
            return apiResponse.validationErrorWithData(
                res,
                "Mobile number is already linked with different account",
               null
            );
          }
        }

        if(req.body.email) {
          const user = await User.findOne({ email: req.body.email, role: req.body.role, isDeleted: false })
          if(user && user.role === req.body.role) {
            return apiResponse.validationErrorWithData(
                res,
                "Email is already linked with different account",
                null
            );
          }
        }

        req.body.password = await User.hashPassword(req.body.password);
        const info = new User(req.body).save(async function (error, success) {
          if (error) {
            return apiResponse.ErrorResponse(res, error);
          }

          success.token = createToken(success._id, success.role)
          return apiResponse.successResponseWithData(res, "Success.", success);
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];


module.exports.checkUserGmail = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("email must be specified."),
  body("role")
      .isLength({ min: 1 })
      .trim()
      .withMessage("role must be specified."),
  sanitizeBody("email").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        req.body.email.toLowerCase();
        const user = await User.findOne(
          { email: req.body.email, role: req.body.role },
          { _id: 1, registerType: 1 }
        );
        return apiResponse.successResponseWithData(res, "Success.", user);
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * User Update details by  userId
 * @type {ValidationChain[]}
 */
module.exports.userUpdate = [
  async (req, res) => {
    try {
      if(req.body.phone) {
        const user = await User.findOne({ phone: req.body.phone, isDeleted: false })
        if(user && user._id != req.params.userId) {
          return apiResponse.validationErrorWithData(
              res,
              "Mobile number is already linked with different account",
              null
          );
        }
      }
      await User.updateOne(
        { _id: req.params.userId }, req.body
      );
      return apiResponse.successResponseWithData(res, "Success");
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

module.exports.loginNormalUser = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("email must be specified."),
  body("password")
    .isLength({ min: 1 })
    .trim()
    .withMessage("password must be specified."),
  body("role")
      .isLength({ min: 1 })
      .trim()
      .withMessage("role must be specified."),
  sanitizeBody("email").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const result = await User.findOne({
          email: req.body.email.toLowerCase(),
          role: req.body.role,
        });

        if (result) {
          const validatePassword = await User.comparePasswords(
            req.body.password,
            result.password
          );
          if (!validatePassword) {
            return apiResponse.validationErrorWithData(
              res,
              "Username or Password is incorrect",
              null
            );
          }


          const token = createToken(result._id, result.role)
          await User.updateOne({ _id: result._id }, { token: token })
          result.token = token
          return apiResponse.successResponseWithData(res, "Success.", result);
        } else {
          return apiResponse.validationErrorWithData(
            res,
            "Email does not exist",
            null
          );
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

module.exports.getUser = [
  body("userId")
    .isLength({ min: 1 })
    .trim()
    .withMessage("userId must be specified."),
  sanitizeBody("userId").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const result = await User.findOne(
          { _id: req.body.userId },
          { password: 0 }
        );
        return apiResponse.successResponseWithData(res, "Success.", result);
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];


module.exports.getUsers = [
  async (req, res) => {
    try {
      const result = await User.find({}, { password: 0 });
      return apiResponse.successResponseWithData(res, "Success.", result);
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

module.exports.uploadImages = [
  (req, res) => {
    try {
      const form = formidable({ multiples: false });
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(400)
              .json({uploadError: err});
        }
        let images = [];
        if (files.files) {
            const serviceIcon = await awsStorageUploadImageOrIcons(files.files);
            images.push(serviceIcon);
        }
        return apiResponse.successResponseWithData(res, "Success.", images);
      })
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];


/**
 * User Registration and LoggedIn by mobile otp.
 * @type {ValidationChain[]}
 */
module.exports.registrationAndLoggedInByotp = [
  body("countryCode")
    .isLength({ min: 1 })
    .trim()
    .withMessage("countryCode must be specified."),
  body("phone")
    .isLength({ min: 1 })
    .trim()
    .withMessage("phone must be specified."),
  body("role")
      .isLength({ min: 1 })
      .trim()
      .withMessage("role must be specified."),
  sanitizeBody("phone").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const isUserExist = await User.findOne({
          countryCode: req.body.countryCode,
          phone: req.body.phone,
          role: req.body.role,
          isDeleted: false
        });
        if (!isUserExist) {
          const info = new User(req.body).save(async function (error, success) {
            if (error) {
              return apiResponse.ErrorResponse(res, error);
            }
            // const OTP = otpGenerate();
            const OTP = '111111';
            const sms = `Your Signing OTP is : ${OTP}. Please verify.`;
            // await sendSms(`${req.body.countryCode}${req.body.phone}`, OTP);
            await User.updateOne(
              { countryCode: req.body.countryCode, phone: req.body.phone,
                role: req.body.role
              },
              { $set: { otp: OTP } }
            );

            let obj = {
              userId: success._id,
            };
            return apiResponse.successResponseWithData(res, "Success.", obj);
          });
        } else {
          // const OTP = otpGenerate();
          const OTP = '111111';
          const sms = `Your OTP is : ${OTP}. Please verify.`;
          // await sendSms(`${req.body.countryCode}${req.body.phone}`, OTP);
          await User.updateOne(
            { countryCode: req.body.countryCode, phone: req.body.phone, role: req.body.role },
            { $set: { otp: OTP } }
          );
          let obj = {
            userId: isUserExist._id,
          };
          return apiResponse.successResponseWithData(res, "Success.", obj);
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

module.exports.verifyMobileByUserId = [
  body("countryCode")
    .isLength({ min: 1 })
    .trim()
    .withMessage("countryCode must be specified."),
  body("phone")
    .isLength({ min: 1 })
    .trim()
    .withMessage("phone must be specified."),
  body("userId")
    .isLength({ min: 1 })
    .trim()
    .withMessage("userId must be specified."),
  sanitizeBody("phone").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const isUserExist = await User.findOne({ _id: req.body.userId, isDeleted: false });
        if (!isUserExist) {
          return apiResponse.validationErrorWithData(
            res,
            "User not exist.",
            null
          );
        } else {
          // const OTP = otpGenerate();
          const OTP = '111111';
          const sms = `Your OTP is : ${OTP}. Please verify.`;
          // await sendSms(`${req.body.countryCode}${req.body.phone}`, OTP);
          await User.updateOne(
            { _id: req.body.userId },
            {
              $set: {
                otp: OTP,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
              },
            }
          );
          return apiResponse.successResponseWithData(res, "Success.");
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Resend OTP.
 * @type {ValidationChain[]}
 */
module.exports.resendOtp = [
  body("countryCode")
    .isLength({ min: 1 })
    .trim()
    .withMessage("countryCode must be specified."),
  body("phone")
    .isLength({ min: 1 })
    .trim()
    .withMessage("phone must be specified."),
  body("userId")
    .isLength({ min: 1 })
    .trim()
    .withMessage("userId must be specified."),
  sanitizeBody("phone").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        // const OTP = otpGenerate();
        const OTP = '111111';
        const sms = `Your OTP is : ${OTP}. Please verify.`;
        await sendSms(`${req.body.countryCode}${req.body.phone}`, OTP);
        await User.updateOne(
          {
            _id: req.body.userId,
            countryCode: req.body.countryCode,
            phone: req.body.phone,
          },
          { $set: { otp: OTP } }
        );
        return apiResponse.successResponseWithData(res, "Success.");
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * .
 * @type {ValidationChain[]}
 */
module.exports.verifyOtp = [
  body("countryCode")
    .isLength({ min: 1 })
    .trim()
    .withMessage("countryCode must be specified."),
  body("otp").isLength({ min: 6 }).trim().withMessage("otp must be specified."),
  body("phone")
    .isLength({ min: 1 })
    .trim()
    .withMessage("phone must be specified."),
  body("userId")
    .isLength({ min: 1 })
    .trim()
    .withMessage("userId must be specified."),
  sanitizeBody("phone").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const isUserExist = await User.findOne({
          _id: req.body.userId,
          countryCode: req.body.countryCode,
          phone: req.body.phone,
          isDeleted: false
        });
        if (!isUserExist) {
          return apiResponse.validationErrorWithData(
            res,
            "Sorry, This user is not exist.",
            isUserExist
          );
        }
        if (isUserExist) {
          if (isUserExist.otp === req.body.otp) {
            const token = createToken(isUserExist._id, isUserExist.role)
            await User.updateOne(
              {
                _id: req.body.userId,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
              },
              {
                $set: {
                  otp: null,
                  isMobileVerified: true,
                  lastLoggedIn: new Date(),
                  token,
                },
              }
            );
            const isUser = await User.findOne({
              _id: req.body.userId,
              countryCode: req.body.countryCode,
              phone: req.body.phone,
              isDeleted: false
            });
            isUser.token = token
            return apiResponse.successResponseWithData(res, "Success.", isUser);
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Sorry, OTP is not correct."
            );
          }
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

//Mail Verification
module.exports.sendOtpForMailVerify = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("email must be specified."),
  body("userId")
    .isLength({ min: 1 })
    .trim()
    .withMessage("userId must be specified."),
  body("role")
      .isLength({ min: 1 })
      .trim()
      .withMessage("role must be specified."),
  sanitizeBody("email").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        req.body.email.toLowerCase();
        const result = await User.findOne({
          _id: req.body.userId,
          role: req.body.role,
          isDeleted: false
        });

        if (result) {
          const token = otpGenerate();
          await User.updateOne({ _id: result._id }, { otp: token });
          await sendEmailForEmailVerify(req.body.email, token);

          return apiResponse.successResponseWithData(res, "Success");
        }
        return apiResponse.validationErrorWithData(
          res,
          "Something went wrong."
        );
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * User Normal Registration By EmailId directly.
 * @type {ValidationChain[]}
 */
module.exports.verifyEmailOtp = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("email must be specified."),
  body("otp").isLength({ min: 6 }).trim().withMessage("otp must be specified."),
  body("userId")
    .isLength({ min: 6 })
    .trim()
    .withMessage("userId must be specified."),
  sanitizeBody("phone").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const isUserExist = await User.findOne({
          _id: req.body.userId,
          isDeleted: false
        });
        if (!isUserExist) {
          return apiResponse.validationErrorWithData(
            res,
            "Sorry, This user is not exist.",
            isUserExist
          );
        }
        // if (isUserExist.status) {
        // 	return apiResponse.unauthorizedResponse(res, "Sorry, This user is currently disabled. Please contact admin.");
        // }
        if (isUserExist) {
          if (isUserExist.otp === req.body.otp) {
            await User.updateOne(
              { _id: req.body.userId },
              {
                $set: {
                  otp: null,
                  isMailVerified: true,
                  email: req.body.email.toLowerCase(),
                },
              }
            );
            const isUser = await User.findOne({
              _id: req.body.userId,
              email: req.body.email.toLowerCase(),
              isDeleted: false
            });
            return apiResponse.successResponseWithData(res, "Success.", isUser);
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Sorry, OTP is not correct."
            );
          }
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
