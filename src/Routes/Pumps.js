const verifyUser  = require("../Config/Authentications");
const UsersController = require("../Controllers/Pumps");


module.exports=(app)=>{
    app.post("/api/Pump/v1/registration",   UsersController.registration);
    app.patch("/api/Pump/v1/PumpsUpdate/:storeId", verifyUser.userAuth, UsersController.PumpsUpdate);
    app.post("/api/Pump/v1/getSellerAllPump", verifyUser.userAuth, UsersController.openClosepump);
    app.post("/api/Pump/v1/getPumpById", UsersController.getpumpById);
    app.get("/api/Pump/v1/getAllPumps",  UsersController.getAllPumps);
};
