/* jshint unused:true, boss:true, maxerr:500, -W099, quotmark: false, camelcase: false, indent: 4, smarttabs: true, browser: true, jquery: true */
/* global MYAPP */

if ( typeof MYAPP === "undefined" ) {

	var MYAPP = {};

}

MYAPP.namespace("msgs");

MYAPP.msgs = {

	"load": {
		"error": "Error in downloading data. Please try to refresh the page."
	},

	"formMsg": {
		"nonEmpty": "Required field",
		"validMail": "E-mail must be a valid address",
		"confirmMail": "Check your email address",
		"validNumber": "This must be a valid number",
		"validLetters": "Use letters only",
		"atLeast": "Please fill in at least one number",
		"mustCheck": "Field must be checked",
		"disablePaste": "Please prompt your mail address for confirmation",
		"success": "Data sent successfully",
		"error": "Error in sending data. Please retry later."
	},

	"productFilter": {
		"noResults": "No product matches your selection",
		"filtered": "You choose:"
	},

	"fancybox": {
		"close": "Close"
	}
};