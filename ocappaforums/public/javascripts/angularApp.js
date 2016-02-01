var app = angular.module('OCAPForums', ["ui.router"]);


app.factory("auth", ["$http", "$window", function($http, $window)
{
  var auth = {};

  auth.saveToken = function(token)
  {
    $window.localStorage["ocappaforums-token"] = token;
  }

  auth.getToken = function()
  {
    return $window.localStorage["ocappaforums-token"];
  }

  auth.isLoggedIn = function()
  {
    var token = auth.getToken();

    if (token)
    {
      var payload = JSON.parse($window.atob(token.split(".")[1]));


      return payload.exp > Date.now() / 1000;
    }
    else
    {
      return false;
    }
  }

  auth.currentUser = function()
  {
    if (auth.isLoggedIn())
    {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split(".")[1]));

      //alert(payload.username);
      return payload.username;
    }
  }



  auth.register = function(user)
  {
    return $http.post("/register", user).success(function(data)
    {
      auth.saveToken(data.token);
    });
  }

  auth.logIn = function(user)
  {
    return $http.post("/login", user).success(function(data)
    {
      auth.saveToken(data.token);
    });
  }

  auth.logOut = function()
  {
    $window.localStorage.removeItem("ocappaforums-token");
    $window.location.href = "/";
  }



  return auth;
}])




app.factory("posts", ["$http", "$window", 'auth', function($http, $window, auth)
{
  var o = 
  {
    posts: []
  };

  o.getAll = function()
  {
    
    return $http.get("/posts").success(function(data)
    {
      //alert("getAllInReturn");
      angular.copy(data, o.posts);
    });
  }


  o.create = function(post)
  {
    
    //alert(post.title);

    return $http.post("/posts", post, 
      {
        headers: {Authorization: "Bearer " + auth.getToken()}
      }).success(function(data)
    {
      //alert("ah a post created");
      //alert(data.author);
      o.posts.push(data);
    });

  };

  o.updateOP = function(id, post)
  {
    return $http.post("/updateOP", post, 
    {
      headers: {Authorization: "Bearer " + auth.getToken()}
    }).success(function(data)
    {
      
      //alert(post.content);
      //alert(data.content);
      //$scope.updatedContent = data.content;
      //alert("done updating");
      $window.location.reload();
    });
  }

  o.get = function(id)
  {
    return $http.get("/posts/" + id).then(function(res)
    {
      //alert(res.data.toSource());
      return res.data;
    });
  }


  o.getUsers = function()
  {



  }


  o.addComment = function(id, comment)
  {
    return $http.post("/posts/" + id + "/comments", comment, 
      {
        headers: {Authorization: "Bearer " + auth.getToken()}
      });
  }

  o.updateComment = function(id, comment)
  {
    return $http.post("/updateComment", comment, 
    {
      headers: {Authorization: "Bearer " + auth.getToken()}
    }).success(function(data)
    {
      $window.location.reload();
    });
  }


  return o;
}]);

app.factory("users", ["$http", "$window", 'auth', function($http, $window, auth)
{
  var o = 
  {
    users: []
  };

  o.getAllUsers = function()
  {
    
    return $http.get("/users").success(function(data)
    {
      //alert("getAllInReturn");
      angular.copy(data, o.users);
    });



  }


}]);

app.controller('MainCtrl', [
'$scope',
'auth',
'posts',
function($scope, auth, posts)
{
  $scope.test = 'Hello world!';
  $scope.posts = posts.posts;
  // $scope.posts = 
  // [
  // {
  // 	title: "post 1",
  // 	likes: 5
  // },
  // {
  // 	title: "post 2",
  // 	likes: 69
  // }
  // ];

//   app.controller('NavCtrl', [
// '$scope',
// 'auth',
// function($scope, auth){



//   $scope.isLoggedIn = auth.isLoggedIn;
//   $scope.currentUser = auth.currentUser;
//   $scope.logOut = auth.logOut;
// }]);
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;

 

  //alert(auth.currentUser);
  //$("#author").text($scope.currentUser);

  // $.getJSON("/comments", function(data)
  // {

  //   $.each(posts.posts, function(index, vaule)
  //   {
      
  //     var mostRecentCommentID = this.comments[this.comments.length-1];
  //     var arrayPos = data.map(function(arrayItem)
  //     {
  //         return arrayItem._id;
  //     }).indexOf(mostRecentCommentID);

  //     if (arrayPos > -1)
  //     {
  //       //alert(arrayPos + " " + data[arrayPos].date);
  //       $scope.latestPost = data[arrayPos].date;
  //     }

  //   })
    
  //   //alert(post.comments[post.comments.length - 1]);



  // });


  $scope.addPost = function()
  {

    //alert($scope.posts[0].title);

    if (!$scope.title || $scope.title === "")
    {

      return;
    }

    posts.create(
    {
      title: $scope.title,
      content: $scope.content,
      date: Date(),
      latestPost: Date(),
      
    });
    //alert($scope.title);
  	// $scope.posts.push(
  	// {
  	// 	title: $scope.title,
   //    link: $scope.link,
   //    likes: 0,
   //    comments:
   //    [
   //      {author: "pasta", body: "this is pasta", likes: 10}
   //    ]
  	// });
    $scope.title = "";
    $scope.content = "";
  };

  $scope.incrementLike = function (post)
  {
    post.likes += 1;
  }


}]);


