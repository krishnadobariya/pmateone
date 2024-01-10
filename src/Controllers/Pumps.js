const apiResponse = require("../Components/apiresponse");
const { body, sanitizeBody, validationResult } = require("express-validator");
const Pumps = require("../Models/Pumps");
const multer = require("multer");
const User = require("../Models/UserModel");
const notificationMethod = require("../Config/Notification");
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
 * Pumps Normal Registration By mobile directly.
 * @type {ValidationChain[]}
 */
module.exports.registration = [
    body("adminId")
        .isLength({ min: 1 })
        .trim()
        .withMessage("adminId must be specified."),
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
                const isPumpsExist = await Pumps.findOne({pumpName: req.body.pumpName, pumpId: req.body.pumpId, isDeleted: false})
                if (!isPumpsExist) {
                    const info = new Pumps(req.body).save(async function (error, success) {
                        if (error) {
                            return apiResponse.ErrorResponse(res, error);
                        }

                        return apiResponse.successResponseWithData(res, "Success.", success);
                    });
                } else {
                    return apiResponse.validationErrorWithData(res, "This pump is already exist.");
                }
            }
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    },
];



/**
 * Pumps Update details by  PumpsId
 * @type {ValidationChain[]}
 */
module.exports.PumpsUpdate = [
    async (req, res) => {
        try {
            await Pumps.updateOne(
                { _id: req.params.pumpId }, req.body );
            return apiResponse.successResponseWithData(res, "Success");
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    },
]

module.exports.openClosepump = [
    async (req, res) => {
        try {
            await Pumps.updateOne(
                { _id: req.params.pumpId }, { status: req.params.status } );
            return apiResponse.successResponseWithData(res, "Success");
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    },
];

module.exports.deletepump = [
    async (req, res) => {
        try {
            const pump = await Pumps.findOne({ _id: req.params.pumpId, isDeleted: false } );
            await Pumps.updateOne(
                { _id: req.params.pumpId }, { isDeleted: true, deletedAt: new Date() } );

            const userInfo = await User.findOne({ _id: pump.pumpId, isDeleted: false }, { fullName: 1, deviceToken: 1})
            await notificationMethod.notfctionCreate({
                senderId: pump.pumpId,
                senderType: 'pump',
                notificationType: 'Deactivate pump',
                message: `Your pump ${pump.pumpName} has been deactivated. All orders and the pump will be deleted permanently in 48 days.`,
                receiverId: pump.pumpId,
            });
            // await notificationMethod.notification(
            //     userInfo.deviceToken,
            //     `Your pump ${pump.pumpName} has been deactivated. All orders and the pump will be deleted permanently in 48 days.`,
            // );

            return apiResponse.successResponseWithData(res, "Success");
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    },
];

module.exports.getpumpById = [
    body("pumpId")
        .isLength({ min: 1 })
        .trim()
        .withMessage("pumpId must be specified."),
    sanitizeBody("pumpId").escape(),
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
                const result = await Pumps.findOne({ _id: req.body.pumpId, isDeleted: false });
                return apiResponse.successResponseWithData(res, "Success.", result);
            }
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    },
];

module.exports.getAllPumps = [
    async (req, res) => {
         try {
                const result = await Pumps.find({ status: true, isDeleted: false}).sort({ createdAt: -1 });
                return apiResponse.successResponseWithData(res, "Success.", result);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    },
];
