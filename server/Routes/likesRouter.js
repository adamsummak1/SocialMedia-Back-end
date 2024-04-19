const express = require("express");
const {
  getAllLikes,
  createLike,
  deleteLike,
  setId,
} = require("./../Controllers/likesController");

const router = express.Router({ mergeParams: true });
const authController = require("./../Controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(authController.restrictTo("admin"), getAllLikes)
  .post(setId, createLike);
router.delete("/:id", deleteLike);

module.exports = router;
