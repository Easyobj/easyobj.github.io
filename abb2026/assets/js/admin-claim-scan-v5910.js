(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.ABBAdminClaimScan=factory();
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  function parse(value){
    if(typeof value!=='string'||value.length>80)return null;
    const text=value.startsWith('QR_CODE,')?value.slice(8):value;
    const match=/^ABB2026:1:([A-F0-9]{12}):([A-F0-9]{16})$/.exec(text);
    return match&&match[0]===text?{claimCode:match[1],ownerCode:match[2]}:null;
  }
  function mount(options){
    const button=document.getElementById('claimScanButton'),status=document.getElementById('claimScanStatus');
    const form=document.getElementById('claimLookupForm');
    if(!button||!status||!form)return;
    let ready=false,busy=false;
    const message=text=>{status.textContent=text;};
    const unavailable=()=>{ready=false;button.disabled=true;message('微信扫一扫未就绪，请刷新；仍不可用时请检查公众号 JS 接口安全域名，或展开备用手动核验。');};
    if(!/MicroMessenger/i.test(navigator.userAgent)){button.disabled=true;message('请在手机微信中打开此后台，登录后可直接扫一扫。电脑端仅提供备用手动核验。');return;}
    if(!options||!options.config||!window.wx){unavailable();if(options&&options.notice)message(options.notice+' 可展开备用手动核验。');return;}
    const timer=setTimeout(unavailable,12000);
    window.wx.ready(()=>{clearTimeout(timer);ready=true;button.disabled=false;message('扫一扫用户现场生成的领取二维码，自动查询；扫码不会直接核销。');});
    window.wx.error(()=>{clearTimeout(timer);unavailable();});
    button.addEventListener('click',()=>{
      if(!ready||busy)return;
      busy=true;button.disabled=true;message('请扫描用户微信中奖页中的有效领取二维码。');
      const release=()=>{busy=false;button.disabled=!ready;};
      window.wx.scanQRCode({needResult:1,scanType:['qrCode'],
        success:result=>{
          const codes=parse(result&&result.resultStr);
          if(!codes){form.elements.claim_code.value='';form.elements.owner_code.value='';message('不是今年活动的领取二维码，请让用户现场生成新的二维码。');release();return;}
          // POST to the existing PHP form only. Never navigate to the scan result,
          // log it, put it in a URL or persist it in browser storage.
          form.elements.claim_code.value=codes.claimCode;form.elements.owner_code.value=codes.ownerCode;
          message('已读取二维码，正在查询领取资格…');
          if(typeof form.requestSubmit==='function')form.requestSubmit();else HTMLFormElement.prototype.submit.call(form);
        },
        cancel:()=>{release();message('已取消扫码，可点击扫一扫重试。');},
        fail:()=>{release();message('扫一扫失败，请重试；请确认微信已获准使用相机。');}
      });
    });
    try{window.wx.config(options.config);}catch(error){clearTimeout(timer);unavailable();}
  }
  return Object.freeze({parse,mount});
});
