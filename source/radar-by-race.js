function RadarByRace() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Radar Chart: Tech Diversity By Race';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'tech-diversity-race-radar';

    // Property to represent whether data has been loaded.
    this.loaded = false;
    
    // Preload data
    
    this.preload = function() { 
        var self = this;
        this.data = loadTable(
        './data/tech-diversity/race-2018.csv', 'csv', 'header',
        // Callback function to set the value
        // this.loaded to true.
        function(table) {
        self.loaded = true;
        });  
    };
    
    // Array to store data values
    this.companyDataArr = [];
    
    this.setup = function() {
        // Set mode of angles to radians
        angleMode(RADIANS);
    
        // Set default text size
        textSize(16);
        // Get data of AirBnB
        this.colData = this.data.getColumn(1);
        
        // Convert all data strings to numbers.
        this.colData = stringsToNumbers(this.colData);
        
        // Create a select DOM element.
        this.select = createSelect();
        this.select.position(350, 80);
        
        // Options based on number of columns in heading (companies' names)
        this.companies = this.data.columns;
        for(var i = 1; i < this.companies.length; i++) {
            this.select.option(this.companies[i]);
        }
        
    };
    
    this.destroy = function() {
        // Remove DOM selector when other extensions are selected
        this.select.remove();
    }
    
    this.draw = function() {
        // Value of DOM selector 
        this.companyName = this.select.value();
        
        // Get the column of raw data for this.companyName.
        this.col = this.data.getColumn(this.companyName);

        // Convert all data strings to numbers.
        this.col = stringsToNumbers(this.col);
        
        // Copy the row labels from the table (the first item of each row).
        this.labels = this.data.getColumn(0);
        
        // Get minimum and Maximum data values for each company (by race)
        for(var i = 0; i < this.col.length; i++) {
            this.maxData = max(this.col);  
            this.minData = min(this.col);
        }
        
        // Translation of entire sketch to display within the canvas 
        translate(width/2, height/2);
        this.plotCircular();
        this.plotVertex();
        this.drawTitle();

    };
    
    // Initialise 
    this.offsetZ = 10.0;
    this.posXArray = [];
    this.posYArray = [];
    this.size = 11;
    
    // Plot shape on circular graph 
    this.plotVertex = function() {
        
        fill(0, 0, 255, 60);
        beginShape();
        for(var i = 0; i < this.col.length; i++) {
            // Map data values to display on the canvas 
            mapVal = map(this.col[i], this.minData, this.maxData, 0, width*0.028);
            
            // To save  current drawing style settings and transformations
            push();
            // Angle to rotate 
            this.angle = i * TWO_PI / this.col.length;
            // Rotate about angle 
            rotate(this.angle);
        
            let r = this.offsetZ * mapVal;
            // Draw ellipse points on graph
            noStroke();
            fill('pink');
            ellipse(r, 0, this.size);
            // Coordinates to draw vertex about a circular shape 
            let posX = r * cos(this.angle);
            let posY = r * sin(this.angle);
            vertex(posX, posY);
            
            // Push to arrays for iteration for mouse interactivity 
            this.posXArray.push(posX);
            this.posYArray.push(posY)
            
            pop(); 
            
            // Mouse interactivity; hover
            this.hover(mouseX, mouseY, i, this.posXArray[i], this.posYArray[i], this.labels[i], this.col[i]);
        }
        
        // CLOSE mode fills shape with colour
        endShape(CLOSE);
    };
    
    this.plotCircular = function() {
        strokeWeight(1);
        // Axis legend 
        stroke(92, 94, 82);
        for (var i = 0; i < this.col.length; i++) {
            this.correctAngle(this.angle);
            push();
            rotate(i * TWO_PI / this.col.length);
            line(0, 0, width*0.3, 0);
            text(this.labels[i], width*0.3 - 10, +5);
            pop();
            
        }
        
        // Plot circular axes
        stroke(92, 94, 82);
        noFill();
        for (let i = 1; i < 5; i++) {
            let size = width *0.142;
            ellipse(0, 0, size * i);
        }   

        
    };
    
    // Draw title onto canvas
    this.drawTitle = function() {
        fill('black');
        textAlign(CENTER);
        text(this.name, -width*0.0015, -height/2.3);
    };
    
    this.correctAngle = function(ang) {
        // Adds TWO_PI to this.angle if rad angle becomes negative 
        if(ang < 0) {
            ang = ang + TWO_PI;
        }
    };
    
    // Mouse interaction upon hover
    this.hover = function(mouse_x, mouse_y, i, x, y, label, val) {
        ellipse(mouse_x-width/2, mouse_y-height/2, this.size/2);
        if(dist(mouse_x-width/2, 
                    mouse_y-height/2, 
                    x, 
                    y) 
           < this.size/2) {

                text(label + ': ' + val + '%', x - 20, y - 45);
            }
    };

}