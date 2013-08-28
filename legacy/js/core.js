var curvid = 0;
var curel;
var clipdata = new Array();
var clipstarts = new Object();
var clipends = new Object();
var cliplinks = new Object();
var cliplengths = new Object();
var connsloaded = false;
var loadivl = new Number();
var _rtmpserver = 'rtmp://s17pilyt3yyjgf.cloudfront.net/cfx/st';
var _increment = 5;
var _defaultlength = 21;
var _scrubwidth = 0;
var _scrubheight = 0;


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
		$('html, body').animate({ scrollTop: ($('.yellow_b').offset().top - 20) }, 1000);
	});

	// clickability for the initial 4

	$(".videospace").click(function () {
		curvid = parseInt($(this).attr('data-clip'));
		actualclip = $(this).attr('data-clipname');
		$('.scrubber').css({'display': 'block'});
		scrubresize();	
		var vh = ((($("#container").width() - 40) / 16) * 9);
		var vtop = (($("#container").height() - vh) / 2);
		$(this).animate({ 'z-index': 5, 'width': ($("#container").width() - 80) + 'px', 'top': vtop, 'left': 40, 'height': (($("#container").width() - 80) / 16) * 9 + 'px' }).fadeOut(4000);
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

			var scwidth = $("#container").width() - 40;
			var vh = ((($("#container").width() - 40) / 16) * 9);
			var vtop = (($("#container").height() - vh) / 2);
			var width = $("#containerinner").width();
			var scheight = Math.floor((vtop + (vh * .9)) - (vtop + (vh * .2)));


			for(var x = 0; x < clipdata.length; x++){
				var cl = Math.floor(cliplengths[parseInt(clipdata[x].clip)]);
				if(clipdata[x].clip == "0"){
					clipstart_a[timetosecs(clipdata[x].start)] = clipdata[x].state;
				}
				if(clipdata[x].clip == "1"){
					clipstart_b[timetosecs(clipdata[x].start)] = clipdata[x].state;
				}
				if(clipdata[x].clip == "2"){
					clipstart_c[timetosecs(clipdata[x].start)] = clipdata[x].state;
				}
				if(clipdata[x].clip == "3"){
					clipstart_d[timetosecs(clipdata[x].start)] = clipdata[x].state;
				}
				if(clipdata[x].clip == "0"){
					clipend_a[timetosecs(clipdata[x].end)] = clipdata[x].state;
				}
				if(clipdata[x].clip == "1"){
					clipend_b[timetosecs(clipdata[x].end)] = clipdata[x].state;
				}
				if(clipdata[x].clip == "2"){
					clipend_c[timetosecs(clipdata[x].end)] = clipdata[x].state;
				}
				if(clipdata[x].clip == "3"){
					clipend_d[timetosecs(clipdata[x].end)] = clipdata[x].state;
				}
				if(timetosecs(clipdata[x].end) < cl){
					var vert = false;
					var odd = false;
					var scr = ($("#scr_" + clipdata[x].clip));
					
					

					// only do things within the clips we have
					
					var pxmultiplier = (scwidth - 10) / cl;
										
					if(scr.hasClass("vertical")){
						vert = true;
						pxmultiplier = scheight / cl;
					}
					
					
					if(scr.hasClass("odd")){
						odd = true;
					}
					var clipstr = '<div class="hotpoint pt_' + clipdata[x].state + '" id="pt' + clipdata[x].clip + '_' + timetosecs(clipdata[x].start) + '" data-clip="' + clipdata[x].clip + '" data-start="' + timetosecs(clipdata[x].start) + '" style="display: none; ';
					var le = cl / (timetosecs(clipdata[x].start + _increment) - timetosecs(clipdata[x].start));

					if(vert){
						if(odd){
							clipstr += 'height: ' + _defaultlength + 'px; margin-top: ' + round_up((scheight - Math.ceil(pxmultiplier * timetosecs(clipdata[x].start))),7) + ' px';
						} else {
							clipstr += 'height: ' + _defaultlength + 'px; margin-top: ' + round_up(Math.ceil(pxmultiplier * timetosecs(clipdata[x].start)),7) + ' px';						
						}
					} else {
						if(odd){
							clipstr += 'width: ' + _defaultlength + 'px; margin-left: ' + round_up((scwidth - (Math.ceil(pxmultiplier * timetosecs(clipdata[x].end)))),7) + ' px';
						} else {
							clipstr += 'width: ' + _defaultlength + 'px; margin-left: ' + round_up(Math.ceil(pxmultiplier * timetosecs(clipdata[x].start)),7) + ' px';
						}
					}
					clipstr += '"></div>';
					$(clipstr).appendTo(scr);
					
				}
			}
			

			$(".hotpoint").fadeIn();
			clipstarts[0] = clipstart_a;
			clipstarts[1] = clipstart_b;
			clipstarts[2] = clipstart_c;
			clipstarts[3] = clipstart_d;
			clipends[0] = clipend_a;
			clipends[1] = clipend_b;
			clipends[2] = clipend_c;
			clipends[3] = clipend_d;
			$(".hotpoint").click(function () {
				if($(this).hasClass('hotpoint_on')){
					console.log($(this).offset());
					dumphistory(curvid, $(this).attr('data-start'));
					loadvid($(this).attr('data-clip'),$(this).attr('data-start'));
					$(".hotpoint_on").removeClass('hotpoint_on');
				}
			});
		}
	},500);

});


