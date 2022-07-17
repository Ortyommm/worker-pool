class WorkerContainer {
  tasksCount = 0
  constructor(worker, id) {
    this.worker = worker
    this.id = id
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

  terminate() {
    this.worker.terminate()
  }
}

module.exports = { WorkerContainer }
