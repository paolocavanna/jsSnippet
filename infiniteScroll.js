DMN.infiniteScroll = function(){

	var items = $(".proditem"),

		doc = $(document),

		w = $(window),

		minVisibleItem = 1,

		contentNumber = 0,

		handleInfoAlert,

		reveal;

	//Set intital divs to be hidden
	items.css("display", "none");

	items.children(".item").addClass("off");

	reveal = function reveal() {

		var constraintNumber = contentNumber + minVisibleItem;

		//IMPORTANT - DO NOT DELETE
		w.trigger('resize');
		//IMPORTANT - DO NOT DELETE

		for ( var i = contentNumber; i < constraintNumber; i++ ) {

			items.eq(contentNumber).fadeIn(function(){

				$(this).children(".item").removeClass("off");

			});

			contentNumber++;

		}

	};

	handleInfoAlert = (function(){

		var msgWrapper = $("#prodotti > .btn-wrapper"),

			SPEED = 3 * 1000;

		return {

			print: function(){

				var msg = "<p class='load-msg'>"+ DMN.printMsgs("loadMore","msg") +"</p>";

				msgWrapper.addClass("faded").html(msg);

			},

			show: function(){

				msgWrapper.removeClass("faded");

			},

			hide: function(){

				var checkForTransitionEnd = function(){

						var properties = ["transitionend", "oTransitionEnd", "webkitTransitionEnd"],

							i,

							len = properties.length;

						for ( i = 0; i < len; i++ ) {

							doc.on(properties[i], function() {

								msgWrapper.remove();

							});

						}

					},

					fn = function(){

						msgWrapper.addClass("faded");

						if ( Modernizr.cssanimations ) {

							checkForTransitionEnd();

						} else {

							msgWrapper.remove();

						}

					},

					t = setTimeout(fn, SPEED);

			}

		}

	})();

	//Window scroll function
	w.on("scroll", function () {

		var winH = w.height(),

            winT = w.scrollTop(),

            docH = doc.height(),

            interval = parseInt( winH * 0.5, 10 );


		if ( docH - winH - winT < interval ) {

			reveal();

		} else {

			if ( $(".proditem:hidden").length === 0 ) {

				handleInfoAlert.show();

				handleInfoAlert.hide();

			}

		}

	});

	handleInfoAlert.print();

	reveal();

};