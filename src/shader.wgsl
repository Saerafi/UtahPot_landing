// vertex shader

struct Uniforms {
    mvpMatrix : mat4x4<f32>,
};
@binding(0) @group(0) var<uniform> uniforms : Uniforms;
@binding(1) @group(0) var myTexture: texture_2d<f32>;
@binding(2) @group(0) var mySampler: sampler;

struct Output {
    @builtin(position) Position : vec4<f32>,
    @location(0) TexCoord : vec2<f32>
};

@vertex
fn vs_main(@location(0) pos: vec4<f32>, @location(1) vertexTexCoord: vec2<f32>) -> Output {
    var output: Output;
    output.Position = uniforms.mvpMatrix * pos;
    output.TexCoord = vertexTexCoord;
    return output;
}

// fragment shader

 @fragment
fn fs_main(@location(0) TexCoord: vec2<f32>) -> @location(0) vec4<f32> {
    return textureSample(myTexture, mySampler, TexCoord);
}