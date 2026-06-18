import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const WEBP_HEADER_SIZE = 12;
const MIN_USEFUL_FILE_BYTES = 18_000;

function readUint24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function chunkName(buffer, offset) {
  return buffer.toString("ascii", offset, offset + 4);
}

export function readWebpDimensions(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < WEBP_HEADER_SIZE) {
    throw new Error("File is too small to be a WebP image");
  }
  if (chunkName(buffer, 0) !== "RIFF" || chunkName(buffer, 8) !== "WEBP") {
    throw new Error("File is not a RIFF WebP image");
  }

  let offset = WEBP_HEADER_SIZE;
  while (offset + 8 <= buffer.length) {
    const type = chunkName(buffer, offset);
    const size = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;
    if (dataOffset + size > buffer.length) throw new Error(`Invalid WebP chunk size for ${type}`);

    if (type === "VP8X") {
      if (size < 10) throw new Error("Invalid VP8X header");
      return {
        width: readUint24LE(buffer, dataOffset + 4) + 1,
        height: readUint24LE(buffer, dataOffset + 7) + 1,
        container: "VP8X",
      };
    }

    if (type === "VP8L") {
      if (size < 5 || buffer[dataOffset] !== 0x2f) throw new Error("Invalid VP8L header");
      const b1 = buffer[dataOffset + 1];
      const b2 = buffer[dataOffset + 2];
      const b3 = buffer[dataOffset + 3];
      const b4 = buffer[dataOffset + 4];
      return {
        width: 1 + (((b2 & 0x3f) << 8) | b1),
        height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)),
        container: "VP8L",
      };
    }

    if (type === "VP8 ") {
      if (size < 10) throw new Error("Invalid VP8 header");
      const sig = buffer.toString("hex", dataOffset + 3, dataOffset + 6);
      if (sig !== "9d012a") throw new Error("Invalid VP8 frame signature");
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
        container: "VP8",
      };
    }

    offset = dataOffset + size + (size % 2);
  }

  throw new Error("WebP image dimensions were not found");
}

function shapeProfileFor(item) {
  const gridW = Math.max(1, Number(item?.gridW ?? 1) || 1);
  const gridH = Math.max(1, Number(item?.gridH ?? 1) || 1);
  const ratio = gridH / gridW;
  if (ratio >= 2) {
    return {
      shape: "portrait",
      minRatio: ratio >= 4 ? 1.8 : 1.35,
      minLongSide: ratio >= 3 ? 1200 : 1000,
      exactSquareIsError: true,
    };
  }
  return {
    shape: "square",
    minRatio: 0.72,
    maxRatio: 1.38,
    minLongSide: 900,
    exactSquareIsError: false,
  };
}

function pushFinding(findings, severity, code, message, item, details = {}) {
  findings.push({
    severity,
    code,
    message,
    catalog: item?.catalog ?? "",
    id: item?.id ?? "",
    targetFile: item?.targetFile ?? "",
    details,
  });
}

