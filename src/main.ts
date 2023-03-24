import { InitGPU, CreateGPUBuffer, CreateTransforms, CreateViewProjection, CreateAnimation } from './helper';
import shader from './shader.wgsl';
import "./site.css";
import { CubeData } from './vertex_data';
import {Material} from './material';
import { vec3, mat4 } from 'gl-matrix';
import $ from 'jquery';
const createCamera = require('3d-view-controls');


const Create3DObject = async (isAnimation = true) => {
    const gpu = await InitGPU();
    const device = gpu.device;

    // create vertex buffers
    const cubeData = CubeData();
    const numberOfVertices = cubeData.positions.length / 3;
    const vertexBuffer = CreateGPUBuffer(device, cubeData.positions);
    const texturesBuffer = CreateGPUBuffer(device, cubeData.colors);

    const material = new Material;
    await material.initialize(device, "img/chat.jpg");
 
    const pipeline = device.createRenderPipeline({
        layout:'auto',
        vertex: {
            module: device.createShaderModule({                    
                code: shader
            }),
            entryPoint: "vs_main",
            buffers:[
                {
                    arrayStride: 12,
                    attributes: [{
                        shaderLocation: 0,
                        format: "float32x3",
                        offset: 0
                    }]
                },
                {
                    arrayStride: 8,
                    attributes: [{
                        shaderLocation: 1,
                        format: "float32x2",
                        offset: 0
                    }]
                }
            ]
        },
        fragment: {
            module: device.createShaderModule({                    
                code: shader
            }),
            entryPoint: "fs_main",
            targets: [
                {
                    format: gpu.format as GPUTextureFormat
                }
            ]
        },
        primitive:{
            topology: "triangle-list",
        },
        depthStencil:{
            format: "depth24plus",
            depthWriteEnabled: true,
            depthCompare: "less"
        }
    });

    // create uniform data
    const modelMatrix = mat4.create();
    const mvpMatrix = mat4.create();
    let vMatrix = mat4.create();
    let vpMatrix = mat4.create();
    const vp = CreateViewProjection(gpu.canvas.width/gpu.canvas.height);
    vpMatrix = vp.viewProjectionMatrix;

    // add rotation and camera:
    let rotation = vec3.fromValues(0, 0, 0);       
    var camera = createCamera(gpu.canvas, vp.cameraOption);

    // create uniform buffer and layout
    const uniformBuffer = device.createBuffer({
        size: 64 * 3,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {}
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            },
            {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {}
            },
        ]

    });

    const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuffer
                }
            },
            {
                binding: 1,
                resource: material.view
            },
            {
                binding: 2,
                resource: material.sampler
            }
        ]
    });

    let textureView = gpu.context.getCurrentTexture().createView();
    const depthTexture = device.createTexture({
        size: [gpu.canvas.width, gpu.canvas.height, 1],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });
    const renderPassDescription = {
        colorAttachments: [{
            view: textureView,
            clearValue: { r: 0.2, g: 0.247, b: 0.314, a: 1.0 }, //background color
            loadValue: { r: 0.2, g: 0.247, b: 0.314, a: 1.0 }, 
            loadOp: 'clear',
            storeOp: 'store'
        }],
        depthStencilAttachment: {
            view: depthTexture.createView(),
            depthClearValue: 1.0,
            depthLoadOp:'clear',
            depthStoreOp: "store",
        }
    };
    
    function draw() {
        if(!isAnimation){
            if(camera.tick()){
                const pMatrix = vp.projectionMatrix;
                vMatrix = camera.matrix;
                mat4.multiply(vpMatrix, pMatrix, vMatrix);
            }
        }

        CreateTransforms(modelMatrix,[0,0,0], rotation);
        mat4.multiply(mvpMatrix, vpMatrix, modelMatrix);
        device.queue.writeBuffer(uniformBuffer, 0, mvpMatrix as ArrayBuffer);
        textureView = gpu.context.getCurrentTexture().createView();
        renderPassDescription.colorAttachments[0].view = textureView;
        const commandEncoder = device.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass(renderPassDescription as GPURenderPassDescriptor);

        renderPass.setPipeline(pipeline);
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.setVertexBuffer(1, texturesBuffer);
        renderPass.setBindGroup(0, uniformBindGroup);
        renderPass.draw(numberOfVertices, 2, 0, 0);
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
    }

    CreateAnimation(draw, rotation, isAnimation);
}

let is_animation = true;
Create3DObject(is_animation);
$('#id-radio input:radio').on('click', function(){
    let val = $('input[name="options"]:checked').val();
    is_animation = val === 'animation'?true:false;
    Create3DObject(is_animation);
});

window.addEventListener('resize', function(){
    Create3DObject(is_animation);
});