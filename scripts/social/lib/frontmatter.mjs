// Minimal YAML-frontmatter reader for the blog collection. We do NOT reuse
// Astro's content loader here because this script runs in CI without a build,
// and the only shapes present in src/content/blog are scalars plus the optional
// one-level `social:` override map. Anything more exotic is a parse error on
// purpose — silently mis-reading a post would publish the wrong copy.

const DELIM = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Strip matching surrounding quotes and unescape the few sequences we allow. */
function unquote(raw) {
  const s = raw.trim();
  if (s.length >= 2 && ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'"))) {
    const inner = s.slice(1, -1);
    return s[0] === '"' ? inner.replace(/\\"/g, '"').replace(/\\n/g, '\n') : inner.replace(/''/g, "'");
  }
  return s;
}

/** Coerce an unquoted scalar to number/bool; quoted values always stay strings. */
function scalar(raw) {
  const trimmed = raw.trim();
  const quoted = /^["']/.test(trimmed);
  const value = unquote(trimmed);
  if (quoted) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

/**
 * Collect an indented block that follows a `key:` or `key: |` line.
 * Returns the consumed line count so the caller can skip ahead.
 */
function readBlock(lines, start, literal) {
  const body = [];
  let i = start;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      body.push('');
      continue;
    }
    if (!/^\s/.test(line)) break;
    body.push(line);
  }
  // Trailing blank lines belong to the next key, not to this block.
  while (body.length && body.at(-1) === '') {
    body.pop();
    i--;
  }
  if (!body.length) return { lines: body, consumed: i - start };
  const indent = Math.min(...body.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
  const dedented = body.map((l) => l.slice(indent));
  return { lines: dedented, consumed: i - start, text: literal ? dedented.join('\n') : undefined };
}

/**
 * Parse the frontmatter block of a markdown file.
 * @param {string} source Full file contents.
 * @returns {{ data: Record<string, any>, body: string }}
 */
export function parseFrontmatter(source) {
  const match = source.match(DELIM);
  if (!match) return { data: {}, body: source };

  const lines = match[1].split(/\r?\n/);
  /** @type {Record<string, any>} */
  const data = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    // Only top-level keys are handled here; nested lines are eaten by readBlock.
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rest] = kv;

    if (rest.trim() === '|' || rest.trim() === '|-') {
      const block = readBlock(lines, i + 1, true);
      data[key] = block.text ?? '';
      i += block.consumed;
      continue;
    }

    if (rest.trim() === '') {
      // Either a nested map (`social:`) or a block sequence (`- item`).
      const block = readBlock(lines, i + 1, false);
      if (block.lines.some((l) => l.trimStart().startsWith('- '))) {
        data[key] = block.lines
          .filter((l) => l.trimStart().startsWith('- '))
          .map((l) => scalar(l.trimStart().slice(2)));
      } else {
        /** @type {Record<string, any>} */
        const nested = {};
        for (let j = 0; j < block.lines.length; j++) {
          const nkv = block.lines[j].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
          if (!nkv) continue;
          if (nkv[2].trim() === '|' || nkv[2].trim() === '|-') {
            const inner = readBlock(block.lines, j + 1, true);
            nested[nkv[1]] = inner.text ?? '';
            j += inner.consumed;
          } else {
            nested[nkv[1]] = scalar(nkv[2]);
          }
        }
        data[key] = nested;
      }
      i += block.consumed;
      continue;
    }

    // Inline flow sequence: tags: [a, b]
    const inline = rest.trim();
    if (inline.startsWith('[') && inline.endsWith(']')) {
      const items = inline.slice(1, -1).trim();
      data[key] = items ? items.split(',').map(scalar) : [];
      continue;
    }

    data[key] = scalar(rest);
  }

  return { data, body: source.slice(match[0].length) };
}
