$(function () {
	var game = new Game();
	game.Start();
	
	$(".play").click(function () {
		game.Play();
		$(".play").hide();
	});
	
	$("#restartText").click(function () {
		game.Replay();
		$("#gameOver").fadeOut(2000);
	});

    $("#quitText").click(function () {
	    game.Quit();
        $("#gameOver").fadeOut("slow");
    });
});
