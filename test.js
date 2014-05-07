Game = new Meteor.Collection("games");




var size = 30;
var padding = 3;
var sizepadding = size + padding;
var apm=0;
var width ;
var height ;
var game;
var dev = false;
var hostName ="AggeFan"

var userid;

var startTime;

var score = {
	rightwin: 10,
	rightfail: -5,
	leftwin: 1,
	leftfail: -10,
	reveal: 5
}
console.log(score.rightwin)
if (Meteor.isClient) {
	var board;

	Deps.autorun(function(){
		if(!Meteor.userId()){
			Meteor.call('logoutUser', userid);
		}else{
			userid = Meteor.userId();
		}
	})

  	Meteor.subscribe('game');
  	Meteor.subscribe('allUsers');

	Deps.autorun(function(){if(Meteor.user()){}});

  	
	Meteor.startup(function() {
    	curs = Game.find({hostName: "AggeFan"});

    	curs.observe({
	  		added: function(doc, beforeIndex){

	  			game = doc;
	  			board = game.board;
	  			rightCanvasSize();
	  			renderBoard(board)

	  		},
  			changed: function(newDoc, oldDoc){
  				oldboard = board 
	  			game = newDoc;
	  			board = game.board;
  				
  				//Stitch
	  			for (var i = 0; i < game.width; i++) {
	  				for (var j = 0; j < game.height; j++) {
	  					if((oldboard[i+"_"+j].checked == 1) && (board[i+"_"+j].checked == 0)){
	  						board[i+"_"+j].checked = 1;
	  					}
		  			};	  			
		  		};
  			
  				renderBoard(board)
  			}
  		});

    	/*
  		curs2.observe({
  			changed: function(newdoc, olddoc){

  			}
			//Meteor.users.update({_id: data.user._id}, {$set:{"profile.online":true}})
  		})*/
  	});


  	Template.game.events({
  		'click #overlayCanvas' : function(e){


  			var c = getCanvasCoordinates(e);
  			var coord = getBoardXY(c);
  			//Om det behövs uppdateras gör det.
  			if(board[coord.x+'_'+coord.y].checked == '0'){
	  			var o =discover(coord);

	  			renderBoard(board)
	  			if(board[coord.x+'_'+coord.y].isMine == '1'){
	  				//mine fail
	  				printPoints(c, -10)
	  			}else{
	  				//mine win

	  				if(Object.size(o) > 5){
	  					printPoints(c, score.reveal);
	  				}else{
	  					printPoints(c, score.leftwin);
	  				}
	  			}
	  			Meteor.call('updateBoard',"AggeFan", coord, o);
  				
  			}
  			apm++;
  		},
  		'contextmenu #overlayCanvas' : function(e){
  			e.preventDefault();
  			var coord =getCanvasCoordinates(e);
  			var c = getBoardXY(getCanvasCoordinates(e));

  			if(board[c.x+'_'+c.y].checked == '0'){

	  			if(board[c.x +'_'+ c.y].isMine == 1){
	  				//desarmerat mina
	  				board[c.x+'_'+c.y].checked =2;
	  				renderBoard(board)
	  				printPoints(coord, score.rightwin)
	  			}else{
	  				//failflash
	  				failanimation(c);
	  				printPoints(coord, score.rightfail)
	  			}
  				Meteor.call('rightClick', "AggeFan", c);
  			

  			}else{
  				// console.log('already checked')
  			}
  			apm++;
  		},
  		'click #restartBoard' : function(){
			Meteor.call('clearBoard',"AggeFan");
			Meteor.call('createBoard','my fun game', 'AggeFan', 30,30);
			Meteor.call('removePoints');
  		},
  		'click #startBoard': function(){
  			if($('#startBoard').text() == "START"){
	  			$('#startBoard').text("STOP");
	  			startTime = new Date().getTime();
  			}else{
  				var diff = new Date().getTime() -startTime;
	  			console.log(diff);
	  			console.log('apm: ' + apm/(diff/(60*1000) ) )
	  			$('#startBoard').text("START");
	  			startTime =0;
  			}
  		}
  	});


  	Template.game.rendered = function() {

		$(window).on('keydown', function(e){
			if(e.which == 83){
				//dev= !dev;
				renderBoard(board);
			}
		});


	};
	Template.scoreboard.user = function(){
		if(Meteor.users.find().fetch()[0] !== undefined){

			return Meteor.users.find({}, {sort: {"profile.score": -1 }});

		}
	}
	
	Template.scoreboard.currentUser = function(){
		if(Meteor.userId() == this._id){

			return "currentUser";

		}
	}

	Template.name.name = function(){
		if(Meteor.users.find().fetch()[0] !== undefined){
			var email= Meteor.users.find( this._id  ).fetch()[0].emails[0].address;
			email =email.split('@')
			return email[0];
		}
	}

	Template.score.score = function(){
		if(Meteor.users.find().fetch()[0] !== undefined){
			return Meteor.users.find( this._id  ).fetch()[0].profile.score
		}
	}

	Template.revealed.revealed = function(){
		//if(Meteor.users.find().fetch()[0] !== undefined){
			return Meteor.users.find( this._id  ).fetch()[0].profile.revealed
	//	}
	}	
}
// Functions
function rightCanvasSize(){

	var canvas =document.getElementById('gameCanvas');
	canvas.width = game.width*sizepadding;
	canvas.height = game.height*sizepadding;

	var canvas =document.getElementById('overlayCanvas');
	canvas.width = game.width*sizepadding;
	canvas.height = game.height*sizepadding;

}

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

