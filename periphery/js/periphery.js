var rotate = 0;
var pcard = document.getElementById('pcard');
var p_curtime = 0;
var _seektime = 0;
var p_flipside = false;
var p_leftside = false;
var p_flipangle = 0;
var p_flipblock = false;
var p_controls = false;
var p_vidLoaded = false;
//var vid2Loaded = false;
var p_playState = 0;
var p_vidClicked = false;
var instructionsin = false;
var enoughwithinstructions = false;
var pbottom;

//these were declared in empirecore.js, now cradle.js doesn't know about that
var audioactive = false;
var _ammobile = false;
var dontannoysam = false;

var audioLevelNorm, audioLevelYeti;

var p_inseek = false;
var p_trackingon = false;

var plazywidth = 0;

var openIvl = new Number();
var sidetracker = new Object(); // tracking element to get the visualisation later

var _transitiontimer = new Number();
var _transitiontimerIvl = new Number();

var audioTrackCurrentPosition = 0;
// var audioTrackYetiCurrentPosition = 0;
var videoTrackCurrentPosition = 0;

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
        if (i < sStart) {
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
     $('body:first').append('<div id="browserno" style="display: none;"><div class="padded">Sorry, this experiment is only currently working in Google Chrome or Apple\'s Safari browser. Other browsers may encounter problems.  We apologize for the inconvenience.</div></div>');
     $("#browserno").slideDown();
  }

  //plazywidth = $("#p_outerouter").width();
  lazyYtop = $("#periphery_top").height();
  lazyHeight = $("#p_outerouter").height();
  lazyYbottom = lazyYtop + lazyHeight;
  // console.log("lazyHeight: " + lazyHeight);
  // console.log("lazyYtop: "+ lazyYtop);
  // console.log("lazyYbottom: "+ lazyYbottom);
  //console.log("Im in ready ");
  w = $("#container").width();
  h = $("#container").height();
  //paper = ScaleRaphael('p_menubottom', w, h);

  //load audio
  if(window.location.href.indexOf("noaudio") != -1) {
    dontannoysam = true;
  }

  if(!dontannoysam && !_ammobile) {
    //$('body:first').append('<div id="audiodiv" style="display:none"><audio src="../audio/ambiance.mp3" type="audio/mpeg" loop id="ambientaudio"></audio></div>');
    //document.getElementById('ambientaudio').addEventListener('canplaythrough', audioready);
    $('body:first').append('<div id="audio1" style="display:none"><audio src="https://s3.amazonaws.com/empireproject/PERIPHERY+NORM_WEB_1-2_AIFF.mp3" type="audio/mpeg" id="audio_norm"></audio></div>');
    $('body:first').append('<div id="audio2" style="display:none"><audio src="https://s3.amazonaws.com/empireproject/PERIPHERY+YETI_WEB_1-2_AIFF.mp3" type="audio/mpeg" id="audio_yeti"></audio></div>');
  }

  periphery_sizer();

  $(document).scrollsnap({
    snaps: '.snap',
    proximity: 180,
    handler: periphery_scrollsnaphandle
  });

  currentvideoid = 'target';
  document.getElementById("target").addEventListener("canplay",function(){p_vidLoaded = true; },true);
  //document.getElementById("video2").addEventListener("canplay",function(){vid2Loaded = true; },true);
  document.getElementById("target").addEventListener("ended",function(){ p_endVids();},true);
  document.getElementById("target").addEventListener("timeupdate",function(){p_scrubberUpdater();},true);
  
  //currentvideoid = 'video1';
  // document.getElementById("video1").addEventListener("canplay",function(){vid1Loaded = true; },true);
  // //document.getElementById("video2").addEventListener("canplay",function(){vid2Loaded = true; },true);
  // document.getElementById("video1").addEventListener("ended",function(){ endVids();},true);
  // document.getElementById("video1").addEventListener("timeupdate",function(){scrubberUpdater();},true);
 
  // if(p_vidClicked) {
    //trackMouseY();
    p_enablecontrols();
  // }
  //console.log("p_vidClicked = " + p_vidClicked);


  // var phome_bottom = document.getElementById("home_button_pbottom");
  // $("#home_button_pbottom").on('click', function() {
  //   console.log("go home");
  //   animateHome();
  //   p_pauseVids();
  //   document.getElementById("target").currentTime = 0;
  // });

  $(document).on('keydown', function (e) {
    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (key == 32) {
      e.preventDefault();
      if(p_playState == 1 || p_playState == 2){

        p_playButton();
        //console.log("p_playButton(); event");

      }
    }
  });

