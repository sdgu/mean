var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Post = mongoose.model("Thread");
var Comment = mongoose.model("Comment");
var passport = require("passport");

var jwt = require("express-jwt");

var auth = jwt({secret: "SECRET", userProperty: "payload"});

var User = mongoose.model("User");


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) 
  	{ 
  		return true; //
  		//next(); 
  	}
  else return false;
  req.session.error = 'Please sign in!';
  //req.session.returnTo = req.path;
  //res.redirect('/login');
}



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post("/register", function(req, res, next)
{
	if (!req.body.username || !req.body.password)
	{
		return res.status(400).json({message: "Please fill out all fields"});
	}

	var user = new User();

	user.username = req.body.username;

	user.setPassword(req.body.password);

	user.misc.avatar = "none";

	user.banner.text = "plain yogurt";

	user.banner.backgroundCol = "#f0f0f0";
	user.misc.postCount = 0;
	//var d = new Date();
	user.misc.joinDate = Date();

	//d.getFullYear() + " " + d.getMonth() + " " + d.getDate() + " " + d.getHours() + " " + d.getMinutes() + " " + d.getSeconds();

	user.save(function(err)
	{
		if (err)
		{
			return next(err);
		}

		return res.json({token: user.generateJWT()})
	});


});

router.post("/login", function(req, res, next)
{
	if (!req.body.username || !req.body.password)
	{
		return res.status(400).json({message: "Fill out all fields"});
	}
	
	passport.authenticate("local", function(err, user, info)
	{


		if (err) return next(err);

		if (user)
		{
			console.log("authing?");

			return res.json({token: user.generateJWT()});
		}
		else
		{
			return res.status(401).json(info);
		}
	})(req, res, next);


});


router.param("post", function(req, res, next, id)
{
	var query = Post.findById(id);

	query.exec(function(err, post)
	{
		if (err)
		{
			return next(err);
		}
		if (!post)
		{
			return next(new Error("Can't find post"));
		}

		req.post = post;
		return next();
	});
});

router.param("username", function(req, res, next, name)
{
	var query = User.findOne({"username" : name});

	query.exec(function(err, user)
	{
		if (err) return next(err);
		if (!user) return next(new Error("rip"));

		req.user = user;
		return next();
	});
});

router.get("/users/:username", function(req, res)
{

	 console.log(req.user);
	// req.user.populate("username", function(err, user)
	// {
	// 	if (err) return err;
	 res.json(req.user);
	// });

	
});


router.get("/threads/:post", function(req, res)
{
	console.log(req.post);

	//populate gets the comments from the ids
	req.post.populate("comments", function(err, post)
	{
		

		if (err)
		{
			return next(err)
		}
		res.json(req.post);
	});
});

router.put("/threads/:post/like", auth, function(req, res, next)
{
	req.post.like(function(err, post)
	{
		if (err)
		{
			return next(err);
		}

		res.json(post);
	});
	
});

router.post("/threads/:post/comments", auth, function(req, res, next)
{
	var comment = new Comment(req.body);
	var post = Post;

	var postID = req.body.postID;
	comment.thread = req.post;
	comment.date = req.body.date;
	comment.author = req.payload.username;


	User.findOneAndUpdate(
	{
		username : req.payload.username
	},
	{
		$inc: {'misc.postCount' : 1}
	}, function(err, docs)
	{
		if (err) return next(err);

		comment.save(function(err, comment)
		{
			if (err)
			{
				return next(err);
			}

			req.post.comments.push(comment);

			post.findOneAndUpdate(
			{
				_id: postID
			},
			{
				'latestPost.date': req.body.date,
				'latestPost.user': req.payload.username,
				$inc: {replies: 1}
			}, function(err, docs)
			{
				if (err) return next(err);

				req.post.save(function(err, post)
				{
					if (err)
					{
						return next(err);
					}

					res.json(comment);
				});

			})



		});
	});
});


router.get("/users", function(req, res, next)
{
	User.find(function(err, users)
	{
		if (err)
		{
			return next(err);
		}

		var data = [];
		for (var i = 0; i < users.length; i++)
		{
			
			data.push(
				{
					"_id" : users[i]._id,
					"username" : users[i].username,
					"banner" : users[i].banner,
					"misc" : users[i].misc

				});
		}

		res.json(data);

	})
})

router.get("/threads", function(req, res, next)
{
	Post.find(function(err, threads)
	{
		//console.log(threads);

		if (err)
		{
			return next(err);
		}

		res.json(threads);
	});
});

router.get("/comments", function(req, res)
{
	Comment.find(function(err, comments)
	{
		if (err) return next(err);

		res.json(comments);
	});
});

router.post("/threads", auth, function(req, res, next)
{
	

	var post = new Post(req.body);
	
	
	post.author = req.payload.username;
	post.replies = 0;
	post.latestPost.date = req.body.date;
	post.latestPost.user = req.payload.username;
	

// 	var PostSchema = new mongoose.Schema(
// {
// 	title: String, ye
// 	author: String, ye
// 	content: String, ye
// 	date: String, ye
// 	latestPost: 
// 	{
// 		date: String, ye
// 		user: String ye
// 	},
// 	replies: Number, ye
// 	likes: {type: Number, default: 0},
// 	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
// });
	
	User.findOneAndUpdate(
	{
		username : req.payload.username
	},
	{
		$inc: {'misc.postCount' : 1}
	}, function(err, docs)
	{
		if (err) return next(err);
		console.log("inc username pc: " + docs);
	

		post.save(function(err, post)
		{
			if (err)
			{
				return next(err);
			}

			res.json(post);
		});
	});

});


router.post("/updateTitle", auth, function(req, res, next)
{
	console.log(req.body);

	var collection = Post;
	collection.findOneAndUpdate(
	{
		_id: req.body._id
	},
	{
		title: req.body.title
	}, function(err, docs)
	{
		if (err) return next(err);
		res.json(docs);
	});

});

router.post("/updateOP", auth, function(req, res, next)
{
	console.log("the post for updating op");
	console.log(req.body);
	// console.log(req.payload.username);
	// console.log(req.body._id);

	var collection = Post;
	collection.findOneAndUpdate(
	{
		_id: req.body._id
	},
	{
		content: req.body.content
	}, function(err, docs)
	{
		if (err) return next(err);


		console.log("updated");
		res.json(docs);

	});

	// authorscoll.findOneAndUpdate(
	// {
	// 	author: author
	// }, 
	// {
	// 	"$push": {characters : charName}
	// }, 
	// {
	// 	safe: true, upsert: true
	// },
	// function(err, docs)



});

router.post("/updateComment", auth, function(req, res, next)
{
	console.log("updating comment");
	console.log(req.body.postID);

	var postID = req.body.postID;
	var commentID = req.body.commentID;
	var text = req.body.text;


	var post = Post;
	var comment = Comment;

	comment.findOneAndUpdate(
	{
		_id: commentID
	},
	{
		body: text
	}, function(err, docs)
	{
		if (err) return next(err);

		console.log(docs);
		console.log("updated");
		res.json(docs);
	});
});


module.exports = router;
