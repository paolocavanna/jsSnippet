/**
 * @module MYAPP
 * @class CookieSettings
 * @static
 * @param {Object} app MYAPP module
 * @param {Object} $ jQuery
 * @param {Object} cookies MYAPP.docCookies utility
 * @param {Object|Null} topic Mediator utility
 * Module responsible for storing and managing settings about cookies.
 * Other modules can interact with this object by subscribing to "load" or "save" events.
 * A load event is triggered after settings are read from storage.
 * A save event is triggered after settigns are written to storage.
 */
(function(app, $, cookies, topic) {
	"use strict";

	var settings = {};

	settings.init = function(opts) {
		var defOpts = {
			defaults: {},
			debug: false
		};

		opts = $.extend(true, defOpts, opts || {});
		this.opts = opts;

		if (this.opts.debug) {
			this.on("load", $.proxy(this.log, this));
		}

		this.load();
	};

	settings.hasData = function() {
		return !$.isEmptyObject(this.data);
	};

	/**
	 * Loads settings from storage.
	 */
	settings.load = function() {
		var tech = this.opts.technicalCookie;
		var value = cookies.hasItem(tech.name) ? cookies.getItem(tech.name) : "";
		var data;

		try {
			data = JSON.parse(value);
		}
		catch (e) {
			this.log(e);
		}

		// No cookie found, return default values.
		if (data === undefined) {
			data = this.opts.defaults;
		}

		this.data = data;

		this.trigger("load", data);
	};

	/**
	 * Retrieve settings data.
	 *
	 * @param  {string} key
	 *   Optional key of sub-setting.
	 *
	 * @return {object}
	 */
	settings.get = function(key) {
		if (key !== undefined) {
			return this.data[key];
		}

		return this.data;
	};

	/**
	 * Writes new settings to the storage.
	 *
	 * @param  {object} data
	 *  New settings to save.
	 *
	 * @param  {object} params
	 *  Custom parameters to pass.
	 *  Parameters can contain trigger: true if caller wish to fire the "save" event.
	 *
	 *
	 * @return {boolean}
	 *  Status of operation.
	 */
	settings.save = function(data, params) {
		params = $.extend({
			trigger: true
		}, params || {});

		var old = this.data;
		var tech = this.opts.technicalCookie;
		var serialized;
		var save = {}, k;
		var status = true;

		this.data = data || {};

		if ($.isEmptyObject(data)) {
			status = cookies.removeItem(tech.name, tech.path, tech.domain);
		}
		else {
			for (k in this.data) {
				if (this.data.hasOwnProperty(k)) {
					save[k] = this.data[k] ? 1 : 0;
				}
			}

			serialized = JSON.stringify(save || {});
			status = cookies.setItem(tech.name, serialized, tech.expires, tech.path, tech.domain, tech.secure);
		}

		// Trigger "save" event if required.
		if (params.trigger) {
			this.trigger("save", data, old);
		}

		return status;
	};

	/**
	 * Removes all settings, returning to initial state.
	 *
	 * @return {boolean}
	 *   Status of operation.
	 */
	settings.clear = function(params) {
		return this.save({}, params);
	};

	/**
	 * Shortcut for triggering events.
	 */
	settings.trigger = function(event, args) {
		MYAPP.Mediator.publish(event, args);
		return this;
	};

	/**
	 * Shortcut for subscribing to events.
	 */
	settings.on = function(event, fn) {
		MYAPP.Mediator.subscribe(event, fn);
		return this;
	};

	/**
	 * Writes data to the log, if debugging is enabled.
	 */
	settings.log = function() {
		var args = [].splice.call(arguments, 0);
		args.unshift("CookieSettings.log: ");

		if (this.opts.debug) {
			console.log.apply(console.log, args);
		}
	};

	/**
	 * Utility functions to delete a list of cookies.
	 * @param  {array} list
	 *   List of cookies to be removed.
	 */
	settings.removeCookies = function(list) {
		var k;
		for (k = 0; k < list.length; k++) {
			cookies.removeItem(list[k]);
		}
	};

	/**
	 * Deletes cookies user by Google Analytics.
	 */
	settings.deleteGoogleAnalyticsCookies = function() {
		this.removeCookies(["_utma", "_utmb", "_utmc", "_utmz", "_utmv"]);
	};

	/**
	 * Deletes cookies used by Adobe analytics scripts.
	 */
	settings.deleteAdobeCookies = function() {
		this.removeCookies(["s_cc", "s_sq", "s_vi", "s_fid", "s_ppv", "gpv", "gpv_c25", "gpv_c11", "s_campaign", "bookmarked", "s_visit", "s_lastvisit"]);
	};

	settings.deleteAdobeAnalyticsCookies = settings.deleteAdobeCookies;

	app.CookieSettings = settings;

}(MYAPP, jQuery, MYAPP.docCookies));


