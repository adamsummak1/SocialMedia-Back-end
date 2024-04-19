const express = require("express");
const router = express.Router();

const usersController = require("./../Controllers/usersController");
const authController = require("./../Controllers/authController");
const { getLikesPlan } = require("./../Controllers/likesController");
const { userFolowPlan } = require("./../Controllers/folowsController");

const folowsRouter = require("./folowsRouter");

router.use("/:id/folow", folowsRouter);

router.post("/signup", authController.signUp);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.post("/checkResetPassword/:token", authController.checkResetToken);
router.post("/resetPassword/:userId", authController.resetPassword);

router.use(authController.protect);
router.delete("/signout", authController.logout);

router.get("/getMonthlyFolowPlan/:userId/:year", userFolowPlan);
router.get("/getDaysFolowPlan/:userId/:month", userFolowPlan);

router.get("/getMonthlyLikePlan/:postId/:year", getLikesPlan);
router.get("/getDaysLikePlan/:postId/:month", getLikesPlan);

router.post(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

router.patch(
  "/updateUserData",
  usersController.uploadUserImage,
  usersController.updateUserData
);

router.get("/:id/me", usersController.getMe, usersController.getOneUser);
router.get("/:id", usersController.getOneUser);

router.use(authController.restrictTo("admin"));

router.get("/monthlyPlan/:year", usersController.mothlyPlan);
router.get("/daysPlan/:month", usersController.mothlyPlan);

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createUser);
router
  .route("/:id")

  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
