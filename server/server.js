
	Accounts.onLogin(function(data){
		Meteor.users.update({_id: data.user._id}, {$set:{"profile.online":true}})
	})


	Accounts.onCreateUser(function(options, user) {
	  user.profile = options.profile ? options.profile : {online: false};
	  return user;
	});



	Meteor.publish('game', function(userId, gameID){
		if(userId != null){

			if(gameID != null){
				// gå till game aka skicka den subscribem
				return Game.find(gameID);
			}
			else
				return Game.find({},{fields: {'gameName': 1, 'hostName': 1, 'width': 1, 'height': 1,'players': 1}});
		}
	});

	Meteor.publish('allUsers', function(args){
		return Meteor.users.find({"profile.online": true}, {fields:{'emails':1, 'profile.score': 1, 'profile.revealed': 1}});
	});

	// Deny cowboy inserts and updates
	Game.allow({
		insert: function(){
			return false;
		},
		update: function(){
			return false;
		},
	})

	Meteor.methods({
		createBoard: function(_gameName, _hostName, w, h){
			
			width = w;
			height = h;
			hostName = _hostName;
			var pos = "";

			var _board = {};

			//Place RandomMines, init the board
			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){
					pos = i + "_" + j;
					var obj = {};
					obj['checked'] = 0;
					obj['isMine'] = Math.round(Math.random()*0.6);
					obj['surroundingMines']= 0;
					_board[pos] = obj;

				}
			}

			//calculate all the surrounding mines
			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){
					_board[i+'_'+j].surroundingMines = checkSurroundingsForMines(_board, {x:i, y:j});

				}
			} 
			
			var players= [hostName];
			
			
			
			return Game.insert({
						gameName: _gameName, 
						hostName: _hostName,
						board: _board, 
						width: w, 
						height: h,
						players: players,
						version: 0 
					});
		},
		rightClick: function(_gameID, coord){
			x = coord.x;
			y = coord.y;

			// var key = "board." + x + "_" + y + ".isMine";
			// var action = {};
			// action[key]

			var find = Game.find(_gameID).fetch()
			var isMine =find[0].board[x+'_'+y].isMine;


			if(isMine == 1){

				var key = "board." + x + "_" + y + ".checked";
				var action = {};
				action[key] = 2;
	 			Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":score.rightwin}})
				Game.update(_gameID,{$set: action})
			}else{
				Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":score.rightfail}})
			}

		},
		updateBoard : function(_gameID, coordinates, queryObject){

			var revealsize= + Object.size(queryObject);
			
			// var key = "board." + coordinates.x + "_" + coordinates.y + ".isMine";
			// var action = {};
			// action[key]

			var find = Game.find(_gameID).fetch()
			var isMine =find[0].board[coordinates.x+'_'+coordinates.y].isMine;

			if(isMine ==1){
				Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":score.leftfail}})
			}else{
				if(revealsize > 5){
					Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":score.reveal}})	
				}else{
					Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":score.leftwin}})	
				}

			}
			Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.revealed":revealsize}})	
			Game.update(_gameID,{$set: queryObject})
		

		},
		clearBoard: function(_hostName){
			Game.remove({hostName: _hostName});
			return 0;
		},
		removePoints: function(){
			Meteor.users.update({}, {$set:{"profile.score":0}}, {multi: true})
			Meteor.users.update({}, {$set:{"profile.revealed":0}}, {multi: true})

		},
		leaveGame: function(gameID, userID){
			Game.update( gameID, {$pull: { players: userID  } });
			//Temporary fix for presentation
			Meteor.users.update(userID, {$set:{"profile.score":0}});
		},
		joinGame: function(gameID, userID){

			//Remove user if exists to avoid duplications
			Game.update( gameID, {$pull: { players: userID  } });
			//Insert user
			Game.update( gameID, {$push: { players: userID } });

		},
		consoleLog: function(message){
			console.log(message)
		},
		logoutUser: function(userid){
			Meteor.users.update({_id: userid}, {$set:{"profile.online":false}});
	
		}
	});


	Meteor.startup(function () {

	});


