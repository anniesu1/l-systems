import { vec3, vec4, mat4, quat } from 'gl-matrix';
import Turtle from './Turtle';
import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';
import ShaderProgram from '../rendering/gl/ShaderProgram';

export default class LSystem {
    turtle: Turtle = new Turtle(vec3.fromValues(0, 0, 0), 
                                quat.create(), 0); // Current turtle
    turtleHistory: Turtle[] = []; // Stack of turtle history
    drawingRules: Map<string, any> = new Map(); // Map of drawing rules
    expansionRules : Map<string, any> = new Map();
    grammar: string;
    numIterations: number;
    rotationAngle: number;
    branchT: mat4[];
    leafT: mat4[];

    constructor(axiom: string, numIterations: number, 
                rotationAngle: number, branchT: mat4[], leafT: mat4[]) {
        // Inside the constructor, we initialize all the necessary set-up for 
        // drawing a tree

        // Set some member vars
        this.grammar = axiom;
        this.numIterations = numIterations;
        this.rotationAngle = rotationAngle;
        this.branchT = branchT;
        this.leafT = leafT;
        this.turtle = new Turtle(vec3.fromValues(0.0, 0.0, 0.0),
                                 quat.create(), 0);

        // Set drawing rules
        this.setInitialDrawingRules();

        // Set expansion rules
        let fExpansions = new Map();
        fExpansions.set(1.0, "F[-F]F[+F][F]"); // TODO: tweak expansion rule
        // fExpansions.set(1.0, "FFF"); // TODO: tweak expansion rule
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

        this.grammar = output;
        return output;
    }

    setInitialDrawingRules() {
        let self = this;
        console.log("set drawing rules, the turtle is: " + self.turtle);

        function popTurtle() {
            self.turtle = self.turtleHistory.pop();
            console.log("popped");
            console.log("self.turtle = " + self.turtle);
        };

        function pushTurtle() {
            console.log("this.rotationangle" + this.rotationAngle);
            console.log("this.turtle before pushing = " + this.turtle);

            let target = new Turtle(vec3.fromValues(0, 0, 0), 
                         quat.create(), 0);
            let copiedTurtle = Object.assign(target, self.turtle);  
            copiedTurtle.depth++; // Increase the recursion depth           
            self.turtleHistory.push(copiedTurtle);
            console.log("pushed turtle");
            console.log("self.turtle = " + self.turtle);
        };

        function turnLeft() {
            self.turtle.rotate(self.rotationAngle, 0.0, 0.0);
        }; // +x

        function turnRight() {
            console.log("turtle stack = " + self.turtleHistory.length);
            console.log("turtle = " + self.turtle);
            self.turtle.rotate(-self.rotationAngle, 0.0, 0.0);
        }; // -x

        function pitchDown() {
            self.turtle.rotate(0.0, self.rotationAngle, 0.0);
        }; // +y

        function pitchUp() {
            self.turtle.rotate(0.0, -self.rotationAngle, 0.0);
        }; // -y

        function rollLeft() {
            self.turtle.rotate(0.0, 0.0, self.rotationAngle);
        }; // +z

        function rollRight() {
            self.turtle.rotate(0.0, 0.0, -self.rotationAngle);
        }; // -z

        function turnAround() {
            self.turtle.rotate(0.0, Math.PI, 0.0);
        }; // +y 180 degrees

        function drawBranch() {
            self.turtle.moveForward(0.5);
            self.branchT.push(self.turtle.getTransformationMatrix());
            // Is this the equivalent of "move forward" ?
            // Draw from main
            // LSystem can update the shader with the transformation matrix
        };

        function drawLeaf() {
            self.leafT.push(self.turtle.getTransformationMatrix());
        };

        let popTurtleDR = new DrawingRule(popTurtle.bind(this));
        let pushTurtleDR = new DrawingRule(pushTurtle.bind(this));
        let turnLeftDR = new DrawingRule(turnLeft.bind(this)); 
        let turnRightDR = new DrawingRule(turnRight.bind(this));
        let pitchDownDR = new DrawingRule(pitchDown.bind(this));
        let pitchUpDR = new DrawingRule(pitchUp.bind(this));
        let rollLeftDR = new DrawingRule(rollLeft.bind(this));
        let rollRightDR = new DrawingRule(rollRight.bind(this));
        let turnAroundDR = new DrawingRule(turnAround.bind(this));

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
        console.log("grammar inside draw(): " + this.grammar);
        for (let i = 0; i < this.grammar.length; i++) {
            let currChar = this.grammar.charAt(i);
            let dr = this.drawingRules.get(currChar);
            let func = dr.drawFunc;
            if (func) {
                // TODO: should I call the func with the current turtle and stack of turtles as arguments?
                func();
            }
        }
    }

    pushTurtle() : void {

    }

    // Pop the turtleHistory stack and set turtle's members to that Turtle's members
    popTurtle() : void {

    }

}