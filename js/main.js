/* Sartaj Alam Boutique — interactions */
(function(){
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  // Navbar solid on scroll
  const nav = $('#navbar');
  const onScroll = ()=>{
    if(!nav) return;
    if(window.scrollY > 40){ nav.classList.add('solid'); nav.classList.remove('transparent'); }
    else { nav.classList.remove('solid'); nav.classList.add('transparent'); }
    // parallax cine
    $$('.cine img').forEach(img=>{
      const r = img.parentElement.getBoundingClientRect();
      if(r.top < window.innerHeight && r.bottom > 0){
        const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
        img.style.transform = `translateY(${(p-0.5)*-80}px)`;
      }
    });
  };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Mobile menu
  const burger = $('#burger'), mmenu = $('#mmenu'), mclose = $('#mclose');
  if(burger && mmenu){
    burger.addEventListener('click', ()=>{ mmenu.classList.add('open'); document.body.style.overflow='hidden'; });
    const close = ()=>{ mmenu.classList.remove('open'); document.body.style.overflow=''; };
    if(mclose) mclose.addEventListener('click', close);
    $$('.mlink', mmenu).forEach(a=>a.addEventListener('click', close));
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });
  }

  // Reveal on scroll
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.12});
  $$('.rv').forEach(el=>io.observe(el));

  // Magnetic buttons (subtle)
  if(matchMedia('(hover:hover)').matches){
    $$('.btn-magnetic').forEach(btn=>{
      btn.addEventListener('mousemove', e=>{
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2)/r.width;
        const y = (e.clientY - r.top - r.height/2)/r.height;
        btn.style.transform = `translate(${x*8}px, ${y*6}px)`;
      });
      btn.addEventListener('mouseleave', ()=>{ btn.style.transform=''; });
    });
  }

  // Custom cursor grow
  const cursor = $('#cursor');
  if(cursor && matchMedia('(hover:hover) and (pointer:fine)').matches){
    window.addEventListener('mousemove', e=>{
      cursor.style.left = e.clientX+'px'; cursor.style.top = e.clientY+'px';
    });
    $$('a, button, .m-item, .service-row').forEach(el=>{
      el.addEventListener('mouseenter', ()=>cursor.classList.add('grow'));
      el.addEventListener('mouseleave', ()=>cursor.classList.remove('grow'));
    });
  } else if(cursor){ cursor.style.display='none'; }

  // Gallery filters
  $$('[data-filter-group]').forEach(group=>{
    const btns = $$('.pill', group);
    const gridId = group.getAttribute('data-filter-group');
    const grid = document.getElementById(gridId);
    if(!grid) return;
    btns.forEach(btn=>btn.addEventListener('click', ()=>{
      btns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      $$('.m-item', grid).forEach(item=>{
        const show = f==='all' || item.dataset.cat===f;
        item.style.display = show ? '' : 'none';
        if(show){ item.style.animation='none'; void item.offsetWidth; item.style.animation='heroFade .6s ease'; }
      });
    }));
  });

  // Lightbox
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbList = [], lbIdx = 0;
  function openLb(items, idx){
    lbList = items; lbIdx = idx; updateLb();
    lb.classList.add('open'); document.body.style.overflow='hidden';
  }
  function updateLb(){
    const it = lbList[lbIdx];
    if(!it) return;
    lbImg.src = it.src; lbImg.alt = it.alt || 'Boutique work';
    if(lbCap) lbCap.textContent = (it.cap||'') + `  —  ${lbIdx+1} / ${lbList.length}`;
  }
  function closeLb(){ lb.classList.remove('open'); document.body.style.overflow=''; }
  $$('.masonry, [data-lightbox-scope]').forEach(scope=>{
    const items = $$('.m-item', scope);
    items.forEach((item, i)=>item.addEventListener('click', ()=>{
      const arr = items.filter(el=>el.style.display!=='none').map(el=>{
        const im = $('img', el);
        return {src: im.dataset.full || im.src, alt: im.alt, cap: el.dataset.title || im.alt};
      });
      // map visible index
      const visible = items.filter(el=>el.style.display!=='none');
      openLb(arr, visible.indexOf(item));
    }));
  });
  if(lb){
    $('#lbClose')?.addEventListener('click', closeLb);
    $('#lbPrev')?.addEventListener('click', e=>{e.stopPropagation(); lbIdx=(lbIdx-1+lbList.length)%lbList.length; updateLb();});
    $('#lbNext')?.addEventListener('click', e=>{e.stopPropagation(); lbIdx=(lbIdx+1)%lbList.length; updateLb();});
    lb.addEventListener('click', e=>{ if(e.target===lb) closeLb(); });
    document.addEventListener('keydown', e=>{
      if(!lb.classList.contains('open')) return;
      if(e.key==='Escape') closeLb();
      if(e.key==='ArrowLeft'){ lbIdx=(lbIdx-1+lbList.length)%lbList.length; updateLb(); }
      if(e.key==='ArrowRight'){ lbIdx=(lbIdx+1)%lbList.length; updateLb(); }
    });
  }

  // Opening hours dynamic status
  // Hours: Mon-Thu 10-20, Fri 14-20, Sat-Sun 10-20. JS day: 0=Sun..6=Sat
  const hoursDef = {0:[10,20],1:[10,20],2:[10,20],3:[10,20],4:[10,20],5:[14,20],6:[10,20]};
  function openStatus(){
    const now = new Date();
    const d = now.getDay();
    const [o,c] = hoursDef[d];
    const h = now.getHours() + now.getMinutes()/60;
    return {isOpen: h>=o && h<c, open:o, close:c, day:d};
  }
  function fmt(h){ const ap = h>=12?'PM':'AM'; const hh = h%12===0?12:h%12; return `${hh}:00 ${ap}`; }
  $$('[data-open-status]').forEach(el=>{
    const s = openStatus();
    el.innerHTML = s.isOpen
      ? `<span class="status-dot status-open"></span> OPEN NOW · Closes ${fmt(s.close)}`
      : `<span class="status-dot status-closed"></span> CLOSED NOW · Opens ${fmt(s.open)}`;
    el.setAttribute('data-state', s.isOpen?'open':'closed');
  });
  $$('[data-today-row]').forEach(el=>{
    const today = new Date().getDay();
    // rows have data-day="0..6"
    if(parseInt(el.dataset.day,10)===today) el.classList.add('today');
  });

  // Footer year + form -> WhatsApp
  const yr = $('#yr'); if(yr) yr.textContent = new Date().getFullYear();
  $$('form[data-whatsapp-form]').forEach(form=>{
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(form);
      const msg = `Hello Sartaj Alam Designing Boutique, I would like to enquire about custom designing and stitching.%0A%0AName: ${encodeURIComponent(fd.get('name')||'')}%0APhone: ${encodeURIComponent(fd.get('phone')||'')}%0ARequirement: ${encodeURIComponent(fd.get('requirement')||'')}%0APreferred visit: ${encodeURIComponent(fd.get('date')||'')}%0AMessage: ${encodeURIComponent(fd.get('message')||'')}`;
      window.open(`https://wa.me/919773959117?text=${msg}`, '_blank');
      const ok = $('[data-form-ok]', form);
      if(ok){ ok.style.display='block'; }
    });
  });

  // Subtle page transition for internal links
  const veil = $('#pageVeil');
  if(veil){
    $$('a[href$=".html"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const href = a.getAttribute('href');
        if(!href || href.startsWith('#')) return;
        e.preventDefault();
        veil.classList.add('show');
        setTimeout(()=>{ window.location.href = href; }, 220);
      });
    });
    window.addEventListener('pageshow', ()=>veil.classList.remove('show'));
    setTimeout(()=>veil.classList.remove('show'), 50);
  }
})();
