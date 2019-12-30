/**
 * @author Lorenzo Cadamuro / http://lorenzocadamuro.com
 */

import {
  mat4
} from 'gl-matrix'
import { regl } from '../../renderer'
import gui from '../../helpers/gui'
import { positions, centers, uv, elements, colors } from './config'
import frag from './shader.frag'
import vert from './shader.vert'
import { Framebuffer2D, DefaultContext, FaceOrientationType, Texture2D, FramebufferCube, TextureCube } from 'regl'
import * as dat from 'dat.gui'

const emptyTexture = regl.texture()
const emptyCube = regl.cube()

const CONFIG = {
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  rotation: 0,
  rotateX: 1,
  rotateY: 1,
  rotateZ: 1,
  scale: 1,
  borderWidth: 0.008,
  displacementLength: 0.028,
  reflectionOpacity: 0.3,
  scene: 3
}

gui.get((gui: dat.GUI) => {
  const folder = gui.addFolder('Cube')


  folder.add(CONFIG, 'translateX', -30, 30).step(0.01)
  folder.add(CONFIG, 'translateY', -30, 30).step(0.01)
  folder.add(CONFIG, 'translateZ', -30, 30).step(0.01)
  folder.add(CONFIG, 'rotation', -5, 5).step(0.0001)
  folder.add(CONFIG, 'rotateX', 0, 10).step(0.1)
  folder.add(CONFIG, 'rotateY', 0, 10).step(0.1)
  folder.add(CONFIG, 'rotateZ', 0, 10).step(0.1)
  folder.add(CONFIG, 'scale', 0, 10).step(0.01)
  folder.add(CONFIG, 'borderWidth', 0, 0.1).step(0.01)
  folder.add(CONFIG, 'displacementLength', 0, 2).step(0.01)
  folder.add(CONFIG, 'reflectionOpacity', 0, 1).step(0.01)
  folder.add(CONFIG, 'scene', { 'Apple': 3, 'Mask': 2, 'Displacement': 1 })
})

export default regl<{}, {}, Props, OwnContext>({
  frag,
  vert,
  context: {
    world: (context: DefaultContext, { matrix }) => {
      const { translateX, translateY, translateZ, rotation, rotateX, rotateY, rotateZ, scale } = CONFIG
      const world = mat4.create()

      mat4.translate(world, world, [translateX, translateY, translateZ])
      mat4.rotate(world, world, rotation, [rotateX, rotateY, rotateZ])
      mat4.scale(world, world, [scale, scale, scale])

      if (matrix) {
        mat4.multiply(world, world, matrix)
      }

      return world
    },
    face: (context: DefaultContext, { cullFace }) => cullFace === 'front' ? -1 : 1,
    texture: (context: DefaultContext, { texture }) => texture || emptyTexture ,
    reflection: (context: DefaultContext, { reflection }) => reflection || emptyCube,
    textureMatrix: (context: DefaultContext, { textureMatrix }) => textureMatrix,
    borderWidth: () => CONFIG.borderWidth,
    displacementLength: () => CONFIG.displacementLength,
    reflectionOpacity: () => CONFIG.reflectionOpacity,
    scene: (): number => CONFIG.scene,
  },
  attributes: {
    a_position: positions,
    a_center: centers,
    a_uv: uv,
    a_color: colors,
  },
  uniforms: {
    u_world: regl.context<OwnContext & DefaultContext, 'world'>('world'),
    u_face: regl.context<OwnContext & DefaultContext, 'face'>('face'),
    u_typeId: regl.prop<Props, 'typeId'>('typeId'),
    u_texture: regl.context<OwnContext & DefaultContext, 'texture'>('texture'),
    u_reflection: regl.context<OwnContext & DefaultContext, 'reflection'>('reflection'),
    u_tick: regl.context('tick'),
    u_borderWidth: regl.context<OwnContext & DefaultContext, 'borderWidth'>('borderWidth'),
    u_displacementLength: regl.context<OwnContext & DefaultContext, 'displacementLength'>('displacementLength'),
    u_reflectionOpacity: regl.context<OwnContext & DefaultContext, 'reflectionOpacity'>('reflectionOpacity'),
    u_scene: regl.context<OwnContext & DefaultContext, 'scene'>('scene'),
  },
  cull: {
    enable: true,
    face: 'back'//regl.prop<Props, 'cullFace'>('cullFace'),
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
  count: 36,
  framebuffer: regl.prop<Props, 'fbo'>('fbo'),
})

export enum Types {
  DISPLACEMENT = 1,
  MASK = 2,
  FINAL = 3,
}

export enum Masks {
  M1 = 1,
  M2 = 2,
  M3 = 3,
  M4 = 4,
  M5 = 5,
}

interface Props {
  typeId: number,
  fbo: Framebuffer2D,
  cullFace: FaceOrientationType,
  reflexion: TextureCube,
  matrix: mat4,
  texture: Framebuffer2D,
  reflection: FramebufferCube,
}

interface OwnContext {
  world: mat4;
  face: 1 | -1;
  texture: any;
  reflection: any;
  textureMatrix: any;
  borderWidth: number;
  displacementLength: number;
  reflectionOpacity: number;
  scene: number;
}