#!/usr/bin/env node
/**
 * overnight-prod-soak.mjs
 * Production environment soak test using Playwright
 *
 * Env vars:
 *   SOAK_BASE_URL=https://jueshi.net
 *   SOAK_ITERATIONS=32
 *   SOAK_INTERVAL_MS=900000
 *   SOAK_HEADLESS=true
 *   SOAK_ADMIN_EMAIL
 *   SOAK_ADMIN_PASSWORD
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const E = process.env;
const BASE_URL=E.SOAK_BASE_URL||'https://jueshi.net';
const ITERATIONS=parseInt(E.SOAK_ITERATIONS||'32',10);
const INTERVAL_MS=parseInt(E.SOAK_INTERVAL_MS||'900000',10);
const HEADLESS=E.SOAK_HEADLESS!=='false';
const ADMIN_EMAIL=E.SOAK_ADMIN_EMAIL||'';
const ADMIN_PASSWORD=E.SOAK_ADMIN_PASSWORD||'';

const TS=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
const RD=join('reports','overnight-soak',TS);
const SD=join(RD,'screenshots');
mkdirSync(RD,{recursive:true});
mkdirSync(SD,{recursive:true});

const STATIC_PAGES=[
  {path:'/',expectStatus:200,label:'首页'},
  {path:'/tools',expectStatus:200,label:'工具中心'},
  {path:'/tools/qrcode',expectStatus:200,label:'QR Code'},
  {path:'/tools/documents/quotation',expectStatus:200,label:'Quote Sheet'},
  {path:'/tools/quote',expectStatus:'redirect',label:'Quote redir',redirectTarget:'/tools/documents/quotation',followsRedirect:true},
  {path:'/tools/quote-sheet',expectStatus:'redirect',label:'QuoteSheet redir',redirectTarget:'/tools/documents/quotation',followsRedirect:true},
  {path:'/login',expectStatus:200,label:'登录'},
  {path:'/workspace',expectStatus:'redirect',label:'Workspace',redirectTarget:'/login',followsRedirect:true},
  {path:'/admin',expectStatus:'redirect',label:'Admin',redirectTarget:'/login',followsRedirect:true},
  {path:'/robots.txt',expectStatus:200,label:'robots'},
  {path:'/sitemap.xml',expectStatus:200,label:'sitemap'},
  {path:'/checklists/first-shipping-checklist',expectStatus:404,label:'draft1'},
  {path:'/checklists/toronto-rental-viewing-checklist',expectStatus:404,label:'draft2'},
  {path:'/checklists/student-first-abroad-packing-checklist',expectStatus:404,label:'draft3'},
];
const DRAFT_SLUGS=['first-shipping-checklist','toronto-rental-viewing-checklist','student-first-abroad-packing-checklist'];
const FORBIDDEN=['/admin','/workspace','/api'];

const allResults=[],allFailures=[],allConsoleErrors=[],pageTimings={},consoleErrorCounts={};
function log(m){console.log('['+new Date().toISOString()+'] '+m);}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

function writeSummary(){
  const ti=allResults.length,pi=allResults.filter(r=>r.pass).length,fi=ti-pi;
  const at=Object.entries(pageTimings).map(([p,t])=>({p,avg:t.reduce((a,b)=>a+b,0)/t.length,max:Math.max(...t)})).sort((a,b)=>b.avg-a.avg).slice(0,10);
  const tc=Object.entries(consoleErrorCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const lt=allResults[allResults.length-1]||{};
  const s={startTime:allResults[0]?.timestamp||new Date().toISOString(),lastUpdated:new Date().toISOString(),totalIterations:ti,plannedIterations:ITERATIONS,passedIterations:pi,failedIterations:fi,totalFailures:allFailures.length,topSlowestPages:at,topConsoleErrorIterations:tc,latestRedirectChecks:lt.redirects||[],latestSitemapChecks:lt.sitemapChecks||[],adminTest:lt.adminTest||null};
  writeFileSync(join(RD,'summary.json'),JSON.stringify(s,null,2));
  const md=`# Soak Test Progress\n\n**Started:** ${s.startTime} | **Last:** ${s.lastUpdated}\n**Progress:** ${ti}/${ITERATIONS} | **Pass:** ${pi} | **Fail:** ${fi}\n\n## Issues\n${allFailures.length===0?'None.':allFailures.slice(-20).map(f=>'- iter #'+f.iter+': \`'+f.path+'\` — '+((f.error&&f.error.slice(0,80))||('status='+f.status))).join('\n')}\n\n## Slowest\n${at.map(t=>'- \`'+t.p+'\`: avg '+Math.round(t.avg)+'ms, max '+t.max+'ms').join('\n')}\n\n## Redirects\n${(lt.redirects||[]).map(r=>'- \`'+r.path+'\`: status='+r.status).join('\n')||'N/A'}\n\n## Sitemap\n${(lt.sitemapChecks||[]).map(k=>'- pass='+k.pass+', drafts='+(k.draftsFound?.join(',')||'none')).join('\n')||'N/A'}\n\n## Admin\n${lt.adminTest?(lt.adminTest.skipped?'SKIPPED: '+lt.adminTest.reason:'OK: '+lt.adminTest.success):'N/A'}\n`;
  writeFileSync(join(RD,'summary.md'),md);
}

async function runIteration(n,browser){
  log('\n═══ Iteration '+n+'/'+ITERATIONS+' ═══');
  const t0=Date.now();
  const ir={iter:n,timestamp:new Date().toISOString(),pages:[],failures:[],consoleErrors:[],redirects:[],sitemapChecks:[],adminTest:null};
  const ctx=await browser.newContext();
  const page=await ctx.newPage();
  const errs=[];
  page.on('pageerror',e=>errs.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});

  for(const tp of STATIC_PAGES){
    const url=BASE_URL+tp.path;
    const t1=Date.now();
    let status=0,furl='',title='',canonical='',error=null;
    try{
      const res=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
      status=res?res.status():0;
      furl=page.url();
      title=await page.title();
      canonical=await page.evaluate(()=>{const l=document.querySelector('link[rel="canonical"]');return l?l.href:null;});
      let pass=false;
      if(tp.expectStatus==='redirect'){
        if(tp.followsRedirect){
          // Playwright follows redirects, so check final URL
          pass=furl.includes(tp.redirectTarget||'');
          if(!pass)error='Expected final URL to include '+tp.redirectTarget+', got '+furl;
        }else{
          pass=status>=301&&status<=308;
          if(tp.redirectTarget&&!furl.includes(tp.redirectTarget)){pass=false;error='Expected redirect to '+tp.redirectTarget;}
        }
      }
      else{pass=status===tp.expectStatus;}
      if(!pass){const ss=join(SD,'iter'+n+'-'+(tp.path.replace(/\//g,'_')||'root')+'-fail.png');try{await page.screenshot({path:ss,fullPage:false});}catch{}ir.failures.push({path:tp.path,status,expected:tp.expectStatus,error});}
      const timing=Date.now()-t1;
      if(!pageTimings[tp.path])pageTimings[tp.path]=[];
      pageTimings[tp.path].push(timing);
      ir.pages.push({path:tp.path,status,title:title.slice(0,60),canonical,timing,pass,furl:furl.slice(0,80)});
      ir.redirects.push({path:tp.path,status,furl:furl.slice(0,100),pass:tp.expectStatus==='redirect'?status>=301&&status<=308:true});
    }catch(e){
      error=e.message;
      const timing=Date.now()-t1;
      const ss=join(SD,'iter'+n+'-'+(tp.path.replace(/\//g,'_')||'root')+'-error.png');
      try{await page.screenshot({path:ss,fullPage:false});}catch{}
      ir.failures.push({path:tp.path,status:0,expected:tp.expectStatus,error});
      ir.pages.push({path:tp.path,status:0,title:'',canonical:'',timing,pass:false,error});
    }
  }

  ir.consoleErrors=errs.map(e=>({message:e.slice(0,200)}));
  if(errs.length>0)allConsoleErrors.push({iter:n,count:errs.length,errors:errs.slice(0,5)});
  consoleErrorCounts[n]=errs.length;

  // Sitemap
  try{
    await page.goto(BASE_URL+'/sitemap.xml',{waitUntil:'domcontentloaded',timeout:15000});
    const sc=await page.content();
    const ff=FORBIDDEN.filter(p=>sc.includes('<loc>'+BASE_URL+p));
    const df=DRAFT_SLUGS.filter(s=>sc.includes(s));
    const hq=sc.includes('/tools/documents/quotation');
    const hn=!sc.includes('/tools/quote-sheet');
    const sp=ff.length===0&&df.length===0&&hq&&hn;
    ir.sitemapChecks.push({pass:sp,forbiddenFound:ff,draftsFound:df,hasQuotation:hq,hasNoQuoteSheet:hn});
    if(!sp)ir.failures.push({path:'/sitemap.xml',error:'Sitemap issues: forbidden='+ff.join(',')+', drafts='+df.join(',')});
  }catch(e){ir.sitemapChecks.push({pass:false,error:e.message});}

  // Homepage UI
  try{await page.goto(BASE_URL+'/',{waitUntil:'domcontentloaded',timeout:15000});const hn=await page.evaluate(()=>!!document.querySelector('nav'));if(!hn)ir.failures.push({path:'/',error:'Missing nav'});}catch(e){ir.failures.push({path:'/',error:'Homepage UI: '+e.message});}

  // Quote Sheet UI
  try{await page.goto(BASE_URL+'/tools/documents/quotation',{waitUntil:'domcontentloaded',timeout:15000});const ht=await page.evaluate(()=>{const h=document.querySelector('h1');return h&&h.textContent.length>0;});if(!ht)ir.failures.push({path:'/tools/documents/quotation',error:'Missing title'});}catch(e){ir.failures.push({path:'/tools/documents/quotation',error:'Quote Sheet UI: '+e.message});}

  // Admin login
  if(ADMIN_EMAIL&&ADMIN_PASSWORD){
    log('  [Admin] Testing login...');
    try{
      await page.goto(BASE_URL+'/login',{waitUntil:'domcontentloaded',timeout:15000});
      const ei=await page.$('input[type="email"], input[name="email"]');
      const pi2=await page.$('input[type="password"], input[name="password"]');
      if(ei&&pi2){
        await ei.fill(ADMIN_EMAIL);
        await pi2.fill(ADMIN_PASSWORD);
        const btn=await page.$('button[type="submit"], input[type="submit"]');
        if(btn){
          await btn.click();
          await page.waitForLoadState('domcontentloaded',{timeout:15000});
          await sleep(2000);
          const cu=page.url();
          const li=!cu.includes('/login')||cu.includes('/admin');
          ir.adminTest={success:li,furl:cu.slice(0,100),testedAt:new Date().toISOString()};
          if(li){
            await page.goto(BASE_URL+'/admin',{waitUntil:'domcontentloaded',timeout:15000});
            if(page.url().includes('/admin')){
              await page.goto(BASE_URL+'/admin/landing-pages',{waitUntil:'domcontentloaded',timeout:15000});
              ir.adminTest.landingPagesLoaded=page.url().includes('/admin/landing-pages');
            }
          }
        }else{ir.adminTest={success:false,error:'Submit btn not found'};}
      }else{ir.adminTest={success:false,error:'Form inputs not found'};}
    }catch(e){ir.adminTest={success:false,error:e.message};}
  }else{ir.adminTest={skipped:true,reason:'SOAK_ADMIN_EMAIL/SOAK_ADMIN_PASSWORD not set'};}

  await ctx.close();
  const dur=Date.now()-t0;
  ir.duration=dur;
  ir.pass=ir.failures.length===0;
  allResults.push(ir);
  if(ir.failures.length>0)allFailures.push(...ir.failures.map(f=>({...f,iter:n})));
  writeFileSync(join(RD,'iter-'+n+'.json'),JSON.stringify(ir,null,2));
  writeSummary();
  log('  ✅ Iteration '+n+' complete: '+((ir.pass?'PASS':'FAIL')+' ('+ir.failures.length+' issues, '+dur+'ms)'));
  return ir;
}

async function main(){
  log('🚀 Overnight Production QA Soak Test');
  log('   Base URL: '+BASE_URL);
  log('   Iterations: '+ITERATIONS);
  log('   Interval: '+((INTERVAL_MS/60000).toFixed(0))+'min');
  log('   Headless: '+HEADLESS);
  log('   Report: '+RD);
  log('   Admin: '+((ADMIN_EMAIL?'ENABLED':'DISABLED')));
  const browser=await chromium.launch({headless:HEADLESS});
  await runIteration(1,browser);
  for(let i=2;i<=ITERATIONS;i++){
    log('  ⏳ Waiting '+(INTERVAL_MS/60000)+'min...');
    await sleep(INTERVAL_MS);
    await runIteration(i,browser);
  }
  await browser.close();
  log('\n🏁 Soak test complete. '+allResults.length+' iterations.');
  writeSummary();
}

main().catch(e=>{
  log('💥 Fatal: '+e.message);
  writeFileSync(join(RD,'fatal-error.json'),JSON.stringify({error:e.message,stack:e.stack,time:new Date().toISOString()}));
  process.exit(1);
});
