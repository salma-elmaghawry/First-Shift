/* FirstShift demo: landing <-> 5-step flow (task, submit, defend, report, review).
   No framework. Content for the defense lives in DEFENSE; rewards in LEVELS, BADGES, SKILLS.
   Rule: XP rewards effort and honesty. It never feeds the evidence report. */
(function () {
  "use strict";

  var STEPS = ["task", "submit", "defend", "report", "review"];
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function icon(id, cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", cls || "fs-icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function setHash(token) {
    try { history.replaceState(null, "", token ? "#" + token : location.pathname + location.search); } catch (e) { /* sandboxed */ }
  }

  var site = $("#site");
  var app = $("#app");
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage blocked: the demo works without it */ }
    return null;
  }

  /* ================= Progress: XP, levels, badges, skills ================= */
  var LEVELS = [
    { n: 1, name: "First shift", at: 0 },
    { n: 2, name: "Regular", at: 300 },
    { n: 3, name: "Shift lead", at: 800 },
    { n: 4, name: "On call", at: 1500 }
  ];

  var BADGES = [
    { id: "clocked-in", name: "Clocked in", how: "Open your first task", icon: "i-pending" },
    { id: "shipped", name: "Shipped it", how: "Submit your work", icon: "i-upload" },
    { id: "owned-ai", name: "Owned your AI", how: "Say what AI did and what you checked", icon: "i-prompt" },
    { id: "held-line", name: "Held the line", how: "Answer all three defense questions", icon: "i-shield" },
    { id: "honest", name: "Honest unknown", how: "Say you’re not sure, then reason out loud", icon: "i-chat" },
    { id: "gap-hunter", name: "Gap hunter", how: "Turn a gap into your next quest", icon: "i-target" },
    { id: "pro-review", name: "Booked a pro", how: "Book a human review", icon: "i-user" }
  ];

  var TRACK = [
    { id: "FS-101", name: "Redirect isn’t payment" },
    { id: "FS-102", name: "Duplicate webhooks" },
    { id: "FS-103", name: "Safe refunds" },
    { id: "FS-104", name: "Saved cards" }
  ];

  var SKILLS = [
    { name: "State reasoning", stripes: 1 },
    { name: "Server-side verification", stripes: 1 },
    { name: "Payment UI states", stripes: 1 },
    { name: "Test planning", stripes: 1 },
    { name: "Idempotency", stripes: 0, quest: "Quest unlocked: FS-102 · Duplicate webhooks" }
  ];

  var progress = { xp: 0, done: {}, badges: {}, log: [], skillsShown: false };

  function levelFor(xp) {
    var lvl = LEVELS[0];
    LEVELS.forEach(function (l) { if (xp >= l.at) lvl = l; });
    return lvl;
  }
  function nextLevel(lvl) { return LEVELS[lvl.n] || null; }
  function levelPct(xp) {
    var lvl = levelFor(xp), nx = nextLevel(lvl);
    return nx ? Math.round(((xp - lvl.at) / (nx.at - lvl.at)) * 100) : 100;
  }
  function badgeCount() { return Object.keys(progress.badges).length; }
  function fill(node, pct) { if (node) node.style.setProperty("--xp", pct + "%"); }

  function badgeNode(b, opts) {
    opts = opts || {};
    var earned = !!progress.badges[b.id];
    var wrap = el("div", "fs-badge" + (opts.sm ? " fs-badge--sm" : "") + (earned ? "" : " fs-badge--locked") + (opts.isNew ? " fs-badge--new" : ""));
    var patch = el("span", "fs-badge__patch");
    patch.appendChild(icon(earned ? b.icon : "i-lock"));
    wrap.appendChild(patch);
    if (!opts.sm) {
      wrap.appendChild(el("span", "fs-badge__name", b.name));
      wrap.appendChild(el("span", "fs-badge__how", earned ? "Earned" : b.how));
    } else {
      wrap.title = b.name;
    }
    return wrap;
  }

  function renderSkills() {
    var box = $("#skills");
    box.textContent = "";
    if (!progress.skillsShown) {
      box.appendChild(el("p", "type-body-sm muted", "Your first stripes arrive with your evidence report."));
    }
    SKILLS.forEach(function (s) {
      var n = progress.skillsShown ? s.stripes : 0;
      var row = el("div", "fs-skill");
      row.appendChild(el("span", "fs-skill__name", s.name));
      var stripes = el("span", "fs-stripes");
      stripes.setAttribute("role", "img");
      stripes.setAttribute("aria-label", n + " of 3 stripes");
      for (var i = 0; i < 3; i++) stripes.appendChild(el("i", i < n ? "on" : null));
      row.appendChild(stripes);
      if (progress.skillsShown && s.quest) row.appendChild(el("span", "fs-skill__note fs-skill__note--quest", s.quest));
      box.appendChild(row);
    });
  }

  function trackState(i) {
    if (i === 0) return progress.done.held ? "done" : "current";
    if (i === 1) return progress.done.gap ? "current" : "locked";
    return "locked";
  }

  function renderPath() {
    var box = $("#path");
    box.textContent = "";
    var done = 0;
    TRACK.forEach(function (t, i) {
      var state = trackState(i);
      if (state === "done") done += 1;
      var li = el("li", "fs-path__step");
      li.dataset.state = state;
      var node = el("span", "fs-path__node");
      node.appendChild(icon(state === "done" ? "i-check" : state === "current" ? "i-flag" : "i-lock"));
      li.appendChild(node);
      li.appendChild(el("span", "fs-path__id", t.id));
      li.appendChild(el("span", "fs-path__name", t.name));
      box.appendChild(li);
    });
    $("#locker-track").textContent = done + " of " + TRACK.length + " shifts";
  }

  /* The HUD number counts up instead of jumping: you see the XP arrive. */
  var shownXp = 0;
  var countTimer = null;
  function countXp(target) {
    var node = $("#hud-xp");
    clearInterval(countTimer);
    if (reduceMotion || target <= shownXp) { shownXp = target; node.textContent = target + " XP"; return; }
    var from = shownXp, step = 0, STEPS_N = 16;
    shownXp = target;
    countTimer = setInterval(function () {
      step += 1;
      var eased = 1 - Math.pow(1 - step / STEPS_N, 3);
      node.textContent = Math.round(from + (target - from) * eased) + " XP";
      if (step >= STEPS_N) { clearInterval(countTimer); node.textContent = target + " XP"; }
    }, 40);
  }

  function renderProgress() {
    var lvl = levelFor(progress.xp), nx = nextLevel(lvl), pct = levelPct(progress.xp);
    var label = "Level " + lvl.n + " · " + lvl.name;
    var toNext = nx ? progress.xp + " / " + nx.at + " XP" : progress.xp + " XP";

    $("#hud-level").textContent = lvl.n;
    $("#hud-rank").textContent = lvl.name;
    countXp(progress.xp);
    renderPath();
    $("#hud-badges").textContent = badgeCount();
    fill($("#hud-fill"), pct);

    $("#locker-title").textContent = label;
    $("#locker-xp").textContent = progress.xp + " XP";
    $("#locker-next").textContent = nx ? nx.name + " at " + nx.at + " XP" : "Top level reached";
    fill($("#locker-fill"), pct);
    $("#locker-badge-count").textContent = badgeCount() + " of " + BADGES.length;
    var grid = $("#badge-grid");
    grid.textContent = "";
    BADGES.forEach(function (b) { grid.appendChild(badgeNode(b)); });
    renderSkills();

    $("#done-level").textContent = label;
    $("#done-xp").textContent = toNext;
    fill($("#done-fill"), pct);
  }

  var toasts = $("#toasts");
  function toast(title, sub, xp, badgeId, isLevel) {
    var t = el("div", "fs-toast" + (isLevel ? " fs-toast--level" : ""));
    var badge = BADGES.filter(function (b) { return b.id === badgeId; })[0];
    if (badge) {
      t.appendChild(badgeNode(badge, { sm: true, isNew: true }));
    } else {
      var k = el("span", "fs-key fs-key--hivis", isLevel ? String(levelFor(progress.xp).n) : "");
      if (!isLevel) k.appendChild(icon("i-bolt", "fs-icon fs-icon--sm"));
      t.appendChild(k);
    }
    var text = el("div");
    text.appendChild(el("p", "fs-toast__title", (badge ? "Badge unlocked: " : "") + title));
    if (sub) text.appendChild(el("p", "fs-toast__sub", sub));
    t.appendChild(text);
    t.appendChild(el("span", "fs-toast__xp", xp ? "+" + xp + " XP" : ""));
    toasts.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-leaving");
      setTimeout(function () { t.remove(); }, 320);
    }, isLevel ? 5200 : 3800);
    bumpHud(xp);
  }

  function bumpHud(xp) {
    var hud = $("#hud");
    hud.classList.remove("is-bumped");
    void hud.offsetWidth;
    hud.classList.add("is-bumped");
    if (xp && !reduceMotion) {
      var f = el("span", "xp-float", "+" + xp);
      f.setAttribute("aria-hidden", "true");
      hud.appendChild(f);
      setTimeout(function () { f.remove(); }, 950);
    }
  }

  /* quiet: no toast, for moments a summary already celebrates */
  function award(id, xp, title, sub, badgeId, quiet) {
    if (progress.done[id]) return false;
    progress.done[id] = true;
    var before = levelFor(progress.xp);
    progress.xp += xp;
    progress.log.push({ id: id, title: title, xp: xp });
    if (badgeId) progress.badges[badgeId] = true;
    renderProgress();
    if (quiet) bumpHud(xp);
    else toast(title, sub, xp, badgeId);
    var after = levelFor(progress.xp);
    if (after.n > before.n) {
      setTimeout(function () {
        toast("Level " + after.n + " · " + after.name, "You leveled up. Open your locker to see your badges.", 0, null, true);
      }, 450);
    }
    return true;
  }

  /* Locker dialog */
  var locker = $("#locker");
  var lockerOpener = null;
  function openLocker() {
    lockerOpener = document.activeElement;
    renderProgress();
    if (typeof locker.showModal === "function") locker.showModal();
    else locker.setAttribute("open", "");
  }
  function closeLocker() {
    if (typeof locker.close === "function") locker.close();
    else locker.removeAttribute("open");
  }
  locker.addEventListener("close", function () { if (lockerOpener && lockerOpener.focus) lockerOpener.focus(); });
  locker.addEventListener("click", function (e) { if (e.target === locker) closeLocker(); });
  $$("[data-close-locker]").forEach(function (b) { b.addEventListener("click", closeLocker); });
  $$("[data-open-locker]").forEach(function (b) { b.addEventListener("click", openLocker); });
  $("#hud").addEventListener("click", openLocker);

  /* ================= Navigation ================= */
  function openDemo(step) {
    site.hidden = true;
    app.hidden = false;
    setStep(step || "task");
    setTimeout(function () {
      award("clock-in", 20, "Clocked in", "Your first shift has started.", "clocked-in");
    }, 600);
  }

  function exitDemo() {
    if (locker.open) closeLocker();
    app.hidden = true;
    site.hidden = false;
    setHash("");
    window.scrollTo(0, 0);
  }

  var currentIdx = -1;
  function setStep(step) {
    if (STEPS.indexOf(step) === -1) step = "task";
    var idx = STEPS.indexOf(step);
    var direction = currentIdx === -1 || idx === currentIdx ? "" : idx > currentIdx ? "is-forward" : "is-back";
    currentIdx = idx;
    $$(".view").forEach(function (v) {
      var on = v.dataset.view === step;
      v.hidden = !on;
      v.classList.remove("is-forward", "is-back");
      if (on && direction) { void v.offsetWidth; v.classList.add(direction); }
    });
    $$(".fs-stepper__item").forEach(function (li) {
      var i = STEPS.indexOf(li.dataset.step);
      if (i < idx || (li.dataset.step === "review" && progress.done.review)) li.dataset.state = "done";
      else if (i === idx) li.dataset.state = "current";
      else delete li.dataset.state;
      var btn = $("button", li);
      if (i === idx) btn.setAttribute("aria-current", "step");
      else btn.removeAttribute("aria-current");
    });
    setHash(step);
    window.scrollTo(0, 0);
    if (step === "defend" && !defense.started) startDefense();
    if (step === "report") {
      setTimeout(function () {
        progress.skillsShown = true;
        award("gap", 60, "Gap hunter", "Your gap unlocked quest FS-102.", "gap-hunter");
      }, 700);
    }
  }

  /* ================= 1 · Task brief: welcome, free hints ================= */
  $("#btn-welcome").addEventListener("click", function () {
    var card = $("#welcome");
    var title = $("#task-title");
    function done() {
      card.hidden = true;
      title.setAttribute("tabindex", "-1");
      title.focus();
    }
    if (reduceMotion) return done();
    card.classList.add("is-leaving");
    setTimeout(done, 230);
  });

  var hintsOpened = {};
  $$("[data-hint]").forEach(function (d, i) {
    d.addEventListener("toggle", function () {
      if (d.open) hintsOpened[i] = true;
      $("#hint-count").textContent = Object.keys(hintsOpened).length + " of 3 opened";
    });
  });

  /* ================= 2 · Submission ================= */
  var form = $("#submit-form");
  var fields = { diff: $("#f-diff"), why: $("#f-why"), tests: $("#f-tests"), ai: $("#f-ai-help") };

  function refreshChecklist() {
    var ready = 0;
    Object.keys(fields).forEach(function (key) {
      var ok = fields[key].value.trim().length > 0;
      if (ok) ready += 1;
      var li = $('[data-check="' + key + '"]');
      li.dataset.ok = String(ok);
      $("use", li).setAttribute("href", ok ? "#i-observed" : "#i-missing");
    });
    $("#ready-count").textContent = ready + " of 4";
    fill($("#ready-fill"), ready * 25);
  }

  /* Inline validation: a required field shows its error after you leave it empty, and clears as you type. */
  function setFieldError(input, show) {
    var err = $("#" + input.id + "-err");
    input.setAttribute("aria-invalid", show ? "true" : "false");
    if (err) err.hidden = !show;
  }
  $$("[data-required]", form).forEach(function (input) {
    input.addEventListener("blur", function () { setFieldError(input, !input.value.trim()); });
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true" && input.value.trim()) setFieldError(input, false);
    });
  });

  /* Draft autosave: kept in this browser only, so a refresh doesn't lose your work. */
  var DRAFT_IDS = ["f-diff", "f-why", "f-tests", "f-ai-help", "f-ai-check"];
  var draftStatus = $("#draft-status span");
  var saved = store("firstshift-draft-fs101");
  if (saved) {
    DRAFT_IDS.forEach(function (id) { if (typeof saved[id] === "string") $("#" + id).value = saved[id]; });
    draftStatus.textContent = "Draft restored from this browser";
  }
  var draftTimer = null;
  form.addEventListener("input", function () {
    refreshChecklist();
    draftStatus.textContent = "Saving…";
    clearTimeout(draftTimer);
    draftTimer = setTimeout(function () {
      var data = {};
      DRAFT_IDS.forEach(function (id) { data[id] = $("#" + id).value; });
      store("firstshift-draft-fs101", data);
      draftStatus.textContent = "Draft saved";
    }, 600);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = $$("[data-required]", form).filter(function (input) { return !input.value.trim(); });
    $$("[data-required]", form).forEach(function (input) { setFieldError(input, missing.indexOf(input) !== -1); });
    var summary = $("#submit-error");
    if (missing.length) {
      var names = missing.map(function (input) { return $('label[for="' + input.id + '"]').firstChild.textContent.trim(); });
      summary.textContent = (missing.length === 1 ? "One field needs" : missing.length + " fields need") + " attention: " + names.join(", ") + ".";
      summary.hidden = false;
      missing[0].focus();
      return;
    }
    summary.hidden = true;
    var btn = $('button[type="submit"]', form);
    var label = btn.firstChild.textContent;
    btn.setAttribute("aria-busy", "true");
    btn.disabled = true;
    btn.firstChild.textContent = "Submitting ";
    setTimeout(function () {
      btn.removeAttribute("aria-busy");
      btn.disabled = false;
      btn.firstChild.textContent = label;
      award("submit", 100, "Shipped it", "Your work is in. Next: defend it.", "shipped");
      if ($("#f-ai-help").value.trim() && $("#f-ai-check").value.trim()) {
        award("ai", 30, "Owned your AI", "You said what AI did and what you checked.", "owned-ai");
      }
      setStep("defend");
    }, reduceMotion ? 0 : 650);
  });

  /* ================= 3 · Work defense ================= */
  var DIFF = {
    del: [
      [1, 'if (params.get("success") === "true") {'],
      [2, "  clearCart();"],
      [3, "  return <SuccessScreen />;"],
      [4, "}"]
    ],
    add: [
      [1, "const { status } = useOrderStatus(orderId, { poll: 3000, timeout: 30000 });"],
      [5, 'if (status === "unknown") return <StillChecking orderId={orderId} />;']
    ]
  };

  var DEFENSE = [
    {
      q: "Your fix stops treating the browser redirect as proof of payment. Why isn’t the redirect enough?",
      simple: "Why can’t the page trust ?success=true in the address bar?",
      basisRef: "diff −1 to −4",
      basis: DIFF.del.map(function (l) { return { sign: "-", n: l[0], text: l[1] }; }),
      note: "The lines you removed.",
      answer: "Because the redirect only means the customer came back to our page. Anyone can type ?success=true in the address bar, and a declined card can still redirect. The real answer comes from Paymob’s webhook to our server, so the page asks our server for the order status.",
      mark: "webhook",
      time: "00:12"
    },
    {
      kind: "Follow-up",
      ack: "Good catch on the webhook. Let’s push on that.",
      from: "From your answer · “webhook”",
      q: "If the request timed out and you don’t know whether Paymob processed the payment, why shouldn’t you automatically create another payment?",
      simple: "If you don’t know whether the first payment worked, what goes wrong if you just try again?",
      basisRef: "diff +1, +5",
      basis: [
        { sign: "+", n: 1, text: DIFF.add[0][1] },
        { sign: "+", n: 5, text: DIFF.add[1][1] }
      ],
      note: "Your timeout and your “unknown” state.",
      answer: "Because the first payment might have gone through, and then we’d charge the customer twice. So I show the “still checking” screen with the order number and keep polling for 30 seconds. After that, I guess support would have to check it manually.",
      mark: "charge the customer twice",
      time: "01:48"
    },
    {
      kind: "Follow-up",
      ack: "Right, a double charge is the real risk. One more on that.",
      from: "From your answer · “charge the customer twice”",
      q: "Paymob can deliver the same webhook more than once. How would you test that a duplicate delivery doesn’t confirm or fulfil the order twice?",
      simple: "What happens if the same “payment done” message reaches your server twice? How would you test that?",
      basisRef: "not in submission",
      basis: null,
      note: "Nothing in your diff or test plan covers duplicate events. That’s what this question is for.",
      answer: "I’m not sure how the server would know it’s the same event. Maybe it could keep the transaction ID and skip one it has already seen? To test it, I’d send the same webhook twice and check the order is still confirmed only once.",
      mark: "I’m not sure",
      time: "03:05"
    }
  ];
  var HONEST = /\b(not sure|don[’']t know|no idea|unsure)\b/i;

  var defense = { started: false, i: 0 };
  var transcript = $("#transcript");
  var answerBox = $("#f-answer");
  var sendBtn = $("#btn-send");

  function renderBasis(item) {
    $("#basis-ref").textContent = item.basisRef;
    $("#basis-note").textContent = item.note;
    var box = $("#basis-code");
    box.textContent = "";
    if (!item.basis) {
      box.appendChild(el("div", "basis-empty", "// nothing here about duplicate webhooks"));
      return;
    }
    var file = el("div", "fs-code__file");
    file.appendChild(el("span", null, "CheckoutReturn.tsx"));
    file.appendChild(el("span", null, "your diff"));
    box.appendChild(file);
    item.basis.forEach(function (l) {
      var row = el("div", "fs-code__line " + (l.sign === "+" ? "fs-code__line--add" : "fs-code__line--del"));
      row.appendChild(el("span", null, String(l.n)));
      row.appendChild(el("span", null, l.sign));
      row.appendChild(el("span", null, l.text));
      box.appendChild(row);
    });
  }

  function questionNode(item, n) {
    var wrap = el("div", "fs-q");
    var meta = el("div", "fs-q__meta");
    var avatar = el("span", "fs-avatar");
    var mark = icon("fs-mark", "");
    mark.setAttribute("viewBox", "0 0 48 48");
    avatar.appendChild(mark);
    meta.appendChild(avatar);
    meta.appendChild(el("span", "fs-label", "Interviewer · Question " + n));
    if (item.from) {
      meta.appendChild(el("span", "fs-chip fs-chip--live", item.kind));
      meta.appendChild(el("span", "fs-ref", item.from));
    } else {
      meta.appendChild(el("span", "fs-ref", item.basisRef));
    }
    wrap.appendChild(meta);
    if (item.ack) wrap.appendChild(el("p", "fs-q__ack", item.ack));
    wrap.appendChild(el("p", "fs-q__text", item.q));

    var simpler = el("p", "q-simpler", item.simple);
    simpler.hidden = true;
    var tools = el("div", "q-tools");
    var btn = el("button", "fs-btn fs-btn--ghost fs-btn--sm", "Say it simpler");
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      simpler.hidden = !simpler.hidden;
      btn.setAttribute("aria-expanded", String(!simpler.hidden));
      btn.textContent = simpler.hidden ? "Say it simpler" : "Hide simpler version";
    });
    tools.appendChild(btn);
    wrap.appendChild(simpler);
    wrap.appendChild(tools);
    return wrap;
  }

  function answerNode(text, item) {
    var wrap = el("div", "fs-a");
    var meta = el("div", "fs-a__meta");
    meta.appendChild(el("span", "fs-label", "You · " + item.time));
    wrap.appendChild(meta);
    var p = el("p", "fs-a__text");
    var at = item.mark ? text.indexOf(item.mark) : -1;
    if (at === -1) {
      p.textContent = text;
    } else {
      p.appendChild(document.createTextNode(text.slice(0, at)));
      p.appendChild(el("mark", null, item.mark));
      p.appendChild(document.createTextNode(text.slice(at + item.mark.length)));
    }
    wrap.appendChild(p);
    return wrap;
  }

  function setQuestionProgress(i) {
    $("#q-progress-label").textContent = i < DEFENSE.length ? "Question " + (i + 1) + " of " + DEFENSE.length : "All questions answered";
    $$(".q-progress__dots i").forEach(function (dot, d) {
      dot.className = d < i ? "is-done" : d === i ? "is-current" : "";
    });
  }

  function ask(i) {
    var typing = el("div", "typing");
    typing.appendChild(el("span"));
    typing.appendChild(el("span"));
    typing.appendChild(el("span"));
    typing.appendChild(el("em", null, i === 0 ? "Interviewer is reading your submission" : "Interviewer is reading your answer"));
    transcript.appendChild(typing);
    sendBtn.disabled = true;
    setQuestionProgress(i);
    setTimeout(function () {
      typing.remove();
      transcript.appendChild(questionNode(DEFENSE[i], i + 1));
      renderBasis(DEFENSE[i]);
      answerBox.value = DEFENSE[i].answer;
      sendBtn.disabled = false;
    }, i === 0 ? 600 : 1100);
  }

  function startDefense() {
    defense.started = true;
    defense.i = 0;
    transcript.textContent = "";
    $("#composer").hidden = false;
    $("#defense-done").hidden = true;
    ask(0);
  }

  function finishDefense() {
    $("#composer").hidden = true;
    setQuestionProgress(DEFENSE.length);
    award("held", 50, "Held the line", "All three questions answered.", "held-line", true);

    var tally = $("#tally");
    tally.textContent = "";
    var answers = 0, total = 0;
    progress.log.forEach(function (entry) {
      total += entry.xp;
      if (entry.id.indexOf("answer-") === 0) { answers += entry.xp; return; }
      var li = el("li");
      li.appendChild(el("span", null, entry.title));
      li.appendChild(el("span", null, "+" + entry.xp));
      tally.appendChild(li);
    });
    if (answers) {
      var a = el("li");
      a.appendChild(el("span", null, "3 defense answers"));
      a.appendChild(el("span", null, "+" + answers));
      tally.insertBefore(a, tally.children[Math.min(3, tally.children.length)] || null);
    }
    var t = el("li", "tally__total");
    t.appendChild(el("span", null, "This shift"));
    t.appendChild(el("span", null, total + " XP"));
    tally.appendChild(t);
    $$("li", tally).forEach(function (li, n) { li.style.animationDelay = n * 50 + "ms"; });

    var earned = $("#earned-badges");
    earned.textContent = "";
    BADGES.forEach(function (b) {
      if (progress.badges[b.id]) earned.appendChild(badgeNode(b, { sm: true, isNew: true }));
    });
    var stamp = $("#done-stamp");
    stamp.classList.remove("fs-stamp--in");
    void stamp.offsetWidth;
    stamp.classList.add("fs-stamp--in");

    var doneFill = $("#done-fill");
    var target = doneFill.style.getPropertyValue("--xp");
    fill(doneFill, 0);
    $("#defense-done").hidden = false;
    void doneFill.offsetWidth;
    setTimeout(function () { doneFill.style.setProperty("--xp", target); }, 60);
  }

  function sendAnswer() {
    var text = answerBox.value.trim();
    if (!text || sendBtn.disabled) { answerBox.focus(); return; }
    var i = defense.i;
    transcript.appendChild(answerNode(text, DEFENSE[i]));
    answerBox.value = "";
    award("answer-" + i, 50, "Answer " + (i + 1) + " of 3", "+50 for defending your own work.", null, i === DEFENSE.length - 1);
    if (HONEST.test(text)) {
      award("honest", 40, "Honest unknown", "You said you weren’t sure, then reasoned it through.", "honest");
    }
    defense.i += 1;
    if (defense.i < DEFENSE.length) ask(defense.i);
    else finishDefense();
  }

  sendBtn.addEventListener("click", sendAnswer);
  answerBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendAnswer(); }
  });

  var mic = $("#btn-mic");
  mic.addEventListener("click", function () {
    var on = mic.getAttribute("aria-pressed") !== "true";
    mic.setAttribute("aria-pressed", String(on));
    $("span", mic).textContent = on ? "Listening… tap to stop" : "Answer by voice";
  });

  /* ================= 4 · Report: next quest ================= */
  var questBtn = $("#btn-quest");
  questBtn.addEventListener("click", function () {
    var on = questBtn.getAttribute("aria-pressed") !== "true";
    questBtn.setAttribute("aria-pressed", String(on));
    questBtn.textContent = on ? "Reminder set for after your review" : "Remind me after my review";
  });

  /* ================= 5 · Booking + Paymob ================= */
  function selected(name) { var r = $('input[name="' + name + '"]:checked'); return r ? r.value : ""; }

  function refreshSummary() {
    $("#sum-reviewer").textContent = selected("reviewer");
    $("#sum-slot").textContent = selected("slot");
    $("#paid-detail").textContent = selected("reviewer") + " · " + selected("slot");
  }
  $$('input[name="reviewer"], input[name="slot"]').forEach(function (r) { r.addEventListener("change", refreshSummary); });

  function showPay(state) {
    ["idle", "pending", "paid", "failed", "unknown"].forEach(function (s) { $("#pay-" + s).hidden = s !== state; });
  }

  /* Demo stand-in for the real flow:
     1) POST to your backend to create a Paymob payment and redirect to its checkout URL.
     2) On return, never trust the query string: poll your order endpoint until the
        server (updated by Paymob's webhook) reports paid / failed, or show "still checking". */
  $("#btn-pay").addEventListener("click", function () {
    var btn = this;
    btn.disabled = true;
    btn.lastChild.textContent = "Opening Paymob…";
    setTimeout(function () {
      showPay("pending");
      setTimeout(function () {
        var outcome = selected("outcome") || "paid";
        showPay(outcome);
        if (outcome === "paid") {
          var chip = $("#report-status");
          chip.className = "fs-chip fs-chip--confirmed";
          $("use", chip).setAttribute("href", "#i-observed");
          chip.lastChild.textContent = "Review booked";
          $('[data-step="review"]').dataset.state = "done";
          award("review", 80, "Booked a pro", "Your reviewer has everything they need.", "pro-review");
        }
        btn.disabled = false;
        btn.lastChild.textContent = "Pay 300 EGP with Paymob";
      }, 2300);
    }, 900);
  });
  $$("[data-pay-reset]").forEach(function (b) { b.addEventListener("click", function () { showPay("idle"); }); });

  /* ================= Wiring ================= */
  $$("[data-open-demo]").forEach(function (b) {
    b.addEventListener("click", function () { openDemo(b.dataset.openDemo); });
  });
  $$("[data-exit-demo]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); exitDemo(); });
  });
  $$("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { setStep(b.dataset.go); });
  });
  $$(".fs-stepper__item").forEach(function (li) {
    $("button", li).addEventListener("click", function () { setStep(li.dataset.step); });
  });

  refreshChecklist();
  refreshSummary();
  renderProgress();

  var start = (location.hash || "").slice(1);
  if (start === "demo") openDemo("task");
  else if (STEPS.indexOf(start) !== -1) openDemo(start);
})();
