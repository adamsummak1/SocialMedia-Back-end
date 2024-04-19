const AppError = require("../util/AppError");
const Post = require("./../Models/postsModel");
const Folow = require("./../Models/folowModel");
const multer = require("multer");
const {
  getAllDoc,
  createDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} = require("./handleFactory");
const catchAsync = require("../util/catchAsync");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/../../client/public/images&videos`);
  },
  filename: (req, file, cb) => {
    const exe = file.mimetype.split("/")[1];
    const source = `post-${req.user.id}-${Date.now()}.${exe}`;
    cb(null, source);
    if (!req.body.posts) {
      req.body.posts = [];
    }
    req.body.posts.push(source);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new AppError("File type not supported"));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPosts = upload.array("posts", 4);

exports.setId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllPosts = getAllDoc(Post, "user");
exports.createPost = createDoc(Post);
exports.getOnePost = getDoc(Post, "likes comments user");
exports.updatePost = updateDoc(Post);
exports.deletePost = deleteDoc(Post);

exports.getFolowingPost = catchAsync(async (req, res, next) => {
  const folowing = await Folow.find({ to: req.user.id });

  const toUserIds = folowing.map((follow) => follow.to.id);

  const posts = await Post.find({ user: { $in: toUserIds } });

  res.status(200).json({
    state: "success",
    result: posts.length,
    documents: posts,
  });
});

exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const { year, month } = req.params;

  let aggregatePipeLine = [];

  if (year) {
    aggregatePipeLine = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          numPosts: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          numPosts: 1,
          title: 1,
        },
      },
    ];
  } else if (month) {
    aggregatePipeLine = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`2023-${month}-01T00:00:00.000Z`),
            $lte: new Date(`2023-${month}-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          numPosts: { $sum: 1 },
        },
      },
      {
        $project: {
          day: "$_id",
          numPosts: 1,
          title: 1,
        },
      },
    ];
  }

  const posts = await Post.aggregate(aggregatePipeLine);
  res.status(200).json({
    state: "success",
    data: {
      posts,
    },
  });
});