$("#p_playElement").on('click', function() {
  //console.log("Playing videos");
  p_playButton();
  }).on('mouseover', function() {
  if(p_playState == 1){
    $("#p_playElement").css({'background':'url(/periphery/art/pauseWhite.png)'})
    } else {        
     $("#p_playElement").css({'background':'url(/periphery/art/playWhite.png)'})
    }
  }).on('mouseout', function() {
    if(p_playState == 1){
      $("#p_playElement").css({'background':'url(/periphery/art/playWhite.png)'})
    } else {        
      $("#p_playElement").css({'background':'url(/periphery/art/pauseGray.png)'})
    }
  });

$("#p_refresh").on('click', function() {
  p_restartVids();
})

periphery_openscreen();

});

function p_playhandler () {
  p_playState = 1;
  console.log("p_playhandler p_playState: "+ p_playState);
  periphery_closescreen();
  document.getElementById("mobileisgreat").controls = false;
  if(!p_controls){
    p_enablecontrols();
  }
}

function p_enablecontrols () {

  p_controls = true;

  // if(_ammobile){
  //   trackon();  
  // } else {
    //console.log('periphery bbbbbzzz');
    $("#p_outerouter").on('mouseenter', function () {
      if(p_vidClicked) {
        trackMouseY();
      } else {
        //console.log("not tracking mouse Y");
      }
      //console.log('mouseenter');
    });

    $("#p_outerouter").on('mousemove', function () {
      if(p_vidClicked) {
        trackMouseY();
      } else {
        //console.log("not tracking mouse Y");
      }
      //console.log('mousemove');
    });


    $("#p_outerouter").on('mouseleave', function () {
      if(p_flipangle < 90) {
        //console.log("less than 90");
        //p_flipangle = 0;
        //set yeti volume to 0, norm to 1
      document.getElementById("target").volume = 1;
      document.getElementById("audio_yeti").volume = 0;

      } else if (p_flipangle > 90 ) {
        // console.log("greater than 90");
        //p_flipangle = 180;
      //set yeti volume to 1, norm to 0
      document.getElementById("target").volume = 0;
      document.getElementById("audio_yeti").volume = 1;
      }
      // $("#pcard").css({ '-webkit-transform': 'rotate( ' + p_flipangle + 'deg)', 'transform': 'rotate( ' + p_flipangle + 'deg)' });
      trackoff();
      //console.log('mouseleave');
    }); 
  // }
  
  $("#leftbutton").on('click', function () {
    if(p_flipside){
      // flipper(true);
    }
  });
  $("#rightbutton").on('click', function () {
    if(!p_flipside){
      // flipper(false);
    }
  });

}

function p_disablecontrols () {
  $("#p_outerouter").unbind("mouseenter");
  $("#p_outerouter").unbind("mouseleave");
  $("#leftbutton").unbind("click");
  $("#rightbutton").unbind("click");
  p_controls = false;
}


function periphery_scrollsnaphandle () {
  if(p_playState == 0 && $(this).attr('id') == "periphery_main"){
    if(!enoughwithinstructions){
      if(!_ammobile){
        p_playDecide();
      }
      else{
        console.log("MOBILE");
      }
      periphery_openscreen();
    }
  }
}

$(window).resize(function () {
  periphery_sizer();
  plazywidth = $("#p_outerouter").width();
  var marginsize = (plazywidth - 960) / 2;
  leftpoint = marginsize + 180;
  rightpoint = (plazywidth - marginsize) - 180;
});

function periphery_openscreen () {
  $("#p_instructions").fadeIn(2000);
   if(_ammobile){
     $("#ptitle").show();
     $("#p_instructions").css({ 'pointer-events':'none' });
   } else {
    openIvl = setTimeout("periphery_closescreen()",10000);
  }
  $("#p_instructions").on('click', function () { 
    if(!_ammobile){ 
      p_playDecide();
    } 
    periphery_closescreen(); 
  });
  openIvl = setTimeout("periphery_closescreen()",10000);
  enoughwithinstructions = true;
}

