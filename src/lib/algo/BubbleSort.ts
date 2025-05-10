import { queue } from "$lib/algo/QueueVisualizer.svelte";

export async function bubbleSort(dati: number[]) {
  const arr = [...dati];

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      const copyI = i,
        copyJ = j;

      queue.push({
        operation: "CHECKING",
        index_a: copyI,
        index_b: copyJ,
        value_a: arr[i],
        value_b: arr[j],
      });

      if (arr[i] > arr[j]) {
        const temp = arr[copyI];
        arr[copyI] = arr[copyJ];
        arr[copyJ] = temp;
        queue.push({
          operation: "SWAPPING",
          index_a: copyI,
          index_b: copyJ,
          value_a: arr[i],
          value_b: arr[j],
        });
      }
    }
  }
}
