const TOTAL_QUESTIONS = 15;
const MAX_LEADING_COEFFICIENT = 6;
const MAX_SECURITY_WARNINGS = 3;
const STORAGE_KEY = "polynomial_factor_player_v1";
const GAS_URL = "https://script.google.com/macros/s/AKfycbwtKgzgF8RsAG6rjE0LbkqB57Mo_vr1SOhovknNoWGY96JcXlJXFT382Ggm1yp6s4NERw/exec";

const state = {
  player: { title: "นาย", name: "", nickname: "", room: "", number: "", testRound: "ครั้งที่ 1" },
  mode: "practice",
  questions: [],
  currentIndex: 0,
  started: false,
  submitted: false,
  securityWarnings: 0,
  lockedBySecurity: false,
  screenBlocked: false,
  lastSecurityAt: 0,
};

const els = {
  homeView: document.querySelector("#homeView"),
  loginView: document.querySelector("#loginView"),
  quizView: document.querySelector("#quizView"),
  resultView: document.querySelector("#resultView"),
  studentForm: document.querySelector("#studentForm"),
  title: document.querySelector("#title"),
  name: document.querySelector("#name"),
  nickname: document.querySelector("#nickname"),
  room: document.querySelector("#room"),
  number: document.querySelector("#number"),
  testRound: document.querySelector("#testRound"),
  loginTitle: document.querySelector("#loginTitle"),
  loginLead: document.querySelector("#loginLead"),
  loginNote: document.querySelector("#loginNote"),
  startWorkBtn: document.querySelector("#startWorkBtn"),
  practiceModeBtn: document.querySelector("#practiceModeBtn"),
  testModeBtn: document.querySelector("#testModeBtn"),
  studentTag: document.querySelector("#studentTag"),
  restartBtn: document.querySelector("#restartBtn"),
  securityStrip: document.querySelector("#securityStrip"),
  securityText: document.querySelector("#securityText"),
  questionNav: document.querySelector("#questionNav"),
  expression: document.querySelector("#expression"),
  instruction: document.querySelector("#instruction"),
  answerForm: document.querySelector("#answerForm"),
  factorAnswer: document.querySelector("#factorAnswer"),
  numberAnswer: document.querySelector("#numberAnswer"),
  a1: document.querySelector("#a1"),
  sign1: document.querySelector("#sign1"),
  b1: document.querySelector("#b1"),
  a2: document.querySelector("#a2"),
  sign2: document.querySelector("#sign2"),
  b2: document.querySelector("#b2"),
  clearBtn: document.querySelector("#clearBtn"),
  saveBtn: document.querySelector("#saveBtn"),
  feedback: document.querySelector("#feedback"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  submitBtn: document.querySelector("#submitBtn"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  scoreLine: document.querySelector("#scoreLine"),
  scoreTenLine: document.querySelector("#scoreTenLine"),
  securitySummary: document.querySelector("#securitySummary"),
  sheetMsg: document.querySelector("#sheetMsg"),
  resultList: document.querySelector("#resultList"),
  againBtn: document.querySelector("#againBtn"),
  homeBtn: document.querySelector("#homeBtn"),
  focusGuard: document.querySelector("#focusGuard"),
  resumeBtn: document.querySelector("#resumeBtn"),
  screenGuard: document.querySelector("#screenGuard"),
  screenGuardBtn: document.querySelector("#screenGuardBtn"),
  testModeModal: document.querySelector("#testModeModal"),
  startTestModeBtn: document.querySelector("#startTestModeBtn"),
  cancelTestModeBtn: document.querySelector("#cancelTestModeBtn"),
  submitModal: document.querySelector("#submitModal"),
  missingText: document.querySelector("#missingText"),
  confirmSubmitBtn: document.querySelector("#confirmSubmitBtn"),
  continueBtn: document.querySelector("#continueBtn"),
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(items) {
  return items[randInt(0, items.length - 1)];
}

function shuffle(items) {
  return items
    .map((value) => ({ value, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map((item) => item.value);
}

function multiplyFactors(f1, f2) {
  const [a, b] = f1;
  const [c, d] = f2;
  return {
    a: a * c,
    b: a * d + b * c,
    c: b * d,
  };
}

function formatPolynomial(poly) {
  return `${formatLeading(poly.a)}${formatX(poly.b)}${formatConstant(poly.c)}`;
}

function formatLeading(value) {
  if (value === 1) return "x²";
  if (value === -1) return "-x²";
  return `${value}x²`;
}

function formatX(value) {
  if (value === 0) return "";
  if (value === 1) return " + x";
  if (value === -1) return " - x";
  return value > 0 ? ` + ${value}x` : ` - ${Math.abs(value)}x`;
}

function formatConstant(value) {
  if (value === 0) return "";
  return value > 0 ? ` + ${value}` : ` - ${Math.abs(value)}`;
}

function normalizePoly(poly) {
  return `${poly.a}|${poly.b}|${poly.c}`;
}

function evaluatePoly(coeffs, x) {
  return coeffs.reduce((sum, coef, power) => sum + coef * x ** power, 0);
}

function formatPower(power) {
  if (power === 1) return "x";
  if (power === 2) return "x²";
  if (power === 3) return "x³";
  if (power === 4) return "x⁴";
  return `x^${power}`;
}

function formatPolynomialFromCoeffs(coeffs) {
  const terms = [];
  for (let power = coeffs.length - 1; power >= 0; power -= 1) {
    const coef = coeffs[power];
    if (coef === 0) continue;
    const abs = Math.abs(coef);
    const body = power === 0 ? `${abs}` : `${abs === 1 ? "" : abs}${formatPower(power)}`;
    const sign = coef < 0 ? "-" : "+";
    terms.push({ sign, body });
  }

  if (terms.length === 0) return "0";
  return terms
    .map((term, index) => (index === 0 ? `${term.sign === "-" ? "-" : ""}${term.body}` : ` ${term.sign} ${term.body}`))
    .join("");
}

function formatLinearDivisor(root) {
  return root >= 0 ? `x - ${root}` : `x + ${Math.abs(root)}`;
}

function generateFactorQuestion(level) {
  const pools = [
    { topic: "พื้นฐาน", coefs: [1], constants: [-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8] },
    { topic: "มีเครื่องหมายลบ", coefs: [1], constants: [-10, -9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { topic: "สัมประสิทธิ์หน้า x² มากกว่า 1", coefs: [2, 3, 4], constants: [-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7] },
  ];
  const pool = level < 4 ? pools[0] : level < 7 ? pools[1] : pools[2];

  let factorA = [pick(pool.coefs), pick(pool.constants)];
  let factorB = [pool.coefs[0] === 1 ? 1 : pick([1, 2, 3]), pick(pool.constants)];
  let poly = multiplyFactors(factorA, factorB);
  let attempts = 0;

  while (
    (poly.a > MAX_LEADING_COEFFICIENT || poly.c === 0 || poly.b === 0 || Math.abs(poly.b) > 30 || Math.abs(poly.c) > 72) &&
    attempts < 40
  ) {
    factorA = [pick(pool.coefs), pick(pool.constants)];
    factorB = [pool.coefs[0] === 1 ? 1 : pick([1, 2, 3]), pick(pool.constants)];
    poly = multiplyFactors(factorA, factorB);
    attempts += 1;
  }

  return {
    id: level + 1,
    kind: "factor",
    topic: pool.topic,
    poly,
    expression: formatPolynomial(poly),
    userAnswer: null,
  };
}

function generateRootsQuestion(level) {
  let r1 = pick([-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]);
  let r2 = pick([-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]);
  while (r1 === r2) r2 = pick([-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]);

  const coeffs = [r1 * r2, -(r1 + r2), 1];
  return {
    id: level + 1,
    kind: "roots",
    topic: "หาคำตอบของสมการ",
    expression: `${formatPolynomialFromCoeffs(coeffs)} = 0`,
    instruction: "จงหาค่าของ x ทั้ง 2 คำตอบ ลำดับใดก็ได้",
    answerCount: 2,
    answerValues: [r1, r2].sort((a, b) => a - b),
    userAnswer: null,
  };
}

function generateRemainderQuestion(level) {
  const degree = randInt(2, 4);
  const coeffs = Array.from({ length: degree + 1 }, (_, power) => {
    if (power === degree) return pick([1, 2, 3, 4]);
    return randInt(-8, 8);
  });
  const root = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
  return {
    id: level + 1,
    kind: "number",
    topic: "ทฤษฎีบทเศษเหลือ",
    expression: `${formatPolynomialFromCoeffs(coeffs)} หารด้วย (${formatLinearDivisor(root)})`,
    instruction: "จงหาเศษจากการหารพหุนามนี้",
    answerLabel: "เศษ",
    answerValues: [evaluatePoly(coeffs, root)],
    userAnswer: null,
  };
}

function generateDivisibleQuestion(level) {
  const root = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
  const answerK = randInt(-8, 8);
  const constant = -(root ** 2) - answerK * root;
  return {
    id: level + 1,
    kind: "number",
    topic: "หารลงตัว",
    expression: `x² + kx ${constant >= 0 ? "+" : "-"} ${Math.abs(constant)} หารด้วย (${formatLinearDivisor(root)}) ลงตัว`,
    instruction: "จงหาค่าของ k ที่ทำให้หารลงตัว",
    answerLabel: "k",
    answerValues: [answerK],
    userAnswer: null,
  };
}

function generateQuestion(level) {
  if (level < 10) return generateFactorQuestion(level);
  if (level < 12) return generateRootsQuestion(level);
  if (level < 14) return generateRemainderQuestion(level);
  return generateDivisibleQuestion(level);
}

function makeQuestionKey(q) {
  if (q.kind === "factor") return `factor|${normalizePoly(q.poly)}`;
  return `${q.kind}|${q.expression}`;
}

function replaceCurrentQuestion() {
  const used = new Set(state.questions.map(makeQuestionKey));
  const current = state.questions[state.currentIndex];
  used.delete(makeQuestionKey(current));

  let replacement = generateQuestion(state.currentIndex);
  let attempts = 0;
  while (used.has(makeQuestionKey(replacement)) && attempts < 30) {
    replacement = generateQuestion(state.currentIndex);
    attempts += 1;
  }

  replacement.id = current.id;
  state.questions[state.currentIndex] = replacement;
}

function generateQuestions() {
  const used = new Set();
  const questions = [];

  while (questions.length < TOTAL_QUESTIONS) {
    const q = generateQuestion(questions.length);
    const key = makeQuestionKey(q);
    if (!used.has(key)) {
      used.add(key);
      questions.push(q);
    }
  }

  state.questions = questions;
}

function show(view) {
  [els.homeView, els.loginView, els.quizView, els.resultView].forEach((item) => item.classList.add("hidden"));
  view.classList.remove("hidden");
}

function enterMode(mode) {
  state.mode = mode;
  els.loginTitle.textContent = mode === "test" ? "แบบทดสอบ" : "ทบทวนพหุนาม";
  els.loginLead.textContent = mode === "test" ? "ระบบจำนวนจริง" : "กรอกข้อมูลก่อนเริ่มทำแบบฝึกหัด 15 ข้อ ระบบจะตรวจด้วยการคำนวณย้อนกลับ";
  els.loginNote.classList.toggle("hidden", mode === "test");
  els.startWorkBtn.textContent = mode === "test" ? "เริ่มทำแบบทดสอบ" : "เริ่มทบทวน";
  show(els.loginView);
}

function startPracticeImmediately() {
  state.mode = "practice";
  state.player = {
    title: "",
    name: "ผู้ทบทวน",
    nickname: "",
    room: "",
    number: "",
    testRound: "โหมดทบทวน",
  };
  startQuiz();
}

function restorePlayer() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.name) state.player = saved;
  } catch (_) {
    state.player = { title: "นาย", name: "", nickname: "", room: "", number: "", testRound: "ครั้งที่ 1" };
  }

  els.title.value = state.player.title || "นาย";
  els.name.value = state.player.name || "";
  els.nickname.value = state.player.nickname || "";
  els.room.value = state.player.room || "";
  els.number.value = state.player.number || "";
  els.testRound.value = state.player.testRound || "ครั้งที่ 1";
}

function savePlayer() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.player));
}

function startQuiz() {
  generateQuestions();
  state.currentIndex = 0;
  state.started = true;
  state.submitted = false;
  state.securityWarnings = 0;
  state.lockedBySecurity = false;
  state.screenBlocked = false;
  els.submitModal.classList.add("hidden");
  els.screenGuard.classList.add("hidden");
  els.studentTag.textContent = makeStudentTag();
  els.feedback.textContent = "พร้อมทำข้อแรกแล้ว";
  els.feedback.classList.remove("bad");
  show(els.quizView);
  buildNav();
  renderQuestion();
  updateSecurityUI();
  updateProgress();
  updateScreenGuard();
}

function makeStudentTag() {
  if (state.mode === "practice") return "โหมดทบทวน";

  const p = state.player;
  const room = p.room ? ` (${p.room})` : "";
  const number = p.number ? ` เลขที่ ${p.number}` : "";
  const nick = p.nickname ? ` • ชื่อเล่น ${p.nickname}` : "";
  return `นักเรียน: ${p.title} ${p.name}${room}${number}${nick} • แบบทดสอบ • ${p.testRound}`;
}

function buildNav() {
  els.questionNav.innerHTML = "";
  state.questions.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "qbtn";
    btn.textContent = q.id;
    btn.addEventListener("click", () => {
      state.currentIndex = index;
      renderQuestion();
    });
    els.questionNav.append(btn);
  });
}

