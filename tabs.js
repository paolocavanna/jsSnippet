/**
 * Dummy tab utility
 * @namespace MYAPP
 * @class Tabs
 * @param  {Object} app App global namespace
 */
(function(app){

	"use strict";

	var Tabs = {};

	Tabs.opt = {
		wrapper: ".tab-content-wrapper",
		commandWrapper: ".tab-command-wrapper",
		commands: ".js-tab-command",
		content: ".tab-content",
		EVT_OPEN: app._EVENTS_.tabs.open
	};

	/**
	 * [firstSetUp description]
	 * @return {[type]} [description]
	 */
	Tabs.firstSetUp = function(){

		$(this.commands).find("li:first-child > a").addClass("on");

		$(this.wrapper).find(".tab-content:first-of-type").addClass("on");

	};

	Tabs.trigAction = function(evt){

		evt.preventDefault();

		var $target = $(evt.target),
			$thisWrapper = $target.closest(".tab-content-wrapper"),
			$thisCommands = $thisWrapper.find(".tab-commands"),
			index = $thisCommands.find("a").index(evt.target);

		if ($target.hasClass("on")) {

			return;

		}

		// commands
		$thisCommands.find(".on").removeClass("on");

		$target.addClass("on");

		// contents
		$thisWrapper.find(".tab-content.on").removeClass("on");

		$thisWrapper.find(".tab-content").eq(index).addClass("on");

		this.pubEvent();

	};

	Tabs.eventListener = function(){

		$(this.opt.commands).on("click", this.opt.command, $.proxy(this.trigAction, this));

	};

	/**
	 * [pubEvent description]
	 * @return {[type]} [description]
	 */
	Tabs.pubEvent = function(){

		$.Topic(this.EVT_OPEN).publish();

	};

	Tabs.init = function(settings){

		this.opt = $.extend(settings || {}, this.opt);

		this.firstSetUp();

		this.eventListener();

	};

	/**
	 * @method execute
	 * @param  {String} method Class method name
	 * @return {Function}      Executes method
	 * @example
	 * Tabs.execute("trigAction");
	 */
	Tabs.execute = function(method){

		if ( typeof method !== "undefined" ) {

			return app.Tabs[method] && app.Tabs[method].apply( app.Tabs, [].slice.call(arguments, 1) );

		} else {

			console.warn("No method supplied to Tabs.execute");

			return false;

		}

	};

	app.Tabs = Tabs;

})(MYAPP);
