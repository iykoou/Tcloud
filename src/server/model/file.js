/**
 * Created by lunik on 10/07/2017.
 */

import fs from 'fs'
import EventEmitter from 'events'
import Delogger from 'delogger'

export default class File extends EventEmitter {
  constructor (path) {
    super()

    let parsedPath = parsePath(path)
    this._path = parsedPath.path
    this.type = 'file'
    this.name = parsedPath.fileName
    this.locked = false
    this.downloadCount = 0

    this.initMetadata()

    this.log = new Delogger('File')

    fs.watch(this.fullPath(), (eventType, filename) => this.watchChange(eventType, filename))
  }
  initMetadata () {
    try {
      let stats = fs.statSync(this.fullPath())
      this._size = stats.size // Bytes
      this.exist = true
    } catch (err) {
      this._size = 0
      this.exist = false
    }
  }

  watchChange (eventType, filename) {
    this.initMetadata()
  }

  fullPath () {
    return `${this._path}/${this.name}`
  }
  size () {
    return this._size
  }

  lock () {
    this.locked = true
    this.emit('locked', this)
  }

  unlock () {
    this.locked = false
    this.emit('unlocked', this)
  }

  remove () {
    if (this.locked) {
      return false
    }
    this.log.info(`Removing ${this.fullPath()}`)

    fs.unlinkSync(this.fullPath())
    this.emit('remove', this)
  }

  addDownloader () {
    this.downloadCount++
    this.lock()
  }

  removeDownloader () {
    this.downloadCount--
    if (this.downloadCount <= 0) {
      this.downloadCount = 0
      this.unlock()
    }
  }

  rename (name) {
    if (this.locked) {
      return false
    }
    this.log.info(`Renaming ${this.fullPath()} into ${this._path}/${name}`)

    fs.renameSync(this.fullPath(), `${this._path}/${name}`)
    this.emit('rename', this)
  }

  create () {
    this.log.info(`Creating ${this.fullPath()}`)

    fs.writeFileSync(this.fullPath(), '')
  }

  toJSON () {
    return {
      name: this.name,
      type: this.type,
      locked: this.locked,
      download: this.download,
      _size: this.size(),
      childs: this.childs
    }
  }

  download (res, callback) {
    this.addDownloader()
    res.download(this.fullPath(), (err) => {
      if (err) this.log.error(err)

      this.removeDownloader()

      callback(err)
    })
  }
}

function parsePath (path) {
  let temp = path.split('/')

  removeBlank(temp, 1)

  let name = temp.splice(temp.length - 1, 1)[0]
  return { fileName: name, path: temp.join('/') }
}

function removeBlank (array, begin) {
  begin = begin || 0
  for (var i = begin; i < array.length; i++) { // Begining at 1 to prevent first backslash removing
    if (array[i] === '' || array[i] === null) {
      array.splice(i, 1)
      i--
    }
  }
  return array
}

export { removeBlank, parsePath }
