import { createChannel, getMessage, getTid, newTask, postMessage, SystemCall, waitForTask } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

async function* child(title: string, result: string, channel: number ): TaskRoutine<SystemCall | void> {
    while(title) {
        const message = yield getMessage(channel);

        if(message == null) {
            break;
        }

        console.log(title, '>', message.text, message.sender);
    }

    console.log(title, '>', 'done');

    return result;
}

async function* main(title: string): TaskRoutine<SystemCall | void> {
    const channel = yield createChannel();
    console.log(title, '>', 'start sending');
    for (let i =0; i< 5; i++) {
        yield postMessage(channel, {text: `ping #${i}`, sender: title});
    }
    yield postMessage(channel, null);
    const id = yield newTask(child('child', 'a token', channel));
    console.log(title, '>', 'wait a little');
    yield waitForTask(id);
    console.log(title, '>', 'job finished');
}

const scheduler = new Scheduler();

scheduler.newTask(main('main'));

scheduler.main();
