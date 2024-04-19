const AppError = require("../util/AppError");
const catchAsync = require("../util/catchAsync");
const User = require("./../Models/usersModel");
const {
  getAllDoc,
  createDoc,
  updateDoc,
  getDoc,
  deleteDoc,
} = require("./handleFactory");
const multer = require("multer");

exports.getAllUsers = getAllDoc(User);
exports.createUser = createDoc(User);
exports.updateUser = updateDoc(User);
exports.getOneUser = getDoc(User, "folowing folowers posts");
exports.deleteUser = deleteDoc(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.mothlyPlan = catchAsync(async (req, res, next) => {
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
          numUser: { $sum: 1 },
        },
      },
      {
        $project: {
          day: "$_id",
          numUser: 1,
          title: 1,
        },
      },
    ];
  }
  if (month) {
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
          numUser: { $sum: 1 },
        },
      },
      {
        $project: {
          day: "$_id",
          numUser: 1,
          title: 1,
        },
      },
    ];
  }
  const plan = await User.aggregate(aggregatePipeLine);

  res.status(200).json({
    state: "success",
    plan,
  });
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/../../client/public/images`);
  },
  filename: (req, file, cb) => {
    const exe = file.mimetype.split("/")[1];
    const source = `image-${req.user.id}-${Date.now()}.${exe}`;
    cb(null, source);
    req.body.photo = source;
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    new AppError("Not an image Please upload only images");
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserImage = upload.single("photos");

exports.updateUserData = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("thats not password update url !", 400));
  }
  const data = {};
  if (req.body.email) data.email = req.body.email;
  if (req.body.name) data.name = req.body.name;
  if (req.file) data.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user.id, data);

  res.status(200).json({
    state: "success",
    data: {
      user,
    },
  });
});
