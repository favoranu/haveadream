const form = document.getElementById("signup-form");
const emailInput = document.getElementById("email");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");
const btnLoading = submitBtn.querySelector(".btn-loading");
const messageEl = document.getElementById("form-message");
const turnstileContainer = document.getElementById("turnstile-container");
const turnstileSiteKey = document
  .querySelector('meta[name="turnstile-site-key"]')
  ?.content?.trim();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let turnstileWidgetId = null;

function resetTurnstile() {
  if (turnstileWidgetId && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId);
  }
}

function mountTurnstile() {
  if (!turnstileSiteKey || !turnstileContainer || !window.turnstile || turnstileWidgetId) return;

  turnstileWidgetId = window.turnstile.render(turnstileContainer, {
    sitekey: turnstileSiteKey,
    theme: "dark",
  });
}

if (turnstileSiteKey) {
  if (window.turnstile) {
    mountTurnstile();
  } else {
    window.addEventListener("load", mountTurnstile);
  }
}

function getTurnstileToken() {
  return form.querySelector('input[name="cf-turnstile-response"]')?.value?.trim() || "";
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.hidden = loading;
  btnLoading.hidden = !loading;
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `form-message ${type}`;
}

function clearMessage() {
  messageEl.textContent = "";
  messageEl.className = "form-message";
}

function saveLocally(email) {
  const stored = JSON.parse(localStorage.getItem("had-subscribers") || "[]");
  if (stored.includes(email)) {
    showMessage("This email is already subscribed.", "error");
    return false;
  }
  stored.push(email);
  localStorage.setItem("had-subscribers", JSON.stringify(stored));
  showMessage("Welcome to the dream! You're on the list.", "success");
  form.reset();
  return true;
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text || text.trimStart().startsWith("<")) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    emailInput.classList.add("invalid");
    showMessage("Please enter your email address.", "error");
    emailInput.focus();
    return;
  }

  if (!EMAIL_RE.test(email)) {
    emailInput.classList.add("invalid");
    showMessage("Please enter a valid email address.", "error");
    emailInput.focus();
    return;
  }

  emailInput.classList.remove("invalid");

  if (turnstileSiteKey && !getTurnstileToken()) {
    showMessage("Please complete the verification check.", "error");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        turnstileToken: getTurnstileToken(),
      }),
    });

    const data = await parseJsonSafe(res);

    if (!data) {
      saveLocally(email);
      return;
    }

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    showMessage("Welcome to the dream! You're on the list.", "success");
    form.reset();
    resetTurnstile();
  } catch (err) {
    if (err.message === "Failed to fetch" || err.name === "TypeError") {
      saveLocally(email);
    } else {
      showMessage(err.message, "error");
    }
  } finally {
    setLoading(false);
  }
});

emailInput.addEventListener("input", () => {
  emailInput.classList.remove("invalid");
  if (messageEl.classList.contains("error")) {
    clearMessage();
  }
});

const copyContractBtn = document.getElementById("copy-contract");
const contractAddressEl = document.getElementById("contract-address");
const contractCopyMsg = document.getElementById("contract-copy-msg");

if (copyContractBtn && contractAddressEl) {
  copyContractBtn.addEventListener("click", async () => {
    const address = contractAddressEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(address);
      if (contractCopyMsg) contractCopyMsg.textContent = "Contract copied!";
    } catch {
      if (contractCopyMsg) contractCopyMsg.textContent = "Copy failed — select and copy manually.";
    }
    setTimeout(() => {
      if (contractCopyMsg) contractCopyMsg.textContent = "";
    }, 2500);
  });
}