function renderQuestion() {
  const q = state.questions[state.currentIndex];
  const isFactor = q.kind === "factor";
  const isMonic = isFactor && q.poly.a === 1;
  els.expression.textContent = q.expression;
  els.instruction.textContent = q.instruction || (isMonic ? "จงแยกตัวประกอบให้อยู่ในรูป (x + b)(x + d)" : "จงแยกตัวประกอบให้อยู่ในรูป (ax + b)(cx + d)");
  els.answerForm.classList.toggle("monic", isMonic);
  els.factorAnswer.classList.toggle("hidden", !isFactor);
  els.numberAnswer.classList.toggle("hidden", isFactor);
  fillAnswer(q.userAnswer);
  updateNav();
  updateButtons();
  fitExpressionText();
}

function fitExpressionText() {
  els.expression.style.fontSize = "";

  window.requestAnimationFrame(() => {
    const maxSize = Number.parseFloat(getComputedStyle(els.expression).fontSize);
    const minSize = window.innerWidth <= 560 ? 14 : 18;
    let size = maxSize;

    while (els.expression.scrollWidth > els.expression.clientWidth && size > minSize) {
      size -= 1;
      els.expression.style.fontSize = `${size}px`;
    }
  });
}

function fillAnswer(answer) {
  const q = state.questions[state.currentIndex];
  if (q.kind !== "factor") {
    renderNumberInputs(q, answer);
    return;
  }

  const isMonic = q.poly.a === 1;
  const values = answer || { a1: "", b1: "", a2: "", b2: "" };
  els.a1.value = isMonic ? 1 : values.a1 ?? "";
  els.a2.value = isMonic ? 1 : values.a2 ?? "";
  els.b1.value = Math.abs(values.b1 ?? "") || "";
  els.b2.value = Math.abs(values.b2 ?? "") || "";
  els.sign1.value = Number(values.b1 ?? 1) < 0 ? "-1" : "1";
  els.sign2.value = Number(values.b2 ?? 1) < 0 ? "-1" : "1";
}