function dumphistory(vidtarget,startpoint){
		
}


function drawvideo (videoclip) {
	var vh = ((($("#container").width() - 80) / 16) * 9);
	var vtop = (($("#container").height() - vh) / 2) - 50;
	var w = ($("#container").width() - 80);
	var h = (($("#container").width() - 80) / 16) * 9;
	$("#videoplayer").css({ 'z-index': 5, 'width': w + 'px', 'padding-top': vtop, 'padding-left': 40, 'height': h + 'px' });
	var coveoptions = {  };
	coveoptions.endscreen = false;
	coveoptions.allowFullScreen = false;
	coveoptions.allowscriptaccess = true;
	coveoptions.autostart = true;
	coveoptions.height = h;
	coveoptions.width = w;
	coveoptions.controlbar = 'none';
	coveoptions.streamer = _rtmpserver;
	coveoptions.file = videoclip + '.mp4';
	coveoptions.skin = 'art/bekle.zip';
	swfobject.embedSWF('art/player.swf',"vidin",w,h,"9.0.115", 'art/expressInstall.swf', coveoptions, { 'wmode':'opaque', 'scale':'noscale', 'salign':'tl', 'menu':false, 'allowFullScreen':false, 'allowScriptAccess':'always' }, { id:'vidin',name:'vidin', bgcolor:'#000000' });
	subthis = this;
	jwplayer("vidin").onTime(function (timobj) {
		subthis.progressrun(timobj.position);
	});
	jwplayer("vidin").onComplete(function () {
		subthis._ended();
	});	
}

function loadvid (clip,starttime) {
	curvid = clip;
	videoclipname = $("#vid_" + clip).attr('data-clipname');
	jwplayer('vidin').load({ 'streamer': _rtmpserver, 'file': videoclipname + '.mp4', 'start': starttime, 'autostart': true });
}



function progress_start (vi) {
//	curel = document.getElementById(vi);
//	curel.addEventListener('timeupdate', progressrun);
}

function scrubresize (){
	var vh = ((($("#container").width() - 40) / 16) * 9);
	var vtop = Math.floor((($("#containerinner").height() - vh) / 2) - 50);
	var width = round_up(($("#containerinner").width() - 60),7);
	var sideheight = round_up((vtop + (vh * .50)),7);
	_scrubwidth = width;
	_scrubheight = sideheight;
	var starttop = Math.floor((vtop + (vh * .15)));
	$("#scr_0").css({ 'width': width + 'px', 'top': Math.floor(vtop + (vh * .15)) });
	$("#scr_2").css({ 'width': width + 'px', 'top': round_up(Math.floor(vtop + (vh * .15) + sideheight),7) - 5 });
	$("#scr_1").css({ 'top': (starttop + 7) + 'px', 'left': _scrubwidth + 13, 'height' : sideheight + 'px' });
	$("#scr_3").css({ 'top': (starttop + 7) + 'px', 'height' : sideheight + 'px' });
	$("#legplay").css({ "margin-left": ($(window).width() / 2) - 70 });
	$("#legmore").css({ "margin-left": ($(window).width() / 2) - 70 });

}


function progressrun (inf) {
// update the scrubber
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
	if(clipstarts[curvid][thistime]){
		$(".pt_" + clipstarts[curvid][thistime]).addClass('hotpoint_on');
	}
	if(clipends[curvid][thistime]){
		$(".hotpoint_on").removeClass('hotpoint_on');
	}
}

function timetosecs (instring) {
	var secs = new Number();
	var bits = instring.split(':');
	secs = parseInt(bits[0]) * 60;
	secs += parseInt(bits[1]);
	return secs;
}

round_up = function(x,factor){ return x - (x%factor) + (x%factor>0 && factor);}