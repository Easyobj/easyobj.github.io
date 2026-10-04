/* Local-only voucher rendering. Credentials never leave the activity origin. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.ABBClaimVoucher=factory();
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  function encode(claimCode,ownerCode){
    if(!/^[A-F0-9]{12}$/.test(claimCode)||!/^[A-F0-9]{16}$/.test(ownerCode))throw new Error('领取凭证格式无效，请刷新页面。');
    return 'ABB2026:1:'+claimCode+':'+ownerCode;
  }
  function remaining(expiresAt,serverTime,elapsedMilliseconds){
    if(!Number.isFinite(expiresAt)||!Number.isFinite(serverTime)||!Number.isFinite(elapsedMilliseconds))return 0;
    return Math.max(0,Math.min(120,Math.ceil(expiresAt-serverTime-Math.max(0,elapsedMilliseconds)/1000)));
  }
  function mount(target,payload){
    if(!/^ABB2026:1:[A-F0-9]{12}:[A-F0-9]{16}$/.test(payload))throw new Error('领取凭证格式无效，请刷新页面。');
    if(typeof window.qrcode!=='function')throw new Error('二维码组件未加载，请刷新页面或使用下方备用码。');
    const qr=window.qrcode(0,'M');
    qr.addData(payload,'Alphanumeric');qr.make();
    const count=qr.getModuleCount(),size=count+8,ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox',`0 0 ${size} ${size}`);
    svg.setAttribute('role','img');svg.setAttribute('aria-label','本人领取二维码，请现场工作人员扫描');
    svg.setAttribute('shape-rendering','crispEdges');
    const background=document.createElementNS(ns,'rect');
    background.setAttribute('width',String(size));background.setAttribute('height',String(size));background.setAttribute('fill','#fff');
    const modules=document.createElementNS(ns,'path');
    let path='';
    for(let row=0;row<count;row++)for(let col=0;col<count;col++)if(qr.isDark(row,col))path+=`M${col+4},${row+4}h1v1h-1z`;
    modules.setAttribute('d',path);modules.setAttribute('fill','#000');
    svg.append(background,modules);target.replaceChildren(svg);
  }
  return Object.freeze({encode,remaining,mount});
});
