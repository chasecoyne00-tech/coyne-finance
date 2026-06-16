/* =====================================================================
   Coyne Finance — site interactions
   Vanilla JS, no dependencies. Progressive enhancement only.
   ===================================================================== */
(function () {
  "use strict";

  /* =====================================================================
     CONFIG — paste your GoHighLevel inbound webhook URL between the quotes.
     In GHL: Automation → Workflows → new workflow → trigger "Inbound Webhook"
     → copy the URL it generates → paste below. Leave empty to keep demo mode.
     ===================================================================== */
  var GHL_WEBHOOK_URL = "";

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll("[data-reveal], .step");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".acc__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      // close siblings within same accordion
      var acc = btn.closest(".acc");
      if (acc) {
        acc.querySelectorAll(".acc__btn").forEach(function (b) {
          if (b !== btn) {
            b.setAttribute("aria-expanded", "false");
            var p = document.getElementById(b.getAttribute("aria-controls"));
            if (p) p.style.height = "0px";
          }
        });
      }
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      if (panel) {
        panel.style.height = isOpen ? "0px" : panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- Finance calculator (educational / indicative) ---------- */
  var calc = document.getElementById("calc");
  if (calc) {
    var fmt = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
    var fmt2 = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

    var priceEl   = document.getElementById("c-price");
    var depositEl = document.getElementById("c-deposit");
    var termEl    = document.getElementById("c-term");
    var rateEl    = document.getElementById("c-rate");

    var outPrice   = document.getElementById("o-price");
    var outDeposit = document.getElementById("o-deposit");
    var outTerm    = document.getElementById("o-term");
    var outRate    = document.getElementById("o-rate");

    var amount  = document.getElementById("o-repay");
    var bFinanced = document.getElementById("b-financed");
    var bTotal    = document.getElementById("b-total");
    var bInterest = document.getElementById("b-interest");

    function calculate() {
      var price = +priceEl.value;
      var depositPct = +depositEl.value;
      var months = +termEl.value;
      var annualRate = +rateEl.value;

      var deposit = price * (depositPct / 100);
      var financed = Math.max(price - deposit, 0);
      var r = annualRate / 100 / 12;
      var monthly = r === 0 ? financed / months : (financed * r) / (1 - Math.pow(1 + r, -months));
      var total = monthly * months;
      var interest = total - financed;

      outPrice.textContent   = fmt.format(price);
      outDeposit.textContent = depositPct + "% · " + fmt.format(deposit);
      outTerm.textContent    = months + " mo (" + (months / 12) + " yr)";
      outRate.textContent    = annualRate.toFixed(2) + "% p.a.";

      amount.firstChild.textContent = fmt.format(isFinite(monthly) ? monthly : 0);
      bFinanced.textContent = fmt.format(financed);
      bTotal.textContent    = fmt.format(isFinite(total) ? total : 0);
      bInterest.textContent = fmt.format(isFinite(interest) ? interest : 0);
    }

    [priceEl, depositEl, termEl, rateEl].forEach(function (el) {
      if (el) el.addEventListener("input", calculate);
    });
    calculate();
  }

  /* ---------- Enquiry form (client-side validation + graceful demo submit) ---------- */
  var form = document.getElementById("enquiry-form");
  if (form) {
    var success = document.getElementById("form-success");

    function showError(field, on) {
      var group = field.closest(".form-group");
      if (!group) return;
      field.classList.toggle("invalid", on);
      var msg = group.querySelector(".error-msg");
      if (msg) msg.classList.toggle("show", on);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var empty = !field.value.trim();
        var bad = empty;
        if (field.type === "email" && field.value) {
          bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        }
        showError(field, bad);
        if (bad) valid = false;
      });
      if (!valid) {
        var first = form.querySelector(".invalid");
        if (first) first.focus();
        return;
      }

      function showSuccess() {
        form.style.display = "none";
        if (success) {
          success.classList.add("show");
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var errBox = document.getElementById("form-error");

      /* No webhook configured yet → demo mode (still confirms to the user). */
      if (!GHL_WEBHOOK_URL) {
        showSuccess();
        return;
      }

      /* Build a clean payload mapped to GHL-friendly field names. */
      var fd = new FormData(form);
      var payload = {
        first_name: (fd.get("name") || "").toString().trim(),
        full_name:  (fd.get("name") || "").toString().trim(),
        phone:      (fd.get("phone") || "").toString().trim(),
        email:      (fd.get("email") || "").toString().trim(),
        asset_type: (fd.get("asset_type") || "").toString().trim(),
        amount:     (fd.get("amount") || "").toString().trim(),
        employment: (fd.get("employment") || "").toString().trim(),
        message:    (fd.get("message") || "").toString().trim(),
        source:     "Coyne Finance website — enquiry form",
        page:       window.location.href,
        submitted_at: new Date().toISOString()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.label = submitBtn.innerHTML;
        submitBtn.textContent = "Sending…";
      }
      if (errBox) errBox.classList.remove("show");

      fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          showSuccess();
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.label || "Submit Finance Enquiry";
          }
          if (errBox) errBox.classList.add("show");
          else alert("Sorry — something went wrong sending your enquiry. Please try again or email us directly.");
        });
    });

    form.querySelectorAll("[required]").forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.classList.contains("invalid")) showError(field, false);
      });
    });
  }

  /* ---------- Live RBA cash rate ----------
     Same-origin fetch of data/rates.json (kept current by the update-rates
     GitHub Action). Populates [data-cash-rate] + [data-cash-rate-effective]
     and reveals the rate band. On any failure it stays hidden — never broken,
     never a stale/guessed figure. */
  (function () {
    var band = document.getElementById("rate-band");
    var valEls = document.querySelectorAll("[data-cash-rate]");
    if (!valEls.length) return;

    function fmtDate(iso) {
      var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
      if (!p) return iso || "";
      var d = new Date(+p[1], +p[2] - 1, +p[3]);
      return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
    }

    fetch("data/rates.json", { cache: "no-cache" })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
      .then(function (data) {
        var rate = Number(data.cash_rate);
        if (!isFinite(rate) || rate <= 0) throw new Error("bad rate");
        valEls.forEach(function (el) { el.textContent = rate.toFixed(2) + "% p.a."; });
        document.querySelectorAll("[data-cash-rate-effective]").forEach(function (el) {
          el.textContent = fmtDate(data.effective);
          if (el.tagName === "TIME" && data.effective) el.setAttribute("datetime", data.effective);
        });
        if (band) band.hidden = false;
      })
      .catch(function () { /* leave the band hidden — no stale figure shown */ });
  })();

  /* ---------- Footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
