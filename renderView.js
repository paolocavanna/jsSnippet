/**
 * @module MYAPP
 * @class RenderView Builds page view with rendered template
 * @param {String} template Rendered template
 * @param {Object} node jQuery wrapped DOM node
 */
MYAPP.RenderView = function RenderView(template, node){

	if ( !this instanceof MYAPP.RenderView ) {

		return new MYAPP.RenderView(data, node);

	}

	this.template = template;

	this.node = node;

};

/**
 * @method write
 * @param  {String} method jQuery method name,
 *                         to be able to append, prepend, substitute
 *                         the template in the given node.
 * @required
 */
MYAPP.RenderView.prototype.write = function(method) {

	this.node[method](this.template);

};

/**
 * @module MYAPP
 * @class  PageRender Base template to manage the building of different sections of the page
 * @type {Object}
 */
MYAPP.PageRender = {

	/**
	 * @method query Local reference to QueryData.query method
	 * @type {Function}
	 */
	query: MYAPP.QueryData.query,

	/**
	 * queryParams Local reference to QueryData.getQueryParams method
	 * @type {Function}
	 */
	queryParams: MYAPP.QueryData.getQueryParams,

	/**
	 * queryUrl Local reference to QueryData.getWsURI method
	 * @type {Function}
	 */
	queryUrl: MYAPP.QueryData.getWsURI,

	/**
	 * @property queryParam Query param name
	 * @type {String}
	 */
	queryParam: "METHOD_01",

	/**
	 * @property dataSection Key name to access data object
	 * @type {String}
	 */
	dataSection: "",

	/**
	 * @property templateName Name of the template to render
	 * @type {String}
	 */
	templateName: "",

	/**
	 * templateEvent Event emitted when templates are printed in page
	 * @type {String}
	 */
	templateEvent: MYAPP._EVENTS_.generic.templateCreated,

	/**
	 * @property node DOM node
	 * @type {Object}
	 */
	node: null,

	/**
	 * @method success Manages ajax call success and prints data in page by:
	 * - finding the right XML node
	 * - converting XML to JSON
	 * - rendering the template
	 * - writing it in the right DOM node
	 * When templating is done, an event is broadcasted and callbacks (if any) are executed.
	 * @param {Function} callback CB to be executed after ajax call is done
	 */
	success: function(){

		var that = this,
			node = this.node,
			url = MYAPP.AreaIdentifier.isLocal() ? MYAPP.globals.path : this.queryUrl() + this.queryParams(this.queryParam),
			_htmlTemplates = MYAPP.HtmlTemplates,
			_renderView = new MYAPP.RenderView(_htmlTemplates.get("loader"), node),
			templateName = this.templateName,
			template = null,
			compiledTemplate = "",
			_arguments = arguments,
			args = Array.prototype.slice.call(_arguments),
			k = 0,
			len = _arguments.length;

		/**
		 * Print a loading gif to notify user
		 */
		_renderView.write("html");

		this.query({

			url: url

		}).done(function(data){

			_renderView = new MYAPP.RenderView(template, node);

			_renderView.write("html");

			MYAPP.Mediator.publish(that.templateEvent);

			for ( ; k < len; k += 1 ) {

				if (typeof _arguments[k] === "function") {

					_arguments[k].apply(that, args);

				}

			}

			console.log("write template complete");

		}); // end query.done()

	}

};