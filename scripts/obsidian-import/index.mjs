import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const rootDir = process.cwd();
const configPath = path.join(rootDir, "config", "obsidian-import.config.json");
const candidatesPath = path.join(rootDir, "data", "obsidian-candidates.json");
const statePath = path.join(rootDir, "data", "obsidian-import-state.json");
const importedRoot = path.join(rootDir, "src", "content", "blog", "imported");

const command = process.argv[2] ?? "run";

async function main() {
  const config = await readJson(configPath);
  const state = await readJson(statePath);
  const sourceRoot = await resolveSourceRoot(config);

  if (!sourceRoot) {
    throw new Error(
      "Missing Obsidian source path. Set OBSIDIAN_SOURCE_PATH or config.source.localPath.",
    );
  }

  if (command === "scan-backfill") {
    const files = await collectMarkdownFiles(sourceRoot);
    const candidates = await buildCandidates(
      files,
      sourceRoot,
      config,
      state,
      false,
    );
    await writeJson(candidatesPath, {
      generatedAt: new Date().toISOString(),
      items: candidates,
    });
    console.log(
      `Backfill scan complete: ${candidates.length} candidate records.`,
    );
    return;
  }

  if (command === "scan-incremental") {
    const files = await collectIncrementalFiles(sourceRoot, state);
    const candidates = await buildCandidates(
      files,
      sourceRoot,
      config,
      state,
      true,
    );
    const existing = await readJson(candidatesPath);
    const merged = mergeCandidates(existing.items ?? [], candidates);
    const headCommit = await getHeadCommit(sourceRoot);
    await writeJson(candidatesPath, {
      generatedAt: new Date().toISOString(),
      items: merged,
    });
    await writeJson(statePath, {
      ...state,
      sourceHeadCommit: headCommit,
      lastIncrementalScanAt: new Date().toISOString(),
    });
    console.log(
      `Incremental scan complete: ${candidates.length} changed candidate records.`,
    );
    return;
  }

  if (command === "build-drafts") {
    const candidates = await readJson(candidatesPath);
    const result = await buildDrafts(
      candidates.items ?? [],
      sourceRoot,
      config,
      state,
    );
    await writeJson(statePath, result.state);
    console.log(
      `Draft build complete: ${result.generatedCount} files written.`,
    );
    return;
  }

  if (command === "run") {
    const files = await collectIncrementalFiles(sourceRoot, state);
    const candidates = await buildCandidates(
      files,
      sourceRoot,
      config,
      state,
      true,
    );
    const existing = await readJson(candidatesPath);
    const merged = mergeCandidates(existing.items ?? [], candidates);
    const result = await buildDrafts(merged, sourceRoot, config, state);
    const headCommit = await getHeadCommit(sourceRoot);
    await writeJson(candidatesPath, {
      generatedAt: new Date().toISOString(),
      items: merged,
    });
    await writeJson(statePath, {
      ...result.state,
      sourceHeadCommit: headCommit,
      lastIncrementalScanAt: new Date().toISOString(),
    });
    console.log(
      `Run complete: ${candidates.length} candidates refreshed, ${result.generatedCount} drafts written.`,
    );
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

async function resolveSourceRoot(config) {
  const configuredPath =
    process.env.OBSIDIAN_SOURCE_PATH ?? config.source?.localPath;
  if (!configuredPath) return null;
  const resolved = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(rootDir, configuredPath);
  await fs.access(resolved);
  return resolved;
}

async function collectMarkdownFiles(sourceRoot) {
  const files = [];
  await walk(sourceRoot, files);
  return files.filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
}

async function walk(dir, bucket) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, bucket);
      continue;
    }
    bucket.push(fullPath);
  }
}

async function collectIncrementalFiles(sourceRoot, state) {
  const lastCommit = state.sourceHeadCommit;
  if (!lastCommit) {
    return collectMarkdownFiles(sourceRoot);
  }

  try {
    const headCommit = await getHeadCommit(sourceRoot);
    if (headCommit === lastCommit) {
      return [];
    }

    const { stdout } = await execFileAsync(
      "git",
      [
        "-C",
        sourceRoot,
        "diff",
        "--name-only",
        `${lastCommit}..${headCommit}`,
        "--",
        "*.md",
        "*.mdx",
      ],
      { cwd: sourceRoot },
    );

    return stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((relativePath) => path.join(sourceRoot, relativePath));
  } catch {
    return collectMarkdownFiles(sourceRoot);
  }
}

async function getHeadCommit(sourceRoot) {
  const { stdout } = await execFileAsync(
    "git",
    ["-C", sourceRoot, "rev-parse", "HEAD"],
    {
      cwd: sourceRoot,
    },
  );
  return stdout.trim();
}

