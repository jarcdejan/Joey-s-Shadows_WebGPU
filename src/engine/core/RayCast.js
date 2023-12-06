import { quat, vec3, vec4, mat3, mat4 } from '../../../lib/gl-matrix-module.js';

import {
    calculateAxisAlignedBoundingBox,
    calculateFaceNormals,
    transformMesh,
} from '../core.js';

export class RayCast {

    generateRays(canWidth, canHeight, fov, dirVec, posVec) {
        var rays = [];
    
        for (let y = 0; y < canHeight/2; y++) {
            for (let x = 0; x < canWidth/2; x++) {
                var ndcX = (2 * x) / canWidth - 1;
                var ndcY = 1 - (2 * y) / canHeight;
                
                var aspectRatio = canWidth / canHeight;
                var tanHalfFov = Math.tan(fov / 2);
                var cameraSpaceX = ndcX * aspectRatio * tanHalfFov;
                var cameraSpaceY = ndcY * tanHalfFov;
    
                var rayDir = [
                    dirVec[0] + cameraSpaceX,
                    dirVec[1] + cameraSpaceY,
                    dirVec[2],
                ];
    
                var len = Math.sqrt(
                    rayDir[0] * rayDir[0] +
                    rayDir[1] * rayDir[1] + 
                    rayDir[2] * rayDir[2]
                );
    
                var normalizedRayDir = [
                    rayDir[0] / len,
                    rayDir[1] / len,
                    rayDir[2] / len
                ];
    
                /*rays[y * (canWidth/2) + x] = {
                    origin: [...posVec],
                    direction: [...normalizedRayDir], 
                };*/
                rays.push({
                    origin: posVec,
                    direction: normalizedRayDir,
                });
        
            }
        }
        return rays;
    }

    rayIntersectsTriangle(ray, triangle, object) {
        const epsilon = 1e-6;

        const [v0, v1, v2] = triangle.indices.map(index => object.mesh.vertices[index].position);

        const edge1 = vec3.subtract(vec3.create(), v1, v0);
        const edge2 = vec3.subtract(vec3.create(), v2, v0);

        const h = vec3.cross(vec3.create(), ray.direction, edge2);
        const a = vec3.dot(edge1, h);

        if (a > -epsilon && a < epsilon) {
            return null;
        }

        const f = 1.0 / a;
        const s = vec3.subtract(vec3.create(), ray.origin, v0);
        const u = f * vec3.dot(s, h);

        if (u < 0.0 || u > 1.0) {
            return null;
        }

        const q = vec3.cross(vec3.create(), s, edge1);
        const v = f * vec3.dot(ray.direction, q);

        if (v < 0.0 || u + v > 1.0) {
            return null;
        }
        const t = f * vec3.dot(edge2, q);
        const hitPoint = vec3.scaleAndAdd(vec3.create(), ray.origin, ray.direction, t);
        // console.log(ray.origin, ray.direction, t);
        
        if (hitPoint) {
            if (hitPoint[0] == NaN || hitPoint[1] == NaN || hitPoint[2] == NaN) {
                return false;
            }
            return hitPoint;
        }
        return null;
    }

    raysIntersectsAABB(ray, aabb) {
        const t1 = (ray.direction[0] !== 0) ? (aabb.min[0] - ray.origin[0]) / ray.direction[0] : Infinity;
        const t2 = (ray.direction[0] !== 0) ? (aabb.max[0] - ray.origin[0]) / ray.direction[0] : -Infinity;

        const tminX = Math.min(t1, t2);
        const tmaxX = Math.max(t1, t2);
        
        const t3 = (ray.direction[1] !== 0) ? (aabb.min[1] - ray.origin[1]) / ray.direction[1] : Infinity;
        const t4 = (ray.direction[1] !== 0) ? (aabb.max[1] - ray.origin[1]) / ray.direction[1] : -Infinity;

        const tminY = Math.min(t3, t4);
        const tmaxY = Math.max(t3, t4);

        const t5 = (ray.direction[2] !== 0) ? (aabb.min[2] - ray.origin[2]) / ray.direction[2] : Infinity;
        const t6 = (ray.direction[2] !== 0) ? (aabb.max[2] - ray.origin[2]) / ray.direction[2] : -Infinity;

        const tminZ = Math.min(t5, t6);
        const tmaxZ = Math.max(t5, t6);

        var meh = tminX <= Math.max(tminY, tminZ);
        var meh2 = Math.min(tmaxX, tmaxY, tmaxZ) <= Math.max(tminX, tminY, tminZ);

        return meh && meh2;
    }

    rayIntersectsObjects(ray, object) {
        // console.log(object.mesh);
        // console.log(object.transformationMatrix);
        // console.log(ray[0]);
        transformMesh(object.mesh, object.transformationMatrix);

        calculateFaceNormals(object.mesh);

        const objectAABB = calculateAxisAlignedBoundingBox(object.mesh);

        if (object.aabb && (this.raysIntersectsAABB(ray[0], object.aabb) == false)) {
           return false;
        }

        for (const face of object.mesh.faces) {
            var intersection = this.rayIntersectsTriangle(ray[0], face, object);
            
            if (intersection) {
               return intersection;
            }
        }
        return false;
    }
}