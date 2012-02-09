//var ROOT_URL = 'http://localhost:8080/'
var ROOT_URL = 'http://vmlfbval.appspot.com';
var VALENTINE = 'MOOOOOO';
var MESSAGE = 'Hey random person, turns out you’re my Facebook Valentine! Whoever you are, you sure like my posts. And I like that. I could write "Stalker Alert" and you’d probably give it a double thumbs-up. Keep it up stranger (but stop going through my trash). Happy Valentine’s Day!Hey random person, turns out you’re my Facebook Valentine! Whoever you are, you sure like my posts. And I like that. I could write "Stalker Alert" and you’d probably give it a double thumbs-up. Keep it up stranger (but stop going through my trash). Happy Valentine’s Day!';

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

  // Load the SDK Asynchronously
 (function(d){
     var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     d.getElementsByTagName('head')[0].appendChild(js);
   }(document));

$(document).ready(function(){
    $('.facebook-message').click(chooseMessage);
    $('.facebook-send').click(contactValentine);
    $('.menu li').click(function(){
        $this = $(this);
        MESSAGE = $('span', $this).text();
        contactValentine();
    });
});

function fbLoginStatus(response) {
    if (response.authResponse) {
        console.log("user is already logged in and connected");
        $('.fb-login-button').hide();
        $('.continue-button').click(function(){ countLikes() });
        $('.continue-button').show()
    }
}

function countLikes() {
    console.log('countLikes()')
    var user_id_counts = {};
    var highestCount = 0;
    var topLikers = [];
    var topLikersInfo = [];
	
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
                //data = [];
                if(data.length != 0){
                        var topName = 'Why not send ' + data[0].first_name + ' '+ data[0].last_name + ' a message?';
                    var topId = data[0].uid;
                    var topPic = data[0].pic_big;
                } else {
                        var topName = "Nobody likes you...";
                        var topPic = "img/" + Math.round(Math.random()*3) + ".jpeg";
                }
                
                console.log(topName);
                VALENTINE = data[0].uid;
                        
                $('.frame img').hide().attr('src', topPic).bind('load', function(_e){
                        $target = $(_e.currentTarget);
                        $target.css('margin-top', 110 - $target.outerHeight()/2);
                        $target.show();
                });
                $('.text').text(topName);

            }
	);
}

function chooseMessage(){
	//MESSAGE = $('.message-container p').text();
	// $('#welcome').hide();
	// $('#result').show();
}

function contactValentine(){
	FB.ui(
            {
                    method:'send',
                    to: VALENTINE,
                    name: 'You\'re my Facebook Valentine!',
                    link: ROOT_URL, //CHANGE!!!
                    description: MESSAGE
            }
	);

	//			picture: ROOT_URL + 'img/app_icon.gif',
}

function showThankyou(){
	// $('#welcome').hide();
	// $('#result').show();
}