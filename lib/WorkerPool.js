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
    this.on('task:end', this.executeTaskFromQueue)
  }

  getFreeWorker() {
    return this.workers.find((worker) => !worker.isBusy)
  }

  executeTaskFromQueue() {
    if (this.queue.length) {
      this.executeTaskById(this.queue[0].taskId)
    }
  }

  addTaskToQueue({ workerData }) {
    const taskId = this.lastTaskId++

    return new Promise((resolve, reject) => {
      this.queue.push({ workerData, taskId, resolve, reject })
      this.executeTaskById(taskId)
    })
  }

  executeTaskById(taskId) {
    const freeWorker = this.getFreeWorker()
    if (!freeWorker) return

    const taskIndex = this.queue.findIndex((task) => task.taskId === taskId)
    const [task] = this.queue.splice(taskIndex, 1)

    freeWorker.isBusy = true
    const removeWorkerListeners = () => {
      freeWorker.off('message', onMessage)
      freeWorker.off('error', onError)
      freeWorker.off('exit', onExit)
    }

    const onTaskEnd = () => {
      removeWorkerListeners()
      freeWorker.isBusy = false
      this.emit('task:end')
    }

    const onMessage = (data) => {
      task.resolve(data)
      onTaskEnd()
    }

    const onError = (error) => {
      task.reject(error)
      onTaskEnd()
    }

    const onExit = (code) => {
      if (code !== 0) {
        const error = new Error(`Worker stopped with exit code ${code}`)
        task.reject(error)
        onTaskEnd()
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

    freeWorker.postMessage(task.workerData)
    freeWorker.on('message', onMessage)
    freeWorker.on('error', onError)
    freeWorker.on('exit', onExit)
  }

  run(workerData) {
    return this.addTaskToQueue({ workerData })
  }
}

module.exports = WorkerPool
//TODO test:benches
//TODO choose what videos to record
