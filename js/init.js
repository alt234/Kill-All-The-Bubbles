$(function () {
	var game = new Game();
	game.Start();
	

	
	$(".play").click(function () {
		game.Play();
	});
});