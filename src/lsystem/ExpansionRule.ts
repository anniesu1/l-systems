// An ExpansionRule class to represent the result of mapping a particular 
// character to a new set of characters during the grammar expansion phase of 
// the L-System. By making a class to represent the expansion, you can have a 
// single character expand to multiple possible strings depending on some 
// probability by querying a Map<string, ExpansionRule>.

import { vec3 } from 'gl-matrix';

export default class ExpansionRule {
    rule: Map<string, string> = new Map(); // Maps a character to its expansion

    constructor(oldChar: string, expansion: string) {
        this.rule.set(oldChar, expansion);
    }

    expand() : string {
        // Get a random number
        let rand = Math.random();
        if (rand < 0.2) {
            return "AB";
        } else if (rand < 0.5) {
            return "AA";
        } else {
            return "AC";
        }
    }
}