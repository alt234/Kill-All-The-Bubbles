$(function () {
	var game = new Game();
	game.Start();
	
	var curr = 0;
	function removeBubbles () {
		if (curr === game.bubbles.length) {
			game.initGame();
			game.bubbles = new Array();
			game.gameHasStarted = true;
			game.updateStats();
			
			//$(".play").hide();
			$(".stats").fadeIn("slow");
			
			curr = 0;
			
			return;
		};
		
		game.bubbles[curr].stop().remove();
		curr++;

		setTimeout(removeBubbles, 100);
	}
	
	$(".play").click(function () {
		removeBubbles();
	});
});