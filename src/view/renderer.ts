import shader from "./shaders/shader.wgsl";
import { TriangleMesh } from "./triangle_mesh";
import { QuadMesh } from "./quad_mesh";
import { ObjMesh } from "./obj_mesh"
import { vec3, mat4 } from "gl-matrix";
import { Material } from "./material";
import { object_types, RenderData } from "../model/definitions";


export class Renderer {

    canvas: HTMLCanvasElement;

    // Device/Context objects
    adapter: GPUAdapter;
    device: GPUDevice;
    context: GPUCanvasContext;
    format : GPUTextureFormat;

    // Pipeline objects
    uniformBuffer: GPUBuffer;
    pipeline: GPURenderPipeline;
    frameGroupLayout: GPUBindGroupLayout;
    materialGroupLayout: GPUBindGroupLayout;
    frameBindGroup: GPUBindGroup;

    // Depth Stencil stuff
    depthStencilState: GPUDepthStencilState;
    depthStencilBuffer: GPUTexture;
    depthStencilView: GPUTextureView;
    depthStencilAttachment: GPURenderPassDepthStencilAttachment;

    // Assets
    triangleMesh: TriangleMesh;
    quadMesh: QuadMesh;
    subjectMesh: ObjMesh;
    triangleMaterial: Material;
    quadMaterial: Material;
    objectBuffer: GPUBuffer;

