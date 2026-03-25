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
const defaultOpenAiBaseUrl = "https://api.openai.com/v1";
const contentHashVersion = "v2";
const markdownCleaningVersion = "v2";
const reviewPromptVersion = "obsidian-review-v1";
const renderHashVersion = "v1";

async function main() {
  const config = await readJson(configPath);
  const state = await readJson(statePath);
  const sourceRoot = await resolveSourceRoot(config);
  const aiReviewConfig = resolveAiReviewConfig(config);

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
      aiReviewConfig,
    );
    await writeJson(statePath, result.state);
    console.log(
      `Draft build complete: ${result.generatedCount} files written.`,
    );
    return;
  }

  if (command === "review-ai") {
    const candidates = await readJson(candidatesPath);
    const result = await reviewCandidatesWithAi(
      candidates.items ?? [],
      sourceRoot,
      config,
      aiReviewConfig,
    );
    await writeJson(candidatesPath, {
      generatedAt: new Date().toISOString(),
      items: result.items,
    });
    console.log(
      `AI review complete: ${result.reviewedCount} notes reviewed, ${result.skippedCount} left pending.`,
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
    const reviewResult = await reviewCandidatesWithAi(
      merged,
      sourceRoot,
      config,
      aiReviewConfig,
    );
    const result = await buildDrafts(
      reviewResult.items,
      sourceRoot,
      config,
      state,
      aiReviewConfig,
    );
    const headCommit = await getHeadCommit(sourceRoot);
    await writeJson(candidatesPath, {
      generatedAt: new Date().toISOString(),
      items: reviewResult.items,
    });
    await writeJson(statePath, {
      ...result.state,
      sourceHeadCommit: headCommit,
      lastIncrementalScanAt: new Date().toISOString(),
    });
    console.log(
      `Run complete: ${candidates.length} candidates refreshed, ${reviewResult.reviewedCount} AI-reviewed, ${result.generatedCount} drafts written.`,
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

    let content;
    try {
      content = await fs.readFile(file, "utf8");
    } catch {
      candidates.push({ sourcePath: relativePath, deleted: true });
      continue;
    }

    const parsed = parseFrontmatter(content);
    const title = deriveTitle(relativePath, parsed.frontmatter, parsed.body);
    const cleanedBody = cleanObsidianMarkdown(parsed.body);
    const metrics = scoreNote(
      relativePath,
      title,
      parsed.body,
      parsed.frontmatter,
      config,
    );
    const contentHash = buildContentHash({
      title,
      frontmatter: parsed.frontmatter,
      cleanedBody,
    });

    const existingMatch = resolveExistingNoteState(
      state.notes ?? {},
      relativePath,
      contentHash,
    );
    const existingState = existingMatch?.noteState;
    if (
      incrementalOnly &&
      existingState?.sourcePath === relativePath &&
      existingState?.contentHash === contentHash
    ) {
      continue;
    }

    candidates.push({
      sourcePath: relativePath,
      previousSourcePath:
        existingMatch?.stateKey && existingMatch.stateKey !== relativePath
          ? existingMatch.stateKey
          : null,
      title,
      lastModifiedAt: (await fs.stat(file)).mtime.toISOString(),
      score: metrics.score,
      classification: metrics.classification,
      riskLevel: metrics.riskLevel,
      reasons: metrics.reasons,
      signals: metrics.signals,
      imported: Boolean(existingState?.blogSlug),
      blogSlug: existingState?.blogSlug ?? null,
      contentHash,
      renderHash: existingState?.renderHash ?? null,
    });
  }

  return candidates.sort(
    (left, right) => (right.score ?? 0) - (left.score ?? 0),
  );
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

function scoreNote(relativePath, title, body, frontmatter, config) {
  const normalizedPath = normalizePath(relativePath);
  const reasons = [];
  const matchedIncludeDirectories = config.filters.includeDirectories.filter(
    (rule) => matchesDirectoryRule(normalizedPath, rule),
  );
  const signals = {
    matchedIncludeDirectories,
    matchedExcludeDirectories: config.filters.excludeDirectories.filter(
      (rule) => matchesDirectoryRule(normalizedPath, rule),
    ),
    wordCount: countWords(body),
    headingCount: (body.match(/^##?\s+/gm) ?? []).length,
    bulletCount: (body.match(/^[-*]\s+/gm) ?? []).length,
    codeBlockCount: (body.match(/```/g) ?? []).length / 2,
    hasPositiveKeywords: false,
    hasNegativeKeywords: false,
    titleLooksPublishable: false,
    titleLooksScratch: false,
    containsArticleSignals: false,
    taskListHeavy: false,
    referenceHeavy: false,
    logHeavy: false,
    blockedKeywordHit: false,
    sensitivePatternHit: false,
  };
  let score = 0;
  let riskPoints = 0;

  if (signals.matchedIncludeDirectories.length > 0) {
    score += 30;
    reasons.push("inside include directory");
  }

  if (signals.matchedExcludeDirectories.length > 0) {
    return {
      score: -100,
      classification: "blocked",
      riskLevel: "high",
      reasons: ["inside excluded directory"],
    };
  }

  const lowerBody = body.toLowerCase();
  const normalizedTitle = String(title ?? "").trim();
  const wordCount = signals.wordCount;
  if (wordCount >= config.scoring.minWordCount) {
    score += 15;
    reasons.push("meets minimum word count");
  } else {
    score -= 20;
    reasons.push("too short");
  }

  const headingCount = signals.headingCount;
  if (headingCount >= 2) {
    score += 15;
    reasons.push("has structure");
  }

  const bulletCount = signals.bulletCount;
  if (bulletCount >= 3) {
    score += 8;
    reasons.push("contains structured lists");
  }

  const codeBlockCount = signals.codeBlockCount;
  if (codeBlockCount >= 1) {
    score += 6;
    reasons.push("contains code or examples");
  }

  signals.hasPositiveKeywords = containsAny(
    lowerBody,
    config.scoring.positiveKeywords,
  );
  if (signals.hasPositiveKeywords) {
    score += 18;
    reasons.push("contains topic keywords");
  }

  signals.hasNegativeKeywords = containsAny(
    lowerBody,
    config.scoring.negativeKeywords,
  );
  if (signals.hasNegativeKeywords) {
    score -= 22;
    reasons.push("contains low-value keywords");
  }

  signals.titleLooksPublishable = looksLikeArticleTitle(normalizedTitle);
  if (signals.titleLooksPublishable) {
    score += 10;
    reasons.push("title looks publishable");
  }

  signals.titleLooksScratch = looksLikeScratchTitle(normalizedTitle);
  if (signals.titleLooksScratch) {
    score -= 18;
    reasons.push("title looks like scratch note");
  }

  signals.containsArticleSignals = containsArticleSignals(lowerBody);
  if (signals.containsArticleSignals) {
    score += 10;
    reasons.push("contains article-style signals");
  }

  signals.taskListHeavy = hasHeavyTaskList(body);
  if (signals.taskListHeavy) {
    score -= 18;
    reasons.push("task list heavy");
  }

  signals.referenceHeavy = hasHeavyReferenceDensity(body);
  if (signals.referenceHeavy) {
    score -= 14;
    reasons.push("reference or excerpt heavy");
  }

  signals.logHeavy = hasHeavyLogDensity(body);
  if (signals.logHeavy) {
    score -= 18;
    reasons.push("log or setup heavy");
  }

  signals.blockedKeywordHit = containsAny(
    lowerBody,
    config.safety.blockedKeywords,
  );
  if (signals.blockedKeywordHit) {
    riskPoints += 100;
    reasons.push("contains blocked keywords");
  }

  signals.sensitivePatternHit = containsSensitivePattern(body);
  if (signals.sensitivePatternHit) {
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

  return {
    score: adjustedScore,
    classification,
    riskLevel,
    reasons,
    signals,
  };
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
  const latinWordCount = (body.match(/[A-Za-z0-9_]+/g) ?? []).length;
  const cjkCharCount = (
    body.match(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
    ) ?? []
  ).length;
  return latinWordCount + Math.ceil(cjkCharCount / 2);
}

function looksLikeArticleTitle(title) {
  if (!title) return false;
  if (/^\d{4}[-/]?\d{2}[-/]?\d{2}$/.test(title)) return false;
  if (/^\d+$/.test(title)) return false;
  return title.length >= 6 && !looksLikeScratchTitle(title);
}

function looksLikeScratchTitle(title) {
  if (!title) return true;
  return (
    /^\d+$/.test(title) ||
    /^week\d+$/i.test(title) ||
    /^todo$/i.test(title) ||
    /^temp$/i.test(title) ||
    /^draft$/i.test(title) ||
    title.length <= 4
  );
}

function containsArticleSignals(lowerBody) {
  return containsAny(lowerBody, [
    "总结",
    "结论",
    "复盘",
    "对比",
    "为什么",
    "经验",
    "实践",
    "取舍",
    "tradeoff",
    "takeaway",
    "in practice",
  ]);
}

function hasHeavyTaskList(body) {
  const checkboxCount = (body.match(/^\s*- \[[ xX]\]\s+/gm) ?? []).length;
  const lineCount = Math.max(body.split("\n").length, 1);
  return checkboxCount >= 4 || checkboxCount / lineCount > 0.12;
}

function hasHeavyReferenceDensity(body) {
  const quoteCount = (body.match(/^>\s+/gm) ?? []).length;
  const linkCount = (body.match(/https?:\/\//g) ?? []).length;
  const lineCount = Math.max(body.split("\n").length, 1);
  return (
    quoteCount >= 8 ||
    linkCount >= 8 ||
    (quoteCount + linkCount) / lineCount > 0.2
  );
}

function hasHeavyLogDensity(body) {
  const lowerBody = body.toLowerCase();
  const shellPromptCount = (body.match(/^(?:\$|#)\s+/gm) ?? []).length;
  const errorCount = (
    lowerBody.match(/error|exception|traceback|stack trace|fatal/g) ?? []
  ).length;
  const installCount = (
    lowerBody.match(
      /npm install|pnpm install|yarn install|pip install|conda install|brew install|apt install/g,
    ) ?? []
  ).length;
  return shellPromptCount >= 6 || errorCount >= 4 || installCount >= 3;
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
    if (item.deleted) {
      map.delete(item.sourcePath);
      continue;
    }

    if (
      item.previousSourcePath &&
      item.previousSourcePath !== item.sourcePath
    ) {
      map.delete(item.previousSourcePath);
    }

    const existingItem = map.get(item.sourcePath);
    map.set(item.sourcePath, {
      ...existingItem,
      ...item,
      aiReview: item.aiReview ?? existingItem?.aiReview,
    });
  }
  return [...map.values()].sort(
    (left, right) => (right.score ?? 0) - (left.score ?? 0),
  );
}

async function buildDrafts(
  candidates,
  sourceRoot,
  config,
  state,
  aiReviewConfig,
) {
  const nextState = {
    ...state,
    notes: { ...(state.notes ?? {}) },
  };
  let generatedCount = 0;

  await fs.mkdir(importedRoot, { recursive: true });

  for (const candidate of candidates) {
    if (!shouldGenerateCandidate(candidate, config, aiReviewConfig)) {
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

    const existingMatch = resolveExistingNoteState(
      nextState.notes,
      candidate.sourcePath,
      candidate.contentHash,
    );
    const existingState = existingMatch?.noteState;
    const resolvedTitle = resolvePublishedTitle(candidate);
    const slug =
      candidate.blogSlug ??
      existingState?.blogSlug ??
      slugify(candidate.aiReview?.publicSlug?.trim() || resolvedTitle);
    const targetDir = path.join(importedRoot, slug);
    const targetFile = path.join(targetDir, "index.mdx");
    const description = buildDescription(cleanedBody, resolvedTitle);
    const today = new Date().toISOString().slice(0, 10);
    const renderedDocument = [
      "---",
      `title: "${escapeYaml(resolvedTitle)}"`,
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
    ].join("\n");
    const renderHash = buildRenderHash(renderedDocument);

    await fs.mkdir(targetDir, { recursive: true });
    if (
      existingState?.renderHash !== renderHash ||
      !(await pathExists(targetFile))
    ) {
      await fs.writeFile(targetFile, renderedDocument, "utf8");
      generatedCount += 1;
    }

    const reviewHash = buildReviewHash(candidate.contentHash, aiReviewConfig);
    nextState.notes[candidate.sourcePath] = {
      sourcePath: candidate.sourcePath,
      blogSlug: slug,
      contentHash: candidate.contentHash,
      reviewHash,
      renderHash,
      classification: candidate.classification,
      aiDecision:
        candidate.aiReview?.decision ?? existingState?.aiDecision ?? null,
      updatedAt: new Date().toISOString(),
    };

    if (
      existingMatch?.stateKey &&
      existingMatch.stateKey !== candidate.sourcePath
    ) {
      delete nextState.notes[existingMatch.stateKey];
    }
  }

  return { generatedCount, state: nextState };
}

function cleanObsidianMarkdown(body) {
  return body
    .replace(/^TAG:\s+.*$/gim, "")
    .replace(/^DECK:\s+.*$/gim, "")
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

function resolveAiReviewConfig(config) {
  const configured = config.aiReview ?? {};
  return {
    enabled: readBooleanEnv("AI_REVIEW_ENABLED", configured.enabled ?? false),
    model: process.env.OPENAI_MODEL ?? configured.model ?? "gpt-5.4-mini",
    baseUrl:
      process.env.OPENAI_BASE_URL ?? configured.baseUrl ?? defaultOpenAiBaseUrl,
    apiStyle: normalizeApiStyle(
      process.env.OPENAI_API_STYLE ?? configured.apiStyle ?? "responses",
    ),
    maxCandidatesPerRun: readNumberEnv(
      "AI_REVIEW_MAX_CANDIDATES",
      configured.maxCandidatesPerRun ?? 8,
    ),
    maxExcerptChars: readNumberEnv(
      "AI_REVIEW_MAX_EXCERPT_CHARS",
      configured.maxExcerptChars ?? 12000,
    ),
    reviewClassifications: configured.reviewClassifications ?? [
      "candidate",
      "strong-candidate",
    ],
    allowedDecisions: configured.allowedDecisions ?? ["approve"],
  };
}

async function reviewCandidatesWithAi(
  candidates,
  sourceRoot,
  config,
  aiReviewConfig,
) {
  if (!aiReviewConfig.enabled) {
    return { items: candidates, reviewedCount: 0, skippedCount: 0 };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("AI review is enabled but OPENAI_API_KEY is missing.");
  }

  const items = [...candidates];
  const queue = selectCandidatesForAiReview(items, aiReviewConfig).slice(
    0,
    aiReviewConfig.maxCandidatesPerRun,
  );

  for (const entry of queue) {
    const sourcePath = path.join(sourceRoot, entry.sourcePath);
    let rawContent;
    try {
      rawContent = await fs.readFile(sourcePath, "utf8");
    } catch {
      continue;
    }

    const parsed = parseFrontmatter(rawContent);
    const cleanedBody = cleanObsidianMarkdown(parsed.body);
    const excerpt = cleanedBody.slice(0, aiReviewConfig.maxExcerptChars);
    const aiReview = await requestAiReview({
      apiKey,
      model: aiReviewConfig.model,
      baseUrl: aiReviewConfig.baseUrl,
      apiStyle: aiReviewConfig.apiStyle,
      note: entry,
      excerpt,
    });
    const reviewHash = buildReviewHash(entry.contentHash, aiReviewConfig);

    entry.aiReview = {
      ...aiReview,
      model: aiReviewConfig.model,
      reviewedAt: new Date().toISOString(),
      contentHash: entry.contentHash,
      reviewHash,
    };
  }

  return {
    items,
    reviewedCount: queue.length,
    skippedCount: Math.max(
      selectCandidatesForAiReview(items, aiReviewConfig).length,
      0,
    ),
  };
}

function selectCandidatesForAiReview(candidates, aiReviewConfig) {
  return candidates
    .filter((candidate) => !candidate.deleted)
    .filter((candidate) =>
      aiReviewConfig.reviewClassifications.includes(candidate.classification),
    )
    .filter((candidate) => {
      const existingReview = candidate.aiReview;
      const reviewHash = buildReviewHash(candidate.contentHash, aiReviewConfig);
      return !existingReview || existingReview.reviewHash !== reviewHash;
    })
    .sort((left, right) => {
      const scoreDiff = right.score - left.score;
      if (scoreDiff !== 0) return scoreDiff;
      return (right.lastModifiedAt ?? "").localeCompare(
        left.lastModifiedAt ?? "",
      );
    });
}

async function requestAiReview({
  apiKey,
  model,
  baseUrl,
  apiStyle,
  note,
  excerpt,
}) {
  const systemPrompt = [
    "You review Obsidian notes for publication on a public engineering blog.",
    "Be conservative.",
    "Approve only if the note is publishable with light cleanup.",
    "Use revise if the core idea is strong but still reads like raw notes.",
    "Use reject for private, internal, overly fragmentary, context-dependent, or low-value notes.",
    "Return raw JSON only.",
  ].join(" ");

  const userPrompt = [
    "Decide whether this note should be published.",
    "Return a JSON object with keys: decision, confidence, summary, publicTitle, publicSlug, reasons, risks.",
    'decision must be one of "approve", "revise", "reject".',
    "confidence must be a number between 0 and 1.",
    "publicSlug must be short lowercase kebab-case in English.",
    "reasons and risks must be arrays of short strings.",
    "Prefer reject when the note is mostly setup logs, command scraps, book excerpts, TODOs, or private context.",
    "Prefer revise when the idea is useful but the title, structure, or prose needs real editorial work.",
    "Heuristic signals are weak hints, not ground truth. Use them to assist judgment rather than override the content.",
    `Source path: ${note.sourcePath}`,
    `Current title: ${note.title}`,
    `Heuristic classification: ${note.classification}`,
    `Heuristic reasons: ${(note.reasons ?? []).join(", ")}`,
    `Heuristic signals: ${JSON.stringify(note.signals ?? {}, null, 2)}`,
    "Excerpt:",
    excerpt,
  ].join("\n\n");

  const response = await requestCompatibleOpenAiApi({
    apiKey,
    model,
    baseUrl,
    apiStyle,
    systemPrompt,
    userPrompt,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI review request failed (${response.status}): ${errorText.slice(0, 300)}`,
    );
  }

  const rawResponse = await response.text();
  if (!rawResponse.trim()) {
    throw new Error(
      `OpenAI review returned empty response body for ${note.sourcePath}.`,
    );
  }

  let payload;
  try {
    payload = JSON.parse(rawResponse);
  } catch {
    throw new Error(
      `OpenAI review returned non-JSON response for ${note.sourcePath}: ${rawResponse.slice(0, 300)}`,
    );
  }

  const outputText =
    apiStyle === "chat-completions"
      ? readChatCompletionsOutputText(payload)
      : readResponseOutputText(payload);
  const parsed = parseJsonObject(outputText, note.sourcePath);

  return {
    decision: normalizeDecision(parsed.decision),
    confidence: clampConfidence(parsed.confidence),
    summary: String(parsed.summary ?? "").trim(),
    publicTitle: String(parsed.publicTitle ?? note.title).trim(),
    publicSlug: String(parsed.publicSlug ?? note.title).trim(),
    reasons: normalizeStringArray(parsed.reasons),
    risks: normalizeStringArray(parsed.risks),
  };
}

async function requestCompatibleOpenAiApi({
  apiKey,
  model,
  baseUrl,
  apiStyle,
  systemPrompt,
  userPrompt,
}) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (apiStyle === "chat-completions") {
    return fetch(buildOpenAiApiUrl(baseUrl, "chat/completions"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
  }

  return fetch(buildOpenAiApiUrl(baseUrl, "responses"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
    }),
  });
}

function buildOpenAiApiUrl(baseUrl, endpointPath) {
  return `${String(baseUrl).replace(/\/+$/, "")}/${endpointPath}`;
}

function readResponseOutputText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const contentItems = payload.output ?? [];
  for (const item of contentItems) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  throw new Error("OpenAI review response did not contain output text.");
}

function parseJsonObject(rawText, sourcePath = "unknown note") {
  const normalized = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(normalized);
  } catch {
    const extracted = extractJsonObject(normalized);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch {
        throw new Error(
          `OpenAI review returned malformed JSON for ${sourcePath}: ${extracted.slice(0, 300)}`,
        );
      }
    }

    throw new Error(
      `OpenAI review returned invalid JSON for ${sourcePath}: ${normalized.slice(0, 300)}`,
    );
  }
}

function extractJsonObject(rawText) {
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  return rawText.slice(firstBrace, lastBrace + 1);
}

function readChatCompletionsOutputText(payload) {
  const firstChoice = payload.choices?.[0]?.message?.content;

  if (typeof firstChoice === "string" && firstChoice.trim()) {
    return firstChoice.trim();
  }

  if (Array.isArray(firstChoice)) {
    const text = firstChoice
      .map((item) => (typeof item?.text === "string" ? item.text : ""))
      .join("")
      .trim();
    if (text) return text;
  }

  throw new Error("OpenAI chat completions response did not contain content.");
}

function normalizeApiStyle(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (
    ["responses", "chat-completions", "chat_completions"].includes(normalized)
  ) {
    return normalized.replace("chat_completions", "chat-completions");
  }
  return "responses";
}

function normalizeDecision(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["approve", "revise", "reject"].includes(normalized)) {
    return normalized;
  }
  return "reject";
}