export function auditArtTargetItem(item, { root = process.cwd(), requireExists = true } = {}) {
  const findings = [];
  const targetFile = String(item?.targetFile ?? "").trim();
  if (!targetFile) {
    pushFinding(findings, "error", "missing-target-file", "Backlog row has no targetFile.", item);
    return { item, ok: false, findings };
  }

  const absolutePath = resolve(root, targetFile);
  if (!existsSync(absolutePath)) {
    if (requireExists) {
      pushFinding(findings, "error", "missing-file", "Target art file does not exist.", item, { absolutePath });
    }
    return { item, ok: findings.length === 0, findings };
  }

  let dimensions = null;
  let bytes = 0;
  try {
    const stat = statSync(absolutePath);
    bytes = stat.size;
    dimensions = readWebpDimensions(readFileSync(absolutePath));
  } catch (err) {
    pushFinding(findings, "error", "unreadable-webp", `Target art file is not a readable WebP image: ${err?.message ?? err}`, item);
    return { item, ok: false, findings };
  }

  const width = Number(dimensions.width);
  const height = Number(dimensions.height);
  const longSide = Math.max(width, height);
  const aspect = width > 0 && height > 0 ? height / width : 0;
  const profile = shapeProfileFor(item);

  if (profile.shape === "portrait" && aspect < profile.minRatio) {
    pushFinding(findings, "error", "portrait-aspect-mismatch", "Item must be generated as a portrait/vertical asset for the Tarkov grid.", item, {
      width,
      height,
      actualHeightToWidth: Number(aspect.toFixed(3)),
      minHeightToWidth: profile.minRatio,
      gridW: item.gridW,
      gridH: item.gridH,
    });
  }

  if (profile.shape === "square" && (aspect < profile.minRatio || aspect > profile.maxRatio)) {
    pushFinding(findings, "error", "square-aspect-mismatch", "Square-grid item must stay close to square framing.", item, {
      width,
      height,
      actualHeightToWidth: Number(aspect.toFixed(3)),
      expectedRange: `${profile.minRatio}..${profile.maxRatio}`,
    });
  }

  if (profile.exactSquareIsError && width === height) {
    pushFinding(findings, "error", "square-placeholder-for-portrait", "Portrait-grid item is an exact square, which is usually a bad placeholder for inventory art.", item, {
      width,
      height,
    });
  }

  if (longSide < profile.minLongSide) {
    pushFinding(findings, "warning", "low-resolution-art", "Target art is smaller than the prompt-driven inventory resolution profile.", item, {
      width,
      height,
      minLongSide: profile.minLongSide,
    });
  }

  if (bytes > 0 && bytes < MIN_USEFUL_FILE_BYTES) {
    pushFinding(findings, "warning", "small-file-size", "Target art file is suspiciously small for detailed generated item art.", item, {
      bytes,
      minUsefulBytes: MIN_USEFUL_FILE_BYTES,
    });
  }

  return {
    item,
    ok: !findings.some(finding => finding.severity === "error"),
    dimensions,
    bytes,
    findings,
  };
}

function shouldUseItem(item, options) {
  if (!item?.id || !item?.targetFile) return false;
  if (!options.catalogs?.length) return true;
  const wanted = new Set(options.catalogs.map(value => String(value ?? "").trim()).filter(Boolean));
  return wanted.has(item.catalog) || wanted.has(item.type);
}

export function auditArtTargets(report, options = {}) {
  const items = (report?.items ?? []).filter(item => shouldUseItem(item, options));
  const inspected = [];
  const findings = [];

  for (const item of items) {
    const result = auditArtTargetItem(item, options);
    inspected.push(result);
    findings.push(...result.findings);
  }

  const errors = findings.filter(finding => finding.severity === "error");
  const warnings = findings.filter(finding => finding.severity === "warning");
  return {
    label: "Iron Hills item art target audit",
    ok: errors.length === 0 && (!options.strictWarnings || warnings.length === 0),
    summary: {
      inspected: inspected.length,
      errors: errors.length,
      warnings: warnings.length,
    },
    findings,
  };
}

export function formatArtTargetAuditReport(report, { maxFindings = 20 } = {}) {
  const summary = report?.summary ?? {};
  const lines = [
    `Iron Hills item art target audit: ${report?.ok ? "OK" : "ISSUES"}`,
    `Inspected=${Number(summary.inspected ?? 0)}, errors=${Number(summary.errors ?? 0)}, warnings=${Number(summary.warnings ?? 0)}`,
  ];

  const findings = report?.findings ?? [];
  for (const finding of findings.slice(0, maxFindings)) {
    lines.push(`- [${finding.severity.toUpperCase()}] ${finding.catalog}/${finding.id}: ${finding.message} (${finding.code})`);
  }
  if (findings.length > maxFindings) lines.push(`...and ${findings.length - maxFindings} more findings.`);
  return lines.join("\n");
}
