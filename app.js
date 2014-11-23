var app = angular.module('githubsearch', []);

app.controller('SearchController', function SearchController($scope, GitHub) {

	$scope.errors = [];
	$scope.activeRepo = null;
	$scope.repos = []; 
	$scope.user = null;
	$scope.query = null;

	$scope.reset = function() {
		$scope.activeRepo = null;
		$scope.user = null;
	};

	$scope.executeSearch = function executeSearch() {
		$scope.reset();
	
		GitHub.searchRepos($scope.query, function (error, data) {
			if (!error && data) {
				$scope.repos = data.items;
			}
			else {
				$scope.handleError(error);
			}
		});
	};

	$scope.openRepo = function openRepo(name) {
		GitHub.getRepo(name, function (error, data) {
			if (!error) {
				$scope.activeRepo = data;
				$scope.user = data.owner;

				$scope.getReadme(name);

				$scope.getUserRepos($scope.user.login);
			}
			else {
				$scope.handleError(error);
			}
		});
	};
	
	$scope.getReadme = function getReadme(name) {
		GitHub.getReadme(name, function(error, data) {
			if (!error) {
				$scope.activeRepo.readme = data;
			}
			else {
				$scope.activeRepo.readme = 'No README found!';
			}
		});
	};
	
	$scope.getUserRepos = function getUserRepos(login) {
		GitHub.getUserRepos(login, function(error, data) {
			 if (!error) {
			 	$scope.user.repos = data;
			 }
			 else {
				$scope.user.repos = [];
				$scope.handleError(error);
			 }
		});	
	};
	
	$scope.handleError = function handleError(data) {
		var error = data || { message: "Request failed." };
		$scope.errors.push(error);
		
		console.error(data);
	};
});

app.factory('GitHub', function GitHub($http) {

	return {
		searchRepos: function searchRepos(query, callback) {
			$http.get('https://api.github.com/search/repositories', { params: { q: query } })
				.success(function(data) {
					callback(null, data);
				})
				.error(function(data, status) {
					callback(data);
				}); 
		},
		getRepo: function getRepo(name, callback) {
			$http.get('https://api.github.com/repos/' + name)
				.success(function(data) {
					callback(null, data);
                })
				.error(function(data, status) {
					callback(data);
				}); 
		},
		getReadme: function getReadme(name, callback) {
			$http.get('https://api.github.com/repos/'+ name +'/readme')
				.success(function(data) {
					callback(null, atob(data.content));
				})
				.error(function(data, status) {
					callback(data);
				}); 
		},
		getUserRepos: function getUserRepos(name, callback) {
			$http.get('https://api.github.com/users/'+ name +'/repos')
				.success(function(data) {                           
                    callback(null, data);
                })
				.error(function(data, status) {
					callback(data);
				}); 
		}
	};
});
