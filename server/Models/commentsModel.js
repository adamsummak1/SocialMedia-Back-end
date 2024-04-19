const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "a comments must belong to an user"],
  },
  to: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: [true, "a comment must belong to a post"],
  },
  comment: {
    type: String,
    required: [true, "how a comment without text!!"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentsSchema.pre(/^find/, function (next) {
  this.populate({
    path: "from",
    select: "photo name ",
  });
  next();
});

const Comment = mongoose.model("Comment", commentsSchema);

module.exports = Comment;