function periphery_closescreen () {
  clearInterval(openIvl);
  $("#p_instructions").fadeOut(1000, function() {
      //console.log("close p_instructions");
  });
}

function periphery_sizer () {

  // var matop = ($("#periphery_top").height() / 2) - 320; // top of the matrix
  var matop = 0;
  var padtop = 10; // top of the main title
  var legbottom = 60; //offset of the bottom play button on the open screen
  
  // if($("#periphery_top").height() < 780){ // if this a wee screen
  //   padtop = 10;
  //   matop = 120;
  //   legbottom = 20;
  // }

  $("#p_outerouter").css({ 'padding-top': (($("#periphery_top").height() / 2) - ($("#p_outerinner").height() / 2)) });
  
  $("#periphery_bottom").css("height",$("#periphery_top").height());

  $('#periphery_line').css({ 'top': matop, 'height': ($("#periphery_top").height() - matop), 'left': (($("#periphery_top").width() / 2) + 140) });
  $("#periphery_linewhite").css({ 'height': $("#periphery_main").height(), 'left': (($("#periphery_top").width() / 2) + 140) });
  $('#periphery_bottomline').css({ 'top': 0, 'height': ($("#periphery_bottom").height() - 100), 'left': (($("#periphery_top").width() / 2) + 140) });
  
  $("#periphery_title").css({ 'padding-top': padtop });

  $("#periphery_structure").css({ 'margin-top': matop, 'left': (($("#periphery_top").width() / 2) - 370) });
  $("#pbottom_structure").css({ 'margin-top': ((($("#periphery_bottom").height() - 160) / 2) - 330), 'left': (($("#periphery_top").width() / 2) - 465) - 5 });

  $("#legmore").css({ "margin-left": ($("#periphery_main").width() / 2) - 70 });

  $("#peripheryplay").css({ "bottom": legbottom, "margin-left": ($("#periphery_top").width() / 2) - 70 }).fadeIn(4000).click(function () {    
    $('html, body').animate({ scrollTop: ($('#periphery_main').offset().top) }, 1000);
    if(!_ammobile){
      p_playDecide();
    }
    periphery_openscreen();
  });

  $("#peripherymore").css({"bottom": legbottom, "margin-left": ($("#periphery_top").width() / 2) - 70 }).fadeIn(4000).click(function() {
    $('html, body').animate({scrollTop: ($('#periphery_main').offset().top) }, 1000);
  });
}

function trackMouseY() {
  p_trackingon = true;
  //console.log("periphery tracking is: " + p_trackingon);
  $(document).mousemove(function(e) {
    if(!p_flipblock) {
      var y = e.pageY;
      var x = e.pageX;
      //console.log(y);
      //console.log("leftside = " + leftside);
      //console.log("plazywidth = " + plazywidth);
      var buffer = 200;
      var newTop = lazyYtop + buffer;
      var newBottom = lazyYbottom - buffer;
      //console.log(y + ", " + newTop + ", " + newBottom);

      audioLevelNorm = map(y, newTop, newBottom, 1, 0);
      audioLevelYeti = map(y, newTop, newBottom, 0, 1);
      
      
      p_flipangle = map(y, newTop, newBottom, 0, 180);  
      

      if(p_flipangle > 0 && p_flipangle < 35) {
        p_flipangle = 0;
        // audioLevelNorm = 1.0;
        // audioLevelYeti = 0.0;
      }

      if(p_flipangle > 35 && p_flipangle < 55){
        p_flipangle = 45;
        // audioLevelNorm = 0.75;
        // audioLevelYeti = 0.25;
      }
      if(p_flipangle > 55 && p_flipangle < 125){
        p_flipangle = 90;
        // audioLevelNorm = 0.5;
        // audioLevelYeti = 0.5;

      }
      if(p_flipangle > 125 && p_flipangle < 145){
        p_flipangle = 135;
        // audioLevelNorm = 0.25;
        // audioLevelYeti = 0.75;
      }

      if(p_flipangle > 145 && p_flipangle < 180) {
        p_flipangle = 180;
        // audioLevelNorm = 0.0;
        // audioLevelYeti = 1.0;
      }

      // console.log("p flip angle: " + p_flipangle + " , p flipped :" + p_flipside) ;
      // console.log("audioLevelNorm: " + audioLevelNorm);
      // console.log("audioLevelYeti: " + audioLevelYeti);

      document.getElementById("audio_norm").volume = audioLevelNorm;
      document.getElementById("audio_yeti").volume = audioLevelYeti;

      $("#pcard").css({ '-webkit-transform': 'rotate( ' + p_flipangle + 'deg)', 'transform': 'rotate( ' + p_flipangle + 'deg)' });
    }
  });
}

