#!/usr/bin/env node
// Headless visual inventory: all course figures, every step, both themes and 3 widths.
// pnpm --filter eda-platform exec node scripts/audit-visuals.mjs --base http://localhost:4325 --out /tmp/eda-visual-audit
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const option=(key,fallback)=>{const i=process.argv.indexOf(`--${key}`);return i<0?fallback:process.argv[i+1]};
const base=option('base','http://localhost:4321');
const out=option('out','/tmp/eda-visual-audit');
fs.mkdirSync(out,{recursive:true});
const map=JSON.parse(fs.readFileSync('content/knowledge-map.json','utf8'));
const weeks=new Set(['week-04','week-05','week-06','week-09']);
const inventory=[];
for(const [id,topic] of Object.entries(map.topics)){
  if(!weeks.has(topic.week))continue;
  const dir=`content/structures/${id}`;
  const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const p=path.join(d,e.name);if(e.isDirectory()){walk(p);continue;}
    if(!/\.mdx?$/.test(p))continue;
    const content=fs.readFileSync(p,'utf8');
    if(!/visualization:|<Visualization\b/.test(content))continue;
    const name=path.relative(dir,p).replace(/\.mdx?$/,'');
    inventory.push({route:`/structures/${id}${name==='theory'?'':'/'+name}`,topic:id,week:topic.week});
  }};walk(dir);
}
inventory.push({route:'/repaso',topic:'repaso',week:'week-07'});
const browser=await chromium.launch({headless:true});
const filter=option('routes','').split(',').filter(Boolean);
const jobs=inventory.filter(item=>!filter.length||filter.includes(item.route)).flatMap(item=>[390,768,1440].flatMap(width=>['light','dark'].map(theme=>({...item,width,theme}))));
const results=[];let finished=0;
const start=Date.now();
async function worker(){
  const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  while(jobs.length){
    const job=jobs.shift();const errors=[];const onError=e=>errors.push(String(e));page.on('pageerror',onError);
    try{
      await page.setViewportSize({width:job.width,height:1000});await page.emulateMedia({colorScheme:job.theme});
      const response=await page.goto(base+job.route,{waitUntil:'load'});if(response.status()!==200)throw Error('HTTP '+response.status());
      await page.evaluate(async()=>{await document.fonts.ready;document.documentElement.style.scrollBehavior='auto';});
      const figures=page.locator('figure');const count=await figures.count();let frames=0;const issues=[];
      for(let f=0;f<count;f++){
        const figure=figures.nth(f);await figure.scrollIntoViewIfNeeded();
        await figure.locator('svg[role="img"]').waitFor();
        // CodeEditor hydration can move the figure after the first scroll.
        for(let attempt=0;attempt<40;attempt++){
          if(await figure.evaluate(el => !el.closest('astro-island')?.hasAttribute('ssr')))break;
          await figure.scrollIntoViewIfNeeded();await page.waitForTimeout(150);
        }
        if(await figure.evaluate(el => el.closest('astro-island')?.hasAttribute('ssr')))throw Error('Figure did not hydrate after repeated scrolling');
        await page.waitForTimeout(80);
        const next=figure.getByRole('button',{name:'Paso siguiente',exact:true});
        let step=0;
        while(true){
          const name=`${job.route.slice(1).replaceAll('/','_')}-${job.width}-${job.theme}-f${f+1}-s${++step}.png`;
          await figure.screenshot({path:path.join(out,name),animations:'disabled'});frames++;
          const bad=await figure.evaluate(fig=>{
            const svg=fig.querySelector('svg[role="img"]');const shown=t=>{let o=1;for(let n=t;n&&n.nodeType===1;n=n.parentElement){o*=parseFloat(getComputedStyle(n).opacity)||1;if(getComputedStyle(n).display==="none")return false}return o>0.05&&t.getClientRects().length>0};if(!svg)return ['missing-svg'];
            const inv=svg.getScreenCTM()?.inverse();if(!inv)return [];
            const view=svg.viewBox.baseVal;const warnings=[];
            for(const t of svg.querySelectorAll('text')){ if(!t.textContent?.trim()||!shown(t))continue;
              const b=t.getBoundingClientRect();const a=new DOMPoint(b.left,b.top).matrixTransform(inv),z=new DOMPoint(b.right,b.bottom).matrixTransform(inv);
              if(a.x < -2 || z.x > view.width+2 || a.y < -3 || z.y > view.height+3)warnings.push('clipped:'+t.textContent);
              if(parseFloat(getComputedStyle(t).fontSize)*(b.height/t.getBBox().height)<8)warnings.push('tiny:'+t.textContent);
            }
            const texts=[...svg.querySelectorAll('text')].filter(t=>t.textContent?.trim()&&shown(t)).map(t=>({t:t.textContent,b:t.getBoundingClientRect()}));
            for(let a=0;a<texts.length;a++)for(let b=a+1;b<texts.length;b++){
              const x=texts[a],y=texts[b],w=Math.min(x.b.right,y.b.right)-Math.max(x.b.left,y.b.left),h=Math.min(x.b.bottom,y.b.bottom)-Math.max(x.b.top,y.b.top);
              if(w>2&&h>3&&w*h>Math.min(x.b.width*x.b.height,y.b.width*y.b.height)*0.25)warnings.push('overlap:'+x.t+' / '+y.t);
            }
            return warnings;
          });
          if(bad.length)issues.push({figure:f+1,step,issues:bad});
          if(!(await next.count()) || await next.isDisabled())break;
          if(step>=80)throw Error('more than 80 steps');
          await next.click();await page.waitForTimeout(35);
        }
      }
      const overflow=await page.evaluate(async()=>{ window.scrollTo(10000,scrollY); await new Promise(requestAnimationFrame); const escaped=scrollX>2; window.scrollTo(0,scrollY); return escaped; });
      results.push({...job,figures:count,frames,overflow,issues,errors});
    }catch(e){results.push({...job,error:String(e),errors});}
    page.off('pageerror',onError);
    finished++;if(finished%30===0){fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(`${finished}/${finished+jobs.length} pages · ${Math.round((Date.now()-start)/1000)}s`);}
  }
  await context.close();
}
await Promise.all([worker(),worker(),worker()]);await browser.close();
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({pages:results.length,frames:results.reduce((n,r)=>n+(r.frames??0),0),errors:results.filter(r=>r.error||r.errors.length),overflow:results.filter(r=>r.overflow).map(r=>r.route),flagged:results.filter(r=>r.issues?.length).length,out},null,2));
