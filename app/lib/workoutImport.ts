import type { Exercise } from './exercises';
import type { WeightUnit } from './units';
import type { Workout, WorkoutExercise } from './workouts';

// Turns pasted text, a Google Doc/Sheet export, or a CSV/TXT file into a draft Workout.
// No AI: lines are parsed with patterns like "Bench Press 3x10 @ 135" and each name is
// matched against the exercise catalog so imported exercises get descriptions/diagrams.

export type ImportedLine = {
  raw: string;
  exercise: WorkoutExercise;
  group?: string; // block/superset label, e.g. "Block 1" or "Superset A"
  matched: boolean; // true when linked to a catalog exercise
  usedDefaults: boolean; // true when no sets/reps were found
};

export type ImportResult = {
  title: string | null;
  lines: ImportedLine[];
  skipped: string[];
};

// ---------- Name matching ----------

const ABBREVIATIONS: Record<string, string> = {
  db: 'dumbbell',
  dbs: 'dumbbell',
  dumbell: 'dumbbell',
  dumbells: 'dumbbell',
  bb: 'barbell',
  kb: 'kettlebell',
  rdl: 'romanian deadlift',
  rdls: 'romanian deadlift',
  ohp: 'shoulder press',
  pushup: 'push up',
  pushups: 'push up',
  pullup: 'pull up',
  pullups: 'pull up',
  chinup: 'chin up',
  chinups: 'chin up',
  situp: 'sit up',
  situps: 'sit up',
  tricep: 'tricep',
  triceps: 'tricep',
  bicep: 'bicep',
  biceps: 'bicep',
  skullcrusher: 'skull crusher',
  skullcrushers: 'skull crusher',
};

// Common generic names → the catalog entry most people mean by them.
const ALIASES: Record<string, string> = {
  'bench': 'bb-flat-bench-press',
  'bench press': 'bb-flat-bench-press',
  'flat bench': 'bb-flat-bench-press',
  'flat bench press': 'bb-flat-bench-press',
  'barbell bench press': 'bb-flat-bench-press',
  'barbell bench': 'bb-flat-bench-press',
  'dumbbell bench': 'db-flat-bench-press',
  'dumbbell row': 'single-arm-bench-supported-db-rows',
  'one arm dumbbell row': 'single-arm-bench-supported-db-rows',
  'single arm row': 'single-arm-bench-supported-db-rows',
  'incline bench': 'bb-incline-bench-press',
  'incline bench press': 'bb-incline-bench-press',
  'squat': 'bb-back-squat',
  'back squat': 'bb-back-squat',
  'barbell squat': 'bb-back-squat',
  'front squat': 'bb-front-squat',
  'goblet squat': 'db-goblet-squat',
  'deadlift': 'bb-deadlifts',
  'barbell deadlift': 'bb-deadlifts',
  'conventional deadlift': 'bb-deadlifts',
  'romanian deadlift': 'bb-rdl',
  'overhead press': 'bb-shoulder-press',
  'military press': 'bb-shoulder-press',
  'shoulder press': 'bb-shoulder-press',
  'dumbbell press': 'db-flat-bench-press',
  'curl': 'db-curls',
  'bicep curl': 'db-curls',
  'dip': 'chest-dips',
  'plank': 'planks',
  'nordic': 'lib-nordic-hamstring-curl',
  'nordic curl': 'lib-nordic-hamstring-curl',
  'nordic hamstring curl': 'lib-nordic-hamstring-curl',
  'lat pulldown': 'lat-pulldowns',
  'pulldown': 'lat-pulldowns',
  'lateral raise': 'db-lateral-raises',
  'side raise': 'db-lateral-raises',
  'face pull': 'cable-face-pulls',
  'hip thrust': 'hip-thrusts',
  'calf raise': 'standing-calf-raise',
  'run': 'running',
  'jog': 'jogging',
  'bike': 'stationary-bike',
  'row machine': 'rowing-machine',
  'rower': 'rowing-machine',
};

