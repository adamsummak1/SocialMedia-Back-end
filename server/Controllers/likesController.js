const Post = require("../Models/postsModel");
const catchAsync = require("../util/catchAsync");
const Like = require("./../Models/likesModel");
const { getAllDoc } = require("./handleFactory");

exports.setId = (req, res, next) => {
  if (!req.body.to) req.body.to = req.params.id;
  if (!req.body.from) req.body.from = req.user.id;
  next();
};

exports.getAllLikes = getAllDoc(Like);

exports.createLike = catchAsync(async (req, res, next) => {
  await Post.findByIdAndUpdate(req.params.postId, {
    $push: { likes: req.user.id },
  });
  res.status(200).json();
});

exports.deleteLike = catchAsync(async (req, res, next) => {
  await Post.findByIdAndUpdate(req.params.postId, {
    $pull: { likes: req.user.id },
  });
  res.status(200).json();
});

exports.getLikesPlan = catchAsync(async (req, res, next) => {
  const { postId, year, month } = req.params;

  let aggregatePipeLine = [];

  if (year) {
    aggregatePipeLine = [
      {
        $match: {
          to: postId,
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          numLike: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          numLike: 1,
          title: 1,
        },
      },
    ];
  } else if (month) {
    aggregatePipeLine = [
      {
        $match: {
          to: postId,
          createdAt: {
            $gte: new Date(`2023-${month}-01T00:00:00.000Z`),
            $lte: new Date(`2023-${month}-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          numLike: { $sum: 1 },
        },
      },
      {
        $project: {
          day: "$_id",
          numLike: 1,
          title: 1,
        },
      },
    ];
  }

  const plan = await Like.aggregate(aggregatePipeLine);

  res.status(200).json({
    state: "success",
    plan,
  });
});
