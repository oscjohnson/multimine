/*
	Server logic in here.
*/


// This really necessary?
Accounts.onLogin(function(data){
	Meteor.users.update({_id: data.user._id}, {$set:{"profile.online":true}})
})

// Same with this
Accounts.onCreateUser(function(options, user) {
	user.profile = options.profile ? options.profile : {online: false};
	return user;
});


// Publishes a specific game if client uses a gameID when subscribing.
// Otherwise publish a list of available games.
Meteor.publish('game', function(userId, gameID){
	if(userId != null){
		if(gameID != null){
			return Game.find(gameID);
		}
		else
			return Game.find({},{fields: {'gameName': 1, 'hostName': 1, 'width': 1, 'height': 1,'players': 1}});
	}
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

// Containing all the methods the client can call with the use of Meteor.call.
// This is the methods that is ued by the client to communicate with the server.
Meteor.methods({

	// Creating a board with width w and height h.
	createBoard: function(_gameName, _hostName, w, h){
		
		width = w;
		height = h;
		hostName = _hostName;
		var pos = "";

		var _board = {};

		//Place RandomMines, initalize the board
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

		var o = {};
		o.id = _hostName;
		o.points = 0;
		var email = Meteor.users.find({_id: _hostName}, {fields: {'emails.address': 1}}).fetch()[0].emails[0].address;
		o.name = email.split("@")[0];
		
		var players = [];
		players.push(o);

		
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
	//Handle user rightclick action
	rightClick: function(_gameID, coord){
		x = coord.x;
		y = coord.y;

		//Small query gets if a mine was clicked 		
		var find = Game.find(_gameID).fetch()
		var isMine =find[0].board[x+'_'+y].isMine;


		//if so give points and update everyones board.
		if(isMine == 1){

			var key = "board." + x + "_" + y + ".checked";
			var action = {};
			action[key] = 2;

			Game.update({_id: _gameID, "players.id": Meteor.user()._id}, {$inc:{"players.$.points": score.rightwin}})
			Game.update(_gameID,{$set: action})
		}
		//Remove from players score for guessing wrong
		else{
			Game.update({_id: _gameID, "players.id": Meteor.user()._id}, {$inc:{"players.$.points": score.rightfail}})

		}

	},
	//Handle user left click action
	updateBoard : function(_gameID, coordinates, queryObject){

		var revealsize= + Object.size(queryObject);
		

		//Small query gets if a mine was clicked 		
		var find = Game.find(_gameID).fetch()
		var isMine =find[0].board[coordinates.x+'_'+coordinates.y].isMine;

		//if mine was clicked hand out many points
		if(isMine ==1){

			Game.update({_id: _gameID, "players.id": Meteor.user()._id}, {$inc:{"players.$.points": score.leftfail}})
		}else{
			//if a revealsquare was clicked handout some points 
			if(revealsize > 5){
				Game.update({_id: _gameID, "players.id": Meteor.user()._id}, {$inc:{"players.$.points": score.reveal}})
			}
			//otherwise give just one point
			else{

				Game.update({_id: _gameID, "players.id": Meteor.user()._id}, {$inc:{"players.$.points": score.leftwin}})
	
			}

		}
		Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.revealed":revealsize}})
		//Update board for everyone.
		Game.update(_gameID,{$set: queryObject})


	},
	//Development function for removing a game
	clearBoard: function(_hostName){
		Game.remove({hostName: _hostName});
		return 0;
	},
	//Remove points for all users
	removePoints: function(){
		Meteor.users.update({}, {$set:{"profile.score":0}}, {multi: true})
		Meteor.users.update({}, {$set:{"profile.revealed":0}}, {multi: true})

	},
	leaveGame: function(gameID, userID){
		Game.update( gameID, {$pull: { players: {id : userID}} });

	},
	//Adds user id and name to joined Game.
	joinGame: function(gameID, userID){

		//Remove user if exists to avoid duplications
		Meteor.call('leaveGame',gameID, userID); 
		
		//Insert user
		var email = Meteor.users.find({_id: userID}, {fields: {'emails.address': 1}}).fetch()[0].emails[0].address;
		var o = {};
		o.id = userID;
		o.points = 0;
		o.name = email.split("@")[0];

		Game.update( gameID, {$push: { players: o } });

	},
	consoleLog: function(message){
		console.log(message)
	},
	logoutUser: function(userid){
		Meteor.users.update({_id: userid}, {$set:{"profile.online":false}});

	}
});