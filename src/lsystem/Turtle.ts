// A Turtle class to represent the current drawing state of your L-System. 
// It should at least keep track of its current position, current orientation, 
// and recursion depth (how many [ characters have been found while drawing before ]s)

import { vec3, vec4, quat, mat4 } from 'gl-matrix';

export default class Turtle {
    position: vec3 = vec3.fromValues(0.0, 0.0, 0.0);
    direction: vec3 = vec3.fromValues(0, 1, 0);
    orientation: quat;
    depth: number = 0;

    constructor(pos: vec3, orient: quat, depth: number) {
        this.position = pos;
        this.orientation = orient;
        this.depth = depth;
    }

    // Rotate the turtle's _dir_ vector by each of the 
    // Euler angles indicated by the input.
    rotate(alpha: number, beta: number, gamma: number) {
        // // Add randomness to the angles
        // var randX = Math.random();
        // randX *= 10; //set the range to 0 to 10
        // randX -= 5; //set the range to -5 to 5
        // alpha += randX;
        
        // var randY = Math.random();
        // randY *= 10; //set the range to 0 to 10
        // randY -= 5; //set the range to -5 to 5
        // beta += randY;
        
        // var randZ = Math.random();
        // randZ *= 10; //set the range to 0 to 10
        // randZ -= 5; //set the range to -5 to 5
        // gamma += randZ;

        let outQuat: quat = quat.create();
        quat.fromEuler(outQuat, alpha, beta, gamma);
        quat.multiply(this.orientation, this.orientation, outQuat);
    }

    // Translate the turtle along the input vector.
    // Does NOT change the turtle's _dir_ vector
    moveTurtle(x: number, y: number, z: number) {
        // NOTE: THIS IS UNUSED. NOT DEBUGGED. 
        var newVec = vec3.fromValues(x, y, z);
        let output: vec3 = vec3.create();
        vec3.add(output, this.position, newVec);
        return output;
    };

    // Translate the turtle along its _dir_ vector by the distance indicated
    moveForward(dist: number) {
        let newVec: vec3 = vec3.create();

        // TODO: update direction by the orientation quaternion matrix
        
        newVec = vec3.fromValues(this.direction[0] * dist,
                                 this.direction[1] * dist,
                                 this.direction[2] * dist);
        let output: vec3 = vec3.create();
        vec3.add(this.position, this.position, newVec);
        return output;
    };

    // Should get its own transformation matrix
    getTransformationMatrix() : mat4 {
        // Translate
        let T: mat4 = mat4.create();
        mat4.fromTranslation(T, this.position); 

        // Rotate
        let R: mat4 = mat4.create();
        mat4.fromQuat(R, this.orientation);

        // Scale

        // Multiply together
        let transformation: mat4 = mat4.create();
        return mat4.multiply(transformation, T, R);
    }
}