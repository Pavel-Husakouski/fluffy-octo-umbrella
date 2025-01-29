import { getTid, SystemCall } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

async function* main(title: string): TaskRoutine<SystemCall | void> {
    for (let i = 0; i < 5; i++) {
        console.log(title, yield getTid());
    }
}

const scheduler = new Scheduler();

scheduler.newTask(main('foo'));
scheduler.newTask(main('bar'));
scheduler.newTask(main('zaz'));

scheduler.main();
