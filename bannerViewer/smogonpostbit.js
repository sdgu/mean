var app = angular.module('flapperNews', ['colorpicker.module']);

app.controller('MainCtrl', [
'$scope',
function($scope)
{
 
  $scope.bannerText = "Plain Yogurt";
  $scope.avvy = 'http://www.smogon.com/media/forums/avatars/shaymin.gif';
  $scope.spr = "http://www.smogon.com/dex/media/sprites/xyicons/sneasel.png";

  $scope.sprite = "sneasel";

  $scope.go = function()
  {
  	if ($scope.sprite == "")
  	{
  		$scope.sprite = "sneasel";
  	}


  	$scope.theStyle = {'color' : $scope.textColor, 'background-color' : $scope.backColor};
  	$scope.avvy = $scope.avatar;
  	$scope.spr = "http://www.smogon.com/dex/media/sprites/xyicons/" + $scope.sprite + ".png";

  	$scope.export = "Banner Text: " + $scope.bannerText + "\n" + 
  					"Hover Text: " + $scope.hoverText + "\n" +
  					"Text Color: " + $scope.textColor + "\n" +
  					"Background Color: " + $scope.backColor + "\n" +
  					"Pokemon: " + $scope.sprite + "\n"	;

  }



}]);