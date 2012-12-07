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

    $("#restartText").hover(
        function () {
            $(this).html("* Restart *");
        },
        function () {
            $(this).html("Restart");
        }
    );

    $("#quitText").click(function () {
	    game.Quit();
        $("#gameOver").fadeOut("slow");
    });

    $("#quitText").hover(
        function () {
            $(this).html("* Quit *");
        },
        function () {
            $(this).html("Quit");
        }
    );
});
