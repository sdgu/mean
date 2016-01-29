var app = angular.module('OCAPForums', ["ui.router"]);



app.factory("posts", ["$http", function($http)
{
  var o = 
  {
    posts: []
  };

  o.getAll = function()
  {
    return $http.get("/posts").success(function(data)
    {
      angular.copy(data, o.posts);
    });
  }


  o.create = function(post)
  {
    return $http.post("/posts", post).success(function(data)
    {
      o.posts.push(data);
    });
  };

  o.get = function(id)
  {
    return $http.get("/posts/" + id).then(function(res)
    {
      return res.data;
    });
  }

  o.addComment = function(id, comment)
  {
    return $http.post("/posts/" + id + "/comments", comment);
  }

  return o;
}]);



app.controller('MainCtrl', [
'$scope',
'posts',
function($scope, posts)
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


  $scope.addPost = function()
  {
    if (!$scope.title || $scope.title === "")
    {
      return;
    }

    posts.create(
    {
      title: $scope.title,
      link: $scope.link,
    });

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
    $scope.link = "";
  };

  $scope.incrementLike = function (post)
  {
    post.likes += 1;
  }


}]);

app.controller("PostsCtrl",
  [
    "$scope",
    "posts",
    "post",
    function($scope, posts, post)
    {
      //$scope.post = posts.posts[$stateParams.id];
      $scope.post = post;

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
    }





  ]);

app.config([
  "$stateProvider",
  "$urlRouterProvider",
  function($stateProvider, $urlRouterProvider)
  {
    $stateProvider.state("home",
    {
      url: "/home",
      templateUrl: "/home.html",
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
      url: "/posts/{id}",
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

    $urlRouterProvider.otherwise("home");
  }

  ]);

