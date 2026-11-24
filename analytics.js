/* ============================================================
   统计埋点层 · 画像分析用
   ------------------------------------------------------------
   【怎么启用】二选一，改 config.js 的 stats，然后重跑 一键部署到GitHub.bat：

   方式 A（推荐，最省事、永不怕平台改版）：
     注册 51LA https://v6.51.la/ 或百度统计 https://tongji.baidu.com，
     添加站点后复制平台给的「整段统计代码」，原样粘进 stats.snippet 里。
     本文件会把这段 script 真正执行（innerHTML 注入的 script 不会执行，需重建节点）。

   方式 B（只填 ID）：
     stats.provider = "51la"  → 填 id（项目ID）+ ck（校验密钥）
     stats.provider = "baidu" → 填 id（hm.js? 后面那串 siteId）

   什么都不填 = 完全不加载、不上报任何数据、不发任何请求。

   【记录的事件】自动带渠道标签
     visit        打开某测试页（label = 测试id）
     paywall_view 付费墙展示
     code_submit  提交了解锁码
     unlock_ok / unlock_fail  解锁成功 / 失败
     result_view  看到结果（label = 结果名 → 画像分析核心）
     share_copy   复制分享文案 / 链接
     shop_click   点「去拍下」
     card_click   首页点测试卡片

   【渠道追踪】链接加 ?from=xxx，例如
     https://wangtaotu9-ctrl.github.io/xinli-quiz/ta.html?from=xhs
     小红书发 ?from=xhs、抖音发 ?from=douyin、公众号发 ?from=wx，
     该访客本次所有事件都会带上渠道标签（sessionStorage 记住）。

   【隐私】只记录匿名聚合行为（页面/事件/来源/设备/地域），
     不采集姓名、手机号、微信号等任何个人身份信息，答案也只在本地计算。
   ============================================================ */
(function(){
  var S = (window.SHOP_CONFIG && window.SHOP_CONFIG.stats) || {};
  var snippet = (S.snippet || '').trim();
  var provider = S.provider || '';
  var id = (S.id || '').trim();
  var ck = (S.ck || '').trim();
  var enabled = !!(snippet || (provider && id));

  /* ---------- 渠道 ---------- */
  var CH = '';
  try{
    var m = location.search.match(/[?&](?:from|ch|src|utm_source)=([^&#]{1,20})/);
    if(m){ CH = decodeURIComponent(m[1]); sessionStorage.setItem('xn_ch', CH); }
    else { CH = sessionStorage.getItem('xn_ch') || 'direct'; }
  }catch(e){ CH = 'direct'; }
  CH = CH.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5-]/g, '').slice(0, 20) || 'direct';

  /* ---------- 注入统计代码 ---------- */
  function execSnippet(code){
    var box = document.createElement('div');
    box.innerHTML = code;
    var list = box.querySelectorAll('script');
    Array.prototype.forEach.call(list, function(old){
      var s = document.createElement('script');
      Array.prototype.forEach.call(old.attributes, function(a){ s.setAttribute(a.name, a.value); });
      // 动态创建的 script 默认 async，会打乱「外链SDK → 内联 LA.init」的顺序，
      // 强制 async=false 保证按粘贴顺序同步执行（与静态 HTML 里一致）
      s.async = false;
      if(old.src){ s.src = old.src; }
      else { s.textContent = old.textContent; }
      document.head.appendChild(s);
    });
  }

  function inject(){
    if(!enabled) return;
    try{
      if(snippet){ execSnippet(snippet); return; }
      if(provider === '51la'){
        // 51LA V6 新版：先加载 SDK，onload 后 LA.init({id, ck})
        var a = document.createElement('script');
        a.src = 'https://sdk.51.la/js-sdk-pro.min.js';
        a.onload = function(){
          try{ if(window.LA && window.LA.init) window.LA.init({ id: id, ck: ck || true, autoTrack: true }); }catch(e){}
        };
        document.head.appendChild(a);
      } else if(provider === 'baidu'){
        window._hmt = window._hmt || [];
        var b = document.createElement('script');
        b.src = 'https://hm.baidu.com/hm.js?' + encodeURIComponent(id);
        document.head.appendChild(b);
      }
    }catch(e){}
  }

  /* ---------- 事件埋点：运行时探测平台 API，snippet / ID 两种模式通用 ---------- */
  function track(ev, label){
    if(!enabled) return;
    var full = (label || '-') + '@' + CH;
    try{
      if(window._hmt){
        window._hmt.push(['_trackEvent', 'quiz', ev, full]);
      } else if(window.LA && window.LA.track){
        window.LA.track(ev, { label: full });
      }
    }catch(e){}
  }

  inject();

  /* 首页卡片点击：事件委托，index.html 只需 data-track 属性 */
  document.addEventListener('click', function(e){
    var el = e.target;
    while(el && el !== document.body){
      if(el.getAttribute && el.getAttribute('data-track')){
        track(el.getAttribute('data-track'), el.getAttribute('data-label') || '');
        break;
      }
      el = el.parentNode;
    }
  }, true);

  window.XN_TRACK = track;
})();
