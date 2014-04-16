Game = new Meteor.Collection("game");



if (Meteor.isClient) {


	Meteor.startup(function() {
		console.log('startup')
    	Session.set('data_loaded', false); 
  	}); 

  	Meteor.subscribe('game', function(){
  		console.log('subscribe done.')
		game = Game.findOne({ _id: "Ww3CKX2ZCSE3MSX35"});
		console.log(game.board)
		// Game.update({_id: "Ww3CKX2ZCSE3MSX35"}, board: "");	
    	
  	});
  	Template.game.events({
  		'click #gameCanvas' : function(e){
  			//console.log(e.pageX, e.pageY);
  			Meteor.call("update", e.pageX, e.pageY);
  		}
  		
  	})
  	
}



if (Meteor.isServer) {

	Meteor.methods({
		update: function(x,y){
			console.log(x, y);
		},
		callthings: function(){
			console.log('as');
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
