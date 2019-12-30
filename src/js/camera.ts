/**
 * @author Lorenzo Cadamuro / http://lorenzocadamuro.com
 */

import { mat4 } from 'gl-matrix'
import { regl } from './renderer'
import gui from './helpers/gui'
import * as dat from 'dat.gui'
import { DefaultContext } from 'regl'

const CONFIG = {
  fov: 45,
  near: 0.01,
  far: 1000,
}

gui.get((gui: dat.GUI) => {
  const folder = gui.addFolder('Camera')

  folder.add(CONFIG, 'fov', 0, 200)
})

const cameraConfig = {
  eye: [0, 0, 6],
  target: [0, 0, 0],
  up: [0, 1, 0],
}

export default regl<{}, {}, {}, OwnContext, DefaultContext>({
  context: {
    projection: ({ viewportWidth, viewportHeight }) => {
      const { fov, near, far } = CONFIG
      const fovy = (fov * Math.PI) / 180
      const aspect = viewportWidth / viewportHeight

      return mat4.perspective(mat4.create(), fovy, aspect, near, far)
    },

    view: (context, props) => {
      const config = Object.assign({}, cameraConfig, props)

      const { eye, target, up } = config

      return mat4.lookAt(mat4.create(), eye, target, up)
    },

    fov: () => {
      const { fov } = CONFIG
      return fov
    }
  },

  uniforms: {
    u_projection: regl.context<Context, 'projection'>('projection'),
    u_view: regl.context<Context, 'view'>('view'),
    u_cameraPosition: regl.context<Context, 'eye'>('eye'),
    u_resolution: ({ viewportWidth, viewportHeight }) => {
      return [viewportWidth, viewportHeight]
    },
  },
})


interface Uniforms {
  u_projection: any,
  u_view: any,
  u_cameraPosition: any,
  u_resolution: any
}

interface Context extends DefaultContext {
  projection,
  view,
  eye,
}

interface OwnContext {
  projection:  mat4,
  view: any,
  fov: any,
}