window.onload = function() {  

var paper = new Raphael('canvas_container', 1200, 1000);  
var locations = []; 
var location = paper.set();

function Item(elem, text) {
    this.elem = elem;
    this.text = text;
}

//squares have same width and height.
var width = 12;

var item;
// draw 48 locations
for (var i = 0; i < 5; i++) {

    item = new Item(
            paper.rect(width * (i+1), 10, width, width),
            paper.text(width * (i+1) + (width/2), width + (width/3), i).attr({ "font-size": 8, "font-family": "Arial, Helvetica, sans-serif" })
        );

    locations[i] = item;
}

console.log(locations[0]);
console.log(locations[3]);

var rnd = Math.ceil(4*Math.random());
location = paper.set();
location.push(locations[rnd].elem);
location.push(locations[rnd].text);
location.translate(Math.random() * 350, Math.random() * 380);

}