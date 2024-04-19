const catchAsync = require("./../util/catchAsync");
const Folow = require("./../Models/folowModel");
const { getAllDoc, createDoc, deleteDoc } = require("./handleFactory");

exports.setId = (req, res, next) => {
  if (!req.body.from) req.body.from = req.user.id;
  if (!req.body.to) req.body.to = req.params.id;
  next();
};

exports.getAllFolows = getAllDoc(Folow);
exports.createFolow = createDoc(Folow);
exports.deleteFolow = deleteDoc(Folow);

exports.userFolowPlan = catchAsync(async (req, res, next) => {
  const { userId, year, month } = req.params;
  let aggregatePipLine = [];
  if (year) {
    aggregatePipLine = [
      {
        $match: {
          to: userId,
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          numFolow: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          numFolwo: 1,
          title: 1,
        },
      },
    ];
  } else if (month) {
    aggregatePipLine = [
      {
        $match: {
          to: userId,
          createdAt: {
            $gte: new Date(`2023-${month}-01T00:00:00.000Z`),
            $lte: new Date(`2023-${month}-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          numFolow: { $sum: 1 },
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

  const plan = await Folow.aggregate(aggregatePipLine);

  res.status(200).json({
    state: "success",
    plan,
  });
});
