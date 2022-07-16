const { Worker } = require('worker_threads')
const { WorkerContainer } = require('./WorkerContainer.js')

let index = 0
class WorkerPool {
  workers = []
  constructor(workersCount, workerPath) {
    this.workersCount = workersCount
    this.workerPath = workerPath
    //Init workers
    for (let i = 0; i < this.workersCount; i += 1) {
      const worker = new Worker(workerPath)
      this.workers.push(new WorkerContainer(worker))
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
    const taskId = ++currentWorker.tasksCount
    return new Promise((resolve, reject) => {
      const removeWorkerListeners = () => {
        currentWorker.off('message', onMessage)
        currentWorker.off('error', onError)
        currentWorker.off('exit', onExit)
      }

      const onTaskEnd = () => {
        // if (currentWorker) console.log(currentWorker)
        removeWorkerListeners()
        currentWorker.tasksCount--
      }

      const onMessage = (response) => {
        if (taskId !== response.taskId) return
        resolve(response.data)
        onTaskEnd()
      }

      const onError = (error) => {
        if (taskId !== error.taskId) return
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

      currentWorker.postMessage(workerData)
      currentWorker.on('message', onMessage)
      currentWorker.on('error', onError)
      currentWorker.on('exit', onExit)
    })
  }
}

module.exports = WorkerPool
