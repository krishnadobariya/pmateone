const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const storeSchema = new Schema(
    {
        adminId: {type: Schema.Types.ObjectId, ref: 'User', required: true},

        outletName: {type: String, required: true},
        address: {type: String, required: true},
        oilCompany: {type: String, required: true},
        cmsCode: {type: String, required: true},

        // Dealer Information
        dealerName: {type: String, required: true},
        dealerContact: {type: String, required: true},
        dealerEmail: {type: String, required: true},
        managerName: {type: String, required: true},
        managerContact: {type: String, required: true},
        managerEmail: {type: String, required: true},

        // Product Detail
        products: {
            ms: {type: Boolean, default: false},
            hsd: {type: Boolean, default: false},
            msPremium: {type: Boolean, default: false},
            hsdPremium: {type: Boolean, default: false},
            lubes: {type: Boolean, default: false},
            alpg: {type: Boolean, default: false},
            cng: {type: Boolean, default: false},
        },

        // Nozzle Detail
        nozzleDetail: {
            ms: {numberOfNozzles: {type: Number, default: 0}, tank: {type: Number, default: 0}},
            hsd: {numberOfNozzles: {type: Number, default: 0}, tank: {type: Number, default: 0}},
            msPremium: {numberOfNozzles: {type: Number, default: 0}, tank: {type: Number, default: 0}},
            hsdPremium: {numberOfNozzles: {type: Number, default: 0}, tank: {type: Number, default: 0}},
            alpgCng: {numberOfNozzles: {type: Number, default: 0}},
        },

        // Banking Details
        bankingDetails: {
            upi: {type: String},
            cardSwipeMachines: {type: String},
            outletBanking: {type: String},
        },

        // Other Details
        otherDetails: {
            gstNo: {type: String},
            tinNo: {type: String},
            pesoLicense: {type: String},
            wmCertificate: {type: String},
            fireCertificate: {type: String},
            tradeCertificate: {type: String},
            nozzleReading: {type: String},
            earthpitCertificate: {type: String},
            stocks: {type: String},
            labourCertificate: {type: String},
            tankersReceipts: {type: String},
            panNumber: {type: String},
            creditCustomers: {type: String},
            expenses: {type: String},
            dailySalesAndPricing: {type: String},
            dailySwipeAndUpiPayments: {type: String},
            lubes: {type: String},
            bankStatements: {type: String},
        },
    },
    { timestamps: true }
);

storeSchema.index({ location: "2dsphere" });
const Store = mongoose.model("pumps", storeSchema);
module.exports = Store;
