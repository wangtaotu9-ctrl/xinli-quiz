/* 心里那点事 · 答题引擎
   纯前端单页：封面 → 0.99 解锁码门禁 → N 题 → 结果报告
   答案只在本地计算，不上传、不收集任何信息
   可选封面增强字段（旧数据不填即保持原样）：
     theme      : 'teal' | 'ink'   → 给 .wrap 加主题 class
     coverArt   : 内联 SVG 字符串  → 封面装饰插画
     slogan     : 手写体标语
     pill       : true             → 4 维度改成胶囊网格
*/
(function(){
  var D = window.QUIZ_DATA;
  var C = window.SHOP_CONFIG;
  var app = document.getElementById('app');
  var answers = [], idx = 0;
  var LS = 'unlock_' + D.id;
  var T = window.XN_TRACK || function(){};   // 统计埋点：config.js stats.id 留空时为空操作
  T('visit', D.id);

  if(D.theme){ var w=document.querySelector('.wrap'); if(w) w.classList.add('theme-'+D.theme); }

  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function unlocked(){ try{ return localStorage.getItem(LS)==='1'; }catch(e){ return false; } }
  function setUnlocked(){ try{ localStorage.setItem(LS,'1'); }catch(e){} }
  function head(){ return '<div class="topbar"><span class="brand"><span class="dot"></span>'+esc(C.series)+'</span><a href="index.html">全部测试</a></div>'; }
  function toast(t){
    var el=document.getElementById('toast');
    if(!el){ el=document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); }
    el.textContent=t; el.classList.add('show');
    clearTimeout(window.__t); window.__t=setTimeout(function(){el.classList.remove('show');},1900);
  }
  function copy(text,msg){
    var ok=function(){toast(msg||'已复制');};
    if(navigator.clipboard&&window.isSecureContext){ navigator.clipboard.writeText(text).then(ok,fb); } else fb();
    function fb(){
      var ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); ok(); }catch(e){ toast('复制失败，请长按选择文字'); }
      document.body.removeChild(ta);
    }
  }

  /* ---------- 封面 ---------- */
  function renderCover(){
    var checks = D.checks.map(function(c){
      if(D.pill) return '<li><span class="ck">✓</span><span class="pt"><b>'+esc(c[0])+'</b><small>'+esc(c[1])+'</small></span></li>';
      return '<li><span class="ck">✓</span><span><b>'+esc(c[0])+'</b> ｜ '+esc(c[1])+'</span></li>';
    }).join('');
    var art = D.coverArt ? '<div class="cover-art">'+D.coverArt+'</div>' : '';
    var slogan = D.slogan ? '<div class="slogan">'+esc(D.slogan)+'</div>' : '';
    app.innerHTML = head()+
      '<div class="cover">'+
        '<div class="vol"><span>'+esc(D.vol)+'</span><span>'+esc(D.quizCount)+'</span></div>'+
        '<span class="cover-tag">'+esc(D.tag)+'</span>'+
        '<h1 class="cover-title">'+D.title+'</h1>'+
        '<p class="cover-sub">'+esc(D.subtitle)+'</p>'+
        art+
        '<ul class="checklist'+(D.pill?' pill':'')+'">'+checks+'</ul>'+
        slogan+
        '<button class="cover-btn" id="go">点击测试 →</button>'+
        '<div class="meta"><span><b>'+D.questions.length+'</b> 道题</span><span>约 <b>'+esc(D.minutes)+'</b> 分钟</span><span><b>'+D.types.length+'</b> 种结果</span><span>凭第一直觉选</span></div>'+
      '</div>'+
      '<div class="paywall" id="pw">'+
        '<div class="lock">🔒</div>'+
        '<div class="price">¥'+esc(C.price)+'<small>/ 份 · 虚拟商品</small></div>'+
        '<h3>拍下后，才能开始测</h3>'+
        '<p>拍下后平台会「自动发货」，把<b>解锁码</b>发给你。在下面输入就能开始，答案只在你自己手机里计算。</p>'+
        '<input class="code-input" id="code" placeholder="输入自动发货消息里的解锁码" autocomplete="off" spellcheck="false">'+
        '<div class="err" id="err"></div>'+
        '<button class="btn hl" id="unlock">输入解锁码，开始测试</button>'+
        (C.shopUrl ? '<div class="btn-row"><a class="btn ghost" id="shop" href="'+esc(C.shopUrl)+'" target="_blank" rel="noopener">还没拍？去拍下 ¥'+esc(C.price)+' →</a></div>' : '')+
        '<p class="pay-note">'+esc(D.disclaimer)+'</p>'+
      '</div>'+
      '<div class="src">'+D.source+'</div>'+
      '<div class="footer">'+esc(C.series)+' · 仅供娱乐，不是心理诊断</div>';
    T('paywall_view');
    if(C.shopUrl){
      var shopEl=document.getElementById('shop');
      if(shopEl) shopEl.onclick=function(){ T('shop_click', D.id); };
    }
    document.getElementById('go').onclick=function(){
      if(unlocked()){ answers=[]; idx=0; renderQuestion(); }
      else { document.getElementById('pw').scrollIntoView({behavior:'smooth',block:'center'}); document.getElementById('code').focus(); toast('先输入解锁码就能开始～'); }
    };
    document.getElementById('unlock').onclick=function(){
      var v=(document.getElementById('code').value||'').trim().toUpperCase();
      var list=(C.codes[D.id]||[]).map(function(x){return x.toUpperCase();});
      T('code_submit');
      if(!v){ document.getElementById('err').textContent='请先输入解锁码'; return; }
      if(list.indexOf(v)<0){ T('unlock_fail'); document.getElementById('err').textContent='解锁码不对，检查一下自动发货消息里的码'; return; }
      T('unlock_ok');
      setUnlocked(); answers=[]; idx=0; renderQuestion();
    };
    window.scrollTo(0,0);
  }

  /* ---------- 答题 ---------- */
  function renderQuestion(){
    var q=D.questions[idx];
    var pct=Math.round(idx/D.questions.length*100);
    var opts=q.o.map(function(o,i){
      return '<button class="opt" data-v="'+i+'"><span class="k">'+String.fromCharCode(65+i)+'</span>'+esc(o[0])+'</button>';
    }).join('');
    app.innerHTML = head()+
      '<div class="quiz">'+
        '<div class="qcount">第 '+(idx+1)+' / '+D.questions.length+' 题</div>'+
        '<div class="progress"><i style="width:'+pct+'%"></i></div>'+
        '<div class="qtitle">'+esc(q.t)+'</div>'+
        '<div class="qhint">凭第一直觉选，别想太多～</div>'+
        '<div class="opts">'+opts+'</div>'+
        (idx>0?'<div class="backlink" id="back">← 上一题</div>':'')+
      '</div>'+
      '<div class="footer">'+esc(C.series)+'</div>';
    var bs=app.querySelectorAll('.opt');
    Array.prototype.forEach.call(bs,function(b){
      b.onclick=function(){
        Array.prototype.forEach.call(bs,function(x){x.classList.remove('on');});
        b.classList.add('on');
        var v=parseInt(b.getAttribute('data-v'),10);
        setTimeout(function(){
          answers[idx]=q.o[v][1]; idx++;
          if(idx>=D.questions.length) renderResult(); else renderQuestion();
        },160);
      };
    });
    if(idx>0) document.getElementById('back').onclick=function(){idx--;renderQuestion();};
    window.scrollTo(0,0);
  }

  /* ---------- 结果 ---------- */
  function renderResult(){
    var score={}; D.types.forEach(function(t){score[t.k]=0;});
    answers.forEach(function(k){ if(k in score) score[k]++; });
    var sorted=D.types.slice().sort(function(a,b){return score[b.k]-score[a.k];});
    var win=sorted[0], total=D.questions.length;
    var pct=Math.round(score[win.k]/total*100);
    var max=Math.max.apply(null,D.types.map(function(t){return score[t.k];}))||1;
    var bars=D.types.map(function(t){
      var v=Math.round(score[t.k]/max*100);
      return '<div class="bar'+(t.k===win.k?' top':'')+'"><div class="lab"><span>'+esc(t.n)+'</span><b>'+score[t.k]+'</b></div>'+
             '<div class="track"><i style="width:'+Math.max(2,v)+'%"></i></div></div>';
    }).join('');
    var all=D.types.map(function(t,i){
      return '<div class="allrow"><span class="n">'+(i+1<10?'0':'')+(i+1)+'</span><span class="nm">'+esc(t.n)+'</span><span class="ds">'+esc(t.tag)+'</span></div>';
    }).join('');
    var body=win.body.map(function(p){return '<p>'+esc(p)+'</p>';}).join('');
    var share=win.share.replace(/\{link\}/g,location.href.split('#')[0]);
    app.innerHTML = head()+
      '<div class="result">'+
        '<div class="result-tag">'+esc(D.vol)+' · 你的报告</div>'+
        '<h2 class="result-title">'+esc(win.n)+'</h2>'+
        '<div class="result-lead">'+esc(win.tag)+'</div>'+
        '<div class="concentration"><b>'+pct+'%</b> 成分浓度 · 你选了 '+score[win.k]+' / '+total+' 题指向它</div>'+
        '<div class="result-body">'+body+'</div>'+
        '<div class="gift"><span class="lab">可以带走的一句话</span>'+esc(win.gift)+'</div>'+
        '<div class="bars"><div class="share-box" style="border:0;padding-top:18px;margin-top:0"><div class="lab">十种类型的成分条</div></div>'+bars+'</div>'+
        '<div class="share-box">'+
          '<div class="lab">一键复制 · 发笔记/发给朋友</div>'+
          '<div class="share-text" id="st">'+esc(share)+'</div>'+
          '<div class="btn-row"><button class="btn small hl" id="cs">复制文案</button><button class="btn small ghost" id="cl">复制测试链接</button></div>'+
          '<div class="btn-row"><button class="btn small ghost" id="again">重新测一次</button></div>'+
        '</div>'+
        '<div class="allresults"><h4>查看全部 '+D.types.length+' 种结果</h4>'+all+'</div>'+
      '</div>'+
      '<div class="note">'+esc(D.disclaimer)+'</div>'+
      '<div class="footer">'+esc(C.series)+' · 仅供娱乐，不是心理诊断</div>';
    T('result_view', win.k + '|' + win.n);
    document.getElementById('cs').onclick=function(){ T('share_copy','文案'); copy(share,'文案已复制，去发笔记吧'); };
    document.getElementById('cl').onclick=function(){ T('share_copy','链接'); copy(location.href.split('#')[0],'测试链接已复制'); };
    document.getElementById('again').onclick=function(){answers=[];idx=0;renderQuestion();};
    window.scrollTo(0,0);
  }

  renderCover();
})();
