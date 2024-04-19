const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const usersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      validate: [validator.isEmail, "Invalid email Please write a valid email"],
      required: [true, "Please provide youre email"],
    },
    password: {
      type: String,
      min: [8, "a password must be more that 8 charactor"],
      required: true,
      select: false,
    },
    passwordConfirm: {
      type: String,
      min: [8, "a password must be more that 8 charactor"],
      required: true,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "passwords are not the same",
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    photo: String,
    active: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresIn: {
      type: Number,
    },
    reported: {
      type: Boolean,
      default: false,
      select: false,
    },
    whyReport: {
      type: String,
      select: false,
    },
    blocks: [String],
    checkedPasswordToken: {
      type: Boolean,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

usersSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

usersSchema.virtual("folowing", {
  ref: "Folow",
  foreignField: "from",
  localField: "_id",
});

usersSchema.virtual("folowers", {
  ref: "Folow",
  foreignField: "to",
  localField: "_id",
});

usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

usersSchema.methods.comparePasswords = async function (
  password,
  currentPassword
) {
  return await bcrypt.compare(password, currentPassword);
};
usersSchema.methods.changedPasswordAfter = function (JWTTimesStamp) {
  if (this.passwordChangedAt) {
    const changedPasswordAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimesStamp < changedPasswordAt;
  }
  return false;
};

usersSchema.methods.createSendToken = function () {
  const token = crypto.randomBytes(3).toString("hex");
  this.passwordResetToken = crypto.Hash("sha256").update(token).digest("hex");

  this.passwordResetExpiresIn = Date.now() * 1000 * 60 * 60;
  return token;
};

const User = mongoose.model("User", usersSchema);

module.exports = User;
