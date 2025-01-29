import { getTid, newTask, SystemCall } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

async function* child(title: string): TaskRoutine<SystemCall | void> {
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }
}

async function* main(title: string): TaskRoutine<SystemCall | void> {
    const childId = yield newTask(child('child'));
    console.log('child started', childId);
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }
}

const scheduler = new Scheduler();

scheduler.newTask(main('main'));

scheduler.main();
