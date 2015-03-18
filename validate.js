/* jshint unused:true, boss:true, maxerr:500, -W099, quotmark: false, camelcase: false, indent: 4, smarttabs: true, browser: true, jquery: true */
/* global MYAPP, Modernizr, FastClick, base_url,MYAPP_market,MYAPP_marketcode,MYAPP_respathesources,MYAPP_brand,MYAPP_brandcode,MYAPP_lang,MYAPP_langcode,pageType,other_mkt_reg_url,MOPAR,validateForm */

(function(app, $, undefined) {

"use strict";

/**
 * @module MYAPP
 * @submodule Validate
 *
 *
 */
var Validate = {};

var validatorDefaults = {
	valid: false
};

/**
 * @module MYAPP
 * @submodule Validate
 * @method postalCode
 *
 * Validates postal codes syntax.
 */
(function() {
	var marketRules = {
		// By default, validation passes.
		"default": true,
		// @see http://www.mapanet.eu/EN/resources/Postal-Format.asp.
		//
		// WARNING:
		// be sure to write regexp shorthands with double backslashes.
		"it": new RegExp("^[0-9]{5}$"),
		"be": new RegExp("^[0-9]{4}$"),
		"fr": new RegExp("^[0-9]{5}$"),
		"de": new RegExp("^[0-9]{5}$"),
		"nl": new RegExp("^[0-9]{4}\\s?([a-z]{2})$", "i"),
		"at": new RegExp("^[0-9]{4}$"),
		"ru": new RegExp("^[0-9]{6}$"),
		"pl": new RegExp("^[0-9]{2,4}-[0-9]{3}$"),
		"ch": new RegExp("^[0-9]{4}$"),
		// @see http://stackoverflow.com/questions/164979/uk-postcode-regex-comprehensive
		"uk": new RegExp("^([A-Za-z]{1,2}[0-9]{1,2}[A-Za-z]?[ ]?)([0-9]{1}[A-Za-z]{2})$")
	};

	var postalCode = function(value, market) {
		var valid;
		var rule;

		rule = marketRules[market] || marketRules["default"];

		if (typeof(rule) === "object" && rule.constructor === RegExp) {
			rule = {
				type: "regex",
				regex: rule
			};
		}
		else if (typeof(rule) === "function") {
			rule = {
				type: "fn",
				fn: rule
			};
		}
		else if (typeof(rule) === "boolean") {
			rule = {
				type: "fixed",
				value: rule
			};
		}

		valid = false;
		value = String(value);

		switch (rule.type) {
			case "regex":
				valid = rule.regex.test(value);
				break;

			case "fixed":
				valid = rule.value;
				break;

			case "fn":
				valid = (rule.fn(value) === true);
				break;
		}

		return $.extend({}, validatorDefaults, {valid: valid});
	};

	Validate.postalCode = postalCode;

	// Keep zipCode for compatibility.
	Validate.zipCode = Validate.postalCode;
}());

app.Validate = Validate;

}(MYAPP, jQuery));
