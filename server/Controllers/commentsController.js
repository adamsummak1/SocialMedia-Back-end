const Comment = require("./../Models/commentsModel");
const { getAllDoc, createDoc, deleteDoc } = require("./handleFactory");

exports.setId = (req, res, next) => {
  if (!req.body.to) req.body.to = req.params.id;
  if (!req.body.from) req.body.from = req.user.id;
  next();
};

exports.getAllComments = getAllDoc(Comment);
exports.createComment = createDoc(Comment);
exports.deleteComment = deleteDoc(Comment);
