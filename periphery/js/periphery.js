var rotate = 0;
var card = document.getElementById('card');
var _curtime = 0;
var _seektime = 0;
var flipside = false;
var flipangle = 0;
var flipblock = false;
var _controls = false;
var vid1Loaded = false;
//var vid2Loaded = false;
var playState = 0;
var vidClicked = false;
var instructionsin = false;
var enoughwithinstructions = false;


var _curtime = 0;
var _seektime = 0;
var _inseek = false;
var _trackingon = false;

var lazywidth = 0;

var openIvl = new Number();
var sidetracker = new Object(); // tracking element to get the visualisation later

var _transitiontimer = new Number();
var _transitiontimerIvl = new Number();

function map(i, sStart, sEnd, tStart, tEnd)
{
    var v = i-sStart;
    if (v>=0) {
        if (i < sStart) {
            return tStart;
        } else if (i > sEnd) {
            return tEnd;
        }
    } else {
        if (i > sStart) {
            return tStart;
        } else if (i < sEnd){
            return tEnd;
        }
    }
    var sRange = sEnd - sStart;
    if (sRange == 0) {
        return tStart;
    }

    var tMax = tEnd - tStart;
    return tStart + v / sRange * tMax;
}


$(document).ready(function() {

  if(navigator.userAgent.indexOf('WebKit') == -1 && navigator.userAgent.indexOf('Firefox') == -1){
     $('body:first').append('<div id="browserno" style="display: none;"><div class="padded">Sorry, this experiment is only currently working in Google Chrome, Apple\'s Safari and Firefox. Other browsers may encounter problems.  We apologize for the inconvenience.</div></div>');
     $("#browserno").slideDown();
  }

  //lazywidth = $("#outerouter").width();
  lazyYtop = $("#periphery_top").height();
  lazyHeight = $("#outerouter").height();
  lazyYbottom = lazyYtop + lazyHeight;
  console.log("lazyHeight: " + lazyHeight);
  console.log("lazyYtop: "+ lazyYtop);
  console.log("lazyYbottom: "+ lazyYbottom);



  //load audio
  if(window.location.href.indexOf("noaudio") != -1) {
    dontannoysam = true;
  }

  if(!dontannoysam && !_ammobile) {
    //$('body:first').append('<div id="audiodiv" style="display:none"><audio src="../audio/ambiance.mp3" type="audio/mpeg" loop id="ambientaudio"></audio></div>');
    //document.getElementById('ambientaudio').addEventListener('canplaythrough', audioready);
    $('body:first').append('div id="audio1" style="display:none"><audio src="https://s3.amazonaws.com/empireproject/PERIPHERY+NORM_WEB_1-2_AIFF.mp3" type="audio/mpeg" id="audio_norm"></audio></div>');
    $('body:first').append('div id="audio2" style="display:none"><audio src="https://s3.amazonaws.com/empireproject/PERIPHERY+YETI_WEB_1-2_AIFF.mp3" type="audio/mpeg" id="audio_yeti"></audio></div>');
  }

  periphery_sizer();

  $(document).scrollsnap({
    snaps: '.snap',
    proximity: 180,
    handler: periphery_scrollsnaphandle
  });
  currentvideoid = 'target';
  document.getElementById("target").addEventListener("canplay",function(){vid1Loaded = true; },true);
  //document.getElementById("video2").addEventListener("canplay",function(){vid2Loaded = true; },true);
  document.getElementById("target").addEventListener("ended",function(){ endVids();},true);
  document.getElementById("target").addEventListener("timeupdate",function(){scrubberUpdater();},true);
  
  //currentvideoid = 'video1';
  // document.getElementById("video1").addEventListener("canplay",function(){vid1Loaded = true; },true);
  // //document.getElementById("video2").addEventListener("canplay",function(){vid2Loaded = true; },true);
  // document.getElementById("video1").addEventListener("ended",function(){ endVids();},true);
  // document.getElementById("video1").addEventListener("timeupdate",function(){scrubberUpdater();},true);
 
  if(vidClicked) {
    trackMouseY();
  }

  enablecontrols();

  $(document).keydown(function (e) {
    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (key == 32) {
      e.preventDefault();
      if(playState == 1 || playState == 2){

        playButton();

      }
    }
  });

$("#playElement").click(function() {
  playButton();
  }).mouseover(function() {
  if(playState == 1){
    $("#playElement").css({'background':'url(art/pauseWhite.png)'})
    } else {        
     $("#playElement").css({'background':'url(art/playWhite.png)'})
    }
  }).mouseout(function() {
    if(playState == 1){
      $("#playElement").css({'background':'url(art/playWhite.png)'})
    } else {        
      $("#playElement").css({'background':'url(art/pauseGray.png)'})
    }
  });

periphery_openscreen();

});

function playhandler () {
  playState = 1;
  periphery_closescreen();
  document.getElementById("mobileisgreat").controls = false;
  if(!_controls){
    enablecontrols();
  }
}

