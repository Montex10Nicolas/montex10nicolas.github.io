import type { VisualQueue } from "$lib/types/Algos";

export class VisualizationQueue {
  public queue: VisualQueue[] = $state([]);

  constructor() {
    this.queue = [];
  }

  public addElement = (el: VisualQueue) => {
    this.queue.push(el);
  };

  public clear = () => {
    this.queue = [];
  };
}

export let WorkingClass = new VisualizationQueue();
export let WorkingQueue = WorkingClass.queue;