function renderNumberInputs(q, answer) {
  const count = q.answerCount || 1;
  els.numberAnswer.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const label = document.createElement("label");
    label.textContent = count === 1 ? q.answerLabel || "คำตอบ" : `ค่า x ช่องที่ ${index + 1}`;
    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric";
    input.dataset.answerIndex = index.toString();
    input.value = answer?.values?.[index] ?? "";
    label.append(input);
    els.numberAnswer.append(label);
  }
}

function readAnswer() {
  const q = state.questions[state.currentIndex];
  if (q.kind !== "factor") {
    const values = [...els.numberAnswer.querySelectorAll("input")].map((input) => input.value);
    if (values.some((value) => value === "")) return null;
    return { values: values.map(Number) };
  }

  const isMonic = q.poly.a === 1;
  const raw = {
    a1: isMonic ? "1" : els.a1.value,
    b1: els.b1.value,
    a2: isMonic ? "1" : els.a2.value,
    b2: els.b2.value,
  };

  if (Object.values(raw).some((value) => value === "")) return null;

  return {
    a1: Number(raw.a1),
    b1: Number(els.sign1.value) * Number(raw.b1),
    a2: Number(raw.a2),
    b2: Number(els.sign2.value) * Number(raw.b2),
  };
}

function saveCurrentAnswer() {
  if (state.lockedBySecurity) return;
  if (state.mode === "test" && state.screenBlocked) {
    els.feedback.textContent = "กรุณากลับสู่เต็มหน้าจอก่อนบันทึกคำตอบ";
    els.feedback.classList.add("bad");
    return;
  }

  const answer = readAnswer();
  const q = state.questions[state.currentIndex];
  if (!answer || (q.kind === "factor" && (answer.a1 === 0 || answer.a2 === 0))) {
    q.userAnswer = null;
    els.feedback.textContent = q.kind === "factor" ? "กรุณากรอกตัวเลขให้ครบ และค่า a หน้า x ต้องไม่เป็น 0" : "กรุณากรอกคำตอบให้ครบทุกช่อง";
    els.feedback.classList.add("bad");
    updateProgress();
    updateNav();
    return;
  }

  q.userAnswer = answer;
  els.feedback.textContent = `บันทึกคำตอบข้อ ${q.id} แล้ว`;
  els.feedback.classList.remove("bad");
  updateProgress();
  updateNav();
  updateButtons();
}

