import { vec3 } from 'gl-matrix';
import Turtle from 'Turtle';
import DrawingRule from 'DrawingRule';
import ExpansionRule from 'ExpansionRule';

// TODO: ask about the LSystem structure
export default class LSystem {
    turtle: Turtle = new Turtle(vec3.fromValues(0, 0, 0), 
                                vec3.fromValues(0, 0, 0), 0); // Current turtle
    turtleHistory: Turtle[]; // Stack of turtle history
    drawingRules: Map<string, any> = new Map(); // Map of drawing rules
    expansionRules : Map<string, any> = new Map();
    grammar: String;

    constructor(axiom: String) {
        // Set axiom
        this.grammar = axiom;

        // Set drawing rules -- TODO: where do we define the functions?

        // Set expansion rules 
    }

    expandGrammarSingle(str: String) : String {
        // Use the expansion rules 
        return "";
    }

    // Iterate over each char in the axiom and replace it with its expansion
    expandGrammar(iterations: number, str: String) : String {
        let output: String;
        output = str;
        for (let i = 0; i < iterations; i++) {
            output = this.expandGrammarSingle(output);
        }
        return output;
    }

    // TODO: is this necessary?
    draw() : void {
        // Push a copy of your current Turtle onto turtleHistory when we reach a
        // [ while drawing, and pop the top Turtle from the stack and make it 
        // the current Turtle when we encounter a ]

        // TODO: Should DrawingRules be updating Turtles?
    }

    pushTurtle() : void {

    }

    // Pop the turtleHistory stack and set turtle's members to that Turtle's members
    popTurtle() : void {

    }

}