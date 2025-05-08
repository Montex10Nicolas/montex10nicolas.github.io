<script lang="ts">
  import { browser } from "$app/environment";
  import { innerHeight, innerWidth } from "svelte/reactivity/window";

  let numElements = $state(100);
  let topNumber = $state(500);
  let duration = $state(10);

  let algorithm: "BUBBLE" | "MERGE" | "QUICK" = $state("QUICK");

  let windowHeight: number | undefined = $state(0);
  let windowWidth: number | undefined = $state(0);

  let svgElement: SVGSVGElement | undefined = $state();
  let svgHeight = $state(0);
  let biggest = $state(0);
  let steps = $state(0);

  interface VisualQueue {
    operation: "CHECKING" | "SWAPPING" | "SUBSTITUTION";
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

  let original: number[] = $state([]);

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
    steps = 0;
    const working = [...queue].reverse();

    let el = working.pop();
    let i = 0;

    while (el != undefined) {
      const el_copy = el;
      let copyI = i;
      setTimeout(
        () => {
          steps++;
          const { operation, index_b, index_a, value_a } = el_copy;
          switch (operation) {
            case "CHECKING":
              checking = [index_a, index_b];
              break;
            case "SWAPPING":
              swapping = true;
              checking = [index_a, index_b];

              setTimeout(() => {
                steps++;
                const temp = dati[index_a];
                dati[index_a] = dati[index_b];
                dati[index_b] = temp;

                setTimeout(() => {
                  swapping = false;
                }, duration * 0.5);
              }, duration * 0.2);
              break;
            case "SUBSTITUTION":
              setTimeout(() => {
                steps++;
                if (index_a === undefined) return;
                dati[index_a] = value_a;

                setTimeout(() => {}, duration * 0.5);
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

  async function mergeSort(arr: number[], low: number, high: number): Promise<number[]> {
    if (low >= high) {
      const el = arr[low];
      return el ? [el] : [];
    }

    const mid = Math.floor((low + high) / 2);
    const left = await mergeSort(arr, low, mid);
    const right = await mergeSort(arr, mid + 1, high);

    return await merge(left, right, low, high);
  }

  async function merge(
    left: number[],
    right: number[],
    low: number,
    hi: number,
  ): Promise<number[]> {
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
        i++;
      }
    }
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
</script>

{#if browser}
  <!-- Debugging -->
  <!-- <pre class="flex justify-between px-4 pt-2"> -->
  <!--   <code>{JSON.stringify(checking, null, 2)}</code> -->
  <!--   <code>{JSON.stringify(swapping, null, 2)}</code> -->
  <!-- </pre> -->
  <div class="flex w-screen grow items-center justify-around gap-8 px-4 py-2">
    <button
      disabled={duration < 10 || topNumber > 500 || topNumber <= 0}
      class="w-full cursor-pointer rounded-sm border px-4 py-1 font-bold uppercase disabled:cursor-default"
      onclick={async function () {
        switch (algorithm) {
          case "BUBBLE":
            await bubbleSort();
            visualizeQuee();
            break;
          case "MERGE":
            original = [...dati];
            await mergeSort([...dati], 0, dati.length);
            visualizeQuee();
            break;
          case "QUICK":
            await quickSort([...dati]);
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
        max="500"
      />
    </label>
    <select bind:value={algorithm} class="cursor-pointer [&_*]:text-yellow-600">
      <option value="BUBBLE"> Bubblesort </option>
      <option value="MERGE"> Mergesort </option>
      <option value="QUICK"> Quicksort </option>
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
  <!-- <pre class="flex flex-col"> -->
  <!--   <div class="flex min-w-8 justify-between"> -->
  <!--     <p>[</p> -->
  <!--     {#each dati as _, idx} -->
  <!--       <p>{idx}{idx !== dati.length - 1 ? ", " : ""}</p> -->
  <!--     {/each} -->
  <!--     <p>]</p> -->
  <!--   </div> -->
  <!--   <div class="flex min-w-8 justify-between"> -->
  <!--     <p>[</p> -->
  <!--     {#each dati as x, idx} -->
  <!--       <p>{x}{idx !== dati.length - 1 ? ", " : ""}</p> -->
  <!--     {/each} -->
  <!--     <p>]</p> -->
  <!--   </div> -->
  <!--   <div class="flex min-w-8 justify-between"> -->
  <!--     <p>[</p> -->
  <!--     {#each original as x, idx} -->
  <!--       <p>{x}{idx !== original.length - 1 ? ", " : ""}</p> -->
  <!--     {/each} -->
  <!--     <p>]</p> -->
  <!--   </div> -->
  <!-- <div class="flex flex-wrap align-middle"> -->
  <!--   {#each queue as x, idx} -->
  <!--       <p class="max-h-8 align-middle"> -->
  <!--       {idx}: {JSON.stringify(x)}{idx !== queue.length - 1 ? ", " : ""} -->
  <!--     </p> -->
  <!--     {/each} -->
  <!-- </div> -->
  <!---->
  <!-- </pre> -->
{/if}
