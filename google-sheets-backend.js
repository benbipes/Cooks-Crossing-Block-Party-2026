/**
 * GOOGLE SHEETS BACKEND FOR COOKS CROSSING BLOCK PARTY 2026
 * ---------------------------------------------------------
 * Follow these simple 2-minute steps to enable multi-device sync
 * across all neighbors' phones and computers on GitHub Pages:
 *
 * 1. Open Google Sheets (https://sheets.new) and name the spreadsheet:
 *    "Cooks Crossing Potluck 2026"
 *
 * 2. In the menu, click:
 *    Extensions > Apps Script
 *
 * 3. Delete any code in the editor, and PASTE THIS ENTIRE SCRIPT below.
 *
 * 4. Click the blue "Deploy" button (top right) > "New deployment".
 *
 * 5. Configure the deployment:
 *    - Click the gear icon (Select type) > Choose "Web app"
 *    - Description: "Potluck Sync API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (CRITICAL: Select "Anyone", NOT "Only myself")
 *
 * 6. Click "Deploy", approve permissions with your Google account.
 *
 * 7. Copy the "Web app URL" (it looks like: https://script.google.com/macros/s/AKfycb.../exec).
 *
 * 8. Open config.js in your project and set:
 *    googleSheetWebAppUrl: "https://script.google.com/macros/s/YOUR_ID/exec"
 *
 * 9. Commit & push config.js to GitHub:
 *    git add config.js && git commit -m "Connect Google Sheets live sync" && git push origin main
 *
 * That's it! Every device and phone that visits your GitHub Pages site
 * will now automatically share the same live potluck list!
 */

function doGet(e) {
  var sheet = getOrCreateSheet();
  var rows = sheet.getDataRange().getValues();
  
  if (rows.length <= 1) {
    return createJsonResponse({ status: "success", dishes: [] });
  }

  var dishes = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0] && !row[1]) continue; // skip blank rows
    
    var dietaryArray = [];
    if (row[4]) {
      dietaryArray = String(row[4]).split(",").map(function(s) { return s.trim(); }).filter(Boolean);
    }

    dishes.push({
      id: String(row[0] || ("dish-" + i)),
      name: String(row[1] || ""),
      contributor: String(row[2] || ""),
      category: String(row[3] || "salads"),
      dietary: dietaryArray,
      notes: String(row[5] || ""),
      likes: parseInt(row[6]) || 1,
      createdAt: row[7] ? Number(row[7]) : Date.now()
    });
  }

  return createJsonResponse({ status: "success", dishes: dishes });
}

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var data = {};
    
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    // Handle "like" action
    if (data.action === "like" && data.id) {
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
          var currentLikes = parseInt(rows[i][6]) || 0;
          sheet.getRange(i + 1, 7).setValue(currentLikes + 1);
          return createJsonResponse({ status: "success", message: "Liked dish" });
        }
      }
      return createJsonResponse({ status: "error", message: "Dish not found" });
    }

    // Handle "add dish"
    var id = data.id || ("dish-" + Date.now());
    var name = data.name || "Untitled Dish";
    var contributor = data.contributor || "Neighbor";
    var category = data.category || "salads";
    var dietary = Array.isArray(data.dietary) ? data.dietary.join(", ") : (data.dietary || "");
    var notes = data.notes || "";
    var likes = data.likes || 1;
    var createdAt = data.createdAt || Date.now();

    sheet.appendRow([id, name, contributor, category, dietary, notes, likes, createdAt]);

    return createJsonResponse({ status: "success", dish: { id: id, name: name } });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  // Create header row if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "Dish Name", "Contributor", "Category", "Dietary", "Notes", "Likes", "Created At (ms)"]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#fef3c7");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
