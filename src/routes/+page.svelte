<script lang="ts">
  const randomArray = () => [...new Array(7)].map(() => Math.round(Math.random() * 100));
  const intialState = randomArray();
  let dati = $state(intialState);
  let checking: [number, number] = $state([-1, -1]);
  let swapping = $state(false);

  function bubbleSort() {
    let count = 0;
    for (let i = 0; i < dati.length - 1; i++) {
      for (let j = i + 1; j < dati.length; j++) {
        const copyI = i,
          copyJ = j;
        const cPlus = ++count;
        setTimeout(() => {
          checking = [copyI, copyJ];
          if (dati[i] > dati[j]) {
            setTimeout(() => {
              swapping = true;
              setTimeout(() => {
                const temp = dati[copyI];
                dati[copyI] = dati[copyJ];
                dati[copyJ] = temp;
                swapping = false;
              }, 300);
            }, 300);
          }
        }, 800 * cPlus);
      }
    }
  }
</script>

<button class="cursor-pointer rounded-sm border px-4 py-1" onclick={bubbleSort}> Sort </button>
<svg class="p-2" viewBox="0 0 1000 100">
  {#each dati as rettangolo, index}
    <rect
      width="20px"
      y="5"
      x={index * 25 + "px"}
      height={`${rettangolo}px`}
      fill={checking.includes(index) ? (swapping ? "blue" : "green") : "black"}
    />
    <text
      width="20px"
      x={index * 25 + "px"}
      y="100px"
      height="80px"
      fill="blue"
      class="text-sm italic">{rettangolo}</text
    >
  {/each}
</svg>
