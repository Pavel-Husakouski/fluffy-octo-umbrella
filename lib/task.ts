export type TaskRoutine<T = any, TReturn = any, TNext = any> = Generator<T, TReturn, TNext>;

export enum TaskState {
    Ready,
    Waiting,
    Finished
}

export class Task {
    static id = 0;

    public id = Task.id++;
    private valueToBeSent: any = null;
    private _state: TaskState = TaskState.Ready;
    private waiting = new Map<number, Task>();

    constructor(private target: TaskRoutine) {
    }

    nextValue(value: any) {
        if (this.valueToBeSent !== undefined) {
            throw new Error('duplicate next value call');
        }
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

    addWaiting(task: Task) {
        this.waiting.set(task.id, task);
    }

    close() {
        this.state = TaskState.Finished;
        this.target.return(undefined);
    }

    get state() {
        return this._state;
    }

    set state(value: TaskState) {
        this._state = value;
    }
}
