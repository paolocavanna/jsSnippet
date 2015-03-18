/* jshint unused:true, boss:true, maxerr:500, -W099, quotmark: false, camelcase: false, indent: 4, smarttabs: true, browser: true, jquery: true */
/* global MYAPP */

/**
* Manages communications between modules.
* @class Topic
* @namespace $
* @static
* @public
* @param {String} id name of custom event
* @required
* @return {Object} topic an object holding all the methods that manage callbacks
* @example:
*   $.Topic("custom:event:name").publish([args]);
*   $.Topic("custom:event:name").subscribe([callback]);
*/
$.Topic = function(id) {

	"use strict";

	var callbacks,
		topic = id && MYAPP.topics[id];

	if (!topic) {

		callbacks = $.Callbacks();

		topic = {
			publish: callbacks.fire,
			subscribe: callbacks.add,
			unsubscribe: callbacks.remove
		};

		if (id) {

			MYAPP.topics[id] = topic;

		}

	}

	return topic;

}; // end $.Topic

/**
* App's main namespace
* @module MYAPP
* @type {Object}
*/
if (typeof MYAPP === "undefined") {

	var MYAPP = {};

}

/**
* Utility to create namespace and extend modules
* @namespace MYAPP
* @class namespace
* @return {Object} module
*/
MYAPP.namespace = function(ns_string) {

	"use strict";

	var parts = ns_string.split('.'),
		parent = MYAPP,
		len =  parts.length,
		i = 0;

	// strip redundant leading global
	if (parts[0] === "MYAPP") {

		parts = parts.slice(1);

	}

	for ( ; i < len; i += 1) {

		// create a property if it doesn't exist
		if ( typeof parent[parts[i]] === "undefined" ) {

			parent[parts[i]] = {};

		}

		parent = parent[parts[i]];

	}

	return parent;

};

MYAPP.namespace("globals");
MYAPP.namespace("_UTILS_");
MYAPP.namespace("_EVENTS_");

/**
* List of useful global vars
* @namespace MYAPP
* @submodule globals
* @type {Object}
*/
MYAPP.globals = {

	/**
	 * @property lang Capture browser's language
	 * @type {String}
	 */
	lang: navigator.language || navigator.userLanguage,

	/**
	 * @property validEmal Regex to check email address validity against
	 * @type {RegExp}
	 */
	validEmail: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-]{2,})+\.)+([a-zA-Z0-9]{2,})+$/,

	/**
	 * @property validNum Regex to check number validity against
	 * @type {RegExp}
	 */
	validNum: /^[0-9]+$/,

	/**
	 * @property validLetters Regex to check letters-only members
	 * @type {RegExp}
	 */
	validLetters: /^[a-zA-Z]+$/,

	/**
	 * @property validDate Regex to check date validity against
	 * @type {RegExp}
	 */
	validDate: /[0-9]{2}(\.|-)[0-9]{2}(\.|-)[0-9]{4}/,

	/**
	* @property scrollTimeout global for any pending scrollTimeout.
	* Used in window onscroll event handler.
	* @type {Function}
	*/
	scrollTimeout: null,

	/**
	 * @property mapCSSMediaQueries Map Inuit's mq as defined in _settings.responsive.scss
	 * @type {Object}
	 */
	mapCSSMediaQueries: {
		palm: "screen and (max-width: 44.9375em)",
		lap: "screen and (min-width: 45em) and (max-width: 63.9375em)",
		lapUp: "screen and (min-width: 45em)",
		portable: "screen and (max-width: 63.9375em)",
		desk: "screen and (min-width: 64em)",
		retina: "(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)"
	}
};