function flipper (isDown){
  //console.log('flipper isDown = ' + isDown + '; isUp = ' + p_flipside);
  if(p_flipside){   
    p_flipside = false;
    // p_flipangle = 0;
    $("#leftbutton").removeClass('buttonon').addClass('buttonoff');
    $("#rightbutton").removeClass('buttonoff').addClass('buttonon');
    // document.getElementById("target").volume = 1;
    // document.getElementById("audio_yeti").volume = 0;


  } else {
    p_flipside = true;
    // p_flipangle = 180;
    $("#rightbutton").removeClass('buttonon').addClass('buttonoff');
    $("#leftbutton").removeClass('buttonoff').addClass('buttonon');
    // document.getElementById("tarrget").volume = 0;
    // document.getElementById("audio_yeti").volume = 1;

    //$audio.animation({volume:newvolume}, 1000);

  }
  // $("#pcard").css({ '-webkit-transform': 'rotate( ' + p_flipangle + 'deg)', 'transform': 'rotate( ' + p_flipangle + 'deg)' });
  
  //set volume accordingly

  // log that they did this
  // if(ga){
  //   var mobilereport = (_ammobile)? 'mobile':'desktop';
  //   ga('send', 'event', 'cradle', 'flip', mobilereport, p_curtime);
  // }
}

function trackoff () {
//  console.log('trackoff');
p_trackingon = false;
//p_vidClicked = false;
  $(document).unbind("swipeleft");
  $(document).unbind("swiperight");
  $(document).unbind('mousemove');
  $(document).unbind('mouseenter');
  $(document).unbind('mouseleave');  
}

// function trackon () {
//   _trackingon = true;
//   $(document).on('mousemove', function(e){
//     if(!p_flipblock){
//       var y = e.pageY;
//       if(y < ( lazyYbottom - (lazyHeight/2) ) ){
//         if(p_flipside){
//           flipper(false);
//         }
//       } else {
//         if(!p_flipside){
//           flipper(true);
//         }
//       }
//     }       
//   });
//   if(_ammobile){
//     $(document).swipeleft(function () {
//       if(p_flipside){
//         flipper(false);
//       }
//     });
//     $(document).swiperight(function () {
//       if(!p_flipside){
//         flipper(true);
//       }
//     });
//   }
// }

function p_playDecide(){
//  document.getElementById("video2").volume = 0;
    //console.log("Playing periphery videos");
  if(p_vidLoaded){
    p_playVids();

    p_playState = 1;
    console.log("p_playDecide p_playState: "+ p_playState);
    p_vidClicked = true;
    console.log("p_playDecide p_vidClicked: "+ p_vidClicked);
  } else {
    //console.log("Not Playing videos");
    setTimeout("p_playDecide()",800);
  }
}

function p_restartVids() {
  p_playState = 1;
  console.log("p_restartVids p_playState: "+ p_playState);
  document.getElementById("target").currentTime = 0;
  document.getElementById("target").volume = 0;
  document.getElementById("audio_norm").currentTime = 0;
  document.getElementById("audio_yeti").currentTime = 0;
  document.getElementById("target").play();
  document.getElementById("audio_norm").play();
  document.getElementById("audio_yeti").play();
}

