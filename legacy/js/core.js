var curvid = 0;
var curel;
var clipdata = new Array();
var clipstarts = new Object();
var cliplinks = new Object();
var cliplengths = new Object();
var connsloaded = false;
var loadivl = new Number();

$(document).ready(function () {

	// clickability for the initial 4

	$(".videospace").click(function () {
		curvid = parseInt($(this).attr('data-clip'));
		$(this).animate({ 'z-index': 5, 'width': ($(window).width() - 20) + 'px', 'top': (($(window).height() - ((($(window).width() - 20) / 16) * 9)) / 2), 'left':10, 'height': (($(window).width() - 20) / 16) * 9 + 'px' });
		$(".videospace").hide().unbind('click');
		$(this).show();
		var vi = $(this).find('video:first').attr('id');
		document.getElementById(vi).play();
		progress_start(vi);
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
	
	document.getElementById("video0").addEventListener("loadedmetadata", function () {
		cliplengths[0] = document.getElementById('video0').duration;
	});
	
	document.getElementById("video1").addEventListener("loadedmetadata", function () {
		cliplengths[1] = document.getElementById('video1').duration;
	});
	
	document.getElementById("video2").addEventListener("loadedmetadata", function () {
		cliplengths[2] = document.getElementById('video2').duration;
	});
	
	document.getElementById("video3").addEventListener("loadedmetadata", function () {
		cliplengths[3] = document.getElementById('video3').duration;
	});
	

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
		if(connsloaded && cliplengths[0] && cliplengths[1] && cliplengths[2] && cliplengths[3]){
			clearInterval(loadivl);
			// now that we have our data we can do our thing
			var clipstart_a = new Object();
			var clipstart_b = new Object();
			var clipstart_c = new Object();
			var clipstart_d = new Object();
			for(var x = 0; x < clipdata.length; x++){
				var cl = cliplengths[parseInt(clipdata[x].clip)];
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
				if(timetosecs(clipdata[x].start) < cl){
					var vert = false;
					var scr = ($("#scr_" + clipdata[x].clip));
					// only do things within the clips we have
					var pxmultiplier = Math.floor((scr.width() - 10) / cl);
					if(scr.hasClass("vertical")){
						vert = true;
						pxmultiplier = Math.floor(scr.height() / cl);
					}
					var clipstr = '<div class="hotpoint" id="pt' + clipdata[x].clip + '_' + timetosecs(clipdata[x].start) + '" style="display: none; ';
					var le = timetosecs(clipdata[x].end) - timetosecs(clipdata[x].start);
					if(vert){
						clipstr += 'height: ' + Math.floor(pxmultiplier * le) + 'px; margin-top: ' + Math.floor(pxmultiplier * timetosecs(clipdata[x].start)) + ' px';
					} else {
						clipstr += 'width: ' + Math.floor(pxmultiplier * le) + 'px; margin-left: ' + Math.floor(pxmultiplier * timetosecs(clipdata[x].start)) + ' px';
					}
					clipstr += '"></div>';
					console.log(clipstr);
					$(clipstr).appendTo(scr);
					
				}
			}
			
			$(".hotpoint").fadeIn();
			clipstarts[0] = clipstart_a;
			clipstarts[1] = clipstart_b;
			clipstarts[2] = clipstart_c;
			clipstarts[3] = clipstart_d;
		}
	},500);

});

function progress_start (vi) {
	curel = document.getElementById(vi);
	curel.addEventListener('timeupdate',function () {
		// update the scrubber
		var prg = (curel.currentTime / curel.duration) * 100;
		if($("#scr_" + curvid + "_play").attr('data-vertical') == 1){
			$("#scr_" + curvid + "_play").animate({ 'height': prg + '%' });
		} else {
			$("#scr_" + curvid + "_play").animate({ 'width': prg + '%' });
		}
	});
}

function timetosecs (instring) {
	var secs = new Number();
	var bits = instring.split(':');
	secs = parseInt(bits[0]) * 60;
	secs += parseInt(bits[1]);
	return secs;
}