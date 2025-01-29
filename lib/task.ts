import { Event } from './event';

export type TaskRoutine<T = any, TReturn = any, TNext = any> = AsyncGenerator<T, TReturn, TNext>;

export enum TaskState {
    Ready = 'Ready',
    Waiting = 'Waiting',
    Closed = 'Closed',
    Killed = 'Killed'
}

export class Task {
    static id = 0;

    public id = Task.id++;
    public readonly eventClosed = new Event('closed', this);

    private valueToBeSent: any = null;
    private _state: TaskState = TaskState.Ready;
    private readonly blockedBy = new Set<Event>();
    stateChange: null | ((state: TaskState) => void) = null;
    result: any = undefined;

    constructor(private readonly target: TaskRoutine) {
    }

    nextValue(value: any) {
        if (this.valueToBeSent !== undefined) {
            throw new Error('duplicate next value call');
        }
        this.valueToBeSent = value;
    }

    resume() {
        const result = this.target.next(this.valueToBeSent);

        this.valueToBeSent = undefined;

        return result;
    }

    startWaiting(event: Event) {
        console.assert(this._state === TaskState.Waiting || this._state === TaskState.Ready, 'Expected state is waiting or ready');
        this.blockedBy.add(event);
        this.state = TaskState.Waiting;
        event.after((result) => {
            this.stopWaiting(event, result);
        });
    }

    stopWaiting(event: Event, result: any) {
        console.assert(this._state === TaskState.Waiting, 'Expected state is waiting');
        this.blockedBy.delete(event);
        this.nextValue(result);
        this.state = this.blockedBy.size === 0 ? TaskState.Ready : TaskState.Waiting;
    }

    kill() {
        if (this._state == TaskState.Closed) {
            return;
        }

        this.state = TaskState.Killed;
        this.target.return(undefined);
    }

    close() {
        console.assert(this._state === TaskState.Killed || this._state === TaskState.Ready, 'Expected state is killed or ready');
        this.state = TaskState.Closed;
        this.eventClosed.activate(this.result);
    }

    isReady() {
        return this._state === TaskState.Ready;
    }

    private set state (value: TaskState) {
        if(this._state === value) {
            return;
        }
        this._state = value;
        this.raiseStateChange(value);
    }

    private raiseStateChange(value: TaskState) {
        if(this.stateChange == null) {
            return;
        }

        this.stateChange(value);
    }
}
