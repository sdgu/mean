var mongoose = require("mongoose");

var CommentSchema = new mongoose.Schema(
{
	body: String,
	author: String,
	date: String,
	latestEdit: String,
	likedBy: [String],
	thread: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});

mongoose.model("Comment", CommentSchema);