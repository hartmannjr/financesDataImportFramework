// main method determines file and sheet to use, parses the CSV into an array, and imports the data.
function importAssetLiability(type)
{
  var file = DriveApp.getFoldersByName(type+"Import").next().getFilesByName("trends.csv").next();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(type+"Import");
  var csvData = Utilities.parseCsv(file.getBlob().getDataAsString());
  
  var fileLastUpdated = Utilities.formatDate(file.getLastUpdated(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var sheetLastUpdated = getSheetLastUpdated(sheet);
  
  // doesn't run if the last date in the sheet and the file modify date are the same, meaning the data for that day has already been uploaded.
  if(fileLastUpdated != sheetLastUpdated)
  {
    modifyCSV(csvData,file);

    sheet.getRange(sheet.getLastRow()+1,1,csvData.length, csvData[0].length).setValues(csvData);
  }

}

// finds the most recent date at the bottom of the sheet
function getSheetLastUpdated(sheet)
{
  var lastRow = sheet.getLastRow();
  var rowValue = sheet.getRange(lastRow,1).getValue();
  if (rowValue != "Account")
  {
    var sheetLastUpdated = Utilities.formatDate(rowValue, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  
  return sheetLastUpdated;
}

// trims the header and footer off of mints csv files, then injects the files last modified date into each line
// this because this code is triggered daily, and will append any new data to the bottom of the list, with the modified date
function modifyCSV(csvData,file)
{
  var csvDataNoHeader = csvData.splice(0,1);
  var csvDataNoFooter = csvData.splice(-1,1);
  var date = Utilities.formatDate(file.getLastUpdated(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  csvData.forEach(row => row.unshift(date));
  return csvData;
}
