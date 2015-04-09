/* jshint unused:true, boss:true, maxerr:500, -W099, quotmark: false, camelcase: false, indent: 4, smarttabs: true, browser: true, jquery: true */
/* global google, Modernizr, FastClick */
(function($, app, global, undefined) {

"use strict";

var GoogleMaps = {};

GoogleMaps.init = function(opts) {
	var defOpts = {
		sensor: true,
		libraries: ["places"]
	};

	this.opts = $.extend({}, defOpts, opts);
	this.api_loading = false;
	this.api_loaded = false;
};

GoogleMaps.load = function(callback) {
	if (this.api_loaded) {
		callback();
		return;
	}

	this.on("load", callback);

	if (this.api_loading) {
		return;
	}

	this.api_loading = true;

	this.loadJsApi()
		.then($.proxy(this.loadGoogleMapsApi, this))
		.then($.proxy(this.apiLoaded, this));
};

GoogleMaps.apiLoaded = function() {
	this.trigger("load");
};

GoogleMaps.loadJsApi = function(fn) {
	return $.getScript("//www.google.com/jsapi");
};

GoogleMaps.loadGoogleMapsApi = function(fn) {
	var deferred;
	var loadOpts;

	deferred = new $.Deferred();

	loadOpts = {
		other_params: "sensor=" + (!!this.opts.sensor).toString() + "&libraries=" + this.opts.libraries.join(","),
		callback: function() {
			deferred.resolve();
		}
	};
	
	google.load("maps", 3, loadOpts);

	return deferred.promise();
};

GoogleMaps.trigger = function(eventName, args) {
	$.Topic(app._EVENTS_.googlemaps[eventName]).publish(args);
};

GoogleMaps.on = function(eventName, fn) {
	$.Topic(app._EVENTS_.googlemaps[eventName]).subscribe(fn);
};

app.GoogleMaps = GoogleMaps;

}(jQuery, MYAPP, this));
