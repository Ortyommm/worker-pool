const { Worker } = require('worker_threads')
const path = require('path')
const EventEmitter = require('events')

class WorkerPool extends EventEmitter {
  queue = []
  workers = []
  lastTaskId = 1
  lastOverloadedWorker = 0
  constructor(workersCount, workerPath) {
    super()
    this.workersCount = workersCount
    this.workerPath = workerPath
    for (let i = 0; i < this.workersCount; i += 1) {
      const worker = new Worker(workerPath)
      this.workers.push({ worker, isBusy: false })
    }
  }
  run(workerData, taskId) {
    let freeWorker = this.workers.find((worker) => !worker.isBusy)
    if (!freeWorker) {
      freeWorker = this.workers[this.lastOverloadedWorker++ % this.workersCount]
    } else {
      this.lastOverloadedWorker = 0
    }

    freeWorker.isBusy = true
    const worker = freeWorker.worker
    return new Promise((resolve, reject) => {
      const removeWorkerListeners = () => {
        worker.off('message', onMessage)
        worker.off('error', onError)
        worker.off('exit', onExit)
      }

      const onTaskEnd = ({ data, error }) => {
        removeWorkerListeners()
        freeWorker.isBusy = false

        if (this.queue.length) {
          const queueTask = this.queue.pop()
          this.run(queueTask.workerData /*, queueTask.taskId*/)
        }
      }

      const onMessage = (data) => {
        resolve(data)
        onTaskEnd({ data })
      }

      function onError(error) {
        reject(error)
        onTaskEnd({ error })
      }

      function onExit(code) {
        if (code !== 0) {
          const error = new Error(`Worker stopped with exit code ${code}`)
          reject(error)
          onTaskEnd({ error })
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
