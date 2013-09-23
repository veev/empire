var clipdata = new Array();
var clipstarts = new Object();
var clipends = new Object();
var clipedges = new Object();
var cliplengths = new Object();
var cliprect = new Object();
var clipfirst = new Object();

var connsloaded = false;
var loadivl = new Number();
var clipmap = new Array('indonesia','india','southafrica','srilanka');
var paper,paper_connections,endpaper,drawpath;
var legacy_debug = true;

var _rtmpserver = 'rtmp://s17pilyt3yyjgf.cloudfront.net/cfx/st';
var _increment = 5;
var _scrubwidth = 0;
var _scrubheight = 0;
var _highlight_curvid = 0;
var _highlight_curpt = 0;
var _highlight_currentx = 0;
var _videoon = false;
var _endscreenon = false;
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
var themetrack = { 'a':0, 'b':0, 'c':0, 'd':0, 'e':0 };
var litlines = new Object();
var litscrubbers = new Object();
var liticons = new Object();
var gonescrubbers = new Object();
var gonelines = new Object();

var usage = new Object();

$(window).resize(function () {
	scrubresize();
});


$(document).ready(function () {

	legacy_draw();
	
	$("#legplay").click(function () {
		$('html, body').animate({ scrollTop: ($('#legacy_container').offset().top - 20) }, 1000);
	});

	$("#legmore").click(function () {
		if(_fson){
			fullscreen_off();
		}
		jwplayer("vidin").pause();
		$('html, body').animate({ scrollTop: ($('.yellow_b').offset().top - 20) }, 1000);
	});
	

	// clickability for the initial 4

	$(".videospace").click(function () {
		if(audioactive){
			audiostop();
		}
		curvid = parseInt($(this).attr('data-clip'));
		actualclip = $(this).attr('data-clipname');

		var w = ($("#legacy_container").width() - 100);
		var h = ($("#legacy_container").width() - 100) * .31
		var vtop = (($("#legacy_container").height() - h) / 2) - 20;

		$(this).animate({ 'z-index': 68, 'width': ($("#legacy_container").width() - 80) + 'px', 'top': vtop, 'left': 40, 'height': 330 }).fadeOut(8000);
		$(".videospace").hide().unbind('click');
		$(this).show();
		$(".blurb").remove();
		$(".blurbback").remove();
		drawvideo(actualclip);
		
		
		if(legacy_debug){
			debug_listvideo();
		}
		
		
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
	
	$("#legacy_containerinner").fadeIn();
	
	
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
				
				clipdata[x].dataid = x;
				
				clipdata[x].start_secs = timetosecs(clipdata[x].start);
				clipdata[x].end_secs = timetosecs(clipdata[x].end);
				clipdata[x].segend_secs = timetosecs(clipdata[x].segend);
				clipdata[x].seen = false;
				
				var cl = Math.floor(cliplengths[parseInt(clipdata[x].clip)]);
				if(clipdata[x].clip == "0"){
					clipstart_a[clipdata[x].start_secs] = x;
					clipend_a[clipdata[x].end_secs] = x;
					clipfinal_a[clipdata[x].segend_secs] = x;
				}
				if(clipdata[x].clip == "1"){
					clipstart_b[clipdata[x].start_secs] = x;
					clipend_b[clipdata[x].end_secs] = x;
					clipfinal_b[clipdata[x].segend_secs] = x;
				}
				if(clipdata[x].clip == "2"){
					clipstart_c[clipdata[x].start_secs] = x;
					clipend_c[clipdata[x].end_secs] = x;
					clipfinal_c[clipdata[x].segend_secs] = x;
				}
				if(clipdata[x].clip == "3"){
					clipstart_d[clipdata[x].start_secs] = x;
					clipend_d[clipdata[x].end_secs] = x;
					clipfinal_d[clipdata[x].segend_secs] = x;
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
			$("#linegroup").hide();
			$("#linegroup_connections").hide();
			
			
//			$(".videospace").hide();
			
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
		var docElm = document.getElementById("legacy_container");
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

function endscreen (theme,focus) {

	// endscreen

	var w = ($("#legacy_container").width() - 100);
	var h = ($("#legacy_container").width() - 100) * .31;
	var vtop = (($("#legacy_container").height() - h) / 2) - 50;
	w += 54;
	vtop -= 47;
	h += 110;
	
	$("#endscreen_outer").css({ 'width': w + 'px', 'margin-top': vtop, 'margin-left': '18px', 'height': h + 'px' });

	$("#endscreen").append('<div id="group0" class="grey" style="background: url(art/ends/' + theme + '_0.jpg) center center; background-size: 1280px 720px; width: 1280px; height: 407px;"></div>');
	$("#endscreen").append('<div id="group1" class="grey" style="background: url(art/ends/' + theme + '_1.jpg) center center; background-size: 1280px 720px; width: 1280px; height: 407px;"></div>');
	$("#endscreen").append('<div id="group2" class="grey" style="background: url(art/ends/' + theme + '_2.jpg) center center; background-size: 1280px 720px; width: 1280px; height: 407px;"></div>');
	$("#endscreen").append('<div id="group3" class="grey" style="background: url(art/ends/' + theme + '_3.jpg) center center; background-size: 1280px 720px; width: 1280px; height: 407px;"></div>');
	$("#endscreen").append('<div id="group0a" class="color" style="background: url(art/ends/' + theme + '_0.jpg) center center; background-size: 1280px 720px; width: 1280px; height: 407px; display: none;"></div>');
	$("#endscreen").append('<div id="group1a" class="color" style="background: url(art/ends/' + theme + '_1.jpg) center center; background-size: 1280px 720px; width: 1280px; height: 407px; display: none;"></div>');
	$("#endscreen").append('<div id="group2a" class="color" style="background: url(art/ends/' + theme + '_2.jpg) center center; background-size: 1280px 720px; width: 1280px; height: 407px; display: none;"></div>');
	$("#endscreen").append('<div id="group3a" class="color" style="background: url(art/ends/' + theme + '_3.jpg) center center; background-size: 1280px 720px; width: 1280px; height: 407px; display: none;"></div>');
	
	var denom = (w - 2) / 1280;
	var denomh = (h - 2) / 407;
	
	$("#endscreen").css({ 'transform-origin': '0 0', '-webkit-transform-origin': '0 0',  'transform': 'scale(' + denom + ',' + denomh + ');', '-ms-transform': 'scale(' + denom + ',' + denomh + ')', '-webkit-transform': 'scale(' + denom + ',' + denomh + ')' });
	
	
//	$("#endscreen").fadeIn(4000, function () {
		$("#group" + focus + "a").fadeTo(9500,.8);
//	});
	_endscreenon = true;
	
	
	render_lines(1, { 'w':$("#endscreen").width() ,'h':$("#endscreen").height(),'vtop':vtop,'ml':ml });


}


function render_lines (mode,spatial){

	// build the matrix of playback and connecting lines


	var h, vtop, w;

	h = ($("#legacy_container").width() - 100) * .31;  // video height
	vtop = (($("#legacy_container").height() - h) / 2) - 60; // top of video space
	w = ($("#legacy_container").width() - 100); // video width;
	ml = 15;
	_scrubwidth = w + 54;
	_scrubheight = h + 110;
	_scrubtop = vtop - 40;


	if(mode == 1){
		h = spatial.h;
		vtop = spatial.vtop;
		w = spatial.w;
		ml = spatial.ml;
	}
	
	
	_curw = w;

	cliprect[0] = '5 6 ' + (w + 44) + ' 42';
	cliprect[1] = '5 41 20 ' + (_scrubheight - 41);
	cliprect[2] = (w + 26) + ' 41 ' + (_scrubheight - 41) + ' ' + (w + 36);
	cliprect[3] = '21 ' + (h + 10) + ' ' + w + ' 99';
	
	// create a raphael object on the div I made for lines

	if(paper){
		paper.remove();
	}

	if(paper_connections){
		paper_connections.remove();
	}

	$("#linegroup").css({ 'margin-top': _scrubtop + 'px', 'margin-left': ml});
	$("#linegroup_connections").css({ 'margin-top': _scrubtop + 'px', 'margin-left': ml});

	$("#icongroup").css({ 'margin-top': (_scrubtop - 15) + 'px', 'width': (_scrubwidth + 30), 'height': (_scrubheight + 32), 'margin-left': (ml - 15) });
		
	paper = Raphael(document.getElementById("linegroup"), _scrubwidth + 8, _scrubheight + 8);
	paper_connections = Raphael(document.getElementById("linegroup_connections"), _scrubwidth, _scrubheight + 8);
	
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
		
		var segendar = new Array();

		segendar.push(0);

		for(clip in clipstarts[y]){
			segendar.push(parseInt(clip));
		}
		segendar = segendar.sort(function(a,b){return a-b});

		// traverse those starts and build the scrubber line segments
		
		for(var x = 0; x < segendar.length; x++){
		
			var idcode = 'l' + y + 'start';
			
			if(x > 0){
				idcode = 'l' + clipstarts[y][segendar[x]];
			}

			var drawstring = "M" + curx + ',' + cury + ' L';
						
			if(x > 0){
				if(mode == 0 || liticons[idcode + '_ia']){
					var ic_classa = '<div class="icon gsoff gsactive g' + clipdata[clipstarts[y][segendar[x]]].state;
					if(liticons[idcode]){
						ic_classa += '_on';
					}
					ic_classa += ' gsa' + clipdata[clipstarts[y][segendar[x]]].state + clipdata[clipstarts[y][segendar[x]]].substate + '" id="' + idcode + '_ia" data-clipdata="' + clipstarts[y][segendar[x]] + '" style="pointer-events: auto; ';
					if(!liticons[idcode]){
						ic_classa += 'display: none; ';
					}
					ic_classa += ' left: ' + curx + '; top: ' + cury + '"></div>';
					$("#icongroup").append(ic_classa);
				}
			}

			var change = 0;
			if(x == 0){
				change = clipdata[clipstarts[y][segendar[1]]].start_secs;
				clipfirst[y] = clipdata[clipstarts[y][segendar[1]]].start_secs;
			} else {
				if(x == 1){
					change = clipdata[clipstarts[y][segendar[1]]].segend_secs - clipdata[clipstarts[y][segendar[1]]].start_secs;
				} else {
					change = segendar[x] - clipdata[clipstarts[y][segendar[(x-1)]]].segend_secs;
				}
			}
			
			if(vertical){ // vertical
				if(x == (segendar.length - 1)){
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
				if(x == (segendar.length - 1)){
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
			
			if(x > 0){
				if(mode == 0 || liticons[idcode + '_ib']){
					var ic_classb = '<div class="icon gsoff g' + clipdata[clipstarts[y][segendar[x]]].state;
					if(liticons[idcode]){
						ic_classb += '_on';
					}
					ic_classb += '" id="' + idcode + '_ib" data-clipdata="' + clipstarts[y][segendar[x]] + '" style="pointer-events: auto; ';
					if(!liticons[idcode]){
						ic_classb += 'display: none; ';
					}
					ic_classb += ' left: ' + curx + '; top: ' + cury + '"></div>';
					$("#icongroup").append(ic_classb);
				}
			}	
			
			if(mode == 0 || (mode == 1 && !gonescrubbers[idcode])){
			
				var newpath = paper.path( drawstring );
									
				var lineclass = "scrubber ";
				if(x > 0){
					lineclass += "g" + clipdata[clipstarts[y][segendar[x]]].state + ' og' + clipdata[clipstarts[y][segendar[x]]].state + clipdata[clipstarts[y][segendar[x]]].substate + ' pc' + y + x + ' pl' + y + clipdata[clipstarts[y][segendar[x]]].end_secs;
				} else {
					lineclass += 'pl' + y + ' pc' + y + '0';
				}
			
				$(newpath.node).attr("id",idcode);
				$(newpath.node).attr("data-lineseq",x);
				$(newpath.node).attr("data-lineclip",y);
				$(newpath.node).attr("class",lineclass);

			}			

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
					var clipid = parseInt(id.replace('l',''));
					if(id != ("l" + clipedges[y][clip])){
						var thisclip = parsed($(this).attr('d'));
						
						var newline = "M" + coords.endx + ',' + coords.endy + 'L' + thisclip.startx + ',' + thisclip.starty;
						
						var newpath_a, newpath_b, newpath_c, newpath_d;

						var lineclass = "transition_unused tl" + clipclass;
			
						var lineyes = true;
			
						var trans_a = 'l' + clipedges[y][clip] + '_1';
						var trans_b = 'l' + clipedges[y][clip] + '_2';
						var trans_c = 'l' + clipedges[y][clip] + '_3';
						var trans_d = 'l' + clipedges[y][clip] + '_4';

						if(mode == 0){
							newpath_a = paper_connections.path( newline );
							newpath_a.attr({'clip-rect':cliprect[0]});

							newpath_b = paper_connections.path( newline );
							newpath_b.attr({'clip-rect':cliprect[1]});

							newpath_c = paper_connections.path( newline );
							newpath_c.attr({'clip-rect':cliprect[2]});

							newpath_d = paper_connections.path( newline );
							newpath_d.attr({'clip-rect':cliprect[3]});
	
						} else {
	
							if(gonelines[trans_a]){ // checking to see if this has been wiped out
								lineyes = false;
							} else {
								newpath_a = paper_connections.path( newline );
							}						
	
						}

						if(lineyes){
						
							$(newpath_a.node).attr("id",trans_a);
						
							if(mode == 0){
								$(newpath_b.node).attr("id",trans_b);
								$(newpath_c.node).attr("id",trans_c);
								$(newpath_d.node).attr("id",trans_d);
							}

							$(newpath_a.node).attr("data-outbound",clipedges[y][clip]);
							if(mode == 0){
								$(newpath_b.node).attr("data-outbound",clipedges[y][clip]);
								$(newpath_c.node).attr("data-outbound",clipedges[y][clip]);
								$(newpath_d.node).attr("data-outbound",clipedges[y][clip]);
							}

							$(newpath_a.node).attr("data-inbound",clipid);
							if(mode == 0){
								$(newpath_b.node).attr("data-inbound",clipid);
								$(newpath_c.node).attr("data-inbound",clipid);
								$(newpath_d.node).attr("data-inbound",clipid);
							}
						
							$(newpath_a.node).attr("class",lineclass);
							if(mode == 0){
								$(newpath_b.node).attr("class",lineclass);
								$(newpath_c.node).attr("class",lineclass);
								$(newpath_d.node).attr("class",lineclass);
							}
						}
						
					}
				});
				
			}

		}
		
	svgreset();
	$(".gsactive").click(iconclick);
//	$("#icongroup").hide();

}

function iconclick () {
	var data = clipdata[parseInt($(this).attr('data-clipdata'))];
	themetrack[data.state] = themetrack[data.state] + 1;
	
	var thisclass = 'g' + data.state;
	var lastx = _highlight_currentx;
	
	// log these for later
	
	liticons[$(this).attr('id')] = 1;
	liticons['#l' + _highlight_currentx +'_ib'] = 1;

	
	// icon changes - turn this one on, take the last one and toggle that on
		
	$(this).removeClass('gsoff').removeClass('gsactive').removeClass(thisclass).addClass(thisclass+"_on");
	$('#l' + _highlight_currentx +'_ib').removeClass('gsoff').removeClass('gsactive').removeClass(thisclass).addClass(thisclass+"_on");
	
	// get the class of these to disable them from future lighting
	
	var newclass = "gsa" + data.state;
	newclass += (data.substate)? data.substate:'';
	$(this).removeClass(newclass);
	$('#l' + _highlight_currentx +'_ia').removeClass(newclass);
	$('#l' + _highlight_currentx +'_ib').removeClass(newclass);
	
	
	// get the delay
	var timeleft = (clipdata[lastx].segend_secs - curplayback);
	if(legacy_debug){
		console.log('delay of ' + timeleft + 's before execution');
	}

	// go to the next segment from the outbound clip and dump it

	var jump_clipseq = parseInt($("#l" + lastx).attr('data-lineseq'));

	if(jump_clipseq > 0){
		// go a segment back and black it out if it's not viewed
		var thiscl = $(".pc" + clipdata[lastx].clip + '' + (jump_clipseq +1) + ':first').attr('class');
		if(thiscl){
			thiscl = thiscl.replace('scrubber ','scrubber_gone ');
			$(".pc" + clipdata[lastx].clip + '' + (jump_clipseq + 1) + ':first').attr('class',thiscl);
		}
	}



	setTimeout(function () {

		//color the lines

		var w = ($("#legacy_container").width() - 100);
		var h = ($("#legacy_container").width() - 100) * .31;

		switch(data.clip){
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


		// low hanging fruit - stuff that's already hot

		$(".transition_hot").each(function () {
			if($(this).attr('data-inbound') == data.dataid){
				var thiscl = $(this).attr('class');
				thiscl = thiscl.replace('transition_hot ','transition_used ');
				$(this).attr('class',thiscl);
				litlines[$(this).attr('id')] = 1;
			}
		});
		
		// get the target segment

		var finalid = data.clip + '' + data.end_secs;
		var posdenus = parsed($(".pl" + finalid + ":first").attr('d'));

		_playbackx = parseInt(posdenus.endx);
		_playbacky = parseInt(posdenus.endy);
		var outboundclipid = '';
		var nextclipid = '';

		var clipseq = parseInt($(".pl" + finalid + ":first").attr('data-lineseq'));

		if(clipseq > 0){
			// go a segment forward and black it out if it's not viewed
			var thiscl = $(".pc" + data.clip + '' + (clipseq - 1) + ':first').attr('class');
			thiscl = thiscl.replace('scrubber ','scrubber_gone ');
			if(thiscl){
				$(".pc" + data.clip + '' + (clipseq - 1) + ':first').attr('class',thiscl);
				var getstr = $(".pc" + data.clip + '' + (clipseq - 1) + ':first').attr('id');
				gonescrubbers[getstr] = 1;
				outboundclipid = parseInt(getstr.replace('l',''));
			}
		}


		var lclipseq = parseInt($("#l" + lastx).attr('data-lineseq'));

		if(lclipseq > 0){
			// go a segment back and black it out if it's not viewed
			var thiscl = $(".pc" + clipdata[lastx].clip + '' + (lclipseq + 1) + ':first').attr('class');
			thiscl = thiscl.replace('scrubber ','scrubber_gone ');
			if(thiscl && lclipseq ){
				$(".pc" + clipdata[lastx].clip + '' + (lclipseq + 1) + ':first').attr('class',thiscl);
				var getstr = $(".pc" + clipdata[lastx].clip + '' + (lclipseq - 1) + ':first').attr('id');
				gonescrubbers[getstr] = 1;
				nextclipid = parseInt(getstr.replace('l',''));
			}
		}
		
		
		// connector lines
		// high hanging fruit - anything with inbound/outbound matches
			
		$(".transition_unused").each(function () {
		
			// this is a direct match, it should be hot
			if($(this).attr('data-inbound') == data.dataid && $(this).attr('data-outbound') == lastx){
				var thiscl = $(this).attr('class');
				thiscl = thiscl.replace('transition_unused ','transition_used ');
				$(this).attr('class',thiscl);
			} else {
			
				// kill anything linking to this start or end directly

				if($(this).attr('data-inbound') == data.dataid || $(this).attr('data-outbound') == lastx){
					console.log('found line ' + $(this).attr('id'));
					gonelines[$(this).attr('id')] = 1;
					$(this).remove();
				}

				if(outboundclipid != ''){
					// kill anything linking from or to the next segment from the outbound clip
					var thisid = parseInt(outboundclipid);
					console.log('lastclipid ' + thisid);
					if($("#l" + thisid + '_1').attr('data-inbound') == thisid || $(this).attr('data-outbound') == thisid){
//						console.log('found line ' + $(this).attr('id'));
						gonelines["l" + thisid + '_1'] = 1;
						$("#l" + thisid + '_1').remove();
						$("#l" + thisid + '_2').remove();
						$("#l" + thisid + '_3').remove();
						$("#l" + thisid + '_4').remove();
					}
				}
				if(nextclipid != ''){
					
					// kill anything linking from or to the next segment from the outbound clip
					var thisid = parseInt(nextclipid);
//					console.log('nextclipid ' + thisid);
					if($("#l" + nextclipid + '_1').attr('data-inbound') == thisid || $(this).attr('data-outbound') == thisid){
//						console.log('found line ' + $(this).attr('id'));
						gonelines["l" + nextclipid + '_1'] = 1;
						$("#l" + nextclipid + '_1').remove();
						$("#l" + nextclipid + '_2').remove();
						$("#l" + nextclipid + '_3').remove();
						$("#l" + nextclipid + '_4').remove();
					}
				}
			}
		});
		
		console.log(gonelines);


		// set the new clip offset
		
		_clipoffsetfromstart = data.start_secs;
		
		
		// actually load the video

		loadvid(data.clip,data.start_secs);


		// disable new hotpoints for ten seconds
		preventdoublejump = true;

		preventdoublejumpIvl = setTimeout(function () {
			preventdoublejump = false;
		},(_increment * 5000));

	}, (timeleft * 1000));
	
}

function dumphistory(vidtarget,startpoint){
	// routine that kills off the rest of the scrubber line when the user clicks something
	
	// first remove hotpoints that are later than this point
//	$("#scr_"+vidtarget).find(".hotpoint").each(function () { if(parseInt($(this).attr('data-start')) > startpoint){ $(this).remove() }});
	

}


function drawvideo (videoclip) {

	// initial video draw, triggered by users clicking on one of the large images

	$("#icongroup").show();
	var w = ($("#legacy_container").width() - 100);
	var h = ($("#legacy_container").width() - 100) * .31
	var vtop = (($("#legacy_container").height() - h) / 2) - 50;
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
	$("#linegroup_connections").fadeIn();

	_videoon = true;
			

}

function _ended () {


	var vidtime = new Object();
	
	vidtime.clip = curvid;
	vidtime.start = curstart;
	vidtime.end = curplayback;
	vidtime.count = vidjumpcnt;
	videotimes.push(vidtime);
	
	
	// find the clip with the most viewing so that it can be blessed with color

	var accumulator = new Object([0,0,0,0]);
	var accumulator_max = 0;
	var accumulator_highkey = 0;
	var winningtheme = 'a';
	var winningtheme_max = 0;
	
	for(var x = 0; x < videotimes.length; x++){
		accumulator[videotimes[x].clip] = accumulator[videotimes[x].clip] + (videotimes[x].end - videotimes[x].start);
	}
	
	for(var y = 0; y < 4; y++){
		if(accumulator[y] > accumulator_max){
			accumulator_max = accumulator[y];
			accumulator_highkey = y;
		}
	}

	for(theme in themetrack){
		if(themetrack[theme] > winningtheme_max){
			winningtheme_max = themetrack[theme];
			winningtheme = theme;
		}
	}

	// call the endscreen
	
	endscreen(winningtheme,accumulator_highkey);

	// throw that more button up

	$("#legmore").fadeIn();
	
	// hide the video

	$("#vidin").hide();

}


function loadvid (clip,starttime) {
	

	// set the video player to move to another moment

	curvid = clip;
	videoclipname = $("#vid_" + clip).attr('data-clipname');
	jwplayer('vidin').load({ 'streamer': _rtmpserver, 'file': 'legacy/' + videoclipname + '_crop.mp4', 'start': starttime, 'autostart': true });
	jwplayer('vidin').onPlay(function () {
		console.log('videoready');
	});

	if(legacy_debug){
		debug_listvideo();
	}

	
}


function debug_listvideo () {
	for(var x = 0; x < clipdata.length; x++){
		if(clipdata[x].clip == curvid){
			console.log('clip ' + curvid + '; data id ' + x + '; start: ' + clipdata[x].start_secs + '; warn_start: ' + clipdata[x].end_secs + '; warn_end: ' + clipdata[x].segend_secs);		
		}
	}
}

function scrubresize (){

	// move the scrubbers around
	
	var w = ($("#legacy_container").width() - 80);
	var h = ($("#legacy_container").width() - 80) * .31
	var vtop = (($("#legacy_container").height() - h) / 2) - 50;
	_scrubwidth = w;
	_scrubheight = (h + 100);
	var starttop = vtop - 80;

	var newleft = 40;
	
	
	if(w > _curw){
		newleft += ((w - _curw) / 2);
	}
	if(w < _curw){
		newleft = 40;
	}

	if(_endscreenon){
		$("#endscreen_outer").css({ 'margin-top': (vtop - 36) + 'px', 'margin-left': (newleft - 22) });
	
	}

	if(_videoon){
		// resize the video object because why the hell not
				
		$("#videoplayer").css({ 'padding-top': vtop, 'padding-left': newleft });
	
	}
	
	$("#linegroup").css({ 'margin-top': (vtop - 40) + 'px', 'margin-left': (newleft - 25) });
	$("#linegroup_connections").css({ 'margin-top': (vtop - 40) + 'px', 'margin-left': (newleft - 25) });
	$("#icongroup").css({ 'margin-top': (vtop - 55) + 'px', 'margin-left': (newleft - 40) });

}

function legacy_draw() {

	var matop = ($(".yellow:first").height() / 2) - 400; // top of the matrix
	var padtop = 84; // top of the main title
	var legbottom = 60; //offset of the bottom play button on the open screen
	
	if($(".yellow:first").height() < 780){ // if this a wee screen
		padtop = 10;
		matop = 20;
		legbottom = 20;
	}
	
	$(".yellow_b").css("height",$(".yellow:first").height());
	
	$("#legacy_title").css({ 'padding-top': padtop });

	$("#mainarea").css({ "margin-top": matop });
	
	$("#legplay").css({ "bottom": legbottom, "margin-left": ($("#legacy_container").width() / 2) - 50 }).fadeIn(4000);
	$("#legmore").css({ "margin-left": ($("#legacy_container").width() / 2) - 90 });

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
	
	drawpath = paper.path( playstring );
	drawpath.attr({'arrow-end': 'classic-wide-long', 'stroke': '#fbb03b' });
	$(drawpath.node).attr("class","playback");
	

	var thistime = Math.floor(inf);
	
	// now look for times to light up other options
	
	if(clipends[curvid][thistime] && !clipdata[clipends[curvid][thistime]].fired && !preventdoublejump){
	
		// we have a point! light stuff up

		_highlight_curvid = curvid;
		_highlight_curpt = thistime;
		_highlight_currentx = clipends[curvid][thistime];
		
		clipdata[clipends[curvid][thistime]].fired = true;
		
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

		
	}
	
	if(clipedges[curvid][thistime]){
	
		if(!clipdata[clipedges[curvid][thistime]].seen){
				
			// change this segment to viewed
			_clipoffsetfromstart = thistime;		
			markseen(curvid,clipdata[clipedges[curvid][thistime]].end_secs);
			clipdata[clipedges[curvid][thistime]].seen = true;

		}
	
		if(clipedges[curvid][thistime] == _highlight_currentx){
	
			// the hot time is over
	
	
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
		
	} else {
		if(thistime == clipfirst[curvid]){

			// this only shows up on the first playback but fucking hell is it annoying to me.
			_clipoffsetfromstart = thistime;	
			
			markseen(curvid);
		}
	}
}


function markseen (cv,endpoint){
	var finalid = new String();
	
	finalid = cv;
		
	if(endpoint){
		finalid = cv + '' + endpoint;
	}
	
	var posdenus = parsed($(".pl" + finalid + ":first").attr('d'));
	
	_playbackx = parseInt(posdenus.endx);
	_playbacky = parseInt(posdenus.endy);
		
	var thiscl = $(".pl" + finalid + ":first").attr("class");
	var thisid = $(".pl" + finalid + ":first").attr("id");
	thiscl = thiscl.replace("scrubber ","scrubber_seen ");
	$("#" + thisid).attr("class",thiscl);

	var seq = parseInt($(".pl" + finalid + ":first").attr('data-lineseq'));
	if(seq > 0){
		for(var n = 0; n < seq; n++){
			var nthiscl = $(".pc" + cv + '' + n + ":first").attr("class");
			nthiscl = nthiscl.replace("scrubber ","scrubber_seen ");
			var nthisid = $(".pc" + cv + '' + n + ":first").attr("id");
			$("#" + nthisid).attr("class",nthiscl);
		}
	}
		
	litlines[$(".pl" + finalid + ":first").attr('id')] = 1;
	
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
