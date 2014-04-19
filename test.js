
Game = new Meteor.Collection("games");

var size = 30;
var padding = 3;
var sizepadding = size + padding;

var width ;
var height ;

var hostName ="AggeFan"
// const ROWS = 4;
// const COLUMNS = 4;

if (Meteor.isClient) {
	var board;

	Meteor.startup(function() {
    	Session.set('data_loaded', false); 
  	}); 

  	Meteor.subscribe('game', function(){ 
  		console.log('subscribe done.')

		
		game =  Game.find({ }).fetch()[0];

		board = game.board;
		renderBoard(board);

  	});

  	Deps.autorun(function(){

  		var change = Game.find({"hostName": hostName}).fetch()[0];
  		if(change !== undefined){

  			renderBoard(change.board)
  		}



  	})

  	Template.game.events({
  		'click #gameCanvas' : function(e){

  			var c = getCanvasCoordinates(e);
  			var boardcoordinates = getBoardXY(c);

  			// updateBoardOnServer(c);
  			Meteor.call('updateBoard', hostName,boardcoordinates.x, boardcoordinates.y);
  			// fillSquare(boardcoordinates.x, boardcoordinates.y, randomRGB());

  		}
  		
  	});

	// Deps.autorun(function(){
	// 	var ready = Game.find({});
	// 	if(ready){
	// 		Meteor.subscribe('game');
	// 	}
	
	// });


  	Template.game.rendered = function() {
  		//$('#gameCanvas').attr('width', window.innerWidth);
  		//$('#gameCanvas').attr('height' window.innerWidth);

  		// console.log(board);


  		// $('#gameCanvas').attr('width', width*sizepadding);
  		// $('#gameCanvas').attr('height', height*sizepadding);
		renderBoard(board);

	};
}
// Functions

function renderBoard(board){
	console.log('renderBoard')
	for(pos in board){

		var color;
		var xy = pos.split("_");

		(board[pos] == 1) ? color ="#333" : color = "#ddd";

		fillSquare(xy[0], xy[1], color);
	}
}

function getCanvasCoordinates(e){
	var x;
	var y;
	var gCanvasElement = document.getElementById('gameCanvas');

	if (e.pageX || e.pageY) { 
	  x = e.pageX;
	  y = e.pageY;
	}
	else { 
	  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
	  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	} 
	x -= gCanvasElement.offsetLeft;
	y -= gCanvasElement.offsetTop;

	return {x:x,y:y};
}

function getBoardXY(coordinates){
	var xBoard  = Math.ceil(coordinates.x / sizepadding)-1;
    var yBoard  = Math.ceil(coordinates.y / sizepadding)-1;
    return {x:xBoard,y:yBoard};
}

function fillSquare(x,y, color){
		var gameCanvas = $("#gameCanvas");
		var context = gameCanvas[0].getContext('2d');
		context.fillStyle = color;
		context.fillRect(x*sizepadding, y*sizepadding, size, size);
}

function paintBackground(color){
		var gameCanvas = $("#gameCanvas");
		var context = gameCanvas[0].getContext('2d');
		context.fillStyle = color;
		context.fillRect(0, 0, gameCanvas[0].width, gameCanvas[0].height);
}

function randomRGB(){
	r = Math.round(Math.random()*255);
	g = Math.round(Math.random()*255);
	b = Math.round(Math.random()*255);
	return "rgb("+r+","+g+","+b+")";
}



if (Meteor.isServer) {

	Meteor.methods({
		update: function(x,y){
			// console.log(x, y)
		},
		createBoard: function(_gameName, _hostName, w, h){
			width = w;
			height = h;
			hostName = _hostName;
			var pos = "";

			var _board = {};
			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){
					pos = i + "_" + j;
					_board[pos] = 0;
				}
			}
			var gameID = Game.insert({hostName: hostName, hostName: _hostName,
				board: _board});
			console.log("CREATED GAME")

			return gameID;
		},
		updateBoard: function(_hostName, x, y){

			var position = "board." + x + "_" + y;
			// console.log(position)
			// console.log(typeof position)
			var action = {};
			action[position] = 1
// 
			 Game.update({hostName: _hostName},{$set: action})
			 // db.games.update({hostName: "AggeFan"},{$set: {"board.3_1" : 1}})


		     console.log("UPDATED "+ _hostName + " with: " + position);
		},
		clearBoard: function(_hostName){
			Game.remove({hostName: _hostName});
		}
	});

	Meteor.publish('game', function(args){
		return Game.find({"hostName": hostName});
	});

	Meteor.startup(function () {

		console.log('server startup')
		// code to run on server at startup
	});



}

function generateMine(){
	return Math.round(Math.random());
}
