struct VertexInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct VertexOutput {
    @builtin(position) position : vec4f,
}

struct LightUniforms {
    lightViewMatrix : mat4x4f,
    lightProjectionMatrix : mat4x4f,
    color : vec3f,
    position : vec3f,
    attenuation : vec3f,
    direction : vec3f,
    ambient : f32,
    fi : f32,
}

struct ModelUniforms {
    modelMatrix : mat4x4f,
    normalMatrix : mat3x3f,
}

@group(0) @binding(0) var<uniform> light : LightUniforms;
@group(1) @binding(0) var<uniform> model : ModelUniforms;

@vertex
fn vertex(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;
    var depthPos =  light.lightProjectionMatrix * light.lightViewMatrix * model.modelMatrix * vec4f(input.position, 1.0);
    output.position = depthPos;
    return output;
}