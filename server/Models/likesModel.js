const mongoose = require("mongoose");

const likesSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "a like must belong to an user"],
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: [true, "a like must belong to a post"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Like = mongoose.model("Like", likesSchema);

module.exports = Like;
