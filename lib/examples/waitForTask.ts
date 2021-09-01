import { getTid, newTask, SystemCall, waitForTask } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

function* child(title: string): TaskRoutine<SystemCall | void> {
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }
}

function* main(title: string): TaskRoutine<SystemCall | void> {
    const childId = yield newTask(child('child'));
    console.log('child started', childId);
    if (yield waitForTask(childId)) {
        console.log('waiting succeed', childId);
    }
    for (let i = 0; i < 5; i++) {
        console.log(title);
        yield;
    }
}

const scheduler = new Scheduler();

scheduler.new(main('main'));

scheduler.main();
