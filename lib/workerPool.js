const { Worker } = require('worker_threads')

class WorkerPool {
  workers = []
  constructor(workersCount, workerPath) {
    this.workersCount = workersCount
    this.workerPath = workerPath
    //Init workers
    for (let i = 0; i < this.workersCount; i += 1) {
      const worker = new Worker(workerPath)
      this.workers.push({ worker, tasksCount: 0 })
    }
  }

  //Select least busy worker
  selectWorker() {
    return this.workers.reduce((leastBusyWorker, currentWorker) => {
      if (leastBusyWorker.tasksCount > currentWorker.tasksCount) {
        leastBusyWorker = currentWorker
      }
      return leastBusyWorker
    }, this.workers[0])
  }

  run(workerData) {
    const currentWorker = this.selectWorker()
    currentWorker.tasksCount++
    const worker = currentWorker.worker
    return new Promise((resolve, reject) => {
      const removeWorkerListeners = () => {
        worker.off('message', onMessage)
        worker.off('error', onError)
        worker.off('exit', onExit)
      }

      const onTaskEnd = () => {
        removeWorkerListeners()
        currentWorker.tasksCount--
      }

      const onMessage = (data) => {
        resolve(data)
        onTaskEnd()
      }

      const onError = (error) => {
        reject(error)
        onTaskEnd()
      }

      const onExit = (code) => {
        if (code !== 0) {
          const error = new Error(`Worker stopped with exit code ${code}`)
          reject(error)
          onTaskEnd()
        }
      }

      worker.postMessage(workerData)
      worker.on('message', onMessage)
      worker.on('error', onError)
      worker.on('exit', onExit)
    })
  }
}

module.exports = WorkerPool
