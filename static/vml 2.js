/*  TODO

enable sound

different one each time if ties
1. figure out how to recall facebook API calls if they time out
1. check permissions
1. change facebook app settings to prod
2. change name of app
3. upload to Y&R
4. remove appspot references
5. make sure debug set false

    //try to get both filter_key others and filter_key owner   
        //don't use is_hidden
        //permissions   friends_likes     user_likes     offline_access    read_stream
    //http://stackoverflow.com/questions/3211037/get-users-facebook-likes-with-fql
*/

//var ROOT_URL = 'http://localhost:8080/'
//var ROOT_URL = 'http://vmlfbval.appspot.com';
var ROOT_URL = 'http://www.wholikelikesyou.com';
var VALENTINE = '';
var MESSAGE = '';
var DEBUG = false;
var DEBUG_LIKE_SCREEN = false;

var NO_LIKE_DEALY = 5000;
var LIKE_DELAY = 900;
var FADEIN_DELAY = 200;

var globalTimeout = 45000;


var TEST = false;
var MP3 = false;
var OGG = false;

var IMAGE_LOADED = false;
var LOADER_FINISHED = false;
var clickedFBLoginButton = false;
var TIMEDOUT = false;

// window.fbAsyncInit = function() {
//     FB.init({
//       appId      : '374030012622491', // App ID
//       channelUrl : window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/channel.html", // Channel File
//       status     : true, // check login status
//       cookie     : true, // enable cookies to allow the server to access the session
//       xfbml      : true,  // parse XFBML
//       oauth      : true
//     });
    
//     $('.fb-login-button').click(function(){
//         clickedFBLoginButton = true;
//     });
//     FB.Event.subscribe('auth.statusChange', fbLoginStatus);
// };

// (function(d){
//     var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
//     js = d.createElement('script'); js.id = id; js.async = true;
//     js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=237130333042289";
//     d.getElementsByTagName('head')[0].appendChild(js);
// }(document));

$(document).ready(function(){
    //setup button listeners
    $('.facebook-continue').click(function(){showHide('#message', '#result');});
    $('.facebook-nothanks').click(function(){showHide('#happy', '#result');});
    $('.menu li').click(function(){
        $this = $(this);
        MESSAGE = $('span', $this).text();
        contactValentine();
    });

    if(document.location.href.split('?').length > 1 && document.location.href.split('?')[1].match('timeout')){TIMEDOUT = true;}
    if(document.location.href.split('?').length > 1 && document.location.href.split('?')[1].match('Gsj7pMbMpSQ')){TEST = true;}

    if(!DEBUG){
        $('#loader').hide();
        $('#result').hide();
        $('#message').hide();
        $('#happy').hide();

        $('body').css('overflow-x', 'hidden');
    }
    
    if(navigator.appName != 'Microsoft Internet Explorer'){
        var audioElement = document.createElement('audio');
        if(audioElement.canPlayType('audio/mpeg') == 'maybe' || audioElement.canPlayType('audio/mpeg') == 'probably'){
            MP3 = true;
        } else if(audioElement.canPlayType('audio/ogg') == 'maybe' || audioElement.canPlayType('audio/ogg') == 'probably'){
            OGG = true;
        }
        if(OGG || MP3){
            $audioElement = $(audioElement);
            var _src;
            var _type;
            if(OGG){ _src = TEST?'sound/test.ogg':'sound/amour_final.ogg'; _type = 'audio/ogg';}
            else if(MP3){ _src = TEST?'sound/test.mp3':'sound/amour_final.mp3'; _type = 'audio/mpeg';}
            $audioElement.attr({
                'volume': '.5',
                'autoplay':'autoplay',
                'src': _src,
                'type': _type
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
                //console.log('audio ended')
                audioElement.src = TEST?'sound/test.mp3':'sound/amour_final.mp3';
                audioElement.play();
            });


            $('body').append(audioElement);
        } else {
            $('#audio-controls').hide();
        }
    } else {
        $('#audio-controls').hide();
    }
});

function onTimeout(){
    $('.fbText').text("Wow, post much? Our little search-bot is exhausted! Click refresh to try again.");
//    window.setTimeout(funtion() {
//            window.location.href = document.location.href+"?timeout";
//    }, 3000);
}

