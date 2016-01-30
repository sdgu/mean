var mongoose = require ("mongoose");

var PostSchema = new mongoose.Schema(
{
	title: String,
	author: String,
	content: String,
	date: String,
	latestPost: String,
	likes: {type: Number, default: 0},
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.like = function(cb)
{
	this.likes += 1;
	this.save(cb);
};

mongoose.model("Post", PostSchema);

