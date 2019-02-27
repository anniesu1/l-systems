import { vec3, quat } from 'gl-matrix';
import Turtle from './Turtle';
import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';


export default class LSystem {
    turtle: Turtle = new Turtle(vec3.fromValues(0, 0, 0), 
                                quat.create(), 0); // Current turtle
    turtleHistory: Turtle[]; // Stack of turtle history
    drawingRules: Map<string, any> = new Map(); // Map of drawing rules
    expansionRules : Map<string, any> = new Map();
    grammar: string;
    numIterations: number;

    constructor(axiom: string, numIterations: number) {
        // Inside the constructor, we initialize all the necessary set-up for 
        // drawing a tree

        // Set axiom and numIterations
        this.grammar = axiom;
        this.numIterations = numIterations;

        // Set drawing rules -- TODO: where do we define the functions?
        this.setInitialDrawingRules();

        // Set expansion rules
        let fExpansions = new Map();
        fExpansions.set(1.0, "F[-F]F[+F][F]"); // TODO: tweak expansion rule
        let fRule = new ExpansionRule("F", fExpansions);
        this.expansionRules.set("F", fRule);
    }

    expandSingleChar(char: string) : string {
        // Use the expansion rule(s) that correspond with the given char
        console.log("char = " + char);
        let rule: ExpansionRule;
        rule = this.expansionRules.get(char);
        let expansion = rule.expand();
        if (expansion === "" || !rule ) {
            console.log("char is returned");
            return char;
        }
        console.log("expansion is returned");
        return expansion;
    }

    // Iterate over each char in the axiom and replace it with its expansion
    expandGrammar() : string {
        let output = this.grammar;

        for (let i = 0; i < this.numIterations; i++) {
            // Expand [numIterations] number of times
            let currOutput = '';
            for (let j = 0; j < output.length; j++) {
                currOutput += this.expandSingleChar(output.charAt(j));
            }
            output = currOutput;
            console.log("after iteration " + i + ", expansion = " + output);
        }
        return output;
    }

    setInitialDrawingRules() {
        // TODO: implement drawing rules
        function popTurtle() {};
        function pushTurtle() {};
        function turnLeft() {}; // +x
        function turnRight() {}; // -x
        function pitchDown() {}; // +y
        function pitchUp() {}; // -y
        function rollLeft() {}; // +z
        function rollRight() {}; // -z
        function turnAround() {}; // +y 180 degrees
        function drawBranch() {};
        function drawLeaf() {};

        let popTurtleDR = new DrawingRule(popTurtle);
        let pushTurtleDR = new DrawingRule(pushTurtle);
        let turnLeftDR = new DrawingRule(turnLeft); 
        let turnRightDR = new DrawingRule(turnRight);
        let pitchDownDR = new DrawingRule(pitchDown);
        let pitchUpDR = new DrawingRule(pitchUp);
        let rollLeftDR = new DrawingRule(rollLeft);
        let rollRightDR = new DrawingRule(rollRight);
        let turnAroundDR = new DrawingRule(turnAround);

        let drawBranchDR = new DrawingRule(drawBranch);
        let drawLeafDR = new DrawingRule(drawLeaf);

        this.drawingRules.set("[", pushTurtleDR);
        this.drawingRules.set("]", popTurtleDR);
        this.drawingRules.set("+", turnLeftDR);
        this.drawingRules.set("-", turnRightDR);
        this.drawingRules.set("&", pitchDownDR);
        this.drawingRules.set("^", pitchUpDR);
        this.drawingRules.set(',', rollLeftDR);
        this.drawingRules.set("/", rollRightDR);
        this.drawingRules.set("|", turnAroundDR);

        this.drawingRules.set("F", drawBranchDR);
        this.drawingRules.set("L", drawLeafDR);
    }


    draw() : void {
        // Push a copy of your current Turtle onto turtleHistory when we reach a
        // [ while drawing, and pop the top Turtle from the stack and make it 
        // the current Turtle when we encounter a ]

        // Note: Should DrawingRules be updating Turtles? Yes
        for (let i = 0; i < this.grammar.length; i++) {
            let currChar = this.grammar.charAt(i);
            let dr = this.drawingRules.get(currChar);
            let func = dr.drawFunc;
            if (func) {
                // TODO: should I call the func with the current turtle and stack of turtles as arguments?
                this.turtle = func();
            }
        }
    }

    pushTurtle() : void {

    }

    // Pop the turtleHistory stack and set turtle's members to that Turtle's members
    popTurtle() : void {

    }

}