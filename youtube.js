/**
 * <div class="wrapper video">
		<a class="btn_video" href="http://www.youtube.com/watch?v=LloLYZmjGAA"></a>
		<div id="videoDiv" class="thumb_wrapper">
			<div><img src="img/placeholder26.jpg" alt=""/></div>
		</div>
		<div id="progress_bar"></div>
		<ul id="videoInfo" class="video_controls">
			<li><span id="time">00:00<span> // </span>00:00</span></li>
			<li><a href="#" id="play" title="play"><img src="img/btn_play.png" alt="play"/></a></li>
			<li><a href="#" id="pause" title="pause"><img src="img/btn_pause.png" alt="pause"/></a></li>
			<li><a href="#" id="mute" title="mute"><img src="img/btn_mute.png" alt="mute"/></a></li>
			<li><a href="#" id="unmute" title="unmute"><img src="img/btn_unmute.png" alt="unmute"/></a></li>
			<li id="volume_slider_wrapper"></li>
		</ul>
	</div>
	<ul class="video_list">
		<li>
			<a href="http://www.youtube.com/watch?v=LloLYZmjGAA"><img src="img/placeholder/placeholder27.jpg" alt=""/></a>
		</li>
		<li>
			<a href="http://www.youtube.com/watch?v=l2TQ7ZHx-QY"><img src="img/placeholder/placeholder28.jpg" alt=""/></a>
		</li>
		<li>
			<a href="http://www.youtube.com/watch?v=YdiJvNABRh8"><img src="img/placeholder/placeholder29.jpg" alt=""/></a>
		</li>
		<li>
			<a href="http://www.youtube.com/watch?v=YdiJvNABRh8"><img src="img/placeholder/placeholder29.jpg" alt=""/></a>
		</li>
	</ul>
 */
