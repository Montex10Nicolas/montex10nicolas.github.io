import { queue } from "./QueueVisualizer.svelte";

export async function quickSort(arr: number[], low = 0, hi = arr.length - 1) {
  if (low >= hi || low < 0) {
    return;
  }

  let p = await partition(arr, low, hi);
  await quickSort(arr, low, p - 1);
  await quickSort(arr, p + 1, hi);
}

async function partition(arr: number[], low: number, hi: number) {
  const pivot = arr[hi];
  let i = low;

  queue.push({
    operation: "CHECKING",
    index_a: hi,
    index_b: -1,
    value_a: pivot,
    value_b: -1,
  });

  for (let j = low; j <= hi - 1; j++) {
    queue.push({
      operation: "CHECKING",
      index_a: hi,
      index_b: j,
      value_a: pivot,
      value_b: arr[j],
    });

    if (arr[j] <= pivot) {
      if (j !== i) {
        queue.push({
          operation: "SWAPPING",
          index_a: i,
          index_b: j,
          value_a: arr[i],
          value_b: arr[j],
        });
        const temp = arr[j];
        arr[j] = arr[i];
        arr[i] = temp;
      }
      i++;
    }
  }

  if (hi === i) return i;
  const temp = arr[hi];
  arr[hi] = arr[i];
  arr[i] = temp;

  queue.push({
    operation: "SWAPPING",
    index_a: hi,
    index_b: i,
    value_a: pivot,
    value_b: arr[i],
  });

  return i;
}
