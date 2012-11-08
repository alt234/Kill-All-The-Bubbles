var gameHasStarted;
    
var currentLevel; 
var levelThreshold;
var currentLevelThreshold;
    
var score;
var highScore;
var minScore;
var pointsToNextLevel;
var missedBubblePenalty;
    
var timeModifier;
var minTimeModifier;
var startModifierDegradation;
var modifierDegradationFactor;
//var maxTimeBetweenBubbleCreation;
var minTimeBetweenBubbleCreation;
var minBubbleTravelTime;
var minSway;
var maxSway;
var swayTime;

function Game() {
	gameHasStarted = false;

	currentLevel = 1;
	levelThreshold = 100;
	currentLevelThreshold = levelThreshold * currentLevel;

	score = 0;
	highScore = 0;
	minScore = -100;
	pointsToNextLevel = currentLevelThreshold;
	missedBubblePenalty = 10;

	timeModifier = 850;
	minTimeModifier = 30;
	startModifierDegradation = 110;
	modifierDegradationFactor = 15;
	this.maxTimeBetweenBubbleCreation = 1500;
	minTimeBetweenBubbleCreation = 200;
	minBubbleTravelTime = 100;
	minSway = 20;
	maxSway = 100;
	swayTime = 3000;
}

Game.prototype.Start = function() {
	this.initLevel(1);
}

Game.prototype.StartAddingBubbles = function() {
	this.initLevel(1);
	
	var _this = this;
	var add = function() {
        _this.addBubble(_this);
        var rand = Math.round(Math.random() * (_this.maxTimeBetweenBubbleCreation - minTimeBetweenBubbleCreation)) + _this.maxTimeBetweenBubbleCreation;
        setTimeout(add, rand);
    }

    add();
}

Game.prototype.addBubble = function(_this) {
	var colors = new Array();
	colors[0] = "#05F2F2";
	colors[1] = "#FF007E";
	colors[2] = "#792BA5";
	colors[3] = "#00FF0E";
	colors[4] = "#FFFF00";
	colors[5] = "#FFF";

	var minSize = 40;
	var maxSize = 200;
	
	var minOpacity = 25;
	var maxOpacity = 70;
	
	var minX = $(window).width() / 2;
	var maxX = $(window).width() - maxSize;

	var distanceFromTop = $(window).height();
	var distanceFromLeft = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
	
	var bubbleDimensions = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
	var offScreenDistance = distanceFromTop + bubbleDimensions;
	
	var bubbleTravelTime = (bubbleDimensions * timeModifier);

	if (bubbleTravelTime < minBubbleTravelTime) {
		bubbleTravelTime = minBubbleTravelTime;
	}
	
	var opacity = Math.floor(Math.random() * (maxOpacity - minOpacity + 1)) + minOpacity;
	var color = colors[Math.floor(Math.random() * colors.length)];
	
	var bubble = $("<div />", {
		"css": {
			"height": bubbleDimensions + "px",
			"width": bubbleDimensions + "px",
			"position": "absolute",
			"top": distanceFromTop + "px",
			"left": distanceFromLeft + "px",
			"background-color": color,
			"opacity": "." + opacity,
			"border-radius": "50%",
			/*"-moz-box-shadow": "3px 3px 3px #111",
			"-webkit-box-shadow": "3px 3px 3px #111",
			"box-shadow": "3px 3px 3px #111",*/
			"cursor": "pointer"
		}
	}).appendTo("body").animate({ 
		top: "-=" + offScreenDistance + "px" 
	}, {
		queue: false, 
		duration: bubbleTravelTime, 
		easing: "linear",
		complete: function() {
			$(this).remove();
		
			if (!gameHasStarted) {
				return;
			}
			
			var previousLevelThreshold = currentLevelThreshold - levelThreshold * currentLevel;
			
			score -= missedBubblePenalty;
			pointsToNextLevel += missedBubblePenalty;
			if (score < previousLevelThreshold) {
				score = previousLevelThreshold;
				
				pointsToNextLevel = currentLevelThreshold - previousLevelThreshold;
			}
			
			_this.updateStats();
		}
	}).mousedown(function() {		
		$(this).stop();
		$(this).remove();
		
		if (!gameHasStarted) {
			gameHasStarted = true;
			$(".stats").show();
			return;
		}
		
		var size = $(this).css("width").replace(/[^-\d\.]/g, "");
		
		var thisBubblesPoints = Math.floor(maxSize / parseInt(size)) * 10;
		
		var prevScore = score;
		
		score += thisBubblesPoints;
		pointsToNextLevel -= thisBubblesPoints;
		
		if (score >= currentLevelThreshold && prevScore < currentLevelThreshold) {
			_this.increaseDifficulty();
		}
		
		_this.updateStats();
	});

	var sideToSide = function() {
		var sway1 = Math.floor(Math.random() * (maxSway - minSway + 1)) + minSway;
		var sway2 = Math.floor(Math.random() * (maxSway - minSway + 1)) + minSway;
		
		bubble.animate({
			left:"-="+sway1
		}, swayTime, function() {
			$(this).animate({ left:"+="+sway2 }, swayTime)
		});
	}
	
	sideToSide();
	setInterval(sideToSide, swayTime * 2);
}

