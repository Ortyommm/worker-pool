const { Worker } = require('worker_threads')
const EventEmitter = require('events')
const { WorkerContainer } = require('./WorkerContainer.js')

class WorkerPool extends EventEmitter {
  queue = []
  workers = []
  lastTaskId = 1
  constructor(workersCount, workerPath) {
    super()
    this.workersCount = workersCount
    this.workerPath = workerPath
    for (let i = 0; i < this.workersCount; i += 1) {
      const worker = new Worker(workerPath)
      this.workers.push(new WorkerContainer(worker, i))
    }
  }

  addTaskToQueue(workerData) {
    const taskId = this.lastTaskId++
    this.queue.push({ workerData, taskId })

    return new Promise((resolve, reject) => {
      const onTaskEnd = ({ taskId: endedTaskId, data, error }) => {
        if (taskId !== endedTaskId) return

        if (data) {
          resolve(data)
        } else if (error) {
          reject(error)
        }
        this.off('task:end', onTaskEnd)
      }

      this.on('task:end', onTaskEnd)
    })
  }

  executeTask(freeWorker, workerData, taskId) {
    freeWorker.isBusy = true
    return new Promise((resolve, reject) => {
      const removeWorkerListeners = () => {
        freeWorker.off('message', onMessage)
        freeWorker.off('error', onError)
        freeWorker.off('exit', onExit)
      }

      const onTaskEnd = ({ data, error }) => {
        removeWorkerListeners()
        freeWorker.isBusy = false

        if (taskId) {
          this.emit('task:end', { taskId, data, error })
        }

        if (this.queue.length) {
          const queueTask = this.queue.pop()
          this.run(queueTask.workerData, queueTask.taskId)
        }
      }

      const onMessage = (data) => {
        resolve(data)
        onTaskEnd({ data })
      }

      const onError = (error) => {
        reject(error)
        onTaskEnd({ error })
      }

      const onExit = (code) => {
        if (code !== 0) {
          const error = new Error(`Worker stopped with exit code ${code}`)
          reject(error)
          onTaskEnd({ error })
        }

        //Replace worker
        const workerIndex = this.workers.findIndex(
          (worker) => worker.id === freeWorker.id
        )
        const newWorker = new Worker(this.workerPath)
        this.workers.splice(
          workerIndex,
          1,
          new WorkerContainer(newWorker, workerIndex)
        )
      }

      freeWorker.postMessage(workerData)
      freeWorker.on('message', onMessage)
      freeWorker.on('error', onError)
      freeWorker.on('exit', onExit)
    })
  }

  run(workerData, taskId) {
    const freeWorker = this.workers.find((worker) => !worker.isBusy)
    if (!freeWorker) return this.addTaskToQueue(workerData)

    return this.executeTask(freeWorker, workerData, taskId)
  }
}

module.exports = WorkerPool
//TODO test:benches
//TODO choose what videos to record
