// Global variables
  var map,infoWindow;

  var Location = function(data){
    'use strict'
    this.title = data.title;
    this.adress = data.adress;
    this.location = data.location;
    this.marker = null;
  };
  //declared Global function for Google
  function errorGoogle() {
    'use strict';
    alert('Having problems reaching Google, might the connection be down?');
  }; 

  function initMap() {
        'use strict';
        // Create a map object and specify the DOM element for display.
         map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 59.314726, lng: 18.072188},
          scrollwheel: false,
          styles: styles,
          zoom: 15
        });
        //kicking of the applyBindings in the initMap function to be sure that the map is already in place.
        ko.applyBindings(new ViewModel());

        //If there is a problem with reaching google, this function is triggered from the index file.

  }

var ViewModel = function () {
  'use strict';
  var self = this;
  infoWindow = new google.maps.InfoWindow();
  // Empty array for adding all locations
  self.locationCollection = [];
  //
  self.filteredLocations = ko.observableArray();

  //REF: click event databind knockout - http://knockoutjs.com/documentation/click-binding.html
  self.search = ko.observable("");

  // To load the locations in the beginning.
  locations.forEach(function (location) {
    self.locationCollection.push(new Location(location));
  });

  self.locationCollection.forEach(function (location) {
    // We add a marker to the location and place it in Google maps.
    location.marker = new google.maps.Marker({
      map:map,
      position: location.location,
      title: location.title,
      animation: google.maps.Animation.DROP
    });

    // Add click-listner to the marker,
    location.marker.addListener('click', toggleMarker);

    //function for handling the click event
    //REF: https://developers.google.com/maps/documentation/javascript/examples/marker-animations
    function toggleMarker() {
      // making sure there is no animation set
      if (location.marker.getAnimation() !== null) {
        location.marker.getAnimation(null)
      } else {
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
          location.marker.setAnimation(null);
        },1400);
      }
    }

    //Add and open the infowindow when click event is triggered
    google.maps.event.addListener(location.marker, 'click', function () {
      //add content to yelp function
      yelp(location.title,location.location.lat,location.location.lng, location.marker,location.adress);
    });

  });

    // In the DOM there is a click databind in the <li>. when clicked this will initiate
    // We trigger the bounce in the map marker
  self.clickInList = function (location, marker) {
    google.maps.event.trigger(location.marker, 'click');
  };

    // Pushing out the locations in the data.
  self.locationCollection.forEach(function (location) {
      self.filteredLocations.push(location);
  });

  // Simple filter function
  self.filterBasedOnSearch = function () {
    //When the user starts to add characters, we clear the location list.
    self.filteredLocations([]);
    self.locationCollection.forEach(function (location) {
        //Remove the markers, we are doing it inside the for each because here location is available.
        //REF: https://developers.google.com/maps/documentation/javascript/reference#Marker
        //REF: https://efwjames.com/2015/11/google-maps-marker-toggle-code-example/ <-- just to see how to use setVisible
        location.marker.setVisible(false);

        //Making a comparison between what the user has added and with my list.
          //Change both values to lowercases to make an easier match.
        // The zero in the end is show the full list
        if (location.title.toLowerCase().indexOf(self.search().toLowerCase()) == 0 ) {
            location.marker.setVisible(false);
            self.filteredLocations.push(location);
        }
    });

    self.filteredLocations().forEach(function (location) {
      location.marker.setVisible(true);
    });

  };
};

//////////////////////
// YELP API request //
//////////////////////

var yelp = function(title, latitude, longitude, marker, adress) {
    'use strict';

    var yelpUrl = 'http://api.yelp.com/v2/search';
    var httpMethod = 'GET';

    //Found this clever solution in the Udacity forms.
    // REF: https://discussions.udacity.com/t/how-to-make-ajax-request-to-yelp-api/13699/5
       function nonceGenerate() {
           return (Math.floor(Math.random() * 1e12).toString());
      }

    // Following Yelp documentation https://www.yelp.com/developers/documentation/v2/authenticationbelow
    // to authenticate towards Yelp.

    var parameters = {
      oauth_consumer_key: '9qSE5baunEVztPs599-Xcg',
      oauth_token: 'cMci0IX2rSc_IP-feuupAoJWa7jjKIJX',
      oauth_nonce: nonceGenerate(),
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version:'1.0',
      callback: 'cb',
      term: title,
      radius_filter: 100,
      limit: 1,
      location: adress,
      cll: latitude + ',' + longitude

    };

    var yelpConsumerSecret = '_kaJ3jISxoLvp1Wx3K553AW-WHM', yelpTokenSecret = 'M4RnfNHqi7zyQwFD-jCnAcuWXUQ';

    var encodedSignature = oauthSignature.generate(httpMethod, yelpUrl, parameters, yelpConsumerSecret, yelpTokenSecret);
    parameters.oauth_signature = encodedSignature;


  //Here is the setup for the ajax request to Yelp. I'm handeling both the success and the error with the settings.
    var settings = {
        url: yelpUrl,
        data: parameters,
        cache: true,
        dataType: 'jsonp',
        success: function(response) {
          var content = '<div class="info-window">';
          content += '<h4>' + title + '</h4>';
          if (response.businesses[0].rating_img_url !== undefined) {
            content += '<p>Score from Yelp</p>'
            content += '<img class="rating-image" src="' + response.businesses[0].rating_img_url + '"></div>';
          } else {
            content += '</div>';
          }

          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        },
        error: function() {
          // added an elementen in the dom that I show if there is an error.
          $('#errorMessage').removeClass('hide').addClass('present');
        }
    };


    $.ajax(settings);
};
