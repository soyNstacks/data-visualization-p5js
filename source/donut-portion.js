function Portion(label, val, start, red) {
    
    this.label = label;
    // Values to be only between 0 and 1
    this.value = constrain(val, 0.0, 1.0);
    
    // Angle to start the arc of donut chart 
    this.start = constrain(start, 0.0, TWO_PI);
    // Map values according to angle so that each portion of a donut chart is displayed accurately on canvas
    var valAngle = map(this.value, 0.0, 1.0, 0.0, TWO_PI);
    // Angle to utilise for coordinates on an arc
    this.middle = this.start + valAngle * 0.5;
    // Angle to stop the arc
    this.stop = this.start + valAngle;
    
    // When each portion slice is selected (mouse hover) 
    this.selectFill = color(red, 99, 99, 255);
    // When not selected (mouse is not on portion)
    this.unselectFill = color(red, 89, 49, 189);
    // Default colours of portions on donut
    this.fill = this.unselectFill; 
    // Set to false 
    this.focused = false;
    this.labelInset = 1.12; 
    this.labelSpace = 30; 

    // Text to display on canvas with mouse interactivity 
	this.toString = function() {
        var Str = this.label + ": " + (this.value * 100).toFixed(2) + "%";
		return Str;
	}; 
    
	this.draw = function(pieX, pieY, radius) {
        // Colour to fill when in focus 
		if (this.focused) {
			this.fill = lerpColor(this.fill,
					this.selectFill,
					Portion.focusFadeIn);
		} else {
			this.fill = lerpColor(this.fill,
					this.unselectFill,
					Portion.focusFadeOut);
		} 
 
		fill(this.fill);
        // Draw arc shape 
		arc(pieX, pieY, radius, radius,
			this.start, this.stop);
        
        // To illustrate the appearance of a donut
        fill(255);
        ellipse(pieX, pieY, radius*0.5);
        
        this.toString();
	};

    // Text to display on canvas upon mouse interactivity 
	this.displayTitle = function(pieX, pieY, radius) {
		var x = pieX + cos(this.middle) * radius * this.labelInset;
		var y = pieY + sin(this.middle) * radius * this.labelInset;
        textSize(25);
		fill(5, 5, 5);
		text(this, x, y); 
        
	};

    // Legend for graph
    this.displayLegend = function(i, pieX, pieY) {
        var x = pieX + 50 + this.radius;
        var y = pieY + (this.labelSpace * i) - this.radius / 3;
        var boxWidth = this.labelSpace / 2;
        var boxHeight = this.labelSpace / 2;
        
        fill('black');
        rect(x, y, boxWidth, boxHeight);

        fill('black');
        noStroke();
        textAlign('left', 'center');
        textSize(12);
        text(this, x + boxWidth + 10, y + boxWidth / 2);
        
  };
    
    // Add TWO_PI to prevent angle from being < 0rad
	this.hover = function(angle) {
		angle = angle < 0 ? angle + TWO_PI : angle;
		return angle > this.start && angle < this.stop;
	};
}

Portion.focusFadeIn = 0.05;
Portion.focusFadeOut = 0.025;