function enablecontrols () {

  _controls = true;

  // if(_ammobile){
  //   trackon();  
  // } else {
    $("#outerouter").mouseenter(function () {
      if(vidClicked) {
        trackMouseY();
      } else {
        console.log("not tracking mouse Y");
      }
      //trackon();
      //trackMouseY();
      console.log('mouseenter');
    });

    $("#outerouter").mousemove(function () {
      if(vidClicked) {
        trackMouseY();
      } else {
        console.log("not tracking mouse Y");
      }
      //trackon();
      //trackMouseY();
      console.log('mousemove');
    });


    $("#outerouter").mouseleave(function () {
      //trackMouseY();
      trackoff();
      if(flipangle < 90) {
        flipangle = 0;

        //set yeti volume to 0, norm to 1
      document.getElementById("audio_norm").volume = 1;
      document.getElementById("audio_yeti").volume = 0;

      } else {
        flipangle = 180;
      //set yeti volume to 1, norm to 0
      document.getElementById("audio_norm").volume = 0;
      document.getElementById("audio_yeti").volume = 1;
      }
      $("#card").css({ '-webkit-transform': 'rotate( ' + flipangle + 'deg)', 'transform': 'rotate( ' + flipangle + 'deg)' });

      console.log('mouseleave');
    }); 
  // }
  
  $("#leftbutton").click(function () {
    if(flipside){
      // flipper(true);
    }
  });
  $("#rightbutton").click(function () {
    if(!flipside){
      // flipper(false);
    }
  });

}

function disablecontrols () {
  $("#outerouter").unbind("mouseenter");
  $("#outerouter").unbind("mouseleave");
  $("#leftbutton").unbind("click");
  $("#rightbutton").unbind("click");
  _controls = false;
}


function periphery_scrollsnaphandle () {
  if(playState == 0 && $(this).attr('id') == "periphery_main"){
    if(!enoughwithinstructions){
      // if(!_ammobile){
      //   playDecide();
      // }
      periphery_openscreen();
    }
  }
}

$(window).resize(function () {
  periphery_sizer();
  lazywidth = $("#outerouter").width();
  var marginsize = (lazywidth - 960) / 2;
  leftpoint = marginsize + 180;
  rightpoint = (lazywidth - marginsize) - 180;
});

function periphery_openscreen () {
  $("#instructions").fadeIn(2000);
   if(_ammobile){
     $("#ptitle").show();
     $("#instructions").css({ 'pointer-events':'none' });
   } else {
    openIvl = setTimeout("periphery_closescreen()",10000);
  }
  // $("#instructions").click(function () { if(!_ammobile){ playDecide() } periphery_closescreen(); });
  openIvl = setTimeout("periphery_closescreen()",10000);
  enoughwithinstructions = true;
}

function periphery_closescreen () {
  clearInterval(openIvl);
  $("#instructions").fadeOut(1000);
}

function periphery_sizer () {

  var matop = ($("#periphery_top").height() / 2) - 260; // top of the matrix
  var padtop = 84; // top of the main title
  var legbottom = 60; //offset of the bottom play button on the open screen
  
  // if($("#periphery_top").height() < 780){ // if this a wee screen
  //   padtop = 10;
  //   matop = 120;
  //   legbottom = 20;
  // }

  $("#outerouter").css({ 'padding-top': (($("#periphery_top").height() / 2) - ($("#outerinner").height() / 2)) });
  
  $("#periphery_bottom").css("height",$("#periphery_top").height());

  $('#periphery_line').css({ 'top': matop, 'height': ($("#periphery_top").height() - matop), 'left': (($("#periphery_top").width() / 2) + 140) });
  $("#periphery_linewhite").css({ 'height': $("#periphery_main").height(), 'left': (($("#periphery_top").width() / 2) - 7) });
  $('#periphery_bottomline').css({ 'top': 0, 'height': ($("#periphery_bottom").height() - 160), 'left': (($("#periphery_top").width() / 2) - 7) });
  
  $("#periphery_title").css({ 'padding-top': padtop });

  $("#periphery_structure").css({ 'margin-top': matop, 'left': (($("#periphery_top").width() / 2) - 370) });
  $("#pbottom_structure").css({ 'margin-top': ((($("#periphery_bottom").height() - 160) / 2) - 235), 'left': (($("#periphery_top").width() / 2) - 465) - 5 });

  $("#legmore").css({ "margin-left": ($("#periphery_main").width() / 2) - 70 });

  $("#peripheryplay").css({ "bottom": legbottom, "margin-left": ($("#periphery_top").width() / 2) - 70 }).fadeIn(4000).click(function () {    $('html, body').animate({ scrollTop: ($('#periphery_main').offset().top - 20) }, 1000);

    periphery_openscreen();
  });
}

