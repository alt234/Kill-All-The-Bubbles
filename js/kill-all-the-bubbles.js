function Game(gamePosition) {
	/*$.getJSON( "http://smart-ip.net/geoip-json?callback=?",
		function(data) {
	    	alert(data.host + " " + data.city);
	    }
	);*/
	
	this.gamePosition = (typeof gamePosition === "undefined") ? "center" : gamePosition;
	this.bubbles = new Array();
	$("#total").html(this.bubbles.length);
}

Game.prototype.initGame = function() {
	this.maxHealth = 250;
	this.startingHealth = 170;
	this.highHealth = 180;
	this.lowHealth = 70;
	this.damage = 10;
    this.health = this.startingHealth;

	this.gameHasStarted = false;
	this.score = 0;
	this.highScore = 0;
	this.currentLevel = 1;
	this.levelThreshold = 100;
	this.currentLevelThreshold = this.levelThreshold * this.currentLevel;
	
	this.pointsToNextLevel = this.currentLevelThreshold;
	this.missedBubblePenalty = 10;
	this.timeModifier = 850;
	this.minTimeModifier = 30;
	this.startModifierDegradation = 110;
	this.modifierDegradationFactor = 15;
	this.maxTimeBetweenBubbleCreation = 1500;
	this.minTimeBetweenBubbleCreation = 200;
	this.minBubbleTravelTime = 100;
	
	this.totalBubblesPopped = 0;
	this.totalTealBubblesPopped = 0;
	this.totalPinkBubblesPopped = 0;
	this.totalPurpleBubblesPopped = 0;
	this.totalGreenBubblesPopped = 0;
	this.totalYellowBubblesPopped = 0;
	this.totalWhiteBubblesPopped = 0;
	
	this.initLevel(1);
}

Game.prototype.Start = function() {
	var _this = this;
	_this.initGame();
	
	//_this.initLevel(9); // Testing purposes
	
	var add = function() {
        _this.addBubble(_this);
        var rand = Math.round(Math.random() * (_this.maxTimeBetweenBubbleCreation - _this.minTimeBetweenBubbleCreation)) + _this.maxTimeBetweenBubbleCreation;
        setTimeout(add, rand);
    }

    add();
}

Game.prototype.Play = function() {
	this.initGame();
	this.gameHasStarted = true;
	this.updateStats();
	
	$("#health").removeClass("lowHealth");
	$("#health").animate({width: this.startingHealth}, 800);
	$("#total").html(this.bubbles.length);
	$(".stats").fadeIn("slow");
}

Game.prototype.Replay = function() {
	var _this = this;

	var removeBubble = function() {
		if (_this.bubbles.length === 0) {
			_this.Play();
			return;
		};
		
		_this.bubbles[0].stop().remove();
		_this.garbageCollectBubbleArray();

		setTimeout(removeBubble, 70);
	}
	
	removeBubble();
}

Game.prototype.Quit = function() {
	var _this = this;

    $(".stats").fadeOut("slow", function() {
        $(".play").show();
    });
}
Game.prototype.initLevel = function(level) {
	for (var i = 1; i < level; i++) {
		this.increaseDifficulty();
	}
	
	this.score = this.currentLevelThreshold - this.levelThreshold * this.currentLevel;
	this.highScore = this.currentLevelThreshold - this.levelThreshold * this.currentLevel;
	
	var previousLevelThreshold = this.currentLevelThreshold - (this.levelThreshold * this.currentLevel);
	this.pointsToNextLevel = this.currentLevelThreshold - previousLevelThreshold;
	
	// Technically at level 1, when the page loads you aren't actually playing. Clicking a bubble starts the game. This just makes sure the game isn't running if we start at level 1 and is running if we force it to something else.
	if (this.currentLevel > 1) {
		this.gameHasStarted = true;
		this.updateStats();
		
		$("#health").animate({width: this.startingHealth}, 1000);
		$(".play").hide();
		$(".stats").show();
	}
}

