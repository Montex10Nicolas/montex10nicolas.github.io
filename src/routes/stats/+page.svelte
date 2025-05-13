<script lang="ts">
  import type { Algorithms } from "$lib/types/Algos";
  import { onMount } from "svelte";

  // Check if there is no store
  // OR no records

  type AlgoStored = {
    algoType: Algorithms;
    original: number[];
    time: string;
    id: number;
  };

  let algos = $state<AlgoStored[]>([]);

  onMount(() => {
    let openDB = indexedDB.open("store", 1);
    openDB.onupgradeneeded = () => {
      console.log("update is needed");
    };
    openDB.onerror = () => {
      console.error("Error", openDB.error);
    };
    openDB.onsuccess = () => {
      let db = openDB.result;
      console.log("Success", db);

      let transaction = db.transaction("sorting", "readonly");
      let sortsStore = transaction.objectStore("sorting");

      const operation = sortsStore.getAll();
      operation.onerror = () => {
        console.error("No data");
      };

      operation.onsuccess = () => {
        console.log("Suc", operation.result);
        algos = operation.result;
      };
    };
  });
</script>

<nav>
  <a href="/">Home</a>
</nav>

<table class="flex h-screen w-screen flex-col gap-8 bg-gray-800 text-white">
  <thead>
    <tr class="grid grid-cols-6 border-b border-amber-400 px-8 py-2 font-black">
      <td> Algorithm </td>
      <td> Duration </td>
      <td> Data </td>
    </tr>
  </thead>

  <tbody class="flex flex-col gap-8 border-t border-white">
    {#each algos as algo}
      {@const len = algo.original.length}
      {@const arr = algo.original.slice(0, len > 20 ? 20 : len)}
      <tr class="grid grid-cols-6 items-center border-b border-white px-8 pb-2">
        <td>{algo.algoType}</td>
        <td>{algo.time}</td>
        <td class="col-span-4 flex flex-col justify-center"
          ><span>
            Len: {len}
          </span>
          [
          {#each arr as data, index}
            {data} {index != arr.length - 1 ? "," : ""}
          {/each}
          ]
          <button class="cursor-pointer border px-2 py-1" onclick={() => {}}>Copy</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
