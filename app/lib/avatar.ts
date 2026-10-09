import { avataaars } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';

// ---- Data model -------------------------------------------------------------

export interface AvataaarsConfig {
  skinColor: string;
  top: string; // '' = bald / no hair
  hairColor: string;
  eyebrows: string;
  eyes: string;
  eyeColor: string; // '' or 'natural' = default dark eyes
  mouth: string;
  facialHair: string; // '' = none
  facialHairColor: string;
  accessories: string; // '' = none (glasses etc.)
  accessoriesColor: string;
  clothing: string;
  clothesColor: string;
}

export type AvatarData =
  | { kind: 'dicebear'; bgColor: string; config: AvataaarsConfig }
  | { kind: 'photo'; photoUri: string };

// ---- Option catalogs (value + human label) ---------------------------------

export interface Option {
  value: string;
  label: string;
}

// Palettes taken from the avataaars schema defaults so colors sit right on the art.
export const SKIN_COLORS = ['ffdbb4', 'edb98a', 'fd9841', 'f8d25c', 'd08b5b', 'ae5d29', '614335'];
export const HAIR_COLORS = ['2c1b18', '4a312c', '724133', 'a55728', 'b58143', 'd6b370', 'c93305', 'f59797', 'ecdcbf', 'e8e1e1'];
export const CLOTHES_COLORS = ['262e33', '3c4f5c', '65c9ff', '5199e4', '25557c', '929598', 'e6e6e6', 'ffffff', 'a7ffc4', 'b1e2ff', 'ffafb9', 'ffffb1', 'ff488e', 'ff5c5c'];
export const BG_COLORS = ['00B8A9', '65c9ff', '5199e4', 'ff6b6b', '4ecdc4', 'ffe66d', 'a8e6cf', 'dda0dd', 'ffa07a', 'b6e3f4', 'c0aede', 'transparent'];
// 'natural' keeps the art's default dark eyes; the rest are realistic iris colors.
export const EYE_COLORS = ['natural', '3d2314', '6b4226', 'a86540', '8a6b3f', '4a7c46', '3f6cb8', '6ba3d6', '7a8a8f'];

// Eye styles that read well with an injected iris color.
const EYE_COLORABLE = new Set(['default', 'squint', 'surprised', 'side', 'wink', 'winkWacky', 'eyeRoll', 'cry']);

export const HAIR_STYLES: Option[] = [
  { value: '', label: 'Bald' },
  { value: 'shortFlat', label: 'Short Flat' },
  { value: 'shortRound', label: 'Short Round' },
  { value: 'shortCurly', label: 'Short Curly' },
  { value: 'shortWaved', label: 'Short Waved' },
  { value: 'theCaesar', label: 'Caesar' },
  { value: 'theCaesarAndSidePart', label: 'Caesar Side Part' },
  { value: 'sides', label: 'Sides' },
  { value: 'shavedSides', label: 'Shaved Sides' },
  { value: 'dreads01', label: 'Dreads' },
  { value: 'dreads02', label: 'Dreads 2' },
  { value: 'frizzle', label: 'Frizzle' },
  { value: 'shaggy', label: 'Shaggy' },
  { value: 'shaggyMullet', label: 'Shaggy Mullet' },
  { value: 'bigHair', label: 'Big Hair' },
  { value: 'bob', label: 'Bob' },
  { value: 'bun', label: 'Bun' },
  { value: 'curly', label: 'Curly' },
  { value: 'curvy', label: 'Curvy' },
  { value: 'dreads', label: 'Long Dreads' },
  { value: 'fro', label: 'Fro' },
  { value: 'froBand', label: 'Fro Band' },
  { value: 'longButNotTooLong', label: 'Medium Long' },
  { value: 'miaWallace', label: 'Mia Wallace' },
  { value: 'straight01', label: 'Straight' },
  { value: 'straight02', label: 'Straight 2' },
  { value: 'straightAndStrand', label: 'Straight + Strand' },
  { value: 'hat', label: 'Hat' },
  { value: 'turban', label: 'Turban' },
  { value: 'hijab', label: 'Hijab' },
  { value: 'winterHat1', label: 'Beanie' },
  { value: 'winterHat03', label: 'Bobble Hat' },
];