/**
* List of general purpose utilities used throughout the application
* @namespace MYAPP
* @submodule _UTILS_
* @type {Object}
*/
(function(app){

	"use strict";

	app._UTILS_ = {

		/**
		* Prints the desired message taken from a JSON file
		* @method printMsgs
		* @param {String} obj JSON key of the desired message
		* @param {String} status JSON value value of the desired message
		* @param {Object} data Object holding data for replacement
		* @return {String} app.msgs[obj][status] The desired message
		*/
		printMsgs: function(obj, status, data) {

			var str, k;

			data = data || {};

			if ( typeof app.msgs === "undefined" ) {

				return;

			}

			if (typeof app.msgs[obj] === "undefined" || typeof app.msgs[obj][status] === "undefined") {

				return '[undefined msg for ' + obj + ' ' + status + ']';

			} else {

				str = app.msgs[obj][status];

				for ( k in data ) {

					if ( data.hasOwnProperty(k) ) {

						str = str.replace("{" + k + "}", data[k], "gi");

					}

				}

				return str;

			}

		},

		/**
		 * @method  getUrlParam Get a parameter's name from a query string
		 * @param  {String} paramName Parameter's name to look for in query string
		 * @return {Boolean}
		 */
		getUrlParam: function(paramName) {

			var oRegex = new RegExp('[\?&]' + paramName + '=([^&]+)', 'i'),

				oMatch = oRegex.exec(document.location.search);

			if (oMatch && oMatch.length > 1) {

				return decodeURIComponent(oMatch[1]);

			} else {

				return false;

			}

		},

		updateQueryStringParameter: function(uri, key, value){

			var re,
				separator;

			re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
			separator = uri.indexOf('?') !== -1 ? "&" : "?";

			if (uri.match(re)) {

				return uri.replace(re, '$1' + key + "=" + value + '$2');

			} else {

				return uri + separator + key + "=" + value;

			}

		},

		/**
		 * @method debounce Utility to execute a given function every set interval.
		 * Boost performance when used in CPU intensive event like resize, scroll, keyp, etc.
		 * @see  http://davidwalsh.name/javascript-debounce-function
		 * @param  {Function} func Function to be debounced
		 * @param  {Number} wait Debounce rate
		 * @param  {Boolean} immediate Whether it should be executed immediately or not
		 * @return {Function}
		 * @example
		 * 	MYAPP._UTILS_.debounce(function, rate)();
		 */
		debounce: function(func, wait, immediate) {

			var timeout;

			return function debounced() {

				var context = this,
					args = arguments;

				clearTimeout(timeout);

				timeout = setTimeout(function() {

					timeout = null;

					if ( !immediate ) {

						func.apply(context, args);

					}

				}, wait);

				if ( immediate && !timeout ) {

					func.apply(context, args);

				}

			};

		},

		/**
		 * @method  elementInViewport Check if an element is in viewport
		 * @param  {Object} el DOM node to be checked
		 * @return {Boolean}
		 * @example
		 * MYAPP._UTILS_.elementInViewport($("map"))
		 */
		elementInViewport: function elementInViewport(el) {

			if ( el instanceof jQuery) {

				el = el[0];

			}

			var rect = el.getBoundingClientRect(),
				h = window.innerHeight || document.documentElement.clientHeight
				/*,
				w = window.innerWidth || document.documentElement.clientWidth*/
				;
			return ((rect.top >= 0 && rect.bottom <= h) ||  (h-rect.top>h/8));

		}

	};

})(MYAPP);


/**
 * @namespace MYAPP
 * @class HtmlTemplates Template engine
 * @param  {Object} app App global namespace
 * @return {Object}             Public API
 */
MYAPP.HtmlTemplates = (function(app) {

	"use strict";

	var HTML_TEMPLATE = {},
		joinStr = "",
		_printMsgs,
		_get,
		_set;

	_printMsgs = app._UTILS_.printMsgs;

	// Loading
	HTML_TEMPLATE.loading = [];
	HTML_TEMPLATE.loading.push("<div class='loading'></div>");

	// UI blocker
	HTML_TEMPLATE.blocker = [];
	HTML_TEMPLATE.blocker.push("<div id='ui-blocker' class='ui-blocker'>");
	HTML_TEMPLATE.blocker.push("<div class='layer__inner'>");
	HTML_TEMPLATE.blocker.push("<div class='loading'></div>");
	HTML_TEMPLATE.blocker.push("</div>");
	HTML_TEMPLATE.blocker.push("</div>");

	// formResponse
	HTML_TEMPLATE.formResponse = [];
	HTML_TEMPLATE.formResponse.push("<p class='ui-message--response'><%this.text%></p>");

	// fancyBox close button
	HTML_TEMPLATE.closeBtn = [];
	HTML_TEMPLATE.closeBtn.push("<a title='"+_printMsgs("fancybox", "close")+"' class='fancybox-item fancybox-close' href='javascript:;'>"+_printMsgs("fancybox", "close")+"</a>");

	/**
	 * _get Generate flat template string
	 * @param  {String} templateName Name of the template to be rendered
	 * @required
	 * @return {String}
	 */
	_get = function(templateName) {

		if (HTML_TEMPLATE.hasOwnProperty(templateName)) {

			return HTML_TEMPLATE[templateName].join(joinStr);

		}

	};

	/**
	 * @function _set Generate template strings with data
	 * @param {String} templateName    Template string
	 * @param {Object} templateData Data to fill the template with
	 * @return {Function}
	 * @see https://github.com/krasimir/absurd/blob/master/lib/processors/html/helpers/TemplateEngine.js
	 */
	_set = function(templateName, templateData) {

		var html = _get(templateName),
			re = /<%([^%>]+)?%>/g,
			reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
			code = 'var r=[];\n',
			cursor = 0,
			match,
			add;

		add = function(line, js) {

			js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :

				(code += line !== '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');

			return add;

		};

		while (match = re.exec(html)) {
			add(html.slice(cursor, match.index))(match[1], true);
			cursor = match.index + match[0].length;
		}

		add(html.substr(cursor, html.length - cursor));

		code += 'return r.join("");';

		return new Function(code.replace(/[\r\t\n]/g, '')).apply(templateData);

	};

	return {

		set: _set,

		get: _get

	};

})(MYAPP); // end HtmlTemplates()

