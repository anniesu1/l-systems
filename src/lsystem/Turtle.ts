// A Turtle class to represent the current drawing state of your L-System. 
// It should at least keep track of its current position, current orientation, 
// and recursion depth (how many [ characters have been found while drawing before ]s)

import { vec3, quat, mat4 } from 'gl-matrix';

export default class Turtle {
    position: vec3;
    orientation: quat;
    depth: number;

    constructor(pos: vec3, orient: quat, depth: number) {
        this.position = pos;
        this.orientation = orient;
        this.depth = depth;
    }

    moveForward() {
        // TODO (maybe? I think this will be handled by the DrawingRule function def)
        //add(this.position, this.position, this.orientation * 10.0);
    }

    // Should get its own transformation matrix
    getTransformationMatrix() : mat4 {
        // TODO
        return new mat4(1);
    }
}