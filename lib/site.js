// Page interactions, ported from the original single-file build.
// Runs once on the client after hydration; it works directly on the server-rendered DOM.
export function initSite({ gsap, ScrollTrigger, SplitText, Lenis }) {
  var root = document.documentElement;
  var G = gsap;
  var ST = ScrollTrigger;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, c){ return (c||document).querySelector(s); };
  var $$ = function(s, c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };

  // Safety: never leave the hero hidden
  function introDone(){ root.classList.add('intro-done'); }
  setTimeout(introDone, 2600);
  if (!G) { introDone(); }
  if (G && ST) G.registerPlugin(ST);
  if (G && SplitText) G.registerPlugin(SplitText);

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (G && ST && Lenis && !reduce) {
    try {
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
      lenis.on('scroll', ST.update);
      G.ticker.add(function(t){ lenis.raf(t * 1000); });
      G.ticker.lagSmoothing(0);
    } catch (e) { lenis = null; }
  }
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(ev){
      var id = a.getAttribute('href');
      var el = id === '#top' ? document.body : $(id);
      if (!el) return;
      ev.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: id === '#top' ? 0 : -90, duration: 1.3 });
      else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------- nav: hide on scroll down, progress ---------- */
  var nav = $('#nav'), bar = $('.progress span'), lastY = 0;
  function onScroll(){
    var y = window.scrollY || 0;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
    var menuOpen = $('.menu-btn').getAttribute('aria-expanded') === 'true';
    if (!menuOpen) nav.classList.toggle('is-hidden', y > 260 && y > lastY + 2);
    if (y < lastY - 2 || y < 260) nav.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var menuBtn = $('.menu-btn'), menu = $('#menu');
  function closeMenu(){ if (menuBtn.getAttribute('aria-expanded') === 'true') { menuBtn.setAttribute('aria-expanded','false'); menu.hidden = true; } }
  menuBtn.addEventListener('click', function(){
    var open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (open && G && !reduce) G.from($$('a', menu), { y: 12, opacity: 0, stagger: .05, duration: .4, ease: 'power3.out' });
  });
  menu.addEventListener('keydown', function(e){ if (e.key === 'Escape') { closeMenu(); menuBtn.focus(); } });
  menuBtn.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeMenu(); });

  /* ---------- hero ledger sequence ---------- */
  var lRows = $$('#l-rows li'), oItems = $$('#o-list li'), oCount = $('#o-count'), ring = $('.agent-pill .ring');
  var heroTl = null;
  function ledgerReset(){
    lRows.forEach(function(li){ li.classList.remove('is-done'); var c = $('.chip', li); c.textContent = c.getAttribute('data-p'); });
    oItems.forEach(function(li){ li.classList.add('pending'); });
    oCount.textContent = '0 of 4 handled';
  }
  function ledgerPlay(delay){
    if (!G || reduce) return;
    if (heroTl) heroTl.kill();
    ledgerReset();
    heroTl = G.timeline({ delay: delay || 0 });
    lRows.forEach(function(li, i){
      heroTl.add(function(){
        li.classList.add('is-done');
        $('.chip', li).textContent = 'Handled';
      }, i * 0.85);
      heroTl.fromTo($('.chip', li), { scale: .8 }, { scale: 1, duration: .45, ease: 'back.out(3)' }, i * 0.85);
      heroTl.fromTo(ring, { opacity: .9, scale: 1 }, { opacity: 0, scale: 1.35, duration: .7, ease: 'power2.out' }, i * 0.85 + .15);
      heroTl.add(function(){ oItems[i].classList.remove('pending'); oCount.textContent = (i + 1) + ' of 4 handled'; }, i * 0.85 + .35);
      heroTl.fromTo($('.ck', oItems[i]), { scale: .4 }, { scale: 1, duration: .5, ease: 'back.out(3)' }, i * 0.85 + .35);
    });
  }
  $('#hero-replay').addEventListener('click', function(){ ledgerPlay(0); });

  /* ---------- hero intro ---------- */
  function heroIntro(){
    if (!G || reduce) { introDone(); return; }
    var h1 = $('#hero-title');
    var tl = G.timeline({ defaults: { ease: 'power4.out' }, onComplete: introDone });
    tl.fromTo('#navwipe-r', { attr: { width: 0 } }, { attr: { width: 280 }, duration: 1.1, ease: 'power3.inOut' }, .35);
    if (SplitText) {
      G.set(h1, { opacity: 1 });
      var split = new SplitText(h1, { type: 'lines', mask: 'lines', linesClass: 'hl' });
      tl.from(split.lines, { yPercent: 110, duration: 1.15, stagger: .1, onComplete: function(){ split.revert(); } }, .15);
    } else {
      tl.fromTo(h1, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, .15);
    }
    var intro = $$('.hero [data-intro]');
    tl.fromTo(intro.filter(function(e){ return !e.classList.contains('ledger'); }), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .08 }, .55);
    tl.fromTo('.ledger', { y: 40, opacity: 0, rotate: 1.2 }, { y: 0, opacity: 1, rotate: 0, duration: 1.2 }, .45);
    ledgerReset();
    tl.add(function(){ ledgerPlay(0); }, 1.3);
  }
  if (document.fonts && document.fonts.ready) {
    var started = false;
    var go = function(){ if (!started) { started = true; heroIntro(); thesisScrub(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 1200);
  } else { heroIntro(); thesisScrub(); }

  /* ---------- hero card tilt ---------- */
  var ledger = $('.ledger');
  if (G && !reduce && window.matchMedia('(pointer:fine)').matches) {
    var rx = G.quickTo(ledger, 'rotationX', { duration: .8, ease: 'power3' });
    var ry = G.quickTo(ledger, 'rotationY', { duration: .8, ease: 'power3' });
    G.set(ledger, { transformPerspective: 1200 });
    ledger.addEventListener('pointermove', function(e){
      var r = ledger.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - .5) * 5);
      rx(-((e.clientY - r.top) / r.height - .5) * 5);
    });
    ledger.addEventListener('pointerleave', function(){ rx(0); ry(0); });
  }

  /* ---------- magnetic buttons ---------- */
  if (G && !reduce && window.matchMedia('(pointer:fine)').matches) {
    $$('.magnet').forEach(function(b){
      var mx = G.quickTo(b, 'x', { duration: .5, ease: 'power3' }), my = G.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('pointermove', function(e){ var r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width/2) * .18); my((e.clientY - r.top - r.height/2) * .3); });
      b.addEventListener('pointerleave', function(){ mx(0); my(0); });
    });
  }

  /* ---------- thesis word scrub ---------- */
  function thesisScrub(){
    if (!(G && ST && !reduce && SplitText)) return;
    var thesisSplit = new SplitText('#thesis', { type: 'words', wordsClass: 'w' });
    G.fromTo(thesisSplit.words, { opacity: .22 }, { opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: '#thesis', start: 'top 82%', end: 'bottom 52%', scrub: .6 } });
  }

  /* ---------- services tabs + demos ---------- */
  var tabs = $$('.svc-tab'), panels = $$('.svc-panel'), demoTl = null;
  function setOn(list, on){ list.forEach(function(el){ el.classList.toggle('on', on); }); }
  var demos = {
    auto: function(d){
      var lis = $$('.flow li', d), fill = $('.flow-fill', d), tl = G.timeline();
      setOn(lis, false); G.set(fill, { scaleY: 0 });
      lis.forEach(function(li, k){
        tl.to(fill, { scaleY: k / (lis.length - 1), duration: k ? .55 : .01, ease: 'power1.inOut' });
        tl.add(function(){ li.classList.add('on'); });
        tl.fromTo($('.dot', li), { scale: .7 }, { scale: 1, duration: .45, ease: 'back.out(3)' }, '<');
        tl.fromTo($('.txt', li), { x: -6, opacity: .4 }, { x: 0, opacity: 1, duration: .4 }, '<');
      });
      return tl;
    },
    agent: function(d){
      var steps = $$('.steps li', d), tl = G.timeline();
      resetApprove();
      setOn(steps, false);
      tl.fromTo($('.mail', d), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' });
      G.set($('.draft', d), { opacity: 0, y: 14 });
      steps.forEach(function(s){
        tl.add(function(){ s.classList.add('on'); }, '+=.35');
        tl.fromTo($('.ck', s), { scale: .5 }, { scale: 1, duration: .4, ease: 'back.out(3)' }, '<');
      });
      tl.to($('.draft', d), { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, '+=.2');
      return tl;
    },
    dash: function(d){
      var tl = G.timeline();
      $$('.kpi b', d).forEach(function(b){
        var n = parseFloat(b.getAttribute('data-n')), dec = +(b.getAttribute('data-dec') || 0), pre = b.getAttribute('data-pre') || '', suf = b.getAttribute('data-suf') || '';
        var o = { v: 0 };
        tl.to(o, { v: n, duration: 1.2, ease: 'power2.out', onUpdate: function(){ b.textContent = pre + o.v.toFixed(dec) + suf; } }, 0);
      });
      tl.from($$('tbody tr', d), { x: -10, opacity: 0, stagger: .1, duration: .5, ease: 'power3.out' }, .15);
      tl.from($$('.st', d), { scale: .7, opacity: 0, stagger: .1, duration: .4, ease: 'back.out(2.5)' }, .45);
      return tl;
    },
    care: function(d){
      var tl = G.timeline();
      tl.from($$('.health li', d), { y: 8, opacity: 0, stagger: .09, duration: .45, ease: 'power3.out' }, 0);
      tl.from($$('.bar', d), { scaleY: 0, stagger: .07, duration: .7, ease: 'power3.out' }, .1);
      tl.from($$('.bar b', d), { opacity: 0, stagger: .07, duration: .3 }, .5);
      return tl;
    }
  };
  function playDemo(panel){
    if (!G || reduce) return;
    var d = $('.demo', panel); if (!d) return;
    if (demoTl) demoTl.progress(1).kill();
    demoTl = demos[d.getAttribute('data-demo')](d);
  }
  function selectTab(i, focus){
    tabs.forEach(function(t, k){
      var on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    if (focus) tabs[i].focus();
    if (G && !reduce) G.fromTo(panels[i], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' });
    playDemo(panels[i]);
    if (ST) ST.refresh();
  }
  tabs.forEach(function(t, i){ t.addEventListener('click', function(){ if (t.getAttribute('aria-selected') !== 'true') selectTab(i, false); }); });
  $('.svc-tabs').addEventListener('keydown', function(e){
    var cur = tabs.indexOf(document.activeElement); if (cur < 0) return;
    var n = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (cur + 1) % tabs.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (cur - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = tabs.length - 1;
    if (n !== null) { e.preventDefault(); selectTab(n, true); }
  });
  $$('.mini-replay').forEach(function(b){ b.addEventListener('click', function(){ playDemo(b.closest('.svc-panel')); }); });
  if (G && ST && !reduce) ST.create({ trigger: '.svc', start: 'top 70%', once: true, onEnter: function(){ playDemo(panels[0]); } });

  var approve = $('#approve'), approveNote = $('#approve-note');
  function resetApprove(){ approve.disabled = false; approve.classList.remove('is-ok'); approve.textContent = 'Approve reply'; approveNote.textContent = 'Nothing is sent until a person approves.'; }
  approve.addEventListener('click', function(){
    approve.disabled = true; approve.classList.add('is-ok'); approve.textContent = 'Approved';
    approveNote.textContent = 'Sent at 9:14 AM. Dana gets the list and an upload link.';
    if (G && !reduce) G.fromTo(approve, { scale: .94 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
  });

  /* ---------- a day that runs itself ---------- */
  var dayTabs = $$('.day-tab'), dayPanels = $$('.day-panel');
  var events = $$('li', dayPanels[0]), clock = $('#clock'), meter = $('#meter'), nDone = $('#n-done'), dayEnd = $('#day-end');
  var SPAN = 630, lastMin = -1, syncDay = null;
  function fmtTime(m){
    var t = 7 * 60 + Math.round(m), h = Math.floor(t / 60), mm = t % 60, ap = h >= 12 ? 'PM' : 'AM', hh = h % 12 || 12;
    return hh + ':' + (mm < 10 ? '0' : '') + mm + '<small>' + ap + '</small>';
  }
  function renderDay(m){
    m = Math.max(0, Math.min(SPAN, m));
    var mi = Math.round(m); if (mi === lastMin) return; lastMin = mi;
    clock.innerHTML = fmtTime(mi);
    meter.style.transform = 'scaleX(' + (mi / SPAN) + ')';
    var c = 0;
    events.forEach(function(li){ var on = +li.getAttribute('data-m') <= mi; li.classList.toggle('is-done', on); if (on) c++; });
    nDone.textContent = c;
    if (dayEnd) dayEnd.style.opacity = mi >= SPAN - 2 ? 1 : .0;
  }
  if (G && ST && !reduce) {
    var mm = G.matchMedia();
    mm.add('(min-width: 960px) and (min-height: 700px)', function(){
      var st = { m: 0 }; renderDay(0);
      G.to(st, { m: SPAN, ease: 'none', onUpdate: function(){ renderDay(st.m); },
        scrollTrigger: { trigger: '#day-pin', start: 'top 104px', end: '+=1700', pin: true, scrub: .5, anticipatePin: 1 } });
      return function(){ lastMin = -1; renderDay(SPAN); };
    });
    mm.add('(max-width: 959px), (max-height: 699px)', function(){
      // read the clock off where the rows sit, so it stays right when the industry changes mid-scroll
      syncDay = function(){
        var h = window.innerHeight, m = 0;
        events.forEach(function(li){ if (li.getBoundingClientRect().top <= h * .72) m = +li.getAttribute('data-m'); });
        if (dayEnd.getBoundingClientRect().top <= h * .85) m = SPAN;
        renderDay(m);
      };
      lastMin = -1; syncDay();
      var t = ST.create({ trigger: '#day-pin', start: 'top bottom', end: 'bottom top', onUpdate: syncDay, onRefresh: syncDay });
      return function(){ t.kill(); syncDay = null; lastMin = -1; renderDay(SPAN); };
    });
  }
  function selectDay(i, focus){
    dayTabs.forEach(function(t, k){
      var on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      dayPanels[k].classList.toggle('is-off', !on);
    });
    events = $$('li', dayPanels[i]);
    if (focus) dayTabs[i].focus();
    if (syncDay) { lastMin = -1; syncDay(); }
    else if (lastMin >= 0) { var cur = lastMin; lastMin = -1; renderDay(cur); }
    if (G && !reduce) G.fromTo(dayPanels[i], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .45, ease: 'power3.out', clearProps: 'opacity,transform' });
  }
  dayTabs.forEach(function(t, i){ t.addEventListener('click', function(){ if (t.getAttribute('aria-selected') !== 'true') selectDay(i, false); }); });
  $('.day-tabs').addEventListener('keydown', function(e){
    var cur = dayTabs.indexOf(document.activeElement); if (cur < 0) return;
    var n = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (cur + 1) % dayTabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (cur - 1 + dayTabs.length) % dayTabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = dayTabs.length - 1;
    if (n !== null) { e.preventDefault(); selectDay(n, true); }
  });

  /* ---------- hourly vs retainer race ---------- */
  var H = [
    ['ph-talk','Discovery calls'],['ph-talk','More discovery calls'],['ph-paper','Waiting on a quote'],['ph-paper','Contract and deposit'],
    ['ph-build','Building, nothing live yet'],['ph-build','Building, nothing live yet'],['ph-build','Building, nothing live yet'],['ph-build','First demo, feedback round'],
    ['ph-build','Building, nothing live yet'],['ph-change','Priorities changed. Change order issued'],['ph-build','Reworking for the change order'],['ph-launch','First version launches']
  ];
  var A = ['First automation live','Payments matched to invoices','Inbox agent drafting client replies','Priorities changed. Same fee, document chasing live','Phone agent answering new inquiries',
    'Morning numbers report','Client portal, first version','E-signing added to the portal','Overdue invoice reminders live','Team chatbot on company data','Owner dashboard with live numbers','Still shipping'];
  var hCells = $('#h-cells'), aCells = $('#a-cells'), ticks = $('#ticks');
  for (var w = 1; w <= 12; w++) {
    hCells.appendChild(document.createElement('span')).className = 'cell';
    aCells.appendChild(document.createElement('span')).className = 'cell';
    var tk = document.createElement('span'); tk.textContent = w; ticks.appendChild(tk);
  }
  var hC = $$('.cell', hCells), aC = $$('.cell', aCells), tkC = $$('span', ticks), weekIn = $('#week'), curWeek = 0;
  function renderRace(wk, animate){
    if (wk === curWeek) return; var prev = curWeek; curWeek = wk;
    weekIn.value = wk; weekIn.style.setProperty('--p', ((wk - 1) / 11 * 100) + '%');
    $('#race-week').innerHTML = 'Week ' + wk + ' <span>of 12</span>';
    for (var i = 0; i < 12; i++) {
      var on = i < wk;
      hC[i].className = 'cell' + (on ? ' ' + H[i][0] : '') + (animate && on && i >= prev ? ' f' : '');
      aC[i].className = 'cell' + (on ? ' ship' : '') + (animate && on && i >= prev ? ' f' : '');
      tkC[i].classList.toggle('now', i === wk - 1);
    }
    $('#h-count').textContent = wk >= 12 ? 1 : 0;
    $('#a-count').textContent = wk;
    $('#h-status').innerHTML = '<b>Week ' + wk + ':</b> ' + H[wk - 1][1] + '.';
    $('#a-status').innerHTML = '<b>Week ' + wk + ':</b> ' + A[wk - 1] + '.';
  }
  renderRace(12, false);
  var racePlay = null;
  function stopRace(){ if (racePlay) { racePlay.kill(); racePlay = null; } }
  weekIn.addEventListener('input', function(){ stopRace(); renderRace(+weekIn.value, true); });
  if (G && ST && !reduce) {
    ST.create({ trigger: '.race-board', start: 'top 72%', once: true, onEnter: function(){
      var s = { w: 1 }; curWeek = 0; renderRace(1, true);
      racePlay = G.to(s, { w: 12, duration: 6.5, ease: 'none', delay: .4, onUpdate: function(){ renderRace(Math.max(1, Math.floor(s.w)), true); } });
    }});
  }

  /* ---------- ROI calculator ---------- */
  $('#roi-form').addEventListener('submit', function(e){ e.preventDefault(); });
  var ids = ['r1','r2','r3','r4','r5','r6'], rate = $('#rate'), PLAN = 3500 * 12, SHARE = .6;
  var shown = { cost: 83200, back: 49920 }, roiTw = null;
  function money(n){ return '$' + Math.round(n).toLocaleString('en-US'); }
  function fill(el){ var p = (el.value - el.min) / (el.max - el.min) * 100; el.style.setProperty('--p', p + '%'); }
  function calc(){
    var hrs = 0;
    ids.forEach(function(id){ var el = $('#' + id); hrs += +el.value; $('#o-' + id).textContent = el.value + ' hrs'; fill(el); });
    var r = +rate.value; $('#o-rate').textContent = '$' + r; fill(rate);
    var cost = hrs * r * 52, back = cost * SHARE, time = Math.round(hrs * SHARE), ratio = back / PLAN, be = Math.ceil(PLAN / (r * 52));
    $('#x-hrs').textContent = hrs + (hrs === 1 ? ' hour' : ' hours');
    $('#x-time').textContent = time + ' hrs';
    var v = $('#x-verdict');
    if (hrs === 0) v.innerHTML = 'Move a slider to see what your busywork costs.';
    else if (ratio >= 1) v.innerHTML = 'The Core retainer costs ' + money(PLAN) + ' USD a year. Every $1 returns about <b>$' + ratio.toFixed(2) + '</b>. It pays for itself once AI Weavers wins back ' + be + ' hours a week.';
    else v.innerHTML = 'At these numbers the Core retainer would not pay for itself yet. It needs about <b>' + be + ' hours a week</b> won back. We will tell you that plainly on the call.';
    if (roiTw) roiTw.kill();
    var paint = function(){ $('#x-cost').textContent = money(shown.cost); $('#x-back').textContent = money(shown.back); };
    if (G && !reduce) roiTw = G.to(shown, { cost: cost, back: back, duration: .6, ease: 'power3.out', onUpdate: paint });
    else { shown.cost = cost; shown.back = back; paint(); }
  }
  ids.concat(['rate']).forEach(function(id){ $('#' + id).addEventListener('input', calc); });
  calc();

  /* ---------- process line ---------- */
  if (G && ST && !reduce) {
    G.fromTo('#proc-fill', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.proc', start: 'top 82%', end: 'top 30%', scrub: .6 } });
  }

  /* ---------- FAQ ---------- */
  $$('.qa-q').forEach(function(q){
    var a = document.getElementById(q.getAttribute('aria-controls'));
    q.addEventListener('click', function(){
      var open = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!open));
      if (!G || reduce) { a.hidden = open; return; }
      if (open) {
        G.to(a, { height: 0, duration: .45, ease: 'power3.inOut', onComplete: function(){ a.hidden = true; G.set(a, { clearProps: 'height' }); if (ST) ST.refresh(); } });
      } else {
        a.hidden = false;
        G.fromTo(a, { height: 0 }, { height: 'auto', duration: .55, ease: 'power3.out', onComplete: function(){ G.set(a, { clearProps: 'height' }); if (ST) ST.refresh(); } });
        G.fromTo($('p', a), { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: .5, delay: .08, ease: 'power3.out' });
      }
    });
  });

  /* ---------- form ---------- */
  var form = $('#lead'), done = $('#done');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var email = $('#f-email'), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    email.closest('.field').classList.toggle('bad', !ok);
    $('#f-email-err').hidden = ok;
    email.setAttribute('aria-invalid', String(!ok));
    if (!ok) { email.focus(); return; }
    var name = $('#f-name').value.trim().split(' ')[0];
    $('#done-h').textContent = name ? 'Thanks, ' + name + '. Request received.' : 'Request received.';
    $('#done-p').textContent = 'We will email ' + email.value.trim() + ' within one business day with times for your Weave Session.';
    form.hidden = true; done.hidden = false; done.focus();
    if (G && !reduce) {
      G.from(done.children, { y: 16, opacity: 0, stagger: .08, duration: .6, ease: 'power3.out' });
      G.from($('.ck', done), { scale: .3, rotate: -40, duration: .7, ease: 'back.out(2.4)' });
    }
    if (ST) ST.refresh();
  });

  /* ---------- copy email ---------- */
  var copyBtn = $('#copy-mail');
  copyBtn.addEventListener('click', function(){
    var txt = $('#mail').textContent;
    var flash = function(m){ copyBtn.textContent = m; setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1600); };
    var selectIt = function(){ var r = document.createRange(); r.selectNodeContents($('#mail')); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); flash('Selected'); };
    try { navigator.clipboard.writeText(txt).then(function(){ flash('Copied'); }, selectIt); } catch (e) { selectIt(); }
  });

  /* ---------- footer mark ---------- */
  if (G && ST && !reduce) {
    G.fromTo('#fwipe-r', { attr: { width: 0 } }, { attr: { width: 280 }, duration: 1.4, ease: 'power3.inOut',
      scrollTrigger: { trigger: '.f-mark', start: 'top 92%', toggleActions: 'play none none reverse' } });
    G.from('.f-mark svg', { yPercent: 18, opacity: .4, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.f-mark', start: 'top 95%', toggleActions: 'play none none reverse' } });
  }

  if (ST) {
    if (document.readyState === 'complete') ST.refresh();
    else window.addEventListener('load', function(){ ST.refresh(); });
  }
}
