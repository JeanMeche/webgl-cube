/**
 * @author Lorenzo Cadamuro / http://lorenzocadamuro.com
 */

import { mat4, vec3 } from 'gl-matrix'
import { regl } from '../../renderer'
import camera from '../../camera'
import plane from './plane'
import reflector from './reflector'
import { DefaultContext } from 'regl'

export const planes = [
  { position: [1, 0, 0], normal: [1, 0, 0], rotation: -Math.PI * 0.5, axis: [0, 1, 0], uvRotation: Math.PI },
  { position: [-1, 0, 0], normal: [-1, 0, 0], rotation: Math.PI * 0.5, axis: [0, 1, 0], uvRotation: Math.PI },
  { position: [0, 1, 0], normal: [0, 1, 0], rotation: Math.PI * 0.5, axis: [1, 0, 0], uvRotation: 0 },
  { position: [0, -1, 0], normal: [0, -1, 0], rotation: -Math.PI * 0.5, axis: [1, 0, 0], uvRotation: 0 },
  { position: [0, 0, 1], normal: [0, 0, 1], rotation: Math.PI, axis: [0, 1, 0], uvRotation: Math.PI },
  { position: [0, 0, -1], normal: [0, 0, -1], rotation: 0, axis: [0, 1, 0], uvRotation: Math.PI },
]

const renderTarget = regl.framebuffer()

const reflect = (a, b) => {
  const dot2 = new Array(3)

  dot2.fill(2 * vec3.dot(b, a))

  return vec3.sub(vec3.create(), a, vec3.mul(vec3.create(), dot2, b))
}

const setup = regl<{}, {}, {}, OwnContext>({
  context: {
    config: (context, { cameraConfig: mainCameraConfig, rotationMatrix }, batchId) => {
      const { position, normal, rotation, axis } = planes[batchId]

      const planeMatrix = mat4.translate(mat4.create(), rotationMatrix, position)
      const normalMatrix = mat4.translate(mat4.create(), rotationMatrix, normal)

      mat4.rotate(planeMatrix, planeMatrix, rotation, axis)

      const planeWorldPosition = mat4.getTranslation(vec3.create(), planeMatrix)
      const planeWorldNormal = mat4.getTranslation(vec3.create(), normalMatrix)
      const cameraWorldPosition = mainCameraConfig.eye

      let eye: vec3 = vec3.create();
      vec3.sub(eye, planeWorldPosition, cameraWorldPosition)
      eye = reflect(eye, planeWorldNormal)
      vec3.negate(eye, eye)
      vec3.add(eye, eye, planeWorldPosition)

      const lookAtPosition = vec3.fromValues(0, 0, -1);
      vec3.add(lookAtPosition, lookAtPosition, cameraWorldPosition)

      let target = vec3.create();
      vec3.sub(target, planeWorldPosition, lookAtPosition)
      target = reflect(target, planeWorldNormal)
      vec3.negate(target, target)
      vec3.add(target, target, planeWorldPosition)

      let up = vec3.fromValues(0, 1, 0);
      up = reflect(up, planeWorldNormal)

      const cameraConfig = {
        eye,
        target,
        up,
      }

      return {
        cameraConfig,
        planeMatrix
      }
    },
    uvRotation: (context: DefaultContext, props: {}, batchId) => planes[batchId].uvRotation,
    faceFbo: (context: DefaultContext, { reflectionFbo }, batchId) => reflectionFbo.faces[batchId],
  }
})

export default ({ reflectionFbo, cameraConfig, rotationMatrix, texture }) => {
  const props = new Array(6)

  props.fill({ reflectionFbo, cameraConfig, rotationMatrix })

  setup(props, ({ viewportWidth, viewportHeight, config, uvRotation, faceFbo }) => {
    const textureMatrix = mat4.fromValues(
      0.5, 0, 0, 0,
      0, 0.5, 0, 0,
      0, 0, 0.5, 0,
      0.5, 0.5, 0.5, 1
    )

    renderTarget.resize(viewportWidth, viewportHeight)

    renderTarget.use(() => {
      regl.clear({ color: [0, 0, 0, 0], depth: 1, })

      camera(config.cameraConfig, ({ projection, view, fov }) => {
        mat4.multiply(textureMatrix, textureMatrix, projection)
        mat4.mul(textureMatrix, textureMatrix, view)
        mat4.mul(textureMatrix, textureMatrix, config.planeMatrix)

        reflector({ texture, cameraConfig, fov }) // reflector({ texture, cameraConfig, fov })
      })
    })

    faceFbo.use(() => {
      regl.clear({ color: [0, 0, 0, 0], depth: 1, })
      plane({ texture: renderTarget, textureMatrix, uvRotation, })
    })
  })
}

interface OwnContext {
  config: any,
  uvRotation: any,
  faceFbo: any,
}