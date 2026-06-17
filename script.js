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
