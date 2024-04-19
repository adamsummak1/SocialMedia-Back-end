const catchAsync = require("./../util/catchAsync");
const AppError = require("./../util/AppError");
const User = require("./../Models/usersModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendMail = require("../util/sendMail");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (user, res, statusCode) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    state: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  res.cookie("adam", "test");
  sendToken(user, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next("Invalid password or password");
  }

  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  if (!user || !(await user.comparePasswords(password, user.password))) {
    return next(new AppError("Email or password is wrong", 400));
  }

  sendToken(user, res, 200);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    state: "success",
    message: "logging out was successful",
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError("Your'e not logged in Please log in to get access", 404)
    );
  }
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("user belongs this token does no longer exist", 404)
    );
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "user have changed passwod please log in again to get acccess",
        400
      )
    );
  }

  req.user = user;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  try {
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );

    const currentUser = await User.findById(decoded.id).populate(
      "folowing folowers"
    );

    if (!currentUser) {
      return next();
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    res.json({ state: "success", id: currentUser.id, currentUser });
  } catch (err) {
    res.status(200).json({ state: "fail", message: "invalid token" });
  }
};

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (role.includes(req.user.role)) {
      return next();
    } else {
      return next(new AppError("you not alowed to access this route", 500));
    }
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No user with that id", 404));
  }

  const resetToken = user.createSendToken();
  user.save({ validateBeforeSave: false });
  const message = `Youre password reset token : ${resetToken}`;

  try {
    await sendMail({
      email: user.email,
      subject: "youre token is valid for only 10 minute",
      message,
    });
    res.status(200).json({
      state: "success",
      message: "email sends",
    });
  } catch (err) {
    res.status(404).json({
      state: "success",
      message: err.message,
    });
  }
});

exports.checkResetToken = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresIn: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("you're token has expired in !!", 400));
  }

  user.checkedPasswordToken = true;
  user.save({ validateBeforeSave: false });
  res.status(200).json({
    state: "success",
    data: {
      userId: user.id,
    },
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(new AppError("no user want update password with that id", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordChangedAt = Date.now();
  user.passwordResetToken = undefined;
  user.passwordResetExpiresIn = null;
  user.checkedPasswordToken = false;

  await user.save();
  res.status(200).json({
    state: "success",
    message: "password update was successful",
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.comparePasswords(currentPassword, user.password))) {
    return next(new AppError("Passwords not currect", 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  sendToken(user, res, 200);
});