async function buildCandidates(
  files,
  sourceRoot,
  config,
  state,
  incrementalOnly,
) {
  const candidates = [];

  for (const file of files) {
    const relativePath = normalizePath(path.relative(sourceRoot, file));
    if (!isTrackedExtension(file)) continue;

    const content = await fs.readFile(file, "utf8");
    const parsed = parseFrontmatter(content);
    const metrics = scoreNote(
      relativePath,
      parsed.body,
      parsed.frontmatter,
      config,
    );
    const fileHash = hashContent(parsed.body);

    const existingState = state.notes?.[relativePath];
    if (incrementalOnly && existingState?.contentHash === fileHash) {
      continue;
    }

    candidates.push({
      sourcePath: relativePath,
      title: deriveTitle(relativePath, parsed.frontmatter, parsed.body),
      lastModifiedAt: (await fs.stat(file)).mtime.toISOString(),
      score: metrics.score,
      classification: metrics.classification,
      riskLevel: metrics.riskLevel,
      reasons: metrics.reasons,
      imported: Boolean(existingState?.blogSlug),
      blogSlug: existingState?.blogSlug ?? null,
      contentHash: fileHash,
    });
  }

  return candidates.sort((left, right) => right.score - left.score);
}

function isTrackedExtension(file) {
  return file.endsWith(".md") || file.endsWith(".mdx");
}

function parseFrontmatter(rawContent) {
  if (!rawContent.startsWith("---\n")) {
    return { frontmatter: {}, body: rawContent.trim() };
  }

  const end = rawContent.indexOf("\n---\n", 4);
  if (end === -1) {
    return { frontmatter: {}, body: rawContent.trim() };
  }

  const frontmatterRaw = rawContent.slice(4, end);
  const body = rawContent.slice(end + 5).trim();
  const frontmatter = Object.fromEntries(
    frontmatterRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) return [line, true];
        const key = line.slice(0, separatorIndex).trim();
        const value = line
          .slice(separatorIndex + 1)
          .trim()
          .replace(/^['"]|['"]$/g, "");
        return [key, value];
      }),
  );

  return { frontmatter, body };
}

