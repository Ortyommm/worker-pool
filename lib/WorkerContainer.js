class WorkerContainer {
  tasksCount = 0
  constructor(worker) {
    this.worker = worker
  }

  get lastTaskId() {
    return this.tasksCount
  }

  postMessage(data) {
    this.worker.postMessage({ data, taskId: this.lastTaskId })
  }

  on(event, cb) {
    this.worker.on(event, cb)
  }

  off(event, cb) {
    this.worker.off(event, cb)
  }
}

module.exports = { WorkerContainer }
