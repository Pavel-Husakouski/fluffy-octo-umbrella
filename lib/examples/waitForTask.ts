import { getTid, newTask, SystemCall, waitForTask } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

function* child(title: string, result: string): TaskRoutine<SystemCall | void> {
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }

    return result;
}

function* main(title: string): TaskRoutine<SystemCall | void> {
    const childId = yield newTask(child('child', 'a token'));
    console.log('child started', childId);
    const x = yield waitForTask(childId);
    if (x === 'a token') {
        console.log('waiting succeed', childId);
    } else {
        console.log('waiting failed', childId);
    }
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }
}

const scheduler = new Scheduler();

scheduler.newTask(main('main'));

scheduler.main();
