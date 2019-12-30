/**
 * @author Lorenzo Cadamuro / http://lorenzocadamuro.com
 */
///<reference path="../index.d.ts" />

import * as dat from 'dat.gui'
import * as queryString from 'query-string'

let gui: dat.GUI;

const init = () => {
  if (!gui) {
    gui = new dat.GUI({ width: 300 })
  } 
}

setTimeout(() => {
  const parsed = queryString.parse(location.search)
  const debugMode = parsed.debug === 'true'

  if (debugMode || devMode) {
    init()
  }
})

export default {
  get: (callback: (gui: dat.GUI) => void) => {
    setTimeout(() => {
      if (gui) {
        callback(gui)
      }
    })
  },
}
