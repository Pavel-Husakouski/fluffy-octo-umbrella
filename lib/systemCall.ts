import { Scheduler } from './scheduler';
import { Task, TaskRoutine } from './task';

export interface ISystemCallHandler {
    getTid(self: Task): void;

    waitForTask(self: Task, idToWaitFor: number): void;

    newTask(self: Task, routine: TaskRoutine): void;

    killTask(self: Task, idToKill: number): void;
}

export class SystemCallHandler implements ISystemCallHandler {
    constructor(private scheduler: Scheduler) {
    }

    getTid(self: Task): void {
        self.nextValue(self.id);
    }

    waitForTask(self: Task, idToWaitFor: number): void {
        const taskToWaitFor = this.scheduler.getTask(idToWaitFor);

        if (taskToWaitFor == null) {
            self.nextValue(false);
            return;
        }

        self.nextValue(true);
        self.startWaiting(taskToWaitFor);
    }

    newTask(self: Task, routine: TaskRoutine): void {
        const id = this.scheduler.new(routine);

        self.nextValue(id);
    }

    killTask(self: Task, idToKill: number): void {
        const task = this.scheduler.getTask(idToKill);

        if (task) {
            task.kill();
            self.nextValue(true);
        } else {
            self.nextValue(false);
        }
    }
}

export abstract class SystemCall {
    abstract handle(self: Task, handler: ISystemCallHandler): void;
}

export function getTid(): GetTid {
    return new GetTid();
}

class GetTid extends SystemCall {
    handle(self: Task, handler: ISystemCallHandler): void {
        handler.getTid(self);
    }
}

class WaitForTask extends SystemCall {
    constructor(private idToWaitFor: number) {
        super();
    }

    handle(self: Task, handler: ISystemCallHandler): void {
        handler.waitForTask(self, this.idToWaitFor);
    }
}

export function waitForTask(id: number) {
    return new WaitForTask(id);
}

class NewTask extends SystemCall {
    constructor(private routine: TaskRoutine) {
        super();
    }

    handle(self: Task, handler: ISystemCallHandler): void {
        handler.newTask(self, this.routine);
    }
}

export function newTask(routine: TaskRoutine) {
    return new NewTask(routine);
}

class KillTask extends SystemCall {
    constructor(private idToKill: number) {
        super();
    }

    handle(self: Task, handler: ISystemCallHandler): void {
        handler.killTask(self, this.idToKill);
    }
}

export function killTask(id: number) {
    return new KillTask(id);
}