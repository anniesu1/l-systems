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
        fExpansions.set(.35, "FFL[+FL][-FL][+FL]"); // y direction
        fExpansions.set(.32, "FF[&FL][^FL]"); // z direction
        fExpansions.set(.33, "FF[,FL][/FL]"); // x direction

        // fExpansions.set(.35, "FFL[-FL][+FL]"); // y direction
        // fExpansions.set(.32, "FFL[&FL][^FL]"); // z direction
        // fExpansions.set(.33, "FFL[,FL][/FL]"); // x direction

        let fRule = new ExpansionRule("F", fExpansions);
        this.expansionRules.set("F", fRule);

        let aExpansions = new Map();
        aExpansions.set(1.0, "[&FL!A]/////’[&FL!A]///////’[&FL!A]");
        let aRule = new ExpansionRule("A", aExpansions);
        this.expansionRules.set("A", aRule);
        
        let sExpansions = new Map();
        sExpansions.set(1.0, "FL");
        let sRule = new ExpansionRule("S", sExpansions);
        this.expansionRules.set("S", sRule);
    }

    expandSingleChar(char: string) : string {
        // Use the expansion rule(s) that correspond with the given char
        // console.log("char = " + char);
        let rule: ExpansionRule;
        rule = this.expansionRules.get(char);
        if (!rule) {
            return char;
        }
        let expansion = rule.expand();
        if (expansion === "") {
            return char;
        }
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
            // console.log("after iteration " + i + ", expansion = " + output);
        }

        this.grammar = output;
        return output;
    }

    setInitialDrawingRules() {
        let self = this;

        function popTurtle() {
            console.log("****pop turtle****")
            console.log("turtle depth before pop:" + self.turtle.depth);

            console.log("turtle pos before pop:" + self.turtle.position);
            let poppedTurtle = self.turtleHistory.pop();
            self.turtle.writeOver(poppedTurtle);
            
            // console.log("popped");
            console.log("turtle pos after pop:" + self.turtle.position);
        };

        function pushTurtle() {
            console.log("****push turtle****");
            let copiedTurtle = self.turtle.makeCopy();
            console.log("copiedTurtle pos: " + copiedTurtle.position);  
            self.turtleHistory.push(copiedTurtle);
            self.turtle.depth++;
        };

        function turnLeft() {
            console.log("****turn left****");
            self.turtle.rotate(self.rotationAngle, 0.0, 0.0);
            console.log("turtle orient = " + self.turtle.orientation);
            //self.turtle.rotate(vec3.fromValues(1, 0, 0), self.rotationAngle);
        }; // +x

        function turnRight() {
            console.log("****turn right****");
            console.log("turtle stack = " + self.turtleHistory.length);
            self.turtle.rotate(-self.rotationAngle, 0.0, 0.0);
            console.log("turtle orient = " + self.turtle.orientation);
            //self.turtle.rotate(vec3.fromValues(1, 0, 0), -self.rotationAngle);
        }; // -x

        function pitchDown() {
            self.turtle.rotate(0.0, self.rotationAngle, 0.0);
            //self.turtle.rotate(vec3.fromValues(0, 1, 0), self.rotationAngle);
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
            console.log("****draw branch****");
            let branchHeight = 3.0 * Math.pow(self.turtle.heightFalloff, self.turtle.depth);
            self.turtle.moveForward(0.6 * Math.pow(0.8, self.turtle.depth));
            // self.turtle.moveForward(branchHeight);
            self.branchT.push(self.turtle.getTransformationMatrix("branch"));
            // Is this the equivalent of "move forward" ?
            // Draw from main
            // LSystem can update the shader with the transformation matrix
        };

        function drawLeaf() {
            let branchHeight = 3.0 * Math.pow(self.turtle.heightFalloff, self.turtle.depth);
            self.turtle.moveForward(branchHeight + 1.2 * Math.pow(0.8, self.turtle.depth));
            //self.turtle.moveForward(1.5 * Math.pow(0.8, self.turtle.depth));
            self.leafT.push(self.turtle.getTransformationMatrix("leaf"));
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
        console.log("grammar when we draw: " + this.grammar);
        for (let i = 0; i < this.grammar.length; i++) {
            let currChar = this.grammar.charAt(i);
            let dr = this.drawingRules.get(currChar);
            if (!dr) {
                return;
            }
            let func = dr.drawFunc;
            if (func) {
                func();
            }
        }
    }
}