//var ROOT_URL = 'http://localhost:8080/'
var ROOT_URL = 'http://vmlfbval.appspot.com';
var VALENTINE = '';
var MESSAGE = '';
var DEBUG = false;
var NO_LIKES = false;

var LIKE_DELAY = 750;
var FADEIN_DELAY = 200;
var NO_LIKE_DEALY = 5000;

var TEST;

window.fbAsyncInit = function() {
    FB.init({
      appId      : '374030012622491', // App ID
      channelUrl : 'http://vmlfbval.appspot.com/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true,  // parse XFBML
      oauth      : true
    });

    FB.Event.subscribe('auth.statusChange', fbLoginStatus);
};

(function(d){
    var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    d.getElementsByTagName('head')[0].appendChild(js);
}(document));

$(document).ready(function(){
    //setup button listeners
    $('.facebook-continue').click(function(){showHide('#message', '#result');});
    $('.menu li').click(function(){
        $this = $(this);
        MESSAGE = $('span', $this).text();
        contactValentine();
    });

    if(document.location.href.split('?').length > 1 && document.location.href.split('?')[1].match('Gsj7pMbMpSQ')){TEST = true;}

    if(!DEBUG){
        $('#loader').hide();
        $('#result').hide();
        $('#message').hide();
        $('#happy').hide();

        $('body').css('overflow-x', 'hidden');
    }

    var audioElement = document.createElement('audio');
    if(audioElement.canPlayType('audio/mpeg') == 'maybe' || audioElement.canPlayType('audio/mpeg') == 'probably'){
        $audioElement = $(audioElement);

        $audioElement.attr({
            'volume': '.5',
            'autoplay':'autoplay',
            'src':TEST?'sound/test.mp3':'sound/amour.mp3',
            'type':'audio/mpeg'
        });

        $('#audio-controls .mute').hide();

        $('#audio-controls').click(function(){
            if(audioElement.paused){
                $('#audio-controls .mute').hide();
                $('#audio-controls .unmute').show();
                audioElement.play();
            } else {
                $('#audio-controls .mute').show();
                $('#audio-controls .unmute').hide();
                audioElement.pause();
            }
        });

        audioElement.addEventListener('ended', function(){
            console.log('audio ended')
            audioElement.src = TEST?'sound/test.mp3':'sound/amour.mp3';
            audioElement.play();
        });


        $('body').append(audioElement);
    } else {
        $('#audio-controls').hide();
    }
});

function fbLoginStatus(response) {
    if (response.authResponse) {
        console.log("user is already logged in and connected");
        $('.fb-login-button').hide();
        $('.facebook-connect').click(function(){ countLikes() });
        $('.facebook-connect').show()
    }
}

function countLikes() {
    console.log('countLikes()')
    showLoader();

    var user_id_counts = {};
    var highestCount = 0;
    var topLikers = [];
	
	FB.api(
    {
        method: 'fql.query',
        query: 'SELECT uid FROM user WHERE uid IN (SELECT likes.friends FROM stream WHERE source_id = me() AND is_hidden = 0 AND created_time > 0 LIMIT 5000)'
    }, 
    function(myPosts) {
        console.log('countLikes() - callback')
        for(var i=0;i < myPosts.length;i++){
            if(user_id_counts.hasOwnProperty(myPosts[i].uid.toString())){
                //already has key, increment
                user_id_counts[myPosts[i].uid.toString()]++;
            } else{
                user_id_counts[myPosts[i].uid.toString()] = 1;
            }
            
            // also keep track of the current highest
            if(user_id_counts[myPosts[i].uid.toString()] > highestCount){  //new highest count
                    topLikers = [];
                    highestCount = user_id_counts[myPosts[i].uid.toString()];
                    topLikers.push(myPosts[i].uid.toString())
            } else if(user_id_counts[myPosts[i].uid.toString()] == highestCount){ //more than 1 person with this count
                    topLikers.push(myPosts[i].uid.toString());
            } 
        }
                
		FB.api(
		    {
		        method: 'fql.query',
		        query: 'SELECT uid, first_name, last_name, pic_big FROM user WHERE uid = ' + topLikers[0].toString()
		    },
		    function(data) {
		    	if(data.length != 0){
		    		var topName = data[0].first_name + ' '+ data[0].last_name + ' liked you ' + highestCount + ' time' + (highestCount > 1?'s':'');
		            var topPic = data[0].pic_big;
                    VALENTINE = data[0].uid;

                    setResult(topName, topPic);
		    	} else {
		    		var topName = "Yourself.";
                    $('.text').text('You seem to be the only one who likes your posts. (Well, at least you can give yourself a big old hug!)');
                    $('.facebook-continue').hide();
                    var topPic;
                    FB.api('/me/?fields=picture&type=large', function(response) {
                        console.log(response);
                        if(response && response.picture){
                            topPic = response.picture;
                        } else {
                            topPic = "img/test.jpg";
                        }

                        window.setTimeout(function(){showHide('#happy', '#result')}, LIKE_DELAY * $('#loader li').length + NO_LIKE_DEALY);
                        setResult(topName, topPic);
                    });
		    	}
		    	
		    	console.log(topName);
		    	
	        }
		)
	});
}

function setResult(_topName, _topPic){
    _topPic = TEST?'img/test.jpeg':_topPic;

    $('.name').text(_topName);
    if(!DEBUG){ 
        $('.frame img').attr('src', _topPic).bind('load', function(_e){
            $('#result').css(
                {
                    'visibility': 'hidden',
                    'position': 'absolute',
                    'display':'block'
                }
            );
            $target = $(_e.currentTarget);
            $target.css('margin-top', 110 - $target.outerHeight()/2);

            $('#result').css(
                {
                    'visibility': 'visible',
                    'position': 'relative',
                    'display':'none'
                }
            );
        });
    } else { //DEBUG ONLY
        $('.frame img').attr('src', topPic).bind('load', function(_e){
            $target = $(_e.currentTarget);
            $target.css('margin-top', 110 - $target.outerHeight()/2);
        });
    }
}

function showLoader(){
    showHide('#loader', '#welcome');

    var $loaderli = $('#loader li');
    $loaderli.each(function(_i, _this){
        $this = $(_this);
        $this.delay(LIKE_DELAY * _i).fadeIn(FADEIN_DELAY);

        if(_i == $loaderli.length-1){
            window.setTimeout(function(){showHide('#result', '#loader')}, LIKE_DELAY * $loaderli.length);
        }
    })
}

function contactValentine(){
    console.log('contactValentine()');
	FB.ui(
		{
			method:'send',
			to: VALENTINE,
			name: 'You\'re my Facebook Valentine!',
			link: ROOT_URL, //CHANGE!!!
            picture: ROOT_URL + 'img/app_icon.gif',
			description: MESSAGE
		},
        function(response) {
            if (response) {
                console.log('message send!');
                showHide('#happy', '#message');
            } else {
                console.log('message NOT send!');
            }
        }
	);			
}

function showHide(_show, _hide){
    console.log('showHide(' + _show + ', ' + _hide + ')');
    if(!DEBUG){
        $(_hide).hide();
        $(_show).fadeIn(FADEIN_DELAY); 
    }
}