/**
 * @author Lorenzo Cadamuro / http://lorenzocadamuro.com
 */

import { mat4 } from 'gl-matrix'
import { regl } from '../../../renderer'
import { positions } from './config'
import frag from './shader.frag'
import vert from './shader.vert'
import { DefaultContext } from 'regl'

export default regl<{}, {}, OwnContext>({
  vert,
  frag,
  attributes: {
    a_position: positions,
  },
  context: {
    world: (context, { uvRotation }) => {
      const world = mat4.create()

      mat4.rotate(world, world, uvRotation, [0, 0, 1])

      return world
    },
  },
  uniforms: {
    u_world: regl.context<OwnContext & DefaultContext, 'world'>('world'),
    u_texture: regl.prop<Props, 'texture'>('texture'),
    u_textureMatrix: regl.prop<Props, 'textureMatrix'>('textureMatrix'),
  },
  count: 6,
})

interface Props {
  texture: any,
  textureMatrix: any,
}

interface OwnContext {
  world: any

  texture,
  textureMatrix, 
  uvRotation
}
