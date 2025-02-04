import * as path from "node:path";

export const FileNameRegex = /^\d\d-(.+)$/;

export function getTitleFromFile(file: string) {
  const acronyms = ["css", "ui", "cli"];
  const connectives = ["and"];
  const parsed = path.parse(file);
  const name =
    parsed.name === "index" ? path.basename(parsed.dir) : parsed.name;

  const match = FileNameRegex.exec(name);
  const title = match ? match[1] : name;

  const segs = title.split("-");
  for (let i = 0; i < segs.length; i++) {
    if (acronyms.includes(segs[i])) {
      segs[i] = segs[i].toUpperCase();
    } else if (!connectives.includes(segs[i])) {
      segs[i] = segs[i].slice(0, 1).toUpperCase() + segs[i].slice(1);
    }
  }

  const out = segs.join(" ");
  return out.length > 0 ? out : "Overview";
}
