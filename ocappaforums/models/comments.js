var mongoose = require("mongoose");

var CommentSchema = new mongoose.Schema(
{
	body: String,
	author: String,
	date: String,
	likes: {type: Number, default: 0},
	post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});

mongoose.model("Comment", CommentSchema);