// app.controller("BannerController", 
//   [
//   "$scope",
//   "posts",
//   "post",
//   "auth",
//   function($scope, posts, post, auth)
//   {

//     //$scope.test = "o.o";

//   }]);


app.controller("PostsCtrl",
  [
    "$scope",
    "posts",
    "post",
    "auth",

    function($scope, posts, post, auth)
    {
      //$scope.post = posts.posts[$stateParams.id];
      $scope.post = post;
      $scope.content = post.content;
      $scope.isLoggedIn = auth.isLoggedIn;
      $scope.currentUser = auth.currentUser;

      $scope.editing = false;
      $scope.amEditingPost = false;

      

      if ($scope.post.author === $scope.currentUser())
      {
        $scope.loggedInMatch = true;
      }
      else
      {
        $scope.loggedInMatch = false;
      }



      var userList = [];
      $.ajax(
      {
        url: "/users",
        async: false,
        dataType: "json",
        success: function (json)
        {
          userList = json;
        }
      });

      //alert(userList.toSource());




      $scope.checkAuthor = function(user)
      {
        return (user == "Lemonade") || (user == "test");
      }

      $scope.getBannerText = function(user)
      {
        
          if (user == "Lemonade")
          {
            return "potato toaster";
          }
          else if (user == "test")
          {
            return "gamma tester";
          }

      }



      $scope.addComment = function()
      {
        if ($scope.body === "") 
        {
          return;
        } 

        posts.addComment(post._id, 
        {
          body: $scope.body,
          author: "user",
          date: Date(),
          postID: post._id,
        }).success(function(comment)
        {
          $scope.post.comments.push(comment);
        });
        // $scope.post.comments.push(
        // {
        //   body: $scope.body,
        //   author: "user",
        //   likes: 0
        // });
        $scope.body = "";
      };

      $scope.editOP = function()
      {
        //alert(post.content);

        $scope.editing = true;
        

        $scope.data = {text: post.content};
        //alert($scope.data.text);
      }



      $scope.updateOP = function()
      {
        $scope.editing = false;

        //alert(post.content);        
        //alert($scope.data.text);

        posts.updateOP(post._id,
        {
          content: $scope.data.text,
          _id: post._id,
          //author: $scope.post.author,
        }).success(function()
        {
          //alert(post.content);
          //alert($scope.data.text);
          $scope.content = $scope.data.text;
          //$scope.content = post.content;
        });


      }

      $scope.editPost = function(comment)
      {
        
        //alert(comment._id);
        $scope.editingPost = {which: comment._id};
        //alert($scope.editingPost.which);
        $scope.amEditingPost = true;
        $scope.data = {text: comment.body};

      }

      $scope.updateComment = function(comment)
      {

        $scope.amEditingPost = false;
        $scope.editingPost = {which: ""};

        posts.updateComment(comment._id,
        {
          text: $scope.data.text,
          postID: post._id,
          commentID: comment._id,
        }).success(function()
        {
          //alert("editing post i hope");
          //alert($scope.data.text);

          //alert($scope.comment.body);
          //$scope.post.comments.push(comment);
          $scope.comment.body = $scope.data.text;
        });
      }



    }
  ]);

app.controller("AuthCtrl",
  [
    "$scope",
    "$state",
    "auth",
    function($scope, $state, auth)
    {
      $scope.user = {};

      $scope.register = function()
      {
        auth.register($scope.user).error(function(error)
        {
          $scope.error = error;
        }).then(function()
        {
          $state.go("forums");
        });
      };

      $scope.logIn = function()
      {
        auth.logIn($scope.user).error(function(error)
        {
          $scope.error = error;
        }).then(function()
        {
          $state.go("forums");
        });
      }



    }

  ])

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){



  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);


app.config([
  "$stateProvider",
  "$urlRouterProvider",
  "$locationProvider",
  function($stateProvider, $urlRouterProvider, $locationProvider)
  {
    $stateProvider.state("forums",
    {
      url: "/forums",
      templateUrl: "/forums.html",
      controller: "MainCtrl",
      resolve:
      {
        postPromise: ["posts", function(posts)
        {
          return posts.getAll();
        }]
      }
    });

    $stateProvider.state("posts",
    {
      url: "/forums/posts/{id}",
      templateUrl: "/posts.html",
      controller: "PostsCtrl",
      resolve:
      {
        post: ["$stateParams", "posts", function($stateParams, posts)
        {
          return posts.get($stateParams.id);
        }]
      }
    });

      $stateProvider.state('login', {
        url: '/login',
        templateUrl: '/login.html',
        controller: 'AuthCtrl',
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('forums');
          }
        }]
      });
      $stateProvider.state('register', {
        url: '/register',
        templateUrl: '/register.html',
        controller: 'AuthCtrl',
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('forums');
          }
        }]
      });


    //$locationProvider.html5Mode({enabled: true});
      //, requireBase: false});
    $urlRouterProvider.otherwise("forums");
  }

  ]);