function clearCurrentAnswer() {
  state.questions[state.currentIndex].userAnswer = null;
  fillAnswer(null);
  els.feedback.textContent = `ล้างคำตอบข้อ ${state.currentIndex + 1} แล้ว`;
  els.feedback.classList.remove("bad");
  updateProgress();
  updateNav();
}

function updateNav() {
  [...els.questionNav.children].forEach((btn, index) => {
    const q = state.questions[index];
    btn.classList.toggle("current", index === state.currentIndex);
    btn.classList.toggle("answered", Boolean(q.userAnswer));
  });
}

function updateProgress() {
  const answered = state.questions.filter((q) => q.userAnswer).length;
  els.progressText.textContent = `ตอบแล้ว ${answered} / ${TOTAL_QUESTIONS}`;
  els.progressBar.style.width = `${(answered / TOTAL_QUESTIONS) * 100}%`;
  els.submitBtn.disabled = state.lockedBySecurity || (state.mode === "test" && state.screenBlocked);
}

function updateButtons() {
  els.prevBtn.disabled = state.currentIndex === 0;
  els.nextBtn.disabled = state.currentIndex === TOTAL_QUESTIONS - 1;
}

function checkQuestion(q) {
  if (!q.userAnswer) return false;
  if (q.kind === "roots") {
    const expected = [...q.answerValues].sort((a, b) => a - b).join("|");
    const actual = [...q.userAnswer.values].sort((a, b) => a - b).join("|");
    return expected === actual;
  }

  if (q.kind === "number") {
    return Number(q.userAnswer.values[0]) === Number(q.answerValues[0]);
  }

  const userPoly = multiplyFactors([q.userAnswer.a1, q.userAnswer.b1], [q.userAnswer.a2, q.userAnswer.b2]);
  return normalizePoly(userPoly) === normalizePoly(q.poly);
}

