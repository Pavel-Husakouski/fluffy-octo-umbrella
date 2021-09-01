export type TaskRoutine<T = any, TReturn = any, TNext = any> = Generator<T, TReturn, TNext>;

export enum TaskState {
    Ready,
    Waiting
}

export class Task {
    static id = 0;

    public id = Task.id++;
    private valueToBeSent: any = null;
    private state: TaskState = TaskState.Ready;
    private waiting = new Map<number, Task>();

    constructor(private target: TaskRoutine) {
    }

    nextValue(value: any) {
        this.valueToBeSent = value;
    }

    run() {
        const result = this.target.next(this.valueToBeSent);

        this.valueToBeSent = undefined;

        return result;
    }

    stopWaiting(task: Task) {
        this.waiting.delete(task.id);
    }

    getWaiting(): Array<Task> {
        return new Array(...this.waiting.values());
    }
}
