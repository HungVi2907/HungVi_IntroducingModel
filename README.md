# Transformer — A five-part visual introduction

A buildless English / Vietnamese frontend about the original Transformer in *Attention Is All You Need* (2017). The page follows five sections: motivation, Encoder–Decoder architecture, working principle, advantages and limitations, and applications.

English is the first-visit default, independent of the browser language. The header language switch updates the content, captions, image viewer, interactive diagrams and accessibility labels without reloading. The choice is saved under `transformer-language` in browser localStorage. If storage is unavailable, switching still works for the current visit. Switching preserves selected tokens, heads, sequence length, mask settings, expanded details and image zoom.

The architecture figure has three selectable views: an Encoder, the Encoder–Decoder pair, and the full residual/normalization connections. The original six-layer stack is available in an expandable panel. The working-principle section includes the supplied decoding GIF with a static preview, explicit play/stop controls, image enlargement and three short reading cues. The GIF loads only after Play is selected; changing language preserves playback. Simplified diagrams are clearly labeled where masking, residual paths, normalization or repeated layers are omitted.

## Run locally

Requires Node.js. No dependencies are needed to serve the page.

```sh
npm run dev
```

Open http://127.0.0.1:5173. Set `PORT` to use another port.

## Verification

```sh
npm install
npm test
```

Tests cover the five-section structure, architecture view selection and keyboard controls, GIF play/stop and failure recovery, attention calculations and normalization, connection geometry, causal masking, quadratic attention cost, reduced motion, image zoom, language defaults, saved preferences, translation coverage and state preservation.

## Main files

- `dist/index.html`: English default HTML with translation bindings.
- `dist/i18n.js`: English and Vietnamese content, translation bindings and language preference.
- `dist/styles.css`: responsive layout, language selector and the existing `--text-scale: 1.15` setting.
- `dist/app.js`: RNN comparison, Self-Attention, mask and sequence-length interactions.
- `dist/attention.js`: Q/K/V projections, Softmax and weighted sums.
- `dist/image-viewer.js`: architecture image enlargement and zoom.
- `dist/visual-assets.js`: architecture view selection and decoding animation controls.
- `dist/assets/jay-alammar/`: four architecture diagrams, the decoding GIF, a static preview and attribution metadata.
- `server.mjs`: local preview server.

When editing translated content, update both catalogs in `dist/i18n.js` and the corresponding default English markup in `dist/index.html`. Keep translated elements separate from inputs, selects and other stateful DOM nodes.

## Scope and sources

The Attention demo uses eight word tokens, four-dimensional inputs and `d_k = 3`. Its deterministic illustrative data is internally consistent, but does not come from a trained model. The original base-model dimensions are stated in the expandable calculation details.

The Transformer Explainer link illustrates decoder-only GPT-2 rather than the full Encoder–Decoder architecture. No external models are embedded or downloaded.

- Original paper: https://arxiv.org/abs/1706.03762
- Architecture images: https://jalammar.github.io/illustrated-transformer/
- GPT-2 visualization: https://poloclub.github.io/transformer-explainer/

The original visual assets belong to Jay Alammar and retain their attribution under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The decoding GIF is copied unchanged from the user-provided local file. Translated captions are provided outside the images.
