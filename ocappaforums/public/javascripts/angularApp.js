var app = angular.module('OCAPPAForums', ["ui.router", "ngSanitize"]);


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


app.factory("members", ["$http", "$window", "auth", function($http, $window, auth)
{

  var o = 
  {
    members: []
  };

  o.get = function(user)
  {
    //alert(user);

    return $http.get("/users/" + user).then(function(res)
    {
      return res.data;
    });
  }

  return o;
}]);




app.factory("threads", ["$http", "$window", 'auth', function($http, $window, auth)
{
  var o = 
  {
    threads: []
  };

  o.getAll = function()
  {
    
    return $http.get("/threads").success(function(data)
    {
      //alert("getAllInReturn");
      angular.copy(data, o.threads);
    });
  }


  o.get = function(id)
  {
    return $http.get("/threads/" + id).then(function(res)
    {
      alert(res.data.toSource());
      alert("in the factory");
      return res.data;
    });
  }


  o.create = function(post)
  {
    
    //alert(post.title);

    return $http.post("/threads", post, 
      {
        headers: {Authorization: "Bearer " + auth.getToken()}
      }).success(function(data)
    {
      //alert("ah a post created");
      //alert(data.author);
      o.threads.push(data);
    });

  };



  o.updateTitle = function(id, deets)
  {
    return $http.post("/updateTitle", deets,
    {
      headers: {Authorization: "Bearer " + auth.getToken()}
    }).success(function(data)
    {
      $window.location.reload();
    })
  }

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






  o.getUsers = function()
  {



  }


  o.addComment = function(id, comment)
  {
    return $http.post("/threads/" + id + "/comments", comment, 
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



app.controller('MainCtrl', [
'$scope',
'auth',
'threads',
function($scope, auth, threads)
{
  $scope.test = 'Hello world!';
  $scope.threads = threads.threads;

  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;

 


  $scope.addPost = function()
  {

    //alert($scope.threads[0].title);

    if (!$scope.title || $scope.title === "")
    {

      return;
    }

    var pDate = dateParse(new Date(), "est");

    threads.create(
    {
      title: $scope.title,
      content: $scope.content,
      date: pDate,
      
      
    });
    //alert($scope.title);
    // $scope.threads.push(
    // {
    //  title: $scope.title,
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



function dateParse(date, tzone)
{

  var hourDiff = 0;
  if (tzone === "est")
  {
    hourDiff = 5;
  }


  var year = "" + date.getUTCFullYear();
  var month = date.getUTCMonth() + 1;
  month = "" + month;
  var day = "" + date.getUTCDate();
  var hour = date.getUTCHours();
  hour = (hour - 5) % 24;
  hour = "" + hour;
  var minute = "" + date.getUTCMinutes();
  var sec = "" + date.getUTCSeconds();

  if (month.length === 1)
  {
    month = "0" + month;
  }
  if (day.length === 1)
  {
    day = "0" + day;
  }
  if (hour.length === 1)
  {
    hour = "0" + hour;
  }
  if (minute.length === 1)
  {
    minute = "0" + minute;
  }
  if (sec.length === 1)
  {
    sec = "0" + sec;
  }

  var fullDate = year + " " + month + " " + day + " " + hour + ":" + minute + ":" + sec;
  //alert(fullDate);
  return fullDate;
}


     function expand()
     {
      alert("expanding");
      //var element = typeof e === 'object' ? e.target : document.getElementById(e);
        var element = document.getElementById("TextArea");
        var scrollHeight = element.scrollHeight -60; // replace 60 by the sum of padding-top and padding-bottom
        element.style.height =  scrollHeight + "px";    
      };


app.controller("MembCtrl",
  [
    "$scope",
    "auth",
    "post",
    "threads",
    "members",
    //"user",
    function($scope, auth, post, threads, members)//, user)
    {
      $scope.isLoggedIn = auth.isLoggedIn;
      $scope.currentUser = auth.currentUser;
      $scope.post = post;

      //$scope.user = user;

      $scope.members = members;


      $scope.test = function()
      {
        alert(post.username);
      }


    }
  ])


app.controller("PostsCtrl",
  [
    "$scope",
    "threads",
    "post",
    "auth",

    function($scope, threads, post, auth)
    {
      //$scope.post = threads.threads[$stateParams.id];
      $scope.post = post;
      $scope.content = post.content;
      $scope.isLoggedIn = auth.isLoggedIn;
      $scope.currentUser = auth.currentUser;

      $scope.editing = false;
      $scope.amEditingPost = false;
      $scope.editingTitle = false;
      
     alert("in the controller");

      if ($scope.post.author === $scope.currentUser())
      {
        $scope.loggedInMatch = true;
      }
      else
      {
        $scope.loggedInMatch = false;
      }





      //dateParse(new Date());

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



     //$scope.bannerStyle = {'color' : 'red'};
     //$scope.lalala = "<img src='http://www.smogon.com/media/forums/data/avatars/m/67/67440.jpg.m.1434660905' />";






      $scope.getPC = function(user)
      {
        var i = 0;
        while(i < userList.length)
        {
          if (user === userList[i].username)
          {
            break;
          }
          else
          {
            i++;
          }
        }

        return userList[i].misc.postCount;
      }


     $scope.getAvatar = function(user)
     {
        var i = 0;
        while(i < userList.length)
        {
          if (user === userList[i].username)
          {
            break;
          }
          else
          {
            i++;
          }
        }

        if (userList[i].misc.avatar === "none")
        {
          return '/images/226377.jpg.m.1451801726.jpg';
        }
        else
        {
          return userList[i].misc.avatar;
        }
        

     }



      $scope.getBannerStyle = function(user)
      {
        var i = 0;
        while(i < userList.length)
        {
          if (user === userList[i].username)
          {
            break;
          }
          else
          {
            i++;
          }
        }
        //alert(i);
        //alert(userList[i].banner.backgroundCol);

        return {'color' : userList[i].banner.textCol, 'background-color' : userList[i].banner.backgroundCol, 'border-color' : userList[i].banner.borderCol};
        

      }

      $scope.getBannerText = function(user)
      {
        
        var i = 0;
        while(i < userList.length)
        {
          if (user === userList[i].username)
          {
            break;
          }
          else
          {
            i++;
          }
        }
        return userList[i].banner.text;

          // if (user == "Lemonade")
          // {
          //   return "potato toaster";
          // }
          // else if (user == "test")
          // {
          //   return "gamma tester";
          // }

      }



      $scope.addComment = function()
      {
        if ($scope.body === "") 
        {
          return;
        } 


        var pDate = dateParse(new Date(), "est");
        //alert(pDate);
        threads.addComment(post._id, 
        {
          body: $scope.body,
          author: "user",
          date: pDate,
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


      $scope.editTitle = function()
      {
        //$scope.editing = true;
        $scope.editingTitle = true;
        $scope.titleEdit = post.title;
      }


      $scope.updateTitle = function()
      {
        $scope.editingTitle = false;

        

        threads.updateTitle(post._id, 
        {
          title: $scope.titleEdit,
          _id: post._id,
        }).success(function()
        {

        });
      }

      $scope.editOP = function()
      {
        //alert(post.content);

        $scope.editing = true;

        

        $scope.data = {text: post.content};
        setTimeout(function(){$scope.autoExpandOP()}, 1);
        //$scope.autoExpand("TextArea");
        //alert($scope.data.text);
      }



      $scope.updateOP = function()
      {
        $scope.editing = false;

        //alert(post.content);        
        //alert($scope.data.text);

        threads.updateOP(post._id,
        {
          content: $scope.data.text,
          _id: post._id,
          //author: $scope.post.author,
        }).success(function()
        {
          //alert(post.content);
          //alert($scope.data.text);

          //$scope.content = $scope.data.text;

          //$scope.content = post.content;
        });


      }


      $scope.autoExpand = function(e) 
      {
        var element = typeof e === 'object' ? e.target : document.getElementById(e);
        var scrollHeight = element.scrollHeight - 1; // replace 60 by the sum of padding-top and padding-bottom
        element.style.height =  scrollHeight + "px";    
      };

     $scope.autoExpandPost = function(comment) 
     {
      //alert("autoexpanding");
     
      //var element = typeof e === 'object' ? e.target : document.getElementById(e);

      var str = "TextAreaPost" + comment._id;
      //alert(str);
        var element = document.getElementById(str);

        var scrollHeight = element.scrollHeight + 20; // replace 60 by the sum of padding-top and padding-bottom
        //var width = element.width + 100;
        element.style.height =  scrollHeight + "px"; 
        //element.style.width = width + "px"; 

      
      };

     $scope.autoExpandOP = function() 
     {
      //alert("autoexpanding");
      //var element = typeof e === 'object' ? e.target : document.getElementById(e);
        var element = document.getElementById("TextArea");
        var scrollHeight = element.scrollHeight + 20; // replace 60 by the sum of padding-top and padding-bottom
        //var width = element.width + 100;
        element.style.height =  scrollHeight + "px"; 
        //element.style.width = width + "px"; 

      
      };

      $scope.testf = function(comment)
      {
        $scope.editPost(comment);
        
        // $scope.$watch("editingPost.which == comment._id", function(n, o)
        // {
        //   //alert("the text is inside");
        //   $scope.autoExpand();
        // });
      
       
      }

      $scope.editPost = function(comment)
      {
        
        //alert(comment._id);
        //$scope.autoExpand();
        $scope.amEditingPost = true;
        $scope.editingPost = {which: comment._id};

        //alert($scope.editingPost.which);
        
        $scope.data = {text: comment.body};
        setTimeout(function()
          {
            $scope.autoExpandPost(comment)
          }, 1);
    

        
        //$scope.autoExpand();

      }

      $scope.updateComment = function(comment)
      {

        $scope.amEditingPost = false;
        $scope.editingPost = {which: ""};

        threads.updateComment(comment._id,
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
          //alert($scope.data.text);
          //$scope.comment.body = $scope.data.text;
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
        postPromise: ["threads", function(threads)
        {
          return threads.getAll();
        }]
      }
    });


    $stateProvider.state("members",
    {
      url: "/users/{username}",
      templateUrl: "/members.html",
      controller: "MembCtrl",
      resolve:
      {
        post: ["$stateParams", "members", function($stateParams, members)
        {
          return members.get($stateParams.username);
        }]        
      }
    });


    $stateProvider.state("threads",
    {
      url: "/forums/threads/{id}",
      templateUrl: "/threads.html",
      controller: "PostsCtrl",
      resolve:
      {
        post: ["$stateParams", "threads", function($stateParams, threads)
        {
          //returns json of the thread op I think
          alert("in the stateProvider")
          return threads.get($stateParams.id);
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

