angular
  .module("mdcp", ['ngResource', 'ngRoute'])

  .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    //$locationProvider.html5Mode(true);

    $routeProvider.when("/artists", {
      templateUrl: "/templates/artists.html"
    })

    $routeProvider.when("/artists/:artist_id", {
      templateUrl: "/templates/artist.html",
      controller: "ArtistController"
    });
  }])

  .controller("EngineController", [
    '$scope',
    '$resource',
    '$http',
    '$location',
    'wp',

    function ($scope, $resource, $http, $location, wp) {

      var ctrl = this;

      $scope.currentSection = null;

      $scope.navigation = ['artists', 'productions', 'news', 'store', 'contacts']

      $scope.data = {
        artists: $resource("http://madcapcollective.com/api.php/wp_posts?transform=1&filter=post_type,eq,artist").get()
      };

      this.openSection = function (section) {
        $location.path("/" + section);
      }

      this.openEntity = function (e) {
        if (e.post_type == 'artist') {
          $location.path("/artists/" + e.ID);
        }
      };

      this.getEntityTitle = wp.getEntityTitle;

      return this;

  }])

  .controller("ArtistController", ['$scope', '$routeParams', 'wp', '$sce', function ($scope, $routeParams, wp, $sce) {
    this.loadArtist = function () {
      var artist = _($scope.data.artists.wp_posts).find({ID: $routeParams.artist_id});

      wp.getEntityImage(artist, function (url) {
        artist.thumbnail = url;
      });

      artist.description = $sce.trustAsHtml(artist.post_content);

      $scope.artist = artist;
    }

    !$scope.data.artists.$resolved ? $scope.data.artists.$promise.then(this.loadArtist) : this.loadArtist();

  }])

  .service("wp", function ($http) {
    var API = {

      getEntityTitle: function (entity) {
        if (!entity || entity == undefined) return;
        return /en-->([a-zA-Z\s\d]*)</.exec(entity.post_title)[1]
      },

      getEntityProp: function (entity, prop, next) {
        $http.get("http://madcapcollective.com/api.php/wp_postmeta?transform=1&filter=post_id,eq," + entity.ID).then(function (res) {
          for (var i = 0; i < res.data.wp_postmeta.length; i++) {
            if (res.data.wp_postmeta[i].meta_key == prop) {
              return next(res.data.wp_postmeta[i].meta_value);
            }
          }
        })
      },

      getPostById: function (id, next) {
        $http.get("http://madcapcollective.com/api.php/wp_posts?transform=1&filter=ID,eq," + id).then(function (res) {
          next(res.data.wp_posts[0]);
        });
      },

      getEntityImage: function (entity, next) {
        API.getEntityProp(entity, "picture", function (ref) {
          API.getPostById(ref, function (data) {
            next(data.guid.replace("://new.", "://"));
          });
        });
      }
    }

    return API;
  })

  .directive("thumbTile", function () {
    return {
      restrict: "E",
      replace: true,
      template: '<div class="thumb-tile" ng-click="engineCtrl.openEntity(entity)">' +
        '<div class="image" style="background-image: url({{thumbCtrl.entity.picture}})"></div>' +
        '<div class="content">' +
          '<h3>{{::engineCtrl.getEntityTitle(entity)}}</h3>' +
        '</div>' +
      '</div>',

      controllerAs: "thumbCtrl",
      controller: function ($scope, wp) {
        var ctrl = this;
        this.entity = $scope.entity;

        if (this.entity.picture === undefined) {
          this.entity.picture = '-';

          wp.getEntityImage(this.entity, function (url) {
            ctrl.entity.picture = url;
          })
        }

        return this;
      }
    }
  })

;




//http://madcapcollective.com/api.php/wp_posts?transform=1&filter=post_type,eq,artist
