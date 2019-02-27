// A DrawingRule class to represent the result of mapping a 
// character to an L-System drawing operation (possibly with multiple 
// outcomes depending on a probability)

import { vec3 } from 'gl-matrix';

export default class DrawingRule {
    // TODO
    
    position: vec3;
    orientation: vec3;

    constructor(pos: vec3, orient: vec3) {
        this.position = pos;
        this.orientation = orient;
    }

    moveForward() {
        //add(this.position, this.position, this.orientation * 10.0);
    }
}
