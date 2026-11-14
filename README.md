# Transformer — A five-part visual introduction

A buildless English / Vietnamese frontend about the original Transformer in *Attention Is All You Need* (2017). The page follows five sections: motivation, Encoder–Decoder architecture, working principle, advantages and limitations, and applications.

English is the first-visit default, independent of the browser language. The header language switch updates the content, captions, image viewer, interactive diagrams and accessibility labels without reloading. The choice is saved under `transformer-language` in browser localStorage. If storage is unavailable, switching still works for the current visit. Switching preserves selected tokens, heads, sequence length, mask settings, expanded details and image zoom.

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

Tests cover the five-section structure, attention calculations and normalization, connection geometry, causal masking, quadratic attention cost, reduced motion, image zoom, language defaults, saved preferences, translation coverage and state preservation.

## Main files

- `dist/index.html`: English default HTML with translation bindings.
- `dist/i18n.js`: English and Vietnamese content, translation bindings and language preference.
- `dist/styles.css`: responsive layout, language selector and the existing `--text-scale: 1.15` setting.
- `dist/app.js`: RNN comparison, Self-Attention, mask and sequence-length interactions.
- `dist/attention.js`: Q/K/V projections, Softmax and weighted sums.
- `dist/image-viewer.js`: architecture image enlargement and zoom.
- `dist/assets/jay-alammar/`: two source images and attribution metadata.
- `server.mjs`: local preview server.

When editing translated content, update both catalogs in `dist/i18n.js` and the corresponding default English markup in `dist/index.html`. Keep translated elements separate from inputs, selects and other stateful DOM nodes.

## Scope and sources

The Attention demo uses eight word tokens, four-dimensional inputs and `d_k = 3`. Its deterministic illustrative data is internally consistent, but does not come from a trained model. The original base-model dimensions are stated in the expandable calculation details.

The Transformer Explainer link illustrates decoder-only GPT-2 rather than the full Encoder–Decoder architecture. No external models are embedded or downloaded.

- Original paper: https://arxiv.org/abs/1706.03762
- Architecture images: https://jalammar.github.io/illustrated-transformer/
- GPT-2 visualization: https://poloclub.github.io/transformer-explainer/

The two original images belong to Jay Alammar and retain their attribution under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Translated captions are provided outside the images.
