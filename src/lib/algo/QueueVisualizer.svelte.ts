import type { VisualQueue } from "$lib/types/Algos";

export class SortingQueue {
  private queue: VisualQueue[] = [];

  constructor() {}

  public push = (el: VisualQueue) => {
    this.queue.push(el);
  };

  public clear = () => {
    this.queue = [];
  };

  public visual() {
    return this.queue.reverse();
  }
}

export const queue = new SortingQueue();