// Words a catalog name may have that a user often leaves out.
const EQUIPMENT_WORDS = new Set(['dumbbell', 'barbell', 'kettlebell', 'cable', 'machine', 'ez']);
const GENERIC_WORDS = new Set(['dumbbell', 'barbell', 'kettlebell', 'cable', 'machine', 'bench', 'flat', 'seated', 'standing', 'ez', 'bar']);

function singular(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('sses')) return word.slice(0, -2); // presses -> press
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

export function normalizeName(name: string): string {
  const words = name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const expanded = words.flatMap((w) => (ABBREVIATIONS[w] ?? w).split(' '));
  return expanded.map(singular).join(' ');
}

function tokens(normalized: string): Set<string> {
  return new Set(normalized.split(' ').filter(Boolean));
}

type CatalogEntry = { exercise: Exercise; norm: string; toks: Set<string> };

export function buildMatcher(catalog: Exercise[]) {
  const entries: CatalogEntry[] = catalog.map((exercise) => {
    const norm = normalizeName(exercise.name);
    return { exercise, norm, toks: tokens(norm) };
  });
  const byId = new Map(catalog.map((e) => [e.id, e]));
  const aliasByNorm = new Map(
    Object.entries(ALIASES).map(([alias, id]) => [normalizeName(alias), id] as const)
  );

  return function match(rawName: string): Exercise | null {
    const norm = normalizeName(rawName);
    if (!norm) return null;

    const exact = entries.find((e) => e.norm === norm);
    if (exact) return exact.exercise;

    const aliasId = aliasByNorm.get(norm);
    if (aliasId && byId.has(aliasId)) return byId.get(aliasId)!;

    // A catalog entry is a valid match only if every word the input leaves out is
    // generic equipment/position ("Barbell row" must not become "Barbell Upright Row").
    const input = tokens(norm);
    let best: CatalogEntry | null = null;
    let bestShared = 0;
    for (const entry of entries) {
      let shared = 0;
      input.forEach((t) => {
        if (entry.toks.has(t)) shared++;
      });
      if (shared === 0 || shared / input.size < 0.5) continue;
      let extrasOk = true;
      entry.toks.forEach((t) => {
        if (!input.has(t) && !GENERIC_WORDS.has(t)) extrasOk = false;
      });
      if (!extrasOk) continue;
      // ...and every specific word the user typed must be in it ("Nordic curls" is not "Barbell Curls")
      let inputOk = true;
      input.forEach((t) => {
        if (!entry.toks.has(t) && !GENERIC_WORDS.has(t)) inputOk = false;
      });
      if (!inputOk) continue;
      // Equipment the user named must match ("Barbell row" is not a cable row)
      let equipmentOk = true;
      input.forEach((t) => {
        if (EQUIPMENT_WORDS.has(t) && !entry.toks.has(t)) equipmentOk = false;
      });
      if (!equipmentOk) continue;
      const better =
        best === null ||
        shared > bestShared ||
        (shared === bestShared &&
          (entry.toks.size < best.toks.size ||
            (entry.toks.size === best.toks.size && entry.toks.has('barbell') && !best.toks.has('barbell'))));
      if (better) {
        best = entry;
        bestShared = shared;
      }
    }
    return best ? best.exercise : null;
  };
}

// ---------- Line parsing ----------

const WEIGHT_UNIT = '(lbs?|pounds?|#|kgs?|kilos?|kilograms?)';
const REST_UNIT = '(seconds?|secs?|s|minutes?|mins?|m)';

function joinNote(existing: string | undefined, next: string): string {
  return existing ? `${existing}, ${next}` : next;
}

function toWeightUnit(token: string | undefined): WeightUnit | undefined {
  if (!token) return undefined;
  return /^k/i.test(token) ? 'kg' : 'lbs';
}

