import { getTid, newTask, SystemCall, waitForTask } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

function* child(title: string, result: string): TaskRoutine<SystemCall | void> {
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }

    return result;
}

function* main(title: string): TaskRoutine<SystemCall | TaskRoutine<SystemCall | void> | void> {
    const x = yield child('child', 'a token');
    if (x === 'a token') {
        console.log('waiting succeed');
    } else {
        console.log('waiting failed');
    }
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }
}

const scheduler = new Scheduler();

scheduler.newTask(main('main'));

scheduler.main();
