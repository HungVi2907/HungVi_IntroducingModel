import {mkdir,writeFile} from 'node:fs/promises';
import {Resvg} from '@resvg/resvg-js';
import {embeddingIllustration,multiHeadIllustration,architectureIllustration} from '../dist/illustrations.js';
const dir=new URL('../dist/assets/',import.meta.url);
await mkdir(dir,{recursive:true});
const figures=[
  ['token-vectors',embeddingIllustration()],
  ['token-vectors-mobile',embeddingIllustration(true)],
  ['multi-head-overview',multiHeadIllustration(0)],
  ['multi-head-mobile',multiHeadIllustration(0,true)],
  ['encoder-decoder',architectureIllustration()],
  ['encoder-decoder-mobile',architectureIllustration(true)]
];
for(const [name,svg] of figures){
  await writeFile(new URL(name+'.svg',dir),svg);
  const renderer=new Resvg(svg,{font:{loadSystemFonts:true,defaultFontFamily:'Segoe UI'},fitTo:{mode:'width',value:name.includes('mobile')?650:1440}});
  await writeFile(new URL(name+'.png',dir),renderer.render().asPng());
  console.log('Exported '+name+' as SVG and PNG');
}
