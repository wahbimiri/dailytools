export default async function handler(req, res){
  try{
    const url = new URL(req.url, 'http://x');
    const base=(url.searchParams.get('base')||'USD').toUpperCase();
    const primary = 'https://open.er-api.com/v6/latest/'+base;
    const fallback = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/'+base.toLowerCase()+'.json';
    try{
      const r = await fetch(primary);
      const j = await r.json();
      if(j && j.rates && j.result!=='error'){
        res.setHeader('Cache-Control','s-maxage=43200, stale-while-revalidate=86400');
        return res.status(200).json({ base, rates:j.rates, ts:Date.now(), src:'erapi' });
      }
      throw new Error('primary failed');
    }catch(e){
      const r2 = await fetch(fallback);
      const j2 = await r2.json();
      if(j2 && j2[base.toLowerCase()]){
        const map={}; Object.entries(j2[base.toLowerCase()]).forEach(([k,v])=>map[k.toUpperCase()]=v);
        res.setHeader('Cache-Control','s-maxage=43200, stale-while-revalidate=86400');
        return res.status(200).json({ base, rates:map, ts:Date.now(), src:'jsdelivr' });
      }
      return res.status(502).json({ error:'fetch_failed' });
    }
  }catch(err){
    return res.status(500).json({ error:'server_error' });
  }
}