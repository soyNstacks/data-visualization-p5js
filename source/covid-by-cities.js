function CovidByCity() {
    //    Name for the visualisation to appear in the menu bar.
    this.name = 'Covid Cases in the Great Britain';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'covid-by-cities';

    // Title to display above the plot.
    this.title = 'Covid Cases Per Population: By Region (GB)';
    
    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the gallery when a visualisation is added.
    this.preload = function() {
        var self = this;
        this.data = loadTable(
          './data/covid/great-britain.csv', 'csv', 'header',
          // Callback function to set the value
          // this.loaded to true.
          function(table) {
            self.loaded = true;
          });
    };

    
    this.setup = function() {
        // Font default
        textSize(18);
        // Redraw only when necessary -> limit number of times to redraw
        noLoop();

        // This function (for generating figures) is called in this.setup so that unnecessary recursive loop of this function in this.draw can be prevented 
        this.parseData();
    };
    
    // Initialise arrays for this.parseData()
    this.mapPointXArr = [];
    this.mapPointYArr = [];
    this.cityNameArr = [];
    this.caseCountArr = [];
    
    this.draw = function() {
        // If data has not loaded
        if (!this.loaded) {
          console.log('Data not yet loaded');
          return;
        }
        
        background(0);
        // Draw title on canvas
        this.drawTitle();
        
        // Size of ellipses
        this.size = 10;
        
        // Gets all rows from this.data
        this.rows = this.data.getRows();
        
        // To draw all ellipses to plot map according to geographical coordinates
        for (var i = 0; i < this.rows.length; i++) {
            this.longtitude = this.rows[i].getNum("lng");
            this.latitude = this.rows[i].getNum("lat");
            
            // Map geographical coordinates within canvas width and height
            this.x = map(this.longtitude,-8,2,20,width);
            this.y = map(this.latitude,49,61,50,height+50);

            noStroke();
            fill(230, 230, 230, 80); 
            // Draw ellipses 
            ellipse(this.x, this.y, this.size);
        }
        
        // Draw points of major cities 
        this.drawCoordinates();
        
        // Indicate meaning of *(asterisk) 
        textAlign(LEFT);
        fill('white');
        text('** Cumulative Figures (by whole pandemic), ', width * 0.66, height*0.9); 
        text('accurate as of July 2021', width * 0.67, height*0.93);
        
        // Draw legend onto canvas 
        this.colourLegend(width * 0.66, height*0.8);
        
    };
    
    // Plot points of major cities 
    this.drawCoordinates = function(){
        for(var j = 0; j < this.mapPointXArr.length; j++) {
            // If mouse is over point
            if(this.hover(this.mapPointXArr[j], this.mapPointYArr[j])) {
                // Conditions to display text upon mouse hover within canvas width and height boundaries
                if(mouseY <= 100) {
                    this.pointHover(this.cityNameArr[j], this.caseCountArr[j], j, color(0, 0, 0, 95), color(250, 250, 0), mouseX - 60, mouseY + 75);
                }
                
                else if(mouseX <= 100) {
                    this.pointHover(this.cityNameArr[j], this.caseCountArr[j], j, color(0, 0, 0, 95), color(250, 250, 0), mouseX + 180, mouseY - 75);
                }
                
                else if(mouseX >= width*0.8) {
                    this.pointHover(this.cityNameArr[j], this.caseCountArr[j], j, color(0, 0, 0, 95), color(250, 250, 0), mouseX - 200, mouseY - 75);
                }
                
                else if(mouseY >= height*0.8) {
                    this.pointHover(this.cityNameArr[j], this.caseCountArr[j], j, color(0, 0, 0, 95), color(250, 250, 0), mouseX - 60, mouseY - 75);
                }
                
                else {
                    this.pointHover(this.cityNameArr[j], this.caseCountArr[j], j, color(0, 0, 0, 95), color(250, 250, 0), mouseX - 20, mouseY - 75);
                }
                
            }
            else {
                fill(this.mapCaseCountToColour(this.caseCountArr[j])); 
                
            }
            
            // Size each ellipses (of major cities) according to number of covid cases 
            this.mapSize = map(this.caseCountArr[j], this.minCase, this.maxCase, 12, 28);
            ellipse(this.mapPointXArr[j], this.mapPointYArr[j], this.mapSize);
        }
    };
    
    // Iterating through, and parsing data for individual access to each major city on the map
    this.parseData = function() {
        var adminName = String(this.data.getColumn('admin_name'));
        this.cityName = adminName.split(','); 
        
        // Get relevant data from CSV file
        for(var p = 0; p < 66; p++) {
            var points = {
                'xPos' : this.data.getNum(p, 'lng'),
                'yPos' : this.data.getNum(p, 'lat'),
                'name' : this.data.get(p, 'admin_name'),
                'case' : this.data.getNum(p, 10)
            }
            
            // Map coordinates to appear within canvas boundaries
            this.mapPointX = map(points.xPos,
                                 -5.93,
                                 2.2382,
                                 20,
                                 width);
            this.mapPointY = map(points.yPos,
                                 50.3714,
                                 57.15,
                                 50,
                                 height+50);

            // Push to array for iteration 
            this.mapPointXArr.push(this.mapPointX);
            this.mapPointYArr.push(this.mapPointY);
            this.cityNameArr.push(points.name);
            this.caseCountArr.push(round(points.case));
        }
        
        // Find minimum and maximum number of cases 
        this.minCase = min(this.caseCountArr);
        this.maxCase = max(this.caseCountArr);
    };
    
    // Indicate number of cases according to city, according to each coordinate
    this.pointHover = function(city, caseCount, i, rectColour, textColour, x, y) {
        fill(rectColour);
        rect(x - 300, y - 30, 650, 88);
        
        textAlign(CENTER);
        fill(textColour);
        text('Number of Cases per 100,000 Population**', x, y);
        text(city + ': ', x, y + 30);
        text(caseCount, x, y+52);
    };
    
    // Hover function to return true when mouse is within distance, otherwise false
    this.hover = function(x, y) {
        if ( dist(mouseX, mouseY, x, y) < this.size/1.5 ) {
          return true;
        } 
        else {
          return false;
        }
    };
    
    // Map minimum and maximum case number to colour -> to visualise & comapre the case count between cities
    this.mapCaseCountToColour = function(value) {
        var red =  map(value,
                       this.minCase,
                       this.maxCase,
                       0,
                       255);
        var blue = 255 - red; 
        return color(red, 0 , blue, 80);
    };
    
    // Draw title onto canvas
    this.drawTitle = function() {
        fill('yellow');
        textAlign(CENTER);
        text('Covid Cases Per 100,000 Population (Main Cities in Great Britain)', width/2, 30);
    };
    
    // Legend to explain meaning of ellipse colours
    this.colourLegend = function(x, y) {
        colorMode(RGB);
        stroke(255);
        let from = color(0, 0, 255);
        let boxWidth = 50;
        let boxHeight = 30;
        let to = color(255, 0, 0);
        colorMode(RGB); 
        let interA = lerpColor(from, to, 0.33);
        let interB = lerpColor(from, to, 0.66);
        
        // Depicts the colours seen on ellipses
        fill(from);
        rect(x, y, boxWidth, boxHeight);
        fill(interA);
        rect(x+boxWidth, y, boxWidth, boxHeight);
        fill(interB);
        rect(x+(boxWidth*2), y, boxWidth, boxHeight);
        fill(to);
        rect(x+(boxWidth*3), y, boxWidth, boxHeight);  
        
        noStroke();
        fill('white');
        text('Severity of Covid-19 Case Count', x, y - 20);
        
        beginShape();
        rect(x, y - 10, boxWidth*3.5, 2);
        triangle(x+(boxWidth*3.5),
                 (y - 15),
                 x+(boxWidth*3.5),
                 (y - 2.5),
                 x+(boxWidth*3.7),
                 (y - 9.5));
        endShape();
    };
    
    // Redraw when mouse moves so that visualisations drawn upon hover will  be drawn after the previous, instead of overlapping one another
    this.mouseMoved = function() {
        redraw();
    };
    
}