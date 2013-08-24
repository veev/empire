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

	$("#legmore").css({ "margin-left": ($(window).width() / 2) - 70 }).fadeIn(4000).click(function () {
		$('html, body').animate({ scrollTop: ($('.yellow_b').offset().top - 20) }, 1000);
	});

	// clickability for the initial 4

	$(".videospace").click(function () {
		curvid = parseInt($(this).attr('data-clip'));
		actualclip = parseInt($(this).attr('data-clipname'));
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
		progress_start();
	});
	
	// format the scrubbers
	
	$(".scrubber_inner").each(function () {
		if($(this).attr('data-vertical') == "1"){
			$(this).css({ 'width':'100%' });
		} else {
			$(this).css({ 'height':'100%' });
		}
	});
	
	
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
					
					var pxmultiplier = Math.floor((scr.width() - 10) / cl);
					if(scr.hasClass("vertical")){
						vert = true;
						pxmultiplier = Math.floor(scr.height() / cl);
					}
					if(scr.hasClass("odd")){
						odd = true;
					}
					var clipstr = '<div class="hotpoint pt_' + clipdata[x].state + '" id="pt' + clipdata[x].clip + '_' + timetosecs(clipdata[x].start) + '" data-clip="' + clipdata[x].clip + '" data-start="' + timetosecs(clipdata[x].start) + '" style="display: none; ';
					var le = cl / (timetosecs(clipdata[x].end) - timetosecs(clipdata[x].start));

					if(vert){
						if(odd){
							le = 1 - le;
							clipstr += 'height: ' + Math.floor(pxmultiplier * le) + 'px; margin-bottom: ' + Math.ceil(pxmultiplier * timetosecs(clipdata[x].start)) + ' px';
						} else {
							clipstr += 'height: ' + Math.floor(pxmultiplier * le) + 'px; margin-top: ' + Math.ceil(pxmultiplier * timetosecs(clipdata[x].start)) + ' px';						
						}
					} else {
						if(odd){
							le = 1 - le;
							clipstr += 'width: ' + Math.floor(pxmultiplier * le) + 'px; margin-left: ' + (Math.ceil(pxmultiplier * timetosecs(clipdata[x].end)) - Math.ceil(pxmultiplier * timetosecs(clipdata[x].start))) + ' px';
						} else {
							clipstr += 'width: ' + Math.floor(pxmultiplier * le) + 'px; margin-left: ' + Math.ceil(pxmultiplier * timetosecs(clipdata[x].start)) + ' px';
						}
					}
					clipstr += '"></div>';
					$(clipstr).appendTo(scr);
					
				}
			}
			
			$(".main:first").fadeIn();


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
					loadvid($(this).attr('data-clip'),$(this).attr('data-start'));
				}
			});
		}
	},500);

});


function drawvideo (videoclip) {
		var coveoptions = { 'controlbar.position': 'over', 'controlbar.idlehide': true };
		coveoptions.endscreen = false;
		coveoptions.allowFullScreen = true;
		coveoptions.allowscriptaccess = true;
		coveoptions.autostart = true;
		coveoptions.height = this.h;
		coveoptions.embed = true;
		coveoptions.player = 'npaplayer';
		coveoptions.width = this.w;
		coveoptions.streamer = _rtmpserver;
		coveoptions.file = this.videoclip;
		coveoptions.skin = 'art/bekle.zip';
		swfobject.embedSWF('art/jwplayer.swf',this.coveinstance,this.w,this.h,"9.0.115", 'art/expressInstall.swf', coveoptions, { 'wmode':'opaque', 'scale':'noscale', 'salign':'tl', 'menu':false, 'allowFullScreen':true, 'allowScriptAccess':'always' }, { id:'legacyplay',name:'legacyplay', bgcolor:'#000000' });
		
}

function loadvid (clip,start){
	$(".hotpoint_on").removeClass('hotpoint_on');
	document.getElementById('video'+curvid).pause();
	document.getElementById('video'+curvid).removeEventListener('timeupdate',progressrun);
	$("#vid_" + curvid).css({ 'z-index': 3,  'display':'none' });
	var topbits = $("#container").height() * .1;
	$("#videoplayer").css({ 'display':'block', 'z-index': 5, 'width': ($("#container").width() - 20) + 'px', 'top': (($("#container").height() - ((($("#container").width() - 20) / 16) * 9)) / 2), 'left':10, 'height': (($("#container").width() - 20) / 16) * 9 + 'px' });
	curvid = clip;
	document.getElementById('video'+curvid).currentTime = start;
	document.getElementById('video'+curvid).play();
	progress_start('video' + curvid);
}


function progress_start (vi) {
	curel = document.getElementById(vi);
	curel.addEventListener('timeupdate', progressrun);
}

function scrubresize (){
	var vh = ((($("#container").width() - 40) / 16) * 9);
	var vtop = (($("#container").height() - vh) / 2);
	var width = $(".main:first").width();
	$("#scr_0").css({ 'width': width + 'px', 'top': (vtop + (vh * .15)) });
	$("#scr_2").css({ 'width': width + 'px', 'top': (vtop + (vh * .86))  });
	var sideheight = (vtop + (vh * .9)) - (vtop + (vh * .2));
	var starttop = (vtop + (vh * .16));
	$("#scr_1").css({ 'top': starttop + 'px', 'height' : sideheight + 'px' });
	$("#scr_3").css({ 'top': starttop + 'px', 'height' : sideheight + 'px' });
	$("#legplay").css({ "margin-left": ($(window).width() / 2) - 70 });
	$("#legmore").css({ "margin-left": ($(window).width() / 2) - 70 });

}


function progressrun () {
// update the scrubber
	var prg = (curel.currentTime / curel.duration) * 100;
	if($("#scr_" + curvid + "_play").attr('data-vertical') == 1){
		if($("#scr_" + curvid + "_play").attr('data-reverse') == 1){
			$("#scr_" + curvid + "_play").css({ 'height': prg + '%', 'margin-top': (100 - prg) + '%' });			
		} else {
			$("#scr_" + curvid + "_play").css({ 'height': prg + '%' });
		}
	} else {
		if($("#scr_" + curvid + "_play").attr('data-reverse') == 1){
			$("#scr_" + curvid + "_play").css({ 'width': prg + '%', 'margin-left': (100 - prg) + '%' });
		} else {
			$("#scr_" + curvid + "_play").css({ 'width': prg + '%' });
		}
	}
	var thistime = Math.floor(curel.currentTime);
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