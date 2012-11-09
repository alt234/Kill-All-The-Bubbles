function Game() {
	this.gameHasStarted = false;
	
	this.currentLevel = 1;
	this.levelThreshold = 100;
	this.currentLevelThreshold = this.levelThreshold * this.currentLevel;

	this.score = 0;
	this.highScore = 0;
	this.minScore = -100;
	this.pointsToNextLevel = this.currentLevelThreshold;
	this.missedBubblePenalty = 10;

	this.timeModifier = 850;
	this.minTimeModifier = 30;
	this.startModifierDegradation = 110;
	this.modifierDegradationFactor = 15;
	this.maxTimeBetweenBubbleCreation = 1500;
	this.minTimeBetweenBubbleCreation = 200;
	this.minBubbleTravelTime = 100;
	this.minSway = 20;
	this.maxSway = 100;
	this.swayTime = 3000;
}

Game.prototype.Start = function() {
	var _this = this;
	
	_this.initLevel(5);

	var add = function() {
        _this.addBubble(_this);
        var rand = Math.round(Math.random() * (_this.maxTimeBetweenBubbleCreation - _this.minTimeBetweenBubbleCreation)) + _this.maxTimeBetweenBubbleCreation;
        setTimeout(add, rand);
    }

    add();
}

Game.prototype.addBubble = function(_this) {
	var bubble = new Bubble();
	var offScreenDistance = $(window).height() + bubble.dimensions;
	
	var bubbleTravelTime = (bubble.dimensions * _this.timeModifier);

	if (bubbleTravelTime < _this.minBubbleTravelTime) {
		bubbleTravelTime = _this.minBubbleTravelTime;
	}
		
	bubble.domElement.appendTo("body").animate({ top: "-=" + offScreenDistance + "px" }, {
		queue: false, 
		duration: bubbleTravelTime, 
		easing: "linear",
		complete: function() {
			$(this).remove();
			if (!_this.gameHasStarted) {
				return;
			}
			
			var previousLevelThreshold = _this.currentLevelThreshold - _this.levelThreshold * _this.currentLevel;
			
			_this.score -= _this.missedBubblePenalty;
			
			_this.pointsToNextLevel += _this.missedBubblePenalty;
			if (_this.score < previousLevelThreshold) {
				_this.score = previousLevelThreshold;
				
				_this.pointsToNextLevel = _this.currentLevelThreshold - previousLevelThreshold;
			}
			
			_this.updateStats();
		}
	}).mousedown(function() {		
		$(this).stop();
		$(this).remove();
		
		if (!_this.gameHasStarted) {
			_this.gameHasStarted = true;
			$(".stats").show();
			return;
		}
		
		var prevScore = _this.score;
		
		_this.score += bubble.value;
		_this.pointsToNextLevel -= bubble.value;
		
		if (_this.score >= _this.currentLevelThreshold && prevScore < _this.currentLevelThreshold) {
			_this.increaseDifficulty();
		}
		
		_this.updateStats();
	});

	var sideToSide = function() {
		var sway1 = Math.floor(Math.random() * (_this.maxSway - _this.minSway + 1)) + _this.minSway;
		var sway2 = Math.floor(Math.random() * (_this.maxSway - _this.minSway + 1)) + _this.minSway;

		bubble.domElement.animate({
			left:"-="+sway1
		}, _this.swayTime, function() {
			$(this).animate({ left:"+="+sway2 }, _this.swayTime)
		});
	}
	
	sideToSide();
	setInterval(sideToSide, _this.swayTime * 2);
}

// Need to see if I come can up with some sort of progression that doesn't require all the special cases. So far though these special cases make this is the most fun variant.
Game.prototype.increaseDifficulty = function() {
	this.currentLevel += 1;
	if (this.currentLevel > 6) {
		this.startModifierDegradation = this.startModifierDegradation - this.modifierDegradationFactor;
		if (this.startModifierDegradation <= 50) this.startModifierDegradation = 50;
		
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
	
	if (this.currentLevel == 2) this.maxTimeBetweenBubbleCreation -= 500;
	else if (this.currentLevel == 3) this.maxTimeBetweenBubbleCreation -= 300;
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

Game.prototype.initLevel = function(level) {
	for (var i = 1; i < level; i++) {
		this.increaseDifficulty();
	}
	
	this.score = this.currentLevelThreshold - this.levelThreshold * this.currentLevel;
	this.highScore = this.currentLevelThreshold - this.levelThreshold * this.currentLevel;
	
	// Technically at level 1, when the page loads you aren't actually playing. Clicking a bubble starts the game. This just makes sure the game isn't running if we start at level 1 and is running if we force it to something else.
	if (this.currentLevel > 1) {
		this.gameHasStarted = true;
		$(".stats").show();
	}
	
	this.updateStats();
}

Game.prototype.updateStats = function() {
	if (this.score < this.minScore) {
		this.score = this.minScore;
	}
	
	if (this.score > this.highScore) {
		this.highScore = this.score;
	}
	
	$("#scoreValue").text("Score: " + this.score);
	$("#highScoreValue").text("High Score: " + this.highScore);
	$("#levelValue").text("Level: " + this.currentLevel);
	$("#pointsToNextLevel").text("Next: " + this.pointsToNextLevel);
}

function Bubble() {
	this.minSize = 40;
	this.maxSize = 200;

	var minOpacity = 25;
	var maxOpacity = 70;
	
	var colors = new Array();
	colors[0] = "#05F2F2";
	colors[1] = "#FF007E";
	colors[2] = "#792BA5";
	colors[3] = "#00FF0E";
	colors[4] = "#FFFF00";
	colors[5] = "#FFF";
	
	this.minX = $(window).width() * .5;
	this.maxX = $(window).width() - this.maxSize;
	
	var opacity = Math.floor(Math.random() * (maxOpacity - minOpacity + 1)) + minOpacity;
	var color = colors[Math.floor(Math.random() * colors.length)];
	
	var distanceFromLeft = Math.floor(Math.random() * (this.maxX - this.minX + 1)) + this.minX;
	
	this.dimensions = Math.floor(Math.random() * (this.maxSize - this.minSize + 1)) + this.minSize;
	
	this.value = Math.floor(this.maxSize / parseInt(this.dimensions)) * 10;
	
	this.domElement = $("<div />", {
		"css": {
			"height": this.dimensions + "px",
			"width": this.dimensions + "px",
			"position": "absolute",
			"top": $(window).height() + "px",
			"left": distanceFromLeft + "px",
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