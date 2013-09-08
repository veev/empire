var curvid = 0;
var curel;
var clipdata = new Array();
var clipstarts = new Object();
var clipends = new Object();
var cliplinks = new Object();
var cliplengths = new Object();
var clipstartoffset = new Object();
var connsloaded = false;
var loadivl = new Number();
var _rtmpserver = 'rtmp://s17pilyt3yyjgf.cloudfront.net/cfx/st';
var _increment = 5;
var _defaultlength = 21;
var _scrubwidth = 0;
var _scrubheight = 0;
var _highlight_curvid = 0;
var _highlight_curpt = 0;
var _highlight_currentx = 0;
var paper;
var _cliprect = new String();
var _clipstate = new Object();
var _videoon = false;
var _svglevel = false;
var _fson = false;
var preventdoublejumpIvl = new Number();
var preventdoublejump = false;
var _curplayback = 0;

$(window).resize(function () {
	scrubresize();
});

$(document).ready(function () {

	var matop = ($(".yellow:first").height() / 2) - 400;
	if(matop < 70){
		matop = 70;
	}

	$("#mainarea").css({ "margin-top": matop });
	$("#legplay").css({ "margin-left": ($(window).width() / 2) - 70 }).fadeIn(4000).click(function () {
		$('html, body').animate({ scrollTop: ($('#container').offset().top - 20) }, 1000);
	});

	$("#legmore").css({ "margin-left": ($(window).width() / 2) - 70 }).fadeTo(4000,.5).click(function () {
		if(_fson){
			fullscreen_off();
		}
		$('.yellow_b').show();
		$('html, body').animate({ scrollTop: ($('.yellow_b').offset().top - 20) }, 1000);
	});

	// clickability for the initial 4

	$(".videospace").click(function () {
		curvid = parseInt($(this).attr('data-clip'));
		actualclip = $(this).attr('data-clipname');
		$('.scrubber').css({'display': 'block'});
		scrubresize();	
		var vh = ($("#container").width() - 80) * .31;
		var vtop = (($("#container").height() - vh) / 2) - 50;
		$(this).animate({ 'z-index': 5, 'width': ($("#container").width() - 80) + 'px', 'top': vtop, 'left': 40, 'height': 330 }).fadeOut(4000);
		$(".videospace").hide().unbind('click');
		$(this).show();
		$(".blurb").remove();
		$(".blurbback").remove();
		drawvideo(actualclip);
	});
	
	// format the scrubbers
	
	$(".scrubber_inner").each(function () {
		if($(this).attr('data-vertical') == "1"){
			$(this).css({ 'width':'100%' });
		} else {
			$(this).css({ 'height':'100%' });
		}
	});
	
	$("#containerinner").fadeIn();
	
	
	// get the lengths of the clips as they arrive
	
	cliplengths[0] = 605;
	cliplengths[1] = 669;
	cliplengths[2] = 755;
	cliplengths[3] = 564;
	

	// load the connections json
	
	$.ajax({
		dataType: "json",
		url: "connections.json",
		success: function (data) {
			connsloaded = true;
			clipdata = data;
		}});

	// create a raphael object on the div I made for lines

	paper = Raphael(document.getElementById("blurredlines"), $("#blurredlines").width(), $("#blurredlines").height());
	

	// once stuff has arrived render the spaces
	
	loadivl = setInterval(function () {
		if(connsloaded){
			clearInterval(loadivl);
			
			// now that we have our data we can do our thing
			var clipstart_a = new Object();
			var clipstart_b = new Object();
			var clipstart_c = new Object();
			var clipstart_d = new Object();
			var clipend_a = new Object();
			var clipend_b = new Object();
			var clipend_c = new Object();
			var clipend_d = new Object();

			var h = ($("#container").width() - 120) * .31
			var scwidth = round_up(($("#containerinner").width() - 60),7);
			var scheight = round_up((h + 120),7);


			// handle the data - plot all the points

			for(var x = 0; x < clipdata.length; x++){
				clipdata[x].fired = false;
				clipdata[x].headsup = false;
				clipdata[x].clicked = false;
				var cl = Math.floor(cliplengths[parseInt(clipdata[x].clip)]);
				if(clipdata[x].clip == "0"){
					clipstart_a[timetosecs(clipdata[x].start)] = x;
				}
				if(clipdata[x].clip == "1"){
					clipstart_b[timetosecs(clipdata[x].start)] = x;
				}
				if(clipdata[x].clip == "2"){
					clipstart_c[timetosecs(clipdata[x].start)] = x;
				}
				if(clipdata[x].clip == "3"){
					clipstart_d[timetosecs(clipdata[x].start)] = x;
				}
				if(clipdata[x].clip == "0"){
					clipend_a[timetosecs(clipdata[x].end)] = x;
				}
				if(clipdata[x].clip == "1"){
					clipend_b[timetosecs(clipdata[x].end)] = x;
				}
				if(clipdata[x].clip == "2"){
					clipend_c[timetosecs(clipdata[x].end)] = x;
				}
				if(clipdata[x].clip == "3"){
					clipend_d[timetosecs(clipdata[x].end)] = x;
				}
				if(timetosecs(clipdata[x].end) < cl){
					var vert = false;
					var odd = false;
					var scr = ($("#scr_" + clipdata[x].clip));
					
					var pxmultiplier = (scwidth - 10) / cl;
										
					if(scr.hasClass("vertical")){
						vert = true;
						pxmultiplier = scheight / cl;
					}
					
					
					// draw the points
					
					if(scr.hasClass("odd")){
						odd = true;
					}
					var clipstr = '<div class="hotpoint pt_' + clipdata[x].state + ' g' + clipdata[x].state + clipdata[x].substate + '" data-row="' + x + '" id="pt' + clipdata[x].clip + '_' + timetosecs(clipdata[x].start) + '" data-clip="' + clipdata[x].clip + '" data-start="' + timetosecs(clipdata[x].start) + '" style="display: none; ';
					var le = cl / (timetosecs(clipdata[x].end) - timetosecs(clipdata[x].start));

					if(vert){
						if(odd){
							clipstr += 'height: ' + _defaultlength + 'px; margin-top: ' + (round_up((scheight - Math.ceil(pxmultiplier * timetosecs(clipdata[x].start))),7) - _defaultlength) + 'px';
						} else {
							clipstr += 'height: ' + _defaultlength + 'px; margin-top: ' + round_up(Math.ceil(pxmultiplier * timetosecs(clipdata[x].start)),7) + 'px';						
						}
					} else {
						if(odd){
							clipstr += 'width: ' + _defaultlength + 'px; margin-left: ' + round_up((scwidth - (Math.ceil(pxmultiplier * timetosecs(clipdata[x].end)))),7) + 'px';
						} else {
							clipstr += 'width: ' + _defaultlength + 'px; margin-left: ' + round_up(Math.ceil(pxmultiplier * timetosecs(clipdata[x].start)),7) + 'px';
						}
					}
					clipstr += '"></div>';
					$(clipstr).appendTo(scr);
					
				}
			}

			clipstarts[0] = clipstart_a;
			clipstarts[1] = clipstart_b;
			clipstarts[2] = clipstart_c;
			clipstarts[3] = clipstart_d;
			clipends[0] = clipend_a;
			clipends[1] = clipend_b;
			clipends[2] = clipend_c;
			clipends[3] = clipend_d;
			
	//		render_lines(0);

			
			$(".hotpoint").click(function () {
			
				// the core clicking bits
			
				if($(this).hasClass('hotpoint_on')){
				
										
					var timeleft = timetosecs(clipdata[_highlight_currentx].segend) - _curplayback;
				
					var subthis = this;
					debugmsg('delay of ' + timeleft + 's before execution');
				
					var thistop = $(this).offset().top;
					var thisleft = $(this).offset().left;
				
					setTimeout(function () {
				
						$("#scr_" + _highlight_curvid).find('.hotpoint').show();
				
						linedo($("#pt" + _highlight_curvid + "_" + _highlight_curpt).offset(), thistop, thisleft, _highlight_curvid, _highlight_curpt);

						dumphistory(_highlight_curvid, _highlight_curpt);

						loadvid($(subthis).attr('data-clip'),$(subthis).attr('data-start'));
						clipstartoffset[curvid] = parseInt($(subthis).attr('data-start'));

						// remove hotpoints
						$(".hotpoint_on").removeClass('hotpoint_on').hide();

						// disable new hotpoints for ten seconds
						preventdoublejump = true;
					
						preventdoublejumpIvl = setTimeout(function () {
							preventdoublejump = false;
						},(_increment * 2000));

					}, (timeleft * 1000));

				}
			});
		}
	},500);
	
	// let's capture the spacebar since someone's worried about that
	
	$(document).keydown(function (e) {
    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (key == 32)
       e.preventDefault();
    	if(_videoon){
    		jwplayer("vidin").pause();
    	}
 	});
 
 
 	$("#lg_fs").click(function () {
		var docElm = document.getElementById("container");
		if (docElm.requestFullscreen) {
			docElm.requestFullscreen();
		}
		else if (docElm.mozRequestFullScreen) {
			docElm.mozRequestFullScreen();
		}
		else if (docElm.webkitRequestFullScreen) {
			docElm.webkitRequestFullScreen();
		}
		_fson = true;
 	});
 

});

