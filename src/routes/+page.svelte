<script lang="ts">
  import { queue } from "$lib/algo/QueueVisualizer.svelte";
  import type { Algorithms } from "$lib/types/Algos";
  import { mergeSort } from "$lib/algo/mergesort";
  import { bubbleSort } from "$lib/algo/BubbleSort";
  import { quickSort } from "$lib/algo/QuickSort";
  import { insertionSort } from "$lib/algo/Insertionsort";

  let numElements = $state(50);
  let topNumber = $state(500);
  let duration = $state(10); //ms

  let algorithm: Algorithms = $state("QUICK");

  let innerHeight: number = $state(0);
  let innerWidth: number = $state(0);

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

  $effect(() => {
    const arr = randomArray(numElements);
    original = arr;
    dati = arr;
  });

  let dati = $state<number[]>([1]);
  let checking: [number, number] = $state([-1, -1]);
  let swapping = $state(false);
  let original: number[] = $state([]);
  let sorting = $state(false);
  let audioCtx: AudioContext | undefined = $state();

  $effect(function () {
    audioCtx = new window.AudioContext();

    if (svgElement && innerHeight) {
      svgHeight = innerHeight - svgElement.getBoundingClientRect().y;
    }
  });

  function clearQueue() {
    for (let timeout of queueTimeouts) {
      clearTimeout(timeout);
    }
    queue.clear();
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
    const working = queue.visual();

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

            const perc = (n: number) => {
              return Math.floor((dati[n] / biggest) * 100);
            };

            playNote(perc(index_a), duration);
            playNote(perc(index_b), duration);

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
        clearQueue();
      },
      duration * i + 2,
    );
    queueTimeouts.push(finalReset);

    return () => {
      clearQueue();
    };
  }

  function playNote(percent: number, duration = 1000) {
    let min = 120,
      max = 1212; // Hertz values
    if (audioCtx === undefined) {
      return;
    }

    const frequency: number = (max / 100) * percent + min;
    if (isNaN(frequency)) {
      return;
    }

    let gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.01;

    let oscillator = audioCtx.createOscillator();

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency; // value in hertz
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();

    setTimeout(function () {
      oscillator.stop();
    }, duration);

    return () => {
      oscillator.stop();
    };
  }
</script>

<svelte:window bind:innerWidth={innerWidth} bind:innerHeight={innerHeight} />

<!-- Debugging -->
<!-- <pre class="flex justify-between px-4 pt-2"> -->
<!--   <code>{JSON.stringify(checking, null, 2)}</code> -->
<!--   <code>{JSON.stringify(swapping, null, 2)}</code> -->
<!-- </pre> -->
<!-- disabled={topNumber > 500 || topNumber <= 0 || sorting || duration < 10 || numElements > 2000} -->
<div class="flex w-screen items-center justify-around gap-8 px-4 py-2">
  <button
    class="w-full cursor-pointer rounded-sm border bg-amber-200 px-4 py-1 font-bold uppercase disabled:cursor-default disabled:bg-transparent"
    onclick={async function () {
      if (sorting) {
        sorting = false;
        queue.clear();
        clearQueue();
        checking = [-1, -1];
        swapping = false;
        return;
      }

      original = [...dati];
      sorting = true;
      switch (algorithm) {
        case "BUBBLE":
          await bubbleSort([...dati]);
          break;
        case "MERGE":
          await mergeSort([...dati], 0, dati.length);
          break;
        case "QUICK":
          await quickSort([...dati]);
          break;
        case "INSERTION":
          await insertionSort([...dati]);
          break;
      }
      await visualizeQuee();
    }}
  >
    {sorting ? "Stop" : "Sort"}
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
      sorting = false;
    }}
  >
    Unsort
  </button>
  <label class="min-w-64">
    <p class="flex items-center justify-between px-2">
      <span class="font-bold"> Number of elements: </span>
      <input
        type="number"
        class="number_none col-span-3 w-[30%] border-none text-end align-text-bottom"
        bind:value={numElements}
        onkeydown={(e) => console.log(e)}
      />
    </p>
    <input
      type="range"
      min="5"
      max="2000"
      step="5"
      class="w-full cursor-pointer bg-transparent"
      bind:value={
        () => numElements,
        (v) => {
          numElements = v;
          resetAll();
        }
      }
    />
  </label>
  <label class="flex w-full items-center">
    <p class="font-bold">Duration:</p>
    <input
      bind:value={
        () => duration,
        (v) => {
          duration = v;
        }
      }
      class="number_none max-w-[40%] border-none px-2 py-1 text-end"
      type="number"
      min="1"
      step="5"
      max="3000"
    />
  </label>
  <label class="flex w-full items-center">
    <p class="font-bold">Max:</p>
    <input
      bind:value={
        () => topNumber,
        (v) => {
          biggest = 0;
          topNumber = v;
        }
      }
      class="number_none max-w-[80%] border-none px-2 py-1 text-end"
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

<svg bind:this={svgElement} viewBox="0 0 {innerWidth} {svgHeight}">
  {#each dati as rettangolo, index}
    {@const width = innerWidth! / numElements}
    {@const height = (svgHeight / 100) * Math.floor((rettangolo / biggest) * 100)}
    <rect
      data-index={index}
      width="{width}px"
      y="{svgHeight - height}px"
      x={width * index + 0.1}
      height={`${height}px`}
      stroke="blue"
      stroke-width={numElements > 300 ? 0 : 0.2}
      fill={!checking.includes(index) ? "black" : swapping ? "blue" : "green"}
    />
  {/each}
</svg>

<!-- Debugging -->
<!---->
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
<!--   {#each queue.visual() as x, idx} -->
<!--       <p class="max-h-8 align-middle"> -->
<!--       {idx}: {JSON.stringify(x)}{idx !== queue.visual().length - 1 ? ", " : ""} -->
<!--     </p> -->
<!--     {/each} -->
<!-- </div> -->
<!-- </pre> -->
