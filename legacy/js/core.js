var curvid = 0;
var curel;

$(document).ready(function () {
	$(".videospace").click(function () {
		curvid = parseInt($(this).attr('data-clip'));
		$(this).animate({ 'z-index': 5, 'width': ($(window).width() - 20) + 'px', 'top': (($(window).height() - ((($(window).width() - 20) / 16) * 9)) / 2), 'left':10, 'height': (($(window).width() - 20) / 16) * 9 + 'px' });
		$(".videospace").hide().unbind('click');
		$(this).show();
		var vi = $(this).find('video:first').attr('id');
		document.getElementById(vi).play();
		progress_start(vi);
	});
	$(".scrubber_inner").each(function () {
		if($(this).attr('data-vertical') == "1"){
			$(this).css({ 'width':'100%' });
		} else {
			$(this).css({ 'height':'100%' });
		}
	});
	
	$.ajax({
		dataType: "json",
		url: "connections.json",
		success: function (data) {
			for(var x = 0; x < data.length; x++){
			
			}
		}});
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