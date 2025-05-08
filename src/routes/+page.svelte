<script lang="ts">
  import { browser } from "$app/environment";
  import { index } from "drizzle-orm/gel-core";
  import { innerHeight, innerWidth } from "svelte/reactivity/window";

  let numElements = $state(100);
  let topNumber = $state(1000);
  let duration = $state(10);

  let algorithm: "BUBBLE" | "MERGE" = $state("BUBBLE");

  let windowHeight: number | undefined = $state(0);
  let windowWidth: number | undefined = $state(0);

  let svgElement: SVGSVGElement | undefined = $state();
  let svgHeight = $state(0);
  let biggest = $state(0);

  let completed = $state(true);

  interface VisualQueue {
    operation: "CHECKING" | "SWAPPING";
    index_a: number;
    index_b: number;
    value_a: number;
    value_b: number;
  }

  let queue: VisualQueue[] = $state([]);

  const randomArray = () =>
    [...new Array(numElements)].map(() => {
      const num = Math.max(Math.round(Math.random() * 100000000) % topNumber, 1);
      if (biggest < num) {
        biggest = num;
      }
      return num;
    });

  const intialState = randomArray();
  let dati = $state(intialState);
  let checking: [number, number] = $state([-1, -1]);
  let swapping = $state(false);
  let timeOuts = $state<NodeJS.Timeout[]>([]);

  // Duration in milliseconds

  $effect(function () {
    if (browser) {
      windowHeight = innerHeight.current;
      windowWidth = innerWidth.current;

      if (svgElement && windowHeight) {
        svgHeight = windowHeight - svgElement.getBoundingClientRect().y;
      }
    }
  });

  $effect(() => {
    dati = randomArray();
  });

  function visualizeQuee() {
    const working = [...queue].reverse();

    let el = working.pop();
    let i = 0;

    while (el != undefined) {
      const el_copy = el;
      let copyI = i;
      setTimeout(
        () => {
          const { operation, index_b, index_a } = el_copy;
          switch (operation) {
            case "CHECKING":
              checking = [index_a, index_b];
              // setTimeout(() => {
              //   checking = [-1, -1];
              // }, duration * 1.5);
              break;
            case "SWAPPING":
              swapping = true;
              checking = [index_a, index_b];

              setTimeout(() => {
                const temp = dati[index_a];
                dati[index_a] = dati[index_b];
                dati[index_b] = temp;

                setTimeout(() => {
                  swapping = false;
                }, duration * 0.5);
              }, duration * 0.2);
              break;
          }
        },
        duration * (copyI + 1),
      );
      el = working.pop();
      i++;
    }

    setTimeout(
      () => {
        checking = [-1, -1];
      },
      duration * i + 2,
    );
    queue = [];
  }

  function reset() {
    for (let o of timeOuts) {
      clearTimeout(o);
    }
    timeOuts = [];
    checking = [-1, -1];
    swapping = false;
  }

  function bubbleSort() {
    reset();
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
    console.log(arr);
  }

  async function mergeSort(arr: number[], low: number, high: number): Promise<number[]> {
    if (low >= high) {
      let a = arr[low];
      let b = arr[high];
      if (a !== undefined) return [a];
      if (b !== undefined) return [b];
    }

    let mid = Math.floor((low + high) / 2);
    const left = await mergeSort(arr, low, mid);
    const right = await mergeSort(arr, mid + 1, high - 1);

    const t = await merge(left, right, low, high);
    return t;
  }

  async function merge(
    left_p: number[],
    right_p: number[],
    low_p: number,
    hi_p: number,
  ): Promise<number[]> {
    let iL = 0,
      iR = 0;
    let temp: number[] = [];
    let left = left_p;
    let right = right_p;
    let low = low_p;
    let hi = hi_p;

    console.log(`L: ${low_p} | R: ${hi_p}`);

    while (iL < left.length && iR < right.length) {
      queue.push({
        operation: "CHECKING",
        index_a: low + iL,
        index_b: hi - iR,
        value_a: left[iL],
        value_b: right[iR],
      });

      if (left[iL] <= right[iR]) {
        temp.push(left[iL]);
        iL++;
      } else {
        temp.push(right[iR]);
        iR++;
      }

      queue.push({
        operation: "SWAPPING",
        index_a: low + iL,
        index_b: hi - iR,
        value_a: left[iL],
        value_b: right[iR],
      });
    }
    while (iL < left.length) {
      temp.push(left[iL]);
      iL++;
    }
    while (iR < right.length) {
      temp.push(right[iR]);
      iR++;
    }
    return temp;
  }
</script>

{#if browser}
  <pre class="flex justify-between px-4 pt-2">
    <code>{JSON.stringify(checking, null, 2)}</code>
    <code>{JSON.stringify(swapping, null, 2)}</code>
  </pre>
  <div class="flex w-screen grow items-center justify-around gap-8 px-4 py-2">
    <button
      disabled={duration < 10}
      class="w-full cursor-pointer rounded-sm border px-4 py-1 font-bold uppercase disabled:cursor-default"
      onclick={async function () {
        switch (algorithm) {
          case "BUBBLE":
            bubbleSort();
            visualizeQuee();
            break;
          case "MERGE":
            await mergeSort([...dati], 0, dati.length);
            visualizeQuee();
            break;
        }
      }}
    >
      Sort
    </button>
    <label class="w-full">
      <p>
        Number of elements:
        <bold class="font-bold">{numElements}</bold>
      </p>
      <input
        type="range"
        min="5"
        max="100"
        step="5"
        class="w-full cursor-pointer"
        bind:value={numElements}
        onchange={reset}
      />
    </label>
    <label class="w-full">
      <p>Duration</p>
      <input bind:value={duration} class="w-full" type="number" min="10" step="5" max="3000" />
    </label>
    <label class="w-full">
      <p>Max</p>
      <input
        bind:value={
          () => topNumber,
          (v) => {
            biggest = 0;
            topNumber = v;
          }
        }
        class="w-full"
        type="number"
        min="10"
        step="5"
        max="3000"
      />
    </label>
    <select bind:value={algorithm}>
      <option value="BUBBLE"> Bubblesort </option>
      <option value="MERGE"> Mergesort </option>
    </select>
  </div>
  <svg bind:this={svgElement} class="m-2" viewBox="0 0 {windowWidth} {svgHeight}">
    {#each dati as rettangolo, index}
      {@const width = windowWidth! / numElements}
      {@const height = (svgHeight / 100) * Math.floor((rettangolo / biggest) * 100)}
      <rect
        width="{width}px"
        y="{svgHeight - height}px"
        x="{width * index + 0.1}px"
        height={`${height}px`}
        stroke="gold"
        stroke-width="0.8px"
        fill={!checking.includes(index) ? "black" : swapping ? "blue" : "green"}
      />
    {/each}
  </svg>

  <pre class="flex flex-col">
    <div class="flex min-w-8 justify-between">
      <p>[</p>
      {#each dati as _, idx}
        <p>{idx}{idx !== dati.length - 1 ? ", " : ""}</p>
      {/each}
      <p>]</p>
    </div>
    <div class="flex min-w-8 justify-between">
      <p>[</p>
      {#each dati as x, idx}
        <p>{x}{idx !== dati.length - 1 ? ", " : ""}</p>
      {/each}
      <p>]</p>
    </div>
    <div class="flex min-w-8 flex-wrap justify-between">
      <p>[</p>
      {#each queue as x, idx}
        <p>{idx}: {JSON.stringify(x)}{idx !== dati.length - 1 ? ", " : ""}</p>
      {/each}
      <p>]</p>
    </div>
  </pre>
{/if}
