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
      subscription = Meteor.subscribe('game', Meteor.userId(), Session.get('gameID'));
      return subscription
  },
  action: function(){   
      this.render();
  },
  onStop: function(){
      subscription.stop();
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
     subscription = Meteor.subscribe('game', Meteor.userId(), Session.get('gameID'));
     return subscription
  },
  action: function(){   
     this.render('game');
  },
  onStop: function(){
     subscription.stop();
     Session.set('gameID', null)
     localStorage.setItem("gameID", null)
  }
})