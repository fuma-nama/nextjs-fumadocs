import { loader } from "fumadocs-core/source";

const FileNameRegex = /^\d\d-(.+)$/;

export const isLocal =
  process.env.LOCAL || process.env.NEXT_PHASE === "phase-production-build";

export const source = loader({
  baseUrl: "/docs",
  // lazy load required source, reduce memory usage
  source: isLocal
    ? await import("./sources/local").then((mod) => mod.createLocalSource())
    : await import("./sources/github").then((mod) => mod.createGitHubSource()),
  slugs(info) {
    const segments = info.flattenedPath
      .split("/")
      .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")))
      .map((seg) => {
        const res = FileNameRegex.exec(seg);

        return res ? res[1] : seg;
      });

    if (segments.at(-1) === "index") {
      segments.pop();
    }

    return segments;
  },
});
