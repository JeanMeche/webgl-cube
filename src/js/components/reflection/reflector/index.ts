/**
 * @author Lorenzo Cadamuro / http://lorenzocadamuro.com
 */

import { mat4 } from 'gl-matrix'
import { regl } from '../../../renderer'
import gui from '../../../helpers/gui'
import { positions, uv, elements } from './config'
import frag from './shader.frag'
import vert from './shader.vert'
import { DefaultContext } from 'regl'

const CONFIG = {
  depthOpacity: 0.25
}

gui.get((gui) => {
  const folder = gui.addFolder('Reflector')

  folder.add(CONFIG, 'depthOpacity', 0, 1).step(0.01)
})

export default regl<{}, {}, {}, OwnContext>({
  frag,
  vert,
  context: {
    world: ({ viewportWidth, viewportHeight }, { cameraConfig: mainCameraConfig, fov }) => {
      const fovy = (fov * Math.PI) / 180
      const aspect = viewportWidth / viewportHeight
      const cameraHeight = Math.tan(fovy / 2) * mainCameraConfig.eye[2]
      const cameraWidth = cameraHeight * aspect

      const world = mat4.create()

      mat4.scale(world, world, [cameraWidth, cameraHeight, 1.0])

      return world
    },
    depthOpacity: () => {
      const { depthOpacity } = CONFIG

      return depthOpacity
    }
  },
  attributes: {
    a_position: positions,
    a_uv: uv,
  },
  uniforms: {
    u_world: regl.context<OwnContext & DefaultContext, 'world'>('world'),
    u_texture: regl.prop<Props, 'texture'>('texture'),
    u_depthOpacity: regl.context<OwnContext & DefaultContext, 'depthOpacity'>('depthOpacity'),
  },
  depth: {
    enable: true,
    mask: false,
    func: 'less',
  },
  blend: {
    enable: true,
    func: {
      srcRGB: 'src alpha',
      srcAlpha: 1,
      dstRGB: 'one minus src alpha',
      dstAlpha: 1,
    },
    equation: {
      rgb: 'add',
      alpha: 'add',
    },
    color: [0, 0, 0, 0],
  },
  elements,
  count: 6,
})

interface Props {
  texture: any,
}

interface OwnContext {
  world: any,
  depthOpacity: any

}