function fbLoginStatus(response) {
    //console.log("fbLoginStatus");
    if(TIMEDOUT){
        clickedFBLoginButton = true;
    }

    if(response.authResponse && clickedFBLoginButton){
        //console.log("user originally logged out, had to click FB login button to login");
        $('.fb-login-button').hide();
        countLikes();
    } else if (response.authResponse) {
        //console.log("user is already logged in and connected");
        $('.fb-login-button').hide();
        $('.welcome-continue').click(function(){ countLikes() });
        $('.welcome-continue').show()
    }
}

var user_id_counts = {};
var highestCount = 0;
var topLikers = [];
var postsWithLikes = 0;
var totalPostLikes = 0;


function addUserTrackHighest(uid){
    if(user_id_counts.hasOwnProperty(uid)){
        //already has key, increment
        user_id_counts[uid]++;
    } else{
        user_id_counts[uid] = 1;
    }
    
    // also keep track of the current highest
    if(user_id_counts[uid] > highestCount){  //new highest count
        topLikers = [];
        highestCount = user_id_counts[uid];
        topLikers.push(uid)
    } else if(user_id_counts[uid] == highestCount){ //more than 1 person with this count
        topLikers.push(uid);
    }     
}

function collateLikes(myPosts){
    var uid = "";
    //console.log("collateLikes: num of posts - " + myPosts.data.length);
    var likesArr = [];
    
    if(myPosts.data && myPosts.data.length > 0){
        for(var i=0;i<myPosts.data.length;i++){
            if(myPosts.data[i].likes && myPosts.data[i].likes.count > 0){
                postsWithLikes++;
                likesArr = myPosts.data[i].likes.data;
                
                for(var j=0;j<likesArr.length;j++){
                    totalPostLikes++;
                    uid = likesArr[j].id;
                    
                    addUserTrackHighest(uid);
                }
            }
        }
    }

    //console.log("collateLikes: num of posts with likes - " + postsWithLikes);
    //console.log("collateLikes: total likes - " + totalPostLikes);
}

function countAlbumLikes(){    
    //get likes for the album itself
     //console.log("countAlbumLikes()");
    FB.api(
        {
            method: 'fql.query',
            query: 'select user_id from like where object_id IN (select object_id from album WHERE owner=me() LIMIT 25)'
        },
        function(data) {
            //if(data && data.length > 0){
                                //console.log("countAlbumLikes(): " + data.length);
                ////console.log(data);
                for(var i=0;i<data.length;i++){
                    if(data[i].hasOwnProperty("user_id")){
                        addUserTrackHighest(data[i]["user_id"]);
                    }
                }
                
                countPhotoLikes();
            
            // } else {
            //     onTimeout();
            // }

        }
    );
}


function countPhotoLikes(){
    FB.api(
        {
            method: 'fql.query',
            query: 'select user_id, object_id from like where object_id in (select object_id from photo WHERE aid IN (select aid from album WHERE owner=me() LIMIT 15))'
        },
        function(data) {
            //if(data && data.length > 0){
                //console.log("countPhotoLikes(): " + data.length) ;
                ////console.log(data);
                for(var i=0;i<data.length;i++){
                    if(data[i].hasOwnProperty("user_id")){
                        addUserTrackHighest(data[i]["user_id"]);
                    }
                }
                
                //console.log("done");
                //console.log(topLikers);
                //console.log("highest: " + highestCount);
                ////console.log(user_id_counts);
                
                parseTopLikers();
            // } else {
            //     onTimeout();
            // }
        }
    );
}

function countPostLikes(){
    FB.api('/me/posts&limit=500', function(response) {
        //console.log("countPostLikes()");
        //if(response.data && response.data.length > 0){
            collateLikes(response);
            countAlbumLikes();
        // } else {
        //     onTimeout();
        // }
    });    
}

function countLikes() {
    //console.log('countLikes()')
    showLoader();
	
    countPostLikes();
}