function printPoints(c, score){

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

	var offSetX = 0;
	var offSetY = -30;
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
      	context.strokeText(score,c.x + offSetX, c.y + offSetY);

		context.fillText(score, c.x + offSetX, c.y + offSetY);
		
		globalID = requestAnimationFrame(repeatOften);
	  	if(r< 1){
			context.clearRect(0, 0, canvas.width, canvas.height);
	  		cancelAnimationFrame(globalID);
	  	}
	}

}


function printletter(x,y, content,color,textcolor){
	var gameCanvas = $("#gameCanvas");
	var context = gameCanvas[0].getContext('2d');

	fillSquare(x,y, color)
	context.fillStyle = textcolor;
	var fontsize = Math.round(0.6*size)+ "px";
	context.font = "bold "+ fontsize +" Arial";
	context.fillText(content, Math.round(0.33*size) + x*sizepadding, Math.round(0.73*size) + y*sizepadding);
}


function renderBoard(board){
	//console.log('renderBoard')

	for(pos in board){

		var xy = pos.split("_");
		var x = +xy[0]
		var y = +xy[1]
		renderSquare(x,y);

	}
}

function renderSquare(x,y){
		var pos = x+"_"+y;

		var green = "#4a4";
		var red ="#a44";


		var zeroground = "#eee";
		var undiscovered = "#555";
		var numbercolor = "#eee"
		var textcolor = "#000"

		renderBorder(x,y, "#000")
		
		if(board[pos].checked == 1){

			if(board[pos].isMine == 1){
				fillSquare(x, y, red);
			}else{
				if(board[pos].surroundingMines == 0){
					fillSquare(x,y, zeroground);
				}else{
					printletter(x, y, board[pos].surroundingMines, numbercolor, textcolor);
				}
				
			}

		}else if(board[pos].checked == 2){
			fillSquare(x, y, green);
		}else{
			 // fillSquare(x, y, "#aaa");
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

function paintOverlay(){
		var x = 2.5, y= 2.5, color ="#FF0";

		var gameCanvas = $("#overlayCanvas");
		var context = gameCanvas[0].getContext('2d');
		context.fillStyle = color;
		context.fillRect(x*sizepadding, y*sizepadding, size, size);
}

function renderBorder(x,y,color){
	var gameCanvas = $("#gameCanvas");
	var context = gameCanvas[0].getContext('2d');
	context.fillStyle = color;
	context.fillRect(size + (x-1)*sizepadding, size + (y-1)*sizepadding, padding, sizepadding);		
	context.fillRect(size+ (x-1)*sizepadding, size + (y-1)*sizepadding, sizepadding, padding);
}

function getCanvasCoordinates(e){
	var x;
	var y;
	var gCanvasElement = document.getElementById('overlayCanvas');

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

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

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
function discover(clickedSquare){



	var recCounter =0;
	var single = true;
	var queryObject = {};//'{hostName:"AggeFan"}, {$set: {'

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

				if (clickedSquare.x == game.width-1) {
					xstop =clickedSquare.x-1;
				}
				if(clickedSquare.y == game.height-1){
					ystop= clickedSquare.y-1;
				}

				//console.log('start ' + (xstart-1) ' , '+ (ystart+1) + " - " )
				for (var i = xstart-1; i <= xstop+1; i++) {
					for (var j = ystart-1; j <= ystop+1; j++) {

						if(board[i+"_"+j].checked != '1'){
							single = false;
							board[i+"_"+j].checked = '1';
							addToQuery(i,j);
							recCounter++;
							discoverField({x:i,y:j});
						}

					};
				};


			}
				
			if(recCounter > 0){

				recCounter=0;
				return queryObject;
			}else{
				board[clickedSquare.x+"_"+clickedSquare.y].checked = '1';		
				//single
				addToQuery(clickedSquare.x,clickedSquare.y)
				return queryObject; 
				recCounter=0;

			}

	}

	function addToQuery(x, y){

		var key = "board." + x + "_" + y + ".checked";
		queryObject[key] = 1;

	}
	return discoverField(clickedSquare);
}

if (Meteor.isServer) {
	Accounts.onLogin(function(data){
		Meteor.users.update({_id: data.user._id}, {$set:{"profile.online":true}})
	})


	Accounts.onCreateUser(function(options, user) {
	  user.profile = options.profile ? options.profile : {online: false};
	  return user;
	});


	Meteor.publish('game', function(args){
		return Game.find({"hostName": hostName});
	});

	Meteor.publish('allUsers', function(args){
		return Meteor.users.find({"profile.online": true}, {fields:{'emails':1, 'profile.score': 1, 'profile.revealed': 1}});
	});
	//Meteor.publish('userData', function(){return Meteor.users.find()	});

	Meteor.methods({
		createBoard: function(_gameName, _hostName, w, h){
			width = w;
			height = h;
			hostName = _hostName;
			var pos = "";

			var _board = {};

			//Place RandomMines, init the board
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

			//calculate all the surrounding mines
			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){
					_board[i+'_'+j].surroundingMines = checkSurroundingsForMines(_board, {x:i, y:j});

				}
			}

			var gameID = Game.insert({hostName: hostName, hostName: _hostName,
				board: _board, width: w, height: h, version: 0 });
			
			

			console.log("CREATED GAME")

			return gameID;
		},
		rightClick: function(_hostName, coord){
			x = coord.x;
			y = coord.y;
			var key = "board." + x + "_" + y + ".isMine";
			var action = {};
			action[key]

			var find = Game.find({hostName: _hostName}).fetch()
			var isMine =find[0].board[x+'_'+y].isMine;

			if(isMine ==1){
			//Om hittat mina RATT
				var key = "board." + x + "_" + y + ".checked";
				var action = {};
				action[key] = 2;
	 			Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":10}})
				Game.update({hostName: _hostName},{$set: action})
			}else{

				Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":-5}})
			}
 			//Om fail
		},
		updateBoard : function(_hostName, coordinates, queryObject){
			var revealsize= + Object.size(queryObject);
			var key = "board." + coordinates.x + "_" + coordinates.y + ".isMine";
			var action = {};
			action[key]

			var find = Game.find({hostName: _hostName}).fetch()
			var isMine =find[0].board[coordinates.x+'_'+coordinates.y].isMine;
			if(isMine ==1){
				Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":-10}})
			}else{
				if(revealsize > 5){
					Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":5}})	
				}else{
					Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":1}})	
				}

			}
			Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.revealed":revealsize}})
			Game.update({hostName: _hostName},{$set: queryObject})

		},
		clearBoard: function(_hostName){
			Game.remove({hostName: _hostName});
		},
		removePoints: function(){
			Meteor.users.update({}, {$set:{"profile.score":0}}, {multi: true})
			Meteor.users.update({}, {$set:{"profile.revealed":0}}, {multi: true})

		}
		,
		consoleLog: function(message){
			console.log(message)
		},
		logoutUser: function(userid){
			Meteor.users.update({_id: userid}, {$set:{"profile.online":false}});
	
		} 
	});


	Meteor.startup(function () {
		console.log('server startup')

	});



}

