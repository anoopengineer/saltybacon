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
	$scope.subreddits = ["http://api.reddit.com/hot.json", "http://api.reddit.com/r/pics.json", "http://api.reddit.com/r/programming.json", "http://api.reddit.com/r/stocks.json"];
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