function fullscreen_off() {
	if (document.cancelFullScreen) {
		document.cancelFullScreen();
	}
	else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	}
	else if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen();
	}
	_fson = false;
}

function debugmsg (text) {
	$("#debugmsg").html(text);
	$("#debugmsg").fadeIn();
	setTimeout(function () {
		$("#debugmsg").fadeOut('slow');
	}, 5000);
}

function render_lines (mode){
	for(var y = 0; y < clipdata.length; y++){
//		console.log(clipdata[y]);
	}
}

function linedo (frompt, thisvidtop, thisvidleft, thisvid, thispt){

	// draw lines between the start and end
	
	var offsetter = $("#blurredlines").offset().top - 11;
	
	var froms = frompt.top;
	
	var sideoffset = 11;
	
	var drawstring = "M" + (frompt.left - sideoffset) + ',' + (froms - offsetter) + ' L' + (thisvidleft - 11) + ',' + (thisvidtop - offsetter);

	var newpath = paper.path( drawstring );
	newpath.attr({ 'stroke' : '#fbb03b', 'stroke-width' : 1 });

	svgreset();
	
}

function dumphistory(vidtarget,startpoint){
	// routine that kills off the rest of the scrubber line when the user clicks something
	
	// first remove hotpoints that are later than this point
	$("#scr_"+vidtarget).find(".hotpoint").each(function () { if(parseInt($(this).attr('data-start')) > startpoint){ $(this).remove() }});
	
	
	// rescale the scrubbers
	
	switch(vidtarget){
		case 0:
			$("#scr_0").css({ 'width': $("#scr_0_play").width() + 11 });
			$("#scr_0_play").css({ 'width': $("#scr_0").width() });
			break;
		case 1:
			$("#scr_1").css({ 'height': $("#scr_1_play").height() });
			break;
		case 2:
			$("#scr_2").css({ 'width': $("#scr_2_play").width(), 'margin-left': $("#scr_2_play").css("margin-left") });
			$("#scr_2_play").css({ "margin-left": 0 });
			break;
		case 3:
			$("#scr_3").css({ 'height': $("#scr_3_play").height(), 'margin-top': $("#scr_3_play").css("margin-top") });
			$("#scr_3_play").css({ "margin-top": 0 });
			break;
	}		
}