function formatAnswer(answer) {
  if (!answer) return "ยังไม่ได้ตอบ";
  if (answer.values) return answer.values.join(", ");
  return `(${answer.a1}x ${answer.b1 >= 0 ? "+" : "-"} ${Math.abs(answer.b1)})(${answer.a2}x ${answer.b2 >= 0 ? "+" : "-"} ${Math.abs(answer.b2)})`;
}

function convertScoreToTen(score) {
  const raw = (score / TOTAL_QUESTIONS) * 10;
  const lower = Math.floor(raw);
  return raw - lower > 0.5 ? Math.ceil(raw) : lower;
}

function submitQuiz() {
  els.submitModal.classList.add("hidden");
  const results = state.questions.map((q) => ({ q, correct: checkQuestion(q) }));
  const score = results.filter((item) => item.correct).length;
  const scoreTen = convertScoreToTen(score);

  state.submitted = true;
  state.screenBlocked = false;
  els.screenGuard.classList.add("hidden");
  els.scoreLine.textContent = `คะแนนรวม: ${score} / ${TOTAL_QUESTIONS}`;
  els.scoreTenLine.textContent = `คิดเป็น ${scoreTen}/10 คะแนน`;
  els.securitySummary.textContent = `ระบบป้องกันบันทึกการเตือน ${state.securityWarnings} ครั้ง`;
  els.sheetMsg.textContent = "";
  els.resultList.innerHTML = "";

  results.forEach(({ q, correct }) => {
    const item = document.createElement("div");
    item.className = `result-item ${correct ? "correct" : "wrong"}`;
    item.innerHTML = `
      <strong><span>ข้อ ${q.id}: ${q.expression}</span><span>${correct ? "ถูก" : "ผิด"}</span></strong>
      <span>คำตอบที่กรอก: ${formatAnswer(q.userAnswer)}</span>
    `;
    els.resultList.append(item);
  });

  show(els.resultView);
  sendScoreToSheet({ score, scoreTen, results });
}

