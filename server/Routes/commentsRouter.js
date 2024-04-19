const express = require("express");
const commentsController = require("./../Controllers/commentsController");
const router = express.Router({ mergeParams: true });
const authController = require("./../Controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(authController.restrictTo("admin"), commentsController.getAllComments)
  .post(commentsController.setId, commentsController.createComment);

router.delete("/:id", commentsController.deleteComment);

module.exports = router;
