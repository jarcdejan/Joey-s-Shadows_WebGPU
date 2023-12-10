struct VertexInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct VertexOutput {
    @builtin(position) clipPosition : vec4f,
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
    @location(3) shadowPos : vec4f,
}

struct FragmentInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
    @location(3) shadowPos : vec4f,
}

struct FragmentOutput {
    @location(0) color : vec4f,
}

struct CameraUniforms {
    viewMatrix : mat4x4f,
    projectionMatrix : mat4x4f,
    position : vec3f,
}

struct LightUniforms {
    lightViewMatrix : mat4x4f,
    lightProjectionMatrix : mat4x4f,
    color : vec3f,
    position : vec3f,
    attenuation : vec3f,
    direction : vec3f,
    intensity : f32,
    ambient : f32,
    fi : f32,
}

struct ModelUniforms {
    modelMatrix : mat4x4f,
    normalMatrix : mat3x3f,
}

struct MaterialUniforms {
    baseFactor : vec4f,
    diffuse : f32,
    specular : f32,
    shininess : f32,
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;
@group(1) @binding(0) var<uniform> light : LightUniforms;
@group(2) @binding(0) var<uniform> model : ModelUniforms;
@group(3) @binding(0) var<uniform> material : MaterialUniforms;
@group(3) @binding(1) var uTexture : texture_2d<f32>;
@group(3) @binding(2) var uSampler : sampler;

@group(0) @binding(1) var shadowMap: texture_depth_2d;
@group(0) @binding(2) var shadowSampler: sampler_comparison;

@vertex
fn vertex(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;
    output.clipPosition = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);
    output.position = (model.modelMatrix * vec4(input.position, 1)).xyz;
    output.texcoords = input.texcoords;
    output.normal = model.normalMatrix * input.normal;

    var posFromLight = light.lightProjectionMatrix * light.lightViewMatrix * model.modelMatrix * vec4(input.position, 1);
    output.shadowPos =  posFromLight;

    return output;
}

@fragment
fn fragment(input : FragmentInput) -> FragmentOutput {
    var output : FragmentOutput;

    let surfacePosition = input.position;
    let d = distance(surfacePosition, light.position);
    let attenuation = 1 / dot(light.attenuation, vec3(1, d, d * d));

    let N = normalize(input.normal);
    let L = normalize(light.position - surfacePosition);
    let V = normalize(camera.position - surfacePosition);
    let R = normalize(reflect(-L, N));
    let D = normalize(light.direction);

    let lambert = max(dot(N, L), 0) * material.diffuse;
    let phong = pow(max(dot(V, R), 0), material.shininess) * material.specular;

    var cl = vec3f(0,0,0);

    if(dot(-L,D) <= cos(light.fi)){
        cl = vec3f(0,0,0);
    }
    else {
        //cl = light.color * pow(dot(-L,light.direction), 200);
        cl = light.color * exp(-pow( 1.25/light.fi * acos(dot(-L,D)), 8));
    }

    let diffuseLight = lambert * attenuation * cl * light.intensity;
    let specularLight = phong * attenuation * cl * light.intensity;
    let ambientLight = light.ambient * light.color / d;


    var shadowXY = vec2(input.shadowPos.x/input.shadowPos.w * 0.5 + 0.5, input.shadowPos.y/input.shadowPos.w * -0.5 + 0.5);


    var visibility = 0.0;
    let oneOverShadowDepthTextureSize = 1.0 / 2048;
    for (var y = -1; y <= 1; y++) {
        for (var x = -1; x <= 1; x++) {
            let offset = vec2<f32>(vec2(x, y)) * oneOverShadowDepthTextureSize;

            visibility += textureSampleCompare(
                shadowMap, shadowSampler,
                shadowXY + offset, (input.shadowPos.z - 0.005) / input.shadowPos.w
            );
        }
    }
    visibility /= 9.0;

    let shadowPos = input.shadowPos / input.shadowPos.w;

    if(shadowPos.x < -1.0 || shadowPos.x > 1.0 || shadowPos.y < -1.0 || shadowPos.y > 1.0 || shadowPos.z < 0.0 || shadowPos.z > 1.0){
        visibility = 0.0;
    }

    const gamma = 2.2;
    let albedo = pow(textureSample(uTexture, uSampler, input.texcoords).rgb, vec3(gamma));
    let finalColor = albedo * (diffuseLight * visibility + ambientLight) + specularLight * visibility;

    output.color = pow(vec4(finalColor, 1), vec4(1 / gamma));

    return output;
}
