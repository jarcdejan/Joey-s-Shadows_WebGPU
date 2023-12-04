import { quat, vec3, vec4, mat3, mat4 } from '../../../lib/gl-matrix-module.js';

export function transformVertex(vertex, matrix,
    normalMatrix = mat3.normalFromMat4(mat3.create(), matrix),
    tangentMatrix = mat3.fromMat4(mat3.create(), matrix),
) {
    vec3.transformMat4(vertex.position, vertex.position, matrix);
    vec3.transformMat3(vertex.normal, vertex.normal, normalMatrix);
    vec3.transformMat3(vertex.tangent, vertex.tangent, tangentMatrix);
}

export function transformMesh(mesh, matrix,
    normalMatrix = mat3.normalFromMat4(mat3.create(), matrix),
    tangentMatrix = mat3.fromMat4(mat3.create(), matrix),
) {
    // console.log('Matrix:', matrix);
    
    for (const vertex of mesh.vertices) {
        transformVertex(vertex, matrix, normalMatrix, tangentMatrix);
    }
}

export function calculateFaceNormals(mesh) {
    if (!mesh.indices || mesh.indices.length % 3 !== 0) {
        console.error('Invalid mesh indices');
        return;
    }

    const faces = [];
    for (let i = 0; i < mesh.indices.length; i += 3) {
        const indices = mesh.indices.slice(i, i + 3);
        const v0 = mesh.vertices[indices[0]].position;
        const v1 = mesh.vertices[indices[1]].position;
        const v2 = mesh.vertices[indices[2]].position;

        const edge1 = vec3.subtract(vec3.create(), v1, v0);
        const edge2 = vec3.subtract(vec3.create(), v2, v0);
        const normal = vec3.cross(vec3.create(), edge1, edge2);
        vec3.normalize(normal, normal);

        faces.push({
            indices,
            normal,
            plane: { normal, d: -vec3.dot(normal, v0) },
        });
    }

    mesh.faces = faces;
}


export function calculateAxisAlignedBoundingBox(mesh) {
    const initial = {
        min: vec3.clone(mesh.vertices[0].position),
        max: vec3.clone(mesh.vertices[0].position),
    };

    return {
        min: mesh.vertices.reduce((a, b) => vec3.min(a, a, b.position), initial.min),
        max: mesh.vertices.reduce((a, b) => vec3.max(a, a, b.position), initial.max),
    };
}

export function mergeAxisAlignedBoundingBoxes(boxes) {
    const initial = {
        min: vec3.clone(boxes[0].min),
        max: vec3.clone(boxes[0].max),
    };

    return {
        min: boxes.reduce(({ min: amin }, { min: bmin }) => vec3.min(amin, amin, bmin), initial),
        max: boxes.reduce(({ max: amax }, { max: bmax }) => vec3.max(amax, amax, bmax), initial),
    };
}
