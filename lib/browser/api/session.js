const {EventEmitter} = require('events')
const electron = require('electron')
const bindings = process.atomBinding('session')

const PERSIST_PREFIX = 'persist:'
const Session = new EventEmitter()

// Wrapper of binding.fromPartition that checks for ready event.
const fromPartition = function (partition, persist) {
  if (!electron.app.isReady()) {
    throw new Error('session module can only be used when app is ready')
  }

  return bindings.fromPartition(partition, persist)
}

// Returns the Session from |partition| string.
Session.fromPartition = function (partition = '') {
  if (partition === '') return exports.defaultSession

  if (partition.startsWith(PERSIST_PREFIX)) {
    return fromPartition(partition.substr(PERSIST_PREFIX.length), false)
  } else {
    return fromPartition(partition, true)
  }
}

// Returns the default session.
Object.defineProperty(Session, 'defaultSession', {
  enumerable: true,
  get: function () {
    return fromPartition('', false)
  }
})

const wrapSession = function (session) {
  // Session is an EventEmitter.
  Object.setPrototypeOf(session, EventEmitter.prototype)
  Session.emit('session-created', session)
}

bindings._setWrapSession(wrapSession)

module.exports = Session
