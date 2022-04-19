function CovidByDate() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Covid Cases in 2020: Per Day (UK)';

    // A mandatory unique ID with no special characters for each visualisation.
    this.id = 'covd-by-region';

    // Title to display above the plot.
    this.title = 'Covid Cases in Second Half of 2020: By Date (UK)';

    // Names for each axis.
    this.xAxisLabel = 'Day';
    this.yAxisLabel = 'Number of Cases';

    this.colors = []; 
    this.dataByRowCol;
    
    // Count the number of frames drawn since the visualisation started to animate movement of ellipses 
    this.frameCount = 0;
    
    this.labelSpace = 30;
    var marginSize = 50;
    
    // Layout object to store all common plot layout parameters and methods.
    this.layout = {
        marginSize: marginSize,

        // Locations of margin positions. Left and bottom have double margin size due to axis and tick labels.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 3,
        pad: 8,

        plotWidth: function() {
        return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
        return this.bottomMargin - this.topMargin;
        },

        // Boolean to enable/disable background grid.
        grid: true,

        // Number of axis tick labels to draw so that they are not drawn on top of one another.
        numXTickLabels: 31,
        numYTickLabels: 8,
    };
    
    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/covid/covid-by-date.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function(table) {
            self.loaded = true;
        });

    };

    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return; 
        }  
        
        // Font defaults.
        textSize(18);
        textAlign(LEFT);
        
        // Set first and last day of the month
        this.firstDay = Number(this.data.columns[1]);
        this.lastDay = Number(this.data.columns[this.data.columns.length-1]);
        
        // Push colours to line graphs
        for(var i = 0; i < this.data.getRowCount(); i++) {
            this.colors.push(color(random(0,255),random(0,255),random(0,255)));
        }

        // Lowest and highest case count for mapping to canvas height
        this.minCase = 0;         // Minimum number of cases
        this.maxCase = 60000;       // Maximum number of cases
        
         // Create two sliders to control start and end days. Default to visualise full range 
        this.startSlider = createSlider(this.firstDay,
                                        this.lastDay - 1,
                                        this.firstDay,
                                        1);
        this.endSlider = createSlider(this.firstDay + 1,
                                      this.lastDay,
                                      this.lastDay,
                                      1);
        
        // Position of sliders
        this.startSlider.position(405, this.layout.topMargin - (this.layout.marginSize / 1.5));
        
        this.endSlider.position(1160, this.layout.topMargin - (this.layout.marginSize / 1.5));
        
        // Required to access this.largestCount[] in other functions
        this.parseData();
    };
    
    // Array to contain highest number of cases in each month 
    this.largestCount = [];
    
    // Function to iterate and parse data to find Highest number of covid cases in each month 
    this.parseData = function() {
        // Convert selected range of data into objects and arrays for easier access when finding max
        var dataArray = [];
        var rows = this.data.getRows();
        
        for(var r = 0; r < rows.length; r++) {
            this.dataByRow = this.data.getRow(r);   
            for(var c = 1; c < this.data.getColumnCount(); c++) {
                this.dataByRowCol = rows[r].getNum(c);
                dataArray.push(this.dataByRowCol);
            }
        }
        
        var arrByMonth = [];   
        var daysInAMonth = 31;
        
        for (var i = 0, j = dataArray.length; i < j; i += daysInAMonth) {
            this.temporary = dataArray.slice(i, i + daysInAMonth);
            arrByMonth.push(this.temporary);   //is an object with arrays
        }

        var largestNum = 0;
        for(var i = 0; i < arrByMonth.length; i++) {   //12 (months)
            this.test = arrByMonth[i];
            var largest = Math.max.apply(Math, arrByMonth[i]);
            if(largest > largestNum) {
                largestNum = largest;   
            }
            
            this.largestCount.push(largestNum);
        }
        
    };
    
    // Remove sliders when not at current visualisation anymore
    this.destroy = function() {
        this.startSlider.remove();
        this.endSlider.remove();
    };
    
    // Initialise for animation of ellipses on line graph
    this.step = 0.00002;
    this.pct = 0.0;
    this.x = 0.0;
    this.y = 0.0;
    
    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }    
        
        // Prevent slider ranges overlapping.
        if (this.startSlider.value() >= this.endSlider.value()) {
          this.startSlider.value(this.endSlider.value() - 1);
        }
        
        this.sliderStartDay = this.startSlider.value();
        this.sliderEndDay = this.endSlider.value();
        this.sliderNumDays = this.sliderEndDay - this.sliderStartDay
        
        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minCase,
                            this.maxCase,
                            this.layout,
                            this.mapCaseToHeight.bind(this),
                            0);

        // Draw x and y axis.
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel,
                       this.yAxisLabel,
                        this.layout);
        
        // The number of x-axis labels to skip so that only numXTickLabels are drawn.
        var xLabelSkip = ceil(this.sliderNumDays / this.layout.numXTickLabels);
        
        // Draw the tick label marking the start of the previous year.
        for(var i = 1; i < this.sliderNumDays+2; i++) {
            if (i % xLabelSkip == 0) {
                drawXAxisTickLabel(i, this.layout, this.mapDayToWidth.bind(this));
            }
         }  
        
        // Draw the title above the plot.
        this.drawTitle();

        // Draw animation of ellipses on line graph    
        this.animateEllipse();
        
    };
    
    // Plot line graph 
    this.drawLines = function(colr, x1, y1, x2, y2) {
        strokeWeight(2);  
        stroke(colr);
        beginShape();
        line(x1,
             y1,
             x2,
             y2
            );
        endShape();        
    };
        
    // Plot lines according to points and add animation of ellipses on graph
    this.animateEllipse = function() {
        // Number of days
        this.numDays = this.lastDay - this.firstDay + 1;
        
        // Declare variables 
        var startDay;
        var endDay;
        var beginX;
        var beginY;
        var beginY;
        var endX;
        var endY;
        var distX;
        var distY;
        
        // Split strings of month to add into array for iteration 
        var monthStr = String(this.data.getColumn(0));
        var monthArr = monthStr.split(',')
        
        // Equal segments on x-axis when sliders are used 
        var segmentWidth = this.layout.plotWidth() / this.sliderNumDays;
            
        // Loop over all rows and draw a line and ellipses from the previous coordinate to the current
        for (var i = 5; i < this.data.getRowCount(); i++) { 
            
            var previous = null;
            var row = this.data.getRow(i);  
            var monthL = row.getString(0); //months
            
            for(var k = 1; k < this.numDays+1; k+=1) {
                current = {
                    'day': this.firstDay  + k - 1 , // no. of days 
                    'case': row.getNum(k) //get no. of cases by day 
                } 

                if(previous != null 
                   && current.day > this.sliderStartDay
                   && current.day <= this.sliderEndDay 
                   ) {

                    // Range and offset values for sliders
                    var dayRange = this.endSlider.value() - this.startSlider.value();
                    var offset = map(current.day, this.startSlider.value(), this.endSlider.value(), 1, dayRange);

                    // Plot lines from previous to current coordinate points
                    this.drawLines(this.colors[i], 
                        this.mapDayToWidth(previous.day), 
                        this.mapCaseToHeight(previous.case), this.mapDayToWidth(current.day),
                        this.mapCaseToHeight(current.case));

                    beginX = this.mapDayToWidth(previous.day);
                    endX = this.mapDayToWidth(current.day);
                    beginY = this.mapCaseToHeight(previous.case);
                    endY = this.mapCaseToHeight(current.case);

                    distX = endX - beginX;
                    distY =  endY - beginY; 

                    // Movement of ellipses 
                    this.x = beginX + this.pct * distX;
                    this.y = beginY + this.pct * distY; 
                    this.pct += this.step; 

                    // When 28 or fewer years are displayed, also draw the final year x tick label.
                    if (this.sliderNumDays <= 28) {
                      drawXAxisTickLabel(current.day, this.layout,
                                         this.mapDayToWidth.bind(this));
                    }

                } 
                else {
                    noStroke();
                    fill(this.colors[i]); 
                    // Draw legend onto canvas
                    this.makeLegendItem(monthArr[i], i, this.colors[i]);
                } 

                previous = current;

                // Conditionals for movement of ellipses 
                if(this.pct < 1.0) {
                    this.drawEllipse(this.x, this.y, 10, 'black'); 
                } 
                if(this.pct > 1.0) {
                    this.drawEllipse(endX, endY, 10, this.colors[i]);
                    noStroke();
                    this.hover(endX, endY, this.colors[i], i, monthArr[i]);
                    this.step = 0;
                    // Lines within graph boundaries
                    if((mouseX >= this.layout.leftMargin) && (mouseX <= this.layout.rightMargin)) {
                        this.lineToMouse(mouseX, mouseY);
                    }
                }
            } 
        }
    };
    
    // Ellipse Points to draw when movement stops
    this.drawEllipse = function(ellipseX, ellipseY, size, colrs) {
        noStroke();
        fill(colrs);
        ellipse(ellipseX, ellipseY, size);
        
    };
    
    // Line that follows mouse
    this.lineToMouse = function(x, y) {
        stroke('red');
        strokeWeight(2);
        noFill();
        line(x, this.layout.topMargin, x, this.layout.bottomMargin);
        line(this.layout.leftMargin, y, this.layout.rightMargin, y);
    };
    
    // Display figures of highest case count upon mouse hover
    this.hover = function(x, y, colr, i, month) {
        if(dist(x, y, mouseX, mouseY) < 8) {
            this.displayFigure(i, colr, month);
        }
    }; 
    
    this.displayFigure = function(i, colr, month) {
        noStroke();
        fill(colr);
        textSize(16);
        text('Highest Case Count of ' + month + ' : ', this.layout.rightMargin*0.72, this.layout.topMargin + 30)
        text(this.largestCount[i], this.layout.rightMargin*0.8, this.layout.topMargin + 50);

    };

    // Draw title  
    this.drawTitle = function() {
        fill(0);
        noStroke();
        text(this.title,
             (this.layout.plotWidth() / 2) + this.layout.leftMargin,
             this.layout.topMargin - (this.layout.marginSize / 1.5));
    };
    
    // Map day to width to plot coordinates on canvas
    this.mapDayToWidth = function(value) {
        return map(value,
        this.sliderStartDay,
        this.sliderEndDay,
        this.layout.leftMargin,   // Draw left-to-right from margin.
        this.layout.rightMargin);
    };

    // Map case to height to plot coordinates on canvas
    this.mapCaseToHeight = function(value) {
        return map(value,
        this.minCase,
        this.maxCase,
        this.layout.bottomMargin, // Smaller case count at the bottom
        this.layout.topMargin);   // Larger case count on top.
    };

    // Legend 
    this.makeLegendItem = function(month, i, colour) {
        var x = this.layout.rightMargin*0.85;
        var y = (this.layout.topMargin - 58) + (this.labelSpace * i);
        var boxWidth = this.labelSpace / 2;
        var boxHeight = this.labelSpace / 2;

        fill(colour);
        rect(x, y, boxWidth, boxHeight);

        fill('black');
        noStroke();
        textAlign(LEFT);
        textSize(14);
        text(month, x + boxWidth + 10, y + boxWidth / 2);   
    };  
}
