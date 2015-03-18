/**
* A dummy accordion utility function
* @class accordion
* @module JOG
* @static
* @public
* @dependencies utils.js
*/
JOG.accordion = {

	wrapper: null,

	heading: null,

	EVT_OPEN: JOG._EVENTS_.accordion.open,

	init: function(){

		"use strict";

		this.wrapper = $(".accordion-wrapper");

		this.heading = $(".accordion-heading");

		this.action();

	},

	action: function(){

		"use strict";

		var that = this;

		this.wrapper.find(".accordion-heading:first-of-type").addClass("on");

		this.wrapper.off("click").on("click", ".accordion-heading", function (){

			var $this = $(this);

			if ( $this.hasClass("on") ) {

				$this.removeClass("on");

			} else {

				that.heading.removeClass("on");

				$this.addClass("on");

				that.dispatchEvent(that.EVT_OPEN);

			}

		});

	},

	dispatchEvent: function(evt) {

		"use strict";

		$.Topic(evt).publish();

	},

	removeEvent: function(evt) {

		"use strict";

		$.Topic(evt).unsubscribe();

	}

};