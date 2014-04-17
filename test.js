
Game = new Meteor.Collection("games");

var size = 30;
var padding = 3;
var sizepadding = size + padding;

var width = 4;
var height = 4;


const ROWS = 4;
const COLUMNS = 4;

if (Meteor.isClient) {
	var board;

	Deps.autorun(function() {
		Game.find().fetch();
		console.log("hej")
	});

	Meteor.startup(function() {
    	Session.set('data_loaded', false); 
  	}); 

  	Meteor.subscribe('game', function(){
  		console.log('subscribe done.')
		game = Game.find({ }).fetch()[0];
		console.log(game)
		board = game.board;
		renderBoard(board);
  	});
  	Template.game.events({
  		'click #gameCanvas' : function(e){

  			var c = getCanvasCoordinates(e);
  			var boardcoordinates = getBoardXY(c);

  			// updateBoardOnServer(c);
  			Meteor.call('updateBoard','AggeFan',boardcoordinates.x, boardcoordinates.y);
  			// fillSquare(boardcoordinates.x, boardcoordinates.y, randomRGB());
  		}
  		
  	});

  	Template.game.rendered = function() {
  		//$('#gameCanvas').attr('width', window.innerWidth);
  		//$('#gameCanvas').attr('height' window.innerWidth);

  		// console.log(board);


  		$('#gameCanvas').attr('width', width*sizepadding);
  		$('#gameCanvas').attr('height', height*sizepadding);
		renderBoard(board);

	};
}
// Functions

function renderBoard(board){

	for (var i = 0; i < board.length; i++) {
		var color;

		if(board[i].val ==1){
			color= "#333";
		}else{
			color= "#ddd";
		}


		fillSquare(board[i].x, board[i].y, color);

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
			console.log(x, y)
		},
		createBoard: function(_gameName, _hostName){

			var _board = [];
			for(var i = 0; i < ROWS; i++){
				for(var j = 0; j < COLUMNS; j++){
				_board.push({"x": i, "y": j, "val": 0})
				}
			}
			var gameID = Game.insert({hostName: _gameName, hostName: _hostName,
				board: _board});
			console.log("CREATED GAME")

			return gameID;
		},
		updateBoard: function(_hostName, x, y){
			Game.update({hostName : _hostName, board: { $elemMatch: { "x": x, "y": y } } },
								 { $set: { "board.$.val" : 1 }});
		     // console.log("UPDATED "+ _hostName +" with x:" + x +" y:" + y);
		}
	});

	Meteor.publish('game', function(args){
		return Game.find({"hostName": "AggeFan"});
	});

	Meteor.startup(function () {

		console.log('server startup')
		// code to run on server at startup
	});
}

function generateMine(){
	return Math.round(Math.random());
}
