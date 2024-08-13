import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), icon()],
  image: {
    service: passthroughImageService()
  },
  output: "hybrid",
  adapter: node({
    mode: "standalone"
  })
});
