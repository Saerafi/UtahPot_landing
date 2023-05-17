struct TransformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
};

struct ObjectData {
    model: array<mat4x4<f32>>,
};

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;
@binding(2) @group(0) var<uniform> normals: mat4x4<f32>;
@binding(0) @group(1) var myTexture: texture_2d<f32>;
@binding(1) @group(1) var mySampler: sampler;

struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) VPos : vec4<f32>,
    @location(1) VTexCoord : vec2<f32>,
    @location(2) VNormals : vec4<f32>
};

@vertex
fn vs_main(
    @builtin(instance_index) ID: u32,
    @location(0) vertexPostion: vec3<f32>, 
    @location(1) vertexTexCoord: vec2<f32>,
    @location(2) vertexNormals: vec4<f32> ) -> Fragment {

    var output : Fragment;
    output.Position = transformUBO.projection * transformUBO.view * objects.model[ID] * vec4<f32>(vertexPostion, 1.0);
    output.VPos = objects.model[ID] * vec4<f32>(vertexPostion, 1.0);
    output.VTexCoord = vertexTexCoord;
    output.VNormals = normals * abs(vertexNormals);

    return output;
}

@fragment
fn fs_main(fragData: Fragment) -> @location(0) vec4<f32> {
    
    let vNormal = normalize(fragData.VNormals.xyz);
    let vPosition = fragData.VPos.xyz;
    return textureSample(myTexture, mySampler, fragData.VTexCoord);
}