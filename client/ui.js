jQuery(document).ready(function() {

$('body').css('display', 'none');
$('body').fadeIn('fast');

var $boardSizeItem = $('.select-board-size li');

$boardSizeItem.on('click', function(){
	$boardSizeItem.removeClass('selected');
	$(this).addClass('selected');
});




  $('#createGame').click(function(e){
    // window.goto="http://localhost";
    //$('body').fadeOut('slow',function(){
    	//$('body').fadeIn('slow', function(){

    		 window.location = "http://localhost"
    	// });
    // });

    e.preventDefault();
  });










});
	