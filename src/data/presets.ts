// Preset Scenarios for Instant Interactive Testing Without a Physical Camera

export interface PresetScenario {
  id: string;
  title: string;
  mode: 'navigate' | 'read' | 'find' | 'color' | 'general';
  category: string;
  description: string;
  prompt: string;
  imageData: string;
}

// Crisp inline SVGs encoded as base64 data URLs for immediate offline/desktop testing
function createSvgDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'staircase-hazard',
    title: 'Staircase & Drop-off Hazard',
    mode: 'navigate',
    category: 'Spatial Navigator',
    description: 'A flight of stairs descending downward with a handrail on the left.',
    prompt: 'Check for immediate walking hazards and clear footing ahead.',
    imageData: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#18181b"/>
        <!-- Wall and hallway -->
        <path d="M0,0 L200,100 L200,300 L0,400 Z" fill="#27272a"/>
        <path d="M600,0 L400,100 L400,300 L600,400 Z" fill="#27272a"/>
        <!-- Descending Steps -->
        <rect x="200" y="240" width="200" height="20" fill="#3f3f46" stroke="#71717a" stroke-width="2"/>
        <rect x="220" y="260" width="160" height="20" fill="#333338" stroke="#71717a" stroke-width="2"/>
        <rect x="240" y="280" width="120" height="20" fill="#27272a" stroke="#71717a" stroke-width="2"/>
        <rect x="260" y="300" width="80" height="20" fill="#1c1c1f" stroke="#71717a" stroke-width="2"/>
        <!-- Handrail -->
        <line x1="180" y1="180" x2="260" y2="340" stroke="#f4f4f5" stroke-width="8" stroke-linecap="round"/>
        <!-- Text Overlay -->
        <text x="300" y="80" fill="#f4f4f5" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">CAUTION: STAIRS DESCENDING</text>
        <text x="300" y="110" fill="#a1a1aa" font-family="sans-serif" font-size="14" text-anchor="middle">Handrail 3 paces ahead on left hand side</text>
      </svg>
    `)
  },
  {
    id: 'medicine-bottle',
    title: 'Prescription Medicine Label',
    mode: 'read',
    category: 'Instant Text Reader',
    description: 'An amber prescription vial with clear patient dosage and medication details.',
    prompt: 'Read the medication name, dosage, and warning instructions clearly.',
    imageData: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#09090b"/>
        <!-- Table surface -->
        <rect y="280" width="600" height="120" fill="#1f1f23"/>
        <!-- Amber prescription bottle -->
        <rect x="220" y="120" width="160" height="210" rx="15" fill="#ca8a04" opacity="0.9" stroke="#eab308" stroke-width="2"/>
        <!-- Bottle cap -->
        <rect x="240" y="90" width="120" height="30" rx="6" fill="#f4f4f5"/>
        <!-- White Prescription Label -->
        <rect x="230" y="150" width="140" height="150" rx="4" fill="#ffffff"/>
        <rect x="240" y="160" width="120" height="14" fill="#ef4444" rx="2"/>
        <text x="300" y="172" fill="#ffffff" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">PHARMACY RX #83921</text>
        <text x="240" y="195" fill="#000000" font-family="sans-serif" font-size="14" font-weight="bold">AMOXICILLIN</text>
        <text x="240" y="212" fill="#18181b" font-family="sans-serif" font-size="11">500mg Oral Capsule</text>
        <text x="240" y="235" fill="#3f3f46" font-family="sans-serif" font-size="10">Take 1 capsule every</text>
        <text x="240" y="248" fill="#3f3f46" font-family="sans-serif" font-size="10">8 hours with meals</text>
        <text x="240" y="275" fill="#dc2626" font-family="sans-serif" font-size="8" font-weight="bold">FINISH ALL MEDICATION</text>
      </svg>
    `)
  },
  {
    id: 'keys-finding',
    title: 'Lost House Keys on Desk',
    mode: 'find',
    category: 'Object Locator',
    description: 'A wooden work desk with brass keys lying next to a black coffee mug.',
    prompt: 'Where are my keys located relative to my position?',
    imageData: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#18181b"/>
        <!-- Desk Surface -->
        <rect y="160" width="600" height="240" fill="#27272a"/>
        <!-- Laptop at 12 o'clock -->
        <rect x="200" y="80" width="200" height="140" rx="6" fill="#52525b" stroke="#71717a" stroke-width="2"/>
        <!-- Coffee Mug at 2 o'clock -->
        <circle cx="480" cy="240" r="35" fill="#09090b" stroke="#3f3f46" stroke-width="4"/>
        <rect x="510" y="225" width="20" height="30" rx="6" fill="none" stroke="#3f3f46" stroke-width="4"/>
        <!-- Brass Keyring at 10 o'clock -->
        <circle cx="140" cy="250" r="24" fill="none" stroke="#eab308" stroke-width="6"/>
        <rect x="155" y="245" width="60" height="12" rx="2" fill="#eab308" transform="rotate(25 155 245)"/>
        <rect x="195" y="260" width="10" height="8" fill="#ca8a04"/>
        <rect x="210" y="267" width="10" height="8" fill="#ca8a04"/>
        <!-- Marker label -->
        <text x="140" y="320" fill="#facc15" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Keys at 10 o'clock</text>
        <text x="480" y="310" fill="#a1a1aa" font-family="sans-serif" font-size="12" text-anchor="middle">Mug at 2 o'clock</text>
      </svg>
    `)
  },
  {
    id: 'wardrobe-colors',
    title: 'Wardrobe & Outfit Coordination',
    mode: 'color',
    category: 'Color Stylist',
    description: 'A deep navy knit sweater hanging beside olive green chinos.',
    prompt: 'Describe the colors, textures, and whether these garments complement each other.',
    imageData: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#09090b"/>
        <!-- Wardrobe closet back -->
        <rect x="40" y="40" width="520" height="360" fill="#18181b" stroke="#27272a" stroke-width="2"/>
        <line x1="40" y1="90" x2="560" y2="90" stroke="#71717a" stroke-width="6"/>
        <!-- Navy Wool Sweater (left) -->
        <path d="M140,110 L100,180 L130,190 L150,150 L150,330 L270,330 L270,150 L290,190 L320,180 L280,110 Z" fill="#1e3a8a" stroke="#1d4ed8" stroke-width="2"/>
        <!-- Olive Chinos (right) -->
        <path d="M340,120 L460,120 L480,360 L420,360 L400,220 L380,360 L320,360 Z" fill="#3f6212" stroke="#4d7c0f" stroke-width="2"/>
        <!-- Description Badges -->
        <text x="210" y="360" fill="#93c5fd" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Deep Navy Blue Knit</text>
        <text x="400" y="390" fill="#bef264" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Olive Green Chinos</text>
      </svg>
    `)
  },
  {
    id: 'crosswalk-safety',
    title: 'Pedestrian Crosswalk & Traffic',
    mode: 'navigate',
    category: 'Spatial Navigator',
    description: 'Street crossing with tactile paving and white zebra stripes.',
    prompt: 'Check traffic state, pedestrian signals, and tactile guidance pavement.',
    imageData: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#18181b"/>
        <!-- Sidewalk with Yellow Tactile Warning Blister Pavers -->
        <rect y="260" width="600" height="140" fill="#3f3f46"/>
        <rect y="240" width="600" height="30" fill="#eab308" stroke="#ca8a04" stroke-width="1"/>
        <!-- Asphalt Street -->
        <rect y="0" width="600" height="240" fill="#09090b"/>
        <!-- White Zebra stripes -->
        <rect x="80" y="40" width="40" height="170" fill="#ffffff" opacity="0.9"/>
        <rect x="180" y="40" width="40" height="170" fill="#ffffff" opacity="0.9"/>
        <rect x="280" y="40" width="40" height="170" fill="#ffffff" opacity="0.9"/>
        <rect x="380" y="40" width="40" height="170" fill="#ffffff" opacity="0.9"/>
        <rect x="480" y="40" width="40" height="170" fill="#ffffff" opacity="0.9"/>
        <!-- Signal Pole on Right -->
        <rect x="520" y="60" width="14" height="180" fill="#71717a"/>
        <rect x="500" y="30" width="54" height="80" rx="6" fill="#000000" stroke="#3f3f46" stroke-width="2"/>
        <!-- Walk Sign (White Walking Person Icon) -->
        <circle cx="527" cy="55" r="7" fill="#ffffff"/>
        <line x1="527" y1="62" x2="527" y2="85" stroke="#ffffff" stroke-width="4"/>
        <text x="300" y="330" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">TACTILE CURB PAVING REACHED</text>
        <text x="300" y="360" fill="#a1a1aa" font-family="sans-serif" font-size="13" text-anchor="middle">Walk symbol active at 2 o'clock pole</text>
      </svg>
    `)
  }
];

