// Генеруємо HTML таблицю зі стилями
function generateTable(data) {
  const colWidths = [15, 15, 10]; // Задаємо фіксовану ширину для кожної колонки
  let markdown = "```\n"; // Відкриваємо блок коду для використання моноширинного шрифту

  // Заголовки таблиці
  Object.keys(data[0]).forEach((header, i) => {
    markdown += header.padEnd(colWidths[i]) + " ";
  });
  markdown += "\n";

  // Роздільники
  colWidths.forEach((width) => {
    markdown += "-".repeat(width) + " ";
  });
  markdown += "\n";

  // Рядки таблиці
  data.forEach((row) => {
    Object.values(row).forEach((value, i) => {
      markdown += String(value).padEnd(colWidths[i]) + " ";
    });
    markdown += "\n";
  });

  markdown += "```"; // Закриваємо блок коду
  return markdown;
}

module.exports = generateTable;
