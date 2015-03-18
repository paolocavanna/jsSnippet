/**
* Manages communications between modules.
* @class Mediator
* @module MYAPP
* @static
* @public
* @return {Object} Instance of Mediator object
* @example:
*   MYAPP.Mediator.subscribe("custom:event:name"[,callback]);
*   MYAPP.Mediator.publish("custom:event:name"[,args]);
*/
MYAPP.Mediator = (function() {

	function Mediator() {

		this._topics = {};

	}

	Mediator.prototype.subscribe = function mediatorSubscribe(topic, callback) {

		if ( !this._topics.hasOwnProperty(topic) ) {

			this._topics[topic] = [];

		}

		this._topics[topic].push(callback);

		return this;

	};

	Mediator.prototype.unsubscribe = function mediatorUnsubscribe(topic, callback) {

		var i = 0,

			len = this._topics[topic].length;

		if ( !this._topics.hasOwnProperty(topic) ) {

			return false;

		}

		for ( ; i < len; i++ ) {

			if ( this._topics[topic][i] === callback ) {

				this._topics[topic].splice(i, 1);

				return true;

			}

		}

		return false;

	};

	Mediator.prototype.publish = function mediatorPublish() {

		var args = Array.prototype.slice.call(arguments),

			topic = args.shift(),

			i = 0,

			len = typeof this._topics[topic] !== "undefined" ? this._topics[topic].length : 0;


		if ( !this._topics.hasOwnProperty(topic) ) {

			return false;

		}

		for ( ; i < len; i++) {

			this._topics[topic][i].apply(null, args);

		}

		return this;

	};

	return new Mediator();

})(); // end Mediator()