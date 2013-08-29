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
var paper;
var _cliprect = new String();
var preventdoublejumpIvl = new Number();
var preventdoublejump = false;

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

	// create a raphael object on the div I made for lines

	paper = Raphael(document.getElementById("blurredlines"), $("#blurredlines").width(), $("#blurredlines").height());
	paper_all = Raphael(document.getElementById("blurredlines_all"), $("#blurredlines").width(), $("#blurredlines").height());
	

	// hide the full version of the drawn lines
	
	$("#blurredlines_all").hide();
	
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
			var width = round_up(($("#containerinner").width() - 60),7);
			var scheight = round_up((vtop + (vh * .50)),7);


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
					
					var pxmultiplier = (scwidth - 10) / cl;
										
					if(scr.hasClass("vertical")){
						vert = true;
						pxmultiplier = scheight / cl;
					}
					
					
					// draw the points
					
					if(scr.hasClass("odd")){
						odd = true;
					}
					var clipstr = '<div class="hotpoint pt_' + clipdata[x].state + '" id="pt' + clipdata[x].clip + '_' + timetosecs(clipdata[x].start) + '" data-clip="' + clipdata[x].clip + '" data-start="' + timetosecs(clipdata[x].start) + '" style="display: none; ';
					var le = cl / (timetosecs(clipdata[x].start + _increment) - timetosecs(clipdata[x].start));

					if(vert){
						if(odd){
							clipstr += 'height: ' + _defaultlength + 'px; margin-top: ' + (round_up((scheight - Math.ceil(pxmultiplier * timetosecs(clipdata[x].start))),7) - _defaultlength) + ' px';
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
			
				// the core clicking bits
			
				if($(this).hasClass('hotpoint_on')){
				
				
					$("#scr_" + _highlight_curvid).find('.hotpoint').show();
				
					linedo($("#pt" + _highlight_curvid + "_" + _highlight_curpt).offset(), $(this).offset(), _highlight_curvid, _highlight_curpt);

					dumphistory(_highlight_curvid, _highlight_curpt);

					loadvid($(this).attr('data-clip'),$(this).attr('data-start'));
					clipstartoffset[curvid] = parseInt($(this).attr('data-start'));

					// remove hotpoints
					$(".hotpoint_on").removeClass('hotpoint_on').hide();

					// disable new hotpoints for ten seconds
					preventdoublejump = true;
					
					preventdoublejumpIvl = setTimeout(function () {
						preventdoublejump = false;
					},(_increment * 2000));

				}
			});
		}
	},500);

});


function linedo (frompt, topt, thisvid, thispt){

	// draw lines between the start and end
	
	var offsetter = $("#blurredlines").offset().top - 11;
	
	var froms = frompt.top;
	
	if(thisvid == 3){
		froms -= 50;
	}
	
	var sideoffset = 11;
	
	var drawstring = "M" + (frompt.left - sideoffset) + ',' + (froms - offsetter) + ' L' + (topt.left - 11) + ',' + (topt.top - offsetter);

	console.log(drawstring);

	var newpath = paper.path( drawstring );
	newpath.attr({ 'stroke' : '#fbb03b', 'stroke-width' : 3, 'stroke-dasharray': '. ', 'stroke-linecap': 'round' });

	var newpath_all = paper_all.path( drawstring );
	newpath_all.attr({ 'stroke' : '#fbb03b', 'stroke-width' : 3, 'stroke-dasharray': '. ', 'stroke-linecap': 'round' });

	
}

function dumphistory(vidtarget,startpoint){
	// routine that kills off the rest of the scrubber line when the user clicks something
	
	// first remove hotpoints that are later than this point
	$("#scr_"+vidtarget).find(".hotpoint").each(function () { if(parseInt($(this).attr('data-start')) > startpoint){ $(this).remove() }});
	
	
	// rescale the scrubbers
	
	console.log('here ' + vidtarget);
	
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

	var vh = ((($("#container").width() - 80) / 16) * 9);
	var vtop = (($("#container").height() - vh) / 2) - 50;
	var w = ($("#container").width() - 80);
	var h = (($("#container").width() - 80) / 16) * 9;
	$("#videoplayer").css({ 'z-index': 5, 'width': w + 'px', 'padding-top': vtop, 'padding-left': 40, 'height': h + 'px' });
	var playeroptions = {  };
	playeroptions.allowFullScreen = false;
	playeroptions.allowscriptaccess = true;
	playeroptions.autostart = true;
	playeroptions.height = h;
	playeroptions.width = w;
	playeroptions.controlbar = 'none';
	playeroptions.streamer = _rtmpserver;
	playeroptions.file = videoclip + '.mp4';
	playeroptions.skin = 'art/bekle.zip';
	swfobject.embedSWF('art/player.swf',"vidin",w,h,"9.0.115", 'art/expressInstall.swf', playeroptions, { 'wmode':'opaque', 'scale':'noscale', 'salign':'tl', 'menu':false, 'allowFullScreen':false, 'allowScriptAccess':'always' }, { id:'vidin',name:'vidin', bgcolor:'#000000' });
	subthis = this;
	jwplayer("vidin").onTime(function (timobj) {
		subthis.progressrun(timobj.position);
	});
	jwplayer("vidin").onComplete(function () {
		subthis._ended();
	});	


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
	jwplayer('vidin').load({ 'streamer': _rtmpserver, 'file': videoclipname + '.mp4', 'start': starttime, 'autostart': true });
}


function scrubresize (){

	// move the scrubbers around
	
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

	// draw a mask because enough already with this
	
	var boxa = paper.rect(21,Math.floor(vtop + (vh * .15)) - 20,width + 21,35);
	boxa.attr({ 'fill': '#000000', 'stroke':0 });

}


function progressrun (inf) {

	// update the scrubbers during playback, also deal with the highlighting
	
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
	
	if(clipstarts[curvid][thistime] && !preventdoublejump){
	
		// we have a point! light stuff up
	
		_highlight_curvid = curvid;
		_highlight_curpt = thistime;
		
		// traverse the 4 to only light up points on the other clips, not the current one
		for(var x = 0; x < 4; x++){
			if(x != curvid){
		 		$("#scr_" + x).find(".pt_" + clipstarts[curvid][thistime]).addClass('hotpoint_on').show();
			}
		}
	}
	if(clipends[curvid][thistime]){
	
		// the hot time is over
	
		$(".hotpoint_on").removeClass('hotpoint_on').hide();
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