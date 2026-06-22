const TOTAL_QUESTIONS = 15;
const MAX_LEADING_COEFFICIENT = 6;
const STORAGE_KEY = "polynomial_factor_player_v1";

const state = {
  player: { title: "นาย", name: "", nickname: "", room: "", number: "", testRound: "ครั้งที่ 1" },
  mode: "practice",
  questions: [],
  oddQuestions: [],
  evenQuestions: [],
  classIndex: 0,
  currentIndex: 0,
  started: false,
  submitted: false,
};

const els = {
  homeView: document.querySelector("#homeView"),
  loginView: document.querySelector("#loginView"),
  quizView: document.querySelector("#quizView"),
  classTestView: document.querySelector("#classTestView"),
  classAnswerView: document.querySelector("#classAnswerView"),
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
  submitModal: document.querySelector("#submitModal"),
  missingText: document.querySelector("#missingText"),
  confirmSubmitBtn: document.querySelector("#confirmSubmitBtn"),
  continueBtn: document.querySelector("#continueBtn"),
  classQuestionNav: document.querySelector("#classQuestionNav"),
  oddProblem: document.querySelector("#oddProblem"),
  evenProblem: document.querySelector("#evenProblem"),
  oddSolutions: document.querySelector("#oddSolutions"),
  evenSolutions: document.querySelector("#evenSolutions"),
  classPrevBtn: document.querySelector("#classPrevBtn"),
  classNextBtn: document.querySelector("#classNextBtn"),
  classHomeBtn: document.querySelector("#classHomeBtn"),
  classRestartBtn: document.querySelector("#classRestartBtn"),
  showClassAnswersBtn: document.querySelector("#showClassAnswersBtn"),
  backToClassTestBtn: document.querySelector("#backToClassTestBtn"),
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
  let factorB = [1, pick(pool.constants)];
  let poly = multiplyFactors(factorA, factorB);
  let attempts = 0;

  while (
    (poly.a > MAX_LEADING_COEFFICIENT || (level >= 7 && level < 10 && (poly.a < 2 || poly.a > 4)) || poly.c === 0 || poly.b === 0 || Math.abs(poly.b) > 30 || Math.abs(poly.c) > 72) &&
    attempts < 40
  ) {
    factorA = [pick(pool.coefs), pick(pool.constants)];
    factorB = [1, pick(pool.constants)];
    poly = multiplyFactors(factorA, factorB);
    attempts += 1;
  }

  return {
    id: level + 1,
    kind: "factor",
    topic: pool.topic,
    poly,
    answerFactors: [factorA, factorB],
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
  let degree = randInt(2, 4);
  let coeffs = [];
  let root = 1;
  let remainder = 0;
  let attempts = 0;

  do {
    degree = randInt(2, 4);
    coeffs = Array.from({ length: degree + 1 }, (_, power) => {
      if (power === degree) return pick([1, 2, 3]);
      return randInt(-4, 4);
    });
    root = pick([-3, -2, -1, 1, 2, 3]);
    remainder = evaluatePoly(coeffs, root);
    attempts += 1;
  } while ((Math.abs(remainder) > 99 || remainder === 0) && attempts < 80);

  return {
    id: level + 1,
    kind: "number",
    topic: "ทฤษฎีบทเศษเหลือ",
    expression: `${formatPolynomialFromCoeffs(coeffs)} หารด้วย (${formatLinearDivisor(root)})`,
    instruction: "จงหาเศษจากการหารพหุนามนี้",
    answerLabel: "เศษ",
    answerValues: [remainder],
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

function generateQuestionSet() {
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

  return questions;
}

function show(view) {
  [els.homeView, els.loginView, els.quizView, els.classTestView, els.classAnswerView, els.resultView].forEach((item) => item.classList.add("hidden"));
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
  els.submitModal.classList.add("hidden");
  els.studentTag.textContent = makeStudentTag();
  els.feedback.textContent = "พร้อมทำข้อแรกแล้ว";
  els.feedback.classList.remove("bad");
  show(els.quizView);
  buildNav();
  renderQuestion();
  updateProgress();
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

function fitClassExpressions() {
  document.querySelectorAll(".class-problem .expression").forEach((node) => {
    node.style.fontSize = "";
    window.requestAnimationFrame(() => {
      const maxSize = Number.parseFloat(getComputedStyle(node).fontSize);
      const minSize = window.innerWidth <= 560 ? 14 : 18;
      let size = maxSize;
      while (node.scrollWidth > node.clientWidth && size > minSize) {
        size -= 1;
        node.style.fontSize = `${size}px`;
      }
    });
  });
}

function renderClassProblem(q) {
  return `
    <div class="class-problem">
      <div class="expression">${q.expression}</div>
      <p class="instruction">${q.instruction || (q.poly?.a === 1 ? "จงแยกตัวประกอบให้อยู่ในรูป (x + b)(x + d)" : "จงแยกตัวประกอบให้อยู่ในรูป (ax + b)(cx + d)")}</p>
    </div>
  `;
}

function startClassTest() {
  state.mode = "class";
  state.oddQuestions = generateQuestionSet();
  state.evenQuestions = generateQuestionSet();
  state.classIndex = 0;
  buildClassNav();
  renderClassPair();
  show(els.classTestView);
}

function buildClassNav() {
  els.classQuestionNav.innerHTML = "";
  state.oddQuestions.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "qbtn";
    btn.textContent = q.id;
    btn.addEventListener("click", () => {
      state.classIndex = index;
      renderClassPair();
    });
    els.classQuestionNav.append(btn);
  });
}

function renderClassPair() {
  els.oddProblem.innerHTML = renderClassProblem(state.oddQuestions[state.classIndex]);
  els.evenProblem.innerHTML = renderClassProblem(state.evenQuestions[state.classIndex]);
  [...els.classQuestionNav.children].forEach((btn, index) => btn.classList.toggle("current", index === state.classIndex));
  els.classPrevBtn.disabled = state.classIndex === 0;
  els.classNextBtn.disabled = state.classIndex === TOTAL_QUESTIONS - 1;
  fitClassExpressions();
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
  els.submitBtn.disabled = false;
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

function formatFactorPair(factor) {
  const [coef, constant] = factor;
  const xTerm = coef === 1 ? "x" : coef === -1 ? "-x" : `${coef}x`;
  return `(${xTerm} ${constant >= 0 ? "+" : "-"} ${Math.abs(constant)})`;
}

function formatExpectedAnswer(q) {
  if (q.kind === "factor") {
    return `${formatFactorPair(q.answerFactors[0])}${formatFactorPair(q.answerFactors[1])}`;
  }
  return q.answerValues.join(", ");
}

function renderSolutionCard(q) {
  return `
    <div class="solution-card">
      <strong>ข้อ ${q.id}</strong>
      <div class="expression">${q.expression}</div>
      <p class="instruction">${q.instruction || (q.poly?.a === 1 ? "จงแยกตัวประกอบให้อยู่ในรูป (x + b)(x + d)" : "จงแยกตัวประกอบให้อยู่ในรูป (ax + b)(cx + d)")}</p>
      <div class="solution-answer">คำตอบ: ${formatExpectedAnswer(q)}</div>
    </div>
  `;
}

function showClassAnswers() {
  els.oddSolutions.innerHTML = state.oddQuestions.map(renderSolutionCard).join("");
  els.evenSolutions.innerHTML = state.evenQuestions.map(renderSolutionCard).join("");
  show(els.classAnswerView);
  fitClassExpressions();
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
  els.scoreLine.textContent = `คะแนนรวม: ${score} / ${TOTAL_QUESTIONS}`;
  els.scoreTenLine.textContent = `คิดเป็น ${scoreTen}/10 คะแนน`;
  els.securitySummary.textContent = "";
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
}

function requestSubmitQuiz() {
  const missing = state.questions.filter((q) => !q.userAnswer).map((q) => q.id);
  if (missing.length === 0) {
    submitQuiz();
    return;
  }

  els.missingText.textContent = `ยังไม่ได้ตอบข้อ ${missing.join(", ")} ต้องการส่งคำตอบเลยหรือไม่`;
  els.submitModal.classList.remove("hidden");
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
els.testModeBtn.addEventListener("click", startClassTest);

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
  show(els.homeView);
});
els.classPrevBtn.addEventListener("click", () => {
  state.classIndex = Math.max(0, state.classIndex - 1);
  renderClassPair();
});
els.classNextBtn.addEventListener("click", () => {
  state.classIndex = Math.min(TOTAL_QUESTIONS - 1, state.classIndex + 1);
  renderClassPair();
});
els.classHomeBtn.addEventListener("click", () => show(els.homeView));
els.classRestartBtn.addEventListener("click", startClassTest);
els.showClassAnswersBtn.addEventListener("click", showClassAnswers);
els.backToClassTestBtn.addEventListener("click", () => show(els.classTestView));

window.addEventListener("resize", () => {
  fitExpressionText();
  fitClassExpressions();
});

restorePlayer();
show(els.homeView);
