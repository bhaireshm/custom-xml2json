var prompt = require("prompt");
var parseString = require("xml2js").parseString;
const path = require("path");
const fs = require("fs");

start();

function start() {
  prompt.start();

  prompt.get(["xmlUrl", "valueName"], function (err, result) {
    var xmlUrl = result.xmlUrl.replace(/"/g, "");
    if (xmlUrl == "0") process.exit(-1);

    var savePath = xmlUrl.split("\\");
    const valueName = result.valueName ? result.valueName : false;

    var fileName = savePath[savePath.length - 1].replace(".xml", ".json");

    // removing last element
    savePath.splice(savePath.length - 1, 1);
    savePath = savePath.join("\\");

    var xmlData = fs.readFileSync(xmlUrl, "utf-8");

    //  covert xml to json
    parseString(xmlData, function (err, result) {
      // extract list of data
      var data = result.codeList.code;

      data.forEach((d) => {
        // remove description
        delete d.description;

        d["codeListVersion"] = typeof d.name == "object" ? d.name[0] : d.name;
        delete d.name;

        d["value"] = typeof d.value == "object" ? d.value[0] : d.value;

        if (valueName) {
          d[valueName] = typeof d.value == "object" ? d.value[0] : d.value;
          delete d.value;
        }
      });

      // save it as json
      fs.writeFileSync(path.join(savePath, fileName), JSON.stringify(data));
      console.info(
        "\nData extraction completed",
        path.join(savePath, fileName),
        "\n"
      );

      // List converted XML's
      const completedModelsFileName = "completed-models.json";
      const content = JSON.parse(
        fs.readFileSync(completedModelsFileName, "utf-8")
      );
      if (!content.some((c) => c == fileName)) content.push(fileName);
      fs.writeFileSync(completedModelsFileName, JSON.stringify(content));

      // restart
      start();
    });
  });
}
