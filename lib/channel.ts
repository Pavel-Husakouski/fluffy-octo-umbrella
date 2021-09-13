import { Event } from './event';
import { Task } from './task';

export class Channel {
    static id = 0;

    public id = Channel.id++;
    private messages = new Array<Event>();

    private eventMessage: Event | null = null;

    constructor() {
    }

    postMessage(message: any) {
        if (this.eventMessage != null) {
            this.eventMessage.activate(message);
        } else {
            this.messages.push(message);
        }
    }

    getMessage(task: Task) {
        if(this.eventMessage != null) {
            throw new Error('getMessage invocation error');
        }

        if (this.messages.length > 0) {
            const message = this.messages.shift();

            task.nextValue(message);
        } else {
            this.eventMessage = new Event('message', this);
            task.startWaiting(this.eventMessage);
            this.eventMessage.after(() => {
                this.eventMessage = null;
            });
        }
    }
}