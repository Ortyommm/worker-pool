const { isMainThread, parentPort } = require('worker_threads')

function workerDecorator(fn) {
  if (isMainThread) {
    throw new Error('Script must be executed as a worker')
  }

  return function ({ data, taskId }) {
    const self = {
      postMessage(data) {
        parentPort.postMessage({ data, taskId })
      },
    }

    try {
      fn.call(self, data)
    } catch (error) {
      error.taskId = taskId
      throw error
    }
  }
}

module.exports = { workerDecorator }
