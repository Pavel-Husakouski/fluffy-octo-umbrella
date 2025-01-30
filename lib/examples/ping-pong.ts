import { createChannel, getMessage, postMessage, SystemCall, waitForTask } from '../systemCall';
import { Scheduler } from '../scheduler';
import { TaskRoutine } from '../task';

function* ping(from: number, to: number): TaskRoutine<SystemCall | void> {
  const title = 'ping';

  for (let i = 0; i < 5; i++) {
    yield postMessage(to, { text: title, sender: title });

    const message = yield getMessage(from);

    console.log(title, '>', message.text, message.sender);
  }

  console.log(title, '>', 'done');
}

function* pong(from: number, to: number): TaskRoutine<SystemCall | void> {
  const title = 'pong';

  for (let i = 0; i < 5; i++) {
    yield postMessage(to, { text: title, sender: title });

    const message = yield getMessage(from);

    console.log(title, '>', message.text, message.sender);
  }

  console.log(title, '>', 'done');
}

function* main(title: string): TaskRoutine<SystemCall | TaskRoutine<SystemCall | void> | void> {
  const channel1 = yield createChannel();
  const channel2 = yield createChannel();
  const id1 = yield ping(channel1, channel2);
  const id2 = yield pong(channel2, channel1);

  yield waitForTask(id1);
  yield waitForTask(id2);

  console.log(title, '>', 'job finished');
}

const scheduler = new Scheduler();

scheduler.newTask(main('main'));

scheduler.main();