function scoreNote(relativePath, body, frontmatter, config) {
  const normalizedPath = normalizePath(relativePath);
  const reasons = [];
  let score = 0;
  let riskPoints = 0;

  if (matchesPathPrefix(normalizedPath, config.filters.includeDirectories)) {
    score += 30;
    reasons.push("inside include directory");
  }

  if (matchesPathPrefix(normalizedPath, config.filters.excludeDirectories)) {
    return {
      score: -100,
      classification: "blocked",
      riskLevel: "high",
      reasons: ["inside excluded directory"],
    };
  }

  const lowerBody = body.toLowerCase();
  const wordCount = countWords(body);
  if (wordCount >= config.scoring.minWordCount) {
    score += 15;
    reasons.push("meets minimum word count");
  } else {
    score -= 20;
    reasons.push("too short");
  }

  const headingCount = (body.match(/^##?\s+/gm) ?? []).length;
  if (headingCount >= 2) {
    score += 15;
    reasons.push("has structure");
  }

  const bulletCount = (body.match(/^[-*]\s+/gm) ?? []).length;
  if (bulletCount >= 3) {
    score += 8;
    reasons.push("contains structured lists");
  }

  const codeBlockCount = (body.match(/```/g) ?? []).length / 2;
  if (codeBlockCount >= 1) {
    score += 6;
    reasons.push("contains code or examples");
  }

  if (containsAny(lowerBody, config.scoring.positiveKeywords)) {
    score += 18;
    reasons.push("contains topic keywords");
  }

  if (containsAny(lowerBody, config.scoring.negativeKeywords)) {
    score -= 22;
    reasons.push("contains low-value keywords");
  }

  if (containsAny(lowerBody, config.safety.blockedKeywords)) {
    riskPoints += 100;
    reasons.push("contains blocked keywords");
  }

  if (containsSensitivePattern(body)) {
    riskPoints += 60;
    reasons.push("contains sensitive pattern");
  }

  if (String(frontmatter.private).toLowerCase() === "true") {
    riskPoints += 100;
    reasons.push("frontmatter marks note private");
  }

  if (String(frontmatter.publish).toLowerCase() === "false") {
    riskPoints += 100;
    reasons.push("frontmatter disables publishing");
  }

  const adjustedScore = score - riskPoints;
  const classification = classifyCandidate(
    adjustedScore,
    riskPoints,
    config.scoring.thresholds,
  );
  const riskLevel =
    riskPoints >= 100 ? "high" : riskPoints >= 40 ? "medium" : "low";

  return { score: adjustedScore, classification, riskLevel, reasons };
}

function containsSensitivePattern(body) {
  const patterns = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /\b1[3-9]\d{9}\b/,
    /\b\d{3}[- ]?\d{3}[- ]?\d{4}\b/,
    /\bOKR\b/i,
    /\broadmap\b/i,
    /\bconfidential\b/i,
  ];
  return patterns.some((pattern) => pattern.test(body));
}

function classifyCandidate(score, riskPoints, thresholds) {
  if (riskPoints >= 100) return "blocked";
  if (score >= thresholds.strongCandidate) return "strong-candidate";
  if (score >= thresholds.candidate) return "candidate";
  if (score <= thresholds.blocked) return "blocked";
  return "low";
}

function containsAny(body, keywords) {
  return keywords.some((keyword) => body.includes(keyword.toLowerCase()));
}

function countWords(body) {
  return body.split(/\s+/).filter(Boolean).length;
}

function deriveTitle(relativePath, frontmatter, body) {
  if (typeof frontmatter.title === "string" && frontmatter.title.trim()) {
    return frontmatter.title.trim();
  }

  const headingMatch = body.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  return path
    .basename(relativePath, path.extname(relativePath))
    .replace(/[-_]/g, " ");
}

function mergeCandidates(existing, incoming) {
  const map = new Map(existing.map((item) => [item.sourcePath, item]));
  for (const item of incoming) {
    map.set(item.sourcePath, item);
  }
  return [...map.values()].sort((left, right) => right.score - left.score);
}

async function buildDrafts(candidates, sourceRoot, config, state) {
  const nextState = {
    ...state,
    notes: { ...(state.notes ?? {}) },
  };
  let generatedCount = 0;

  await fs.mkdir(importedRoot, { recursive: true });

  for (const candidate of candidates) {
    if (
      !config.generation.allowedClassifications.includes(
        candidate.classification,
      )
    ) {
      continue;
    }

    const sourcePath = path.join(sourceRoot, candidate.sourcePath);
    let rawContent;
    try {
      rawContent = await fs.readFile(sourcePath, "utf8");
    } catch {
      continue;
    }

    const parsed = parseFrontmatter(rawContent);
    const cleanedBody = cleanObsidianMarkdown(parsed.body);
    if (countWords(cleanedBody) < config.scoring.minWordCount) {
      continue;
    }

    const slug = candidate.blogSlug ?? slugify(candidate.title);
    const targetDir = path.join(importedRoot, slug);
    const targetFile = path.join(targetDir, "index.mdx");
    const description = buildDescription(cleanedBody, candidate.title);
    const today = new Date().toISOString().slice(0, 10);

    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(
      targetFile,
      [
        "---",
        `title: "${escapeYaml(candidate.title)}"`,
        `description: "${escapeYaml(description)}"`,
        `pubDate: "${today}"`,
        `updatedDate: "${today}"`,
        'source: "obsidian-import"',
        `sourcePath: "${escapeYaml(candidate.sourcePath)}"`,
        `importedAt: "${new Date().toISOString()}"`,
        "---",
        "",
        cleanedBody,
        "",
      ].join("\n"),
      "utf8",
    );

    nextState.notes[candidate.sourcePath] = {
      blogSlug: slug,
      contentHash: candidate.contentHash,
      classification: candidate.classification,
      updatedAt: new Date().toISOString(),
    };

    generatedCount += 1;
  }

  return { generatedCount, state: nextState };
}

function cleanObsidianMarkdown(body) {
  return body
    .replace(/^>\s*\[!.*?\]\s*/gm, "> ")
    .replace(/^!\[\[.*?\]\]\s*$/gm, "")
    .replace(/!\[\[(.*?)\]\]/g, "")
    .replace(
      /\[\[(.*?)(\|(.*?))?\]\]/g,
      (_, target, _pipe, alias) => alias ?? target,
    )
    .replace(/^\s*- \[[ xX]\]\s+/gm, "- ")
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<\/?(embed|iframe|video|audio|object|script|style)[^>]*>/gi, "")
    .replace(/^<[^>]+>\s*$/gm, "")
    .replace(/<([A-Za-z][A-Za-z0-9-]*)([^>]*)>/g, (match, tagName) => {
      const safeTags = new Set(["br", "hr"]);
      return safeTags.has(String(tagName).toLowerCase()) ? match : "";
    })
    .replace(/<\/([A-Za-z][A-Za-z0-9-]*)>/g, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildDescription(body, title) {
  const firstParagraph = body
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .find((paragraph) => paragraph && !paragraph.startsWith("#"));

  const fallback = `Imported note about ${title}.`;
  const normalized = (firstParagraph ?? fallback)
    .replace(/[#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.slice(0, 140);
}

function slugify(value) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `imported-${Date.now()}`;
}

function matchesPathPrefix(target, prefixes = []) {
  return prefixes.some(
    (prefix) => target === prefix || target.startsWith(`${prefix}/`),
  );
}

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function hashContent(content) {
  return createHash("sha256").update(content).digest("hex");
}

function escapeYaml(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
