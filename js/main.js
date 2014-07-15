var app = angular.module("kooi", []);

app.service('RedditFetcher', function($http, $q) {
	this.getSubReddit = function(url) {
		delete $http.defaults.headers.common['X-Requested-With'];
		return $http.get(url).then(
			function(data) {
				console.log("fetching", url)
				if (typeof data === 'object' && data.status === 200)
					return (data.data.data.children);
				else
					return $q.reject(data)
			},
			function(data, status) {
				return $q.reject(data)
			});
	};
});

app.controller('ParentController', function($scope) {
	$scope.subreddits = ["http://api.reddit.com/.json",
		"http://api.reddit.com/r/pics.json",
		"http://api.reddit.com/r/funny.json",
		"http://api.reddit.com/r/programming.json",
		// "http://api.reddit.com/r/stockmarket.json"
	];
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

app.controller('RedditController', function($scope, $http, $timeout, $exceptionHandler, RedditFetcher) {
	$scope.url = '';
	var init = function($exceptionHandler) {
		if (typeof $scope.sub === "undefined") {
			$exceptionHandler("The RedditControlelr must be initialized with a sub in scope");
		}
		$scope.url = $scope.sub;
	};
	init();

	$scope.reddit = {}
	$scope.reddit.busy = true;
	console.log("About to fetch", $scope.url)
	RedditFetcher.getSubReddit($scope.url).then(
		function(data) {
			$scope.reddit = data;
			$scope.reddit.busy = false;
		}, function(error) {
			$scope.reddit.busy = false;
			$scope.reddit.error = true;
		});


	var timeout;
	$scope.$watch('subreddit', function(newsub) {
		if (newsub) {
			if (timeout) $timeout.cancel(timeout);
			timeout = $timeout(function() {
				console.log(newsub)
				delete $http.defaults.headers.common['X-Requested-With'];
				$http.get("http://www.reddit.com/r/" + newsub + ".json").success(function(data, status) {
					$scope.reddit = data.data.children;
				}).error(function(data, status) {
					console.log(data);
				});
			}, 750);
		}
	});


});


app.controller('PostController', function($scope, $http, $timeout, $exceptionHandler, RedditFetcher) {
	$scope.commentClicked = function(link) {
		console.log($scope.post);
		var commentLink = "http://www.reddit.com" + link + ".json";
		var popupWindow = window.open('comments.html' + '?q=' + link);
		popupWindow.mySharedData = commentLink;
		popupWindow.title = $scope.post.data.title;
		popupWindow.url = $scope.post.data.url;
		popupWindow.author = $scope.post.data.author;
		popupWindow.subreddit = $scope.post.data.subreddit;
		popupWindow.ups = $scope.post.data.ups;
		popupWindow.num_comments = $scope.post.data.num_comments;
		console.log("number of comments = ", popupWindow.num_comments);
	};
});