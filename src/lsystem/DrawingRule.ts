// A DrawingRule class to represent the result of mapping a 
// character to an L-System drawing operation (possibly with multiple 
// outcomes depending on a probability)

import { vec3 } from 'gl-matrix';

export default class DrawingRule {    
    drawFunc: any; // This drawing function will modify a given turtle

    // Pass in a drawing function
    constructor(func: any) {
        this.drawFunc = func;
    }

    // List of possible drawing rules thus far:
    // F: move forward a certain distance and draw (e.g. 10 pixels)
    // +: turn left 30 degrees
    // -: turn right 30 degrees
    // [: push turtle
    // ]: pop turtle
}
