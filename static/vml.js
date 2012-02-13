/*  TODO

enable sound

different one each time if ties
1. figure out how to recall facebook API calls if they time out
1. check permissions
1. test in IE 7+
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
var ROOT_URL = 'http://vmlfbval.appspot.com';
var VALENTINE = '';
var MESSAGE = '';
var DEBUG = false;
var DEBUG_LIKE_SCREEN = false;

var NO_LIKE_DEALY = 5000;
var LIKE_DELAY = 900;
var FADEIN_DELAY = 200;



var TEST;
var MP3 = false;
var OGG = false;

var IMAGE_LOADED = false;
var LOADER_FINISHED = false;
var clickedFBLoginButton = false;

window.fbAsyncInit = function() {
    FB.init({
      appId      : '374030012622491', // App ID
      channelUrl : 'http://vmlfbval.appspot.com/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true,  // parse XFBML
      oauth      : true
    });
    
    $('.fb-login-button').click(function(){
        clickedFBLoginButton = true;
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
        MP3 = true;
    } else if(audioElement.canPlayType('audio/ogg') == 'maybe' || audioElement.canPlayType('audio/ogg') == 'probably'){
        OGG = true;
    }
    if(OGG || MP3){
        $audioElement = $(audioElement);
        var _src;
        var _type;
        if(OGG){ _src = TEST?'sound/test.ogg':'sound/amour.ogg'; _type = 'audio/ogg';}
        else if(MP3){ _src = TEST?'sound/test.mp3':'sound/amour.mp3'; _type = 'audio/mpeg';}
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
    if(response.authResponse && clickedFBLoginButton){
        console.log("user originally logged out, had to click FB login button to login");
        $('.fb-login-button').hide();
        countLikes();
    } else if (response.authResponse) {
        console.log("user is already logged in and connected");
        $('.fb-login-button').hide();
        $('.welcome-continue').click(function(){ countLikes() });
        $('.welcome-continue').show()
    }
}

var hasMorePosts = true;
var graphAPIPosts = [];

function getGraphPosts(url){
    if(!response.hasOwnProperty("paging")){
        hasMorePosts = false;
    }
    if(response && response.data){
        return response.data;
    } else {
        return [];
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
    console.log("collateLikes: num of posts - " + myPosts.data.length);
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

    console.log("collateLikes: num of posts with likes - " + postsWithLikes);
    console.log("collateLikes: total likes - " + totalPostLikes);
}

function countAlbumLikes(){    
    //get likes for the album itself
     console.log("countAlbumLikes()");
    FB.api(
        {
            method: 'fql.query',
            query: 'select user_id from like where object_id IN (select object_id from album WHERE owner=me() LIMIT 500)'
        },
        function(data) {
            console.log("countAlbumLikes(): " + data.length);
            for(var i=0;i<data.length;i++){
                if(data[i].hasOwnProperty("user_id")){
                    addUserTrackHighest(data[i]["user_id"]);
                }
            }
            
            countPhotoLikes();
        }
    );
}


function countPhotoLikes(){
    FB.api(
        {
            method: 'fql.query',
            query: 'select user_id, object_id from like where object_id in (select object_id from photo WHERE aid IN (select aid from album WHERE owner=me() LIMIT 500))'
        },
        function(data) {
            console.log("countPhotoLikes(): " + data.length) ;
            for(var i=0;i<data.length;i++){
                if(data[i].hasOwnProperty("user_id")){
                    addUserTrackHighest(data[i]["user_id"]);
                }
            }
            
            console.log("done");
            console.log(topLikers);
            console.log("highest: " + highestCount);
            //console.log(user_id_counts);
            
            parseTopLikers();
        }
    );
}




function countPostLikes(){
    FB.api('/me/posts&limit=5000', function(response) {
        console.log("countPostLikes()");
        collateLikes(response);
        
        countAlbumLikes();
    });    
}

function countLikes() {
    console.log('countLikes()')
    showLoader();
	
    countPostLikes();
}

function parseTopLikers(){
    if(topLikers.length < 1){ topLikers.push(""); }
    
//    console.log("top likers");
//    console.log(topLikers);
    
    FB.api(
        {
            method: 'fql.query',
            query: 'SELECT uid, first_name, last_name, pic_big FROM user WHERE uid = ' + topLikers[0].toString()
        },
        function(data) {
            if(data.length > 0){
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
                        //console.log(response);
                        if(response && response.picture){
                            topPic = response.picture;
                        } else {
                            topPic = "img/test.jpg";
                        }

                        window.setTimeout(function(){showHide('#happy', '#result')}, LIKE_DELAY * $('#loader li').length + NO_LIKE_DEALY);
                        setResult(topName, topPic);
                    });
            }
        }
    );    
}


//function getPermissions(){
////    FB.api('/me/permissions', function (response) {
////        console.log(response);
////    } );    
//}


function setResult(_topName, _topPic){
    _topPic = TEST?'img/test.jpeg':_topPic;
    
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
            
            
//            if(LOADER_FINISHED){
//                showHide("#result","#loader");
//            }
            
        });
    } else { //DEBUG ONLY
        $('.frame img').attr('src', topPic).bind('load', function(_e){
            $target = $(_e.currentTarget);
            $target.css('margin-top', 110 - $target.outerHeight()/2);
        });
    }
    
    //profile image is now loaded
//    if(!DEBUG_LIKE_SCREEN){
        IMAGE_LOADED = true;
//    }
}

function waitForImageLoad(){
    if(IMAGE_LOADED && LOADER_FINISHED){
        showHide('#result', '#loader');
    } else {
        //console.log("waitForImageLoad 100 ms");
        setTimeout(waitForImageLoad,100);
    }
}

function showLoader(){
    showHide('#loader', '#welcome');
    var numLis = 0;
    var $loaderli = $('#loader li');
    $loaderli.each(function(_i, _this){
        $this = $(_this);
        $this.delay(LIKE_DELAY * _i).fadeIn(FADEIN_DELAY);
        numLis++;
//        if(_i == $loaderli.length-1){
//            window.setTimeout(function(){
//                showHide('#result', '#loader'); 
//                }, 
//            LIKE_DELAY * $loaderli.length);
//        }
    });
    
    var opts = {
      lines: 12, // The number of lines to draw
      length: 7, // The length of each line
      width: 4, // The line thickness
      radius: 10, // The radius of the inner circle
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false // Whether to use hardware acceleration
    };
    var target = document.getElementById('fbStillWaiting');
    var spinner = new Spinner(opts).spin(target);
    
    setTimeout("LOADER_FINISHED = true;",LIKE_DELAY * numLis+1);
    $('#fbStillWaiting').delay(LIKE_DELAY * numLis+1).fadeIn(FADEIN_DELAY);
    $('#fbText').delay(LIKE_DELAY * numLis+1).fadeIn(FADEIN_DELAY);
    
    //we setup the loader image progression, now let's wait for the FB calls and image load to finish
    waitForImageLoad();
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
    //console.log('showHide(' + _show + ', ' + _hide + ')');
    if(!DEBUG){
        $(_hide).hide();
        $(_show).fadeIn(FADEIN_DELAY); 
    }
}