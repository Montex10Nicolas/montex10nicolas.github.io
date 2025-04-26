import { mdsvex } from "mdsvex";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: [vitePreprocess(), mdsvex()],
  kit: {
    adapter: adapter(),
    paths: {
      base: process.env.NODE_ENV === "production" ? "/montex10nicolas.github.io" : "",
    },
  },
  extensions: [".svelte", ".svx"],
};

export default config;