function drawvideo (videoclip) {

	// initial video draw, triggered by users clicking on one of the large images

	var vh = ($("#container").width() - 120) * .31;
	var vtop = (($("#container").height() - vh) / 2) - 50;
	var w = ($("#container").width() - 120);
	var h = ($("#container").width() - 120) * .31
	$("#videoplayer").css({ 'width': w + 'px', 'padding-top': vtop, 'padding-left': 60, 'height': h + 'px' });
	var playeroptions = {  };
	playeroptions.allowFullScreen = false;
	playeroptions.allowscriptaccess = true;
	playeroptions.autostart = true;
	playeroptions.height = h;
	playeroptions.width = w;
	playeroptions.controlbar = 'none';
	playeroptions.streamer = _rtmpserver;
	playeroptions.file = 'legacy/' + videoclip + '_crop.mp4';
	playeroptions.skin = 'art/bekle.zip';
	swfobject.embedSWF('art/player.swf',"vidin",w,h,"9.0.115", 'art/expressInstall.swf', playeroptions, { 'wmode':'direct', 'scale':'noscale', 'salign':'tl', 'menu':false, 'allowFullScreen':false, 'allowScriptAccess':'always' }, { id:'vidin',name:'vidin', bgcolor:'#000000' });
	subthis = this;
	jwplayer("vidin").onTime(function (timobj) {
		subthis.progressrun(timobj.position);
	});
	jwplayer("vidin").onComplete(function () {
		subthis._ended();
	});	

	_videoon = true;
	
	_cliprect = '40 ' + (vtop + (h * .22)) + ' ' + w + ' ' + (h * .5);
	

}

function _ended () {
	$("#vidin").hide();
	$("#blurredlines").hide()
	$("#blurredlines_all").fadeIn();
}

function loadvid (clip,starttime) {

	// set the video player to move to another moment

	curvid = clip;
	videoclipname = $("#vid_" + clip).attr('data-clipname');
	jwplayer('vidin').load({ 'streamer': _rtmpserver, 'file': 'legacy/' + videoclipname + '_crop.mp4', 'start': starttime, 'autostart': true });
}