// Need to see if I come can up with some sort of progression that doesn't require all the special cases. So far though these special cases make this is the most fun variant.
Game.prototype.increaseDifficulty = function() {
	currentLevel += 1;
	
	if (currentLevel > 6) {
		startModifierDegradation = startModifierDegradation - modifierDegradationFactor;
		if (startModifierDegradation <= 50) startModifierDegradation = 50;
		
		if (currentLevel < 9) {
			levelThreshold += 50;
		}
	}
	
	if (currentLevel < 9) {
		timeModifier -= startModifierDegradation;
	}
	else {
		timeModifier -= 10;
	}
	
	if (timeModifier < minTimeModifier) {
		timeModifier = minTimeModifier;
	}
	
	if (currentLevel == 2) this.maxTimeBetweenBubbleCreation -= 500;
	else if (currentLevel == 3) this.maxTimeBetweenBubbleCreation -= 300;
	else if (currentLevel > 3 && currentLevel < 8) this.maxTimeBetweenBubbleCreation -= 100
	else this.maxTimeBetweenBubbleCreation -= 50
	
	if (this.maxTimeBetweenBubbleCreation < 100) {
		this.maxTimeBetweenBubbleCreation = 100;
	}
	
	minTimeBetweenBubbleCreation -= 25;
	if (minTimeBetweenBubbleCreation < 10) minTimeBetweenBubbleCreation = 10;

	currentLevelThreshold += (levelThreshold * currentLevel);
	var previousLevelThreshold = currentLevelThreshold - (levelThreshold * currentLevel);
	
	pointsToNextLevel = currentLevelThreshold - previousLevelThreshold;
}

Game.prototype.initLevel = function(level) {
	for (var i = 1; i < level; i++) {
		this.increaseDifficulty();
	}
	
	score = currentLevelThreshold - levelThreshold * currentLevel;
	highScore = currentLevelThreshold - levelThreshold * currentLevel;
	
	// Technically at level 1, when the page loads you aren't actually playing. Clicking a bubble starts the game. This just makes sure the game isn't running if we start at level 1 and is running if we force it to something else.
	if (currentLevel > 1) {
		gameHasStarted = true;
		$(".stats").show();
	}
	
	this.updateStats();
}

Game.prototype.updateStats = function() {
	if (score < minScore) {
		score = minScore;
	}
	
	if (score > highScore) {
		highScore = score;
	}

	$("#scoreValue").text("Score: " + score);
	$("#highScoreValue").text("High Score: " + highScore);
	$("#levelValue").text("Level: " + currentLevel);
	$("#pointsToNextLevel").text("Next: " + pointsToNextLevel);
}