/*
 * @dependencies: 
 * - jQuery
 * - jQuery UI
*/
MYAPP.YouTubePlayer = (function(){

	//GLOBALS
	var CONTROLS = {

			controls: "#videoInfo",

			progressBar: "#progress_bar",

			volumeSlider: "#volume_slider_wrapper",

			time: "#time",

			videoList: ".video_list"

		},

		CONFIGURATION = {

			//firstVideo: "LloLYZmjGAA",

			playerID: "ytPlayer",

			imgSrc: "http://img.youtube.com/vi/"
		},


		$ytPlayer,

		$controls,

		$volumeSlider,

		$progressBar,

		$videoList,

		//private

		_init,

		_handleThumbs,

		_yTubeFns,

		_managePlayer,

		_gatherElments,

		_hadleEventListeners,

		_callBackPlayer,

		_getVideoID,

		_updateTime,

		_updateProgbar,

		_updateVideo,

		_loadPlayer,

		//public
		managePlayer,

		init;


	//PRIVATE

	_gatherElments = function(){

		$controls = $(CONTROLS.controls);

		$volumeSlider = $(CONTROLS.volumeSlider);

		$progressBar = $(CONTROLS.progressBar);

		$time = $(CONTROLS.time);

		$videoList = $(CONTROLS.videoList);

	};


	//LISTENER

	_hadleEventListeners = function(){

		$controls.on("click", "a", _callBackPlayer);

		$videoList.on("click", "a", _reWriteVideos);

	};

	_callBackPlayer = function(evt){

		var a = $controls.find("a"),
			t = $(this),
			type = t.attr("id");

		a.removeClass("opacity");

		t.addClass("opacity");

		switch(type){

			case 'play':

				$ytPlayer.playVideo();

			break;

			case 'pause':

				$ytPlayer.pauseVideo();

			break;

			case 'mute':

				$ytPlayer.mute();

			break;

			case 'unmute':

				$ytPlayer.unMute();

			break;

		}

		evt.preventDefault();

	};

	_handleThumbs = function(){

		var img,
			$this,
			btn_video = $("#article .btn_video").eq(0); // si tratta del link del box di sx

		//ottengo le thumb piccole
		$videoList.find("a").each(function(){

			img = $("<img>");

			$this = $(this);

			img.attr({"src": CONFIGURATION.imgSrc + $this.attr("href").split("v=")[1] + "/2.jpg"});

			$this.html(img);

		});

		//ottengo la thumb grande
		btn_video.each(function(){

			img = $("<img>");

			$this = $(this);

			img.attr({"src": CONFIGURATION.imgSrc + $this.attr("href").split("v=")[1] + "/0.jpg"});

		});

	};

	_getVideoID = function(){

		var videoID = $(".btn_video").attr("href").split("v=")[1];

		return videoID;

	};

	_updateVideo = function(idVideo){

		$ytPlayer.cueVideoById(idVideo);//aggiorno l id del video da passare al lettore creato in events.js

		$ytPlayer.playVideo();

	}

	_reWriteVideos = function(evt){

		var url = $(this).attr("href").split("v=")[1];

		$controls.find("a").removeClass("opacity");

		$controls.find("#play").addClass("opacity");

		_updateVideo( url );// questo parametro imposta l id del video e lo aggiorna

		evt.preventDefault();

	};

	/*
	* PLAYER CALLBACKS
	*
	*/
	_updateTime = function(){

		var secondsToTime = function(secs){

			var minVar = Math.floor(secs.toFixed()/60).toFixed();  // The minutes

			var secVar = (secs.toFixed() % 60).toFixed();

			if (minVar < 0) {minVar = 0;}

			if (secVar < 0) {secVar = 0;}

			if (minVar < 10) {minVar = '0'+minVar;}

			if (secVar < 10) {secVar = '0'+secVar;}

			return minVar+':'+secVar;
		}

		$time.html(secondsToTime($ytPlayer.getCurrentTime())+'<span> // </span>'+secondsToTime($ytPlayer.getDuration()));//questa funzione scrive sia il minutaggio corrente sia la durata totale

	}

	_updateProgbar = function(){

		if( $ytPlayer.getCurrentTime() > 0 ){

			var videoPosition = ($ytPlayer.getCurrentTime() / $ytPlayer.getDuration()) * 100;

			$progressBar.find("a").css({left:videoPosition + '%'});

		}

	}

	_managePlayer = function(playerId){

		$ytPlayer = document.getElementById(CONFIGURATION.playerID);

		//Load an initial video into the player
		//$ytPlayer.cueVideoById(CONFIGURATION.firstVideo);
		$ytPlayer.cueVideoById( _getVideoID() );

		setInterval(_updateTime, 1000);//aggiorna il contatore del minutaggio

		setInterval(_updateProgbar, 500);//fa avanzare la progress bar

	};

	_loadPlayer = function(){

		// Lets Flash from another domain call JavaScript
		var params = {
			allowScriptAccess: "always"
		};

		// The element id of the Flash embed
		var atts = {
			id: CONFIGURATION.playerID
		};

		// All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
		swfobject.embedSWF("http://www.youtube.com/apiplayer?"+"&enablejsapi=1&playerapiid="+CONFIGURATION.playerID+"&modestbranding=1","videoDiv", "377", "284", "8", null, null, params, atts);

	};

	/*
	* INIT
	*
	*/


	_init = function(){

		_gatherElments();

		_hadleEventListeners();

		_handleThumbs();

		$volumeSlider.slider({
			value: 75, //applico un valore fittizio
			min: 0,
			max: 100,
			slide: function(e){
				var volume = e.pageX - $(this).offset().left;//calcolo la posizione di partenza dello slider, poi la sottraggo al valore massimo dello slider in modo da limitare il range tra 0 e 100
				$ytPlayer.setVolume(volume);
			}
		});

		$progressBar.slider({
			slide: function(e){
				var skipTo = e.pageX - $(this).offset().left,//calcolo la posizione a cui e lo slider
					statusWidth = $(this).width(),//la dimensione della progress bar
					seekPosition = (skipTo / statusWidth),
					seekToPosition = Math.round($ytPlayer.getDuration() * seekPosition);

				$ytPlayer.seekTo(seekToPosition, false);
			}
		});

		_loadPlayer();

	};

	managePlayer = _managePlayer;

	init = _init;

	//PUBLIC
	return {

		managePlayer: managePlayer,

		init: init

	}

}());

function onYouTubePlayerReady(playerId) {

	MYAPP.YouTubePlayer.managePlayer(playerId);

}
