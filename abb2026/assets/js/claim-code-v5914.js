(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.ABBClaimCode=factory();
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  function combine(claimCode,ownerCode){
    if(!/^[A-F0-9]{12}$/.test(claimCode)||!/^[A-F0-9]{16}$/.test(ownerCode))throw new Error('核销码格式无效，请刷新页面。');
    return claimCode+'-'+ownerCode;
  }
  function remaining(expiresAt,serverTime,elapsedMilliseconds){
    if(!Number.isFinite(expiresAt)||!Number.isFinite(serverTime)||!Number.isFinite(elapsedMilliseconds))return 0;
    return Math.max(0,Math.min(120,Math.ceil(expiresAt-serverTime-Math.max(0,elapsedMilliseconds)/1000)));
  }
  return Object.freeze({combine,remaining});
});
