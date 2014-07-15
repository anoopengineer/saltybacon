var app = angular.module("reddit-app", []);

app.service('RedditCommentFetcher', function($http, $q) {
	this.getComments = function(url) {
		delete $http.defaults.headers.common['X-Requested-With'];
		return $http.get(url).then(
			function(data) {
				console.log("fetching", url, data)
				if (typeof data === 'object' && data.status === 200)
					return data.data;
				else
					return $q.reject(data)
			},
			function(data, status) {
				return $q.reject(data)
			});
	};
});

app.controller('RedditCommentController', function($scope, $location, $sce, RedditCommentFetcher) {
	if (window.mySharedData) {
		$scope.url = window.mySharedData; //'http://www.reddit.com/r/aww/comments/29k4qh/a_nice_pillow_doesnt_hurt_either/.json';
	} else {
		console.log("Invalid shared data.")
		console.log("window.location.search = ", window.location.search);
		var s = window.location.search.split("?q=")[1];
		var commentLink = "http://www.reddit.com" + s + ".json";
		$scope.url = commentLink;
	}

	$scope.page = {};
	$scope.page.title = window.title;
	$scope.page.url = window.url;
	$scope.page.author = window.author;
	$scope.page.subreddit = window.subreddit;
	$scope.page.ups = window.ups;
	$scope.page.num_comments = window.num_comments;

	console.log("author = ", window.author);
	$scope.reddit = {}
	$scope.reddit.busy = true;
	RedditCommentFetcher.getComments($scope.url).then(
		function(data) {
			$scope.reddit.header = data[0].data.children[0];
			$scope.reddit.comments = data[1].data.children;
			$scope.reddit.busy = false;
			$scope.reddit.error = false;
			$scope.targetUrl = $sce.trustAsResourceUrl($scope.reddit.header.data.url);
			if (!$scope.page)
				$scope.page = {};
			$scope.page.title = $scope.reddit.header.data.title;
			$scope.page.url = $scope.reddit.header.data.url;
			$scope.page.author = $scope.reddit.header.data.author;
			$scope.page.subreddit = $scope.reddit.header.data.subreddit;
			$scope.page.ups = $scope.reddit.header.data.ups;
			$scope.page.num_comments = $scope.reddit.header.data.num_comments;
		}, function(error) {
			$scope.reddit.busy = false;
			$scope.reddit.error = true;
		});

	$scope.GetType = function(data) {
		if (typeof data === "undefined") {
			return "default";
		}
		var url = data.url.toLowerCase();
		if (url.indexOf(".gif") > -1 || url.indexOf(".png") > -1 || url.indexOf(".jpg") > -1 || url.indexOf(".jpeg") > -1) {
			return "image";
		} else if (data.selftext) {
			return "self";
		} else {
			return "default";
		}
	};

	$scope.GetSmallerImageUrl = function(url) {
		// url = url.toLowerCase();
		if (url.indexOf("imgur.com") <= 0) {
			return url;
		}

		// Dont do this for gif. You will stop the animation
		// if (url.indexOf(".gif") > -1) {
		// 	url = url.replace(".gif", "m.gif");
		// } else

		if (url.indexOf(".png") > -1) {
			url = url.replace(".png", "m.png");
		} else if (url.indexOf(".jpg") > -1) {
			url = url.replace(".jpg", "m.jpg");
		} else if (url.indexOf(".jpeg") > -1) {
			url = url.replace(".jpeg", "m.jpeg");
		}
		return url;

	};
});

app.directive('redditComment', function() {
	console.log("in app.directive");
	return {
		restrict: 'A',
		scope: true,
		// scope: {
		// 	comment: '@comment'
		// },
		// template: '<div class="sparkline"><h4>Weather for {{comment}}</h4>',
		templateUrl: 'templates/comments.html'
	}
});