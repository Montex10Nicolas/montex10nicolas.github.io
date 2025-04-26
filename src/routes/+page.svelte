<script lang="ts">
  let numElements = $state(10);

  const randomArray = () => [...new Array(numElements)].map(() => Math.round(Math.random() * 100));
  const intialState = randomArray();
  $effect(() => {
    dati = randomArray();
  });
  let dati = $state(intialState);
  let checking: [number, number] = $state([-1, -1]);
  let swapping = $state(false);
  let timeOuts = $state<NodeJS.Timeout[]>([]);

  // Duration in milliseconds
  let duration = $state(100);

  function reset() {
    for (let o of timeOuts) {
      clearTimeout(o);
    }
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

                setTimeout(() => {
                  checking = [-1, -1];
                }, rest * 0.5);
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

<!---->
<!-- <pre class="flex gap-4"> -->
<!-- <code> -->
<!--   {JSON.stringify(checking, null, 2)} -->
<!-- </code> -->
<!-- <code> -->
<!--   {JSON.stringify(swapping, null, 2)} -->
<!-- </code> -->
<!-- </pre> -->
<!---->
<div class="m-2 flex gap-8">
  <button
    disabled={duration < 10}
    class="cursor-pointer rounded-sm border px-4 py-1 disabled:cursor-default"
    onclick={bubbleSort}
  >
    Sort
  </button>
  <label>
    <p>Number of elements</p>
    <input
      type="range"
      min="5"
      max="100"
      step="5"
      class="cursor-pointer"
      bind:value={numElements}
      onchange={reset}
    />
    {numElements}
  </label>
  <label>
    <p>Duration</p>
    <input bind:value={duration} type="number" min="10" step="5" max="3000" />
  </label>
</div>
<svg class="m-2" viewBox="0 0 1000 100">
  {#each dati as rettangolo, index}
    {@const width = 800 / numElements}
    <rect
      width="{width}px"
      y="{100 - rettangolo}px"
      x="{width * index + 0.1}px"
      height={`${rettangolo}px`}
      stroke="gold"
      stroke-width="0.8px"
      fill={checking.includes(index) ? (swapping ? "blue" : "green") : "black"}
    />
    <!-- <text y="100px" fill="white" class="text-3xl italic">{swapping}</text> -->
    <!-- <text x="150px" y="100px" fill="white" class="text-3xl italic">{JSON.stringify(checking)}</text> -->
  {/each}
</svg>
