/*
This file contains the RouteControllers. 
*/

LobbyController = RouteController.extend({

  // Reroute to login if user not logged in
  onBeforeAction: function(pause){
      if(!Meteor.userId()){
        this.render('login')
        pause();
      }
  },

  // Make sure that the subscription is ready
  waitOn: function(){
      gameSubscription = Meteor.subscribe('game', Meteor.userId(), Session.get('gameID'));
      return gameSubscription
  },
  action: function(){   
      this.render();
  },
  onStop: function(){
     gameSubscription.stop();
  }

});

CreateGameController = RouteController.extend({

  // Reroute to login if user not logged in
	onBeforeAction: function(pause){
		 if(!Meteor.userId()){
			 this.render('login')
			 pause();
		 }
	},
	action: function(){     
		 this.render('creategame');
	}
})

GameController = RouteController.extend({

  // Reroute to login if user not logged in
  onBeforeAction: function(pause){
     if(!Meteor.userId()){
       this.render('login')
       pause();
     }
  },

  // Make sure that the subscription is ready
  waitOn: function(){
     gameSubscription = Meteor.subscribe('game', Meteor.userId(), Session.get('gameID'))
     return gameSubscription
  },
  action: function(){   
     this.render('game');
  },

  // Reset variables when user leaves game
  onStop: function(){
     gameSubscription.stop();
     Meteor.call('leaveGame', Session.get('gameID'), Meteor.userId())
     Session.set('gameID', null)
     localStorage.setItem("gameID", null)
  }

})