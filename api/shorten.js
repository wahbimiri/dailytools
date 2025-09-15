import { deflateSync, inflateSync } from 'zlib';
export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  if(req.method==='OPTIONS'){ res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS'); res.setHeader('Access-Control-Allow-Headers','content-type'); return res.status(204).end(); }
  const url = new URL(req.url, 'http://x');
  if(req.method==='GET'){
    const code = url.pathname.split('/').pop();
    try{
      const buf = Buffer.from(code.replace(/-/g,'+').replace(/_/g,'/'),'base64');
      const json = inflateSync(buf).toString('utf8');
      return res.status(200).json(JSON.parse(json));
    }catch(e){ return res.status(400).json({error:'invalid_code'}); }
  }else if(req.method==='POST'){
    const body = req.body || await new Promise(r=>{ let s=''; req.on('data',c=>s+=c); req.on('end',()=>r(JSON.parse(s||'{}'))); });
    const json = JSON.stringify(body||{});
    const def = deflateSync(Buffer.from(json,'utf8'));
    const code = def.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    return res.status(200).json({ code });
  }
  return res.status(405).json({error:'method_not_allowed'});
}