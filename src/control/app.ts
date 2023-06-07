import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";
//import "../../index.css";
import $ from "jquery";

export class App {

    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;

    //Labels for displaying state

    forwards_amount: number;
    right_amount: number;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.renderer = new Renderer(canvas);
        this.renderer.Initialize();

        this.scene = new Scene();

        this.forwards_amount = 0;
        this.right_amount = 0;
        $(document).on(
            "keydown", 
            (event) => {
                this.handle_keypress(event);
            }
        );
        $(document).on(
            "keyup", 
            (event) => {
                this.handle_keyrelease(event);
            }
        );
        this.canvas.onclick = () => {
            this.canvas.requestPointerLock();
        }
        this.canvas.addEventListener(
            "mousemove", 
            (event: MouseEvent) => {this.handle_mouse_move(event);}
        );
        
    }

    run = () => {

        var running: boolean = true;

        this.scene.update();
        this.scene.move_player(this.forwards_amount, this.right_amount);

        // if (this.canvas.width != this.canvas.clientWidth || this.canvas.height != this.canvas.clientHeight) {
        //     this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
        //     this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
        //     this.renderer.makeDepthBufferResources();
        // }

        this.renderer.render(
            this.scene.get_renderables()
        );

        if (running) {
            requestAnimationFrame(this.run);
        }
    }

    handle_keypress(event: JQuery.KeyDownEvent) {
        if (event.code == "KeyW") {
            this.forwards_amount = 0.02;
        }
        if (event.code == "KeyS") {
            this.forwards_amount = -0.02;
        }
        if (event.code == "KeyA") {
            this.right_amount = -0.02;
        }
        if (event.code == "KeyD") {
            this.right_amount = 0.02;
        }

    }

    handle_keyrelease(event: JQuery.KeyUpEvent) {
        if (event.code == "KeyW") {
            this.forwards_amount = 0;
        }
        if (event.code == "KeyS") {
            this.forwards_amount = 0;
        }
        if (event.code == "KeyA") {
            this.right_amount = 0;
        }
        if (event.code == "KeyD") {
            this.right_amount = 0;
        }

    }

    handle_mouse_move(event: MouseEvent) {        
        this.scene.spin_player(
            event.movementX / 5, event.movementY / 5
        );
    }

}