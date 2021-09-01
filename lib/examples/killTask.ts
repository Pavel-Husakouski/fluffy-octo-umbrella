import { getTid, newTask, SystemCall } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

function* subTask(title: string): TaskRoutine<SystemCall | void> {
    while (true) {
        console.log(title, yield getTid());
    }
}

function* main(title: string): TaskRoutine<SystemCall | void> {
    const tid = yield getTid();
    const taskId = yield newTask(subTask('sub task'));
    console.log('sub task started', taskId);
    for (let i = 0; i < 5; i++) {
        console.log(title, tid);
    }
    if (yield killTask(taskId)) {
        console.log('sub task killed', taskId);
    }
    for (let i = 0; i < 5; i++) {
        console.log(title, tid);
    }
}

const scheduler = new Scheduler();

scheduler.new(main('main'));

scheduler.main();
