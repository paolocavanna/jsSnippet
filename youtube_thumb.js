/**
 * @module MYAPP
 * @class getYouTubeThumb Gets YT video thumbnail from video url
 * @param  {String} url Video url taken from <a> href
 * @required
 * @return {Object} img Image as YT video thumbnail
 */
MYAPP.getYouTubeThumb = function(url){

	"use strict";

	if ( !url ) {

		return;

	}

	var YTimgSrc = "//img.youtube.com/vi/",
		img = new Image();

	img.src = YTimgSrc + url.split("v=")[1] + "/0.jpg";

	return img;

};

/**
 * @module MYAPP
 * @class getEmbed Gets a video url and builds a <iframe> that embeds the video
 * @param  {String} url Video url taken from <a> href
 * @required
 * @param  {Number} index Progressive index to contruct player's id
 * @optional
 * @param  {Boolean} hasAutoPlay Runs or not in autoplay
 * @optional
 * @return {String} output Html rendered template
 * @example
 * <a class="btn_video" href="http://www.youtube.com/watch?v=tkUu4cnyiF4"></a>
 */
MYAPP.getEmbed = function(url, index, hasAutoPlay){

	"use strict";

	if ( !url ) {

		return;

	}

	var htmlTemplates = MYAPP.HtmlTemplates,
		output = "",
		origin = location.origin,
		autoplay = hasAutoPlay,
		youtubeUrl = url.match(/watch\?v=([a-zA-Z0-9\-_]+)/);

	/**
	 * @var autoplay
	 * Cast autoplay value to {Number}
	 * - if hasAutoPlay argument is undefined, set autoplay to 1 (true)
	 * - if is not undefined, check its value and set autoplay accordingly
	 * @type {Number}
	 */
	autoplay = typeof hasAutoPlay === "undefined" ? 1 : ( autoplay ? 1 : 0 );

	/**
	 * @todo Make url parameters variable. Now they're configured as:
	 * - autoplay (dynamic)
	 * - loop (dynamic)
	 * - no controls
	 * - no branding
	 * - no related video
	 * - no info
	 * - no annotations (iv_load_policy=3)
	 * - wmode opaque
	 * - js API enabled
	 * TIP: to make `loop` work, we need to set `playlist` to have the same ID value of the video
	 * @see https://developers.google.com/youtube/player_parameters#loop
	 */
	output = htmlTemplates.set("iframeVideo", {
		index: index,
		autoplay: autoplay,
		src: "https://www.youtube.com/embed/"+youtubeUrl[1]+"?autoplay="+autoplay+"&loop="+autoplay+"&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&wmode=opaque&enablejsapi=1&playlist="+youtubeUrl[1]+"&origin="+origin+""
	}).get("iframeVideo");

	return output;

};

MYAPP.getEmbed = function(url){

	var output = "",

		youtubeUrl = url.match(/watch\?v=([a-zA-Z0-9\-_]+)/),

		vimeoUrl = url.match(/^http:\/\/(www\.)?vimeo\.com\/(clip\:)?(\d+).*$/);


	if ( youtubeUrl ) {

		//output = "<iframe src='http://www.youtube.com/embed/"+youtubeUrl[1]+"?rel=0&autoplay=1&wmode=opaque' frameborder='0' allowfullscreen></iframe>";
		output = "<iframe src='//www.youtube.com/embed/"+youtubeUrl[1]+"?rel=0&autoplay=1&wmode=opaque' frameborder='0' allowfullscreen></iframe>";

		return output;

	} else if ( vimeoUrl ) {

		//output = "<iframe src='http://player.vimeo.com/video/"+vimeoUrl[3]+"' frameborder='0'></iframe>";
		output = "<iframe src='//player.vimeo.com/video/"+vimeoUrl[3]+"' frameborder='0'></iframe>";

		return output;

	}

};
