/**
 * @module MYAPP
 * @class QueryData Manages all ajax calls
 * @param {Object} app Local reference to global app object
 * @return {Object} Public API
 */
MYAPP.QueryData = (function(app){

	"use strict";

	var queryModels,
		queryParams,
		eventError,
		wsURI,

		_query,
		_getWsURI,
		_getQueryParams;

	/**
	 * @var eventError Event broadcast when ajax fails
	 * @type {String}
	 */
	eventError = app._EVENTS_.generic.ajax;

	/**
	 * @var wsURI Web service url
	 * @type {String}
	 */
	wsURI = "";

	/**
	 * @property queryModels Ajax opt
	 * @type {Object}
	 */
	queryModels = {
		type: "POST",
		dataType: "xml",
		data: null,
		contentType: "text/xml; charset=UTF-8"
	};

	/**
	 * @property queryParams Params to be passed to WS along with queryModels.data Object
	 * @type {Object}
	 */
	queryParams = {

		"METHOD_01": "example.asmx?op=Example"

	};

	/**
	 * @function _getQueryParams Get query params
	 * @param  {String} type Query model name
	 * @return {String}      Params to be passed to WS along with queryModels.data Object
	 */
	_getQueryParams = function(type){

		return queryParams[type];

	};

	/**
	 * @function _getWsURI Get WS Uri to build WS queries.
	 * @return {String} WS url
	 */
	_getWsURI = function(){

		return wsURI;

	};

	/**
	 * @function _query Performs ajax calls
	 * @param  {String} type     Query object name
	 * @required
	 * @param  {Object} settings Ajax call additional options
	 * @optional
	 * @return {Object}          jQuery XHR object
	 * @example
	 * MYAPP.QueryData.query("CHECK_USER", {data: data});
	 */
	_query = function(settings){

		var options,
			promise,
			eventEmitter;

		eventEmitter = MYAPP.Mediator;

		options = $.extend({}, queryModels, settings);

		promise = $.ajax(options);

		promise.fail(function(jqXHR){

			eventEmitter.publish(eventError, jqXHR);

		});

		return promise;

	};

	return {

		getQueryParams: _getQueryParams,

		getWsURI: _getWsURI,

		query: _query

	};

})(MYAPP); // end QueryData()