Game.prototype.addBubble = function(_this) {
	var bubble = new Bubble(_this.gamePosition);

	var bubbleTravelTime = (bubble.dimensions * _this.timeModifier);

	if (bubbleTravelTime < _this.minBubbleTravelTime) {
		bubbleTravelTime = _this.minBubbleTravelTime;
	}
		
	var bubbleDiv = bubble.domElement.appendTo("body").animate({ top: "-=" + ($(window).height() + bubble.dimensions) + "px" }, {
		queue: false, 
		duration: bubbleTravelTime, 
		easing: "linear",
		complete: function() {
			$(this).stop().remove(); // Apparently when the animation is completed it's not necessarilly stopped?
			_this.garbageCollectBubbleArray();
			
			if (!_this.gameHasStarted) {
				return;
			}
			
			var previousLevelThreshold = _this.currentLevelThreshold - _this.levelThreshold * _this.currentLevel;
			
			_this.score -= _this.missedBubblePenalty;

			var $health = $("#health");
			
			$health.animate({width: '-=' + _this.damage}, 100);
			_this.health -= _this.damage;
            
            if (_this.health < _this.maxHealth && _this.health > _this.highHealth) {
				$("#healthBorder").removeClass("glow");
			}
			else if (_this.health < _this.highHealth && _this.health > _this.lowHealth) {
				$("#health").removeClass("highHealth", 300);
			}
            else if (_this.health <= _this.lowHealth && _this.health > 0) {
				$health.addClass("lowHealth", 300);
            }
			else if (_this.health <= 0) {
                _this.health = 0;
				_this.updateStats();
				$("#gameOver").fadeIn("fast");
				_this.initGame();
				return;
			}
		
			_this.pointsToNextLevel += _this.missedBubblePenalty;
			if (_this.score < previousLevelThreshold) {
				_this.score = previousLevelThreshold;
				
				_this.pointsToNextLevel = _this.currentLevelThreshold - previousLevelThreshold;
			}
			
			_this.updateStats();
		}
	}).mousedown(function() {		
		$(this).stop().remove();
		
		_this.garbageCollectBubbleArray();
		
		if (!_this.gameHasStarted) {
			return;
		}
		
		_this.totalBubblesPopped++;
		if (_this.totalBubblesPopped > 0 && _this.totalBubblesPopped % 10 === 0) {
			var $health = $("#health");

			if (_this.health < _this.maxHealth) {
				$health.animate({width: '+=' + _this.damage}, 100);
                _this.health += _this.damage;

				if (_this.health === _this.maxHealth) { // We're about to hit max health, so make it glow.
					$("#healthBorder").addClass("glow");
				}
				else if (_this.health === _this.highHealth) { // Once animation is complete we'll hit the high health threshold. Turn it blue.
					$health.addClass("highHealth", 300);
				}
			}
		}
		
		var prevScore = _this.score;
		_this.score += bubble.value;
		_this.pointsToNextLevel -= bubble.value;
		
		if (_this.score >= _this.currentLevelThreshold && prevScore < _this.currentLevelThreshold) {
			_this.increaseDifficulty();
		}
		
		_this.updateStats();
	});

	var minSway = 20;
	var maxSway = 100;
	var swayTime = 3000;
	var sideToSide = function() {
		var sway1 = Math.floor(Math.random() * (maxSway - minSway + 1)) + minSway;
		var sway2 = Math.floor(Math.random() * (maxSway - minSway + 1)) + minSway;

		bubble.domElement.animate({
			left:"-="+sway1
		}, swayTime, function() {
			$(this).animate({ left:"+="+sway2 }, swayTime)
		});
	}
	
	sideToSide();
	setInterval(sideToSide, swayTime * 2);
	
	_this.bubbles.push(bubbleDiv);
	bubbleDiv.html("<p class='debug'>" + (_this.bubbles.length - 1) + "</p>");
	
	$("#total").html(_this.bubbles.length);
}

