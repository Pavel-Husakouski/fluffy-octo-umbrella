import { getTid, killTask, newTask, SystemCall } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

async function* subTask(title: string): TaskRoutine<SystemCall> {
    while (true) {
        console.log(title, yield getTid());
    }
}

async function* main(title: string): TaskRoutine<SystemCall | void> {
    const tid = yield getTid();
    const taskId = yield newTask(subTask('sub task'));
    console.log('sub task started', taskId);
    for (let i = 0; i < 5; i++) {
        console.log(title, tid);
        yield;
    }
    if (yield killTask(taskId)) {
        console.log('sub task killed', taskId);
    }
    for (let i = 0; i < 5; i++) {
        console.log(title, tid);
        yield;
    }
}

const scheduler = new Scheduler();

scheduler.newTask(main('main'));

scheduler.main();
