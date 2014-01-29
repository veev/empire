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

$(document).ready(function() {

  if(navigator.userAgent.indexOf('WebKit') == -1 && navigator.userAgent.indexOf('Firefox') == -1){
     $('body:first').append('<div id="browserno" style="display: none;"><div class="padded">Sorry, this experiment is only currently working in Google Chrome, Apple\'s Safari and Firefox. Other browsers may encounter problems.  We apologize for the inconvenience.</div></div>');
     $("#browserno").slideDown();
  }

  lazywidth = $("#outerouter").width();

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

  currentvideoid = 'video1';
  document.getElementById("video1").addEventListener("canplay",function(){vid1Loaded = true; },true);
  //document.getElementById("video2").addEventListener("canplay",function(){vid2Loaded = true; },true);
  document.getElementById("video1").addEventListener("ended",function(){ endVids();},true);
  document.getElementById("video1").addEventListener("timeupdate",function(){scrubberUpdater();},true);
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

  if(_ammobile){
    trackon();  
  } else {
    $("#outerouter").mouseenter(function () {
      trackon();
      console.log('mouseenter');
    });

    $("#outerouter").mouseleave(function () {
      trackoff();
      console.log('mouseleave');
    }); 
  }
  
  $("#leftbutton").click(function () {
    if(flipside){
      flipper();
    }
  });
  $("#rightbutton").click(function () {
    if(!flipside){
      flipper();
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
  $("#instructions").click(function () { if(!_ammobile){ playDecide() } periphery_closescreen(); });
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

function trackon () {
  _trackingon = true;
  $(document).mousemove(function(e){
    if(!flipblock){
      var x = e.pageX;
      if(x < (lazywidth / 2)){
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

function trackoff () {
//  console.log('trackoff');
_trackingon = false;
  $(document).unbind("swipeleft");
  $(document).unbind("swiperight");
  $(document).unbind('mousemove');
}

function fadeSoundtrack()
{

}


function rotateVideo()
{
    _seektime = _curtime;
    _transitiontimer = 0;
    _transitiontimerIvl = setInterval(function () { _transitiontimer++ }, 200);

    if(flipside){   
    flipside = false;
    flipangle = 0;

  } else {
    flipside = true;
    flipangle = 180;
  }
  $("#card").css({ '-webkit-transform': 'rotate( ' + flipangle + 'deg)', 'transform': 'rotate( ' + flipangle + 'deg)' });
}

function flipper (isDown){
  console.log('flipper isDown = ' + isDown + '; isUp = ' + flipside);
  if(flipside){   
    flipside = false;
    flipangle = 0;
    $("#leftbutton").removeClass('buttonon').addClass('buttonoff');
    $("#rightbutton").removeClass('buttonoff').addClass('buttonon');
    document.getElementById("audio_norm").volume = 1;
    document.getElementById("audio_yeti").volume = 0;


  } else {
    flipside = true;
    flipangle = 180;
    $("#rightbutton").removeClass('buttonon').addClass('buttonoff');
    $("#leftbutton").removeClass('buttonoff').addClass('buttonon');
    document.getElementById("audio_norm").volume = 0;
    document.getElementById("audio_yeti").volume = 1;

    //$audio.animation({volume:newvolume}, 1000);

  }
  $("#card").css({ '-webkit-transform': 'rotate( ' + flipangle + 'deg)', 'transform': 'rotate( ' + flipangle + 'deg)' });
  
  //set volume accordingly

  // log that they did this
  if(ga){
    var mobilereport = (_ammobile)? 'mobile':'desktop';
    ga('send', 'event', 'cradle', 'flip', mobilereport, _curtime);
  }
}

function playDecide(){
    if(vid1Loaded) {
    playVids();
    playState = 1;
  } else {
    setTimeout("playDecide()",800);
  }
}

function sounddown () {
  clearInterval(soundivl);
  soundivl = setInterval(function () {
    var thisvol = document.getElementById('mobileisgreat').volume - .2;
    document.getElementById('mobileisgreat').volume = thisvol;
    if(thisvol < .1){
      clearInterval(soundivl);
    }
  },50);
}

function soundup () {
  clearInterval(soundivl);
  soundivl = setInterval(function () {
    var thisvol = document.getElementById('mobileisgreat').volume + .2;
    if(thisvol > .5){
      clearInterval(soundivl);
      thisvol = .6;
    }
    document.getElementById('mobileisgreat').volume = thisvol;
  },50);
}

function scrubberUpdater (){

  var dur = Math.floor(document.getElementById(currentvideoid).currentTime);
  if(dur > 0){
    var ratio = (document.getElementById(currentvideoid).duration / dur);
  }
  
  _curtime = document.getElementById(currentvideoid).currentTime;

  $("#progress").css({ "width": (930 / ratio) + 'px' });
  sidetracker[Math.floor(document.getElementById(currentvideoid).currentTime)] = flipside;
  
  if(_ammobile && dur > 0){
    mobile_stills(dur);

    if(_inseek){
      flipmobile(true);
    }
  }
  
  
}

function playButton(){
//  console.log('playbutton');
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
  else{
    if(_ammobile){
        document.getElementById("mobileisgreat").currentTime = 0;

    } else {
    
      document.getElementById("video1").currentTime = 0;
      //document.getElementById("video2").currentTime = 0;
  
    }
    playVids();
    $("#playElement").css({'background':'url(art/playWhite.png)'})
    playState = 1;        
  }
}

function playVids(){
  if(audioactive){
    audiostop();
  }
  if(_ammobile){

    document.getElementById("mobileisgreat").play();

  } else {
  
    document.getElementById("video1").play();
    document.getElementById("video1").volume = 0;
    //document.getElementById("video2").play();
    //document.getElementById("video2").volume = 0;
    playAudio();
  }
}

function playAudio() {
    document.getElementById("audio_norm").play();
    document.getElementById("audio_yeti").play();
    document.getElementById("audio_yeti").volume = 0;

}

function pauseVids(){
  if(_ammobile){
    document.getElementById("mobileisgreat").pause();
  } else {
    document.getElementById("video1").pause();
    document.getElementById("audio_norm").pause();
    document.getElementById("audio_yeti").pause();

    //document.getElementById("video2").pause();
  }
  playState = 2;
}

function endVids(){
  playState = 3;
  buildendscreen();
}

function buildendscreen () {
  $("#container").hide();
  $("#controls").hide();
  $("#endscreen").fadeIn();
  
  $("#legmore").fadeIn();
  
  if(_ammobile){
    //trackoff();
  }
  
  // now the drawing
  
  var outputstring = new String();
  var nowtop = 0;
  var multiplier = 1.756;
  
  for(var x = 0; x < 446; x++){

    outputstring += '<div style="width: 445px; ';
    var rightnow = sidetracker[x];
    var accum = 1;
    while(sidetracker[x] == rightnow){
      accum++;
      x++;  
      if(x > 446){
        break;
      }
    }
    outputstring += 'height: ' + (accum * multiplier) + 'px';
    if(rightnow == false){
      outputstring += '; left: 445';
    }
    outputstring += '; top: ' + nowtop + '"></div>';
    nowtop = nowtop + (accum * multiplier);
  }
   
  // log that they got to the end here
  // if(ga){
  //   var mobilereport = (_ammobile)? 'mobile':'desktop';
  //   ga('send', 'event', 'cradle', 'endscreen', mobilereport);
  // }

  //$("#people_data").html(outputstring);
  
  // click on the overlay, party's over
  // $("#person_overlay").click(function () {
  //   sidetracker = {};
  //   $("#endscreen").fadeOut();
  //   $("#legmore").fadeOut();
    
  //   // if(_ammobile){
  //   //   document.getElementById("mobileisgreat").currentTime = 0;
  //   // } else {
  //   //   document.getElementById("video1").currentTime = 0;
  //   //   document.getElementById("video2").currentTime = 0;
  //   // }

  //   $("#container").fadeIn();
  //   $("#controls").fadeIn();

  //   playVids();

  //   $("#playElement").css({'background':'url(art/playWhite.png)'})
  //   playState = 1;            
  // });
}