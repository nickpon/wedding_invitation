/**
 * Google Sheets RSVP receiver for the wedding invitation site.
 *
 * SETUP (one time):
 * 1. Create a Google Sheet (e.g. "Свадьба — ответы гостей").
 * 2. Extensions → Apps Script → paste this file → Save.
 * 3. Run createSheetHeader once (select function → Run → allow access).
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into .env as VITE_RSVP_SCRIPT_URL=...
 * 6. Rebuild the site: npm run build
 */

const SHEET_NAME = 'Ответы';

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

/** Run once from the Apps Script editor to create column headers. */
function createSheetHeader() {
  const sheet = getSheet_();
  sheet.clear();
  sheet.appendRow([
    'Дата ответа',
    'Придёт',
    'Имя гостя',
    'Напитки',
    'Блюдо',
    'Аллергии',
    'Комментарий',
    'Трансфер',
  ]);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * Run once after upgrading — adds the "Трансфер" header to column H
 * without clearing existing rows.
 */
function addTransferColumn() {
  const sheet = getSheet_();
  if (sheet.getRange(1, 8).getValue() !== 'Трансфер') {
    sheet.getRange(1, 8).setValue('Трансфер');
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  try {
    const raw = e.postData && e.postData.contents;
    if (!raw) {
      return jsonResponse_({ ok: false, error: 'Пустой запрос' });
    }

    const data = JSON.parse(raw);
    const sheet = getSheet_();

    if (sheet.getLastRow() === 0) {
      createSheetHeader();
    }

    sheet.appendRow([
      data.submittedAt ? new Date(data.submittedAt) : new Date(),
      data.attending || '',
      data.name || '',
      Array.isArray(data.drinks) ? data.drinks.join(', ') : data.drinks || '',
      data.meal || '',
      data.allergies || '',
      data.comment || '',
      data.transfer || '',
    ]);

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'RSVP endpoint is running' });
}
