struct TransformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
};

struct ObjectData {
    model: array<mat4x4<f32>>,
};

struct PointLight {
    position : vec3f,
    color : vec3f,
}

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;
@binding(2) @group(0) var<uniform> lights : vec3<f32>;
@binding(0) @group(1) var myTexture: texture_2d<f32>;
@binding(1) @group(1) var mySampler: sampler;

//@binding(1) @group(2) var<uniform> cameraPosition : vec3<f32>;

struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) VPos : vec4<f32>,
    @location(1) VTexCoord : vec2<f32>,
    @location(2) VNormals : vec3<f32>
};

@vertex
fn vs_main(
    @builtin(instance_index) ID: u32,
    @location(0) vertexPostion: vec3<f32>, 
    @location(1) vertexTexCoord: vec2<f32>,
    @location(2) vertexNormals: vec3<f32> ) -> Fragment {

    var output : Fragment;
    output.Position = transformUBO.projection * transformUBO.view * objects.model[ID] * vec4<f32>(vertexPostion, 1.0);
    output.VPos = objects.model[ID] * vec4<f32>(vertexPostion, 1.0);
    output.VTexCoord = vertexTexCoord;
    output.VNormals = vertexNormals;

    return output;
}

@fragment
fn fs_main(fragData: Fragment) -> @location(0) vec4<f32> {

    let diffuseLightStrength = 1.1;
    let ambientLightIntensity = 0.2;
    let specularStrength = 0.2;
    let specularShininess = 32.;

    let vNormal = normalize(fragData.VNormals);
    let vPosition = fragData.VPos.xyz;
    //let vCameraPosition = cameraPosition;
    let lPosition = lights;

    let lightDir = normalize(lPosition - vPosition);
    let lightMagnitude = dot(vNormal, lightDir);
    let diffuseLightFinal: f32 = diffuseLightStrength * max(lightMagnitude, 0);

    // let viewDir = normalize(vCameraPosition - vPosition);
    // let reflectDir = reflect(-lightDir, vNormal);  
    // let spec = pow(max(dot(viewDir, reflectDir), 0.0), specularShininess);
    // let specularFinal = specularStrength * spec; 

    let baseColor = textureSample(myTexture, mySampler, fragData.VTexCoord);
    //return baseColor;

    //let surfaceLightColor = specularFinal + diffuseLightFinal + ambientLightIntensity;
    let surfaceLightColor = diffuseLightFinal + ambientLightIntensity;
    return vec4(baseColor) * surfaceLightColor; 
    
}