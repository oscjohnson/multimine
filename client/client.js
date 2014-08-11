/*
	Client logic in here.
*/


// Global variables = bad practice
var board;
var userid;
var startTime;
var apm = 0;
var curs;
var overlayCanvasOffset = 50;

// Setting localStorage if gameID changes, avoiding loss of data if user
// accidently refreshes page and cleaning up data if user decides to log out.
Deps.autorun(function(){
	if(!Session.equals('gameID', undefined)){
		localStorage.setItem('gameID', Session.get('gameID'))
	}
	if(!Meteor.userId()){
		Meteor.call('logoutUser', userid);
		Session.set("gameID", null)
	} else{
		userid = Meteor.userId();
	}
})	

Meteor.startup(function() {

	// Pick up latest gameID if user accidently refreshes page.
	if(localStorage.getItem("gameID") != "null"){
		Session.set("gameID", localStorage.getItem("gameID"));
	} 
});

/* TEMPLATES */

// Handling the event when the user clicks the creategame button, telling the server
// to create a new game with the correct size.
Template.creategame.events({
	//Creates a game on the server with parameters specified in the form.
	'click #createGame' : function(){
		size = $('.creategame-wrapper .select-board-size .selected').data('size');
		var size;
		switch(size){
			case "small": side = 15; break;
			case "medium": side = 25; break;
			case "large": side = 35; break;
		}
		name = $('.creategame-wrapper input[name="gameName"]').val();

		if(name == ""){
			name = $('input[name="gameName"]').attr('placeholder')
		}
		
		Meteor.call('createBoard',name, Meteor.userId(), side, side, function(err, data){
					if(err){
						console.log(err)
					} else{
						Session.set('gameID', data);
						Router.go('game')
					  }		
				});
		
	},
		'click #back' : function(){
			Router.go('lobby');
	}
});

Template.login.rendered = function(){
	Router.go('lobby');
}

Template.game.events({
'click #clickCanvas' : function(e){ //LeftClick
	
	//Get clicked square
	var c = getCanvasCoordinates(e);
	var coord = getBoardXY(c);
	var pos = board[coord.x+'_'+coord.y];


	//Check if square is already clicked
	if(pos.checked == '0'){

		pos.checked =1;
		var o =discover(coord);
		
		var queryObject = buildQuery(o);
		render(o)

		if(pos.isMine == '1'){
			//mine fail
			printPoints(c, score.leftfail)
		}else{
			//mine win
				if(Object.size(o) > 5){
					printPoints(c, score.reveal);
				}else{
					printPoints(c, score.leftwin);
				}
		}

		//Call to server update database
		Meteor.call('updateBoard',Session.get('gameID'), coord, queryObject);
	}
	apm++;
	

},
'contextmenu #clickCanvas' : function(e){ //RightClick
	e.preventDefault();

	//Get clicked square
	var coord =getCanvasCoordinates(e);
	var c = getBoardXY(getCanvasCoordinates(e));
	var pos = board[c.x+'_'+c.y];

	//Undiscovered square
	if(pos.checked == '0'){

		//Found mine
		if(pos.isMine == 1){
			pos.checked = 2;
			renderSquare(c.x,c.y)
			printPoints(coord, score.rightwin);

		}else{//Wrong guess, no mine!
			failanimation(c);
			printPoints(coord, score.rightfail);
		}

		//Call to server update database
		Meteor.call('rightClick',Session.get('gameID'), c);
	}
		apm++;
},

'click #back' : function(){
		Router.go('lobby');
	}
});

Template.lobby.events({
	'click #createGame': function(){
		Router.go('create');
	},
	'click .game-listitem': function(e){
		var gameID = this._id;
		
		// Joining a game and render the game template if join was done successfully.
		Meteor.call('joinGame', gameID, Meteor.userId(), function(err, response){
			if(err)
				console.log(err)
			else{
				Session.set('gameID', gameID);
				Router.go('game');
			}
		});
	}
});

Template.lobby.game = function(){
	return Game.find();
}

Template.lobby.numPlayers = function(){
	return this.players.length;
}

// Runs as the game template is rendered.
Template.game.rendered = function() {

		curs = Game.find();
		curs.observe({

			added: function(doc, beforeIndex){
				if(!Session.equals("gameID", null)){
					game = doc;	
					board = game.board;
					rightCanvasSize();
					renderBoard(board)
				}
			},

			// Triggered once there is a change of the current game,
			// e.g. another client clicked on a square.
			changed: function(newDoc, oldDoc){
				if(!Session.equals("gameID", null)){
					oldboard = board 
					game = newDoc;
					board = game.board;
					var positions = [];

					//Stitching remote game with local game so nothing is missed when rendered.
					for (var i = 0; i < game.width; i++) {
						for (var j = 0; j < game.height; j++) {
							var oldpos = oldboard[i+"_"+j];
							var pos = board[i+"_"+j];

							if((oldpos.checked == 1) && (pos.checked == 0)){
								pos.checked = 1;
							}
							else if((oldpos.checked == 2) && (pos.checked == 0)){
								pos.checked = 2;
							}

							if(pos.checked == 1 && (oldpos.checked == 0)){
								positions.push( {x:i, y:j} );
							}
							else if(pos.checked == 2 && (oldpos.checked == 0)){
								positions.push( {x:i, y:j} );
							}

		  				};	  			
		  			};

		  			// Render the changes
					render(positions);
			}
		}
	});
};
Template.scoreboard.user = function(){
	if(Game.find().fetch()[0] != undefined ){
		return Game.find({}, {fields: {players:  1}}).fetch()[0].players;
	}
}

