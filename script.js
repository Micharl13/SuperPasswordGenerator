const resultEl = document.getElementById("result");
const lengthEl = document.getElementById("length");
const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const digitsEl = document.getElementById("digits");
const symbolsEl = document.getElementById("symbols");
const excludeSimilarEl = document.getElementById("excludeSimilar");
const customCharsEl = document.getElementById("customChars");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const toggleVisibilityBtn = document.getElementById("toggleVisibility");
const strengthEl = document.getElementById("strength");
const entropyEl = document.getElementById("entropy");
const historySelect = document.getElementById("historySelect");
const themeSelect = document.getElementById("themeSelect");
const modeSelect = document.getElementById("modeSelect");
const copiedPopup = document.getElementById("copiedPopup");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const HISTORY_KEY = "passwordHistory";
let passwordVisible = false;

const CHAR_SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
  similar: /[ilLI|10Oo]/g,
};

// Generate password
generateBtn.addEventListener("click", () => {
  const length = parseInt(lengthEl.value);
  const hasLower = lowercaseEl.checked;
  const hasUpper = uppercaseEl.checked;
  const hasDigits = digitsEl.checked;
  const hasSymbols = symbolsEl.checked;
  const excludeSimilar = excludeSimilarEl.checked;
  const customChars = customCharsEl.value;

  let charPool = "";
  if (hasLower) charPool += CHAR_SETS.lower;
  if (hasUpper) charPool += CHAR_SETS.upper;
  if (hasDigits) charPool += CHAR_SETS.digits;
  if (hasSymbols) charPool += CHAR_SETS.symbols;
  if (customChars) charPool += customChars;

  if (!charPool) {
    alert("Select at least one character type!");
    return;
  }

  if (excludeSimilar) {
    charPool = charPool.replace(CHAR_SETS.similar, "");
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += charPool.charAt(Math.floor(Math.random() * charPool.length));
  }

  resultEl.value = password;
  showStrength(password);
  showEntropy(password, charPool.length);
  saveToHistory(password);
  updateHistorySelect();
});

toggleVisibilityBtn.addEventListener("click", () => {
  passwordVisible = !passwordVisible;
  resultEl.type = passwordVisible ? "text" : "password";
  toggleVisibilityBtn.textContent = passwordVisible ? "🙈" : "👁️";
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultEl.value).then(() => {
    copiedPopup.style.display = "block";
    setTimeout(() => (copiedPopup.style.display = "none"), 1500);
  });
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([resultEl.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "password.txt";
  a.click();
  URL.revokeObjectURL(url);
});

themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  const selectedMode = modeSelect.value;
  localStorage.setItem("themeName", selectedTheme);
  applyTheme(selectedTheme, selectedMode);
});

modeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  const selectedMode = modeSelect.value;
  localStorage.setItem("modeName", selectedMode);
  applyTheme(selectedTheme, selectedMode);
});

historySelect.addEventListener("change", () => {
  const val = historySelect.value;
  if (val) resultEl.value = val;
});

clearHistoryBtn.addEventListener("click", () => {
  if (confirm("Clear password history?")) {
    localStorage.removeItem(HISTORY_KEY);
    updateHistorySelect();
  }
});

function showStrength(password) {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const length = password.length;

  let score = hasLower + hasUpper + hasDigit + hasSymbol + (length >= 12 ? 1 : 0);

  strengthEl.className = "strength";
  if (score <= 2) {
    strengthEl.textContent = "Strength: Weak";
    strengthEl.classList.add("weak");
  } else if (score <= 4) {
    strengthEl.textContent = "Strength: Medium";
    strengthEl.classList.add("medium");
  } else {
    strengthEl.textContent = "Strength: Strong";
    strengthEl.classList.add("strong");
  }
}

function showEntropy(password, poolSize) {
  const entropy = password.length * Math.log2(poolSize);
  entropyEl.textContent = `Entropy: ${entropy.toFixed(2)} bits`;
}

function saveToHistory(password) {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  if (!history.includes(password)) {
    history.unshift(password);
    history = history.slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

function updateHistorySelect() {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  historySelect.innerHTML = '<option value="">--None--</option>';
  history.forEach(pwd => {
    const option = document.createElement("option");
    option.value = pwd;
    option.textContent = pwd;
    historySelect.appendChild(option);
  });
}

function applyTheme(theme, mode) {
  let appliedMode = mode;
  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    appliedMode = prefersDark ? "dark" : "light";
  }
  document.body.className = `${theme} ${appliedMode}`;
}

// Restore saved theme/mode
const savedTheme = localStorage.getItem("themeName") || "default";
const savedMode = localStorage.getItem("modeName") || "dark";
themeSelect.value = savedTheme;
modeSelect.value = savedMode;
applyTheme(savedTheme, savedMode);
updateHistorySelect();
