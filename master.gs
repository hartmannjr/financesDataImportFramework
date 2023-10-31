function run() { 
  var errorlog = [];

  var sources = ["Asset","Liability","Chase","Sams"];
  for (var i = 0; i < sources.length; i++) {
    var handler = getDataHandler(sources[i]);
    
    if (handler instanceof Error){
      errorlog.push(handler.message);
    } else {
      if (sources[i] === "Asset" || sources[i] === "Liability") {
        var result = handler(sources[i]);
        
        if (result instanceof Error){
          errorlog.push(result.message); // add error message return later
        }
      } else {
        var importLabels = {};
        var importedLabel = GmailApp.getUserLabelByName("Imports/Imported");

        if (importedLabel === null) {
          let errormessage = "Label not found: Imports/Imported";
          console.error(errormessage);
          errorlog.push(errormessage);
          return;
        }
        
        for (var i = 2; i < sources.length; i++) {
          importLabels[sources[i]] = GmailApp.getUserLabelByName("Imports/" + sources [i] + "Imports");
        }
        
        for (var i = 2; i < sources.length; i++) {
          var result = myGetMessages(sources[i], handler, importLabels[sources[i]], importedLabel);
          if (result instanceof Error) {
            errorlog.push(result.message);
          }
        }
      }
    }
  }
  if (errorlog.length > 0) {
  sendErrorEmail(errorlog);
  }
}

function getDataHandler(source) {
  var handlers = {
    "Asset"       : importAssetLiability,
    "Liability"   : importAssetLiability,
    "Chase"       : importCCData,
    "Sams"        : importCCData,
  };
  
  let handler = handlers[source];

  if (!handler) {
    let errormessage = "Unable to process data from source: " + source + ". Data handler not defined.";
    console.error(errormessage);
    return new Error(errormessage);
  }
  return handler;
}

function myGetMessages(source, handler, label, importedLabel) {
  if (label === null) {
    let errormessage = "Unable to process emails from source: " + source + ". Label not found.";
    console.error(errormessage);
    return new Error(errormessage);
  }
  var threads = label.getThreads();
  
  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    var handlerResult = handler(messages, source);
    
    if (handlerResult instanceof Error) {
      return new Error(handlerResult);
    } else {
      thread.removeLabel(label);
      thread.addLabel(importedLabel);
    }
  });
}

function sendErrorEmail(errorlog) {
  var currentTime = new Date();
  var formattedTime = Utilities.formatDate(currentTime, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  var recipient = Session.getEffectiveUser().getEmail();
  var subject = "Error results from Finances Data Import Job"
  var body = "Job Time: " + formattedTime + 
  "\nThe follow error";
  if (errorlog > 1) {body += "s"}
  body += " occured while running the Finances Data Import Job:\n\n"; 
  for (var i = 0; i < errorlog.length; i++)
  {
    body += errorlog[i] + "\n";
  }

  MailApp.sendEmail(recipient, subject, body);
}
