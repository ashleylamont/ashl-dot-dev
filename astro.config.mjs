import {defineConfig, passthroughImageService} from "astro/config";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  image: {
    service: passthroughImageService(),
  },
});
