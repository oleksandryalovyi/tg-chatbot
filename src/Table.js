class Table {
  static GenerateMarkdownTable(data) {
    const colWidths = 10;
    let markdown = "```\n";

    Object.keys(data[0]).forEach((header, i) => {
      markdown += header.padEnd(colWidths) + " ";
    });
    markdown += "\n";

    Object.keys(data[0]).forEach((width) => {
      markdown += "-".repeat(width) + " ";
    });
    markdown += "\n";

    data.forEach((row) => {
      Object.values(row).forEach((value, i) => {
        markdown += String(value).padEnd(colWidths) + " ";
      });
      markdown += "\n";
    });

    markdown += "```";
    return markdown;
  }
}

export default Table;
