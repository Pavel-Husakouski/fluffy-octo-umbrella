import { getTid, killTask, newTask, SystemCall, waitForTask } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

function* aTarget(title: string): TaskRoutine<SystemCall | void> {
    while (true) {
        console.log(title, yield getTid());
    }
}

function* aKiller(title: string, aTaskToKill: number): TaskRoutine<SystemCall | void> {
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }
    if (yield killTask(aTaskToKill)) {
        console.log('Order has been fulfilled');
    }
    while (true) {
        console.log(title, yield getTid());
    }
}

function* main(title: string): TaskRoutine<SystemCall | void> {
    const target = yield newTask(aTarget('target'));
    console.log('target started', target);
    const killer = yield newTask(aKiller('killer', target));
    console.log('killer started', killer);
    yield waitForTask(target);
    console.log('target has been finished', target);
    if (yield killTask(killer)) {
        console.log('killer has been finished', killer);
    }
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }
}

const scheduler = new Scheduler();

scheduler.newTask(main('main'));

scheduler.main();