function scrubresize (){

	// move the scrubbers around
	
	var vh = ($("#container").width() - 120) * .31;
	var vtop = (($("#container").height() - vh) / 2) - 50;
	var w = ($("#container").width() - 120);
	var h = ($("#container").width() - 120) * .31
	var width = round_up(($("#containerinner").width() - 120),7);
	var sideheight = round_up((h + 120),7);
	_scrubwidth = width;
	_scrubheight = sideheight;
	var starttop = vtop - 80;
	$("#scr_0").css({ 'width': (width + 60) + 'px', 'top': starttop });
	$("#scr_2").css({ 'width': (width + 60) + 'px', 'top': round_up((starttop + sideheight),7) - 5 });
	$("#scr_1").css({ 'top': (starttop + 10) + 'px', 'left': _scrubwidth + 65, 'height' : sideheight + 'px' });
	$("#scr_3").css({ 'top': (starttop + 10) + 'px', 'height' : sideheight + 'px' });
	$("#legplay").css({ "margin-left": ($(window).width() / 2) - 70 });
	$("#legmore").css({ "margin-left": ($(window).width() / 2) - 70 });
	
	if(_videoon){
		// resize the video object because why the hell not
		var vh = ($("#container").width() - 120) * .31;
		var vtop = (($("#container").height() - vh) / 2) - 50;
		var w = ($("#container").width() - 120);
		var h = ($("#container").width() - 120) * .31
		$("#videoplayer").css({ 'width': w + 'px', 'padding-top': vtop, 'padding-left': 60, 'height': h + 'px' });
		$("#vidin").css({ 'width': w + 'px', 'height': h + 'px' });
	
	}

}


function progressrun (inf) {

	// update the scrubbers during playback, also deal with the highlighting
	
	_curplayback = inf;
	
	var prg = (inf / cliplengths[curvid]) * 100;
	if($("#scr_" + curvid + "_play").attr('data-vertical') == 1){
		var h = round_up((prg * (_scrubheight / 100)),7);
		if($("#scr_" + curvid + "_play").attr('data-reverse') == 1){
			$("#scr_" + curvid + "_play").css({ 'height': h + 'px', 'margin-top': (_scrubheight - h) + 'px' });			
		} else {
			$("#scr_" + curvid + "_play").css({ 'height': h + 'px' });
		}
	} else {
		var w = round_up((prg * (_scrubwidth / 100)),7);
		if($("#scr_" + curvid + "_play").attr('data-reverse') == 1){
			$("#scr_" + curvid + "_play").css({ 'width': w + 'px', 'margin-left': (_scrubwidth - w) + 'px' });
		} else {
			$("#scr_" + curvid + "_play").css({ 'width': w + 'px' });
		}
	}
	var thistime = Math.floor(inf);
	
	// now look for times to light up other options
	
	if(clipstarts[curvid][(thistime + 30)] && !clipdata[clipstarts[curvid][(thistime + 30)]].headsup){
		clipdata[clipstarts[curvid][(thistime + 30)]].headsup = true;
		debugmsg('30s heads up');
	}
	
	if(clipstarts[curvid][thistime] && !clipdata[clipstarts[curvid][thistime]].fired && !preventdoublejump){
	
		// we have a point! light stuff up

		_highlight_curvid = curvid;
		_highlight_curpt = thistime;
		_highlight_currentx = clipstarts[curvid][thistime];
		
		clipdata[clipstarts[curvid][thistime]].fired = true;
		
		console.log('firing ' + clipstarts[curvid][thistime]);
		
		// traverse the 4 to only light up points on the other clips, not the current one
		for(var x = 0; x < 4; x++){
			if(x != curvid){
		 		$("#scr_" + x).find(".g" + clipdata[clipstarts[curvid][thistime]].state + clipdata[clipstarts[curvid][thistime]].substate).addClass('hotpoint_on').show();
			}
		}
	}
	if(clipends[curvid][thistime] == _highlight_currentx){
	
		// the hot time is over
	
		console.log('unfiring ' + clipends[curvid][thistime]);
		
	
		$(".hotpoint_on").removeClass('hotpoint_on').hide();
		
		_highlight_currentx = 0;
		
	}
}

function svgreset () {

	// reset the svg layer raphael is using
	
	if(!_svglevel){
		$("svg:first").css({ "z-index":3 });	
		_svglevel = true;
	}
}


function timetosecs (instring) {
	
	// helper routine to let them do MM:SS in the data and make it work for me in seconds

	var secs = new Number();
	var bits = instring.split(':');
	secs = parseInt(bits[0]) * 60;
	secs += parseInt(bits[1]);
	return secs;
}

function round_up (x,factor){ 
	
	// helper routine to round numbers to the nearest 7 - because of the offsets in the scrubbers
	
	return x - (x%factor) + (x%factor>0 && factor);
}