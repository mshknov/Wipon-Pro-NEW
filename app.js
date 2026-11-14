(function(){
  // ---- срок ----
  var DAYS_LEFT = 234, TOTAL = 365; // активный клиент: осталось дней / длительность периода
  var active = true;
  var until = new Date(); until.setDate(until.getDate() + DAYS_LEFT);
  function fmt(d){ return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear(); }
  var used = Math.round((1 - DAYS_LEFT/TOTAL)*100);
  var bar = document.querySelector('[role=progressbar]'); bar.setAttribute('aria-valuenow', used);

  // ---- лицевой счёт и баланс (демо-значения — подставьте данные из системы) ----
  var ACCOUNT = '30156705';
  function switchPlan(){
    plan = pending; pending = null;
    TOTAL = (plan === 'plus' || plan === 'auto') ? 30 : 365; DAYS_LEFT = TOTAL;
    document.getElementById('daysLeft').textContent = DAYS_LEFT;
    document.getElementById('barFill').style.width = '0%';
    bar.setAttribute('aria-valuenow', 0);
    renderPlan(); renderBalance();
  }
  function activate(){
    active = true; plan = pending || plan; pending = null;
    TOTAL = (plan === 'plus' || plan === 'auto') ? 30 : 365; DAYS_LEFT = TOTAL;
    var st = document.getElementById('statusText'); st.textContent = 'Прибор активен'; st.classList.remove('off');
    document.getElementById('noSubNote').hidden = true;
    document.getElementById('termBlock').hidden = false;
    document.getElementById('daysLeft').textContent = DAYS_LEFT;
    document.getElementById('barFill').style.width = '0%';
    bar.setAttribute('aria-valuenow', 0);
    var mb = document.getElementById('mainBtn'); mb.textContent = 'Продлить подписку'; mb.setAttribute('data-sheet','renew');
    renderPlan(); renderBalance();
  }
  var balance = 0;           // текущий баланс, ₸
  var TARIFF = 12000;        // стоимость текущей подписки, ₸
  var PLANS = [
    { id:'pro',  name:'Wipon PRO',      price:'12 000 ₸ / год', amount:12000,
      desc:'Только проверка акцизных марок',
      feats:['Проверка акцизных марок'] },
    { id:'plus', name:'Wipon PRO Plus', price:'3 450 ₸ / мес', amount:3450,
      desc:'Всё из Wipon PRO, плюс:',
      feats:['Маркировка','Касса и ОФД','НКТ','Интеграция с банковскими терминалами'] },
    { id:'auto', name:'Wipon Auto', price:'15 000 ₸ / мес', amount:15000,
      desc:'Всё из Wipon PRO Plus, плюс:',
      feats:['Списание маркированных товаров','Интеграция с ISMET','Касса и ОФД','Учёт товаров'] }
  ];
  // Описание функций, которое открывается по нажатию в карточке подписки.
  var FEATURES = {
    'Проверка акцизных марок': { text:'Сканируйте акцизную марку камерой телефона или введите её номер вручную — приложение покажет результат проверки.' },
    'Маркировка': { text:'Приёмка маркированного товара по кодам маркировки прямо с телефона. Все принятые позиции сохраняются в разделе «Принятые маркированные товары».' },
    'Касса и ОФД': { text:'Продажи проходят через кассу, а чеки передаются оператору фискальных данных (ОФД), как это требуется для онлайн-касс.' },
    'НКТ': { text:'Работа с Национальным каталогом товаров: карточки товаров заполняются данными из каталога, без ручного ввода.' },
    'Интеграция с банковскими терминалами': { text:'Сумма продажи передаётся на банковский терминал автоматически — кассиру не нужно вводить её вручную.' },
    'Списание маркированных товаров': { text:'Вывод кодов маркировки из оборота при продаже или списании товара — прямо из приложения.' },
    'Интеграция с ISMET': { text:'Обмен данными с информационной системой маркировки ISMET — без ручной работы в личном кабинете.' },
    'Учёт товаров': { text:'Остатки, приход и расход товаров в одном месте, чтобы всегда знать, что есть в наличии.' }
  };
  var curFeat = null, pickPlan = null;
  function hasMarking(){ return plan === 'plus' || plan === 'auto'; }
  var plan = 'pro';  // текущая подписка клиента
  function curPlan(){ return PLANS.filter(function(p){ return p.id===plan; })[0] || null; }
  var pending = null; // выбранная, но ещё не оплаченная подписка
  function shownPlan(){ var id = active ? plan : (pending || plan); return PLANS.filter(function(p){ return p.id===id; })[0] || null; }
  function renderPlan(){
    var p = shownPlan();
    var nm = document.getElementById('planName'), pr = document.getElementById('planPrice');
    nm.textContent = p ? p.name : 'Не выбрана';
    nm.classList.toggle('dim', !p);
    if(!p){ pr.textContent = 'Оформите подписку'; pr.className = 'plan-price'; }
    else if(!active){ pr.textContent = p.price + ' · не активна'; pr.className = 'plan-price inactive'; }
    else { pr.textContent = p.price; pr.className = 'plan-price'; }
    if(p && p.amount) TARIFF = p.amount;
    document.body.classList.toggle('has-pro', !!plan);
    document.body.classList.toggle('has-plus', hasMarking());
  }
  function money(n){ return n.toLocaleString('ru-RU').replace(/,/g,' ') + ' ₸'; }
  function renderBalance(){
    var el = document.getElementById('balance');
    el.textContent = money(balance);
    el.classList.toggle('low', !!plan && balance < TARIFF);
    document.getElementById('balHint').textContent = '';
  }
  document.getElementById('acctNum').textContent = ACCOUNT;
  renderPlan();
  document.getElementById('daysLeft').textContent = DAYS_LEFT;
  requestAnimationFrame(function(){ document.getElementById('barFill').style.width = used + '%'; });
  renderBalance();
  document.getElementById('copyAcct').addEventListener('click', function(){
    try {
      navigator.clipboard.writeText(ACCOUNT).then(function(){ toast('Номер лицевого счёта скопирован'); }, function(){ toast('Не удалось скопировать — выделите номер вручную'); });
    } catch(e){ toast('Не удалось скопировать — выделите номер вручную'); }
  });

  // ---- автопродление показывается только при оплате картой ----
  function syncAuto(){ document.getElementById('autoRow').hidden = method !== CARD; }

  // ---- toast ----
  var toastEl = document.getElementById('toast'), tt;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(function(){ toastEl.classList.remove('show'); }, 2400); }

  // ---- автопродление ----
  var sw = document.getElementById('autoSwitch');
  sw.addEventListener('click', function(){
    var on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', on);
    toast(on ? 'Автопродление включено' : 'Автопродление выключено');
  });

  // ---- FAQ ----
  var faq = [
    ['Что такое WIPON PRO?', 'Приложение для проверки акцизных марок и приёмки маркированного товара прямо со смартфона — без отдельного сканера.'],
    ['Как проверить акцизную марку?', 'Откройте «Сканировать акцизную марку» и наведите камеру на марку. Результат проверки появится на экране через пару секунд.'],
    ['Марка не сканируется. Что делать?', 'Используйте «Проверка вручную» и введите номер марки с клавиатуры. Также проверьте освещение и чистоту камеры.'],
    ['Что делать, если марка не прошла проверку?', 'Не принимайте и не продавайте такой товар. Сохраните результат проверки и свяжитесь с поставщиком.'],
    ['Как принять маркированный товар?', 'Откройте «Приемка маркированного товара» и отсканируйте коды маркировки на упаковке. Принятые позиции сохранятся в приложении.'],
    ['Где посмотреть принятый товар?', 'В разделе «Принятые маркированные товары» — там список всех позиций, которые вы приняли.'],
    ['Сколько стоит подписка?', 'Wipon PRO — 12 000 ₸ в год, только сканирование акцизных марок. Wipon PRO Plus — 3 450 ₸ в месяц, дополнительно включает маркировку, кассу с ОФД, НКТ и интеграцию с банковскими терминалами. Wipon Auto — 15 000 ₸ в месяц, включает всё из Wipon PRO Plus, а также списание маркированных товаров, интеграцию с ISMET, кассу с ОФД и учёт товаров. Выбрать подписку можно в разделе «Подписка и оплата».'],
    ['Как продлить подписку?', 'Нажмите «Продлить подписку» в разделе «Подписка и оплата» и выберите способ оплаты. Чтобы не следить за сроком, включите автопродление.'],
    ['Можно ли оплатить по счёту на ТОО или ИП?', 'Да. В разделе «Подписка и оплата» выберите «Счёт на оплату для ТОО / ИП» и укажите реквизиты компании.'],
    ['Можно ли подключить кассу с НКТ?', 'Да. Нажмите «Оставить заявку» в синем баннере — специалист свяжется с вами и поможет подключить кассу с маркировкой и акцизкой.']
  ];
  var list = document.getElementById('faqList');
  faq.forEach(function(f, i){
    var wrap = document.createElement('div');
    var b = document.createElement('button');
    b.className = 'q'; b.setAttribute('aria-expanded','false'); b.setAttribute('aria-controls','ans'+i);
    b.innerHTML = '<span class="num">'+(i+1)+'</span><span class="qt"></span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    b.querySelector('.qt').textContent = f[0];
    var c = document.createElement('div'); c.className = 'collapse'; c.id = 'ans'+i;
    var inner = document.createElement('div'); var a = document.createElement('div'); a.className = 'a'; a.textContent = f[1];
    inner.appendChild(a); c.appendChild(inner);
    b.addEventListener('click', function(){
      var open = b.getAttribute('aria-expanded') !== 'true';
      list.querySelectorAll('.q').forEach(function(x){ x.setAttribute('aria-expanded','false'); });
      list.querySelectorAll('.collapse').forEach(function(x){ x.classList.remove('open'); });
      if(open){ b.setAttribute('aria-expanded','true'); c.classList.add('open'); }
    });
    wrap.appendChild(b); wrap.appendChild(c); list.appendChild(wrap);
  });
  var ft = document.getElementById('faqToggle'), fb = document.getElementById('faqBody'), fh = document.getElementById('faqHint');
  ft.addEventListener('click', function(){
    var open = ft.getAttribute('aria-expanded') !== 'true';
    ft.setAttribute('aria-expanded', open);
    fb.classList.toggle('open', open);
    fh.textContent = open ? 'Нажмите на вопрос, чтобы увидеть ответ' : 'Нажмите, чтобы открыть список';
    if(!open){
      list.querySelectorAll('.q').forEach(function(x){ x.setAttribute('aria-expanded','false'); });
      list.querySelectorAll('.collapse').forEach(function(x){ x.classList.remove('open'); });
    }
  });

  // ---- кнопка ГИД в шапке: открывает раздел «Wipon Pro ГИД» ----
  document.getElementById('guideBtn').addEventListener('click', function(){
    var wasOpen = ft.getAttribute('aria-expanded') === 'true';
    if(!wasOpen) ft.click();
    setTimeout(function(){ ft.scrollIntoView({ behavior:'smooth', block:'start' }); ft.focus({ preventScroll:true }); }, wasOpen ? 0 : 300);
  });

  // ---- bottom sheets ----
  var method = 'Kaspi';
  var methods = ['Kaspi', 'Банковская карта', 'Счёт для ТОО / ИП'];
  var overlay = document.getElementById('overlay'), sheet = document.getElementById('sheet'), lastFocus;

  var CARD = 'Банковская карта';
  syncAuto();
  var savedCard = null;   // сохранённая карта: только последние 4 цифры, срок и имя (номер целиком и CVV не хранятся)
  var newCard = false;    // клиент выбрал «Другая карта»
  function methodOpts(){
    var opts = methods.map(function(m){
      var label = (m === CARD && savedCard) ? 'Карта •••• ' + savedCard.last4 : m;
      return '<button type="button" class="opt" role="radio" data-m="'+m+'" aria-checked="'+(m===method)+'"><span class="dot"></span>'+label+'</button>';
    }).join('');
    var showSaved = savedCard && !newCard;
    var saved = savedCard
      ? '<div class="saved-card" id="savedCard"'+(showSaved?'':' hidden')+'>'
        + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>'
        + '<span style="flex:1;min-width:0"><span class="sc-n">•••• '+savedCard.last4+'</span><span class="sc-d">'+savedCard.holder+' · '+savedCard.exp+'</span></span>'
        + '<button type="button" class="sc-del" data-act="delCard">Удалить</button>'
        + '</div>'
        + '<button type="button" class="link-btn" data-act="newCard"'+(showSaved?'':' hidden')+'>+ Другая карта</button>'
      : '';
    var fields = '<div class="card-fields" id="cardFields"'+(showSaved?' hidden':'')+'>'
      + '<div class="demo-note">Демо-макет: данные карты никуда не отправляются. Карта сохраняется только на этой странице до перезагрузки.</div>'
      + '<div class="field"><label for="f-card">Номер карты</label><input id="f-card" inputmode="numeric" autocomplete="off" maxlength="19" placeholder="0000 0000 0000 0000"></div>'
      + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">'
      + '<div class="field"><label for="f-exp">Срок действия</label><input id="f-exp" inputmode="numeric" autocomplete="off" maxlength="5" placeholder="ММ/ГГ"></div>'
      + '<div class="field"><label for="f-cvv">CVV</label><input id="f-cvv" type="password" inputmode="numeric" autocomplete="off" maxlength="3" placeholder="•••"></div>'
      + '</div>'
      + '<div class="field"><label for="f-holder">Имя на карте</label><input id="f-holder" autocomplete="off" placeholder="IVAN IVANOV" style="text-transform:uppercase"></div>'
      + '<span class="sc-hint">Карта сохранится для следующих оплат. Удалить её можно в любой момент.</span>'
      + '<span class="err" id="cardErr" role="alert"></span>'
      + '</div>';
    return opts + '<div id="cardBlock"'+(method===CARD?'':' hidden')+'>' + saved + fields + '</div>';
  }
  function renderMethod(){
    document.getElementById('methodVal').textContent = (method === CARD && savedCard) ? 'Карта •••• ' + savedCard.last4 : method;
    syncAuto();
  }
  function cardValid(){
    var n = (document.getElementById('f-card').value||'').replace(/\D/g,'');
    var ex = document.getElementById('f-exp').value||'';
    var cv = (document.getElementById('f-cvv').value||'').replace(/\D/g,'');
    var h = (document.getElementById('f-holder').value||'').trim();
    var mm = parseInt(ex.slice(0,2),10);
    if(n.length !== 16) return 'Введите 16 цифр номера карты';
    if(!/^\d{2}\/\d{2}$/.test(ex) || mm < 1 || mm > 12) return 'Введите срок в формате ММ/ГГ';
    if(cv.length !== 3) return 'Введите 3 цифры CVV';
    if(!h) return 'Введите имя на карте';
    return '';
  }
  var sheets = {
    plans: function(){
      var check = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
      var info = '<svg class="pfi-i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
      var sel = pickPlan || pending || plan || 'pro';
      return '<h3 id="sheetTitle">Выберите подписку</h3><p>'+(active?'Сменить можно в любой момент.':'Выберите тариф, затем оплату.')+'</p><div role="radiogroup" aria-label="Подписка">'
        + PLANS.map(function(p){
            return '<div class="plan-opt" aria-checked="'+(p.id===sel)+'">'
              + '<button type="button" class="plan-pick" role="radio" data-plan="'+p.id+'" aria-checked="'+(p.id===sel)+'">'
              + '<span class="ph"><span class="dot"></span><span class="pn">'+p.name+(active && p.id===plan?'<span class="plan-tag">Текущая</span>':'')+'</span><span class="pp">'+p.price+'</span></span>'
              + '<span class="pd" style="display:block">'+p.desc+'</span>'
              + '</button>'
              + (p.feats && p.id===sel ? '<div class="pf">'+p.feats.map(function(f){ return '<button type="button" class="pfi" data-feat="'+f+'" aria-label="'+f+': описание">'+check+'<span class="pfi-t">'+f+'</span>'+info+'</button>'; }).join('')+'</div>' : '')
              + '</div>';
          }).join('')
        + '</div><button class="primary" data-act="savePlan">'+(active?'Выбрать':'Продолжить')+'</button><button class="close" data-act="close">Отмена</button>';
    },
    feature: function(){
      var f = FEATURES[curFeat] || { text:'[ОПИСАНИЕ]' };
      return '<button type="button" class="back-link" data-act="backPlans"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>К подпискам</button>'
        + '<h3 id="sheetTitle">'+curFeat+'</h3>' + '<p style="margin-top:8px;color:#3C3C43;font-size:16px">'+f.text+'</p>'
        + '<button class="close" data-act="backPlans">Понятно</button>';
    },
    renew: function(){ var sw = active && pending && pending !== plan; var p = sw ? PLANS.filter(function(x){ return x.id===pending; })[0] : (shownPlan() || PLANS[0]); return '<h3 id="sheetTitle">'+(sw?'Смена подписки на ':(active?'Продление ':'Оформление '))+p.name+'</h3><p>'+p.price+(sw?'. Новая подписка начнёт действовать сразу после оплаты вместо '+curPlan().name+'.':(active?'. Новый срок добавится к оставшимся дням.':'. Подписка начнёт действовать сразу после оплаты.'))+'</p>'+(active?'<div class="cur-plan"><span style="flex:1;min-width:0"><span class="cp-k">Подписка</span><span class="cp-v">'+p.name+'</span><span class="cp-p">'+p.price+'</span></span><button type="button" class="mini" data-act="change">Сменить подписку</button></div>':'')+'<div role="radiogroup" aria-label="Способ оплаты">'+methodOpts()+'</div><button class="primary" data-act="pay">'+(active && !sw?'Перейти к оплате':'Оплатить')+'</button><button class="close" data-act="close">Отмена</button>'; },
    method: function(){ return '<h3 id="sheetTitle">Способ оплаты</h3><p>Выберите, как оплачивать подписку.</p><div role="radiogroup" aria-label="Способ оплаты">'+methodOpts()+'</div><button class="primary" data-act="saveMethod">Сохранить</button><button class="close" data-act="close">Отмена</button>'; },
    topup: function(){ return '<h3 id="sheetTitle">Пополнить баланс</h3><p>Лицевой счёт: '+ACCOUNT+'<br>Текущий баланс: '+money(balance)+'</p><form id="topForm"><div class="chips"><button type="button" class="chip" data-amt="'+TARIFF+'">'+money(TARIFF)+'</button><button type="button" class="chip" data-amt="'+Math.max(TARIFF-balance,0)+'">Не хватает: '+money(Math.max(TARIFF-balance,0))+'</button><button type="button" class="chip" data-amt="20000">20 000 ₸</button></div><div class="field"><label for="f-amt">Сумма, ₸</label><input id="f-amt" inputmode="numeric" required placeholder="Введите сумму"></div><div role="radiogroup" aria-label="Способ оплаты">'+methodOpts()+'</div><button class="primary" type="submit">Пополнить</button></form><button class="close" data-act="close">Отмена</button>'; },
    history: function(){ return '<h3 id="sheetTitle">История платежей</h3><p>Здесь появятся ваши оплаты подписки.</p><div class="empty">[СПИСОК ПЛАТЕЖЕЙ ИЗ СИСТЕМЫ]</div><button class="close" data-act="close">Закрыть</button>'; },
    invoice: function(){ return '<h3 id="sheetTitle">Счёт для ТОО / ИП</h3><p>Укажите, куда отправить счёт.</p><form id="invForm"><div class="field"><label for="f-mail">E-mail</label><input id="f-mail" type="email" required autocomplete="email" placeholder="buh@company.kz"></div><div class="field"><label for="f-wa">WhatsApp</label><input id="f-wa" type="tel" required autocomplete="tel" inputmode="tel" placeholder="+7 ___ ___ __ __"></div><button class="primary" type="submit">Запросить счёт</button></form><button class="close" data-act="close">Отмена</button>'; },
    manual: function(){ return '<h3 id="sheetTitle">Проверка вручную</h3><p>Введите номер акцизной марки.</p><form id="manForm"><div class="field"><label for="f-num">Номер марки</label><input id="f-num" required placeholder="Например, 0123456789"></div><button class="primary" type="submit">Проверить</button></form><button class="close" data-act="close">Отмена</button>'; },
    accepted: function(){ return '<h3 id="sheetTitle">Принятые маркированные товары</h3><p>Список принятых позиций.</p><div class="empty">[СПИСОК ТОВАРОВ ИЗ СИСТЕМЫ]</div><button class="close" data-act="close">Закрыть</button>'; },
    support: function(){ return '<h3 id="sheetTitle">Поддержка WIPON</h3><p>Опишите вопрос — мы ответим в приложении.</p><form id="supForm"><div class="field"><label for="f-q">Ваш вопрос</label><input id="f-q" required placeholder="Коротко о проблеме"></div><button class="primary" type="submit">Отправить</button></form><button class="close" data-act="close">Отмена</button>'; },
    lead: function(){ return '<h3 id="sheetTitle">Заявка на подключение кассы</h3><p>Касса с НКТ, маркировкой и акцизкой. Мы перезвоним.</p><form id="leadForm"><div class="field"><label for="f-n">Имя</label><input id="f-n" required></div><div class="field"><label for="f-p">Телефон</label><input id="f-p" type="tel" required placeholder="+7 ___ ___ __ __"></div><button class="primary" type="submit">Оставить заявку</button></form><button class="close" data-act="close">Отмена</button>'; },
    info: function(){ return '<h3 id="sheetTitle">О приборе</h3><p>'+(active?(curPlan().name+' активна. Осталось '+DAYS_LEFT+' дней.'):'Подписка не оформлена. Выберите Wipon PRO или Wipon PRO Plus в разделе «Подписка и оплата».')+'</p><button class="close" data-act="close">Закрыть</button>'; }
  };
  var done = { invForm:'Запрос счёта принят (демо)', manForm:'Проверка отправлена (демо)', supForm:'Сообщение отправлено (демо)', leadForm:'Заявка принята (демо)' };

  function openSheet(name){
    if(name !== 'feature') newCard = false;
    lastFocus = document.activeElement;
    sheet.innerHTML = '<div class="grab"></div>' + sheets[name]();
    overlay.classList.add('show');
    var f = sheet.querySelector('button, input'); if(f) f.focus();
  }
  function closeSheet(){ overlay.classList.remove('show'); if(lastFocus) lastFocus.focus(); }

  document.addEventListener('click', function(e){
    if(e.target.closest('#mainBtn') && active) pending = null;
    var lk = e.target.closest('.item[data-need]');
    if(lk){ var need = lk.getAttribute('data-need'); var ok = need === 'pro' ? !!plan : hasMarking();
      if(!ok){ toast(need === 'plus' ? 'Доступно в Wipon PRO Plus и Wipon Auto' : 'Доступно по подписке'); openSheet('plans'); return; } }
    var s = e.target.closest('[data-sheet]'); if(s){ openSheet(s.getAttribute('data-sheet')); return; }
    var t = e.target.closest('[data-toast]'); if(t){ toast(t.getAttribute('data-toast') + ' (демо)'); }
  });
  overlay.addEventListener('click', function(e){
    if(e.target === overlay){ closeSheet(); return; }
    var ch = e.target.closest('.chip');
    if(ch){ document.getElementById('f-amt').value = ch.getAttribute('data-amt'); return; }
    var fb = e.target.closest('[data-feat]');
    if(fb){ curFeat = fb.getAttribute('data-feat'); sheet.innerHTML = '<div class="grab"></div>' + sheets.feature(); sheet.scrollTop = 0; var bk = sheet.querySelector('.back-link'); if(bk) bk.focus(); return; }
    var po = e.target.closest('.plan-pick');
    if(po){ pickPlan = po.getAttribute('data-plan'); var st = sheet.scrollTop;
      sheet.innerHTML = '<div class="grab"></div>' + sheets.plans(); sheet.scrollTop = st;
      var np2 = sheet.querySelector('.plan-pick[data-plan="'+pickPlan+'"]'); if(np2) np2.focus(); return; }
    var o = e.target.closest('.opt');
    if(o){
      sheet.querySelectorAll('.opt').forEach(function(x){ x.setAttribute('aria-checked', x===o); });
      sheet.dataset.pick = o.getAttribute('data-m');
      var cf = document.getElementById('cardFields');
      var cb = document.getElementById('cardBlock');
      if(cb){ cb.hidden = sheet.dataset.pick !== CARD; var fc = document.getElementById('cardFields'); if(!cb.hidden && fc && !fc.hidden) document.getElementById('f-card').focus(); }
      return;
    }
    var a = e.target.closest('[data-act]'); if(!a) return;
    var act = a.getAttribute('data-act');
    if(act === 'delCard'){
      var l4 = savedCard ? savedCard.last4 : ''; savedCard = null; newCard = false;
      var wasCard = method === CARD; if(wasCard) method = 'Kaspi';
      renderMethod();
      var keep = sheet.dataset.pick === CARD ? CARD : null;
      var html = sheet.innerHTML.indexOf('id="cardBlock"') >= 0;
      if(html){ var cb2 = document.getElementById('cardBlock'); var sc = document.getElementById('savedCard'); if(sc) sc.remove(); var nb = cb2.querySelector('[data-act=newCard]'); if(nb) nb.remove(); document.getElementById('cardFields').hidden = false;
        sheet.querySelectorAll('.opt[data-m="'+CARD+'"]').forEach(function(x){ x.lastChild.textContent = CARD; }); }
      toast('Карта •••• ' + l4 + ' удалена' + (wasCard ? '. Способ оплаты: Kaspi' : ''));
      return;
    }
    if(act === 'newCard'){ newCard = true; document.getElementById('savedCard').hidden = true; a.hidden = true; document.getElementById('cardFields').hidden = false; document.getElementById('f-card').focus(); return; }
    if(act === 'backPlans'){ sheet.innerHTML = '<div class="grab"></div>' + sheets.plans(); return; }
    if(act === 'change'){ pending = null; closeSheet(); openSheet('plans'); return; }
    if(act === 'close'){ pickPlan = null; }
    if(act === 'close'){ if(active) pending = null; closeSheet(); }
    if(act === 'savePlan'){
      var np = pickPlan || pending || plan || 'pro'; pickPlan = null;
      if(!active){ pending = np; renderPlan(); closeSheet(); openSheet('renew'); return; }
      if(np === plan){ closeSheet(); toast('Подписка ' + curPlan().name + ' уже активна'); return; }
      pending = np; closeSheet(); openSheet('renew');
    }
    if(act === 'saveMethod' || act === 'pay'){
      var chosen = sheet.dataset.pick || method;
      var cfs = document.getElementById('cardFields');
      if(chosen === CARD && cfs && !cfs.hidden){
        var err = cardValid();
        document.getElementById('cardErr').textContent = err;
        if(err) return;
        var num = document.getElementById('f-card').value.replace(/\D/g,'');
        savedCard = { last4: num.slice(-4), exp: document.getElementById('f-exp').value, holder: document.getElementById('f-holder').value.trim().toUpperCase() };
        newCard = false;
        toast('Карта •••• ' + savedCard.last4 + ' сохранена');
      }
      method = chosen; renderMethod();
      delete sheet.dataset.pick; closeSheet(); sheet.innerHTML = '';
      if(act === 'pay' && active && pending && pending !== plan){ switchPlan(); toast('Подписка изменена на ' + curPlan().name + ' (демо)'); return; }
      if(act === 'pay' && !active){ activate(); toast('Подписка ' + curPlan().name + ' оформлена (демо)'); return; }
      toast(act === 'pay' ? 'Переход к оплате: ' + method + ' (демо)' : 'Способ оплаты: ' + method);
    }
  });
  overlay.addEventListener('submit', function(e){
    e.preventDefault(); var id = e.target.id;
    if(id === 'topForm'){
      var amt = parseInt(String(document.getElementById('f-amt').value).replace(/\D/g,''), 10);
      if(!amt || amt <= 0){ toast('Введите сумму больше нуля'); return; }
      if(sheet.dataset.pick){ method = sheet.dataset.pick; renderMethod(); delete sheet.dataset.pick; }
      balance += amt; renderBalance(); closeSheet();
      toast('Баланс пополнен на ' + money(amt) + ' через ' + method + ' (демо)');
      return;
    }
    closeSheet(); toast(done[id] || 'Готово');
  });
  overlay.addEventListener('input', function(e){
    var t = e.target, d;
    if(t.id === 'f-card'){ d = t.value.replace(/\D/g,'').slice(0,16); t.value = d.replace(/(\d{4})(?=\d)/g,'$1 '); }
    if(t.id === 'f-exp'){ d = t.value.replace(/\D/g,'').slice(0,4); t.value = d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d; }
    if(t.id === 'f-cvv'){ t.value = t.value.replace(/\D/g,'').slice(0,3); }
    var ce = document.getElementById('cardErr'); if(ce && /^f-(card|exp|cvv|holder)$/.test(t.id)) ce.textContent = '';
  });
  overlay.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeSheet(); });
})();
