/*
This code will run on both server- and clientside
before everything else.
*/

// Setting up collections
Game = new Meteor.Collection("games");

// Initalize global variables
size = 30;
padding = 3;
sizepadding = size + padding;
apm = 0;
width = 0;
height = 0
game = 0;
dev = false;
hostName ="AggeFan";

score = {
	rightwin: 10,
	rightfail: -5,
	leftwin: 1,
	leftfail: -10,
	reveal: 5
}


// Initalize Routing

Router.map(function() {
  this.route('lobby', {
  	path:'/',
  	
  	onBeforeAction: function(pause){
  		if(!Meteor.userId()){
  			this.render('login')
  			pause();
  		}
  	},
  	waitOn: function(){
  		return Meteor.subscribe('game', Meteor.userId(), Session.get('gameID'));
  	},
  	action: function(){		
  		this.render();
  	}
  }),
    this.route('create', {
  	path:'/create',
  	
  	onBeforeAction: function(pause){
  		if(!Meteor.userId()){
  			this.render('login')
  			pause();
  		}
  	},
  	action: function(){		  
  		this.render('creategame');
  	}
  }),
    this.route('game', {
  	path:'/game',
  	onBeforeAction: function(pause){
  		if(!Meteor.userId()){
  			this.render('login')
  			pause();
  		}
  	},
  	waitOn: function(){
  		return Meteor.subscribe('game', Meteor.userId(), Session.get('gameID'));
  	},
  	action: function(){		
  		this.render('game');
  	// 	if(Session.equals('gameID', 0)){ // No game existing
  	// 		this.render('creategame')
  	// 	} else if(Session.equals('gameList', true)){ // Games existing but not joined
  	// 		this.render('lobby');
  	// 	} else
  	// 		this.render('game') // Enter game
  	}
  })
});


// Global functions

/*
Function that checks if there are mines around a certain square.
*/
checkSurroundingsForMines = function(board, square){


		var xstart = square.x;
		var ystart = square.y;
		var xstop = square.x;
		var ystop = square.y;
		var counter = 0;

		if (square.x == 0) {
			xstart =1;
		}
		if(square.y ==0){
			ystart= 1;
		}

		if (square.x == width-1) {
			xstop =square.x-1;
		}
		if(square.y ==height-1){
			ystop= square.y-1;
		}

		for (var i = xstart-1; i <= xstop+1; i++) {
			for (var j = ystart-1; j <= ystop+1; j++) {
				if(board[i+'_'+j].isMine == 1){
					counter++;
				}
			};	
		};

	return counter;
}

/*
Returns number of keys for an object.
*/
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};