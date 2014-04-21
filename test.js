
Game = new Meteor.Collection("games");

var size = 30;
var padding = 3;
var sizepadding = size + padding;

var width ;
var height ;
var game;

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
		// rightCanvasSize(game.width, game.height);
		board = game.board;
		//renderBoard(board);

  	});

  	Deps.autorun(function(){

  		game = Game.find({"hostName": hostName}).fetch()[0];
  		if(game !== undefined){

  			renderBoard(game.board)
  			width = game.width
  			height = game.height
  			board = game.board;

  		}



  	})

  	Template.game.events({
  		'click #gameCanvas' : function(e){

  			var c = getCanvasCoordinates(e);
  			var coord = getBoardXY(c);

  			// checkSurroundingsForMines(board, {x:coord.x, y:coord.y});

  			discoverField(coord);

  			Meteor.call('updateBoard', hostName,coord.x, coord.y);
  			// fillSquare(boardcoordinates.x, boardcoordinates.y, randomRGB());

  		}
  		
  	});


  	Template.game.rendered = function() {

		//renderBoard(board);

	};
}
// Functions
function rightCanvasSize(width, height){
	var canvas =document.getElementById('gameCanvas');
	canvas.width = width*sizepadding;
	canvas.height = height*sizepadding;
	//$('#gameCanvas').attr('width', width*sizepadding);
	//$('#gameCanvas').attr('height', height*sizepadding);
}

function printletter(x,y, content){
	var gameCanvas = $("#gameCanvas");
	var context = gameCanvas[0].getContext('2d');

	fillSquare(x,y, "#ddd")
	context.fillStyle = "#000000";
	var fontsize = Math.round(0.6*size)+ "px";
	context.font = "bold "+ fontsize +" Arial";
	context.fillText(content, Math.round(0.33*size) + x*sizepadding, Math.round(0.73*size) + y*sizepadding);
}


function renderBoard(board){

	for(pos in board){

		var color;
		var xy = pos.split("_");
		var x = +xy[0]
		var y = +xy[1]
	

		if(board[pos].checked ==1){

			if(board[pos].isMine ==1){
				fillSquare(x, y, "#d00");
			}else{
				if(board[pos].surroundingMines == 0){
					fillSquare(x,y, "ddd");
				}else{
					printletter(x, y, board[pos].surroundingMines);
				}
				
			}

		}else{
			fillSquare(x, y, "#aaa");
		}

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



function checkSurroundingsForMines(board, square){


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
		//console.log("start: " +( xstart-1 )+ ","+ (ystart-1)+ "  -  " + " stop: " + (xstop+1) + "," + (ystop+1) )
		for (var i = xstart-1; i <= xstop+1; i++) {
			for (var j = ystart-1; j <= ystop+1; j++) {
				if(board[i+'_'+j].isMine == 1){
					counter++;
				}
			};	
		};

	return counter;
}

function discoverField(clickedSquare){
		var	number = + board[clickedSquare.x+'_'+clickedSquare.y].surroundingMines;

		if(number == 0){
			// Propagera, checkSurroundingsForMines
			var xstart = clickedSquare.x;
			var ystart = clickedSquare.y;
			var xstop = clickedSquare.x;
			var ystop = clickedSquare.y;

			if (clickedSquare.x == 0) {
				xstart =1;
			}
			if(clickedSquare.y ==0){
				ystart= 1;
			}

			if (clickedSquare.x == width-1) {
				xstop =clickedSquare.x-1;
			}
			if(clickedSquare.y ==height-1){
				ystop= clickedSquare.y-1;
			}


			for (var i = xstart-1; i <= xstop+1; i++) {
				for (var j = ystart-1; j <= ystop+1; j++) {

					if(board[i+"_"+j].checked != '1'){
						Meteor.call("updateBoard","AggeFan",i,j)
						board[i+"_"+j].checked = '1';
						discoverField({x:i,y:j});
					}

				};
			};

		}	

		// outputSquare(clickedSquare.x, clickedSquare.y, number);
		// renderBoard(board);

}


if (Meteor.isServer) {

	Meteor.methods({
		createBoard: function(_gameName, _hostName, w, h){
			width = w;
			height = h;
			hostName = _hostName;
			var pos = "";

			var _board = {};

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

			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){
					_board[i+'_'+j].surroundingMines = checkSurroundingsForMines(_board, {x:i, y:j});

				}
			}

			var gameID = Game.insert({hostName: hostName, hostName: _hostName,
				board: _board, width: w, height: h});
			


			console.log("CREATED GAME")

			return gameID;
		},
		updateBoard: function(_hostName, x, y){

			var key = "board." + x + "_" + y + ".checked";
			// console.log(key)
			// console.log(typeof key)
			var action = {};
			action[key] = 1
			console.log(action)
 
			 Game.update({hostName: _hostName},{$set: action})
			 // db.games.update({hostName: "AggeFan"},{$set: {"board.3_1" : 1}})


		     // console.log("UPDATED "+ _hostName + " with: " + position);
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

	});



}

function generateMine(){
	return Math.round(Math.random());
}
