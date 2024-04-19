const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: String,
    posts: {
      type: [String],
      validate: {
        validator: function (posts) {
          return posts.length <= 4;
        },
        message: "A post can have at most 4 posts.",
      },
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "a post must belong to an user"],
    },
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: [],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postsSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "to",
  localField: "_id",
});

const Post = mongoose.model("Post", postsSchema);

module.exports = Post;
