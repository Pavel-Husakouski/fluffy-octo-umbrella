import { Scheduler } from './scheduler';
import { Task, TaskRoutine } from './task';

export interface ISystemCallHandler {
    getTid(self: Task): void;

    waitForTask(self: Task, idToWaitFor: number): void;

    newTask(self: Task, routine: TaskRoutine): void;

    killTask(self: Task, idToKill: number): void;

    waitForNewTask(task: Task, routine: TaskRoutine): void;

    postMessage(self: Task, channel: number, message: any): void;

    getMessage(self: Task, channel: number): void;

    createChannel(self: Task): void;
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
            return;
        }

        self.startWaiting(taskToWaitFor.eventClosed);
    }

    waitForNewTask(task: Task, routine: TaskRoutine) {
        const id = this.scheduler.newTask(routine);

        this.waitForTask(task, id);
    }

    newTask(self: Task, routine: TaskRoutine): void {
        const id = this.scheduler.newTask(routine);

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

    postMessage(self: Task, target: number, message: any): void {
        const channel = this.scheduler.getChannel(target);

        if (channel) {
            channel.postMessage(message);
            self.nextValue(true);
        } else {
            self.nextValue(false);
        }
    }

    getMessage(self: Task, target: number): void {
        const channel = this.scheduler.getChannel(target);

        if (channel == null) {
            self.nextValue(undefined); // an exception might be required
        } else {
            channel.getMessage(self);
        }
    }

    createChannel(self: Task): void {
        const id = this.scheduler.newChannel();

        self.nextValue(id);
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

class PostMessage extends SystemCall {
    constructor(readonly target: number, readonly message: any) {
        super();
    }

    handle(self: Task, handler: ISystemCallHandler): void {
        handler.postMessage(self, this.target, this.message);
    }
}

export function postMessage(target: number, message: any) {
    return new PostMessage(target, message);
}

class GetMessage extends SystemCall {
    constructor(readonly channel: number) {
        super();
    }

    handle(self: Task, handler: ISystemCallHandler): void {
        handler.getMessage(self, this.channel);
    }
}

export function getMessage(channel: number) {
    return new GetMessage(channel);
}

class CreateChannel extends SystemCall {
    constructor() {
        super();
    }

    handle(self: Task, handler: ISystemCallHandler) {
        handler.createChannel(self);
    }
}

export function createChannel() {
    return new CreateChannel();
}