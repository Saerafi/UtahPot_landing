import { Triangle } from "./triangle";
import { Quad } from "./quad";
import { Subject } from "./subject";
import { Camera } from "./camera";
import { Light } from "./light";
import { Deg2Rad } from "./math";
import { vec3,mat4 } from "gl-matrix";
import { object_types, RenderData } from "./definitions";

export class Scene {

    triangles: Triangle[];
    quads: Quad[];
    subject: Subject;
    player: Camera;
    light: Light;
    object_data: Float32Array;
    triangle_count: number;
    quad_count: number;

    constructor() {

        this.triangles = [];
        this.quads = [];
        this.object_data = new Float32Array(16 * 1024);
        this.triangle_count = 0;
        this.quad_count = 0;

        //this.make_triangles();
        //this.make_quads();

        this.subject = new Subject(
            [0, 0, -2.0], [90, 55, 0]
        );

        this.light = new Light(
            [0, -5, 1.0], 0, 90
        );

        this.player = new Camera(
            [-5, 3.5, 5.0], -30, -20
        );

    }

    make_triangles() {
        var i: number = 0;
        for (var y:number = -5; y <= 5; y++) {
            this.triangles.push(
                new Triangle(
                    [2, y, 0],
                    0
                )
            );

            var blank_matrix = mat4.create();
            for (var j: number = 0; j < 16; j++) {
                this.object_data[16 * i + j] = <number>blank_matrix.at(j);
            }
            i++;
            this.triangle_count++;
        }
    }

    make_quads() {
        var i: number = this.triangle_count;
        for (var x: number = -10; x <= 10; x++) {
            for (var y:number = -10; y <= 10; y++) {
                this.quads.push(
                    new Quad(
                        [x, y, 0]
                    )
                );

                var blank_matrix = mat4.create();
                for (var j: number = 0; j < 16; j++) {
                    this.object_data[16 * i + j] = <number>blank_matrix.at(j);
                }
                i++;
                this.quad_count++;
            }
        }
    }

    update() {

        var i: number = 0;

        this.triangles.forEach(
            (triangle) => {
                triangle.update();
                var model = triangle.get_model();
                for (var j: number = 0; j < 16; j++) {
                    this.object_data[16 * i + j] = <number>model.at(j);
                }
                i++;
            }
        );

        this.quads.forEach(
            (quad) => {
                quad.update();
                var model = quad.get_model();
                for (var j: number = 0; j < 16; j++) {
                    this.object_data[16 * i + j] = <number>model.at(j);
                }
                i++;
            }
        );

        this.subject.update();
        var model = this.subject.get_model();
        for (var j: number = 0; j < 16; j++) {
            this.object_data[16 * i + j] = <number>model.at(j);
        }
        i++;

        this.player.update();
        this.light.update();
    }

    get_player(): Camera {
        return this.player;
    }

    get_light(): Light {
        return this.light;
    }

    get_renderables(): RenderData {
        return {
            view_transform: this.player.get_view(),
            model_transforms: this.object_data,
            light_position: this.light.position,
            object_counts: {
                [object_types.TRIANGLE]: this.triangle_count,
                [object_types.QUAD]: this.quad_count,
            }
        }
    }

    spin_player(dX: number, dY: number) {
        this.player.eulers[2] -= dX;
        this.player.eulers[2] %= 360;

        this.player.eulers[1] = Math.min(
            89, Math.max(
                -89,
                this.player.eulers[1] - dY
            )
        );
    }

    move_player(forwards_amount: number, right_amount: number) {
        vec3.scaleAndAdd(
            this.player.position, this.player.position, 
            this.player.forwards, forwards_amount
        );

        vec3.scaleAndAdd(
            this.player.position, this.player.position, 
            this.player.right, right_amount
        );
    }
}