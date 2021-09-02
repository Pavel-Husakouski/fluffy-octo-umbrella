export type Subscription = (result: any) => void;

export class Event {
    private set = new Set<Subscription>();

    constructor(readonly name: string, readonly owner: any) {
    }

    after(s: Subscription) {
        this.set.add(s);
    }

    activate(result: any) {
        const subscriptions = new Array(...this.set);
        this.set.clear();
        for (const subscription of subscriptions) {
            subscription(result);
        }
    }
}