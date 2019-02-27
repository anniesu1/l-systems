// A Turtle class to represent the current drawing state of your L-System. 
// It should at least keep track of its current position, current orientation, 
// and recursion depth (how many [ characters have been found while drawing before ]s)

import { vec3 } from 'gl-matrix';

export default class Turtle {
    position: vec3;
    orientation: vec3;
    depth: number;

    constructor(pos: vec3, orient: vec3, depth: number) {
        this.position = pos;
        this.orientation = orient;
        this.depth = depth;
    }

    moveForward() {
        //add(this.position, this.position, this.orientation * 10.0);
    }
}