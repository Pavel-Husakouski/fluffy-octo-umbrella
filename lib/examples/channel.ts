import { createChannel, getMessage, newTask, postMessage, SystemCall } from '../systemCall';
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
    yield newTask(child('child', 'a token', channel));
    console.log(title, '>', 'wait a little');
    for (let i =0; i< 5; i++) {
        yield postMessage(channel, {text: `ping #${i}`, sender: title});
    }
    yield postMessage(channel, null);
    console.log(title, '>', 'wait a little once again');
}

const scheduler = new Scheduler();

scheduler.newTask(main('main'));

scheduler.main();
