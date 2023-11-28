import { vec3, vec4, mat3, mat4 } from '../../../lib/gl-matrix-module.js';

import * as WebGPU from '../engine/WebGPU.js';

import { Camera, Transform } from '../engine/core.js';
import { BaseRenderer } from '../engine/renderers/BaseRenderer.js';

import {
    getLocalModelMatrix,
    getGlobalModelMatrix,
    getGlobalViewMatrix,
    getProjectionMatrix,
    getModels,
    getGlobalRotation,
} from '../engine/core/SceneUtils.js';

import {
    createVertexBuffer,
} from '../engine/core/VertexUtils.js';

import { Light } from './Light.js';

const vertexBufferLayout = {
    arrayStride: 32,
    attributes: [
        {
            name: 'position',
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3',
        },
        {
            name: 'texcoords',
            shaderLocation: 1,
            offset: 12,
            format: 'float32x2',
        },
        {
            name: 'normal',
            shaderLocation: 2,
            offset: 20,
            format: 'float32x3',
        },
    ],
};

const cameraBindGroupLayout = {
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {},
        },
        {
            binding: 1,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            texture: {
              sampleType: 'depth',
            },
          },
          {
            binding: 2,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            sampler: {
              type: 'comparison',
            },
        },
    ],
};

const lightBindGroupLayout = {
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {},
        },
    ],
};

const modelBindGroupLayout = {
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {},
        },
    ],
};

const materialBindGroupLayout = {
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {},
        },
        {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {},
        },
        {
            binding: 2,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {},
        },
    ],
};

export class Renderer extends BaseRenderer {

    constructor(canvas) {
        super(canvas);
        this.perFragment = true;
    }

