function Donut(x, y, rad, name, dataEnt, dataVal, lbls) {

    // Set focus to false
    this.focused = false;
    this.name = name;

    // Initialise sum to 0
    var sum = 0;
    
    for (var value of dataVal.values()) {    
        // ES6 : "for (var value of data.values())" = length of data set to iterate 
        sum += value;
    } 
    // values sum up to <= 1 to form a whole donut chart
    if(sum <= 1) {
        sum = 1;
    }

    // Array to store each portion of donut chart 
    this.portions = [];  
    var i = 0; 

    this.newMap;

    // Function to retrieve data in simpler terms of ES6 
    this.parseData = function() {
        var valueStr = dataEnt.getArray();
        valueStr = valueStr.toString(); 
        var ValueArr = valueStr.split(','); 
        var dataPairs = [];
        var o = {};
        for (var j = 0; j < ValueArr.length; j += 31) {
            o[ValueArr[j]] = ValueArr[j + 1];
            dataPairs.push(o);
            var newArray = Object.entries(o);
            this.newMap = new Map(newArray);  

        }     

        for (var [key, value] of this.newMap.entries()) {
            value = parseFloat(value); 
            this.portions.push(new Portion(
            lbls[i],  
            isNaN(value) ? 0 : value / sum,    //val 
            i === 0 ? 0 : this.portions[i - 1].stop, //strt
            i / this.newMap.size * 360));  //fll 
            i++;
        }
        
    };
    
    this.draw = function() {
        this.parseData();
        
        push();
        noStroke();
        ellipseMode(RADIUS);
        textSize(16);
        textAlign(CENTER, CENTER); 
        for (var i = 0, size = this.portions.length; i < size; ++i) {
            this.portions[i].draw(this.x, this.y, this.radius);
        }
        if (this.focused) {
            var x = this.x;
            var y = this.y;
            fill(0, 0, 0);
            text(this.name, x, y); 
        }
 
        pop();
        this.hover(mouseX, mouseY);

    }; 
    
    // Mouse interactivity upon hover
    this.hover = function(x, y) {
        if (dist(x, y, this.x, this.y) < this.radius) {
            this.focused = true;
            
            for (var i = 0, size = this.portions.length; i < size; ++i) {
                var a = atan2(y - this.y, x - this.x);
                
                if (this.portions[i].hover(a)) {
                    this.portions[i].focused = true;
                    this.portions[i].displayTitle(this.x,
                                                  this.y,
                                                  this.radius);
                } 
                else {
                    this.portions[i].focused = false;
                }
                this.portions[i].displayLegend(i, this.x, this.y)
            }
        } 
        else {
            this.focused = false;
            for (var i = 0, size = this.portions.length; i < size; ++i) {
                this.portions[i].focused = false;
            }
        }
    };

    // Scale donut chart to display within canvas
    this.scaleToCanvas = function(x, y, rad) {
        this.x = x;
        this.y = y;
        this.radius = rad;
    };
    
    
}

