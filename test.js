Game = new Meteor.Collection("games");

const ROWS = 4;
const COLUMNS = 4;

if (Meteor.isClient) {


	Meteor.startup(function() {
    	Session.set('data_loaded', false); 
  	}); 

  	Meteor.subscribe('game', function(){	
    	
  	});
  	Template.game.events({
  		'click #gameCanvas' : function(e){
  			console.log(Game.find({}).fetch())
  			Meteor.call("updateBoard", e.pageX, e.pageY);
  		}
  	})
  	
}



if (Meteor.isServer) {

	Meteor.methods({
		update: function(x,y){
			console.log(x, y)
		},
		createBoard: function(_gameName, _hostName){

			var _board = [];
			for(var i = 0; i < ROWS; i++){
				for(var j = 0; j < COLUMNS; j++){
				_board.push({"x": i, "y": j, "val": generateMine()})
				}
			}
			var gameID = Game.insert({gameName: _gameName, hostName: _hostName,
				board: _board});
			console.log("CREATED GAME")

			return gameID;
		},
		updateBoard: function(_gameName, x, y){
			Game.update({gameName: _gameName, "board.x": x, "board.y": y},
						{$set: {"board.$.val": 3}});
		     console.log("UPDATED BOARD")
		}
	});

	Meteor.publish('game', function(args){
		return Game.find();
	});

	Meteor.startup(function () {
		console.log('server startup')
		// code to run on server at startup
	});
}

function generateMine(){
	return Math.round(Math.random());
}
