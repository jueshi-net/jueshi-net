// production-audit.js
const BASE = 'https://jueshi.net';
async function ft(url) {
  const s = Date.now();
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const ms = Date.now() - s;
    return { status: r.status, ms, body: await r.text(), ok: true };
  } catch(e) { return { status: 0, ms: Date.now()-s, body: '', ok: false }; }
}
async function audit() {
  const R = []; let ok = true;
  console.log('=== Production Audit jueshi.net === ' + new Date().toISOString());

  // 1. Homepage
  const h = await ft(BASE+'/');
  const vp = h.body.includes('maximum-scale=1')||h.body.includes('maximum-scale:1');
  const p1 = h.ok&&h.status===200&&vp; R.push({n:'首页 /',s:h.status,ms:h.ms,p:p1,d:'viewport='+vp});
  console.log((p1?'✅':'❌')+' 首页 '+h.status+'|'+h.ms+'ms viewport='+vp); if(!p1)ok=false;

  // 2. Postal page
  const pt = await ft(BASE+'/tools/postal-code');
  const p2 = pt.ok&&pt.status===200; R.push({n:'邮编页',s:pt.status,ms:pt.ms,p:p2});
  console.log((p2?'✅':'❌')+' 邮编页 '+pt.status+'|'+pt.ms+'ms');

  // 2b. API JP — warmup + timed request
  await ft(BASE+'/api/postal-codes?q=100&country=JP'); // warmup DB pool
  const pa = await ft(BASE+'/api/postal-codes?q=100-0001&country=JP');
  let ad=null; try{ad=JSON.parse(pa.body)}catch(e){console.log('JSON parse error:',e.message)}
  const apiOK = pa.ok&&pa.status===200&&ad&&ad.results&&ad.results.length>0;
  const p3 = apiOK;
  R.push({n:'邮编API(JP)',s:pa.status,ms:pa.ms,p:p3,d:'res='+(ad?.results?.length||0)+'ms='+pa.ms});
  console.log((p3?'✅':'❌')+' 邮编API '+pa.status+'|'+pa.ms+'ms res='+(ad?.results?.length||0)); if(!p3)ok=false;

  // 3. Package
  const pk = await ft(BASE+'/packages/shopify-starter');
  const p4 = pk.ok&&pk.status===200; R.push({n:'场景包',s:pk.status,ms:pk.ms,p:p4});
  console.log((p4?'✅':'❌')+' 场景包 '+pk.status+'|'+pk.ms+'ms'); if(!p4)ok=false;

  // 4. robots.txt
  const rb = await ft(BASE+'/robots.txt');
  const p5 = rb.ok&&rb.status===200&&(rb.body.includes('Disallow')||rb.body.includes('Allow'));
  R.push({n:'robots.txt',s:rb.status,ms:rb.ms,p:p5});
  console.log((p5?'✅':'❌')+' robots.txt '+rb.status+'|'+rb.ms+'ms'); if(!p5)ok=false;

  // 5. sitemap
  const sm = await ft(BASE+'/sitemap.xml');
  const uc = (sm.body.match(/<loc>/g)||[]).length;
  const p6 = sm.ok&&sm.status===200&&uc>0; R.push({n:'sitemap.xml',s:sm.status,ms:sm.ms,p:p6,d:'urls='+uc});
  console.log((p6?'✅':'❌')+' sitemap '+sm.status+'|'+sm.ms+'ms urls='+uc); if(!p6)ok=false;

  // 6. Header
  const nav = h.body.includes('场景包')&&h.body.includes('工具')&&h.body.includes('论坛');
  const wn = h.body.includes('whitespace-nowrap');
  R.push({n:'Header导航',s:'-',ms:'-',p:nav,d:'nowrap='+wn});
  console.log((nav?'✅':'❌')+' Header nav 场景包/工具/论坛='+nav+' nowrap='+wn); if(!nav)ok=false;

  const pc = R.filter(r=>r.p).length;
  console.log('\n=== SUMMARY '+pc+'/'+R.length+' '+(ok?'✅ ALL PASS':'⚠️ FAILED')+' ===');
  process.exit(ok?0:1);
}
audit();