Template.scoreboard.gamename = function(){
	if(Game.find().fetch()[0] !== undefined){
		return Game.find().fetch()[0].gameName;
	}
}

Template.scoreboard.currentUser = function(){
	if(Meteor.userId() == this._id){

		return "currentUser";

	}
}
	
/* FUNCTIONS */

/*
	Initializes all the canvases with right width, height and offsets.
*/
function rightCanvasSize(){


	var canvas =document.getElementById('clickCanvas');
	canvas.width = game.width*sizepadding -padding;
	canvas.height = game.height*sizepadding -padding;

	var canvas =document.getElementById('gameCanvas');
	canvas.width = game.width*sizepadding -padding;
	canvas.height = game.height*sizepadding -padding;

	var canvas =document.getElementById('overlayCanvas');
	canvas.width = game.width*sizepadding -padding + 2* overlayCanvasOffset;
	canvas.height = game.height*sizepadding -padding + 2* overlayCanvasOffset;

	var bordersize = + $('.canvas-wrapper').css('border-left-width')
						.substring(this.length-1, this.length+1);
	

	document.getElementById('overlayCanvas').style.top = -overlayCanvasOffset + bordersize +"px";
	document.getElementById('overlayCanvas').style.left = -overlayCanvasOffset + bordersize +"px";

	$('.game-wrapper').width(canvas.width + 276 + bordersize) 


}

//Render all the squares given.
function render(o){
	for (var i = 0; i < o.length; i++) {
		renderSquare(o[i].x, o[i].y);
	};

}

//Animation for wrong guess of a mine.
function failanimation(c){
	var globalID = requestAnimationFrame(repeatOften);

	var canvas = document.getElementById('gameCanvas');
	var context = canvas.getContext('2d');
	var r=0;

	function repeatOften() {
		r+=30;
		rgb = "rgb(" +r+ ", "+ r +", "+ r +")";
		context.fillStyle = rgb;
		context.fillRect(c.x*sizepadding, c.y*sizepadding, size, size);
	  	globalID = requestAnimationFrame(repeatOften);
	  	if(r> 254){
	  		cancelAnimationFrame(globalID);
	  		renderSquare(c.x,c.y);
	  	}
	}

}

//Animation of score points
function printPoints(c, score){

	var x = c.x;
	var y = c.y;

	var globalID = requestAnimationFrame(repeatOften);

	var canvas = document.getElementById('overlayCanvas');
	var context = canvas.getContext('2d');
	var r=250;
	var size =30;
	var padding = 3;
	var sizepadding = size + padding;
	var speed =r;
	var fontsize = Math.round(1.5*size)+ "px";
	var r,g,b;

	var offSetX = +50;
	var offSetY = +30;
	if(score > 0){
		r = 255;
		g = 190;
		b = 0;
		score= "+" + score;
	}else{
		r = 255;
		g = 0;
		b = 0;
	}

	function repeatOften() {

		r-=3;
		speed -=8;
		greycolor = 0;
		context.clearRect(0, 0, canvas.width, canvas.height);

		
		rgb = "rgba(" + r + ", "+ g +", "+ b +", "+  (0.004*r).toPrecision(2)  +")";
		


		context.fillStyle = rgb;


		context.font = "bold "+ fontsize +" Arial";

		context.strokeStyle = "rgba(" + 255 + ", "+ 255 +", "+ 255 +", "+  (0.004*r).toPrecision(2)  +")";
		context.lineWidth = 3;
      	context.strokeText(score, x + offSetX, y + offSetY);

		context.fillText(score, x + offSetX, y + offSetY);
		
		globalID = requestAnimationFrame(repeatOften);
	  	if(r< 1){
			context.clearRect(0, 0, canvas.width, canvas.height);
	  		cancelAnimationFrame(globalID);
	  	}
	}

}

//Render how many mines is surrounding this square
function printletter(x,y, content,color,textcolor){
	var gameCanvas = $("#gameCanvas");
	var context = gameCanvas[0].getContext('2d');
	var fontsize = Math.round(0.6*size)+ "px";

	fillSquare(x,y, color)
	context.fillStyle = textcolor;
	context.font = "bold "+ fontsize +" Arial";
	context.fillText(content, Math.round(0.33*size) + x*sizepadding, Math.round(0.73*size) + y*sizepadding);
}


