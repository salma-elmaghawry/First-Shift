/* FirstShift demo: landing <-> 5-step flow (task, submit, defend, report, review).
   No framework. Content for the defense lives in DEFENSE below. */
(function () {
  "use strict";

  var STEPS = ["task", "submit", "defend", "report", "review"];
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var site = $("#site");
  var app = $("#app");
  var current = null;

  function setHash(token) {
    try { history.replaceState(null, "", token ? "#" + token : location.pathname + location.search); } catch (e) { /* sandboxed */ }
  }

  function openDemo(step) {
    site.hidden = true;
    app.hidden = false;
    setStep(step || "task");
  }

  function exitDemo() {
    app.hidden = true;
    site.hidden = false;
    setHash("");
    window.scrollTo(0, 0);
  }

  function setStep(step) {
    if (STEPS.indexOf(step) === -1) step = "task";
    current = step;
    var idx = STEPS.indexOf(step);
    $$(".view").forEach(function (v) { v.hidden = v.dataset.view !== step; });
    $$(".fs-stepper__item").forEach(function (li) {
      var i = STEPS.indexOf(li.dataset.step);
      if (i < idx) li.dataset.state = "done";
      else if (i === idx) li.dataset.state = "current";
      else delete li.dataset.state;
      var btn = $("button", li);
      if (i === idx) btn.setAttribute("aria-current", "step");
      else btn.removeAttribute("aria-current");
    });
    setHash(step);
    window.scrollTo(0, 0);
    if (step === "defend" && !defense.started) startDefense();
  }

  /* ---------- Submission ---------- */
  var form = $("#submit-form");
  var fields = { diff: $("#f-diff"), why: $("#f-why"), tests: $("#f-tests"), ai: $("#f-ai-help") };

  function refreshChecklist() {
    Object.keys(fields).forEach(function (key) {
      var ok = fields[key].value.trim().length > 0;
      var li = $('[data-check="' + key + '"]');
      li.dataset.ok = String(ok);
      $("use", li).setAttribute("href", ok ? "#i-observed" : "#i-missing");
    });
  }

  form.addEventListener("input", refreshChecklist);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ready = ["diff", "why", "tests"].every(function (k) { return fields[k].value.trim(); });
    $("#submit-error").hidden = ready;
    if (ready) setStep("defend");
  });

  /* ---------- Work defense ---------- */
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
      kind: "Opening",
      q: "Your fix stops treating the browser redirect as proof of payment. Why isn’t the redirect enough?",
      basisRef: "diff −1 to −4",
      basis: DIFF.del.map(function (l) { return { sign: "-", n: l[0], text: l[1], focus: true }; }),
      note: "The lines you removed.",
      answer: "Because the redirect only means the customer came back to our page. Anyone can type ?success=true in the address bar, and a declined card can still redirect. The real answer comes from Paymob’s webhook to our server, so the page asks our server for the order status.",
      mark: "webhook",
      time: "00:12"
    },
    {
      kind: "Follow-up",
      from: "From your answer · “webhook”",
      q: "If the request timed out and you don’t know whether Paymob processed the payment, why shouldn’t you automatically create another payment?",
      basisRef: "diff +1, +5",
      basis: [
        { sign: "+", n: 1, text: DIFF.add[0][1], focus: true },
        { sign: "+", n: 5, text: DIFF.add[1][1], focus: true }
      ],
      note: "Your timeout and your “unknown” state.",
      answer: "Because the first payment might have gone through, and then we’d charge the customer twice. So I show the “still checking” screen with the order number and keep polling for 30 seconds. After that, I guess support would have to check it manually.",
      mark: "charge the customer twice",
      time: "01:48"
    },
    {
      kind: "Follow-up",
      from: "From your answer · “charge the customer twice”",
      q: "Paymob can deliver the same webhook more than once. How would you test that a duplicate delivery doesn’t confirm or fulfil the order twice?",
      basisRef: "not in submission",
      basis: null,
      note: "Nothing in your diff or test plan covers duplicate events. That’s what this question is for.",
      answer: "Hmm. I’d send the same webhook twice in a test and check the order is still paid once? I’m not sure how the server would know it’s the same event.",
      time: "03:05"
    }
  ];

  var defense = { started: false, i: 0 };
  var transcript = $("#transcript");
  var answerBox = $("#f-answer");
  var sendBtn = $("#btn-send");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

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
    meta.appendChild(el("span", "fs-label", "Question " + n));
    if (item.from) {
      meta.appendChild(el("span", "fs-chip fs-chip--live", item.kind));
      meta.appendChild(el("span", "fs-ref", item.from));
    } else {
      meta.appendChild(el("span", "fs-ref", item.basisRef));
    }
    wrap.appendChild(meta);
    wrap.appendChild(el("p", "fs-q__text", item.q));
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

  function ask(i) {
    var typing = el("div", "typing");
    typing.setAttribute("aria-label", "Interviewer is reading your answer");
    typing.appendChild(el("span"));
    typing.appendChild(el("span"));
    typing.appendChild(el("span"));
    transcript.appendChild(typing);
    sendBtn.disabled = true;
    setTimeout(function () {
      typing.remove();
      transcript.appendChild(questionNode(DEFENSE[i], i + 1));
      renderBasis(DEFENSE[i]);
      answerBox.value = DEFENSE[i].answer;
      sendBtn.disabled = false;
    }, i === 0 ? 450 : 1100);
  }

  function startDefense() {
    defense.started = true;
    defense.i = 0;
    transcript.textContent = "";
    $("#composer").hidden = false;
    $("#defense-done").hidden = true;
    ask(0);
  }

  sendBtn.addEventListener("click", function () {
    var text = answerBox.value.trim();
    if (!text) { answerBox.focus(); return; }
    transcript.appendChild(answerNode(text, DEFENSE[defense.i]));
    answerBox.value = "";
    defense.i += 1;
    if (defense.i < DEFENSE.length) {
      ask(defense.i);
    } else {
      $("#composer").hidden = true;
      $("#defense-done").hidden = false;
      var status = $("#defense-status");
      status.className = "fs-chip fs-chip--confirmed";
      status.textContent = "Complete";
    }
  });

  var mic = $("#btn-mic");
  mic.addEventListener("click", function () {
    var on = mic.getAttribute("aria-pressed") !== "true";
    mic.setAttribute("aria-pressed", String(on));
    $("span", mic).textContent = on ? "Listening… tap to stop" : "Answer by voice";
  });

  /* ---------- Booking + Paymob ---------- */
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
        }
        btn.disabled = false;
        btn.lastChild.textContent = "Pay 300 EGP with Paymob";
      }, 2300);
    }, 900);
  });
  $$("[data-pay-reset]").forEach(function (b) { b.addEventListener("click", function () { showPay("idle"); }); });

  /* ---------- Wiring ---------- */
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

  var start = (location.hash || "").slice(1);
  if (start === "demo") openDemo("task");
  else if (STEPS.indexOf(start) !== -1) openDemo(start);
})();