/**
 * @namespace MYAPP
 * @method loading
 * @param {Object} $target jQuery wrapped set
 * Helper method to show a loading spinner.
 */
MYAPP.loading = function($target) {

	"use strict";

	var blocker = MYAPP.HtmlTemplates.get("blocker");

	if ($target === undefined) {

		$("body").append(blocker);

	}
	else {

		$target
			.addClass("is-loading")
			.append(blocker);

	}

};

/**
 * @namespace MYAPP
 * @method loaded
 * @param {Number} speed Fade out speed
 * @param {Function} callback Fn to be executed after blocker fades
 * Helper method to hide the loading spinner
 * previously shown with MYAPP.loading().
 */
MYAPP.loaded = function(speed, callback) {

	"use strict";

	var timing = speed || 250,
		args = Array.prototype.slice.call(arguments);

	$("#ui-blocker").fadeOut(timing, function(){

		$(this).remove();

		if ( typeof callback === "function" ) {

			callback.apply(args);

		}

	});

};

/**
  * @namespace MYAPP
  * @return void
  * @param {Object} opt Configuration options
  * @param {Function} additional argument holding a callback function to be executed on animation end
  * @desc Smooth scroll utility
  *
*/
MYAPP.scrollToPos = function scrollToPos(opt) {

	"use strict";

	if ( !$(opt.target).length ) {

		console.log("$(target) not in DOM");

		return;

	}

	var position = parseInt($(opt.target).offset().top, 10),

		SPEED = opt.speed || 1000,

		OFFSET = opt.offset || 0,

		_arguments = arguments,

		args = Array.prototype.slice.call(_arguments),

		i = 1, // to filter off the first argument

		len = _arguments.length,

		callback = function() {

			for ( ; i < len; i += 1 ) {

				if ( typeof _arguments[i] === "function" ) {

					_arguments[i].apply(null, args);

				}

			}

		};

	$("html, body").stop().animate({

		scrollTop: position - OFFSET

	}, SPEED, callback);

}; // end scrollToPos()

/**
 * @namespace MYAPP
 * @property _EVENTS_ Hashmap of all available custom events
 * @type {Object}
 */
MYAPP._EVENTS_ = {

	form: {
		valid: "form:valid",
		invalid: "form:invalid"
	},
	cookiesettings: {
		load: "cookiesettings:load",
		save: "cookiesettings:save"
	},
	accordion: {
		open: "accordion:open",
	},
	tabs: {
		open: "tab:open"
	},
	scroll: {
		scrolled: "scroll:complete"
	}

};

/**
 * [description]
 * @param  {[type]} $    [description]
 * @param  {[type]} root [description]
 * @example
 * var myFn = app.Object.extend({
		foo: "bar"
	});
 */
(function($, root) {
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function has(obj, key) {
		return obj != null && hasOwnProperty.call(obj, key);
	}

	function extend(protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && has(protoProps, 'constructor')) {
			child = protoProps.constructor;
		} else {
			child = function(){ return parent.apply(this, arguments); };
		}

		// Add static properties to the constructor function, if supplied.
		$.extend(child, parent, staticProps);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) $.extend(child.prototype, protoProps);

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		return child;
	}

	function Object() {
		this.initialize.apply(this, arguments);
	}

	Object.extend = extend;

	root.Object = Object;
}(jQuery, JOG));

/**
* Utility to manage cookies
* @namespace MYAPP
* @class docCookies
* @see https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
*/
MYAPP.docCookies = {

	getItem: function(sKey) {

		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;

	},

	setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {

		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {

			return false;

		}

		var sExpires = "";

		if (vEnd) {

			switch (vEnd.constructor) {

				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
			}

		}

		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");

		return true;

	},

	removeItem: function(sKey, sPath, sDomain) {

		if (!sKey || !this.hasItem(sKey)) {

			return false;

		}


		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");

		return true;

	},

	hasItem: function(sKey) {

		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);

	}

};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,clear,count,debug,dir,dirxml,error,exception,firebug,group,groupCollapsed,groupEnd,info,log,memoryProfile,memoryProfileEnd,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());