function trackMouseY() {
  _trackingon = true;
  $(document).mousemove(function(e) {
    if(!flipblock) {
      var y = e.pageY;
      console.log(y);
      var buffer = 0;
      
      var audioLevelNorm, audioLevelYeti;
      audioLevelNorm = map(y, lazyYtop, lazyYbottom, 1, 0);
      audioLevelYeti = map(y, lazyYtop, lazyYbottom, 0, 1);
      
      if(flipside){

        flipangle = map(y, lazyYtop + buffer, lazyYbottom - buffer, 180, 0);  
      }
      else{
       flipangle = map(y, lazyYtop + buffer, lazyYbottom - buffer, 0, 180);   
      }
       // console.log("flip angle: " + flipangle + " , flipped :" + flipside) ;

      document.getElementById("audio_norm").volume = audioLevelNorm;
      document.getElementById("audio_yeti").volume = audioLevelYeti;

      $("#card").css({ '-webkit-transform': 'rotate( ' + flipangle + 'deg)', 'transform': 'rotate( ' + flipangle + 'deg)' });
    }
  });
}

function flipper (isDown){
  console.log('flipper isDown = ' + isDown + '; isUp = ' + flipside);
  if(flipside){   
    flipside = false;
    // flipangle = 0;
    $("#leftbutton").removeClass('buttonon').addClass('buttonoff');
    $("#rightbutton").removeClass('buttonoff').addClass('buttonon');
    // document.getElementById("audio_norm").volume = 1;
    // document.getElementById("audio_yeti").volume = 0;


  } else {
    flipside = true;
    // flipangle = 180;
    $("#rightbutton").removeClass('buttonon').addClass('buttonoff');
    $("#leftbutton").removeClass('buttonoff').addClass('buttonon');
    // document.getElementById("audio_norm").volume = 0;
    // document.getElementById("audio_yeti").volume = 1;

    //$audio.animation({volume:newvolume}, 1000);

  }
  // $("#card").css({ '-webkit-transform': 'rotate( ' + flipangle + 'deg)', 'transform': 'rotate( ' + flipangle + 'deg)' });
  
  //set volume accordingly

  // log that they did this
  if(ga){
    var mobilereport = (_ammobile)? 'mobile':'desktop';
    ga('send', 'event', 'cradle', 'flip', mobilereport, _curtime);
  }
}

function trackoff () {
//  console.log('trackoff');
_trackingon = false;
  $(document).unbind("swipeleft");
  $(document).unbind("swiperight");
  $(document).unbind('mousemove');
  $(document).unbind('mouseenter');
$(document).unbind('mouseleave');  
}

function trackon () {
  _trackingon = true;
  $(document).mousemove(function(e){
    if(!flipblock){
      var y = e.pageY;
      if(y < ( lazyYbottom - (lazyHeight/2) ) ){
        if(flipside){
          flipper(false);
        }
      } else {
        if(!flipside){
          flipper(true);
        }
      }
    }       
  });
  if(_ammobile){
    $(document).swipeleft(function () {
      if(flipside){
        flipper(false);
      }
    });
    $(document).swiperight(function () {
      if(!flipside){
        flipper(true);
      }
    });
  }
}

function playButton(){
  console.log('playbutton');
  console.log('playState = ' + playState);
  vidClicked = true;

  if(playState == 1){
    pauseVids();
    playState = 2;
    $("#playElement").css({'background':'url(art/pauseGray.png)'})
  }
  else if(playState == 2){
    playVids();
    playState = 1;
    $("#playElement").css({'background':'url(art/playWhite.png)'})
  }
  else {
      //changing id to "target" from "video1"
      document.getElementById("target").currentTime = 0;
      //document.getElementById("video1").currentTime = 0;
      
      //document.getElementById("video2").currentTime = 0;
    playVids();
    $("#playElement").css({'background':'url(art/playWhite.png)'})
    playState = 1;        
  }
}

function playVids(){
  if(audioactive){
    audiostop();
  }
    //changing id to "target" from "video1"
    document.getElementById("target").play();
    document.getElementById("target").volume = 0;

    // document.getElementById("video1").play();
    // document.getElementById("video1").volume = 0;

    //document.getElementById("video2").play();
    //document.getElementById("video2").volume = 0;
    playAudio();
  
}

function playAudio() {
    document.getElementById("audio_norm").play();
    document.getElementById("audio_yeti").play();

    //is this the best place to set yeti audio?
    document.getElementById("audio_yeti").volume = 0;

}

function pauseVids(){

    //changing id to "target" from "video1"
    document.getElementById("target").pause();

    //document.getElementById("video1").pause();
    document.getElementById("audio_norm").pause();
    document.getElementById("audio_yeti").pause();

    //document.getElementById("video2").pause();

  playState = 2;
}

function endVids(){
  playState = 3;
  buildendscreen();
}

function scrubberUpdater (){

  var dur = Math.floor(document.getElementById(currentvideoid).currentTime);
  if(dur > 0){
    var ratio = (document.getElementById(currentvideoid).duration / dur);
  }
  
  _curtime = document.getElementById(currentvideoid).currentTime;

  $("#progress").css({ "width": (640 / ratio) + 'px' });
  sidetracker[Math.floor(document.getElementById(currentvideoid).currentTime)] = flipside;
  
  // if(_ammobile && dur > 0){
  //   mobile_stills(dur);

  //   if(_inseek){
  //     flipmobile(true);
  //   }
  // }
  
  
}


