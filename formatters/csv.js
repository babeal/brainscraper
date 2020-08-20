const fs = require("fs").promises;
const { EOL } = require("os");


class CsvFileFormatter {
  file;

  async open(fileName) {
    fileName = fileName.replace(/[\/|&;$%@"<>()+,]/g, "_");
    this.file = await fs.open(`${fileName}.csv`, "w");
  }

  async write(card) {
    const cardText = `"${card.question}","${card.answer}"${EOL}`
    await this.file.appendFile(cardText)
  }

  async close() {
    await this.file.close()
  }

}

module.exports = CsvFileFormatter;