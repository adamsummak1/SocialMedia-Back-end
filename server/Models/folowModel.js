const mongoose = require("mongoose");

const folowsSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "a folow must belong to an user"],
  },
  to: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "a folow must be to an user"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

folowsSchema.pre(/^find/, function (next) {
  this.populate({
    path: "from to",
    select: "photo name",
  });
  next();
});

const Folow = mongoose.model("Folow", folowsSchema);

module.exports = Folow;
