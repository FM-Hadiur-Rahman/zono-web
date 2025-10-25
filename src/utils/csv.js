export function toCSV(rows, headers) {
  const headerLine = headers.map((h) => JSON.stringify(h.label ?? h)).join(",");
  const body = rows
    .map((r) =>
      headers.map((h) => JSON.stringify(r[h.key ?? h] ?? "")).join(",")
    )
    .join("\n");
  return headerLine + "\n" + body;
}

export function downloadCSV(csvText, filename = "attendance.csv") {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
