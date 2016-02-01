var mongoose = require ("mongoose");

var PostSchema = new mongoose.Schema(
{
	title: String,
	author: String,
	content: String,
	date: String,
	latestPost: 
	{
		date: String,
		user: String
	},
	replies: Number,
	likedBy: [String],
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.like = function(cb)
{
	this.likes += 1;
	this.save(cb);
};

mongoose.model("Thread", PostSchema);