async function sendScoreToSheet({ score, scoreTen, results }) {
  if (state.mode !== "test") {
    els.sheetMsg.textContent = "โหมดทบทวน: ไม่ส่งคะแนนไปยังครูผู้สอน";
    return;
  }

  if (!GAS_URL) {
    els.sheetMsg.textContent = "ยังไม่ได้ตั้งค่า Google Sheet URL จึงยังไม่สามารถส่งคะแนนได้";
    return;
  }

  const payload = {
    submittedAt: new Date().toISOString(),
    mode: state.mode,
    title: state.player.title,
    name: state.player.name,
    nickname: state.player.nickname,
    room: state.player.room,
    number: state.player.number,
    testRound: state.player.testRound,
    score,
    total: TOTAL_QUESTIONS,
    scoreTen,
    securityWarnings: state.securityWarnings,
    details: results.map(({ q, correct }) => ({
      id: q.id,
      kind: q.kind,
      expression: q.expression,
      instruction: q.instruction || "",
      userAnswer: formatAnswer(q.userAnswer),
      correct,
    })),
  };

  const form = new URLSearchParams();
  form.append("payload", JSON.stringify(payload));
  els.sheetMsg.textContent = "กำลังส่งคะแนนไปยัง Google Sheet...";

  try {
    const response = await fetch(GAS_URL, { method: "POST", body: form, credentials: "omit" });
    if (!response.ok) throw new Error("Non-OK response");
    els.sheetMsg.textContent = "ส่งคะแนนไปยัง Google Sheet แล้ว";
  } catch (_) {
    try {
      await fetch(GAS_URL, { method: "POST", mode: "no-cors", body: form, keepalive: true, credentials: "omit" });
      els.sheetMsg.textContent = "ส่งคะแนนไปยัง Google Sheet แล้ว";
    } catch (error) {
      els.sheetMsg.textContent = "ส่งคะแนนไม่สำเร็จ กรุณาตรวจสอบ Google Sheet URL";
    }
  }
}

