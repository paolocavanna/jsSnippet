/* jshint unused:true, boss:true, maxerr:500, -W099, quotmark: false, camelcase: false, indent: 4, smarttabs: true, browser: true, jquery: true */
/* global JOG, Modernizr, FastClick, base_url,jog_market,jog_marketcode,jog_respathesources,jog_brand,jog_brandcode,jog_lang,jog_langcode,pageType,other_mkt_reg_url,MOPAR,validateForm */

(function(app, printMsg, GetUrlParam, validateForm, clearForm, undefined) {

	"use strict";

/**
 * @package JOG
 * @module LR
 * @class Stateful
 */
(function(root) {
	var Stateful = {
		initState: function() {
			this.state = this.defaultState();
			this.onStateChange(this.state, {});
		},
		setState: function(data, opts) {
			var defOpts = {
				replace: false,
				trigger: true
			};

			var old;
			var changed;
			var nulls;
			var newState;

			// Remember keys for which a "null" value was supplied.
			nulls = [];
			$.each(data, function(key, value) {
				if (value === null) {
					nulls.push(key);
				}
			});

			data = data || {};
			opts = $.extend({}, defOpts, opts || {});
			old = $.extend({}, this.state);

			if (opts.replace) {
				changed = $.extend({}, this.defaultState(), data);
				newState = changed;
			}
			else {
				changed = data;
				newState = $.extend({}, this.state, changed);
			}

			// Remove keys for which a "null" value was supplied.
			$.each(nulls, function(index, key) {
				delete newState[key];
			});

			this.state = newState;

			if (opts.trigger) {
				this.onStateChange(changed, old);
			}
		},
		getState: function() {
			this.state = $.extend({}, this.defaultState(), this.readState());
		},
		resetState: function(opts) {
			this.setState({}, $.extend({}, opts || {}, {replace: true}));
			if (typeof(this.onStateReset) === "function") {
				this.onStateReset();
			}
		}
	};

	root.Stateful = Stateful;
}(app));

/**
 * @package JOG
 * @module LR
 */
(function() {
	var lr = {
		VERSION: "0.2"
	};

	var EMPTY_FN = function() {};

	var Module = {};

	var Route = app.Object.extend({
		initialize: function(opts) {
			var defOpts = {
				autosave: true
			};

			this.opts = $.extend(true, {}, defOpts, opts || {});
			this.name = opts.name;
			this.$el = $(".lr__route[data-route=\"" + this.name + "\"]");
			this.setup();
		},
		setup: function() {
			// Code after route initialization.
		},
		focus: function() {
			this.$el.find("[data-autofocus]").focus();
		},
		access: function() {
			// Code before route changes.
			// Return "false" value to prevent route change.
		},
		activate: function() {
			// Code upon route activation.
		},
		deactivate: function() {
			// Deallocate event handlers, to save memory.
			this.$el.off("." + this.name);
		},
		onStateChange: function() {},
		autoSaveEnabled: function() {
			return !!this.opts.autosave;
		}
	});

	var Storage = app.Object.extend({
		initialize: EMPTY_FN,
		isAvailable: EMPTY_FN,
		read: EMPTY_FN,
		write: EMPTY_FN,
		clear: EMPTY_FN
	});

	function onGotoRouteClick(ev) {
		var $target;
		var route;

		$target = $(ev.target);
		route = $target.data("goto-route");
		this.gotoRoute(route);

		return false;
	}

	function onPrevRouteClick() {
		this.gotoPrevRoute();
		return false;
	}

	/**
	 * @method init
	 * Initializes LR module.
	 */
	lr.init = function(opts) {
		var defOpts = {
			fancybox: {
				minHeight: 0
			},
			routeTransitionDelay: 650
		};

		this.opts = $.extend(true, {}, defOpts, opts || {});
		this.$container = $(".lr__page");
		this.isDebug = this.$container.is(".lr__page--debug");

		this.storage = new app.LR.Storage.SessionStorage();
		this.modules = {};

		// Check for storage availability.
		if (!this.storage.isAvailable()) {
			this.onStorageUnavailable();
		}

		// Always subscribe to main business events
		// since those events could be published outside the LR page,
		// for example in Password reset or in password update pages.
		this.attachBusinessEvents();
	};

	lr.run = function() {
		this.initBindings();
		this.initConditions();
		this.initHistory();
		this.initRoutes();
		this.initPopups();

		// DOM Events.
		this.$container.on("click", "[data-goto-route]", $.proxy(onGotoRouteClick, this));
		this.$container.on("click", ".js-prev-route, .js-goto-prev-route", $.proxy(onPrevRouteClick, this));
		$(window).on("beforeunload", $.proxy(this.onBeforeUnload, this));

		this.initState();

		if (GetUrlParam("openRegistration") === "true") {
			this.gotoRoute("login", {transition: false});
			this.gotoRoute("choose_membership_type", {transition: false});
		}
		else if (GetUrlParam("fromEvent") === "true") {
			this.gotoRoute("login", {transition: false});
			this.gotoRoute("join_card_email", {transition: false});
		}
		else if (GetUrlParam("membershipType")) {
			this.gotoRoute("login", {transition: false});
			this.gotoRoute("choose_membership_type", {transition: false});
			this.routes["choose_membership_type"].chooseMembershipType(GetUrlParam("membershipType"));
		}
		else {
			// Resume stored state.
			this.resume();
		}
	};

	lr.attachBusinessEvents = function() {
		$(document).on(app._CONFIGURATION_.Events.isBusy, $.proxy(this.onBusy, this));
		$(document).on(app._CONFIGURATION_.Events.isReady, $.proxy(this.onReady, this));
		$(document).on(app._CONFIGURATION_.Events.PAhasAuthInfo, $.proxy(this.onAuthInfo, this));
		$(document).on(app._CONFIGURATION_.Events.eGarageError, $.proxy(this.onJogServiceError, this));
		$(document).on(app._CONFIGURATION_.Events.internalError, $.proxy(this.onInternalError, this));
		$(document).on(app._CONFIGURATION_.Events.sessionStatusChange, $.proxy(this.onSessionStatusChange, this));
	};

	lr.initHistory = function() {
		this.resetHistory();
	};

	lr.resetHistory = function(preset) {
		var presets;

		preset = preset || "init";
		presets = {
			"init": {
				index: -1,
				prev: null,
				current: null,
				stack: []
			},
			"login": {
				index: 0,
				prev: null,
				current: "login",
				stack: ["login"]
			}
		};

		this.history = presets[preset];
	};

	/**
	 * @method initRoutes
	 * Initializes routes.
	 */
	lr.initRoutes = function() {
		this.routes = {};
		this.routes["login"] = new Route.Login({name: "login"});
		this.routes["choose_membership_type"] = new Route.ChooseMembershipType({name: "choose_membership_type"});
		this.routes["choose_register_source"] = new Route.ChooseRegisterSource({name: "choose_register_source"});
		this.routes["join_owner"] = new Route.JoinOwner({name: "join_owner"});
		this.routes["join_lifetime"] = new Route.JoinLifetime({name: "join_lifetime"});
		this.routes["join_card"] = new Route.JoinCard({name: "join_card"});
		this.routes["join_card_email"] = new Route.JoinCardEmail({name: "join_card_email"});
		this.routes["register"] = new Route.Register({name: "register"});
		this.routes["register_thankyou"] = new Route.Thankyou({name: "register_thankyou", autosave: false});
	};

	lr.initPopups = function() {
		this.popups = {};
		this.popups["register_adjust"] = {
			fancybox: {
				padding: 0,
				closeBtn: false,
				type: "inline",
				href: "#lr__popup--register-adjust",
				minHeight: 0
			}
		};
	};

	lr.initBindings = function() {
		this.bindings = {};

		this.bindings["registration_fca_login_name"] = function() {
			return (this.state.externalLogin ? this.state.externalLogin.data.name : undefined);
		};

		this.bindings["registration_email"] = function() {
			return (this.state.registrationData ? this.state.registrationData.username : undefined);
		};
	};

	lr.initConditions = function() {
		var conditions = {};

		conditions["join_type_enthusiast"] = function() {
			return this.state.joinType == "enthusiast";
		};

		conditions["join_type_owner"] = function() {
			return this.state.joinType == "owner";
		};

		conditions["join_type_lifetime"] = function() {
			return this.state.joinType == "lifetime";
		};

		conditions["not_join_type_enthusiast"] = {
			evaluate: function(evaluations) {
				return !evaluations["join_type_enthusiast"];
			},
			// Must be evaluated after "join_type_enthusiast" condition.
			weight: 10
		};

		conditions["join_type_card"] = function() {
			return this.state.joinType == "card";
		};

		conditions["membership_type_enthusiast"] = function() {
			return this.state.membershipType == "enthusiast";
		};

		conditions["membership_type_owner"] = function() {
			return this.state.membershipType == "owner";
		};

		conditions["membership_type_lifetime"] = function() {
			return this.state.membershipType == "lifetime";
		};

		conditions["chosen_membership_type"] = function() {
			return (!!this.state.membershipType);
		};

		conditions["not_chosen_membership_type"] = {
			evaluate: function(evaluations) {
				return !evaluations["chosen_membership_type"];
			},
			// Must be evaluated after "chosen_membership_type" condition.
			weight: 10
		};

		conditions["registration_fca_login"] = function() {
			return (this.state.externalLogin && this.state.externalLogin.type == "fca");
		};

		conditions["not_registration_fca_login"] = {
			evaluate: function(evaluations) {
				return !evaluations["registration_fca_login"];
			},
			// Must be evaluated after "registration_fca_login" condition.
			weight: 10
		};

		conditions["registration_social"] = function() {
			return (this.state.externalLogin && this.state.externalLogin.type == "social");
		};

		conditions["double_optin_required"] = function(evaluations) {
			return (this.state.doubleOptinRequired === true);
		};

		conditions["not_double_optin_required"] = {
			evaluate: function(evaluations) {
				return !evaluations["double_optin_required"];
			},
			// Must be evaluated after "double_optin_required" condition.
			weight: 10
		}

		conditions["is_jeep_owner"] = {
			evaluate: function(evaluations) {
				return evaluations["membership_type_owner"] || evaluations["membership_type_lifetime"];
			},
			// Must be evaluated after "membership_type_owner" and "membership_type_lifetime" conditions.
			weight: 10
		};

		conditions["card_email_form_has_invalid_pass"] = function() {
			return (this.state.joinType === "card_email" && this.state.membershipData && (this.state.membershipData.hasInvalidPass || this.state.membershipData.password === ""));
		};

		this.conditions = {};

		$.each(conditions, $.proxy(function(key, _condition) {
			var condition = {};
			if (typeof(_condition) === "function") {
				condition.evaluate = _condition;
			}
			else {
				condition = _condition;
			}

			condition.name = key;
			condition.weight = condition.weight || 0;

			this.conditions[key] = condition;
		}, this));
	};

	lr.evaluateConditions = function($scope) {
		var allConditions = this.conditions;
		var conditions = {};
		var collected = [];
		var collectedNames = [];
		var evaluations = {};
		var $elements;

		$scope = $scope || this.$container;
		$elements = $scope.find("[data-cond]");

		$elements.each(function() {
			var name = $(this).attr("data-cond");
			var condition = allConditions[name];
			if (condition !== undefined && ($.inArray(name, collectedNames) === -1)) {
				collectedNames.push(name);
				collected.push(condition);
			}
		});

		collected.sort(function(a, b) {
			return (a.weight - b.weight);
		});

		$.each(collected, $.proxy(function(index, condition) {
			evaluations[condition.name] = condition.evaluate.call(this, evaluations);
		}, this));

		$elements.each(function() {
			var name = $(this).attr("data-cond");
			$(this).toggleClass("on", (evaluations[name] === true));
		});
	};

	lr.evaluateBindings = function($scope) {
		var collected = [];
		var evaluations = {};
		var $elements;

		$scope = $scope || this.$container;
		$elements = $scope.find("[data-bind]");

		$elements.each(function() {
			var name = $(this).attr("data-bind");
			collected.push(name);
		});

		$.each(collected, $.proxy(function(key, name) {
			var binding = this.bindings[name];
			if (typeof(binding) === "function") {
				evaluations[name] = binding.call(this, evaluations);
			}
		}, this));

		$elements.each(function() {
			var name = $(this).attr("data-bind");
			if (evaluations[name] !== undefined) {
				$(this).html(evaluations[name]);
			}
		});
	};

	lr.defaultState = function() {
		return {};
	};

	/**
	 * @method onStateChange
	 * Reacts to changes made to state,
	 */
	lr.onStateChange = function(changed, old) {
		this.evaluateConditions();
		this.evaluateBindings();

		$.each(this.routes, function(name, route) {
			route.onStateChange(changed, old);
		});
	};

	lr.resume = function() {
		var stored = this.storage.read();

		// If stored version uses an old schema, discard it.
		if (stored !== undefined && stored.VERSION < this.VERSION) {
			stored = undefined;
		}

		if (stored === undefined) {
			this.gotoRoute("login", {
				transition: false
			});
		}
		else {
			this.state = $.extend({}, stored.state || {});
			this.onStateChange(this.state, {});
			this.history = $.extend({}, stored.history);
			this.history.current = null;
			this._gotoRoute(stored.history.current, {
				transition: false
			});
		}
	};

	lr.saveState = function() {
		var data = {};
		data.state = $.extend({}, this.state);
		data.VERSION = this.VERSION;
		data.history = this.history;
		this.storage.write(data);
	};

	lr.clearState = function() {
		this.setState({}, {replace: true});
	};

	lr.clearStorage = function() {
		this.storage.clear();
	};

	lr.routeAccess = function(routeName) {
		var prev;
		var next;

		if (this.routes[routeName] === undefined) {
			this.onRouteNotFound(routeName);
			return false;
		}

		if (routeName == this.history.current) {
			return false;
		}

		if (this.history.current) {
			prev = this.routes[this.history.current];
		}

		next = this.routes[routeName];

		if (next.access(prev) === false) {
			// Route refuses to be the next one, so do not change route.
			// Note: next could have called a redirectRoute or a gotoRoute.
			return false;
		}

		return true;
	};

	lr.gotoRoute = function(routeName, opts) {
		if (this.routeAccess(routeName)) {
			this.history.stack.splice(this.history.index + 1);
			this.history.index++;
			this.history.stack.push(routeName);

			this._gotoRoute(routeName, opts);
		}
	};

	lr._gotoRoute = function(routeName, opts) {
		var next = this.routes[routeName];
		var prev = this.routes[this.history.current];

		if (prev) {
			this.history.prev = prev.name;
		}

		this.history.current = next.name;

		this.onRouteChange(next, prev, opts);
	};

	lr.gotoPrevRoute = function() {
		var prevRoute;

		if (this.history.index > 0) {
			prevRoute = this.history.stack[this.history.index - 1];
			if (this.routeAccess(prevRoute)) {
				this.history.index--;
				this._gotoRoute(prevRoute);
			}
		}
	};

	lr.redirectRoute = function(routeName) {
		this.gotoRoute(routeName);
	};

	lr.redirectBackTo = function(routeName) {
		var i;
		var routeIndex;

		for (i = this.history.index; i >= 0; i--) {
			if (this.history.stack[i] === routeName) {
				routeIndex = i;
				break;
			}
		}

		if (routeIndex === undefined) {
			return false;
		}

		this.history.index = routeIndex;
		this._gotoRoute(routeName);

		return true;
	};

	lr.onRouteChange = function(next, prev, opts) {
		var self = this;
		var defOpts = {
			transition: (prev ? true : false),
			complete: $.noop
		};

		opts = $.extend({}, defOpts, opts || {});

		this.routeTransition(next, prev, {
			deactivate: function() {
				if (prev) {
					prev.deactivate(next);
				}
			},
			activate: function() {
				next.activate(prev);
				self.onRouteActivate(next);
			},
			transition: opts.transition,
			complete: opts.complete
		});
	};

	lr.routeTransition = function(next, prev, conf) {
		if (this.isDebug) {
			conf.deactivate();
			conf.activate();
			$("html, body").animate({scrollTop: next.$el.offset().top});
			return;
		}

		if (conf.transition && prev) {
			prev.$el.animate({ left: "-100%", opacity: 0 }, this.opts.routeTransitionDelay, function() {
				conf.deactivate();
				conf.activate();
				conf.complete();
				prev.$el.css({ display: "none", left: "auto", opacity: 1 });
				next.$el.fadeIn();
				$("html, body").animate({scrollTop: next.$el.offset().top});
			});
		}
		else {
			conf.deactivate();
			conf.activate();

			if (prev) {
				prev.$el.hide();
			}

			next.$el.show();
			conf.complete();
		}
	};

	lr.onRouteActivate = function(route) {
		this.focusRoute(route);

		if (route.autoSaveEnabled()) {
			this.saveState();
		}
	};

	lr.onRouteNotFound = function(routeName) {
		console.log("Route " + routeName + " was not found");
	};

	lr.focusRoute = function(route) {
		route.focus();
	};

	lr.overlay = function(layerSettings) {
		var fancyboxOpts = $.extend({}, this.opts.fancybox, layerSettings || {});
		$.fancybox.open(fancyboxOpts);
	};

	lr.overlayHTML = function(html) {
		this.overlay({
			content: html
		});
	};

	lr.overlayMessage = function(messageObj, messageStatus) {
		this.overlayHTML(printMsg(messageObj, messageStatus));
	};

	lr.showPopup = function(popupName) {
		var self;
		var popup;
		var $popup;
		var fancyboxOpts;
		self = this;

		if (this.popups[popupName] !== undefined) {
			popup = this.popups[popupName];
			fancyboxOpts = $.extend({}, this.opts.fancybox, popup.fancybox || {});
			fancyboxOpts.afterShow = function() {
				self.onPopupOpen(this.content);
			};

			$popup = $(fancyboxOpts.href);
			$.fancybox.open(fancyboxOpts);
		}
	};

	lr.onPopupOpen = function($popup) {
		setTimeout(function() {
			$popup.find("[data-autofocus]").focus();
		}, 200);
	};

	lr.closePopup = function(popupName) {
		$.fancybox.close();
	};

	lr.onBusy = function() {
		app.loading();
	};

	lr.onReady = function() {
		app.loaded();
	};

	lr.onAuthInfo = function(ev, authInfo) {
		if (authInfo.code === app._CONFIGURATION_.userStatus.IS_UNKNOWN) {
			$(document).trigger(app._CONFIGURATION_.Events.PAuserLoginSocialSuccess, authInfo);
		}
		else if (authInfo.code === app._CONFIGURATION_.userStatus.IS_FCA || authInfo.code === app._CONFIGURATION_.userStatus.IS_MOC) {
			$(document).trigger(app._CONFIGURATION_.Events.PAuserLoginFCASuccess, authInfo);
		}
	};

	lr.onJogServiceError = function(ev, errorData) {
		if (errorData.detailCode === app._CONFIGURATION_.Errors.JOG_SERVICE.DUPLICATE_USERNAME) {
			$(document).trigger(app._CONFIGURATION_.Events.PAregistrationDuplicateEmail);
			return;
		}

		this.defaultErrorHandler("JOG_SERVICE", errorData);
	};

	lr.onInternalError = function(ev, errorData) {
		// Trigger a "PAuserLoginFail" in case we receive an authentication failed error.
		if (errorData.code === app._CONFIGURATION_.Errors.INTERNAL.AUTHENTICATION_FAILED) {
			$(document).trigger(app._CONFIGURATION_.Events.PAuserLoginFail);
			return;
		}

		// Errors to suppress.
		switch (errorData.code) {
			// Suppress "prefill" messages, since there are "conditions" which will
			// take care of informing the user.
			case app._CONFIGURATION_.Errors.INTERNAL.SOCIAL_LOGIN_PREFILL:
			case app._CONFIGURATION_.Errors.INTERNAL.FCA_LOGIN_PREFILL:
			case app._CONFIGURATION_.Errors.INTERNAL.MOC_LOGIN_PREFILL:
				return;
		}

		// Default behavior for other errors.
		this.defaultErrorHandler("INTERNAL", errorData);
	};

	lr.defaultErrorHandler = function(context, errorData) {
		// "errorData" already contains an error message, so just show the message
		// using an overlay.
		this.overlayHTML(errorData.message);
	};

	lr.onBeforeUnload = function() {
		// Implement if necessary.
		// e.g: return "message";
	};

	lr.onSessionStatusChange = function(ev, userData){

		var tempSessionStatus;

		tempSessionStatus = app.Session.isAlive();

		app.Debug.log("tempSessionStatus: " + tempSessionStatus);

	};

	lr.onStorageUnavailable = function() {
		// @TODO: implement, UX not yet defined.
	};

	lr.clearAuthInfoStorage = function() {
		app.Storage.deleteCookie("JOGInfo");
	};

	lr.clearAuthInfo = function() {
		// Tell the business logic to clear the authinfo.
		this.clearAuthInfoStorage();

		// Update the state of the ui.
		this.setState({
			externalLogin: null
		});

		this.saveState();
	};

	lr.restart = function() {
		this._gotoRoute("login", {
			complete: $.proxy(function() {
				this.resetState();
				this.resetHistory("login");
				this.clearAuthInfo();
				this.clearStorage();
			}, this)
		});
	};

	$.extend(lr, app.Stateful);

	lr.Route = Route;
	lr.Module = Module;
	lr.Storage = Storage;
	app.LR = lr;
}());

/**
 * @package JOG
 * @module LR
 * @submodule Route
 * @class ChooseMembershipType
 * @route
 */
(function(lr) {
	function onChooseMembershipTypeClick(ev) {
		ev.preventDefault();

		var $target;
		var membershipType;

		$target = $(ev.target);
		membershipType = $target.data("membership-type");

		this.chooseMembershipType(membershipType);
	}

	var ChooseMembershipType = lr.Route.extend({
		activate: function(args) {
			// Forget about joinType and membershipType
			lr.setState({
				joinType: null,
				membershipType: null,
				membershipData: null,
				vinData: null
			});

			this.$el.on("click." + this.name, ".js-choose-membership-type", $.proxy(onChooseMembershipTypeClick, this));
		},
		chooseMembershipType: function(membershipType) {
			lr.setState({
				joinType: membershipType,
				membershipType: membershipType
			});

			if (membershipType == "lifetime") {
				lr.gotoRoute("join_lifetime");
			}
			else if (membershipType == "owner") {
				lr.gotoRoute("join_owner");
			}
			else {
				lr.gotoRoute("choose_register_source");
			}
		}
	});

	lr.Route.ChooseMembershipType = ChooseMembershipType;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Route
 * @class Login
 * @route
 */
(function(lr) {
	var Login = lr.Route.extend({
		setup: function(args) {
			lr.modules.login_form = $.extend({}, lr.Module.LoginForm);
			lr.modules.login_form.onLoginFail = $.proxy(this.onLoginFail, this);
			lr.modules.login_form.onFCALoginSuccess = $.proxy(this.onFCALoginSuccess, this);
			lr.modules.login_form.onSocialLoginSuccess = $.proxy(this.onSocialLoginSuccess, this);
			lr.modules.login_form.init();
		},
		activate: function(prev) {
			if (prev !== undefined) {
				lr.clearAuthInfo();
			}

			lr.modules.login_form.attach();
		},
		deactivate: function() {
			lr.modules.login_form.detach();
		},
		onLoginFail: function() {
			lr.overlayMessage("lr", "userLoginFail");
		},
		onFCALoginSuccess: function(ev, response) {
			this.onExternalLoginSuccess("fca", response);
		},
		onSocialLoginSuccess: function(ev, response) {
			this.onExternalLoginSuccess("social", response);
		},
		onExternalLoginSuccess: function(type, response) {
			lr.setState({
				externalLogin: {
					type: type,
					data: response
				}
			});

			lr.gotoRoute("choose_membership_type");
		}
	});

	lr.Route.Login = Login;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Route
 * @class ChooseRegisterSource
 * @route
 */
(function(lr) {
	var ChooseRegisterSource = lr.Route.extend({
		setup: function(args) {
			lr.modules.login_fca_form = $.extend({}, lr.Module.LoginForm);
			lr.modules.login_fca_form.onLoginFail = $.proxy(this.onLoginFail, this);
			lr.modules.login_fca_form.onFCALoginSuccess = $.proxy(this.onFCALoginSuccess, this);
			lr.modules.login_fca_form.onSocialLoginSuccess = $.proxy(this.onSocialLoginSuccess, this);

			lr.modules.login_fca_form.init({
				container: "[data-form=\"user-login-fca\"]",
				name: "login_fca_form"
			});
		},
		access: function(prev) {
			// If we already have externalLogin information..
			if (lr.state.externalLogin) {
				if (prev.name === "register") {
					lr.redirectBackTo("choose_membership_type");
				}
				else {
					lr.redirectRoute("register");
				}

				return false;
			}

			// If we joined via card_email form..
			if (lr.state.joinType === "card_email") {
				if (prev.name === "register") {
					lr.redirectBackTo("join_card_email");
				}
				else {
					lr.redirectRoute("register");
				}

				return false;
			}
		},
		activate: function() {
			lr.modules.login_fca_form.attach();
		},
		deactivate: function() {
			lr.modules.login_fca_form.detach();
		},
		onLoginFail: function() {
			lr.overlayMessage("lr", "userLoginFail");
		},
		onFCALoginSuccess: function(ev, response) {
			this.onExternalLoginSuccess("fca", response);
		},
		onSocialLoginSuccess: function(ev, response) {
			this.onExternalLoginSuccess("social", response);
		},
		onExternalLoginSuccess: function(type, response) {
			lr.setState({
				externalLogin: {
					type: type,
					data: response
				}
			});

			lr.gotoRoute("register");
		}
	});

	lr.Route.ChooseRegisterSource = ChooseRegisterSource;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Route
 * @class Register
 * @route
 */
(function(lr) {
	var Register = lr.Route.extend({
		setup: function(args) {
			var registration_form = $.extend({}, lr.Module.RegistrationForm);

			registration_form.onDoubleOptInRequired = $.proxy(this.onDoubleOptInRequired, this);
			registration_form.onUserRegistrationDone = $.proxy(this.onUserRegistrationDone, this);
			registration_form.onDuplicateEmail = $.proxy(this.onDuplicateEmail, this);
			registration_form.beforeSend = $.proxy(this.beforeRegisterSend, this);
			registration_form.onCancel = $.proxy(this.onRegistrationCancel, this);

			lr.modules.registration_form = registration_form;
			lr.modules.confirm_password = $.extend({}, lr.Module.ConfirmPassword);
			lr.modules.change_email = $.extend({}, lr.Module.ChangeEmail);

			lr.modules.confirm_password.onSubmit = $.proxy(this.onConfirmPassword, this);
			lr.modules.confirm_password.onLoginFail = $.proxy(this.onFCALoginFail, this);
			lr.modules.confirm_password.onFCALoginSuccess = $.proxy(this.onFCALoginSuccess, this);
			lr.modules.confirm_password.onSocialLoginSuccess = $.proxy(this.onSocialLoginSuccess, this);
			lr.modules.change_email.onSubmit = $.proxy(this.onChangeEmail, this);

			lr.modules.registration_form.init();
			lr.modules.confirm_password.init();
			lr.modules.change_email.init();
		},
		activate: function(args) {
			// Case: User refreshed the page after
			// submitting an existing email address.
			if (lr.state.duplicateEmail) {
				this.showRegisterAdjustPopup();
			}

			// State could contain values for the registration form.
			// So let's sync the registration form with those values.
			this.populateRegistrationForm();
		},
		deactivate: function(next) {
			lr.Route.prototype.deactivate.call(this);

			// Thankyou route is responsible to clear the state.
			if (next.name == "register_thankyou") {
				return;
			}

			// Forget registration data.
			lr.setState({
				registrationData: null,
				doubleOptinRequired: null,
				duplicateEmail: null
			});

			// Reset the registration form.
			lr.modules.registration_form.resetState();
		},
		populateRegistrationForm: function() {
			var marketData = app.MarketManager.getCurrent();
			var values;
			var membershipUserData;

			values = {};

			// Set info about the membership type.
			values.userType = app._CONFIGURATION_.userType[lr.state.membershipType.toUpperCase()];

			values.vinData = lr.state.vinData || null;

			// Set info about membership data,
			// only in case we validated the users' membership, suppliying
			// a card and a vin.
			if (lr.state.joinType == "card") {
				values.membershipCard = lr.state.membershipData.membershipCard;
				values.vinData = {
					vinArr: [
						{
							vin: lr.state.membershipData.vin,
							status: app._CONFIGURATION_.vinStatus.EPER_VALIDATED,
							isEPerVDValidated: true
						}
					]
				};
			}
			else if (lr.state.joinType == "card_email") {
				membershipUserData = lr.state.membershipData.userData || {};

				// Copy user information returned by the membership validate call.
				if (!$.isEmptyObject(membershipUserData)) {
					values.name = membershipUserData.firstName;
					values.surname = membershipUserData.lastName;
					values.address = membershipUserData.address;
					values.city = membershipUserData.city;
					values.province = membershipUserData.province;
					values.zipCode = membershipUserData.zipCode;
					values.phone1 = membershipUserData.phone;
					values.phone2 = membershipUserData.mobilePhone;
				}

				values.membershipCard = lr.state.membershipData.membershipCard;
				values.email = lr.state.membershipData.email;
				values.fixed_email = true;
			}

			if (lr.state.externalLogin) {
				$.extend(values, lr.state.externalLogin.data || {});
			}

			$.extend(values, lr.state.registrationData || {});

			// Force country field.
			values.country = this.getCurrentCountry();
			values.fixed_country = true;

			lr.modules.registration_form.setState(values, {replace: true});
		},
		getMarketCountry: function(market) {
			// Just use a static mapping for sake of semplicity.
			// In the future implement something like this: JOG.Country.getCurrent().
			var marketCountryMapping = {
				"it": "IT",
				"be": "BE",
				"fr": "FR",
				"de": "DE",
				"nl": "NL",
				"at": "AT",
				"ru": "RU",
				"pl": "PL",
				"ch": "CH",
				"uk": "GB",
				"es": "ES",
				"za": "ZA",
				"rs": "RS"
			};

			return marketCountryMapping[market];
		},
		getCurrentCountry: function() {
			var currentMarket = app.MarketManager.getCurrent().market;
			return this.getMarketCountry(currentMarket);
		},
		showRegisterAdjustPopup: function() {
			lr.modules.change_email.resetState();
			lr.modules.confirm_password.resetState();

			lr.showPopup("register_adjust");
		},
		beforeRegisterSend: function() {
			lr.setState({
				registrationData: lr.modules.registration_form.state
			}, {trigger: false});
		},
		onRegistrationCancel: function() {
			// We cannot redirect to a static route, because
			// it depends on the path chosen by the user.
			lr.gotoPrevRoute();
		},
		onDuplicateEmail: function() {
			// Remember that the user entered an email that was already
			// in the user db.
			lr.setState({
				duplicateEmail: true
			});

			lr.saveState();

			this.showRegisterAdjustPopup();
		},
		onChangeEmail: function(state) {
			lr.modules.registration_form.setState({
				email: state.email
			});

			lr.modules.registration_form.sendData();
		},
		onConfirmPassword: function(data) {
			var email;
			var password;

			email = lr.state.registrationData.username;
			password = data.password;

			lr.modules.confirm_password.setState({
				username: email,
				password: password
			});

			lr.modules.confirm_password.sendData();
		},
		onFCALoginFail: function() {
			// In case FCA login failed, let the users correct their input.
			this.showRegisterAdjustPopup();
		},
		onFCALoginSuccess: function(ev, response) {
			this.onExternalLoginSuccess("fca", response);
		},
		onSocialLoginSuccess: function(ev, response) {
			this.onExternalLoginSuccess("social", response);
		},
		onExternalLoginSuccess: function(type, response) {
			lr.setState({
				duplicateEmail: null,
				externalLogin: {
					type: type,
					data: response
				}
			});
		},
		onDoubleOptInRequired: function() {
			lr.setState({
				doubleOptinRequired: true
			});

			this.gotoThankyou();
		},
		onUserRegistrationDone: function() {
			this.gotoThankyou();
		},
		gotoThankyou: function() {
			lr.gotoRoute("register_thankyou");
		}
	});

	lr.Route.Register = Register;
}(app.LR));

/**
 * @package JOG
 * @module LR
 * @submodule Route
 * @class JoinOwner
 * @route
 */
(function(lr) {
	var JoinOwner = lr.Route.extend({
		setup: function(args) {
			lr.modules.vin_form = new lr.Module.VinVerifier({
				name: "vin_form",
				form: "[data-form=\"insert-vin\"]",
			});

			lr.modules.vin_form.onConfirm = $.proxy(this.onVinConfirm, this);
		},
		activate: function() {
			lr.modules.vin_form.attach();
		},
		deactivate: function() {
			lr.modules.vin_form.detach();
			lr.modules.vin_form.resetState();
		},
		onVinConfirm: function(state) {
			lr.setState({
				vinData: state.vinData
			});

			lr.gotoRoute("choose_register_source");
		}
	});

	lr.Route.JoinOwner = JoinOwner;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Route
 * @class JoinLifetime
 * @route
 */
(function(lr) {
	var JoinLifetime = lr.Route.extend({
		setup: function(args) {
			lr.modules.vins_form = new lr.Module.VinVerifier({
				name: "vins_form",
				form: "[data-form=\"insert-vins-list\"]"
			});

			lr.modules.vins_form.onConfirm = $.proxy(this.onVinConfirm, this);
		},
		activate: function() {
			lr.modules.vins_form.attach();
			lr.modules.vins_form.resetState();
		},
		deactivate: function() {
			lr.modules.vins_form.detach();
		},
		onVinConfirm: function(state) {
			lr.setState({
				vinData: state.vinData
			});

			lr.gotoRoute("choose_register_source");
		}
	});

	app.LR.Route.JoinLifetime = JoinLifetime;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Route
 * @class JoinCard
 * @route
 */
(function(lr) {
	var JoinCard = lr.Route.extend({
		setup: function(args) {
			lr.modules.card_form = $.extend({}, lr.Module.CardForm);
			lr.modules.card_form.onSuccess = $.proxy(this.onMembershipVerified, this);
			lr.modules.card_form.init();
		},
		activate: function() {
			lr.modules.card_form.resetState();
			lr.modules.card_form.attach();
		},
		deactivate: function(next) {
			lr.modules.card_form.detach();

			if (next.name === "choose_membership_type" || next.name === "login") {
				lr.setState({
					membershipData: null,
					membershipType: null,
					joinType: null
				});
			}
		},
		onMembershipVerified: function(state) {
			lr.setState({
				membershipData: {
					membershipCard: state.membershipCard,
					vin: state.vin
				},
				membershipType: "owner",
				joinType: "card"
			});

			lr.gotoRoute("choose_register_source");
		}
	});

	lr.Route.JoinCard = JoinCard;
}(app.LR));

/**
 * @package JOG
 * @module LR
 * @submodule Route
 * @class JoinCardEmail
 * @route
 */
(function(lr) {
	var JoinCardEmail = lr.Route.extend({
		setup: function(args) {
			lr.modules.card_email_form = $.extend({}, lr.Module.CardEmailForm);
			lr.modules.card_email_form.onSuccess = $.proxy(this.onMembershipVerified, this);
			lr.modules.card_email_form.onInvalidPasswordConfirm = $.proxy(this.onInvalidPasswordConfirm, this);
			lr.modules.card_email_form.init();
		},
		activate: function() {
			lr.modules.card_email_form.resetState();
			lr.modules.card_email_form.attach();
		},
		deactivate: function(next) {
			lr.modules.card_email_form.detach();

			if (next.name === "choose_membership_type" || next.name === "login") {
				lr.setState({
					membershipData: null,
					membershipType: null,
					joinType: null
				});
			}
		},
		onMembershipVerified: function(formState, membershipData) {
			this.setVerifiedMembership({
				userType: membershipData.userType,
				userData: membershipData.userData || {},
				email: formState.email,
				password: formState.password,
				hasInvalidPass: !!formState.errors.hasInvalidPass
			});
		},
		onInvalidPasswordConfirm: function(formState) {
			this.setVerifiedMembership({
				userType: formState.partialVerification.userType,
				userData: {},
				email: formState.email,
				password: formState.password,
				hasInvalidPass: true
			});
		},
		setVerifiedMembership: function(membershipData) {
			var membershipType;

			switch (membershipData.userType) {
				case app._CONFIGURATION_.userType.LIFETIME:
				case app._CONFIGURATION_.userType.LIFETIME + "I":
					membershipType = "lifetime";
					break;

				case app._CONFIGURATION_.userType.OWNER:
				case app._CONFIGURATION_.userType.OWNER + "I":
					membershipType = "owner";
					break;

				case app._CONFIGURATION_.userType.ENTHUSIAST:
				case app._CONFIGURATION_.userType.ENTHUSIAST + "I":
				default:
					membershipType = "enthusiast";
					break;
			}

			lr.setState({
				membershipData: membershipData,
				membershipType: membershipType,
				joinType: "card_email"
			});

			if (membershipType == "lifetime") {
				lr.gotoRoute("join_lifetime");
			}
			else if (membershipType == "owner") {
				lr.gotoRoute("join_owner");
			}
			else {
				lr.gotoRoute("register");
			}
		}
	});

	lr.Route.JoinCardEmail = JoinCardEmail;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Route
 * @class Thankyou
 * @route
 */
(function(lr) {
	var Thankyou = lr.Route.extend({
		activate: function() {
			// Pre-populate login form, in case we want to login immediately.
			lr.modules.login_form.setState({
				username: lr.state.registrationData.username,
				password: ""
			});

			// Manually trigger conditions/bindings before resetting state.
			lr.onStateChange();

			// Eventually reset the state.
			// Note: do not trigger change event in order not to change the ui.
			lr.resetState({trigger: false});

			// Remove auth info, since it is not useful anymore.
			lr.clearAuthInfoStorage();

			// But ensure state will be forgotten soon.
			lr.clearStorage();
		}
	});

	lr.Route.Thankyou = Thankyou;
}(app.LR));

/**
 * @package JOG
 * @module LR
 * @submodule Module
 * @class LoginForm
 */

(function() {
	function handleSubmit(ev) {
		ev.preventDefault();
		this.submit();
	}

	var ui = {};
	ui.init = function(opts) {
		var defOpts = {
			container: "[data-form=\"user-login\"]",
			name: "login_form"
		};

		this.opts = $.extend(true, {}, defOpts, opts || {});

		this.$container = $(this.opts.container);

		// DOM events.
		this.$container.on("click", ".js-send-login", $.proxy(handleSubmit, this));
		this.$container.onEnterKey("input[type=text], input[type=password]", $.proxy(handleSubmit, this));

		this.initState();
	};

	ui.onStateChange = function(changed, old) {
		if ("username" in changed) {
			this.$container.find("input[name=\"user\"]").val(this.state.username);
		}

		if ("password" in changed) {
			this.$container.find("input[name=\"password\"]").val(this.state.password);
		}
	};

	ui.attach = function() {
		$(document).on(app._CONFIGURATION_.Events.PAuserLoginFail + "." + this.name, $.proxy(this.onLoginFail, this));
		$(document).on(app._CONFIGURATION_.Events.PAuserLoginFCASuccess + "." + this.name, $.proxy(this.onFCALoginSuccess, this));
		$(document).on(app._CONFIGURATION_.Events.PAuserLoginSocialSuccess + "." + this.name, $.proxy(this.onSocialLoginSuccess, this));
	};

	ui.detach = function() {
		$(document).off("." + this.name);
	};

	ui.validate = function(cb) {
		validateForm.init(this.$container, cb || $.noop);
	};

	ui.submit = function() {
		this.validate($.proxy(this.sendData, this));
	};

	ui.defaultState = function() {
		return {
			username: "",
			password: ""
		};
	};

	ui.readState = function() {
		var state = {
			username: $.trim(this.$container.find("input[name=\"user\"]").val()),
			password: $.trim(this.$container.find("input[name=\"password\"]").val())
		};

		return state;
	};

	ui.prepareData = function(state) {
		return state;
	};

	ui.sendData = function() {
		var data;

		this.getState();
		data = this.prepareData(this.state);
		this.beforeSend(data, this.state);

		$(document).trigger(app._CONFIGURATION_.Events.PAloginFormSubmit, data);
	};

	ui.beforeSend = function() {};
	ui.onLoginFail = function() {};
	ui.onFCALoginSuccess = function() {};
	ui.onSocialLoginSuccess = function() {};

	$.extend(ui, app.Stateful);

	app.LR.Module.LoginForm = ui;
}());

/**
 * @package JOG
 * @module LR
 * @submodule Module
 * @class RegistrationForm
 */
(function(lr) {
	var SELECT_ALL = "-";

	var ui = {};

	function handleSubmitClick(ev) {
		ev.preventDefault();
		this.submit();
	}

	function handleCancelClick(ev) {
		ev.preventDefault();
		this.onCancel();
	}

	function handleFieldChange(ev) {
		this.validate();
	}

	ui.init = function(opts) {
		var defOpts = {};

		this.opts = $.extend(true, defOpts, opts || {});

		this.$container = $("[data-form=\"user-register\"]");

		// DOM events.
		this.$container.on("click", ".js-send-register", $.proxy(handleSubmitClick, this));
		this.$container.on("click", ".js-cancel", $.proxy(handleCancelClick, this));
		this.$container.on("change", ":input", $.proxy(handleFieldChange, this));
		this.$container.onEnterKey(":input", function() {
			return false;
		});

		this.attach();

		this.initState();

		this.postalCodeField = new app.Component.PostalCodeField({
			element: this.$field("zip_code")
		});

		// Apply market-specific adjustments.
		this.marketAdjustments();

		// Check if we need to prefill with data coming from the request (querystring).
		this.populateFromRequest();
	};

	ui.attach = function() {
		// Business events.
		$(document).on(app._CONFIGURATION_.Events.PAdoubleOptInRequired, $.proxy(this.onDoubleOptInRequired, this));
		$(document).on(app._CONFIGURATION_.Events.PAuserRegistrationDone, $.proxy(this.onUserRegistrationDone, this));
		$(document).on(app._CONFIGURATION_.Events.PAregistrationDuplicateEmail, $.proxy(this.onDuplicateEmail, this));
	};

	ui.marketAdjustments = function() {
		var current = JOG.MarketManager.getCurrent();
		var market = current.market;

		switch (market) {
			// France.
			case "fr":
				// Hide text above phone contacts.
				this.$container.find(".lr__phone-contacts-text").hide();
				// Hide fiscal code field.
				this.$container.find(".fiscalcode_wrap").closest(".field-item").addClass("field-item--disabled");
				break;
			// Belgium.
			case "be":
				// Hide fiscal code field.
				this.$container.find(".fiscalcode_wrap").closest(".field-item").addClass("field-item--disabled");
				break;
		}
	};

	ui.populateFromRequest = function() {
		var data = {};
		var fields = ["name", "surname", "email"];

		$.each(fields, function(index, fieldName) {
			var fieldValue = GetUrlParam(fieldName);
			if (fieldValue !== false) {
				data[fieldName] = $.trim(fieldValue);
			}
		});

		if (!$.isEmptyObject(data)) {
			this.setState(data);
		}
	};

	ui.defaultState = function() {
		return {
			username: "",
			password: "",
			name: "",
			surname: "",
			gender: "",
			address: "",
			city: "",
			province: "",
			zipCode: "",
			phone1: "",
			phone2: "",
			fiscalCode: "",
			channels: "",
			country: "",
			fixed_country: false,
			survey: {}
		}
	};

	ui.onStateChange = function(changed, old) {
		var code;
		var needsPassword;
		var hasVerifiedEmail = false;
		var self = this;

		if ("code" in changed) {
			code = this.state.code || app._CONFIGURATION_.userStatus.IS_LOCAL;
			needsPassword = true;
			hasVerifiedEmail = (changed.email && code == app._CONFIGURATION_.userStatus.IS_UNKNOWN);

			if ($.inArray(code, [app._CONFIGURATION_.userStatus.IS_UNKNOWN, app._CONFIGURATION_.userStatus.IS_FCA, app._CONFIGURATION_.userStatus.IS_MOC]) !== -1) {
				needsPassword = false;
			}

			if (needsPassword) {
				this.$container.find("input[name=\"password\"]").closest(".field-item").show();
				this.$container.find("input[name=\"confirm_password\"]").closest(".field-item").show();
			}
			else {
				this.$container.find("input[name=\"password\"]").closest(".field-item").hide();
				this.$container.find("input[name=\"confirm_password\"]").closest(".field-item").hide();
			}
		}

		if ("gender" in changed) {
			switch (changed.gender) {
				case "male":
					this.$container.find("input[value=\"" + USER_TYPE_PRIVATE + "\"]").attr({"checked":"checked"}).click();
					this.$container.find("[name=\"sex\"]").val("M");
					break;

				case "female":
					this.$container.find("input[value=\"" + USER_TYPE_PRIVATE + "\"]").attr({"checked":"checked"}).click();
					this.$container.find("[name=\"sex\"]").val("F");
					break;

				case "company":
					this.$container.find("input[value=\"" + USER_TYPE_COMPANY + "\"]").attr({"checked":"checked"}).click();
					break;

				default:
					this.$container.find("[name=\"sex\"]").val(this.state.gender);
					break;
			}
		}

		if ("email" in changed || "username" in changed) {
			this.$container.find("input[name=\"email\"]").val(this.state.email || this.state.username);
		}

		this.$field("email").prop("disabled", this.state.fixed_email || hasVerifiedEmail);

		if ("password" in changed) {
			this.$container.find("input[name=\"password\"]").val(this.state.password);
			this.$container.find("input[name=\"confirm_password\"]").val(this.state.password);
		}

		if ("name" in changed) {
			this.$container.find("input[name=\"name\"]").val(this.state.name);
		}

		if ("surname" in changed) {
			this.$container.find("input[name=\"surname\"]").val(this.state.surname);
		}

		if ("phone1" in changed) {
			this.$container.find("input[name=\"phone_1\"]").val(this.state.phone1);
		}

		if ("phone2" in changed) {
			this.$container.find("input[name=\"phone_2\"]").val(this.state.phone2);
		}

		if ("phone3" in changed) {
			this.$container.find("input[name=\"phone_3\"]").val(this.state.phone3);
		}

		if ("address" in changed) {
			this.$container.find("input[name=\"address\"]").val(this.state.address);
		}

		if ("country" in changed) {
			this.$container.find("[name=\"country_2\"]").val((this.state.country == "" ? "-" : this.state.country.toUpperCase()));

			if (this.state.country) {
				this.postalCodeField.setCountry(this.state.country);
			}
		}

		if ("fixed_country" in changed) {
			this.$container.find("[name=\"country_2\"]").prop("disabled", !!this.state.fixed_country);
		}

		if ("fiscalCode" in changed) {
			this.$container.find("input[name=\"fiscal_code\"]").val(this.state.fiscalCode);
		}

		if ("zipCode" in changed) {
			this.$container.find("input[name=\"zip_code\"]").val(this.state.zipCode);
		}

		if ("province" in changed) {
			this.$container.find("input[name=\"province\"]").val(this.state.province);
		}

		if ("city" in changed) {
			this.$container.find("[name=\"city\"]").val(this.state.city);
		}

		if ("channels" in changed) {
			if (self.state.channels) {
				this.$container.find(".channel-input").each(function() {
					var $inputs = $(this).find(":input");
					$inputs.each(function() {
						var channels = $(this).val();
						$(this).prop("checked", (self.state.channels.indexOf(channels) !== -1));
					});
				});
			}
			else {
				this.$container.find(".channel-input :input").prop("checked", false);
			}
		}

		if ("survey" in changed) {
			if (this.state.survey) {
				this.$container.find("[name=\"survey_offroad_capacity\"]").val(this.state.survey.offroad_capacity || "-");
				this.$container.find("[name=\"survey_use\"]").val(this.state.survey.use || "-");
			}
		}
	};

	ui.onStateReset = function() {
		clearForm(this.$container);
	};

	ui.validate = function(cb, scrollToError) {
		this.getState();

		validateForm.init(this.$container, cb || $.noop, !!scrollToError, $.proxy(function() {
			var marketData = app.MarketManager.getCurrent();
			var validZip;

			validZip = (app.Validate.zipCode(this.state.zipCode, marketData.market).valid);

			if (validZip) {
				this.$field("zip_code").removeClass("error");
			}
			else {
				this.$field("zip_code").addClass("error");
			}

			return validZip;
		}, this));
	};

	ui.submit = function() {
		this.validate($.proxy(this.sendData, this), true);
	};

	ui.$field = function(fieldName) {
		return this.$container.find(":input[name=\"" + fieldName + "\"]");
	};

	ui.readState = function() {
		var data = {};
		var channelsList;
		var channels;
		var selectFields;

		channelsList = $('.channel-input', this.$container).map(function() {
			return $('input:checked', this).val();
		}).get();

		channels = channelsList.join("|");

		data = {
			username: $.trim(this.$container.find("input[name=\"email\"]").val()),
			password: $.trim(this.$container.find("input[name=\"password\"]").val()),
			name: $.trim(this.$container.find("input[name=\"name\"]").val()),
			surname: $.trim(this.$container.find("input[name=\"surname\"]").val()),
			gender: $.trim(this.$container.find("select[name=\"sex\"]").val()),
			address: $.trim(this.$container.find("input[name=\"address\"]").val()),
			city: $.trim(this.$container.find("input[name=\"city\"]").val()),
			province: $.trim(this.$container.find("select[name=\"region_1\"]").val()),
			zipCode: $.trim(this.$container.find("input[name=\"zip_code\"]").val()),
			phone1: $.trim(this.$container.find("input[name=\"phone_1\"]").val()),
			phone2: $.trim(this.$container.find("input[name=\"phone_2\"]").val()),
			fiscalCode: $.trim(this.$container.find("input[name=\"fiscal_code\"]").val()),
			channels: channels
		};

		selectFields = {
			country: "country_2"
		};

		$.each(selectFields, $.proxy(function(propName, fieldName) {
			var value;
			value = this.$container.find("[name=\"" + fieldName + "\"]").val();
			data[propName] = (value === SELECT_ALL ? "" : value);
		}, this));

		data.survey = {};

		switch (this.state.userType) {
			case app._CONFIGURATION_.userType.OWNER:
			case app._CONFIGURATION_.userType.LIFETIME:
				$.each(["use", "offroad_capacity"], $.proxy(function(index, name) {
					var value;
					value = $.trim(this.$container.find("[name=\"survey_" + name + "\"]").val());
					data.survey[name] = (value == SELECT_ALL ? "" : value);
				}, this));
				break;
		}

		return $.extend({}, this.state, data);
	};

	ui.prepareData = function(state) {
		var data = {
			username: state.username,
			password: state.password,
			name: state.name,
			surname: state.surname,
			gender: state.gender,
			address: state.address,
			city: state.city,
			province: state.province,
			zipCode: state.zipCode,
			phone1: state.phone1,
			phone2: state.phone2,
			fiscalCode: state.fiscalCode,
			country: state.country,
			channels: state.channels,
			userType: state.userType,
			data: state.survey || {}
		};

		// Copy vin(s) and vinStatus(es), depending on user type.
		if (state.membershipCard) {
			data.membershipCard = state.membershipCard;
		}

		if (state.vinData && !$.isEmptyObject(state.vinData)) {
			data.vin = state.vinData.vinArr[0].vin;
			data.vinStatus = state.vinData.vinArr[0].status;

			if (state.userType === app._CONFIGURATION_.userType.LIFETIME) {
				// Vins starting from the second must be placed in "otherVins" property.
				data.otherVins = [];
				$.each(state.vinData.vinArr, function(index, value) {
					// Skip first vin.
					if (index == 0) {
						return;
					}

					data.otherVins.push({
						vin: value.vin,
						vinStatus: value.status
					});
				});
			}
		}

		return data;
	};

	ui.sendData = function() {
		var data;

		this.getState();
		data = this.prepareData(this.state);
		this.beforeSend(data);

		$(document).trigger(app._CONFIGURATION_.Events.PAregisterUser, data);
	};

	ui.onUserRegistrationDone = function() {};
	ui.onDoubleOptInRequired = function() {};
	ui.beforeSend = function() {};
	ui.onDuplicateEmail = function() {};
	ui.onCancel = function() {};

	$.extend(ui, app.Stateful);

	lr.Module.RegistrationForm = ui;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Module
 * @class ConfirmPassword
 */
(function(lr) {
	function handleSubmit(ev) {
		ev.preventDefault();
		this.submit();
	}

	var ui = $.extend({}, lr.Module.LoginForm);

	ui.init = function() {
		this.$container = $("[data-form=\"register-confirm-password\"]");

		this.initState();

		// DOM events.
		this.$container.on("click", ".js-submit", $.proxy(handleSubmit, this));
		this.$container.onEnterKey(":input", $.proxy(handleSubmit, this));
	};

	ui.defaultState = function() {
		return {
			password: ""
		}
	};

	ui.onStateChange = function(changed, old) {
		if ("password" in changed) {
			this.$container.find("[name=\"password\"]").val(this.state.password);
		}
	};

	ui.readState = function() {
		return $.extend({}, this.state, {
			password: $.trim(this.$container.find("[name=\"password\"]").val())
		});
	};

	ui.validate = function(cb) {
		validateForm.init(this.$container, cb || $.noop);
	};

	ui.submit = function() {
		this.validate($.proxy(function() {
			this.getState();
			this.onSubmit(this.state);
		}, this));
	};

	ui.onSubmit = function() {}

	lr.Module.ConfirmPassword = ui;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Module
 * @class ChangeEmail
 */
(function(lr) {
	function handleSubmit(ev) {
		ev.preventDefault();
		this.submit();
	}

	var ui = {};
	ui.init = function() {
		this.$container = $("[data-form=\"register-change-email\"]");

		// DOM events.
		this.$container.on("click", ".js-submit", $.proxy(handleSubmit, this));
		this.$container.onEnterKey(":input", $.proxy(handleSubmit, this));

		this.initState();
	};

	ui.defaultState = function() {
		return {
			email: ""
		}
	};

	ui.onStateChange = function(changed, old) {
		if ("email" in changed) {
			this.$container.find("[name=\"email\"]").val(this.state.email);
		}
	};

	ui.readState = function() {
		var state = {
			email: $.trim(this.$container.find("[name=\"email\"]").val())
		};

		return state;
	};

	ui.validate = function(cb) {
		validateForm.init(this.$container, cb || $.noop);
	};

	ui.submit = function() {
		this.validate($.proxy(function() {
			this.getState();
			this.onSubmit(this.state);
		}, this));
	};

	ui.onSubmit = function() {}

	$.extend(ui, app.Stateful);

	lr.Module.ChangeEmail = ui;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Module
 * @class VinVerifier
 */
(function(lr) {
	var VIN_FORMAT_RE = /^.{17}/i;

	var VIN_ERROR_NOT_VALID = "not_valid";
	var VIN_ERROR_NOT_VERIFIED = "not_verified";
	var VIN_ERROR_DUPLICATE = "duplicate";

	function onVerifyClick(ev) {
		ev.preventDefault();
		this.verify();
	}

	function onConfirmClick(ev) {
		ev.preventDefault();
		this.getState();

		if (!this.state.autocertify) {
			return;
		}

		this.confirm();
	}

	function onVinChange(ev) {
		this.onVinChanged($(ev.target));
	}

	var Verifier = app.Object.extend({
		initialize: function(opts) {
			var defOpts = {
				strictVinValidation: false
			};

			this.opts = $.extend({}, defOpts, opts || {});
			this.name = this.opts.name;
			this.$form = $(this.opts.form);
			this.$vins = this.$form.find("[name^=\"vin\"]");
			this.$autocertify = this.$form.find("[name=\"autocertify\"]");

			this.initState();

			// DOM Events.
			this.$form.on("change", "[name^=\"vin\"]", $.proxy(onVinChange, this));
			this.$form.on("click", ".js-verify-vin", $.proxy(onVerifyClick, this));
			this.$form.on("click", ".js-confirm-vin", $.proxy(onConfirmClick, this));
		},
		attach: function() {
			$(document).on(app._CONFIGURATION_.Events.PAverifyMultipleVinResponse + "." + this.name, $.proxy(function(ev, response) {
				this.onVerifyResponse(response);
			}, this));
		},
		detach: function() {
			$(document).off(app._CONFIGURATION_.Events.PAverifyMultipleVinResponse + "." + this.name);
		},
		defaultState: function() {
			return {
				errors: {
					vins: [],
					hasUnverifiedVins: false,
					hasInvalidVins: false
				},
				vins: [],
				autocertify: false,
				vinData: []
			}
		},
		readState: function() {
			var vins;

			vins = this.$vins.map(function() {
				return $.trim($(this).val());
			}).get();

			return $.extend({}, this.state, {
				vins: vins,
				autocertify: this.$autocertify.is(":checked")
			});
		},
		onStateChange: function(changed, old) {
			if ("errors" in changed) {
				if (changed.errors) {
					this.$form.toggleClass("has-unverified-vins", !!changed.errors.hasUnverifiedVins);

					if (changed.errors.vins) {
						this.$vins.removeClass("error");
						$.each(changed.errors.vins, $.proxy(function(index, errors) {
							if (errors.length > 0) {
								this.$vins.eq(index).addClass("error");
							}
						}, this));
					}
				}
				else {
					this.$form.removeClass("has-unverified-vins");
					this.$vins.removeClass("error");
				}
			}

			if ("autocertify" in changed) {
				this.$autocertify.prop("checked", this.state.autocertify);
			}
		},
		validate: function() {
			var vins;
			var hasInvalidVins = 0;
			var vinErrors = [];
			var vinCounters = [];

			this.getState();

			$.each(this.state.vins, $.proxy(function(index, vin) {
				var validatesFormat;
				validatesFormat = this.validateVinValueFormat(vin);

				vinErrors[index] = [];

				if (!validatesFormat) {
					vinErrors[index].push(VIN_ERROR_NOT_VALID);
					hasInvalidVins = true;
					// Skip other validations.
					return;
				}

				if (vinCounters[vin] === undefined) {
					vinCounters[vin] = 0;
				}

				vinCounters[vin]++;

				if (vinCounters[vin] > 1) {
					vinErrors[index].push(VIN_ERROR_DUPLICATE);
					hasInvalidVins = true;
				}
			}, this));

			this.setState({
				errors: {
					hasInvalidVins: hasInvalidVins,
					vins: vinErrors
				}
			});
		},
		verify: function() {
			this.validate();

			this.setState({
				vinData: {}
			});

			if (!this.state.errors.hasInvalidVins) {
				$(document).trigger(app._CONFIGURATION_.Events.PAverifyMultipleVin, {
					vinArr: this.state.vins
				});
			}
		},
		validateVinValueFormat: function(str) {
			if (this.opts.strictVinValidation) {
				return !!str.match(VIN_FORMAT_RE);
			}
			else {
				return $.trim(str).length > 0;
			}
		},
		onVinChanged: function($vin) {
			this.validate();
		},
		onVerifyResponse: function(response) {
			var unverifiedCount = 0;
			var vinErrors = [];
			var newState = {};

			$.each(this.state.vins, $.proxy(function(index, vin) {
				var status;
				status = response.vinArr[index].status;
				vinErrors[index] = [];
				if (status != app._CONFIGURATION_.vinStatus.EPER_VALIDATED) {
					vinErrors[index].push(VIN_ERROR_NOT_VERIFIED);
					unverifiedCount++;
				}
			}, this));

			newState.errors = {};
			newState.errors.hasUnverifiedVins = (unverifiedCount > 0);
			newState.errors.vins = vinErrors;
			newState.vinData = response;

			this.setState(newState);

			if (unverifiedCount == 0) {
				this.confirm();
			}
		},
		confirm: function() {
			this.onConfirm(this.state);
		},
		onConfirm: function() {}
	});

	Verifier.VIN_FORMAT_RE = VIN_FORMAT_RE;

	$.extend(Verifier.prototype, app.Stateful);

	lr.Module.VinVerifier = Verifier;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Module
 * @class CardForm
 */
(function(lr) {
	function handleSubmit(ev) {
		ev.preventDefault();
		this.submit();
	}

	var ui = {};
	ui.init = function() {
		this.name = "card_vin_form";

		// @TODO: use "insert-card" selector for compatibility,
		// remove when new version is in production.
		this.$container = $("[data-form=\"card-vin-form\"], [data-form=\"insert-card\"]").eq(0);

		// DOM events.
		this.$container.on("click", ".js-submit", $.proxy(handleSubmit, this));
		this.$container.onEnterKey(":input", $.proxy(handleSubmit, this));

		this.initState();
	};

	ui.attach = function() {
		// Business events,
		$(document).on(app._CONFIGURATION_.Events.PAverifyMembershipSuccess + "." + this.name, $.proxy(function() {
			this.onSuccess(this.state);
		}, this));
		$(document).on(app._CONFIGURATION_.Events.PAverifyMembershipFail + "." + this.name, $.proxy(this.onFail, this));
	};

	ui.detach = function() {
		$(document).off(app._CONFIGURATION_.Events.PAverifyMembershipSuccess + "." + this.name);
		$(document).off(app._CONFIGURATION_.Events.PAverifyMembershipFail + "." + this.name);
	};

	ui.defaultState = function() {
		return {
			membershipCard: "",
			vin: "",
			errors: {}
		}
	};

	ui.readState = function() {
		var state = {};
		state.membershipCard = this.$container.find("[name=\"membership_card\"]").val();
		state.vin = this.$container.find("[name=\"vin\"]").val();
		return $.extend({}, this.state, state);
	};

	ui.onStateChange = function(changed, old) {
		if ("membershipCard" in changed) {
			this.$container.find("[name=\"membership_card\"]").val(this.state.membershipCard);
		}

		if ("vin" in changed) {
			this.$container.find("[name=\"vin\"]").val(this.state.vin);
		}

		if ("errors" in changed) {
			if ($.isEmptyObject(this.state.errors)) {
				this.$container.find(":input").removeClass("error");
			}
			else if (this.state.errors.hasInvalidData) {
				this.$container.find(":input").addClass("error");
			}

			this.$container.toggleClass("has-invalid-data", !!this.state.errors.hasInvalidData);
		}
	};

	ui.validate = function(cb) {
		validateForm.init(this.$container, cb || $.noop);
	};

	ui.submit = function() {
		this.validate($.proxy(this.sendData, this));
	};

	ui.prepareData = function(state) {
		return state;
	};

	ui.sendData = function() {
		var data;

		this.getState();
		data = this.prepareData(this.state);

		$(document).trigger(app._CONFIGURATION_.Events.PAverifyMembership, [data]);
	};

	ui.onFail = function(response) {
		this.setState({
			errors: {
				hasInvalidData: true
			}
		});
	};

	/**
	 * @method onSuccess
	 * @callback
	 *
	 */
	ui.onSuccess = function() {}

	$.extend(ui, app.Stateful);

	lr.Module.CardForm = ui;
}(app.LR));


/**
 * @package JOG
 * @module LR
 * @submodule Module
 * @class CardEmailForm
 */
(function(lr) {
	function handleSubmit(ev) {
		ev.preventDefault();
		this.submit();
	}

	function handleFieldChange(ev) {
		this.setState({
			errors: {
				hasInvalidPass: false
			},
			partialVerification: {}
		});
	}

	var ui = {};
	ui.init = function(opts) {
		var defOpts = {
			forceValidPass: false
		};

		this.opts = $.extend({}, defOpts, opts || {});

		this.name = "card_email_form";
		this.$container = $("[data-form=\"card-email-form\"]");

		// DOM events.
		this.$container.on("click", ".js-submit", $.proxy(handleSubmit, this));
		this.$container.on("change", ":input", $.proxy(handleFieldChange, this));
		this.$container.onEnterKey(":input", $.proxy(handleSubmit, this));

		this.initState();
	};

	ui.attach = function() {
		// Business events,
		$(document).on(app._CONFIGURATION_.Events.PAverifyMembershipSuccess + "." + this.name, $.proxy(this.onMembershipVerifySuccess, this));
		$(document).on(app._CONFIGURATION_.Events.PAverifyMembershipFail + "." + this.name, $.proxy(this.onMembershipVerifyFail, this));
	};

	ui.detach = function() {
		$(document).off(app._CONFIGURATION_.Events.PAverifyMembershipSuccess + "." + this.name);
		$(document).off(app._CONFIGURATION_.Events.PAverifyMembershipFail + "." + this.name);
	};

	ui.defaultState = function() {
		return {
			membershipCard: "",
			email: "",
			password: "",
			errors: {},
			partialVerification: {}
		}
	};

	ui.readState = function() {
		var state = {};
		state.membershipCard = $.trim(this.$container.find("[name=\"membership_card\"]").val());
		state.email = $.trim(this.$container.find("[name=\"email\"]").val());
		state.password = $.trim(this.$container.find("[name=\"password\"]").val());
		return $.extend({}, this.state, state);
	};

	ui.onStateChange = function(changed, old) {
		if ("membershipCard" in changed) {
			this.$container.find("[name=\"membership_card\"]").val(this.state.membershipCard);
		}

		if ("email" in changed) {
			this.$container.find("[name=\"email\"]").val(this.state.email);
		}

		if ("password" in changed) {
			this.$container.find("[name=\"password\"]").val(this.state.password);
		}

		if ("errors" in changed) {
			if ($.isEmptyObject(this.state.errors)) {
				this.$container.find(":input").removeClass("error");
			}
			else {
				this.$container.find("[name=\"membership_card\"], [name=\"email\"]").toggleClass("error", !!this.state.errors.hasInvalidData);
			}

			this.$container.toggleClass("has-invalid-data", !!this.state.errors.hasInvalidData);
		}

		if (this.opts.forceValidPass) {
			this.$container.find("[name=\"password\"]").toggleClass("error", !!this.state.errors.hasInvalidPass);
			this.$container.toggleClass("has-invalid-pass", !!this.state.errors.hasInvalidPass);
		}
	};

	ui.validate = function(cb) {
		validateForm.init(this.$container, cb || $.noop);
	};

	ui.submit = function() {
		if (this.opts.forceValidPass && this.state.errors.hasInvalidPass) {
			this.onInvalidPasswordConfirm(this.state);
		}
		else {
			this.validate($.proxy(this.sendData, this));
		}
	};

	ui.prepareData = function(state) {
		return state;
	};

	ui.sendData = function() {
		var data;

		this.getState();
		data = this.prepareData(this.state);

		$(document).trigger(app._CONFIGURATION_.Events.PAverifyMembership, [data]);
	};

	ui.onMembershipVerifySuccess = function(ev, response) {
		this.onSuccess(this.state, response);
	};

	ui.onMembershipVerifyFail = function(ev, response) {
		var hasInvalidData;
		var hasInvalidPass;
		var partialVerification;

		switch (response.responseCode) {
			case app._CONFIGURATION_.Errors.JOG_SERVICE.MEMBERSHIP_VALIDATE.UNKNOWN_CARD:
			case app._CONFIGURATION_.Errors.JOG_SERVICE.MEMBERSHIP_VALIDATE.UNKNOWN_CARD_4_USERNAME:
				hasInvalidData = true;
				hasInvalidPass = false;
				partialVerification = {}
				break;

			case app._CONFIGURATION_.Errors.JOG_SERVICE.MEMBERSHIP_VALIDATE.WRONG_PASSWORD:
				hasInvalidData = false;
				hasInvalidPass = true;
				partialVerification = {
					userType: response.userType
				};

				break;

			default:
				break;
		}

		this.setState({
			errors: {
				hasInvalidData: hasInvalidData,
				hasInvalidPass: hasInvalidPass
			},
			partialVerification: partialVerification
		});

		// A failure occures when we submitted invalid data
		// or when password must be accepted by the system.
		if (hasInvalidData || (hasInvalidPass && this.opts.forceValidPass)) {
			this.onFail(this.state, response);
		}
		else {
			this.onSuccess(this.state, response);
		}
	};

	/**
	 * @method onSuccess
	 * @callback
	 *
	 */
	ui.onSuccess = function() {}

	/**
	 * @method onInvalidPasswordConfirm
	 * @callback
	 *
	 */
	ui.onInvalidPasswordConfirm = function() {};

	/**
	 * @method onFail
	 * @callback
	 *
	 */
	ui.onFail = function() {}

	$.extend(ui, app.Stateful);

	lr.Module.CardEmailForm = ui;
}(app.LR));

/**
 * @package JOG
 * @module LR
 * @submodule Storage
 * @class SessionStorage
 */
(function(lr) {
	var SessionStorage = app.LR.Storage.extend({
		initialize: function(opts) {
			var defOpts = {
				storageKey: "lr:storage"
			};

			this.opts = $.extend(true, {}, defOpts, opts || {});
			this.sessionStorage = window.sessionStorage;
			this._available = undefined;
		},
		isAvailable: function() {
			var sessionStorageAvailable;
			var sessionStorageWritable;

			if (this._available !== undefined) {
				return this._available;
			}

			sessionStorageAvailable = (window.sessionStorage !== undefined) && (typeof(JSON) !== "undefined");

			if (sessionStorageAvailable) {
				try {
					window.sessionStorage.setItem("lr:test", "test");
					sessionStorageWritable = true;
					window.sessionStorage.removeItem("lr:test");
				}
				catch (e) {
					sessionStorageWritable = false;
				}

				this._available = sessionStorageWritable;
			}
			else {
				this._available = false;
			}

			return this._available;
		},
		write: function(obj) {
			if (!this.isAvailable()) {
				return false;
			}

			this.sessionStorage.setItem(this.opts.storageKey, JSON.stringify(obj));
		},
		read: function() {
			var value;
			var obj;

			if (!this.isAvailable()) {
				return;
			}

			value = this.sessionStorage.getItem(this.opts.storageKey);
			if (value) {
				try {
					obj = JSON.parse(value);
				}
				catch (e) {}
			}

			return obj;
		},
		clear: function() {
			if (!this.isAvailable()) {
				return;
			}

			this.sessionStorage.removeItem(this.opts.storageKey);
		}
	});

	lr.Storage.SessionStorage = SessionStorage;
}(app.LR));


/**
 * @package JOG
 * @module PasswordUpdateUI
 */
(function() {
	function handleSubmit(ev) {
		ev.preventDefault();
		this.submit();
	}

	var ui = {};
	ui.init = function() {
		this.$container = $(".lr__module--password-update");

		// DOM events.
		this.$container.on("click", ".js-password-update", $.proxy(handleSubmit, this));
		this.$container.onEnterKey("input[type=password]", $.proxy(handleSubmit, this));

		// Business events.
		$(document).on(app._CONFIGURATION_.Events.PAuserPasswordRescueDone, $.proxy(this.onUserPasswordUpdateDone, this));
	};

	ui.validate = function(cb) {
		validateForm.init(this.$container, cb || $.noop);
	};

	ui.submit = function() {
		this.validate($.proxy(this.sendData, this));
	};

	ui.sendData = function() {
		var data = {
			newPassword: $.trim(this.$container.find("input[name=\"password\"]").val()),
		};

		$(document).trigger(app._CONFIGURATION_.Events.PAuserPasswordRescue, data);
	};

	ui.onUserPasswordUpdateDone = function() {
		$(".lr__form--password-update", this.$container).hide();
		$(".lr__module--password-update__thankyou", this.$container).show();
	};

	app.PasswordUpdateUI = ui;
}());


/**
 * @package JOG
 * @module PasswordRestoreUI
 */
(function() {
	function handleSubmit(ev) {
		ev.preventDefault();
		this.submit();
	}

	var ui = {};
	ui.init = function() {
		this.$container = $(".lr__module--password-reset");

		// DOM events.
		this.$container.on("click", ".js-password-reset", $.proxy(handleSubmit, this));
		this.$container.onEnterKey("input[type=text]", $.proxy(handleSubmit, this));

		// Business events.
		$(document).on(app._CONFIGURATION_.Events.PAuserPasswordResetDone, $.proxy(this.onUserPasswordResetDone, this));
	};

	ui.validate = function(cb) {
		validateForm.init(this.$container, cb || $.noop);
	};

	ui.submit = function() {
		this.validate($.proxy(this.sendData, this));
	};

	ui.sendData = function() {
		var data = {
			email: $.trim(this.$container.find("input[name=\"email\"]").val()),
		};

		$(document).trigger(app._CONFIGURATION_.Events.PAuserPasswordReset, data);
	};

	ui.onUserPasswordResetDone = function() {
		$(".lr__form--password-reset", this.$container).hide();
		$(".lr__module--password-reset__thankyou", this.$container).show();
	};

	app.PasswordResetUI = ui;
}());

}(JOG, JOG._UTILS_.printMsgs, JOG._UTILS_.getUrlParam, JOG._UTILS_.validateForm, JOG._UTILS_.clearForm));
