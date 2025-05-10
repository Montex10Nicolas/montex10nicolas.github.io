<script lang="ts">
  import { browser } from "$app/environment";
  import { innerHeight, innerWidth } from "svelte/reactivity/window";
  import { WorkingQueue as queue } from "$lib/algo/QueueVisualizer.svelte";
  import type { Algorithms } from "$lib/types/Algos";
  import { mergeSort } from "$lib/algo/mergesort";

  let numElements = $state(100);
  let topNumber = $state(500);
  let duration = $state(10); //ms

  let algorithm: Algorithms = $state("MERGE");

  let windowHeight: number | undefined = $state(0);
  let windowWidth: number | undefined = $state(0);

  let svgElement: SVGSVGElement | undefined = $state();
  let svgHeight = $state(0);
  let biggest = $state(0);
  let steps = $state(0);

  let queueTimeouts: NodeJS.Timeout[] = $state([]);

  const randomArray = (numEl: number) =>
    [...new Array(numEl)].map(() => {
      const num = Math.max(Math.round(Math.random() * 199999999) % topNumber, 1);
      if (biggest < num) {
        biggest = num;
      }
      return num;
    });

  let dati = $state(randomArray(numElements));
  let checking: [number, number] = $state([-1, -1]);
  let swapping = $state(false);
  let original: number[] = $state([]);
  let sorting = $state(false);

  $effect(function () {
    if (browser) {
      windowHeight = innerHeight.current;
      windowWidth = innerWidth.current;

      if (svgElement && windowHeight) {
        svgHeight = windowHeight - svgElement.getBoundingClientRect().y;
      }
    }
  });

  function clearQueue() {
    for (let timeout of queueTimeouts) {
      clearTimeout(timeout);
    }
    queue;
  }

  function resetAll() {
    original = [];
    checking = [-1, -1];
    swapping = false;

    clearQueue();

    dati = randomArray(numElements);
    sorting = false;
    steps = 0;
  }

  async function visualizeQuee() {
    steps = 0;
    const working = [...queue].reverse();
    console.log("this is working");
    console.log(working);

    let el = working.pop();
    let i = 1;
    while (el != undefined) {
      const el_copy = el;
      let copyI = i;
      const firstClear = setTimeout(() => {
        steps++;
        const { operation, index_b, index_a, value_a } = el_copy;
        switch (operation) {
          case "CHECKING":
            checking = [index_a, index_b];
            break;
          case "SWAPPING":
            swapping = true;
            checking = [index_a, index_b];

            const swappingClear = setTimeout(() => {
              steps++;
              const temp = dati[index_a];
              dati[index_a] = dati[index_b];
              dati[index_b] = temp;

              const swappingReset = setTimeout(() => {
                swapping = false;
              }, duration * 0.5);
              queueTimeouts.push(swappingReset);
            }, duration * 0.2);
            queueTimeouts.push(swappingClear);
            break;
          case "SUBSTITUTION":
            const subsClear = setTimeout(() => {
              steps++;
              if (index_a === undefined) return;
              dati[index_a] = value_a;
            }, duration * 0.2);
            queueTimeouts.push(subsClear);
            break;
        }
      }, duration * copyI);
      queueTimeouts.push(firstClear);
      el = working.pop();
      i++;
    }

    const finalReset = setTimeout(
      () => {
        sorting = false;
        checking = [-1, -1];
      },
      duration * i + 2,
    );
    queueTimeouts.push(finalReset);
    clearQueue();
  }

  async function bubbleSort() {
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

  async function quickSort(arr: number[], low = 0, hi = arr.length - 1) {
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

  async function insertionSort(arr: number[], dimension = arr.length - 1) {
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
</script>

{#if browser}
  <!-- Debugging -->
  <!-- <pre class="flex justify-between px-4 pt-2"> -->
  <!--   <code>{JSON.stringify(checking, null, 2)}</code> -->
  <!--   <code>{JSON.stringify(swapping, null, 2)}</code> -->
  <!-- </pre> -->
  <div class="flex w-screen grow items-center justify-around gap-8 px-4 py-2">
    <button
      disabled={duration < 10 || topNumber > 500 || topNumber <= 0 || sorting}
      class="w-full cursor-pointer rounded-sm border bg-amber-200 px-4 py-1 font-bold uppercase disabled:cursor-default disabled:bg-transparent"
      onclick={async function () {
        original = [...dati];
        sorting = true;
        switch (algorithm) {
          case "BUBBLE":
            await bubbleSort();
            break;
          case "MERGE":
            await mergeSort([...dati], 0, dati.length);
            break;
          case "QUICK":
            await quickSort([...dati]);
            break;
          case "INSERTION":
            await insertionSort([...dati]);
        }
        await visualizeQuee();
      }}
    >
      Sort
    </button>
    <button
      class="w-full cursor-pointer rounded-sm border bg-red-300 px-4 py-1 text-sm font-bold uppercase disabled:cursor-default disabled:opacity-40"
      onclick={resetAll}
    >
      New Data
    </button>
    <button
      class="w-full cursor-pointer rounded-sm border bg-amber-300 px-4 py-1 text-sm font-bold uppercase disabled:cursor-default disabled:opacity-40"
      onclick={() => {
        clearQueue();
        dati = original;
        swapping = false;
        checking = [-1, -1];
      }}
    >
      Unsort
    </button>
    <label class="w-full">
      <p class="">Number of elements:</p>
      <input
        type="text"
        class="flex-grow-0 cursor-pointer appearance-none border-none font-bold"
        bind:value={numElements}
      />
      <input
        type="range"
        min="5"
        max="100"
        step="5"
        class="w-full cursor-pointer"
        bind:value={
          () => numElements,
          (v) => {
            numElements = v;
            resetAll();
          }
        }
      />
    </label>
    <label class="w-full">
      <p>Duration</p>
      <input
        bind:value={
          () => duration,
          (v) => {
            duration = v;
          }
        }
        class="w-full"
        type="number"
        min="10"
        step="5"
        max="3000"
      />
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
        max="500"
      />
    </label>
    <select bind:value={algorithm} class="cursor-pointer [&_*]:text-yellow-600">
      <option value="BUBBLE">Bubblesort </option>
      <option value="MERGE">Mergesort </option>
      <option value="QUICK">Quicksort </option>
      <option value="INSERTION">Insertionsort </option>
    </select>
    <p class="flex gap-2">Steps: <span class="max-w-fit font-bold tabular-nums">{steps}</span></p>
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

  <!-- Debugging -->

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
    <div class="flex min-w-8 justify-between">
      <p>[</p>
      {#each original as x, idx}
        <p>{x}{idx !== original.length - 1 ? ", " : ""}</p>
      {/each}
      <p>]</p>
    </div>
  <div class="flex flex-wrap align-middle">
    {#each queue as x, idx}
        <p class="max-h-8 align-middle">
        {idx}: {JSON.stringify(x)}{idx !== queue.length - 1 ? ", " : ""}
      </p>
      {/each}
  </div>
  </pre>
{/if}
