DMN.storeLocator = (function(){

	var geoLoc = navigator.geolocation,

		markersArray = [],

		filteredResults = [],

		map,

		infowindow,

		geocoder,

		//image = "img/icona_map.png",
		image = DMN.globals.paths.img + "img/icona_map.png",

		geoOpt = {

	        "enableHighAccuracy": true,

	        "timeout": 10 * 1000,

	        "maximumAge": 0,

	        "gearsRequestAddress": true
	    },

		CONFIG = {

			defaultLatLong: {

				lat: 41.869561,

				lon: 12.568359

			},

			url: "/catalog/resellers/"
			//url: "js/stores_ok.json"

		},

		ELS = {

			map:	"map_store_locator",

			input:	"#store-address",

			find:	"#find-store"

		},

		d,

		$storeAddress,

		$find,

		$map,

		_updateGeoData,

		_transformGeoData,

		_ajaxCall,

		_ajaxSuccess,

		_ajaxError,

		_getInputAddress,

		_printMap,

		_printMarkers,

		_clearMarkers,

		_positionMarkersOnMap,

		_writeMarkerContent,

		_initMap,

		_initGMapMethods,

		_getLongLat,

		_handleErrors,

		_gatherElements,

		_eventListener,

		_init;


	_initGMapMethods = function(){

		infowindow = new google.maps.InfoWindow();

		geocoder = new google.maps.Geocoder();

	};

	_printMap = function(){

		var startPosition = new google.maps.LatLng(CONFIG.defaultLatLong.lat, CONFIG.defaultLatLong.lon),

			mapOptions,

			marker;

		mapOptions = {
			zoom: 6,
			center: startPosition,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false,
			styles: [{
						"elementType": "geometry",
						"stylers": [
							{ "visibility": "simplified" },
							{ "weight": 1.4 },
							{ "saturation": 2 },
							{ "hue": "#ff0022" },
							{ "lightness": 5 },
							{ "gamma": 0.86 }
						]
					}]
		};

		map = new google.maps.Map($map, mapOptions);

		marker = new google.maps.Marker({
			position:	startPosition,
			map:		map,
			icon:		image,
			animation:	google.maps.Animation.DROP
		});

		markersArray.push(marker);

	};

	_clearMarkers = function(){

		var j,

			len = markersArray.length;

		if ( markersArray ) {

			for ( j = 0; j < len; j++ ) {

				markersArray[j].setMap(null);

			}

		}

		if ( filteredResults.length ) {

			filteredResults = [];

		}

	};

	_writeMarkerContent = function(marker, data){

		var content =	"<div class='vcard infowindow'>"+
						"<h3 class='org'>"+data.name+"</h3>"+
						"<div class='adr'>"+
							"<div>"+
								"<span class='street-address'>"+data.address+"</span>"+
								", "+
								"<span class='locality'>"+data.city+"</span>"+
							"</div>"+
							"<div>"+
								"<span class='postal-code'>"+data.postcode+"</span>"+
								", "+
								"<span class='region'>"+data.province+"</span>"+
							"</div>"+
						"</div>"+
						"<div classs='tel'>"+data.phone+"</div>"+
					"</div>";

		google.maps.event.addListener(marker, "click", function() {

			infowindow.close();

			infowindow.setContent(content);

			infowindow.open(map, marker);

		});

	};

	_printMarkers = function(data){

		var latLng = new google.maps.LatLng(data.latitude, data.longitude),

			marker;

		marker = new google.maps.Marker({
			position: 	latLng,
			map: 		map,
			title:		data.name,
			icon:		image,
			animation:	google.maps.Animation.DROP
		});

		markersArray.push(marker);

		filteredResults.push(latLng);

		_writeMarkerContent(marker, data);

	};

	_positionMarkersOnMap = function(){



		var len = filteredResults.length,

				latlngbounds = new google.maps.LatLngBounds(),

				j;


		for ( j = 0; j < len; j++ ) {

			latlngbounds.extend( filteredResults[j] );

		}

		map.fitBounds( latlngbounds );

		map.setCenter( latlngbounds.getCenter() );
		//map.setZoom(12);

	};

	_updateGeoData = function(results){

		var data;

		if ( results.length ) {

			/* for ( var k in results ) {

				data = "latitude=" + results[k].geometry.location.lat() + "" + "&" + "longitude=" + results[k].geometry.location.lng() + "";

			} */
			data = "latitude=" + results[0].geometry.location.lat() + "" + "&" + "longitude=" + results[0].geometry.location.lng() + "";

		} else {

			alert(DMN.printMsgs("storeLocator", "wrong_address"));

		}

		return data;

	};

	_ajaxSuccess = function(results){

		var i,

			resellersData,

			resellers = results[0].body,

			len = resellers.length;

		if ( results[0].status === 0 ) {

			_clearMarkers();

			for ( i = 0; i < len; i++ ) {

				resellersData = {

					name: 		resellers[i].name,

					address: 	resellers[i].address,

					postcode: 	resellers[i].postalcode,

					city: 		resellers[i].city,

					province: 	resellers[i].province,

					region: 	resellers[i].region,

					phone: 		resellers[i].phone,

					latitude: 	resellers[i].latitude,

					longitude:	resellers[i].longitude

				};

				_printMarkers(resellersData);

			}

			_positionMarkersOnMap();

		} else {

			alert(DMN.printMsgs("storeLocator", "noresult"));

		}

	};

	_ajaxError = function(){

		alert(DMN.printMsgs("storeLocator", "error"));

	};

	_ajaxCall = function(results){

		var dataSent = _updateGeoData(results);

		$.ajax({

			url: CONFIG.url,

			dataType: "json",

			data: dataSent,

			success: _ajaxSuccess,

			error: _ajaxError

		});

	};

	// ottengo i dati partendo dal campo input
	_transformGeoData = function(input){

		geocoder.geocode({"address": input,	"region": "IT"}, _ajaxCall);

	};

	// ottengo i dati a partire dalla geolocalizzazione
	_getLongLat = function(position){

		var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

	    geocoder.geocode({"latLng": latlng }, _ajaxCall);

	};

	_handleErrors = function(error){

		switch ( error.code ) {

			case error.POSITION_UNAVAILABLE:

				alert(error.message);

			break;

			case error.TIMEOUT:

				alert(error.message);

			break;

			case error.PERMISSION_DENIED:

				alert(error.message);

			break;

			default:

				alert(error.message);

			break;

		}

	};

	_initMap = function(){

		_printMap();

		if ( geoLoc ) {

			geoLoc.getCurrentPosition(_getLongLat, _handleErrors, geoOpt);

	    } else {

			_eventListener();

	    }


	};

	_gatherElements = function(){

		d = $(document);

		$storeAddress = $(ELS.input);

		$find = $(ELS.find);

		$map = document.getElementById(ELS.map);

	};

	_eventListener = function(){

		d.on("click", ELS.find, function(){

			var input = $storeAddress.val();

			_transformGeoData(input);

		});

		d.on("keypress", ELS.input, function(e){

			if ( e.which === 13 ) {

				$find.click();

			}

		});

	};

	_init = function(){

		_initGMapMethods();

		_gatherElements();

		_initMap();

		_eventListener();

	};

	return {

		init: _init

	}

}());























