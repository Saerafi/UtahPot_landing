import { vec3, mat4 } from "gl-matrix";
import { Deg2Rad } from "./math";

export class Subject {

    position: vec3;
    eulers: vec3;
    model: mat4;

    constructor(position: vec3, eulers: vec3) {
        this.position = position;
        this.eulers = eulers;
    }

    update() {
        this.eulers[0] += 0;
        this.eulers[0] %= 360;

        this.model = mat4.create();
        mat4.translate(this.model, this.model, this.position);
        mat4.rotateX(this.model, this.model, Deg2Rad(this.eulers[0]));
        mat4.rotateY(this.model, this.model, Deg2Rad(this.eulers[1]));
        mat4.rotateZ(this.model, this.model, Deg2Rad(this.eulers[2]));
    }

    get_model(): mat4 {
        return this.model;
    }
}