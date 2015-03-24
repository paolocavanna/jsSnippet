MYAPP.fixedScroll = function(obj){

	var el,	w, objPos, scrollbarPosStart, _stickObj;

	el = document.querySelector(obj);

	w = window;

	objPos = el.offsetTop;

	scrollbarPosStart = w.scrollY;

	_stickObj = function(){

		var scrollbarPosEnd = w.scrollY;

		if ( scrollbarPosStart < scrollbarPosEnd && scrollbarPosEnd > objPos ) {

			el.classList.add("fixed");

		} else if ( scrollbarPosStart > scrollbarPosEnd && scrollbarPosEnd < objPos ) {

			el.classList.remove("fixed");

		}

		scrollbarPosStart = scrollbarPosEnd;

	};

	// DO NOT call it directly on scroll.
	// Uso a scroll handler insted.
	// w.onscroll = _stickObj;

};
