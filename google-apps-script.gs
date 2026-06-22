const SHEET_NAME = "scores";

function doPost(e) {
  const payloadText = e.parameter.payload;
  if (!payloadText) {
    return jsonResponse({ status: "error", message: "missing payload" });
  }

  const data = JSON.parse(payloadText);
  const sheet = getScoreSheet();

  sheet.appendRow([
    new Date(),
    data.submittedAt || "",
    data.testRound || "",
    data.room || "",
    data.number || "",
    data.title || "",
    data.name || "",
    data.nickname || "",
    data.score || 0,
    data.total || 0,
    data.scoreTen || 0,
    data.securityWarnings || 0,
    JSON.stringify(data.details || []),
  ]);

  return jsonResponse({ status: "ok" });
}

function getScoreSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "received_at",
      "submitted_at",
      "test_round",
      "room",
      "number",
      "title",
      "name",
      "nickname",
      "score",
      "total",
      "score_10",
      "security_warnings",
      "details_json",
    ]);
  }

  return sheet;
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