function p_playButton(){
  //console.log('p_playbutton');
  console.log('initial p_playState = ' + p_playState);
  p_vidClicked = true;
  console.log("p_playButton p_vidClicked: " + p_vidClicked);
  if(p_playState === 1){
    p_pauseVids();
    p_playState = 2;
    console.log('p_playButton if p_play === 1: '+ p_playState);

    $("#p_playElement").css({'background':'url(art/pauseGray.png)'})
  }
  else if(p_playState === 2){
    p_playVids();
    p_playState = 1;
    console.log('p_playButton if p_play === 2: '+ p_playState);
    $("#p_playElement").css({'background':'url(art/playWhite.png)'})
  }
  else {
      //changing id to "target" from "video1"
      document.getElementById("target").currentTime = 0;
      //document.getElementById("video1").currentTime = 0;
      
      //document.getElementById("video2").currentTime = 0;
    p_playVids();
    $("#p_playElement").css({'background':'url(art/playWhite.png)'})
    p_playState = 1; 
    console.log('p_playButton if p_play !1 or 2: '+ p_playState);
       
  }

  console.log("*********************");
}

function p_playVids(){
  if(audioactive){
    audiostop();
  }
   
  // if(videoTrackCurrentPosition > 0){
      document.getElementById("target").currentTime = videoTrackCurrentPosition ;
      document.getElementById("target").play();
      document.getElementById("target").volume = 0;
  // }
  // else{
  //     document.getElementById("target").play();
  // }



    p_vidClicked = true;
    console.log("playVids p_vidClicked = " + p_vidClicked);
    p_playAudio();
  
}

function p_playAudio() {
  // console.log("Norm Tack Pos : "+audioTrackNormCurrentPosition+" Yeti Track Pos : "+ audioTrackYetiCurrentPosition);
    document.getElementById("audio_norm").currentTime = audioTrackCurrentPosition ;
    document.getElementById("audio_yeti").currentTime = audioTrackCurrentPosition ;
    document.getElementById("audio_norm").play();
    document.getElementById("audio_yeti").play();

    //is this the best place to set yeti audio?
    document.getElementById("audio_yeti").volume = audioLevelYeti;
    document.getElementById("audio_norm").volume = audioLevelNorm;

}

function p_pauseVids(){

    // document.getElementById("audio_yeti").pause();
     // currentTime =  document.getElementById("audio_yeti").currentTime ;
     audioTrackCurrentPosition = document.getElementById("audio_norm").currentTime  ;
     // audioTrackCurrentPosition = document.getElementById("audio_yeti").currentTime ;
     videoTrackCurrentPosition  = document.getElementById("target").currentTime;
    // audiostop();

    document.getElementById("audio_yeti").pause();
    document.getElementById("target").pause();
    document.getElementById("audio_norm").pause();

  // p_playState = 2;
  // console.log("p_pauseVids p_playState: " + p_playState);
}

function p_endVids(){
  p_playState = 3;
  console.log("p_endVids p_playState: " + p_playState);
  p_buildendscreen();
}

function p_scrubberUpdater (){

  var dur = Math.floor(document.getElementById(currentvideoid).currentTime);
  if(dur > 0){
    var ratio = (document.getElementById(currentvideoid).duration / dur);
  }
  
  p_curtime = document.getElementById(currentvideoid).currentTime;

  $("#progress").css({ "width": (640 / ratio) + 'px' });
  sidetracker[Math.floor(document.getElementById(currentvideoid).currentTime)] = p_flipside;
  
  // if(_ammobile && dur > 0){
  //   mobile_stills(dur);

  //   if(p_inseek){
  //     flipmobile(true);
  //   }
  // }
  
  
}

function p_buildendscreen () {
  $("#p_container").hide();
  $("#pcontrols").hide();
  $("#p_endscreen").fadeIn();
  
  $("#plegmore").fadeIn();
  
  if(_ammobile){
    trackoff();
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
  //  var mobilereport = (_ammobile)? 'mobile':'desktop';
  //  ga('send', 'event', 'cradle', 'endscreen', mobilereport);
  // }

  
  $("#people_data").html(outputstring);
  
  // click on the overlay, party's over
  $("#person_overlay").click(function () {
    sidetracker = {};
    $("#p_endscreen").fadeOut();
    $("#plegmore").fadeOut();
    

    if(_ammobile){
      document.getElementById("mobileisgreat").currentTime = 0;
    } else {
      document.getElementById("video1").currentTime = 0;
      document.getElementById("video2").currentTime = 0;
    }


    $("#p_container").fadeIn();
    $("#pcontrols").fadeIn();

    playVids();

    $("#p_playElement").css({'background':'url(/cradle/art/playWhite.png)'})
    c_playState = 1;  
    console.log("p_buildendscreen p_playState: " + p_playState);          
  });
}