export const EYEBROW_STYLES: Option[] = [
  { value: 'default', label: 'Default' },
  { value: 'defaultNatural', label: 'Natural' },
  { value: 'flatNatural', label: 'Flat' },
  { value: 'raisedExcited', label: 'Raised' },
  { value: 'raisedExcitedNatural', label: 'Raised Natural' },
  { value: 'angry', label: 'Angry' },
  { value: 'angryNatural', label: 'Angry Natural' },
  { value: 'sadConcerned', label: 'Concerned' },
  { value: 'sadConcernedNatural', label: 'Concerned Natural' },
  { value: 'upDown', label: 'Up Down' },
  { value: 'upDownNatural', label: 'Up Down Natural' },
  { value: 'frownNatural', label: 'Frown' },
  { value: 'unibrowNatural', label: 'Unibrow' },
];

export const EYE_STYLES: Option[] = [
  { value: 'default', label: 'Default' },
  { value: 'happy', label: 'Happy' },
  { value: 'wink', label: 'Wink' },
  { value: 'winkWacky', label: 'Wacky Wink' },
  { value: 'side', label: 'Side' },
  { value: 'squint', label: 'Squint' },
  { value: 'surprised', label: 'Surprised' },
  { value: 'hearts', label: 'Hearts' },
  { value: 'closed', label: 'Closed' },
  { value: 'cry', label: 'Cry' },
  { value: 'eyeRoll', label: 'Eye Roll' },
  { value: 'xDizzy', label: 'Dizzy' },
];

export const MOUTH_STYLES: Option[] = [
  { value: 'default', label: 'Default' },
  { value: 'smile', label: 'Smile' },
  { value: 'twinkle', label: 'Twinkle' },
  { value: 'serious', label: 'Serious' },
  { value: 'tongue', label: 'Tongue' },
  { value: 'eating', label: 'Eating' },
  { value: 'grimace', label: 'Grimace' },
  { value: 'disbelief', label: 'Disbelief' },
  { value: 'concerned', label: 'Concerned' },
  { value: 'sad', label: 'Sad' },
  { value: 'screamOpen', label: 'Scream' },
];

export const FACIAL_HAIR_STYLES: Option[] = [
  { value: '', label: 'None' },
  { value: 'beardLight', label: 'Light Beard' },
  { value: 'beardMedium', label: 'Medium Beard' },
  { value: 'beardMajestic', label: 'Full Beard' },
  { value: 'moustacheFancy', label: 'Fancy Moustache' },
  { value: 'moustacheMagnum', label: 'Magnum Moustache' },
];

export const ACCESSORY_STYLES: Option[] = [
  { value: '', label: 'None' },
  { value: 'round', label: 'Round Glasses' },
  { value: 'wayfarers', label: 'Wayfarers' },
  { value: 'prescription01', label: 'Prescription' },
  { value: 'prescription02', label: 'Prescription 2' },
  { value: 'sunglasses', label: 'Sunglasses' },
  { value: 'kurt', label: 'Kurt' },
  { value: 'eyepatch', label: 'Eyepatch' },
];

export const CLOTHING_STYLES: Option[] = [
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'shirtCrewNeck', label: 'Crew Neck' },
  { value: 'shirtVNeck', label: 'V-Neck' },
  { value: 'shirtScoopNeck', label: 'Scoop Neck' },
  { value: 'collarAndSweater', label: 'Collar + Sweater' },
  { value: 'blazerAndShirt', label: 'Blazer + Shirt' },
  { value: 'blazerAndSweater', label: 'Blazer + Sweater' },
  { value: 'graphicShirt', label: 'Graphic Tee' },
  { value: 'overall', label: 'Overalls' },
];