//Render all the squares of the board
function renderBoard(board){
	
	for(pos in board){

		var xy = pos.split("_");
		var x = +xy[0]
		var y = +xy[1]
		renderSquare(x,y);

	}
		
}

//Builds the Query of which positions to alter in database
function buildQuery(positions){
	var query = {}
	for (var i = 0; i < positions.length; i++) {
		var key = "board." + positions[i].x + "_" + positions[i].y + ".checked";
		query[key] = 1;
	};
	return query;
}

function renderSquare(x,y){

	var pos = x+"_"+y;

	//Colors for the board.
	var green = "#4a4";
	var red ="#a44";
	var zeroground = "#eee";
	var undiscovered = "#555";
	var numbercolor = "#eee";
	var textcolor = "#000";

	renderBorder(x,y, "#000");
	
	//If mine is discovered
	if(board[pos].checked == 1){

		//Faulty mine discovery
		if(board[pos].isMine == 1){
			fillSquare(x, y, red);
		}
		else{
			//Blank space
			if(board[pos].surroundingMines == 0){
				fillSquare(x,y, zeroground);
			}
			//Print Number of surrounding mines
			else{
				printletter(x, y, board[pos].surroundingMines, numbercolor, textcolor);
			}
			
		}

	}
	//If mine is discovered correctly
	else if(board[pos].checked == 2){
		fillSquare(x, y, green);
	}
	//If square is undiscovered
	else{

		if(dev){

			if(board[pos].isMine == 1){
				fillSquare(x, y, "#000");
			}else{
				fillSquare(x, y, undiscovered);
			}
		}else{
			fillSquare(x, y, undiscovered);
		}

	}
}

//Renders a border on a given sqaure and color
function renderBorder(x,y,color){
	var gameCanvas = $("#gameCanvas");
	var context = gameCanvas[0].getContext('2d');
	context.fillStyle = color;
	context.fillRect(size + (x-1)*sizepadding, size + (y-1)*sizepadding, padding, sizepadding);		
	context.fillRect(size+ (x-1)*sizepadding, size + (y-1)*sizepadding, sizepadding, padding);
}

//Calculate canvas coordinates from window coordinates.
function getCanvasCoordinates(e){
	var x,y;

	if (e.offsetX == undefined) { 
	  x = e.pageX;
	  y = e.pageY;
	}
	else { 
	  x = e.offsetX;
	  y = e.offsetY;
	}

	return {x:x,y:y};
}

//Get board coordinates from canvas coordinates
function getBoardXY(coordinates){
	var xBoard  = Math.ceil(coordinates.x / sizepadding)-1;
    var yBoard  = Math.ceil(coordinates.y / sizepadding)-1;
    return {x:xBoard,y:yBoard};
}

//Paint a given board square a given color
function fillSquare(x,y, color){
		var gameCanvas = $("#gameCanvas");
		var context = gameCanvas[0].getContext('2d');
		context.fillStyle = color;
		context.fillRect(x*sizepadding, y*sizepadding, size, size);
}

//Paint the whole canvas in a given color
function paintBackground(color){
		var gameCanvas = $("#gameCanvas");
		var context = gameCanvas[0].getContext('2d');
		context.fillStyle = color;
		context.fillRect(0, 0, gameCanvas[0].width, gameCanvas[0].height);
}

/*
	Recieves the clicked square. Returns all the squares revealed by the click.
*/
function discover(clickedSquare){

	var recCounter =0;
	var positions = [];

	//Get right boundings for loops, checks if squares are at boards edges an compansates this.
	function getLimits(clickedSquare){
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

			if (clickedSquare.x == game.width-1) {
				xstop =clickedSquare.x-1;
			}
			if(clickedSquare.y == game.height-1){
				ystop= clickedSquare.y-1;
			}

			var limits ={};
			var startX= xstart-1;
			var stopX= xstop+1;

			var startY = ystart-1;
			var stopY = ystop+1;

			limits.startX = startX;
			limits.startY = startY;
			
			limits.stopY = stopY;
			limits.stopX = stopX;


			return limits;

	}

	//Recursive function to check which squares are revealed
	function discoverField(clickedSquare){
		var	number = + board[clickedSquare.x+'_'+clickedSquare.y].surroundingMines;


		if(number == 0){

			var limits = getLimits(clickedSquare);

			//Check all the squares around this square
			for (var i = limits.startX; i <= limits.stopX; i++) {
				for (var j = limits.startY; j <= limits.stopY; j++) {

					if(board[i+"_"+j].checked != '1'){

						board[i+"_"+j].checked = '1';
						positions.push({x: i, y:j});

						recCounter++;
						//Check recursively
						discoverField({x:i,y:j});
					}
				};
			};
		}
			
		if(recCounter > 0){

			recCounter=0;
			return positions;

		}else{

			//single square
			board[clickedSquare.x+"_"+clickedSquare.y].checked = '1';		
			positions.push({x:clickedSquare.x, y:clickedSquare.y});

			return positions;


		}


	}

	return discoverField(clickedSquare);
}

