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