function requestSubmitQuiz() {
  if (state.mode === "test" && state.screenBlocked) {
    els.feedback.textContent = "กรุณากลับสู่เต็มหน้าจอก่อนส่งคำตอบ";
    els.feedback.classList.add("bad");
    updateScreenGuard();
    return;
  }

  const missing = state.questions.filter((q) => !q.userAnswer).map((q) => q.id);
  if (missing.length === 0) {
    submitQuiz();
    return;
  }

  els.missingText.textContent = `ยังไม่ได้ตอบข้อ ${missing.join(", ")} ต้องการส่งคำตอบเลยหรือไม่`;
  els.submitModal.classList.remove("hidden");
}

function updateSecurityUI() {
  els.securityStrip.classList.toggle("alert", state.securityWarnings > 0 && !state.lockedBySecurity);
  els.securityStrip.classList.toggle("blocked", state.lockedBySecurity);

  if (state.lockedBySecurity) {
    els.securityText.textContent = `สลับหน้าจอครบ ${MAX_SECURITY_WARNINGS} ครั้ง ระบบปิดการส่งคำตอบชุดนี้แล้ว กรุณาเริ่มใหม่`;
    return;
  }

  els.securityText.textContent =
    state.securityWarnings === 0
      ? "หากสลับหน้าต่าง แอป หรือออกจากหน้านี้ ระบบจะสุ่มโจทย์ข้อปัจจุบันใหม่และบันทึกการเตือน"
      : `ตรวจพบการออกจากหน้าจอ ${state.securityWarnings} ครั้ง หากครบ ${MAX_SECURITY_WARNINGS} ครั้งจะต้องเริ่มใหม่`;
}

function handleSecurityEvent(reason) {
  if (!state.started || state.submitted || state.lockedBySecurity) return;
  if (!document.hidden) return;

  const now = Date.now();
  if (now - state.lastSecurityAt < 900) return;
  state.lastSecurityAt = now;
  state.securityWarnings += 1;
  replaceCurrentQuestion();
  renderQuestion();

  if (state.securityWarnings >= MAX_SECURITY_WARNINGS) {
    state.lockedBySecurity = true;
    els.feedback.textContent = "ระบบปิดการส่งคำตอบแล้ว เพราะมีการออกจากหน้าจอหลายครั้ง";
    els.feedback.classList.add("bad");
  } else {
    els.feedback.textContent = `ระบบตรวจพบการ${reason} จึงสุ่มโจทย์ข้อปัจจุบันใหม่`;
    els.feedback.classList.add("bad");
  }

  els.focusGuard.classList.remove("hidden");
  updateSecurityUI();
  updateProgress();
}

