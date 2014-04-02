jQuery(document).ready(function($) {
	
	var canvas = document.getElementById('board');
	var context = canvas.getContext("2d");
	var MINE =1;

	var width = 24;
	var height = 18;
	var padding = 2;
	var size = 30;
	var sizepadding = size + padding;
	var mineSize = 10;


	canvas.addEventListener('click', boardClick, false);

	var board = [];
	var mineCounter = 0;



		
	createBoard();	

	drawBoard();





	function createBoard(){
		//create the array
		for (var i = 0; i < width; i++) {
			board.push(new Array(height))
		};

		placeMines();
		
	}


	function placeMines(){
		var r = randomXY();

		if(board[r.x][r.y] == undefined && (mineCounter < mineSize) ){
			board[r.x][r.y] =1;
			mineCounter++;
			return placeMines();
		}else{
			return;
		}

	}


	function printletter(x,y, content){
		context.fillStyle = "#000000";
		context.font = "bold 18px Arial";
  		context.fillText(content, 10 + x*sizepadding, 22 + y*sizepadding);
	}


	function randomXY(){
		var x = Math.floor(Math.random()*width);
		var y = Math.floor(Math.random()*height);
		return {x:x,y:y};
	}


	function boardClick(ev) 
	{
		
	    var x = ev.clientX - canvas.offsetLeft;
	    var y = ev.clientY - canvas.offsetTop;
	    var xBoard  = Math.ceil(x / sizepadding)-1;
	    var yBoard  = Math.ceil(y / sizepadding)-1;

	    var mines = checkSurroundingsForMines({x:xBoard, y:yBoard});

	    printletter(xBoard, yBoard,mines);

	}

	function checkSurroundingsForMines(square){
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

		//console.log("("+ xstart+"," +ystart+") : (" +xstop+","+ystop+")" )

		for (var i = xstart-1; i <= xstop+1; i++) {
			for (var j = ystart-1; j <= ystop+1; j++) {
				if(board[i][j] == 1){
					counter++;
				}
			};	
		};
		return counter;
	}

	function drawBoard(){

		for (var i = 0; i < width; i++) {
			for (var j = 0; j < height; j++) {
				if(board[i][j] == 1){
				context.fillStyle = "#000000";
				context.fillRect(i*sizepadding, j*sizepadding, size, size);
					
				}else{
					
				context.fillStyle = "#AAAAAA";
				context.fillRect(i*sizepadding, j*sizepadding, size, size);
				}
			};
		};
	}


});