import { defineConfig, envField, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

import node from "@astrojs/node";
import { defaultHandlers } from "mdast-util-to-hast";
import { normalizeUri } from "micromark-util-sanitize-uri";

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      STEAM_API_KEY: envField.string({
        context: 'server', access: 'secret', default: '',
      }),
      STEAM_ID: envField.string({
        context: 'server', access: 'public', default: ''
      }),
      SPOTIFY_USER_ID: envField.string({
        context: 'server', access: 'public', default: ''
      }),
      SPOTIFY_CLIENT_ID: envField.string({
        context: 'server', access: 'pubilc', default: ''
      }),
      SPOTIFY_CLIENT_SECRET: envField.string({
        context: 'server', access: 'secret', default: ''
      }),
      SPOTIFY_REFRESH_TOKEN: envField.string({
        context: 'server', access: 'secret', default: ''
      }),
    }
  },
  integrations: [mdx({
    remarkRehype: {
      handlers: {
        /* @mangopdf I'm stealing your inline footnotes, but without the javascript */
        footnoteReference: (state, node) => {
          const clobberPrefix =
            typeof state.options.clobberPrefix === 'string'
              ? state.options.clobberPrefix
              : 'user-content-'
          const id = String(node.identifier).toUpperCase()
          const safeId = normalizeUri(id.toLowerCase())
          const index = state.footnoteOrder.indexOf(id)
          if (state.footnoteReferencesById === undefined) {
            state.footnoteReferencesById = {}
          }
          state.footnoteReferencesById[id] = state.footnoteReferencesById[id] ?? [];
          /** @type {number} */
          let counter

          let reuseCounter = state.footnoteCounts.get(id)

          if (reuseCounter === undefined) {
            reuseCounter = 0
            state.footnoteOrder.push(id)
            counter = state.footnoteOrder.length
          } else {
            counter = index + 1
          }

          reuseCounter += 1
          state.footnoteCounts.set(id, reuseCounter)

          /** @type {Element} */
          const link = {
            type: 'element',
            tagName: 'a',
            properties: {
              href: '#' + clobberPrefix + 'fn-' + safeId,
              id:
                clobberPrefix +
                'fnref-' +
                safeId +
                (reuseCounter > 1 ? '-' + reuseCounter : ''),
              dataFootnoteRef: true,
              ariaDescribedBy: ['footnote-label']
            },
            children: [{ type: 'text', value: String(counter) }]
          }
          state.patch(node, link)

          /** @type {Element} */
          const sup = {
            type: 'element',
            tagName: 'sup',
            properties: {},
            children: [link]
          }
          state.patch(node, sup)

          /** @type Element */
          const inlineCheckbox = {
            type: 'element',
            tagName: 'input',
            properties: {
              type: 'checkbox',
              id: clobberPrefix + 'fnref-' + safeId + '-checkbox',
              checked: false,
              hidden: true
            }
          }
          state.patch(node, inlineCheckbox)

          /** @type {Element} */
          const inlineButton = {
            type: 'element',
            tagName: 'label',
            properties: {
              for: clobberPrefix + 'fnref-' + safeId + '-checkbox',
              id: clobberPrefix + 'fnref-' + safeId + '-button',
              'aria-label': 'Toggle footnote'
            },
            children: [{
              type: 'element',
              tagName: 'button',
              properties: {
                type: 'button'
              },
              children: [{ type: 'text', value: '​' }]
            }]
          }
          state.patch(node, inlineButton)

          /** @type {Element} */
          const inlineStyle = {
            type: 'element',
            tagName: 'style',
            properties: {},
            children: [{
              type: 'text', value: `
              #${clobberPrefix}fnref-${safeId}-checkbox ~ #${clobberPrefix}fnref-${safeId}-preview {
                display: none;
                font-style: italic;
                opacity: 80%;
              }
              #${clobberPrefix}fnref-${safeId}-checkbox:checked ~ #${clobberPrefix}fnref-${safeId}-preview {
                display: block;
              }
              #${clobberPrefix}fnref-${safeId}-button button {
                pointer-events: none;
              }
            `}]
          }
          state.patch(node, inlineStyle);

          const inlinePreviewChildren = [
            { type: 'text', value: 'Footnote ' },
            { type: 'text', value: String(counter) },
            { type: 'text', value: ': ' },
            // {type: 'text', value: state.definitionById[id]}
          ]

          /** @type {Element} */
          const inlinePreview = {
            type: 'element',
            tagName: 'span',
            properties: {
              id: clobberPrefix + 'fnref-' + safeId + '-preview',
            },
            children: inlinePreviewChildren
          }
          state.patch(node, inlinePreview)

          if (state.definitionById[id] !== undefined) {
            inlinePreviewChildren.push({
              type: 'text',
              value: state.definitionById[id]
            })
          } else {
            state.footnoteReferencesById[id].push(inlinePreview)
          }

          /** @type {Element} */
          const container = {
            type: 'element',
            tagName: 'span',
            properties: {
              id: clobberPrefix + 'fnref-' + safeId + '-container'
            },
            children: [inlineCheckbox, inlineButton, inlineStyle, inlinePreview, sup]
          }
          state.patch(node, container)
          return state.applyData(node, container)
        },
        footnoteDefinition: (state, node) => {
          const id = String(node.identifier).toUpperCase();
          const footnoteReferences = state.footnoteReferencesById?.[id] ?? [];
          const mapChild = ({ type, value, children }) => {
            if (type === 'emphasis') {
              return {
                type: 'element',
                tagName: 'em',
                children: children?.map(mapChild)
              }
            } else if (type === 'strong') {
              return {
                type: 'element',
                tagName: 'strong',
                children: children?.map(mapChild)
              }
            }
            return {
              type,
              value,
              children: children?.map(mapChild)
            }
          }
          for (const reference of footnoteReferences) {
            reference.children.push(...node.children[0].children.map(mapChild));
          }
          return defaultHandlers.footnoteDefinition();
        }
      }
    }
  }), icon()],
  image: {
    service: passthroughImageService()
  },
  output: "static",
  adapter: node({
    mode: "standalone"
  }),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
