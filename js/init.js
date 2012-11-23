$(function () {
	var game = new Game();
	game.Start();
	
	$(".play").click(function () {
		game.initGame();
		game.gameHasStarted = true;
		game.updateStats();
		//$(".play").hide();
		$(".stats").fadeIn("slow");
	});
});