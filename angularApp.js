var app = angular.module('OCAPForums', ["ui.router"]);



app.factory("posts", [function()
{
  var o = 
  {
    posts: []
  };
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
  	$scope.posts.push(
  	{
  		title: $scope.title,
      link: $scope.link,
      likes: 0,
      comments:
      [
        {author: "pasta", body: "this is pasta", likes: 10}
      ]
  	});
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
    "$stateParams",
    "posts",
    function($scope, $stateParams, posts)
    {
      $scope.post = posts.posts[$stateParams.id];

      $scope.addComment = function()
      {
        if ($scope.body === "") 
        {
          return;
        } 
        $scope.post.comments.push(
        {
          body: $scope.body,
          author: "user",
          likes: 0
        });
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
      controller: "MainCtrl"
    });

    $stateProvider.state("posts",
    {
      url: "/posts/{id}",
      templateUrl: "/posts.html",
      controller: "PostsCtrl"
    });

    $urlRouterProvider.otherwise("home");
  }

  ]);

