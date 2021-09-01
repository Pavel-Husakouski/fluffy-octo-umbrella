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
            const task = this.getNextReady()
            const {done, value: result} = task.run();

            if (result instanceof SystemCall) {
                result.handle(task, this.systemCallHandler);
            }

            if (done) {
                this.drop(task);
            }

            this.arrange(task);
        }
    }

    drop(task: Task) {
        this.onTaskDrop(task);
        task.state = TaskState.Finished;
        this.taskMap.delete(task.id);

        for (const t of task.getWaiting()) {
            t.state = TaskState.Ready;
            t.nextValue(true);
            this.arrange(t);
        }
    }

    arrange(task: Task) {
        if (task.state !== TaskState.Ready) {
            return;
        }

        this.ready.push(task);
    }

    private onTaskDrop(task: Task) {
        console.log('Task %d terminated', task.id);
    }

    getTask(id: number) {
        return this.taskMap.get(id);
    }
}
