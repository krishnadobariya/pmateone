const verifyUser = require("../Config/authValidation");
const UsersController = require("../Controllers/UserController");

module.exports = (app) => {
  app.post("/api/vet/v1/checkUserGmail", UsersController.checkUserGmail);
  app.post("/api/vet/v1/registration", UsersController.registration);
  app.post("/api/vet/v1/getUser", UsersController.getUser);
  app.get("/api/vet/v1/getUsers", UsersController.getUsers);
  app.post("/api/vet/v1/loginNormalUser", UsersController.loginNormalUser);
  app.patch("/api/vet/v1/userUpdate/:userId", UsersController.userUpdate);
  app.post(
    "/api/vet/v1/sendOtpForMailVerify",
    UsersController.sendOtpForMailVerify
  );
  app.post("/api/vet/v1/verifyEmailOtp", UsersController.verifyEmailOtp);
  app.post("/api/vet/v1/uploadImages", UsersController.uploadImages);
  app.post(
    "/api/vet/v1/registrationAndLoggedInByOtp",
    UsersController.registrationAndLoggedInByotp
  );
  app.post(
    "/api/vet/v1/Verify-mobile-for-exiting-user",
    UsersController.verifyMobileByUserId
  );
  app.post("/api/vet/v1/resendOtp", UsersController.resendOtp);
  app.post("/api/vet/v1/verifyOtp", UsersController.verifyOtp);
};