    // Frame size
    frameWidth: number;
    frameHeight: number;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.frameWidth = this.canvas.clientWidth;
        this.frameHeight = this.canvas.clientHeight;
    }

    async Initialize() {

        await this.setupDevice();

        await this.makeBindGroupLayouts();

        await this.createAssets();

        await this.makeDepthBufferResources();
    
        await this.makePipeline();

        await this.makeBindGroup();
    }

    async setupDevice() {

        //adapter: wrapper around (physical) GPU.
        //Describes features and limits
        this.adapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
        //device: wrapper around GPU functionality
        //Function calls are made through the device
        this.device = <GPUDevice> await this.adapter?.requestDevice();
        //context: similar to vulkan instance (or OpenGL context)
        this.context = <GPUCanvasContext> this.canvas.getContext("webgpu");
        this.format = "bgra8unorm";
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "opaque"
        });

    }

    async makeDepthBufferResources() {

        this.depthStencilState = {
            format: "depth24plus-stencil8",
            depthWriteEnabled: true,
            depthCompare: "less-equal",
        };

        const size: GPUExtent3D = {
            width: this.canvas.clientWidth * (window.devicePixelRatio || 1),
            height: this.canvas.clientHeight * (window.devicePixelRatio || 1),
            depthOrArrayLayers: 1
        };
        const depthBufferDescriptor: GPUTextureDescriptor = {
            size: size,
            format: "depth24plus-stencil8",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        }
        this.depthStencilBuffer = this.device.createTexture(depthBufferDescriptor);

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: "depth24plus-stencil8",
            dimension: "2d",
            aspect: "all"
        };
        this.depthStencilView = this.depthStencilBuffer.createView(viewDescriptor);
        
        this.depthStencilAttachment = {
            view: this.depthStencilView,
            depthClearValue: 1.0,
            depthLoadOp: "clear",
            depthStoreOp: "store",

            stencilLoadOp: "clear",
            stencilStoreOp: "discard"
        };

    }

    async makeBindGroupLayouts() {

        this.frameGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
            ]

        });

        this.materialGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                }
            ]

        });

    }

    async makePipeline() {
        
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.frameGroupLayout, this.materialGroupLayout]
        });
    
        this.pipeline = this.device.createRenderPipeline({
            vertex : {
                module : this.device.createShaderModule({
                    code : shader
                }),
                entryPoint : "vs_main",
                buffers: [this.triangleMesh.bufferLayout,]
            },
    
            fragment : {
                module : this.device.createShaderModule({
                    code : shader
                }),
                entryPoint : "fs_main",
                targets : [{
                    format : this.format
                }]
            },
    
            primitive : {
                topology : "triangle-list"
            },
    
            layout: pipelineLayout,
            depthStencil: this.depthStencilState,
        });

    }

    async createAssets() {
        this.triangleMesh = new TriangleMesh(this.device);
        this.quadMesh = new QuadMesh(this.device);
        this.subjectMesh = new ObjMesh();
        await this.subjectMesh.initialize(this.device, "dist/mdls/UTAHPOT_POT.obj");
        this.triangleMaterial = new Material();
        this.quadMaterial = new Material();


        this.uniformBuffer = this.device.createBuffer({
            size: 64 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const modelBufferDescriptor: GPUBufferDescriptor = {
            size: 64 * 1024,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        };
        this.objectBuffer = this.device.createBuffer(modelBufferDescriptor);


        await this.triangleMaterial.initialize(this.device, "dist/img/pot_color_copy.png", this.materialGroupLayout);
        await this.quadMaterial.initialize(this.device, "dist/img/floor.jpg", this.materialGroupLayout);
    }

    async makeBindGroup() {
        this.frameBindGroup = this.device.createBindGroup({
            layout: this.frameGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.objectBuffer,
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.uniformBuffer,
                    }
                },
            ]
        });

    }

    async render(renderables: RenderData) {

        //Early exit tests
        if (!this.device || !this.pipeline) {
            return;
        }

        // console.log(window.devicePixelRatio);
        // console.log(this.canvas.clientWidth);
        // console.log(this.canvas.width);
        // console.log(this.canvas.clientHeight);
        // console.log(this.canvas.height);
        // console.log();

        const dpr = window.devicePixelRatio;
        const displayWidth  = this.canvas.clientWidth * dpr;
        const displayHeight = this.canvas.clientHeight * dpr;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width  = displayWidth;
            this.canvas.height = displayHeight;
            this.depthStencilBuffer.destroy();
            await this.makeDepthBufferResources();
        }
        
        const projection = mat4.create();
        mat4.perspective(projection, Math.PI/4, this.canvas.width / this.canvas.height, 0.1, 100);

        const view = renderables.view_transform;
        const light_pos = renderables.light_position;
        

        this.device.queue.writeBuffer(
            this.objectBuffer, 0, 
            renderables.model_transforms, 0, 
            renderables.model_transforms.length
        );
        this.device.queue.writeBuffer(this.uniformBuffer, 0, <ArrayBuffer>view); 
        this.device.queue.writeBuffer(this.uniformBuffer, 64, <ArrayBuffer>projection);

        //this.device.queue.writeBuffer(this.uniformBuffer, 128, <ArrayBuffer>light_pos);
        
        //command encoder: records draw commands for submission
        const commandEncoder : GPUCommandEncoder = this.device.createCommandEncoder();
        //texture view: image view to the color buffer in this case
        const textureView : GPUTextureView = this.context.getCurrentTexture().createView();
        //renderpass: holds draw commands, allocated from command encoder
        const renderpass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {r: 0.71, g: 0.71, b: 0.71, a: 1.0},
                loadOp: "clear",
                storeOp: "store"
            }],
            depthStencilAttachment: this.depthStencilAttachment,
        });
        
        renderpass.setPipeline(this.pipeline);
        renderpass.setBindGroup(0, this.frameBindGroup);

        var objects_drawn: number = 0;

        //Triangles
        // renderpass.setVertexBuffer(0, this.triangleMesh.buffer);
        // renderpass.setBindGroup(1, this.triangleMaterial.bindGroup); 
        // renderpass.draw(
        //     3, renderables.object_counts[object_types.TRIANGLE], 
        //     0, objects_drawn
        // );
        // objects_drawn += renderables.object_counts[object_types.TRIANGLE];

        //Quads
        renderpass.setVertexBuffer(0, this.quadMesh.buffer);
        renderpass.setBindGroup(1, this.quadMaterial.bindGroup); 
        renderpass.draw(
            6, renderables.object_counts[object_types.QUAD], 
            0, objects_drawn
        );
        objects_drawn += renderables.object_counts[object_types.QUAD];

        //Object
        renderpass.setVertexBuffer(0, this.subjectMesh.buffer);
        renderpass.setBindGroup(1, this.triangleMaterial.bindGroup); 
        renderpass.draw(
            this.subjectMesh.vertexCount, 1, 
            0, objects_drawn
        );
        objects_drawn += 1;

        

        renderpass.end();
    
        this.device.queue.submit([commandEncoder.finish()]);

    }
    
}