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
  let duration = $state(300);

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
    for (let i = 0; i < dati.length - 1; i++) {
      for (let j = i + 1; j < dati.length; j++) {
        const copyI = i,
          copyJ = j;
        const cPlus = ++count;
        const a = setTimeout(() => {
          checking = [copyI, copyJ];
          if (dati[i] > dati[j]) {
            const b = setTimeout(() => {
              swapping = true;
              const c = setTimeout(() => {
                const temp = dati[copyI];
                dati[copyI] = dati[copyJ];
                dati[copyJ] = temp;
                swapping = false;
                checking = [-1, -1];
              }, 300);
              timeOuts.push(c);
            }, 300);
            timeOuts.push(b);
          }
        }, 800 * cPlus);
        timeOuts.push(a);
      }
    }
  }
</script>

<!-- <pre> -->
<!-- <code> -->
<!--   {JSON.stringify(checking, null, 2)} -->
<!-- </code> -->
<!-- </pre> -->

<div class="m-2 flex gap-8">
  <button class="cursor-pointer rounded-sm border px-4 py-1" onclick={bubbleSort}> Sort </button>
  <label>
    <p>Number of elements</p>
    <input
      type="range"
      min="5"
      max="100"
      class="cursor-pointer"
      bind:value={numElements}
      onchange={reset}
    />
    {numElements}
  </label>
  <label>
    <p>Duration</p>
    <input type="text" />
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
      fill={checking.includes(index) ? (swapping ? "blue" : "green") : "black"}
      stroke="white"
    />
    <!-- <text width="20px" y="100px" height="80px" fill="blue" class="text-sm italic">{width}</text> -->
  {/each}
</svg>