/**
 * Module responsible for submitting new settings for cookies.
 * @module MYAPP
 * @class CookieSettingsUI
 * @param {Object} app MYAPP module
 * @param {Object} $ jQuery
 * @param {Object} settings MYAPP.CookieSettings
 * @param {Object} cookies MYAPP.docCookies utility
 */
(function(app, $, settings, cookies) {
	"use strict";

	var BANNER_SEEN = "seen";

	var ui = {};
	ui.init = function(opts) {
		var defOpts = {
			defaults: {},
			reload: false
		};

		opts = $.extend(true, defOpts, opts || {});
		this.opts = opts;

		this.$cookieLayer = $(this.opts.cookieLayer);
		this.$settingsForm = $(this.opts.settingsForm);
		this.fetchClusters();

		this.$settingsForm.on("click", "[data-settings-save],.action-settings-save", $.proxy(this.submit, this));
		this.$cookieLayer.on("click", ".js-close-cookie-disclaimer", $.proxy(onCookieLayerClose, this));
		this.$settingsForm.on("click", ".js-toggle-cookie-list", $.proxy(onToggleCookieListClick, this));

		// If the user did not see the cookie banner, show it.
		if (this.readBanner() !== BANNER_SEEN) {
			this.showCookieLayer();
		}

		// Adjust clusters if needed.
		this.adjustClusters();

		// Sync the form with the current settings.
		if (settings.hasData()) {
			this.populate(settings.get());
		}
		else {
			// If we have no persisted settings, then populate the form with given defaults.
			this.populate(this.opts.defaults);
		}
	};

	function onCookieLayerClose() {
		this.writeBanner(BANNER_SEEN);
		this.$cookieLayer.fadeOut();

		// If users decide to close the cookie layer, they are impliciting accepting our default values.
		this.acceptDefaultsIfNoData();
	}

	function onToggleCookieListClick(ev) {
		ev.preventDefault();
		var $element = $(ev.currentTarget);
		var $target = $($element.attr("href"));
		$(".cookie-list", this.$settingsForm).not($target).removeClass("on");
		$target.toggleClass("on");
	}

	ui.fetchClusters = function() {
		this.$clusters = $(".cluster-item", this.$settingsForm).filter(function() {
			return $(this).attr("id") || $(this).attr("data-cluster");
		});
	};

	ui.adjustClusters = function() {
		// Ensure each cluster has a "data-cluster" attribute.
		// SP strips out data-* and name attrs before saving the html. Yes, wtf.
		this.$clusters.filter("[id]:not([data-cluster])").each(function() {
			var id = $(this).attr("id");
			var clusterName = id.replace("cluster-", "");
			$(this).attr("data-cluster", clusterName);

			// Ensure radiobuttons have a "name" attribute.
			$("input[type=radio]", this).attr("name", clusterName);
		});
	};

	ui.showCookieLayer = function() {
		this.$cookieLayer.css("display", "block");
		return this;
	};

	ui.hideCookieLayer = function() {
		this.$cookieLayer.css("display", "none");
		return this;
	};

	/**
	 * Collects settings form values.
	 *
	 * @return {hash}
	 *  Collection of boolean values.
	 */
	ui.values = function() {
		var values = {};
		this.$clusters.each(function() {
			var $inputTrue = $(":input[value=1]", this);
			var name = $(this).attr("data-cluster");
			values[name] = ($inputTrue.is(":checked"));
		});

		return values;
	};

	/**
	 * Fills the settings form with the given values.
	 */
	ui.populate = function(values) {
		this.$clusters.each(function() {
			var name = $(this).attr("data-cluster");
			var intValue = !!values[name] ? 1 : 0;
			var $input = $(":input[value=" + intValue + "]", this);
			$input.prop("checked", true);
		});
	};

	/**
	 * Actions to perform when settings form is submitted.
	 */
	ui.submit = function() {
		this.save(this.values());
	};

	/**
	 * Reads banner value.
	 *
	 * @return {string}
	 *  The value of the banner cookie.
	 */
	ui.readBanner = function() {
		var banner = this.opts.bannerCookie;
		return cookies.hasItem(banner.name) ? cookies.getItem(banner.name) : false;
	};

	/**
	 * Writes a new value for the banner cookie.
	 *
	 * @param  {string} value
	 *   New value for the cookie.
	 *
	 * @return {boolean}
	 *   Status of operation.
	 */
	ui.writeBanner = function(value) {
		var banner = this.opts.bannerCookie;
		var serialized = "" + value;
		return cookies.setItem(banner.name, serialized, banner.expires, banner.path, banner.domain, banner.secure);
	};

	/**
	 * Saves default data as cookie settings.
	 *
	 * @return {boolean}
	 *  Status of operation.
	 */
	ui.acceptDefaults = function() {
		return this.save(this.opts.defaults);
	};

	/**
	* Does an acceptDefaults() only if we have no persisted settings.
	*
	* @return {boolean}
	*  Status of operation.
	*/
	ui.acceptDefaultsIfNoData = function() {
		if (!settings.hasData()) {
			return this.acceptDefaults();
		}

		return -1;
	};

	ui.save = function(values) {
		// If reload option is specified, reload the page.
		// By reloading the page, the server will receive the new values and it will able
		// to behave differently depending on the settings.
		var reload = this.opts.reload;
		var saved = settings.save(values, {trigger: true});
		var saved_banner = this.writeBanner(BANNER_SEEN);
		if (saved) {
			if (reload) {
				// Tricks the browser and avoid returning to the previous scroll position.
				window.scrollTo(0, 0);
				// Wait a bit before reloading, just to be sure all "save" event handlers are executed.
				window.setTimeout(function() {
					window.location.reload();
				}, 500);
			}
		}
	};

	ui.BANNER_SEEN = BANNER_SEEN;

	app.CookieSettingsUI = ui;

}(MYAPP, jQuery, MYAPP.CookieSettings, MYAPP.docCookies));


