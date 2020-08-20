const fs = require("fs");
const { EOL } = require("os");
const path = require("path");


class CsvFileWriter {
  file;

  async open(deckName, packName) {
    const fileName = this.buildFilePath(deckName, packName);
    console.log(fileName);
    this.file = await fs.promises.open(fileName, "w");
  }

  async write(card) {
    const cardText = `"${card.question}","${card.answer}"${EOL}`
    await this.file.appendFile(cardText);
  }

  async close() {
    await this.file.close();
  }

  sanitizeString(text) {
    return text.replace(/[\/|&;$%@"<>()+,]/g, "_");
  }

  buildFilePath(deckName, packName) {
    deckName = this.sanitizeString(deckName);

    let paths = ["./output"];

    if (packName) {
      paths.push(this.sanitizeString(packName));
    }

    fs.mkdirSync(path.join(...paths), { recursive: true });

    paths.push(`${deckName}.csv`);
    return path.join(...paths);
  }

}

module.exports = CsvFileWriter;