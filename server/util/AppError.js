class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.state = `${statusCode}`.startsWith(4) ? "fail" : "errro";
    this.isOperational = true;

    Error.captureStackTrace(this, this.contructor);
  }
}
module.exports = AppError;
