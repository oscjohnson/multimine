	
	var canvas = document.getElementById('board');
	var context = canvas.getContext("2d");

	//Settings
	var showMines = false;
	var width = 24;
	var height = 18;
	var padding = 3;
	var size = 30;
	var sizepadding = size + padding;
	var mineSize = 50;
	//Settings END


	canvas.addEventListener('click', boardClick, false);
	canvas.addEventListener('contextmenu', boardRightClick, false);

	var board = [];
	var checkBoard = [];
		
	createBoard();	
	drawBoard();


	function createBoard(){
		//create the array
		for (var i = 0; i < width; i++) {
			board.push(new Array(height))
			checkBoard.push(new Array(height))
		};

	

		placeMines(mineSize);
		
	}


	function placeMines(mineSize){
		var mineCounter = 0;

		while( mineCounter < mineSize ){
			if(placeMine()){
				mineCounter++;
			}
		}

		function placeMine(){
			var r = randomXY();
			if(board[r.x][r.y] == undefined){
				board[r.x][r.y]= 1;
				return true;
			}else{
				return false;
			}


		}

		return mineCounter;

	}


	function printletter(x,y, content){
		context.fillStyle = "#000000";
		var fontsize = Math.round(0.6*size)+ "px";
		context.font = "bold "+ fontsize +" Arial";
  		context.fillText(content, Math.round(0.33*size) + x*sizepadding, Math.round(0.73*size) + y*sizepadding);
	}


	function randomXY(){
		var x = Math.floor(Math.random()*width);
		var y = Math.floor(Math.random()*height);
		return {x:x,y:y};
	}
	function boardRightClick(ev){
		ev.preventDefault();
		var x = ev.clientX - canvas.offsetLeft;
	    var y = ev.clientY - canvas.offsetTop;
	    var xBoard  = Math.ceil(x / sizepadding)-1;
	    var yBoard  = Math.ceil(y / sizepadding)-1;

		fillSquare(xBoard, yBoard, '#00DD00');
	}

	function boardClick(ev) 
	{
		
	    var x = ev.clientX - canvas.offsetLeft;
	    var y = ev.clientY - canvas.offsetTop;
	    var xBoard  = Math.ceil(x / sizepadding)-1;
	    var yBoard  = Math.ceil(y / sizepadding)-1;

	    var mines;
		if(board[xBoard][yBoard] == 1){
			fillSquare(xBoard, yBoard, '#DD0000');
		
		}else{
	    	discoverField({x:xBoard, y:yBoard});
		}


	}

	function outputSquare(x,y){
		var num = checkSurroundingsForMines({x:x, y:y});

		if(board[x][y] == '1'){
			fillSquare(x, y, '#DD0000');
		}
		else if(num == 0){
			fillSquare(x, y, '#DDDDDD');	
		}
		else{
			fillSquare(x, y, '#AAAAAA');
			printletter(x,y, num)
		}
	}

	function discoverField(clickedSquare){
		var number =checkSurroundingsForMines(clickedSquare);

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
					if(checkBoard[i][j] !== 'x'){
						checkBoard[i][j] = 'x';
						discoverField({x:i,y:j});
					}
				};
			};

		}	

		outputSquare(clickedSquare.x, clickedSquare.y, number);
		

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

		for (var i = xstart-1; i <= xstop+1; i++) {
			for (var j = ystart-1; j <= ystop+1; j++) {
				if(board[i][j] == 1){
					counter++;
				}
			};	
		};

		return counter;
	}

	function fillSquare(x,y,color){
		context.fillStyle = color;
		context.fillRect(x*sizepadding, y*sizepadding, size, size);
	}

	function drawBoard(){

		for (var i = 0; i < width; i++) {
			for (var j = 0; j < height; j++) {
				if(showMines){
					if(board[i][j] == 1){
					context.fillStyle = "#000000";
					context.fillRect(i*sizepadding, j*sizepadding, size, size);
						
					}else{
						
					context.fillStyle = "#AAAAAA";
					context.fillRect(i*sizepadding, j*sizepadding, size, size);
					}
				}else{
					context.fillStyle = "#AAAAAA";
					context.fillRect(i*sizepadding, j*sizepadding, size, size);

				}
			};
		};
	}