function parseTopLikers(){
    if(topLikers.length < 1){ topLikers.push(""); }
                
    FB.api(
    {
        method: 'fql.query',
        query: 'SELECT uid, first_name, last_name, pic_big FROM user WHERE uid = ' + topLikers[0].toString()
    },
    function(data) {
        if(data.length > 0){
            var topName = data[0].first_name + ' '+ data[0].last_name + ' liked you ' + highestCount +' times!';
            var topPic = data[0].pic_big;
            VALENTINE = data[0].uid;

            setResult(topName, topPic);
        } else {
            var topName = "Yourself.";
            $('.text').text('You seem to be the only one who likes your posts. (Well, at least you can give yourself a big old hug!)');
            $('.facebook-continue').hide();
            var topPic;
            FB.api('/me/?fields=picture&type=large', function(response) {
                //console.log(response);
                if(response && response.picture){
                    topPic = response.picture;
                } else {
                    topPic = "img/test.jpg";
                }

                window.setTimeout(function(){showHide('#happy', '#result')}, LIKE_DELAY * $('#loader li').length + NO_LIKE_DEALY);
                topName = TEST?'img/test.jpeg':_topPic;
                topPic = TEST?'Nobody.':_topName;
                setResult(topName, topPic);
            });
        }
    //console.log(topName + " == " + highestCount);
    }
    );
}


//function getPermissions(){
////    FB.api('/me/permissions', function (response) {
////        //console.log(response);
////    } );    
//}


function setResult(_topName, _topPic){    
    $('.name').text(_topName);
    if(!DEBUG){ 
        $('.frame img').attr('src', _topPic).bind('load', function(_e){
            if($('#result').css('display') != "none"){
                $target = $(_e.currentTarget);
                $target.css('margin-top', 110 - $target.outerHeight()/2);
            } else {
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
            }            
        });
    } else { //DEBUG ONLY
        $('.frame img').attr('src', topPic).bind('load', function(_e){
            $target = $(_e.currentTarget);
            $target.css('margin-top', 110 - $target.outerHeight()/2);
        });
    }
    
    IMAGE_LOADED = true;
}

function waitForImageLoad(){
    if(IMAGE_LOADED && LOADER_FINISHED){
        showHide('#result', '#loader');
    } else {
        //console.log("waitForImageLoad");
        setTimeout(waitForImageLoad,500);
    }
}

function showLoader(){
    //set a timeout to catch facebook api timeouts
    window.setTimeout(onTimeout,globalTimeout);
    
    showHide('#loader', '#welcome');
    var $loaderli = $('#loader li');
    resetLoader($loaderli)
    
    // var opts = {
    //   lines: 12, // The number of lines to draw
    //   length: 7, // The length of each line
    //   width: 4, // The line thickness
    //   radius: 10, // The radius of the inner circle
    //   color: '#C18EAD', // #rgb or #rrggbb
    //   speed: 1, // Rounds per second
    //   trail: 60, // Afterglow percentage
    //   shadow: false, // Whether to render a shadow
    //   hwaccel: false // Whether to use hardware acceleration
    // };

    //var _spinner = new Spinner(opts).spin($('.fbStillWaiting')[0]);
    
    //$('.fbStillWaiting').delay(LIKE_DELAY * $loaderli.length+1).fadeIn(FADEIN_DELAY);
    $('.fbText').delay(LIKE_DELAY * $loaderli.length+1).fadeIn(FADEIN_DELAY);
    
    //we setup the loader image progression, now let's wait for the FB calls and image load to finish
    waitForImageLoad();
}

function resetLoader(_loaderli){
    _loaderli.each(function(_i, _this){
        $this = $(_this);
        $this.hide();
        $this.delay(LIKE_DELAY * _i).fadeIn(FADEIN_DELAY);
    }); 

    window.setTimeout(
        function(){
            LOADER_FINISHED = true;
            resetLoader(_loaderli);
        },
        LIKE_DELAY * _loaderli.length+1
    );
}

function contactValentine(){
    //console.log('contactValentine()');
	FB.ui(
            {
                method:'send',
                to: VALENTINE,
                name: 'You\'re my Facebook Valentine!',
                link: ROOT_URL, //CHANGE!!!
                picture: ROOT_URL + '/img/app_icon.gif',
                description: MESSAGE
            },
        function(response) {
            if (response) {
                //console.log('message send!');
                showHide('#happy', '#message');
            } else {
                //console.log('message NOT send!');
            }
        }
	);			
}

function showHide(_show, _hide){
    ////console.log('showHide(' + _show + ', ' + _hide + ')');
    if(!DEBUG){
        $(_hide).hide();
        $(_show).fadeIn(FADEIN_DELAY); 
    }
}