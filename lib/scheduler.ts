import { ISystemCallHandler, SystemCall, SystemCallHandler } from './systemCall';
import { Task, TaskRoutine, TaskState } from './task';
import { Channel } from './channel';

export class Scheduler {
    private readonly systemCallHandler: ISystemCallHandler = new SystemCallHandler(this);
    private readonly taskMap = new Map<number, Task>();
    private readonly resourceMap = new Map<number, Channel>();
    private readonly ready = new Array<Task>();

    constructor() {
    }

    newTask(taskRoutine: TaskRoutine) {
        const task = new Task(taskRoutine);

        task.stateChange = (state) => {
            if(state === TaskState.Closed) {
                this.onTaskClose(task);
            } else if (state === TaskState.Ready) {
                this.arrange(task)
            }
        };

        this.taskMap.set(task.id, task);
        this.arrange(task);

        return task.id;
    }

    newChannel() {
        const resource = new Channel();

        this.resourceMap.set(resource.id, resource);

        return resource.id;
    }

    getChannel(target: number) {
        return this.resourceMap.get(target);
    }

    private getNextReady(): Task {
        const task = this.ready.shift();

        if (task == null) {
            throw new Error('The task queue is exhausted');
        }

        return task;
    }

    async main() {
        while (this.taskMap.size) {
            const task = this.getNextReady();
            const {done, value: result} = await task.resume();

            if (result instanceof SystemCall) {
                result.handle(task, this.systemCallHandler);
            }

            if(isRoutine(result)) {
                this.systemCallHandler.newTask(task, result);
            }

            if (done) {
                task.result = result;
                task.close();
            }

            this.arrange(task);
        }
    }

    onTaskClose(task: Task) {
        console.assert(this.ready.find( x => x === task) == null, 'Expected task to be not in the ready queue');
        this.taskMap.delete(task.id);
    }

    arrange(task: Task) {
        if (!task.isReady()) {
            return;
        }

        this.ready.push(task);
    }

    getTask(id: number) {
        return this.taskMap.get(id);
    }
}

function isRoutine(x: any): x is TaskRoutine {
    return x?.[Symbol.asyncIterator] != null || x?.[Symbol.iterator] != null;
}