/**
 * @module MYAPP
 * @class initCookieSettings
 * Initializes Cookie Settings.
 */
MYAPP.initCookieSettings = function() {

	if (typeof MYAPP.CookieSettings !== "undefined") {

		// Initialize cookie settings api.
		MYAPP.CookieSettings.init({
			// Techinical cookie properties.
			technicalCookie: {
				// Use a specific cookie per market.
				name: "MYAPP_cookies",
				// Date when tecnical cookie will expire (13 months).
				expires: new Date((new Date()).getTime() + 13 * 30 * 24 * 60 * 60 * 1000),
				path: "/",
				domain: "." + location.host
			},
			debug: false,
			// Default values for settings.
			defaults: {
				comfort: false,
				performance: true,
				advertising: false
			}
		});

		// Initialize cookie settings user interface.
		MYAPP.CookieSettingsUI.init({
			cookieLayer: "#cookie-disclaimer-wrapper",
			settingsForm: ".cookie-settings",
			// When settings are saved, reload the page, so that the server can read the new settings asap.
			reload: true,
			bannerCookie: {
				name: "MYAPP_cookies_banner",
				// Date when banner cookie will expire (13 months).
				expires: new Date((new Date()).getTime() + 13 * 30 * 24 * 60 * 60 * 1000),
				path: "/",
				domain: "." + location.host
			},
			// Default form values and default accepted values.
			defaults: {
				comfort: false,
				performance: true,
				advertising: false
			}
		});

	}

};

// Initialize cookie settings ASAP
// so other scripts can read settings data.
MYAPP.initCookieSettings();