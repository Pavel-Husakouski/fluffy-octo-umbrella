export type Subscription = () => void;

export class Event {
    private set = new Set<Subscription>();

    constructor(readonly name: string, readonly owner: any) {
    }

    after(s: Subscription) {
        this.set.add(s);
    }

    activate() {
        const subscriptions = new Array(...this.set);
        this.set.clear();
        for (const subscription of subscriptions) {
            subscription();
        }
    }
}