/* jshint unused:true, boss:true, maxerr:500, -W099, quotmark: false, camelcase: false, indent: 4, smarttabs: true, browser: true, jquery: true */
/* global MYAPP, google, Modernizr, FastClick, base_url,MYAPP_market,MYAPP_marketcode,MYAPP_respathesources,MYAPP_brand,MYAPP_brandcode,MYAPP_lang,MYAPP_languagecode,pageType,_satellite */

MYAPP.namespace("Service");

// MYAPPService.
(function($, app, global) {
	"use strict";

	var HTTP_SUCCESS = "200";
	var CODE_SUCCESS = "0";
	var CODE_ERROR_HTTP = "9999";
	var CODE_ERROR_GENERIC = "500";
	var CODE_ERROR_INPUT = "400";
	var CODE_ERROR_FORBIDDEN = "403";
	var CODE_ERROR_METHOD_NOT_ALLOWED = "406";

	var endpoints = {

		user_logout: {
			ajaxSettings: {
				url: "user/logout",
				cache: false,
				type: "GET",
				contentType: "application/x-www-form-urlencoded; charset=UTF-8"
			}
		},

		printPdf: {
			ajaxSettings: {
				url: "Print/Pdf",
				cache: false,
				type: "POST",
				contentType: "text/xml; charset=UTF-8",
				dataType: "xml"
			},
			template: function(params) {

				var tpl = [];

				tpl.push("<Request>");
				tpl.push("</Request>");

				return tpl.join("");

			},
			parse: function(xmlResponse, response, request){

				response.data.id = $(xmlResponse).find("id").map(function() {
					return $(this).text();
				}).get();
			}
		}
	};

	var MYAPPService = function(opts) {
		var defOpts = {
			wsRootPath: "/ws/MYAPPService.svc"
		};

		this.opts = $.extend(true, {}, defOpts, opts || {});
	};

	MYAPPService.prototype.endpoint = function(endpointName) {
		return endpoints[endpointName];
	};

	MYAPPService.prototype.call = function(endpoint, params) {
		var deferred;
		var endpointData;
		var request;
		var ajaxSettings, xhr;

		deferred = new $.Deferred();

		endpointData = this.endpoint(endpoint);
		request = this.createRequest(endpoint, params);
		request.deferred = deferred;
		request.endpointData = endpointData;
		request.params = params;

		xhr = $.ajax(request.ajaxSettings);

		xhr.done($.proxy(function(data, textStatus, jqXHR) {
			this.onHTTPResponse(jqXHR, request);
		}, this));

		xhr.fail($.proxy(function(data, textStatus, jqXHR) {
			this.onHTTPResponse(data, request);
		}, this));

		return deferred.promise();
	};

	MYAPPService.prototype.onHTTPResponse = function(xhrResponse, request) {
		var response;
		response = this.parseResponse(xhrResponse, request);

		if (response.success) {
			request.deferred.resolve(response, request);
		}
		else {
			request.deferred.reject(response, request);
		}
	};

	MYAPPService.prototype.parseResponse = function(xhrResponse, request) {
		var response;
		var xmlResponse;
		var code;

		response = {};
		response.xhrResponse = xhrResponse;
		response.httpStatus = String(xhrResponse.status);
		response.httpSuccess = (response.httpStatus === HTTP_SUCCESS);
		response.success = response.httpSuccess;
		response.data = {};

		xmlResponse = $.parseXML(xhrResponse.responseText);
		response.xmlResponse = xmlResponse;

		code = $(xmlResponse).find("Response > code").text();
		response.code = code;

		this.parseResponseError(response);

		if (typeof(request.endpointData.parse) === "function") {
			request.endpointData.parse.call(this, xmlResponse, response, request);
		}

		return response;
	};

	MYAPPService.prototype.parseResponseError = function(response) {
		var xmlResponse;
		xmlResponse = response.xmlResponse;

		if (response.code == CODE_SUCCESS) {
			response.success = true;
		}
		else {
			response.success = false;
			response.error = {};
			response.error.code = $.trim($(xmlResponse).find("error > code").text());
			response.error.description = $.trim($(xmlResponse).find("error > description").text());
		}
	};

	MYAPPService.prototype.createRequest = function(endpoint, params) {
		var request;
		var ajaxSettings;
		var xml;

		request = {};
		request.endpoint = endpoint;
		request.endpointData = this.endpoint(request.endpoint);
		request.params = $.extend({}, params || {});

		request.xml = this.renderTemplate(request);

		ajaxSettings = $.extend({}, request.endpointData.ajaxSettings);
		ajaxSettings.url = (this.opts.wsRoot || "") + this.opts.wsRootPath + "/" + ajaxSettings.url;
		ajaxSettings.data = {};

		if (request.xml !== false) {
			ajaxSettings.data = request.xml;
		}
		else {
			if (typeof(request.endpointData.assemble) === "function") {
				request.endpointData.assemble.call(this, ajaxSettings, request.params);
			}
		}

		request.ajaxSettings = ajaxSettings;

		return request;
	};

	MYAPPService.prototype.renderTemplate = function(request) {
		var endpointData = request.endpointData;
		var tpl;

		if (!endpointData) {
			return false;
		}

		if (typeof(endpointData.template) !== "function") {
			return false;
		}

		tpl = endpointData.template(request.params);
		return tpl;
	};

	app.Service.MYAPPService = MYAPPService;
}(jQuery, MYAPP, window));
