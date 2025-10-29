function Point(x, y) {
    //paste definition from task 1
        /*Write a constructor function to be called with new
    to produce objects with x and y defined similarly to createPont.

    This time we'll make print a method of the object, rather than
    part of the prototype.
    */
   
    this.x =  x;
    this.y =  y;

    this.print = function() {
        // Keep same format as above
        console.log("(" + this.x + ", " + this.y + ")");
    };

    this.midpoint = function(p2){
        //fill in as specified in README
        //don't forget to return the point
        let tempx = (p2.x + this.x)/2
        let tempy = (p2.y + this.y)/2

        let mid = new Point(tempx,tempy);
        return mid;
    }

    this.scaleTo = function(p2,t){
        //fill in as specified in README
        //don't forget to return the point

        let tempx = this.x + (p2.x - this.x)*t
        let tempy = this.y + (p2.y - this.y)*t
        
        let scale = new Point(tempx,tempy);

        return scale;
    }
    
}


/* Do not change the lines below */
let p1 = new Point(1,5)
let p2 = new Point(5,7)
p1.midpoint(p2).print()//expect (3, 6)
p2.midpoint(p1).print()//expect (3, 6)

/* Do not change the lines below */
let p3 = new Point(0,0)
let p4 = new Point(4,8)
p3.scaleTo(p4,0.25).print(1,2)// expect (1, 2)
p4.scaleTo(p3, 0.75).print() // expect (1, 2)
