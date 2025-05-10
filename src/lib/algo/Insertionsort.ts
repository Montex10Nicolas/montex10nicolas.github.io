import { queue } from "./QueueVisualizer.svelte";

export async function insertionSort(arr: number[], dimension = arr.length - 1) {
  if (dimension <= 0) {
    return;
  }

  insertionSort(arr, dimension - 1);
  const x = arr[dimension];
  let j = dimension - 1;

  queue.push({
    operation: "CHECKING",
    index_a: j,
    index_b: dimension,
    value_a: arr[j],
    value_b: x,
  });

  while (j >= 0 && arr[j] > x) {
    queue.push({
      operation: "CHECKING",
      index_a: j,
      index_b: dimension,
      value_a: arr[j],
      value_b: x,
    });
    queue.push({
      operation: "SUBSTITUTION",
      index_a: j + 1,
      index_b: j + 1,
      value_a: arr[j],
      value_b: arr[j],
    });
    arr[j + 1] = arr[j];
    j = j - 1;
  }
  queue.push({
    operation: "SUBSTITUTION",
    index_a: j + 1,
    index_b: j + 1,
    value_a: x,
    value_b: x,
  });
  arr[j + 1] = x;
}
