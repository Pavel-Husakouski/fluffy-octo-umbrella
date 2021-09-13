import { getMessage, getTid, newTask, postMessage, SystemCall, waitForTask } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

function* child(title: string, result: string): TaskRoutine<SystemCall | void> {
    while(title) {
        const message = yield getMessage();

        console.log(message.text, message.sender);
    }

    return result;
}

function* main(title: string): TaskRoutine<SystemCall | void> {
    const id = yield getTid();
    const childId = yield newTask(child('child', 'a token'));
    console.log('wait a little', yield getTid());
    for (let i =0; i< 5; i++) {
        yield postMessage(childId, {text: 'ping from' + title, sender: id});
    }
}

const scheduler = new Scheduler();

scheduler.new(main('main'));

scheduler.main();
