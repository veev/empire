var clipdata = new Array();
var clipstarts = new Object();
var clipends = new Object();
var clipedges = new Object();
var cliplengths = new Object();
var cliprect = new Object();
var connsloaded = false;
var loadivl = new Number();
var paper;
var drawpath;

var _rtmpserver = 'rtmp://s17pilyt3yyjgf.cloudfront.net/cfx/st';
var _increment = 5;
var _scrubwidth = 0;
var _scrubheight = 0;
var _highlight_curvid = 0;
var _highlight_curpt = 0;
var _highlight_currentx = 0;
var _videoon = false;
var _svglevel = false;
var _fson = false;
var _curw = new Number();
var _playbackx = new Number();
var _playbacky = new Number();
var _clipoffsetfromstart = 0;

var preventdoublejumpIvl = new Number();
var preventdoublejump = false;

var curvid = 0;
var curplayback = 0;
var curstart = 0;

var videotimes = new Array();
var vidjumpcnt = 0;
var segmentsseen = new Array();

var usage = new Object();

$(window).resize(function () {
	scrubresize();
});

$(document).ready(function () {

	var matop = ($(".yellow:first").height() / 2) - 400;
	if(matop < 70){
		matop = 70;
	}

	$("#mainarea").css({ "margin-top": matop });
	$("#legplay").css({ "margin-left": ($("#container").width() / 2) - 70 }).fadeIn(4000).click(function () {
		$('html, body').animate({ scrollTop: ($('#container').offset().top - 20) }, 1000);
	});

	$("#legmore").css({ "margin-left": ($("#container").width() / 2) - 70 }).fadeTo(4000,.5).click(function () {
		if(_fson){
			fullscreen_off();
		}
		jwplayer("vidin").pause();
		$('.yellow_b').show();
		$('html, body').animate({ scrollTop: ($('.yellow_b').offset().top - 20) }, 1000);
	});

	// clickability for the initial 4

	$(".videospace").click(function () {
		curvid = parseInt($(this).attr('data-clip'));
		actualclip = $(this).attr('data-clipname');

		var w = ($("#container").width() - 100);
		var h = ($("#container").width() - 100) * .31
		var vtop = (($("#container").height() - h) / 2) - 20;

		$(this).animate({ 'z-index': 5, 'width': ($("#container").width() - 80) + 'px', 'top': vtop, 'left': 40, 'height': 330 }).fadeOut(8000);
		$(".videospace").hide().unbind('click');
		$(this).show();
		$(".blurb").remove();
		$(".blurbback").remove();
		drawvideo(actualclip);
		
		// set the playback x and y
				
		switch(curvid){
			case 0:
				_playbackx = 4;
				_playbacky = 4;
				break;
			case 1:
				_playbackx = w + 54;
				_playbacky = 4;
				break;
			case 2:
				_playbackx = w + 54;
				_playbacky = (h+110);
				break;
			case 3:
				_playbackx = 4;
				_playbacky = (h+110);
				break;
		}
	});
	
	$("#containerinner").fadeIn();
	
	
	// hardcoded clip lengths
	
	cliplengths[0] = 599;
	cliplengths[1] = 662;
	cliplengths[2] = 742;
	cliplengths[3] = 558;
	

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
			var clipfinal_a = new Object();
			var clipfinal_b = new Object();
			var clipfinal_c = new Object();
			var clipfinal_d = new Object();

			// handle the data - plot all the points

			for(var x = 0; x < clipdata.length; x++){
				clipdata[x].fired = false;
				clipdata[x].headsup = false;
				clipdata[x].clicked = false;
				var cl = Math.floor(cliplengths[parseInt(clipdata[x].clip)]);
				if(clipdata[x].clip == "0"){
					clipstart_a[timetosecs(clipdata[x].start)] = x;
					clipend_a[timetosecs(clipdata[x].end)] = x;
					clipfinal_a[timetosecs(clipdata[x].segend)] = x;
				}
				if(clipdata[x].clip == "1"){
					clipstart_b[timetosecs(clipdata[x].start)] = x;
					clipend_b[timetosecs(clipdata[x].end)] = x;
					clipfinal_b[timetosecs(clipdata[x].segend)] = x;
				}
				if(clipdata[x].clip == "2"){
					clipstart_c[timetosecs(clipdata[x].start)] = x;
					clipend_c[timetosecs(clipdata[x].end)] = x;
					clipfinal_c[timetosecs(clipdata[x].segend)] = x;
				}
				if(clipdata[x].clip == "3"){
					clipstart_d[timetosecs(clipdata[x].start)] = x;
					clipend_d[timetosecs(clipdata[x].end)] = x;
					clipfinal_d[timetosecs(clipdata[x].segend)] = x;
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
			clipedges[0] = clipfinal_a;
			clipedges[1] = clipfinal_b;
			clipedges[2] = clipfinal_c;
			clipedges[3] = clipfinal_d;
			
			
			render_lines(0);

			
			$(".hotpoint").click(function () {
			
				// the core clicking bits
			
				if($(this).hasClass('hotpoint_on')){
				
										
					var timeleft = timetosecs(clipdata[_highlight_currentx].segend) - curplayback;
				
					var subthis = this;
					debugmsg('delay of ' + timeleft + 's before execution');
				
					var thistop = $(this).offset().top;
					var thisleft = $(this).offset().left;
				
					// remove hotpoints
					$(".hotpoint_on").removeClass('hotpoint_on').hide();

					setTimeout(function () {
				
						$("#scr_" + _highlight_curvid).find('.hotpoint').show();

						dumphistory(_highlight_curvid, _highlight_curpt);


						// keep track of clip times watched
						var vidtime = new Object();
						vidtime.clip = curvid;
						vidtime.start = curstart;
						vidtime.end = curplayback;
						vidtime.count = vidjumpcnt;
						
						curstart = parseInt($(subthis).attr('data-start'));			
						
						videotimes.push(vidtime);
						vidjumpcnt++;

						loadvid($(subthis).attr('data-clip'),$(subthis).attr('data-start'));

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
    if (key == 32){
       e.preventDefault();
    	if(_videoon){
    		jwplayer("vidin").pause();
    	}
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

function render_lines (mode){

	var h = ($("#container").width() - 100) * .31;  // video height
	var vtop = (($("#container").height() - h) / 2) - 60; // top of video space
	var w = ($("#container").width() - 100); // video width;
	_scrubwidth = w + 54;
	_scrubheight = h + 110;
	_scrubtop = vtop - 40;
	
	_curw = w;

	cliprect[0] = '5 5 ' + (w + 38) + ' 46';
	cliprect[1] = '5 41 22 ' + (_scrubheight - 41);
	cliprect[2] = (w + 24) + ' 41 ' + (_scrubheight - 41) + ' ' + (w + 38);
	cliprect[3] = '21 ' + (h + 10) + ' ' + w + ' 99';
	
	// create a raphael object on the div I made for lines

	if(paper){
		paper.remove();
	}

	$("#linegroup").css({ 'margin-top': _scrubtop + 'px', 'margin-left': '15px' });
	$("#icongroup").css({ 'margin-top': (_scrubtop - 15) + 'px', 'width': (_scrubwidth + 30), 'height': (_scrubheight + 32) });

	paper = Raphael(document.getElementById("linegroup"), _scrubwidth + 8, _scrubheight + 8);
	paper_playback = Raphael(document.getElementById("playback"), $("#playback").width(), $("#playback").height());
	
	var curx = 4;
	var cury = 4; // lines start at the top, so yeah

	for(var y = 0; y < 4; y++){ // loop through each clip now to draw the box lines
		
		var vertical = false;		
		var secpx = _scrubwidth / cliplengths[y]; // multiplier of seconds to pixels
		
		if(y == 1 || y == 3){
			vertical = true;
			secpx = (_scrubheight - 8) / cliplengths[y]; // multiplier of seconds to pixels if it's vertical
		}
		
		// traverse the starts to put them in order
		
		var startar = new Array();

		for(clip in clipedges[y]){
			startar.push(parseInt(clip));
		}
		startar = startar.sort(function(a,b){return a-b});

		// traverse those starts and build the scrubber line segments
		
		for(var x = 0; x < startar.length; x++){
		
			var idcode = 'l' + clipedges[y][startar[x]];

			var drawstring = "M" + curx + ',' + cury + ' L';
			
			$("#icongroup").append('<span class="icon gsoff g' + clipdata[clipedges[y][startar[x]]].state + ' gsa' + clipdata[clipedges[y][startar[x]]].state + clipdata[clipedges[y][startar[x]]].substate + '" id="' + idcode + '_ia" data-clipdata="' + clipedges[y][startar[x]] + '" style="display: none; left: ' + curx + '; top: ' + cury + '"></span>');
			
			var change = 0;
			if(x == 0){
				change = startar[x] - 0;
			} else {
				change = startar[x] - startar[x-1];
			}
			
			if(vertical){ // vertical
				if(x == (startar.length - 1)){
					if(y == 1){
						cury = _scrubheight;
					} else {
						cury = 4;
					}
				} else {
					if(y == 1){
						cury = cury + (change * secpx);
					} else {
						cury = cury - (change * secpx);
					}
				}
			} else { // horizontal
				if(x == (startar.length - 1)){
					if(y == 0){
						curx = _scrubwidth;
					} else {
						curx = 4;
					}
				} else {
					if(y == 0){
						curx = curx + (change * secpx);
					} else {
						curx = curx - (change * secpx);
					}
				}
			}
			

			drawstring += curx + ',' + cury;
			
			$("#icongroup").append('<span class="icon gsoff g' + clipdata[clipedges[y][startar[x]]].state + ' gs' + clipdata[clipedges[y][startar[x]]].state + clipdata[clipedges[y][startar[x]]].substate + '" id="' + idcode + '_ib" data-clipdata="' + clipedges[y][startar[x]] + '"  style="display: none; left: ' + curx + '; top: ' + cury + '"></span>');

			var newpath = paper.path( drawstring );
									
			var lineclass = "scrubber ";
			lineclass += "g" + clipdata[clipedges[y][startar[x]]].state + ' og' + clipdata[clipedges[y][startar[x]]].state + clipdata[clipedges[y][startar[x]]].substate + ' pl' + y + startar[x];
			
			$(newpath.node).attr("id",idcode);
			$(newpath.node).attr("class",lineclass);
			

		}
		
	}

		// ok, now draw the ends of each line to the corresponding start point of a linked space

		curx = 8;
		cury = 4; // lines start at the top, so yeah

		for(var y = 0; y < 4; y++){ // loop through each clip now to draw the box lines

			// clip final bits - go there and then draw lines from them to other clips that have the same state + substate

			for(clip in clipedges[y]){
			
				// determine the class for each clip in there
					
				var clipclass = clipdata[clipedges[y][clip]].state + clipdata[clipedges[y][clip]].substate;
				
				// traverse everything else with this class and draw some lines;
				
				var coords = parsed($("#l" + clipedges[y][clip]).attr('d'));
				
				
				$(".og" + clipclass).each(function () {
					var id = $(this).attr('id');
					if(id != ("l" + clipedges[y][clip])){
						var thisclip = parsed($(this).attr('d'));
						var newline = "M" + coords.endx + ',' + coords.endy + 'L' + thisclip.startx + ',' + thisclip.starty;
						
						var newpath_a = paper.path( newline );
						newpath_a.attr({'clip-rect':cliprect[0]});

						var newpath_b = paper.path( newline );
						newpath_b.attr({'clip-rect':cliprect[1]});

						var newpath_c = paper.path( newline );
						newpath_c.attr({'clip-rect':cliprect[2]});

						var newpath_d = paper.path( newline );
						newpath_d.attr({'clip-rect':cliprect[3]});

						var lineclass = "transition_unused tl" + clipclass;
			
						var trans_a = idcode + '_1';
						var trans_b = idcode + '_2';
						var trans_c = idcode + '_3';
						var trans_d = idcode + '_4';
			
						$(newpath_a.node).attr("id",trans_a);
						$(newpath_b.node).attr("id",trans_b);
						$(newpath_c.node).attr("id",trans_c);
						$(newpath_d.node).attr("id",trans_d);

						$(newpath_a.node).attr("data-outbound",clipedges[y][clip]);
						$(newpath_b.node).attr("data-outbound",clipedges[y][clip]);
						$(newpath_c.node).attr("data-outbound",clipedges[y][clip]);
						$(newpath_d.node).attr("data-outbound",clipedges[y][clip]);

						$(newpath_a.node).attr("class",lineclass);
						$(newpath_b.node).attr("class",lineclass);
						$(newpath_c.node).attr("class",lineclass);
						$(newpath_d.node).attr("class",lineclass);


					}
				});
				
			}

		}
		
	svgreset();
	$("#linegroup").hide();
	$("#icongroup").hide();

}

function dumphistory(vidtarget,startpoint){
	// routine that kills off the rest of the scrubber line when the user clicks something
	
	// first remove hotpoints that are later than this point
//	$("#scr_"+vidtarget).find(".hotpoint").each(function () { if(parseInt($(this).attr('data-start')) > startpoint){ $(this).remove() }});
	

}


function drawvideo (videoclip) {

	// initial video draw, triggered by users clicking on one of the large images

	$("#icongroup").show();
	var w = ($("#container").width() - 100);
	var h = ($("#container").width() - 100) * .31
	var vtop = (($("#container").height() - h) / 2) - 50;
	$("#videoplayer").css({ 'width': w + 'px', 'padding-top': vtop, 'padding-left': 40, 'height': h + 'px' });
	var playeroptions = { 'controlbar.position': 'over', 'controlbar.idlehide': true };
	playeroptions.allowFullScreen = false;
	playeroptions.allowscriptaccess = true;
	playeroptions.autostart = true;
	playeroptions.height = h;
	playeroptions.width = w;
//	playeroptions.controlbar = 'none';
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
	$("#linegroup").fadeIn();

	_videoon = true;
			

}

function _ended () {

	var vidtime = new Object();
	vidtime.clip = curvid;
	vidtime.start = curstart;
	vidtime.end = curplayback;
	vidtime.count = vidjumpcnt;
	videotimes.push(vidtime);

	var readout = new String();
	
	for(var x = 0; x < videotimes.length; x++){
		readout += 'clip ' + videotimes[x].clip + ' start second ' + videotimes[x].start + ' / end second ' + videotimes[x].end + "\r";
	}
	
	debugmsg(readout,true);

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
	
	var w = ($("#container").width() - 80);
	var h = ($("#container").width() - 80) * .31
	var vtop = (($("#container").height() - h) / 2) - 50;
	_scrubwidth = w;
	_scrubheight = (h + 100);
	var starttop = vtop - 80;
	$("#legplay").css({ "margin-left": ($("#container").width() / 2) - 70 });
	$("#legmore").css({ "margin-left": ($("#container").width() / 2) - 70 });


	var newleft = 40;
	
	
	if(w > _curw){
		newleft += ((w - _curw) / 2);
	}
	if(w < _curw){
		newleft = 40;
	}


	if(_videoon){
		// resize the video object because why the hell not
				
		$("#videoplayer").css({ 'padding-top': vtop, 'padding-left': newleft });
	
	}
	
	$("#linegroup").css({ 'margin-top': (vtop - 40) + 'px', 'margin-left': (newleft - 25) });
	$("#icongroup").css({ 'margin-top': (vtop - 55) + 'px', 'margin-left': (newleft - 40) });

}


function progressrun (inf) {

	// update the scrubbers during playback, also deal with the highlighting
	
	curplayback = inf;

	var reverse = false;
	var vertical = false;
	var playstring = new String();
	
	playstring = 'M' + _playbackx + ',' + _playbacky + 'L';
	
	var secpx = _scrubwidth / cliplengths[curvid];
	if(curvid == 1 || curvid == 3){
		secpx = (_scrubheight - 8) / cliplengths[curvid];
		vertical = true;
	}
	if(curvid == 2 || curvid == 3){
		reverse = true;
	}

	// draw a line from the current x/y to this point in time
	

	var desiredlength = (curplayback - _clipoffsetfromstart) * secpx;
	
	if(vertical){
		if(reverse){
			playstring += _playbackx + ',' + (_playbacky - desiredlength);
		} else {
			playstring += _playbackx + ',' + (_playbacky + desiredlength);
		}
	} else {
		if(reverse){
			playstring += (_playbackx - desiredlength) + ',' + _playbacky;
		} else {
			playstring += (_playbackx + desiredlength) + ',' + _playbacky;
		}
	}
	
	if(drawpath){
		drawpath.remove();
	}
	
	
	console.log(playstring);
	
	drawpath = paper.path( playstring );
	drawpath.attr({ 'arrow-end': 'classic-wide-long', 'stroke': '#fbb03b' });
	$(drawpath.node).attr("class","playback");
	

	var thistime = Math.floor(inf);
	
	// now look for times to light up other options
	
	if(clipends[curvid][thistime] && !clipdata[clipends[curvid][thistime]].fired && !preventdoublejump){
	
		// we have a point! light stuff up

		_highlight_curvid = curvid;
		_highlight_curpt = thistime;
		_highlight_currentx = clipends[curvid][thistime];
		
		clipdata[clipends[curvid][thistime]].fired = true;
		
		console.log('firing ' + clipends[curvid][thistime]);
		$("#l" + clipends[curvid][thistime] + "_ib").fadeIn();

		$(".gsa" + clipdata[clipends[curvid][thistime]].state + clipdata[clipends[curvid][thistime]].substate).each(function () {
			if($(this).attr('id') != "l" + clipends[curvid][thistime] + '_ia'){
				$(this).fadeIn();
			}
		});

		$(".tl" + clipdata[clipends[curvid][thistime]].state + clipdata[clipends[curvid][thistime]].substate).each(function () {
			var thiscl = $(this).attr('class');
			if($(this).attr('data-outbound') == clipends[curvid][thistime]){
				if(thiscl.indexOf('transition_unused') != -1){
					thiscl = thiscl.replace('transition_unused','transition_hot');
					$(this).attr('class',thiscl);
				}
			}
		});

		
		// traverse the 4 to only light up points on the other clips, not the current one
		for(var x = 0; x < 4; x++){
			if(x != curvid){
		 		$("#scr_" + x).find(".g" + clipdata[clipends[curvid][thistime]].state + clipdata[clipends[curvid][thistime]].substate).addClass('hotpoint_on').show();
			}
		}
	}
	if(clipedges[curvid][thistime]){
	
		// change this segment to viewed
		
		_clipoffsetfromstart = thistime;
		
		console.log(_clipoffsetfromstart + ' is offset now');
		
		markseen(timetosecs(clipdata[clipedges[curvid][thistime]].segend), curvid);
	
		if(clipedges[curvid][thistime] == _highlight_currentx){
	
			// the hot time is over
	
			console.log('unfiring ' + clipedges[curvid][thistime]);
	
			// fade this icon if it's not selected
			if($("#l" + clipedges[curvid][thistime] + "_ib").hasClass('gsoff')){
				$("#l" + clipedges[curvid][thistime] + "_ib").fadeOut();
			}		
			
			
			// fade other icons
			
			$(".gsa" + clipdata[clipedges[curvid][thistime]].state + clipdata[clipedges[curvid][thistime]].substate).each(function () {
				if(($(this).attr('id') != "l" + clipedges[curvid][thistime] + '_ia') && $(this).hasClass('gsoff')){
					$(this).fadeOut();
				}
			});
			
			// fade connecting lines

			$(".tl" + clipdata[clipedges[curvid][thistime]].state + clipdata[clipedges[curvid][thistime]].substate).each(function () {
				var thiscl = $(this).attr('class');
				if(thiscl.indexOf('transition_hot') != -1){
					thiscl = thiscl.replace('transition_hot','transition_unused');
					$(this).attr('class',thiscl);
				}
			});

		
		
			_highlight_currentx = 0;
		
		}
		
	}
}


function markseen (endpoint, cv){
	var posdenus = parsed($(".pl" + cv + endpoint + ":first").attr('d'));
	
	_playbackx = parseInt(posdenus.endx);
	_playbacky = parseInt(posdenus.endy);
	
	console.log(posdenus);
	
	var thiscl = $(".pl" + cv + endpoint + ":first").attr("class");
	var thisid = $(".pl" + cv + endpoint + ":first").attr("id");
	thiscl = thiscl.replace("scrubber ","scrubber_seen ");
	$("#" + thisid).attr("class",thiscl);
	segmentsseen.push({ 'video': cv, 'endpoint': endpoint, 'id': thisid });
}

function svgreset () {

	// reset the svg layer raphael is using
	
	if(!_svglevel){
		$("svg:first").css({ "z-index":3 });	
		_svglevel = true;
	}
}


function parsed (d) {

	// helper routine to deconstruct path data from svg paths
	
	var retobj = new Object();
	var start = d.split('L');
	start[0] = start[0].replace('M','');	
	var starta = start[0].split(',');
	var startb = start[1].split(',');
	
	retobj.startx = starta[0];
	retobj.starty = starta[1];
	retobj.endx = startb[0];
	retobj.endy = startb[1];
	
	return retobj;
	
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