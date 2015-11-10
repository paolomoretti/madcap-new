angular.module("mdcp", [])
  .controller("EngineController", ['$scope', function ($scope) {

    $scope.currentSection = null;

    $scope.navigation = ['artists', 'productions', 'news', 'store', 'contacts']

    this.setTemplate = function (section) {
      $scope.currentSection = section;
    }

    this.getTemplate = function () {
      return $scope.currentSection != null ? "templates/" + $scope.currentSection + ".html" : false;
    }

    return this;

  }])