// Need to see if I come can up with some sort of progression that doesn't require all the special cases. So far though these special cases make this is the most fun variant.
Game.prototype.increaseDifficulty = function() {
	this.currentLevel += 1;
	
	if (this.currentLevel > 6) {
		this.startModifierDegradation = this.startModifierDegradation - this.modifierDegradationFactor;
		
		if (this.startModifierDegradation <= 50) {
			this.startModifierDegradation = 50;
		}
		
		if (this.currentLevel < 9) {
			this.levelThreshold += 50;
		}
	}
	
	if (this.currentLevel < 9) {
		this.timeModifier -= this.startModifierDegradation;
	}
	else {
		this.timeModifier -= 10;
	}
	
	if (this.timeModifier < this.minTimeModifier) {
		this.timeModifier = this.minTimeModifier;
	}
	
	if (this.currentLevel === 2) this.maxTimeBetweenBubbleCreation -= 500;
	else if (this.currentLevel === 3) this.maxTimeBetweenBubbleCreation -= 300;
	else if (this.currentLevel > 3 && this.currentLevel < 8) this.maxTimeBetweenBubbleCreation -= 100
	else this.maxTimeBetweenBubbleCreation -= 50
	
	if (this.maxTimeBetweenBubbleCreation < 100) {
		this.maxTimeBetweenBubbleCreation = 100;
	}
	
	this.minTimeBetweenBubbleCreation -= 25;
	if (this.minTimeBetweenBubbleCreation < 10) this.minTimeBetweenBubbleCreation = 10;

	this.currentLevelThreshold += (this.levelThreshold * this.currentLevel);
	var previousLevelThreshold = this.currentLevelThreshold - (this.levelThreshold * this.currentLevel);
	
	this.pointsToNextLevel = this.currentLevelThreshold - previousLevelThreshold;
}

Game.prototype.updateStats = function() {
    if (this.score < 0) {
		this.score = 0;
	}
	
	if (this.score > this.highScore) {
		this.highScore = this.score;
	}

	$("#scoreValue").text("Score: " + this.score);
	$("#highScoreValue").text("High Score: " + this.highScore);
	$("#levelValue").text("Level: " + this.currentLevel);
	$("#pointsToNextLevel").text("Next: " + this.pointsToNextLevel);
	$("#healthText").text(this.health);
}

Game.prototype.garbageCollectBubbleArray = function() {
	for (var i = 0; i < this.bubbles.length; i++) {
		if(!this.bubbles[i].is(':animated')) {
			this.bubbles.splice(i, 1);
			break;
		}
	}
	
	// Update indices
	for (var i = 0; i < this.bubbles.length; i++) {			
		this.bubbles[i].html("<p class='debug'>" + i + "</p>");
	}

	$("#total").html(this.bubbles.length);
}

function Bubble(gamePosition) {	
	var colors = new Array();
	colors[0] = "#05F2F2";
	colors[1] = "#FF007E";
	colors[2] = "#792BA5";
	colors[3] = "#00FF0E";
	colors[4] = "#FFFF00";
	colors[5] = "#FFF";
	var color = colors[Math.floor(Math.random() * colors.length)];
	
	var minOpacity = 25;
	var maxOpacity = 70;
	var opacity = Math.floor(Math.random() * (maxOpacity - minOpacity + 1)) + minOpacity;
	
	var minDimensions = 40;
	var maxDimensions = 200;
	
	var minX;
	var maxX;
	
	if (gamePosition === "left") {
		minX = maxDimensions;
		maxX = $(window).width() / 2;
	}
	else if (gamePosition === "right") {
		minX = $(window).width() / 2;
		maxX = $(window).width() - maxDimensions;
	}
	else { // treat anything else as centered.
		minX = ($(window).width() / 2) - ($(window).width() / 4) + (maxDimensions / 2);
		maxX = ($(window).width() / 2) + ($(window).width() / 4) - (maxDimensions/ 2);
	}
	
	var startingX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
	
	this.dimensions = Math.floor(Math.random() * (maxDimensions - minDimensions + 1)) + minDimensions;
	this.value = Math.floor(maxDimensions / parseInt(this.dimensions)) * 10;
	this.domElement = $("<div />", {
		"css": {
			"height": this.dimensions + "px",
			"width": this.dimensions + "px",
			"position": "absolute",
			"top": $(window).height() + "px",
			"left": startingX + "px",
			"background-color": color,
			"opacity": "." + opacity,
			"border-radius": "50%",
			/*"-moz-box-shadow": "3px 3px 3px #111",
			"-webkit-box-shadow": "3px 3px 3px #111",
			"box-shadow": "3px 3px 3px #111",*/
			"cursor": "pointer"
		}
	});
}
