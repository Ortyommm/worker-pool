class WorkerContainer {
  isBusy = false
  constructor(worker, id) {
    this.worker = worker
    this.id = id
  }

  postMessage(data) {
    this.worker.postMessage(data)
  }

  on(event, cb) {
    this.worker.on(event, cb)
  }

  off(event, cb) {
    this.worker.off(event, cb)
  }
}

module.exports = { WorkerContainer }
