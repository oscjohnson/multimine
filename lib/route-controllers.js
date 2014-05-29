/*
This file contains the RouteControllers. 
*/

LobbyController = RouteController.extend({

  onBeforeAction: function(pause){
      if(!Meteor.userId()){
        this.render('login')
        pause();
      }
  },
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

  onBeforeAction: function(pause){
     if(!Meteor.userId()){
       this.render('login')
       pause();
     }
  },
  waitOn: function(){
     gameSubscription = Meteor.subscribe('game', Meteor.userId(), Session.get('gameID'))
     return [
        gameSubscription
      ];
  },
  action: function(){   
     this.render('game');
  },
  onStop: function(){
     gameSubscription.stop();
     Meteor.call('leaveGame', Session.get('gameID'), Meteor.userId())
     Session.set('gameID', null)
     localStorage.setItem("gameID", null)
  }

})