export const DEFAULT_AVATAAARS: AvataaarsConfig = {
  skinColor: 'edb98a',
  top: 'shortFlat',
  hairColor: '2c1b18',
  eyebrows: 'default',
  eyes: 'default',
  eyeColor: 'natural',
  mouth: 'smile',
  facialHair: '',
  facialHairColor: '2c1b18',
  accessories: '',
  accessoriesColor: '262e33',
  clothing: 'hoodie',
  clothesColor: '65c9ff',
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomAvataaars(): AvataaarsConfig {
  const facial = pick(FACIAL_HAIR_STYLES).value;
  return {
    skinColor: pick(SKIN_COLORS),
    top: pick(HAIR_STYLES.filter((h) => h.value !== '')).value,
    hairColor: pick(HAIR_COLORS),
    eyebrows: pick(EYEBROW_STYLES).value,
    eyes: pick(EYE_STYLES.slice(0, 8)).value,
    eyeColor: Math.random() < 0.5 ? pick(EYE_COLORS) : 'natural',
    mouth: pick(MOUTH_STYLES.slice(0, 7)).value,
    facialHair: Math.random() < 0.35 ? facial : '',
    facialHairColor: pick(HAIR_COLORS),
    accessories: Math.random() < 0.3 ? pick(ACCESSORY_STYLES.filter((a) => a.value !== '')).value : '',
    accessoriesColor: pick(CLOTHES_COLORS),
    clothing: pick(CLOTHING_STYLES).value,
    clothesColor: pick(CLOTHES_COLORS),
  };
}

// ---- SVG builder -----------------------------------------------------------

const svgCache = new Map<string, string>();

/**
 * avataaars has no eye-color option, so we post-process: tint the pupils and
 * slip an iris disc behind them inside the eye group (always at `translate(76 90)`).
 */
function injectEyeColor(svg: string, hex: string): string {
  const marker = '<g transform="translate(76 90)">';
  const start = svg.indexOf(marker);
  if (start < 0) return svg;
  const open = start + marker.length;
  const nextGroup = svg.indexOf('<g transform="translate(76 82)">', open);
  const end = nextGroup < 0 ? svg.indexOf('</g>', open) : nextGroup;
  if (end < 0) return svg;
  const fill = `#${hex}`;
  const tinted = svg.slice(open, end).replace(/fill="#000"/g, `fill="${fill}"`);
  const irises = `<circle cx="30" cy="22" r="7" fill="${fill}"/><circle cx="82" cy="22" r="7" fill="${fill}"/>`;
  return svg.slice(0, open) + irises + tinted + svg.slice(end);
}

/**
 * Build a deterministic avataaars SVG string for the given config.
 * `background` is a hex string (no #) or 'transparent'.
 */
export function buildAvatarSvg(config: AvataaarsConfig, background: string = 'transparent'): string {
  const key = `${JSON.stringify(config)}|${background}`;
  const cached = svgCache.get(key);
  if (cached) return cached;

  const options: Record<string, unknown> = {
    seed: 'fit4fitness',
    skinColor: [config.skinColor],
    hairColor: [config.hairColor],
    eyebrows: [config.eyebrows],
    eyes: [config.eyes],
    mouth: [config.mouth],
    clothing: [config.clothing],
    clothesColor: [config.clothesColor],
    backgroundColor: [background && background !== 'transparent' ? background : 'transparent'],
  };

  if (config.top) {
    options.top = [config.top];
    options.topProbability = 100;
  } else {
    options.topProbability = 0;
  }

  if (config.facialHair) {
    options.facialHair = [config.facialHair];
    options.facialHairColor = [config.facialHairColor];
    options.facialHairProbability = 100;
  } else {
    options.facialHairProbability = 0;
  }

  if (config.accessories) {
    options.accessories = [config.accessories];
    options.accessoriesColor = [config.accessoriesColor];
    options.accessoriesProbability = 100;
  } else {
    options.accessoriesProbability = 0;
  }

  let svg = createAvatar(avataaars, options).toString();

  const eyeColor = config.eyeColor;
  if (eyeColor && eyeColor !== 'natural' && EYE_COLORABLE.has(config.eyes)) {
    svg = injectEyeColor(svg, eyeColor);
  }

  if (svgCache.size > 200) svgCache.clear();
  svgCache.set(key, svg);
  return svg;
}

export function labelFor(options: Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