    async initialize() {
        await super.initialize();

        const codeShadowDepth = await fetch('./src/project_code/shadowDepth.wgsl').then(response => response.text());
        const moduleShadowDepth = this.device.createShaderModule({ code: codeShadowDepth });

        this.lightBindGroupLayout = this.device.createBindGroupLayout(lightBindGroupLayout);
        this.modelBindGroupLayout = this.device.createBindGroupLayout(modelBindGroupLayout);

        this.shadowPipeline = await this.device.createRenderPipelineAsync({
            label: 'Shadow Pipline',
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [
                    this.lightBindGroupLayout,
                    this.modelBindGroupLayout,
                ],
            }),
            vertex: {
                module: moduleShadowDepth,
                entryPoint: 'vertex',
                buffers: [ vertexBufferLayout ],
            },
            depthStencil : {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth32float',
            }
        });

        this.shadowDepthTexture = this.device.createTexture({
            size: [2048, 2048],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'depth32float'
        });
        this.shadowDepthTextureView = this.shadowDepthTexture.createView()
        this.shadowSampler = this.device.createSampler({ compare: 'less' })

        const codeRender = await fetch('./src/project_code/renderShader.wgsl').then(response => response.text());
        const moduleRender = this.device.createShaderModule({ code: codeRender });

        this.cameraBindGroupLayout = this.device.createBindGroupLayout(cameraBindGroupLayout);
        this.lightBindGroupLayout = this.device.createBindGroupLayout(lightBindGroupLayout);
        this.modelBindGroupLayout = this.device.createBindGroupLayout(modelBindGroupLayout);
        this.materialBindGroupLayout = this.device.createBindGroupLayout(materialBindGroupLayout);

        const layout = this.device.createPipelineLayout({
            bindGroupLayouts: [
                this.cameraBindGroupLayout,
                this.lightBindGroupLayout,
                this.modelBindGroupLayout,
                this.materialBindGroupLayout,
            ],
        });

        this.pipelinePerFragment = await this.device.createRenderPipelineAsync({
            label: "Render pipeline",
            vertex: {
                module: moduleRender,
                entryPoint: 'vertex',
                buffers: [ vertexBufferLayout ],
            },
            fragment: {
                module: moduleRender,
                entryPoint: 'fragment',
                targets: [{ format: this.format }],
            },
            depthStencil: {
                format: 'depth32float',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
            layout,
        });

        this.recreateDepthTexture();
    }

    recreateDepthTexture() {
        this.depthTexture?.destroy();
        this.depthTexture = this.device.createTexture({
            format: 'depth32float',
            size: [this.canvas.width, this.canvas.height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }

    prepareNode(node) {
        if (this.gpuObjects.has(node)) {
            return this.gpuObjects.get(node);
        }

        const modelUniformBuffer = this.device.createBuffer({
            size: 128,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const modelBindGroup = this.device.createBindGroup({
            layout: this.modelBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: modelUniformBuffer } },
            ],
        });

        const gpuObjects = { modelUniformBuffer, modelBindGroup };
        this.gpuObjects.set(node, gpuObjects);
        return gpuObjects;
    }

    prepareCamera(camera) {
        if (this.gpuObjects.has(camera)) {
            return this.gpuObjects.get(camera);
        }

        const cameraUniformBuffer = this.device.createBuffer({
            size: 144,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const cameraBindGroup = this.device.createBindGroup({
            layout: this.cameraBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: cameraUniformBuffer } },
                { binding: 1, resource: this.shadowDepthTextureView },
                { binding: 2, resource: this.shadowSampler },
            ],
        });

        const gpuObjects = { cameraUniformBuffer, cameraBindGroup };
        this.gpuObjects.set(camera, gpuObjects);
        return gpuObjects;
    }

    prepareLight(light) {
        if (this.gpuObjects.has(light)) {
            return this.gpuObjects.get(light);
        }

        const lightUniformBuffer = this.device.createBuffer({
            size: 64 + 64 + 64 + 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const lightBindGroup = this.device.createBindGroup({
            layout: this.lightBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: lightUniformBuffer } },
            ],
        });

        const gpuObjects = { lightUniformBuffer, lightBindGroup };
        this.gpuObjects.set(light, gpuObjects);
        return gpuObjects;
    }

    prepareMaterial(material) {
        if (this.gpuObjects.has(material)) {
            return this.gpuObjects.get(material);
        }

        const baseTexture = this.prepareImage(material.baseTexture.image).gpuTexture;
        const baseSampler = this.prepareSampler(material.baseTexture.sampler).gpuSampler;

        const materialUniformBuffer = this.device.createBuffer({
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const materialBindGroup = this.device.createBindGroup({
            layout: this.materialBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: materialUniformBuffer } },
                { binding: 1, resource: baseTexture.createView() },
                { binding: 2, resource: baseSampler },
            ],
        });

        const gpuObjects = { materialUniformBuffer, materialBindGroup };
        this.gpuObjects.set(material, gpuObjects);
        return gpuObjects;
    }

    render(scene, camera, light) {
        if (this.depthTexture.width !== this.canvas.width || this.depthTexture.height !== this.canvas.height) {
            this.recreateDepthTexture();
        }

        const encoder = this.device.createCommandEncoder();

        this.shadowPass = encoder.beginRenderPass({
            colorAttachments: [],
            depthStencilAttachment: {
                view: this.shadowDepthTextureView,
                depthClearValue: 1,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            }
        });
        this.shadowPass.setPipeline(this.shadowPipeline);

        const lightComponent = light.getComponentOfType(Light);
        const lightViewMatrix = getGlobalViewMatrix(light);
        const lightProjectionMatrix = lightComponent.perspectiveMatrix;
        const lightColor = vec3.scale(vec3.create(), lightComponent.color, 1 / 255);
        const lightPosition = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(light));
        let vecDir = vec4.set(vec4.create(),0,0,-1,1)
        let lightDirection = vec4.transformQuat(vec4.create(), vecDir, getGlobalRotation(light))
        lightDirection = vec3.fromValues(lightDirection[0], lightDirection[1], lightDirection[2])
        const lightAttenuation = vec3.clone(lightComponent.attenuation);
        const { lightUniformBuffer, lightBindGroup } = this.prepareLight(lightComponent);
        this.device.queue.writeBuffer(lightUniformBuffer, 0, lightViewMatrix);
        this.device.queue.writeBuffer(lightUniformBuffer, 64, lightProjectionMatrix);
        this.device.queue.writeBuffer(lightUniformBuffer, 128, lightColor);
        this.device.queue.writeBuffer(lightUniformBuffer, 128+16, lightPosition);
        this.device.queue.writeBuffer(lightUniformBuffer, 128+32, lightAttenuation);
        this.device.queue.writeBuffer(lightUniformBuffer, 128+48, lightDirection);
        this.device.queue.writeBuffer(lightUniformBuffer, 128+60, new Float32Array([lightComponent.intensity, lightComponent.ambient, lightComponent.fi]));
        this.shadowPass.setBindGroup(0, lightBindGroup);

        this.renderNode_shadow(scene);
        this.shadowPass.end();

        this.renderPass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: [0, 0, 0, 1],
                    loadOp: 'clear',
                    storeOp: 'store',
                }
            ],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1,
                depthLoadOp: 'clear',
                depthStoreOp: 'discard',
            },
        });
        this.renderPass.setPipeline(this.pipelinePerFragment);

        const cameraComponent = camera.getComponentOfType(Camera);
        const viewMatrix = getGlobalViewMatrix(camera);
        const projectionMatrix = getProjectionMatrix(camera);
        const cameraPosition = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(camera));
        const { cameraUniformBuffer, cameraBindGroup } = this.prepareCamera(cameraComponent);
        this.device.queue.writeBuffer(cameraUniformBuffer, 0, viewMatrix);
        this.device.queue.writeBuffer(cameraUniformBuffer, 64, projectionMatrix);
        this.device.queue.writeBuffer(cameraUniformBuffer, 128, cameraPosition);
        this.renderPass.setBindGroup(0, cameraBindGroup);

        this.device.queue.writeBuffer(lightUniformBuffer, 0, lightViewMatrix);
        this.device.queue.writeBuffer(lightUniformBuffer, 64, lightProjectionMatrix);
        this.device.queue.writeBuffer(lightUniformBuffer, 128, lightColor);
        this.device.queue.writeBuffer(lightUniformBuffer, 128+16, lightPosition);
        this.device.queue.writeBuffer(lightUniformBuffer, 128+32, lightAttenuation);
        this.device.queue.writeBuffer(lightUniformBuffer, 128+48, lightDirection);
        this.device.queue.writeBuffer(lightUniformBuffer, 128+60, new Float32Array([lightComponent.intensity, lightComponent.ambient, lightComponent.fi]));
        this.renderPass.setBindGroup(1, lightBindGroup);

        this.renderNode(scene);

        this.renderPass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    renderNode(node, modelMatrix = mat4.create()) {
        const localMatrix = getLocalModelMatrix(node);
        modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);

        const { modelUniformBuffer, modelBindGroup } = this.prepareNode(node);
        const normalMatrix = this.mat3tomat4(mat3.normalFromMat4(mat3.create(), modelMatrix));
        this.device.queue.writeBuffer(modelUniformBuffer, 0, modelMatrix);
        this.device.queue.writeBuffer(modelUniformBuffer, 64, normalMatrix);
        this.renderPass.setBindGroup(2, modelBindGroup);

        for (const model of getModels(node)) {
            this.renderModel(model);
        }

        for (const child of node.children) {
            this.renderNode(child, modelMatrix);
        }
    }

    renderNode_shadow(node, modelMatrix = mat4.create()) {
        const localMatrix = getLocalModelMatrix(node);
        modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);

        const { modelUniformBuffer, modelBindGroup } = this.prepareNode(node);
        const normalMatrix = this.mat3tomat4(mat3.normalFromMat4(mat3.create(), modelMatrix));
        this.device.queue.writeBuffer(modelUniformBuffer, 0, modelMatrix);
        this.device.queue.writeBuffer(modelUniformBuffer, 64, normalMatrix);
        this.shadowPass.setBindGroup(1, modelBindGroup);

        for (const model of getModels(node)) {
            this.renderModel_shadow(model);
        }

        for (const child of node.children) {
            this.renderNode_shadow(child, modelMatrix);
        }
    }

    renderModel(model) {
        for (const primitive of model.primitives) {
            this.renderPrimitive(primitive);
        }
    }

    renderModel_shadow(model) {
        for (const primitive of model.primitives) {
            this.renderPrimitive_shadow(primitive);
        }
    }

    renderPrimitive(primitive) {
        const material = primitive.material;
        const { materialUniformBuffer, materialBindGroup } = this.prepareMaterial(material);
        this.device.queue.writeBuffer(materialUniformBuffer, 0, new Float32Array([
            ...material.baseFactor,
            /*material.diffuse*/ 2,
            /*material.specular*/ 0.1,
            /*material.shininess*/ 100,
        ]));
        this.renderPass.setBindGroup(3, materialBindGroup);

        const { vertexBuffer, indexBuffer } = this.prepareMesh(primitive.mesh, vertexBufferLayout);
        this.renderPass.setVertexBuffer(0, vertexBuffer);
        this.renderPass.setIndexBuffer(indexBuffer, 'uint32');

        this.renderPass.drawIndexed(primitive.mesh.indices.length);
    }

    renderPrimitive_shadow(primitive) {
        const { vertexBuffer, indexBuffer } = this.prepareMesh(primitive.mesh, vertexBufferLayout);
        this.shadowPass.setVertexBuffer(0, vertexBuffer);
        this.shadowPass.setIndexBuffer(indexBuffer, 'uint32');

        this.shadowPass.drawIndexed(primitive.mesh.indices.length);
    }

}
