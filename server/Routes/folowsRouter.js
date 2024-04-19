const express = require("express");
const folowsController = require("./../Controllers/folowsController");
const router = express.Router({ mergeParams: true });
const authController = require("./../Controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(authController.restrictTo("admin"), folowsController.getAllFolows)
  .post(folowsController.setId, folowsController.createFolow);

router.delete("/:id", folowsController.deleteFolow);

module.exports = router;
