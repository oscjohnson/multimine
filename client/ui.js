jQuery(document).ready(function() {
	console.log('ui.js')

	// $('body').css('display', 'none');
	// $('body').fadeIn('fast');

	var $boardSizeItem = $('.select-board-size li');

	$('body').on('click', '.select-board-size li' , function(){
		$('.select-board-size li').removeClass('selected');
		$(this).addClass('selected');
	});






});
	