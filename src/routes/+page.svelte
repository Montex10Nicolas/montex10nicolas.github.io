<script lang="ts">
  import { browser } from "$app/environment";
  import { innerHeight, innerWidth } from "svelte/reactivity/window";

  let numElements = $state(10);
  let topNumber = $state(100);

  let windowHeight: number | undefined = $state(0);
  let windowWidth: number | undefined = $state(0);

  let svgElement: SVGSVGElement | undefined = $state();
  let svgHeight = $state(0);
  let biggest = $state(0);

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
  let duration = $state(100);

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
    let count = 0;
    const timeDuration = Math.floor(duration / 3) * 2;
    const rest = (duration - timeDuration) / 2;

    for (let i = 0; i < dati.length - 1; i++) {
      for (let j = i + 1; j < dati.length; j++) {
        const copyI = i,
          copyJ = j;
        const cPlus = ++count;

        const a = setTimeout(() => {
          checking = [copyI, copyJ];
          if (dati[i] > dati[j]) {
            const b = setTimeout(() => {
              checking = [copyI, copyJ];
              swapping = true;
              const c = setTimeout(() => {
                const temp = dati[copyI];
                dati[copyI] = dati[copyJ];
                dati[copyJ] = temp;
                swapping = false;

                const d = setTimeout(() => {
                  checking = [-1, -1];
                }, rest * 0.5);
                timeOuts.push(d);
              }, rest);
              timeOuts.push(c);
            }, rest * 2);
            timeOuts.push(b);
          }
        }, timeDuration * cPlus);
        timeOuts.push(a);
      }
    }
  }
</script>

{#if browser}
  <div class="flex w-screen grow items-center justify-around gap-8 px-4 py-2">
    <button
      disabled={duration < 10}
      class="w-full cursor-pointer rounded-sm border px-4 py-1 font-bold uppercase disabled:cursor-default"
      onclick={bubbleSort}
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
{/if}
