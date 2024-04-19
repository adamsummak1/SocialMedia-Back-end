const express = require("express");
const {
  getAllPosts,
  createPost,
  uploadPosts,
  updatePost,
  deletePost,
  getOnePost,
  monthlyPlan,
  setId,
  getFolowingPost,
} = require("./../Controllers/postsController");
const authController = require("./../Controllers/authController");
const likesRouter = require("./likesRouter");
const commentsRouter = require("./commentsRouter");
const likesController = require("./../Controllers/likesController");

const router = express.Router();

router.use("/:id/like", likesRouter);
router.use("/:id/comment", commentsRouter);

router.get("/", getAllPosts);

router.get("/isLoggedIn", authController.isLoggedIn);

router.use(authController.protect);
router.get("/folowing", getFolowingPost);
router.post("/likes/:postId", likesController.createLike);

router.delete("/likes/:postId", likesController.deleteLike);

router.post("/", setId, uploadPosts, createPost);
router.route("/:id").get(getOnePost).patch(updatePost).delete(deletePost);

router.use(authController.restrictTo("admin"));

router.get("/monthlyPlan/:year", monthlyPlan);
router.get("/daysPlan/:month", monthlyPlan);

module.exports = router;
