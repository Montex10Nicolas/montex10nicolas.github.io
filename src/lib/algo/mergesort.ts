import { queue } from "$lib/algo/QueueVisualizer.svelte";

export async function mergeSort(arr: number[], low: number, high: number): Promise<number[]> {
  if (low >= high) {
    const el = arr[low];
    return el ? [el] : [];
  }

  const mid = Math.floor((low + high) / 2);
  const left = await mergeSort(arr, low, mid);
  const right = await mergeSort(arr, mid + 1, high);

  return await merge(left, right, low, high);
}

async function merge(left: number[], right: number[], low: number, hi: number): Promise<number[]> {
  const temp = [];
  let iL = 0,
    iR = 0;

  while (iL < left.length && iR < right.length) {
    queue.push({
      operation: "CHECKING",
      index_a: low + iL,
      index_b: hi - iR,
      value_a: left[iL],
      value_b: right[iR],
    });

    if (left[iL] > right[iR]) {
      queue.push({
        operation: "SUBSTITUTION",
        index_a: low + iL + iR,
        index_b: low + iL + iR,
        value_a: right[iR],
        value_b: right[iR],
      });
      temp.push(right[iR]);
      iR++;
    } else {
      queue.push({
        operation: "SUBSTITUTION",
        index_a: low + iR + iL,
        index_b: low + iR + iL,
        value_a: left[iL],
        value_b: left[iL],
      });

      temp.push(left[iL]);
      iL++;
    }
  }

  while (iL < left.length) {
    queue.push({
      operation: "SUBSTITUTION",
      index_a: low + iR + iL,
      index_b: low + iR + iL,
      value_a: left[iL],
      value_b: left[iL],
    });
    temp.push(left[iL]);
    iL++;
  }

  while (iR < right.length) {
    queue.push({
      operation: "SUBSTITUTION",
      index_a: low + iR + iL,
      index_b: low + iR + iL,
      value_a: right[iR],
      value_b: right[iR],
    });
    temp.push(right[iR]);
    iR++;
  }

  return temp;
}
