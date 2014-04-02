jQuery(document).ready(function($) {
	
	var canvas = document.getElementById('board');
	var context = canvas.getContext("2d");


	var width = 24;
	var height = 18;
	var padding = 2;
	var size = 30;
	var sizepadding = size + padding;


	canvas.addEventListener('click', boardClick, false);




	drawBoard();

	





	function boardClick(ev) 
	{
	    var x = ev.clientX - canvas.offsetLeft;
	    var y = ev.clientY - canvas.offsetTop;
	    var xBoard  = Math.ceil(x / sizepadding);
	    var yBoard  = Math.ceil(y / sizepadding);

	 	context.fillStyle = "#000000";
		context.fillRect( (xBoard-1)*sizepadding, (yBoard-1)*sizepadding, size, size);
	}

	function drawBoard(){

		
		for (var i = 0; i < width; i++) {
			for (var j = 0; j < height; j++) {

				context.fillStyle = "#AAAAAA";
				context.fillRect(i*sizepadding, j*sizepadding, size, size);
			};
		};
	}


});