function clampConfidence(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric));
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

function shouldGenerateCandidate(candidate, config, aiReviewConfig) {
  if (
    !config.generation.allowedClassifications.includes(candidate.classification)
  ) {
    return false;
  }

  if (!aiReviewConfig.enabled) {
    return true;
  }

  const review = candidate.aiReview;
  const desiredReviewHash = buildReviewHash(
    candidate.contentHash,
    aiReviewConfig,
  );
  if (!review || review.reviewHash !== desiredReviewHash) {
    return false;
  }

  return aiReviewConfig.allowedDecisions.includes(review.decision);
}

function resolvePublishedTitle(candidate) {
  const review = candidate.aiReview;
  if (
    review?.contentHash === candidate.contentHash &&
    review.decision === "approve" &&
    typeof review.publicTitle === "string" &&
    review.publicTitle.trim()
  ) {
    return review.publicTitle.trim();
  }
  return candidate.title;
}

function readBooleanEnv(name, fallback) {
  const value = process.env[name];
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readNumberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function resolveExistingNoteState(notes, sourcePath, contentHash) {
  if (notes[sourcePath]) {
    return {
      stateKey: sourcePath,
      noteState: notes[sourcePath],
      matchedBy: "path",
    };
  }

  for (const [stateKey, noteState] of Object.entries(notes)) {
    if (noteState?.contentHash === contentHash) {
      return { stateKey, noteState, matchedBy: "contentHash" };
    }
  }

  return null;
}

function buildContentHash({ title, frontmatter, cleanedBody }) {
  return hashContent(
    JSON.stringify({
      version: contentHashVersion,
      title,
      cleanedBody,
      publish: frontmatter.publish ?? null,
      private: frontmatter.private ?? null,
      tags: frontmatter.tags ?? null,
    }),
  );
}

function buildReviewHash(contentHash, aiReviewConfig) {
  return hashContent(
    JSON.stringify({
      version: reviewPromptVersion,
      contentHash,
      model: aiReviewConfig.model,
      apiStyle: aiReviewConfig.apiStyle,
      cleaningVersion: markdownCleaningVersion,
    }),
  );
}

function buildRenderHash(renderedDocument) {
  return hashContent(
    JSON.stringify({
      version: renderHashVersion,
      renderedDocument,
    }),
  );
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function matchesDirectoryRule(target, rule) {
  const normalizedRule = normalizePath(String(rule ?? "").trim()).replace(
    /^\/+|\/+$/g,
    "",
  );
  if (!normalizedRule) return false;
  if (target === normalizedRule) return true;
  if (target.startsWith(`${normalizedRule}/`)) return true;
  if (target.includes(`/${normalizedRule}/`)) return true;

  if (!normalizedRule.includes("/")) {
    const segments = target.split("/");
    return segments.includes(normalizedRule);
  }

  return false;
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
