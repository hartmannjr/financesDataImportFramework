function importCCData(messages, source) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CC Averages");

  // constants
  
  if (sheet === null) {
      let errormessage = "Unable to process data from source: " + source + ". Sheet not found."
      console.error(errormessage);
      return new Error(errormessage);
  }

  var editor = getDataEditor(source);

  var data = [];
  for (let i = 0; i < messages.length; i++)
  {
    var msg = messages[i].getPlainBody().toString();
    var msgData = editor(msg);
    data.push(msgData);
  }
  var column;
  var sheetdata;
  var lastRow;
  if (data.length > 0) {
    if (source === "Chase") {
      column = 4;
      sheetdata = sheet.getRange("D:E").getValues();
    } else {
      column = 1;
      sheetdata = sheet.getRange("A:B").getValues();
    }

    for (let i = sheetdata.length - 1; i >= 0; i--) {
      var row = sheetdata[i];
      if (row[0] === '' && row [1] === '') {
        lastRow = i + 1;
      }
    }
    sheet.getRange(lastRow, column, data.length, data[0].length).setValues(data);
  }
}

function getDataEditor(source) {
  var editors = {
    "Chase" : editChaseData,
    "Sams"  : editSamsData,
  };

  let editor = editors[source];

  if (!editors) {
    let errormessage = "Unable to process data from source: " + source + ". Data editor not defined.";
    console.error(errormessage);
    return new Error(errormessage);
  }
  return editor;
}

function editChaseData(msg) {
  var layers = msg.split("Chase Logo")[1].split("\n");
  var amount = layers[3].split("$")[1].trim();
  var date = layers[4].split(":")[1].trim();
  var msgData = [date,amount];
  return msgData;
}
 
function editSamsData(msg) {
  var layers = msg.split("Hi ")[1].split("\n");
  var amount = layers[4].split("$")[1].trim();
  var date = layers[6].split(":")[1].trim();
  var msgData = [date, amount];
  return msgData;
}
