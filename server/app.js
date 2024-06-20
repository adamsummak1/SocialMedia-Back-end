const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

const postsRouter = require("./Routes/postsRouter");
const usersRouter = require("./Routes/usersRouter");
const likesRouter = require("./Routes/likesRouter");
const commentsRouter = require("./Routes/commentsRouter");
const folowsRouter = require("./Routes/folowsRouter");
const errController = require("./Controllers/errController");

const helmet = require("helmet");
const xss = require("xss-clean");

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});



app.use(cors());
app.use(helmet());
app.use(xss());
app.use(cookieParser());

app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/likes", likesRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/folows", folowsRouter);

app.all("*", (req, res, next) => {
  next(new Error("no url found with that id"));
});

app.use(errController);

module.exports = app;
