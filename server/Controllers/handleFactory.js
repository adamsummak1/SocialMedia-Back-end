const ApiFeature = require("../util/ApiFeature");
const AppError = require("../util/AppError");
const catchAsync = require("../util/catchAsync");

exports.getAllDoc = (Model, populate) => {
  return catchAsync(async (req, res, next) => {
    const apiFeature = new ApiFeature(Model.find(), req.query)
      .filter()
      .sort()
      .limitFielde()
      .pagintaion();

    if (populate) apiFeature.query.populate(populate);

    const doc = await apiFeature.query;

    res.status(200).json({
      state: "success",
      result: doc.length,
      document: doc,
    });
  });
};

exports.createDoc = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      state: "success",
      data: {
        post: doc,
      },
    });
  });
};

exports.getDoc = (Model, populate) => {
  return catchAsync(async (req, res, next) => {
    let doc = Model.findById(req.params.id);
    if (populate) {
      doc = doc.populate(populate);
    }

    doc = await doc.exec();

    if (!doc) {
      return next(new AppError("No document with that id", 404));
    }

    res.status(200).json({
      state: "success",
      data: {
        post: doc,
      },
    });
  });
};

exports.deleteDoc = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("no document with that id", 404));
    }
    res.status(204).json();
  });
};

exports.updateDoc = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body);
    if (!doc) {
      return next(new AppError("no document with that id"));
    }
    res.status(200).json({
      state: "success",
      data: {
        post: doc,
      },
    });
  });
};
