const AppError = require("../util/AppError");

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path} : ${error.value}`;
  return new AppError(message, 500);
};

const handleDuplicateFieldsDB = () => {
  const message = "duplicate fields please try anothers value";
  return new AppError(message, 500);
};

const handleValidationErrorDB = () => {
  const errors = Object.keys(err.errors).map((el) => el.message);
  const message = `INvalid inpits data ${errors.join(". ")}`;
  return message;
};

const handleJWTError = () => {
  return "Invalid token plase log in  to get access";
};
const handleJWTExpiresIn = () => {
  return "Youre token has expired in please log in again to get access";
};

const handleDevError = (err, res) => {
  res.status(err.statusCode).json({
    state: err.state,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
0;
const handleProdError = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      state: error.state,
      message: error.message,
    });
  } else {
    res.status(500).json({
      state: "error",
      message: "something went very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.state = err.state || "error";

  if (process.env.NODE_ENV === "development") {
    handleDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    console.log(err.name);
    error.name = err.name;
    console.log(error.name);
    error.message = err.message;
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB();
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") handleJWTError();
    if (error.name === "TokenExpiredError") handleJWTExpiresIn();

    handleProdError(error, res);
  }
};
