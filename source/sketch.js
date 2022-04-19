
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

function setup() {
    // Create a canvas to fill the content div from index.html.
    canvasContainer = select('#app');
    var c = createCanvas(1024, 800); 
    c.parent('app');

    // Create a new gallery object.
    gallery = new Gallery();

    // Add the visualisation objects here.
    gallery.addVisual(new RadarByRace());
    gallery.addVisual(new CovidByDate());
    gallery.addVisual(new CovidByCity());
    gallery.addVisual(new DataTechDiversityRace());
    gallery.addVisual(new TechDiversityGender());
    
}

function draw() {
    background(255);
    if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
        
    }
}
