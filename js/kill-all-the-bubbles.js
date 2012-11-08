var gameHasStarted = false;

var currentLevel = 1;
var levelThreshold = 100;
var currentLevelThreshold = levelThreshold * currentLevel;

var score = 0;
var highScore = 0;
var minScore = -100;
var pointsToNextLevel = currentLevelThreshold;
var missedBubblePenalty = 10;

var timeModifier = 850;
var minTimeModifier = 30;
var startModifierDegradation = 110;
var modifierDegradationFactor = 15;
var maxTimeBetweenBubbleCreation = 1500;
var minTimeBetweenBubbleCreation = 200;
var minBubbleTravelTime = 100;
var minSway = 20;
var maxSway = 100;
var swayTime = 3000;

$(function () {
	initLevel(1);

	// Wait a couple of seconds before the bubbles start going. Surprise!
	setTimeout("startAddingBubbles()", 2500);
});

function startAddingBubbles() {
	var add = function() {
        addBubble();
        var rand = Math.round(Math.random() * (maxTimeBetweenBubbleCreation - minTimeBetweenBubbleCreation)) + maxTimeBetweenBubbleCreation;
        setTimeout(add, rand);
    }

    add();
}

function addBubble() {
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
			
			updateStats();
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
			increaseDifficulty();
		}
		
		updateStats();
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
function increaseDifficulty() {
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
	
	if (currentLevel == 2) maxTimeBetweenBubbleCreation -= 500;
	else if (currentLevel == 3) maxTimeBetweenBubbleCreation -= 300;
	else if (currentLevel > 3 && currentLevel < 8) maxTimeBetweenBubbleCreation -= 100
	else maxTimeBetweenBubbleCreation -= 50
	
	if (maxTimeBetweenBubbleCreation < 100) {
		maxTimeBetweenBubbleCreation = 100;
	}
	
	minTimeBetweenBubbleCreation -= 25;
	if (minTimeBetweenBubbleCreation < 10) minTimeBetweenBubbleCreation = 10;

	currentLevelThreshold += (levelThreshold * currentLevel);
	var previousLevelThreshold = currentLevelThreshold - (levelThreshold * currentLevel);
	
	pointsToNextLevel = currentLevelThreshold - previousLevelThreshold;
}

function initLevel(level) {
	for (var i = 1; i < level; i++) {
		increaseDifficulty();
	}
	
	score = currentLevelThreshold - levelThreshold * currentLevel;
	highScore = currentLevelThreshold - levelThreshold * currentLevel;
	
	// Technically at level 1, when the page loads you aren't actually playing. Clicking a bubble starts the game. This just makes sure the game isn't running if we start at level 1 and is running if we force it to something else.
	if (currentLevel > 1) {
		gameHasStarted = true;
		$(".stats").show();
	}
	
	updateStats();
}

function updateStats() {
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