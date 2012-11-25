$(function () {
	var game = new Game();
	game.Start();
	
	$(".play").click(function () {
		game.Play();
		$(".play").hide();
		$(".replay").show();
	});
	
	$(".replay").click(function () {
		game.Replay();
	});
});