function toSeconds(value: number, unit: string | undefined): number {
  if (unit && /^m/i.test(unit)) return Math.round(value * 60);
  if (unit) return Math.round(value);
  return value <= 5 ? Math.round(value * 60) : Math.round(value); // "rest 2" = 2 minutes
}

type ParsedLine = {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  unit?: WeightUnit;
  restSeconds?: number;
  note?: string;
  timed?: boolean; // reps came from a duration ("60s"), not a rep count
};

export function parseLine(line: string): ParsedLine | null {
  let text = line
    .replace(/[×✕]/g, 'x')
    .replace(/^\s*(?:[-*•·▪◦]|\(?\d+[.)])\s+/, '') // bullets / "1." numbering
    .trim();
  if (!text) return null;

  const result: ParsedLine = { name: '' };
  const cut = (re: RegExp, fn: (m: RegExpMatchArray) => void) => {
    const m = text.match(re);
    if (m) {
      fn(m);
      text = text.replace(m[0], ' ');
    }
  };

  // Rest first so "rest 90s" isn't mistaken for reps or weight
  cut(new RegExp(`\\brest(?:ing)?\\s*:?\\s*(\\d+(?:\\.\\d+)?)\\s*${REST_UNIT}?\\b`, 'i'), (m) => {
    result.restSeconds = toSeconds(parseFloat(m[1]), m[2]);
  });
  cut(new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*${REST_UNIT}\\s*(?:of\\s*)?rest\\b`, 'i'), (m) => {
    result.restSeconds = toSeconds(parseFloat(m[1]), m[2]);
  });

  cut(/\b(each|per)\s+(leg|side|arm|hand)\b/i, (m) => {
    result.note = `${m[1].toLowerCase()} ${m[2].toLowerCase()}`;
  });

  // Weight: "@ 135", "135 lbs", "60kg", "135#"
  cut(new RegExp(`@\\s*(\\d+(?:\\.\\d+)?)\\s*${WEIGHT_UNIT}?`, 'i'), (m) => {
    result.weight = parseFloat(m[1]);
    result.unit = toWeightUnit(m[2]);
  });
  if (result.weight === undefined) {
    cut(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${WEIGHT_UNIT}(?![a-z])`, 'i'), (m) => {
      result.weight = parseFloat(m[1]);
      result.unit = toWeightUnit(m[2]);
    });
  }

  // Sets x reps: "3x10", "4 x 8-12", "3x30s", "5x5x225" (third number = weight)
  cut(/\b(\d+)\s*x\s*(\d+)(?:\s*-\s*\d+)?\s*(sec(?:ond)?s?|s|min(?:ute)?s?)?(?:\s*x\s*(\d+(?:\.\d+)?))?(?![\d.])/i, (m) => {
    result.sets = parseInt(m[1], 10);
    result.reps = parseInt(m[2], 10);
    if (m[3]) result.note = joinNote(result.note, `${m[2]} ${/^m/i.test(m[3]) ? 'min' : 'sec'} per set`);
    if (m[4] && result.weight === undefined) result.weight = parseFloat(m[4]);
  });
  // "3 sets of 10", "3 sets x 10 reps", "4 sets 8-10 reps"
  if (result.sets === undefined) {
    cut(/\b(\d+)\s*(?:sets?|rounds?)\b\s*(?:of|x|,)?\s*(\d+)(?:\s*-\s*\d+)?\s*(reps?|sec(?:ond)?s?|s|min(?:ute)?s?)?\b/i, (m) => {
      result.sets = parseInt(m[1], 10);
      result.reps = parseInt(m[2], 10);
      if (m[3] && !/^rep/i.test(m[3])) result.note = joinNote(result.note, `${m[2]} ${/^m/i.test(m[3]) ? 'min' : 'sec'} per set`);
    });
  }
  if (result.sets === undefined) {
    cut(/\b(\d+)\s*(?:sets?|rounds?)\b/i, (m) => {
      result.sets = parseInt(m[1], 10);
    });
  }
  if (result.reps === undefined) {
    cut(/\b(\d+)(?:\s*-\s*\d+)?\s*reps?\b/i, (m) => {
      result.reps = parseInt(m[1], 10);
    });
  }
  // "Burpees x 10" (reps only)
  if (result.reps === undefined) {
    cut(/(?:^|\s)x\s*(\d+)\b/i, (m) => {
      result.reps = parseInt(m[1], 10);
    });
  }
  // "Jump rope 60s", "Plank 1 min" (timed, no reps)
  if (result.reps === undefined) {
    cut(/\b(\d+)\s*(sec(?:ond)?s?|s|min(?:ute)?s?)\b/i, (m) => {
      result.reps = parseInt(m[1], 10);
      result.timed = true;
      result.note = joinNote(result.note, `${m[1]} ${/^m/i.test(m[2]) ? 'min' : 'sec'} per set`);
    });
  }
  // "Squats 5x5 225": a leftover standalone number after sets/reps is the weight
  if (result.weight === undefined && (result.sets !== undefined || result.reps !== undefined)) {
    cut(/(?:^|\s)(\d+(?:\.\d+)?)(?=\s|$)/, (m) => {
      result.weight = parseFloat(m[1]);
    });
  }

  result.name = text
    .replace(/\b(?:sets?|reps?|rounds?|of|for|with|at)\b/gi, ' ')
    .replace(/[@:|,;()[\]–—-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return result;
}

// ---------- Delimited data (CSV / pasted spreadsheet cells) ----------

function splitDelimited(line: string, delimiter: string): string[] {
  if (delimiter === '\t') return line.split('\t').map((c) => c.trim());
  const cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === delimiter && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function detectDelimiter(lines: string[]): string | null {
  const sample = lines.slice(0, 10);
  if (sample.filter((l) => l.includes('\t')).length >= Math.ceil(sample.length / 2)) return '\t';
  // Treat as CSV only when most lines have the same number of commas (2+ columns)
  const counts = sample.map((l) => splitDelimited(l, ',').length);
  const multi = counts.filter((c) => c >= 2);
  if (multi.length >= Math.ceil(sample.length * 0.7) && new Set(multi).size <= 2) return ',';
  return null;
}

type ColumnMap = { name: number; sets?: number; reps?: number; weight?: number; rest?: number; group?: number; unit?: WeightUnit };

function readHeader(cells: string[]): ColumnMap | null {
  const lower = cells.map((c) => c.toLowerCase());
  const find = (re: RegExp) => {
    const i = lower.findIndex((c) => re.test(c));
    return i >= 0 ? i : undefined;
  };
  const name = find(/exercise|movement|lift|^name$|activity/);
  if (name === undefined) return null;
  const weight = find(/weight|load|lbs?\b|kg/);
  return {
    name,
    sets: find(/^sets?\b|# ?of sets/),
    reps: find(/reps?|repetitions/),
    weight,
    rest: find(/rest/),
    group: find(/block|group|superset|circuit/),
    unit: weight !== undefined ? toWeightUnit(lower[weight].match(/kg|lb/)?.[0]) : undefined,
  };
}

// ---------- Main entry point ----------

// "Block 1", "BLOCK 2 - Legs", "Superset A", "Circuit 1 (3 rounds)", "Giant set", "Tri-set B"
const BLOCK_HEADING = /^\s*(?:[-*•#]+\s*)?(block|super\s*set|circuit|giant\s*set|tri-?set|group)\b\s*([a-z0-9]{1,3})?\b(.*)$/i;
// "A1. Bench Press", "B2) Rows" — letters group exercises into supersets
const LETTER_PREFIX = /^\s*([a-z])(\d{1,2})\s*[.):\-–]?\s+/i;

type ActiveGroup = { key: string; label: string; rounds?: number; rest?: number };

function readBlockHeading(text: string, counter: number): { group: ActiveGroup; remainder: string } | null {
  const m = text.match(BLOCK_HEADING);
  if (!m) return null;
  const kind = m[1].replace(/\s+/g, ' ').toLowerCase();
  const id = m[2] ?? '';
  let remainder = m[3] ?? '';
  const group: ActiveGroup = {
    key: `block-${counter}`,
    label: `${kind.charAt(0).toUpperCase()}${kind.slice(1)}${id ? ` ${id.toUpperCase()}` : ''}`,
  };
  const rounds = remainder.match(/(\d+)\s*(?:rounds?|sets?)\b|\bx\s*(\d+)\b/i);
  if (rounds) {
    group.rounds = parseInt(rounds[1] ?? rounds[2], 10);
    remainder = remainder.replace(rounds[0], ' ');
  }
  const rest = remainder.match(new RegExp(`\\brest\\s*:?\\s*(\\d+(?:\\.\\d+)?)\\s*${REST_UNIT}?\\b`, 'i'));
  if (rest) {
    group.rest = toSeconds(parseFloat(rest[1]), rest[2]);
    remainder = remainder.replace(rest[0], ' ');
  }
  remainder = remainder.replace(/^[\s:.)\-–—(]+|[\s()]+$/g, '').trim();
  return { group, remainder };
}

export function parseWorkoutText(input: string, catalog: Exercise[], defaultUnit: WeightUnit): ImportResult {
  const match = buildMatcher(catalog);
  const lines = input
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result: ImportResult = { title: null, lines: [], skipped: [] };
  const delimiter = detectDelimiter(lines);
  let header: ColumnMap | null = null;
  let activeGroup: ActiveGroup | null = null;
  let blockCounter = 0;
  const groupInfo = new Map<string, ActiveGroup>();

  const addExercise = (raw: string, parsed: ParsedLine, group: ActiveGroup | null): boolean => {
    if (!/[a-z]/i.test(parsed.name)) return false;
    const catalogMatch = match(parsed.name);
    const hasNumbers = parsed.sets !== undefined || parsed.reps !== undefined || parsed.weight !== undefined;
    if (!hasNumbers && !catalogMatch) return false;

    // A timed line with no sets ("Bike 5 min") is one set unless its block says how many rounds
    const sets = parsed.sets ?? group?.rounds ?? (parsed.timed ? 1 : undefined);
    const name = catalogMatch ? catalogMatch.name : toTitleCase(parsed.name);
    const slug = normalizeName(parsed.name).replace(/\s+/g, '-');
    const exercise: WorkoutExercise = {
      exerciseId: catalogMatch ? catalogMatch.id : `import-${slug}`,
      exerciseName: name,
      sets: clamp(Math.round(sets ?? 3), 1, 20),
      reps: clamp(Math.round(parsed.reps ?? 10), 1, 500),
      restSeconds: clamp(parsed.restSeconds ?? 60, 0, 900),
      unit: parsed.unit ?? defaultUnit,
    };
    if (parsed.weight !== undefined && parsed.weight > 0) exercise.weight = parsed.weight;
    if (parsed.note) exercise.notes = parsed.note;

    result.lines.push({
      raw,
      exercise,
      group: group?.label,
      matched: !!catalogMatch,
      usedDefaults: sets === undefined && parsed.reps === undefined,
    });
    groupKeys.push(group?.key ?? null);
    return true;
  };
  const groupKeys: (string | null)[] = [];

  // Pulls an "A1." style prefix off the text; returns the letter group it belongs to.
  const letterGroup = (text: string): { group: ActiveGroup | null; text: string } => {
    const m = text.match(LETTER_PREFIX);
    if (!m) return { group: null, text };
    const letter = m[1].toUpperCase();
    const key = `letter-${letter}`;
    if (!groupInfo.has(key)) groupInfo.set(key, { key, label: `Superset ${letter}` });
    return { group: groupInfo.get(key)!, text: text.slice(m[0].length) };
  };

  lines.forEach((line, index) => {
    if (delimiter) {
      const cells = splitDelimited(line, delimiter);
      if (index === 0) header = readHeader(cells);
      if (index === 0 && header) return;
      if (header) {
        const h: ColumnMap = header;
        const nameCell = (cells[h.name] ?? '').trim();
        const others = cells.filter((c, i) => i !== h.name && c.trim() !== '');
        // A row like "Block 1" with nothing else starts a block
        const heading = others.length === 0 ? readBlockHeading(nameCell, blockCounter + 1) : null;
        if (heading) {
          blockCounter++;
          activeGroup = heading.group;
          groupInfo.set(activeGroup.key, activeGroup);
          return;
        }
        const num = (i?: number) => {
          if (i === undefined) return undefined;
          const n = parseFloat((cells[i] ?? '').replace(/[^\d.]/g, ''));
          return isNaN(n) ? undefined : n;
        };
        const restCell = h.rest !== undefined ? cells[h.rest] ?? '' : '';
        const restMatch = restCell.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${REST_UNIT}?`, 'i'));
        const lettered = letterGroup(nameCell);
        let group: ActiveGroup | null = lettered.group ?? activeGroup;
        if (h.group !== undefined && (cells[h.group] ?? '').trim()) {
          const value = cells[h.group].trim();
          const key = `col-${value.toLowerCase()}`;
          if (!groupInfo.has(key)) {
            groupInfo.set(key, { key, label: /^\d+$|^[a-z]$/i.test(value) ? `Block ${value.toUpperCase()}` : value });
          }
          group = groupInfo.get(key)!;
        }
        const parsed: ParsedLine = {
          name: lettered.text.trim(),
          sets: num(h.sets),
          reps: num(h.reps),
          weight: num(h.weight),
          unit: h.unit ?? (h.weight !== undefined ? toWeightUnit(cells[h.weight]?.match(/kg|lb/i)?.[0]) : undefined),
          restSeconds: restMatch ? toSeconds(parseFloat(restMatch[1]), restMatch[2]) : undefined,
        };
        if (!addExercise(line, parsed, group)) result.skipped.push(line);
        return;
      }
      line = cells.filter(Boolean).join(' ');
    }

    const heading = readBlockHeading(line, blockCounter + 1);
    if (heading) {
      blockCounter++;
      activeGroup = heading.group;
      groupInfo.set(activeGroup.key, activeGroup);
      // "Superset A: Bench 3x10" — an exercise on the same line as the heading
      if (heading.remainder) {
        const parsed = parseLine(heading.remainder);
        if (parsed) addExercise(line, parsed, activeGroup);
      }
      return;
    }

    const lettered = letterGroup(line);
    const parsed = parseLine(lettered.text);
    const group = lettered.group ?? activeGroup;
    if (parsed && addExercise(line, parsed, group)) return;

    // Not an exercise: the first one is the workout name, later ones end the current block
    if (parsed && /[a-z]/i.test(parsed.name) && result.title === null && result.lines.length === 0) {
      result.title = cleanHeading(line);
    } else {
      result.skipped.push(line);
      activeGroup = null;
    }
  });

  // Link each run of consecutive exercises in the same block into one superset
  for (let i = 0; i < result.lines.length; i++) {
    const key = groupKeys[i];
    if (!key) continue;
    let end = i;
    while (end + 1 < result.lines.length && groupKeys[end + 1] === key) end++;
    if (end > i) {
      for (let j = i; j < end; j++) result.lines[j].exercise.supersetWith = j + 1;
      const rest = groupInfo.get(key)?.rest;
      if (rest !== undefined) result.lines[end].exercise.restSeconds = rest;
    } else {
      result.lines[i].group = undefined; // a block with a single exercise is just a normal exercise
    }
    i = end;
  }

  return result;
}

export function buildDraftWorkout(result: ImportResult, source: string): Workout {
  return {
    id: `custom-${Date.now()}`,
    title: result.title ?? 'Imported Workout',
    description: `Imported from ${source}`,
    exercises: result.lines.map((l) => l.exercise),
    difficulty: 'intermediate',
    category: 'strength',
    createdAt: Date.now(),
    isCustom: true,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const KEEP_UPPER = new Set(['db', 'bb', 'ez', 'kb', 'rdl', 'ohp', 'trx']);

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) =>
    KEEP_UPPER.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );
}

function cleanHeading(line: string) {
  return line
    .replace(/^\s*(?:[-*•·▪◦#]+|\(?\d+[.)])\s*/, '')
    .replace(/[:\s]+$/, '')
    .trim();
}

// ---------- Category / equipment guesses for new exercises ----------

const CATEGORY_RULES: [Exercise['category'], RegExp][] = [
  ['flexibility', /stretch|mobility|foam|yoga|pigeon|cat cow|dislocate|circle|jefferson/],
  ['legs', /nordic|leg curl|hamstring curl/],
  ['agility', /ladder|shuttle|cone|agility|drill|shuffle|backpedal|carioca/],
  ['power', /jump|clean|snatch|jerk|throw|slam|plyo|bound|explosive|box/],
  ['cardio', /run|jog|sprint|bike|cycl|row(ing)? machine|rower|rope|burpee|swim|walk|stair|elliptical|jumping jack|high knee|battle/],
  ['core', /plank|crunch|\bab\b|sit up|twist|hollow|dead bug|leg raise|knee raise|v up|rollout|pallof|woodchop|oblique|core/],
  ['arms', /curl|tricep|bicep|skull|pushdown|kickback|extension|forearm|wrist|hammer/],
  ['shoulders', /shoulder|lateral|front raise|rear delt|overhead|military|arnold|face pull|shrug|upright|\bdelt/],
  ['legs', /squat|lunge|leg|calf|thrust|glute|deadlift|rdl|step up|hamstring|quad|split|hip|adductor|abductor/],
  ['back', /\brow|pull|lat|chin|back|hyperextension|superman/],
  ['chest', /bench|chest|press|fly|flye|push up|dip|pec/],
];

export function guessExerciseCategory(name: string): Exercise['category'] {
  const n = normalizeName(name);
  for (const [category, re] of CATEGORY_RULES) if (re.test(n)) return category;
  return 'athletic';
}

export function guessEquipment(name: string): string[] {
  const n = normalizeName(name);
  const found: string[] = [];
  if (/dumbbell/.test(n)) found.push('Dumbbells');
  if (/barbell|\bbar\b|ez/.test(n)) found.push('Barbell');
  if (/kettlebell/.test(n)) found.push('Kettlebell');
  if (/cable/.test(n)) found.push('Cable Machine');
  if (/machine|press machine|leg press/.test(n)) found.push('Machine');
  if (/band/.test(n)) found.push('Resistance Band');
  if (/medicine ball|med ball/.test(n)) found.push('Medicine Ball');
  if (/sled/.test(n)) found.push('Sled');
  if (/landmine/.test(n)) found.push('Landmine');
  if (/bench/.test(n)) found.push('Bench');
  return found.length ? found : ['Bodyweight'];
}

// ---------- Google Docs / Sheets links ----------

/** Returns the plain-text/CSV export URL for a Google Docs or Sheets link, or null. */
export function googleExportUrl(link: string): string | null {
  const doc = link.match(/docs\.google\.com\/document\/d\/([\w-]+)/);
  if (doc) return `https://docs.google.com/document/d/${doc[1]}/export?format=txt`;
  const sheet = link.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  if (sheet) {
    const gid = link.match(/[#&?]gid=(\d+)/);
    return `https://docs.google.com/spreadsheets/d/${sheet[1]}/export?format=csv${gid ? `&gid=${gid[1]}` : ''}`;
  }
  return null;
}
