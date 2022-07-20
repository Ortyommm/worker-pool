const { Worker } = require('worker_threads')
const { WorkerContainer } = require('./WorkerContainer.js')

class WorkerPool {
  workers = [];

  constructor(workersCount, workerPath) {
    this.workersCount = workersCount;
    this.workerPath = workerPath;

    for (let i = 0; i < this.workersCount; i++) {
      const worker = new Worker(workerPath)
      this.workers.push(new WorkerContainer(worker, i))
    }

    this.lastWorkerId = this.workersCount - 1

  }

  selectWorker() {
    return this.workers.reduce((leastBusyWorker, currentWorker) => {
      if (leastBusyWorker.tasksCount > currentWorker.tasksCount) {
        leastBusyWorker = currentWorker;
      }
      return leastBusyWorker
    }, this.workers[0])
  }

  run(data) {
    const currentWorker = this.selectWorker()
    const taskId = ++currentWorker.tasksCount

    return new Promise((resolve, reject) => {

      const removeWorkerListeners = () => {
        currentWorker.off('message', onMessage)
        currentWorker.off('error', onError)
        currentWorker.off('exit', onExit)
      }

      const onTaskEnd = () => {
        removeWorkerListeners()
        currentWorker.tasksCount--
      }

      const onMessage = (response) => {
        if (response.taskId !== taskId) return
        resolve(response.result)
        onTaskEnd()
      }

      const onError = (error) => {
        if (error.taskId !== taskId) return
        reject(error)
        onTaskEnd()
      }

      const onExit = (code) => {
        if (code !== 0) {
          const error = new Error(`Worker stopped with exit code ${code}`)
          reject(error)
          onTaskEnd()
          // Замена воркера при выходе
          const workerIndex = this.workers.findIndex(worker => worker.id === currentWorker.id)
          this.workers.splice(workerIndex, 1, new WorkerContainer(new Worker(this.workerPath), ++this.lastWorkerId))
        }
      }


      currentWorker.postMessage({ data, taskId })

      currentWorker.on('message', onMessage)
      currentWorker.on('error', onError)
      currentWorker.on('exit', onExit)
    })
  }
}

module.exports = WorkerPool