function DataTechDiversityRace() {
    
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Tech Diversity: Race';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'tech-diversity-race';

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
    
    this.setup = function() {
        pixelDensity(displayDensity()); 
        smooth();
        colorMode(HSB, 359, 99, 99); 
        
        // Name of Company
        this.companyName = 'AirBnB';
        
        // Get data of AirBnB
        this.col = this.data.getColumn(1);
        console.log(this.col)
        
        // Convert all data strings to numbers.
        this.col = stringsToNumbers(this.col);
        
        this.labels = this.data.getColumn(0);

        this.title = 'Employee diversity at ' + this.companyName; 
        
        this.donut = new Donut(width * 0.5,    //x
                                height * 0.5,    //y
                                min(width, height) * 0.333,  //rad
                                this.title,   //name
                                this.data,    //dataEnt
                                this.col, //dataVal
                                this.labels);  //lbls  
    };
    
    this.destroy = function() {
        // Return to original mode so that other visualisations will not be affected 
        pixelDensity(1);
        colorMode(RGB);
    };

    
    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        } 
        
        // Draw pie 
        this.donut.draw();
        // Scale pie according to canvas width and height
        this.donut.scaleToCanvas(width/2, 
                       height * 0.4, 
                       min(width, height) * 0.333); 
 
    };
    
}