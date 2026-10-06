(function(root){'use strict';
 function format(value){return typeof value==='string'&&/^[0-9]{4}$/.test(value)?value:'';}
 function remaining(expiresAt,serverTime,elapsedMs){if(!Number.isFinite(expiresAt)||!Number.isFinite(serverTime))return 0;return Math.min(120,Math.max(0,Math.ceil(expiresAt-serverTime-Math.max(0,elapsedMs)/1000)));}
 const api=Object.freeze({format,combine:function(claimCode,ownerCode){return format(ownerCode);},remaining});
 if(typeof module==='object'&&module.exports)module.exports=api;else root.ABBClaimCode=api;
})(typeof window==='object'?window:globalThis);