function blockBrowserShortcuts(event) {
  const key = event.key.toLowerCase();
  const blocked =
    key === "f12" ||
    (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
    (event.ctrlKey && ["u", "s", "p"].includes(key));

  if (blocked) {
    event.preventDefault();
    handleSecurityEvent("ใช้คีย์ลัดที่ไม่อนุญาต");
  }
}

function detectDevtoolsByViewport() {
  if (!state.started || state.submitted || state.lockedBySecurity) return;
  const widthGap = window.outerWidth - window.innerWidth;
  const heightGap = window.outerHeight - window.innerHeight;
  if (widthGap > 180 || heightGap > 180) handleSecurityEvent("เปิดเครื่องมือตรวจสอบหน้าเว็บ");
}

function isLikelySplitScreen() {
  const viewport = window.visualViewport || window;
  const width = viewport.width || window.innerWidth;
  const height = viewport.height || window.innerHeight;
  const screenWidth = window.screen?.width || width;
  const screenHeight = window.screen?.height || height;
  const narrowPhoneArea = width < 360 || height < 520;
  const reducedTabletWidth = screenWidth >= 700 && width / screenWidth < 0.72;
  const reducedScreenHeight = screenHeight >= 700 && height / screenHeight < 0.62;
  return narrowPhoneArea || reducedTabletWidth || reducedScreenHeight;
}

function updateScreenGuard() {
  if (!state.started || state.submitted) {
    state.screenBlocked = false;
    els.screenGuard.classList.add("hidden");
    updateProgress();
    return;
  }

  const blocked = isLikelySplitScreen();
  state.screenBlocked = blocked;
  els.screenGuard.classList.toggle("hidden", !blocked);

  if (blocked) {
    els.feedback.textContent =
      state.mode === "test"
        ? "กรุณากลับสู่เต็มหน้าจอก่อนบันทึกหรือส่งคำตอบ"
        : "ระบบพบว่าพื้นที่หน้าจอเล็กผิดปกติ แนะนำให้เปิดเต็มหน้าจอเพื่อฝึกเหมือนสอบจริง";
    els.feedback.classList.toggle("bad", state.mode === "test");
  }

  updateProgress();
}

els.studentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.player = {
    title: els.title.value.trim(),
    name: els.name.value.trim(),
    nickname: els.nickname.value.trim(),
    room: els.room.value.trim(),
    number: els.number.value.trim(),
    testRound: els.testRound.value,
  };

  if (!state.player.name) {
    els.name.focus();
    return;
  }

  savePlayer();
  startQuiz();
});

els.practiceModeBtn.addEventListener("click", startPracticeImmediately);
els.testModeBtn.addEventListener("click", () => els.testModeModal.classList.remove("hidden"));
els.startTestModeBtn.addEventListener("click", () => {
  els.testModeModal.classList.add("hidden");
  enterMode("test");
});
els.cancelTestModeBtn.addEventListener("click", () => els.testModeModal.classList.add("hidden"));

els.answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveCurrentAnswer();
});

els.clearBtn.addEventListener("click", clearCurrentAnswer);
els.prevBtn.addEventListener("click", () => {
  state.currentIndex = Math.max(0, state.currentIndex - 1);
  renderQuestion();
});
els.nextBtn.addEventListener("click", () => {
  state.currentIndex = Math.min(TOTAL_QUESTIONS - 1, state.currentIndex + 1);
  renderQuestion();
});
els.submitBtn.addEventListener("click", requestSubmitQuiz);
els.confirmSubmitBtn.addEventListener("click", submitQuiz);
els.continueBtn.addEventListener("click", () => els.submitModal.classList.add("hidden"));
els.restartBtn.addEventListener("click", startQuiz);
els.againBtn.addEventListener("click", startQuiz);
els.homeBtn.addEventListener("click", () => {
  state.started = false;
  state.screenBlocked = false;
  els.screenGuard.classList.add("hidden");
  show(els.homeView);
});
els.resumeBtn.addEventListener("click", () => els.focusGuard.classList.add("hidden"));
els.screenGuardBtn.addEventListener("click", updateScreenGuard);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) handleSecurityEvent("สลับหน้าต่างหรือแอป");
});
window.addEventListener("blur", () => handleSecurityEvent("ออกจากหน้าจอแบบฝึกหัด"));
window.addEventListener("resize", () => {
  updateScreenGuard();
  fitExpressionText();
});
window.addEventListener("orientationchange", () => window.setTimeout(updateScreenGuard, 250));
document.addEventListener("keydown", blockBrowserShortcuts);
document.addEventListener("contextmenu", (event) => {
  if (state.started && !state.submitted) {
    event.preventDefault();
    handleSecurityEvent("คลิกขวา");
  }
});
document.addEventListener("copy", (event) => {
  if (state.started && !state.submitted) event.preventDefault();
});
document.addEventListener("paste", (event) => {
  if (state.started && !state.submitted) event.preventDefault();
});

restorePlayer();
show(els.homeView);
