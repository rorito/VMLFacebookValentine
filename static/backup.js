
// original collect likes
//        //console.log('countLikes() - callback, num posts: ' + myPosts.length);
//        //console.log(myPosts);
//        for(var i=0;i < myPosts.length;i++){
//            ////console.log(myPosts[i]);
//            ////console.log(myPosts[i].uid);
//            if(user_id_counts.hasOwnProperty(myPosts[i].uid.toString())){
//                //already has key, increment
//                user_id_counts[myPosts[i].uid.toString()]++;
//            } else{
//                user_id_counts[myPosts[i].uid.toString()] = 1;
//            }
            
//            // also keep track of the current highest
//            if(user_id_counts[myPosts[i].uid.toString()] > highestCount){  //new highest count
//                    topLikers = [];
//                    highestCount = user_id_counts[myPosts[i].uid.toString()];
//                    topLikers.push(myPosts[i].uid.toString())
//            } else if(user_id_counts[myPosts[i].uid.toString()] == highestCount){ //more than 1 person with this count
//                    topLikers.push(myPosts[i].uid.toString());
//            } 
//        }








//function fqlIdsThenGraphLikes(){
//    FB.api(
//    {
//        method: 'fql.query',
//        //AND created_time < '+ Math.round(new Date().getTime() / 1000) +' 
//        //query: "SELECT message, likes.friends FROM stream WHERE filter_key = 'others' LIMIT 5000"   //only others
//        //query: 'SELECT message FROM stream WHERE source_id = me() AND is_hidden = 0 LIMIT 5000'
//        //query: 'SELECT uid FROM user WHERE uid IN (SELECT likes.friends FROM stream WHERE source_id = me() AND is_hidden = 0 AND created_time > 0 LIMIT 5000)'
//        //query: "SELECT post_id, message FROM stream WHERE likes.count > 0 AND source_id=me() LIMIT 5000"
//        query: "SELECT post_id, message FROM stream WHERE likes.count > 0 AND actor_id = me() LIMIT 5000"
//    }, 
//    function(myPosts) {
//        var uid = "";
//        //console.log("myposts fql: " + myPosts.length);
//        //console.log(myPosts);
        
//        var idString = "";
//        for(var i=0;i<myPosts.length;i++){
//            idString += (myPosts[i].post_id + ",");
//        }
//        //remove last comma
//        idString = idString.slice(0, -1);
        
//        //console.log(idString);
        
        
//        //test
//        FB.api("/likes?ids="+idString,function(response){
//            //console.log("/likes/?ids");
//            ////console.log(response);
            
//            for (var key in response) {
//              if (response.hasOwnProperty(key)) {
//                if(response[key].data.length > 0){
//                    for(var i=0;i<response[key].data.length;i++){
//                        uid = response[key].data[i].id;
                        
//                        if(user_id_counts.hasOwnProperty(uid)){
//                            //already has key, increment
//                            user_id_counts[uid]++;
//                        } else{
//                            user_id_counts[uid] = 1;
//                        }
                        
//                        // also keep track of the current highest
//                        if(user_id_counts[uid] > highestCount){  //new highest count
//                            topLikers = [];
//                            highestCount = user_id_counts[uid];
//                            topLikers.push(uid)
//                        } else if(user_id_counts[uid] == highestCount){ //more than 1 person with this count
//                            topLikers.push(uid);
//                        } 
//                    }
//                }
//              }
//            }
            
//            parseTopLikers();
//        });
//    });
//}






    

    

        
        ////console.log(myPosts);
//        for(var i=0;i < myPosts.length;i++){
//            if(myPosts[i].likes){
//                if(myPosts[i].likes.friends.length > 0){
//                    for(var j=0;j<myPosts[i].likes.friends.length;j++){
//                        uid = myPosts[i].likes.friends[j];
                        
//                        if(user_id_counts.hasOwnProperty(uid)){
//                            //already has key, increment
//                            user_id_counts[uid]++;
//                        } else{
//                            user_id_counts[uid] = 1;
//                        }
                        
//                        // also keep track of the current highest
//                        if(user_id_counts[uid] > highestCount){  //new highest count
//                            topLikers = [];
//                            highestCount = user_id_counts[uid];
//                            topLikers.push(uid)
//                        } else if(user_id_counts[uid] == highestCount){ //more than 1 person with this count
//                            topLikers.push(uid);
//                        } 
//                    }
//                }
//            }
//        }