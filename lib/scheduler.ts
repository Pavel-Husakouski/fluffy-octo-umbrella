import { SystemCall, SystemCallHandler } from './systemCall';
import { Task, TaskRoutine, TaskState } from './task';

export class Scheduler {
    private readonly systemCallHandler = new SystemCallHandler(this);
    private readonly taskMap = new Map<number, Task>();
    private readonly ready = new Array<Task>();

    constructor() {
    }

    new(taskRoutine: TaskRoutine) {
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

    private getNextReady(): Task {
        const task = this.ready.shift();

        if (task == null) {
            throw new Error('The task queue is exhausted');
        }

        return task;
    }

    main() {
        while (this.taskMap.size) {
            const task = this.getNextReady();
            const {done, value: result} = task.resume();

            if (result instanceof SystemCall) {
                result.handle(task, this.systemCallHandler);
            }

            if (done) {
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
