const CANVAS_W = 1920;
const CANVAS_H = 1080;
const HORIZON_Y = Math.round(CANVAS_H * 0.42);

// p5.js runs at 60fps natively — the whole scene was originally tuned at
// 30fps though, so every per-frame speed/frequency below was calibrated
// assuming 30 draw() calls a second. Bumping frameRate() alone would make
// everything (swimming, sway, blinking, the hook...) visibly run 2x too
// fast, since all of it just steps a fixed amount every frame regardless of
// how often a frame happens. FRAME_TIME_SCALE corrects for that: multiply
// any "px moved per frame" or "sin(frameCount * freq)" frequency by it, and
// divide any "wait N frames" duration by it, so real-world speed/timing
// stays the same no matter what FRAME_RATE is set to.
const FRAME_RATE = 60;
const FRAME_TIME_SCALE = 30 / FRAME_RATE;

const PALETTE = {
  blackPearl:    ['#021427', '#042549', '#063E79', '#0A69CC'],
  springGreen:   ['#8FEC83', '#BFF4B8', '#E3FAE0', '#EBFBE9'],
  fineTurquoise: ['#2EC2B4', '#5ED9CD', '#98E7DF', '#C9F2EE'],
  oceanBlue:     ['#065274', '#086E9B', '#11AEF3', '#BBE8FB'],
  pastelBerry:   ['#ED8495', '#F3AAB6', '#F8CED5', '#FCEDF0']
};

// Raw vector path data traced from the Figma "Scene" frame's Kelp layers,
// read directly via the Plugin API. Corals/Fish Bone used to be traced the
// same way but were replaced with colored PNGs (see CORAL_ASSET_FILES
// below) — bezier-endpoint tracing loses too much curve smoothness on
// shapes this detailed.
const RAW_PATHS = {
  kelp: [
    "M 26.139664074428065 215.3665919952659 C 25.33008914104649 201.4276588451629 24.354187339727453 184.42389798516717 34.35164254552559 163.32556293889476 C 43.371962231654756 144.30309603701127 46.58937622321034 151.93002999581557 51.15964677815079 147.68077546230705 C 59.863757084315964 139.5866833719882 75.35152863090244 138.63639277149898 82.1150699112948 129.3163779732801 C 90.03750223903918 118.39344834668961 87.06739441097768 93.47896299129563 92.97148701761823 82.48939061257933 C 95.02666223024484 78.66509757938165 96.28064377463393 75.14728447529674 116.7385713872582 59.4694011031117 C 127.07075275195538 51.55329947820324 142.38709246633007 40.814080715301806 145.20365523346769 44.16921957266465 C 147.8285897420723 47.30231270877983 135.8656736808274 52.153136597692225 127.78090677161552 66.95032692522662 C 121.54431671874136 78.34328946578471 119.09496093993141 89.6719515587547 117.51832763720162 96.92524980282337 C 114.51770994502097 110.7585204883951 116.62380294266225 110.73171187065482 113.97297732049574 118.18970748860944 C 109.55886100557453 130.60373681638657 108.30998591748497 151.59471698587714 98.90722883613302 159.84202062198725 C 84.11633526884052 172.81842664961962 85.06030679803537 171.77300049349844 76.57454766802266 180.98164514256547 C 69.0965463831987 189.09646348702148 65.39210962391913 202.2081342363253 49.54144099034265 205.5297984058659 C 23.017926572812872 211.09183311576476 30.140867073580992 225.39238724651776 29.049653357481308 225.08667121194242 C 26.999091300317396 224.5187236862566 26.42470003537126 220.32029013131088 26.127471244368255 215.36372020426182 L 26.139664074428065 215.3665919952659 Z",
    "M 33.307762023860704 227.95597333046845 C 31.389354794624026 224.53224092232512 41.199023520315535 216.3167778950414 42.776559871306915 198.41590542276398 C 43.65778027025263 188.4045772393676 52.71532962231614 182.14028791971066 54.76272653448885 172.60412822028835 C 56.87443066595874 162.75381776875102 64.07965113526497 162.7035135629965 71.14878006811325 149.13757520968892 C 73.26284980556208 145.07383164428268 77.8643194470196 136.00807505063707 77.05882921241977 125.10870158890229 C 76.91816376775617 123.15136998358614 76.51601701084985 120.04409174325899 69.4003712078627 104.23861858564707 C 60.74233986243568 85.00868123668934 58.7379881356246 83.83114858113892 58.74350352194054 77.90715490359868 C 58.75705335767604 67.62970293331902 64.81990499186475 66.05893795481032 63.99688252846884 56.54816144769761 C 63.3068149448961 48.49914077103548 58.86963038149462 48.36086627777657 53.42879631096064 35.75759414931635 C 50.715979465637474 29.451403604040728 45.19723463590539 16.690636174874875 50.44118292405379 6.698893007836404 C 52.53463958714 2.7189571287031673 56.21783429017711 -0.6108278432016226 57.61240517428737 0.09498074814817654 C 59.97459665351361 1.2928499281255825 52.53940679420618 12.342340749113726 55.90489570923989 21.738413885068063 C 59.744586046315824 32.473435645075014 73.78892689280723 30.17288276055676 81.8440584511793 39.892853537208396 C 89.54044448272307 49.174462617921364 85.7007547051566 65.78689708187909 83.05321358999852 81.082733532708 C 81.51881047571231 89.90318906783652 80.23839285555141 91.26247019655659 80.68896833806335 96.59672887775443 C 81.75967015776033 109.36859906974485 89.95892323904775 111.65234150681796 93.59876425865413 123.56875152615697 C 98.5826555358181 139.92677671736882 89.53751843477261 156.62652110647247 88.30197925456096 158.85722365771483 C 80.49687531367576 172.83352449253368 72.3383672962332 170.01488106646426 66.2465104033611 182.8217093310312 C 59.3330258109147 197.33561093753514 67.2348965391664 206.3613651277911 59.370965774103134 216.6775885202123 C 52.174499203238504 226.12430239992943 34.74401328512269 230.4946930416592 33.320029455181285 227.9588451214725 L 33.307762023860704 227.95597333046845 Z",
    "M 20.658882520778402 216.09887476971022 C 16.365416213852033 210.10689181407992 10.224457890161789 201.4041026803072 5.452688210869906 187.45058172933827 C 2.9318399923319913 180.10043009007086 -0.23653333492069106 170.535204724666 0.013973012844261161 157.8189515517876 C 0.21923595730455378 147.4470438326527 -0.2806961957883152 108.53730083036407 3.691556478601795 129.48264270661952 C 4.492468340576766 133.7086716303827 13.571515095010612 140.7939910408564 13.420499739526443 148.1526346558663 C 13.306285022788531 153.5701075946492 12.210965206670425 159.3406283485451 12.608144230652918 164.52313568497655 C 13.034600193043028 170.21892106944068 19.111413088920376 171.43680986722057 21.45888107681843 172.6945417737329 C 28.46451836865287 176.45914306040044 32.1656547681561 179.27408344658534 37.22485042297012 185.41973489183593 C 40.808878509333425 189.76456472397393 36.331255551551074 195.74468359301872 36.51896732548892 210.5258053524507 C 36.66049999815249 222.01696893596517 36.68631772272412 228.02426184693755 34.12791933258528 229.04682314336173 C 30.87819292394725 230.35091587151643 25.466440662898187 222.7934488731069 20.668201710273454 216.11373628815625 L 20.658882520778402 216.09887476971022 Z",
    "M 24.41446217437701 224.3830345527636 C 17.78416620584116 214.03389624740726 26.206178080613878 192.17479459753125 26.020134950376242 163.89758780951655 C 25.993786000717495 159.78930942161125 25.88009868575209 152.24217423353898 22.87383125359037 143.33521721234666 C 17.0440056940689 126.0957675672128 7.166587087398952 123.83757958290239 4.25596425313864 111.11673752731542 C 2.597935193313997 103.84166228266152 5.6804245986332 95.47169129039246 11.903177236653944 79.02380895524306 C 21.0376271535932 54.90037114557629 30.541480506480273 31.698897719206645 34.65317487344622 33.63489786286742 C 38.76486924041216 35.570898006528196 30.16888283104955 44.43726985267982 28.61347470602697 62.090095864154755 C 27.994368494457134 69.08610481798885 26.908591578364806 81.40452519333566 31.40987312538547 94.8770106810527 C 35.851391975411744 108.1709350844697 40.72218513020834 107.6002563658811 46.62302474887313 123.28635874409079 C 48.936823882264825 129.42331329934495 52.12159107989946 138.13147357972997 51.85782505741994 149.11008977662087 C 51.588561295028164 160.47990672869335 47.86395815974771 162.97706063048037 43.01152101816922 179.17551595113108 C 35.18893501783581 205.289498302152 50.36472185385554 226.78995364018158 42.675194662226716 230.28475651884645 C 37.85937181943282 232.47619742424848 27.604151353381024 229.38267162266447 24.411515424576702 224.39500034861388 L 24.41446217437701 224.3830345527636 Z",
    "M 43.94684476921594 208.4564884812898 C 52.739076322637295 199.00295933297372 60.369079914312486 190.7970663248524 72.59073291723253 184.52541130998736 C 84.82758667304653 178.2446488287558 87.53005240693507 181.16794734891835 96.16648594135735 174.98248570087395 C 105.71692293251166 168.13707376643782 110.2105503901776 158.98283684323968 113.6481097182071 151.96195773059307 C 122.46126170318543 133.99255864120568 117.76313838852303 132.43855624695868 127.2343242223264 115.85107645024668 C 131.46913603398707 108.43415641799704 140.82153838334 103.28966890215533 144.32161767096184 93.48535272627967 C 154.7644767201208 64.14762044350523 146.20681540295536 134.7193042436203 133.54929110577532 159.36127084211128 C 131.65200703702178 163.07054116697384 120.58749363035409 183.1851247603862 99.73701567559742 192.87129066803638 C 92.50786853042845 196.23315243301147 86.22064287180847 197.3463203248211 68.78384251647816 204.95642140031305 C 61.771957369054455 208.01456434356783 61.66417122946002 216.7253679430424 53.323775640102845 223.18260198147362 C 41.12872693879764 232.61303041303853 33.48775864031802 228.9025127941828 32.30399907618605 228.18267729864752 C 24.95537875791084 223.70485998536083 38.4324064837648 214.38415939746724 43.962060442362045 208.44737054485188 L 43.94684476921594 208.4564884812898 Z"
  ]
};

// Character / Boat / Fishing Tools: exported straight out of Figma as PNGs
// (assets/) instead of traced as vector paths — the bezier-endpoint tracing
// used for the corals loses too much of the original curve smoothness on
// these larger, more detailed shapes. Only pieces that actually animate
// (eyes, fishing line) stay as code-drawn geometry.
// x/y/w/h below are each node's absoluteRenderBounds read via the Plugin API
// (the real rendered-pixel box, in Scene-relative coordinates) — not the
// layout bounding box, which can differ once corner-rounding or rotation is
// involved (Head's layout box is 143x143 but its rendered silhouette is
// 112x99; Rod/Hook are rotated so their layout x/y isn't their visual x/y).
const BODY_IMG_DEF = { x: 893, y: 351, w: 141.917, h: 65.116 };
const HEAD_IMG_DEF = { x: 910.424, y: 242, w: 112.152, h: 99.25 };
const HAND_DEFS = [
  { x: 1045, y: 365, d: 29 },
  { x: 1035, y: 351, d: 29 }
];
// Pupil is concentric with the sclera (both centered at x+r, y+r).
const EYE_DEFS = [
  { x: 948, y: 282, r: 16.1043, pupilR: 9.2025 },
  { x: 973.307, y: 282, r: 16.1043, pupilR: 9.2025 }
];
const MOUTH_IMG_DEF = { x: 950.221, y: 322.141, w: 54, h: 9 };
const BOAT_IMG_DEF = { x: 724, y: 363.227, w: 363.761, h: 117.799 };
const ROD_IMG_DEF = { x: 1055.113, y: 284.84, w: 64.36, h: 91.324 };
const HOOK_IMG_DEF = { x: 1103, y: 402, w: 27, h: 38 };
const LINE_ANCHOR = { x: 1117, y: 290 };

// Kelp instance data: real x/y/size/gradient pulled from the Figma nodes.
const KELP_DEFS = [
  { name: 'kelpL', paths: RAW_PATHS.kelp, x: 65,   y: 689, w: 149, h: 231, rot: 0,     top: PALETTE.blackPearl[3], bottom: PALETTE.oceanBlue[3] },
  { name: 'kelpR', paths: RAW_PATHS.kelp, x: 1426, y: 798, w: 149, h: 231, rot: 0.657, top: PALETTE.blackPearl[3], bottom: PALETTE.oceanBlue[3] }
];

// The 3 rock layers used to be procedurally generated (noise-based jagged
// silhouette, different every reload) — after many rounds of tuning it
// still never looked right, so they're real static art exported straight
// out of Figma instead, same as the character/boat/coral PNGs. x/y below
// are each layer's real absoluteRenderBounds (Scene-relative); all 3 are
// exactly CANVAS_W wide so only the y offset differs per layer.
const STONE_DEFS = {
  '1st': { file: 'First Layer Of Stone.png', y: 554 },
  '2nd': { file: '2nd Layer Of Stone.png', y: 554 },
  '3rd': { file: '3rd Layer Of Stone.png', y: 452 }
};

// Coral reef: generative, differs every reload. Each rock layer has a few
// hand-built presets — fixed compositions the artist laid out and colored
// directly in Figma, one exported PNG per coral (already colored, no
// code-side recoloring). On every load, one preset is picked per layer, so
// the reef is a permutation of hand-designed arrangements rather than an
// algorithmically scattered one. x/y/w/h below are each coral's
// absoluteRenderBounds read from its own preset frame via the Plugin API —
// every preset frame is exactly CANVAS_W x CANVAS_H, so these coordinates
// map directly onto the scene with no conversion.
const CORAL_ASSET_FILES = {
  Coral: 'Coral.png',
  Coral2: 'Coral2.png',
  Coral3: 'Coral3.png',
  Coral5: 'Coral5.png',
  Coral7: 'Coral7.png',
  Coral8: 'Coral8.png',
  Coral9: 'Coral8.png', // same shape as Coral8, only ever placed at a different scale
  'Fish Bone': 'Fish Bone.png'
};

const REEF_PRESETS = {
  '1st': [
    [
      { name: 'Fish Bone', x: 1326.83, y: 912.31, w: 120.67, h: 100.25 },
      { name: 'Coral3', x: 1625.73, y: 799.17, w: 160.68, h: 161.98 },
      { name: 'Coral2', x: 18, y: 664, w: 166, h: 367 },
      { name: 'Coral', x: 702.1, y: 912.19, w: 106.31, h: 142.53 }
    ],
    [
      { name: 'Fish Bone', x: 1309.42, y: 909.37, w: 118.3, h: 102.76 },
      { name: 'Coral2', x: 0, y: 617.63, w: 159.21, h: 364.35 },
      { name: 'Coral2', x: 1755, y: 604, w: 130, h: 289 },
      { name: 'Coral', x: 682.1, y: 881.19, w: 106.31, h: 142.53 }
    ]
  ],
  '2nd': [
    [
      { name: 'Coral7', x: 1646.26, y: 662.24, w: 168.36, h: 154.48 },
      { name: 'Coral5', x: 208.08, y: 817.33, w: 106.32, h: 142.42 }
    ],
    [
      { name: 'Coral7', x: 1346.86, y: 755.12, w: 165.01, h: 154.42 },
      { name: 'Coral5', x: 538.08, y: 817.33, w: 106.32, h: 142.42 }
    ],
    [
      { name: 'Coral7', x: 582.26, y: 838.24, w: 168.36, h: 154.48 },
      { name: 'Coral5', x: 1613.78, y: 685.63, w: 121.82, h: 127.65 }
    ]
  ],
  // The 3-coral composition (Coral9 + Coral8 + Coral8) was dropped —
  // remaining 2 nudged up 20px (smaller y) from their raw Figma position.
  '3rd': [
    [
      { name: 'Coral9', x: 65, y: 669, w: 149, h: 231 },
      { name: 'Coral8', x: 1469.7, y: 724.22, w: 160.65, h: 217.03 }
    ],
    [
      { name: 'Coral9', x: 589.15, y: 679.59, w: 141.87, h: 226.65 },
      { name: 'Coral8', x: 1648.31, y: 587.89, w: 144.25, h: 221.27 }
    ]
  ]
};

// STRIPS was originally raised to 50 (from 30) alongside cutting AMP way
// down, to fix thin multi-pronged coral branch tips tearing into
// disconnected fragments when a large sway swing (16px) sheared adjacent
// strips too far apart. AMP is much lower now (8, and further scaled down
// by reefHealth vitality below) than the 16px that caused that originally,
// so the strip count doesn't need to carry as much of the fix on its own —
// dialed back down to 30, since each strip is its own image() draw call and
// this was measured as the single biggest performance cost in the whole
// scene (REEF_STRIPS x every reef instance x 3 layers, every frame). If
// coral tips start tearing/pixelating again on sway, raise this back up
// before touching AMP again.
const REEF_STRIPS = 30;
const REEF_SWAY_AMP = 8;
const REEF_SWAY_SPEED = 0.034;
// Preset sizes come straight from each placement's real Figma renderBounds
// (verified accurate), but rendered at that literal size the reef reads as
// too prominent/bulky — scale every coral/Fish Bone down uniformly.
const REEF_SCALE = 0.65;

// Background fish: purely ambient, not a design focal point — a
// procedurally-drawn vector fish never looked right (tried rounded-corner
// polygons, tuned proportions, still read as off), so same as the reef, it's
// 3 hand-drawn PNG silhouettes exported straight from Figma instead. Split
// into 3 depth layers exactly like the reef (back/mid/front, drawn behind
// their matching rock layer so the rock naturally occludes whichever fish
// pass behind it) — each layer gets its own size/opacity/speed tier for a
// simple parallax read (farther = smaller, dimmer, slower).
//
// The source art is a flat black silhouette. Just tinting that down with a
// low alpha (the first version of this) still reads as "black fish, faded"
// rather than a fish that belongs in front of its own rock layer — tint()
// can only scale alpha, it can't inject a hue into pixels that are already
// (0,0,0) (multiplying black by any tint color is still black). So each
// layer's fish are recolored once at startup (source-in + a vertical
// gradient, same trick as the old coral recolor step) to the same
// blackPearl tones each rock layer's own gradient uses — front matches the
// 1st layer's darkest tone, back matches the 3rd layer's lighter/hazier one.
//
// Each fish's left/right heading is random, but two fish on the exact same
// horizontal line swimming toward each other reads as a glitch. Instead of
// checking every pair for collisions, each layer is pre-divided into a fixed
// number of horizontal "lanes" spanning the swim band, one fish per lane —
// so no two fish ever share a line by construction, and each fish's own
// direction is free to be random independently.
// BackFish1 dropped from the rotation — didn't read as nicely as the other
// two once seen in the scene. File stays in assets/ in case it's wanted
// again later, just not referenced here.
const FISH_ASSET_FILES = {
  BackFish2: 'BackFish2.png',
  BackFish3: 'BackFish3.png'
};
// sizeMin/sizeMax is each layer's own displayed-height range (px) — overlap
// a bit between tiers so the whole school's per-fish sizes span exactly
// 20-48px end to end, back skewed toward 20 and front skewed toward 48,
// rather than each layer being a fixed size with a multiplier on top.
const FISH_LAYER_DEFS = {
  back:  { count: 7, sizeMin: 20, sizeMax: 30, speed: 0.55, opacity: 0.34, top: PALETTE.blackPearl[2], bottom: PALETTE.blackPearl[3] },
  mid:   { count: 7, sizeMin: 26, sizeMax: 40, speed: 0.90, opacity: 0.44, top: PALETTE.blackPearl[1], bottom: PALETTE.blackPearl[2] },
  front: { count: 6, sizeMin: 36, sizeMax: 48, speed: 1.30, opacity: 1.00, top: PALETTE.blackPearl[0], bottom: PALETTE.blackPearl[1] }
};

// Background clouds: 2 depth layers drifting slowly across the sky (no
// vertical motion — just a straight horizontal drift). Unlike the fish
// PNGs, these are exported already colored (a teal/navy gradient that
// already matches the sky palette), so no recolor step is needed — just
// scale down and place. The source export is "full HD" (up to 2214x1080,
// bigger than the whole canvas), so the same pre-scale-once-at-build-time
// treatment as the fish applies here too, otherwise every cloud would redo
// a huge downscale every frame.
const CLOUD_ASSET_FILES = {
  Cloud1: 'Cloud1.png',
  Cloud2: 'Cloud2.png'
};
const CLOUD_LAYER_DEFS = {
  back:  { count: 3, widthMin: 160, widthMax: 240, speed: 0.12, opacity: 0.55 },
  front: { count: 3, widthMin: 230, widthMax: 340, speed: 0.22, opacity: 0.85 }
};
// Keeps clouds clear of the very top edge.
const CLOUD_SKY_TOP = HORIZON_Y * 0.16;
// Must always stay above the character's head — computed per-cloud from its
// own height (see buildCloudLayer) rather than a fixed constant, since
// bigger clouds need more headroom than smaller ones to keep their bottom
// edge clear of HEAD_IMG_DEF.y.
const CLOUD_HEAD_CLEARANCE = 15;
// Each cloud is assigned one vertical slice of the sky at build time and
// only ever drifts back and forth within it (bouncing at its own zone's
// edges), instead of sailing across the entire canvas width — reads as a
// handful of clouds each loosely parked over their own patch of sky.
const CLOUD_ZONE_COUNT = 4;

// Hero catchable fish (Fish1/Fish2): the actual gameplay subject, unlike the
// dim background BackFish silhouettes — full opacity, real color, drawn in
// front of the reef. They swim through nearly the whole water column,
// independent of whatever the boat is doing; the rod "catching" one happens
// via real proximity to the hook (see tryCatchAtHook()) — not a scripted/
// random pick, so as the population thins, catches naturally get rarer too.
// NOTE: this source art faces LEFT by default (eye/head on the left, tail
// fin on the right) — the opposite convention from BackFish/Cloud, which
// face right — so its mirror condition below is inverted accordingly.
const HERO_FISH_ASSET_FILES = {
  Fish1: 'Fish1.png',
  Fish2: 'Fish2.png',
  Fish3: 'Fish3.png'
};
const HERO_FISH_COUNT = 15;
const HERO_FISH_SIZE = 70; // px, reference height
// Wide on purpose — reads as a real mix of small (juvenile) and large
// (mature) fish, which matters for the health-penalty logic below: catching
// a juvenile before it can reproduce is worse for the population than
// catching an adult, so a caught fish's own size drives how much it costs.
const HERO_FISH_SIZE_MIN = HERO_FISH_SIZE * 0.45;
const HERO_FISH_SIZE_MAX = HERO_FISH_SIZE * 0.85;
// A caught fish at or above this size already had its chance to reproduce,
// so catching it is more sustainable — see the respawn logic in updateRig()
// and spawnJuvenileFish() below. Below this size, a catch is permanent.
const HERO_FISH_MATURE_THRESHOLD = (HERO_FISH_SIZE_MIN + HERO_FISH_SIZE_MAX) / 2;
const HERO_FISH_RESPAWN_FRAMES_MIN = 150 / FRAME_TIME_SCALE; // ~5s real time
const HERO_FISH_RESPAWN_FRAMES_MAX = 300 / FRAME_TIME_SCALE; // ~10s real time
const HERO_FISH_SPEED = 1.3;
// Spread through nearly the whole water column, not just the upper band —
// they're free to overlap the rock layers/coral/BackFish, all of which are
// purely decorative background, not something the hero fish need to stay
// clear of.
const HERO_FISH_BAND = { top: HORIZON_Y + 30, bottom: CANVAS_H - 20 };
const HERO_FISH_EDGE_SPAWN_MARGIN = 40; // extra clearance so a respawned fish starts fully off-screen, not clipped at the edge
const CATCH_RADIUS = 45; // px, how close a fish has to be to the hook to get caught
const CAUGHT_FISH_SIZE = 75; // px — pre-scale buffer resolution; actual draw size follows each caught fish's own height (see drawCaughtFish), always scaling down from this, never up

// Reef/ecosystem "health": starts full, only ever goes down (SDG 14.4 is
// about overfishing depleting stocks — there's no auto-recovery here, a
// fully fished-out lake just stays empty). Every hero-fish catch costs some
// health, more for a small/juvenile fish than a large/mature one — even a
// mature catch that later respawns still costs some health, since the
// fishing pressure itself is still degrading the ecosystem. Health drives
// two other systems purely visually: how much of the ambient BackFish
// population is still rendered (drawFishLayer), and how sluggish the
// reef's own sway animation reads (drawReefInstance) — the whole scene
// should feel like it's visibly losing life, not just the hero fish count.
let reefHealth = 1.0;
const REEF_HEALTH_PENALTY_SMALL = 0.06; // cost of catching the smallest fish
const REEF_HEALTH_PENALTY_LARGE = 0.02; // cost of catching the largest fish
const REEF_HEALTH_VITALITY_FLOOR = 0.15; // reef sway never fully freezes, just reads as barely alive

// Boat/character rig: for A2 the boat drives itself (interaction is saved
// for A3) — it picks a random spot on the water, sails there, fishes for a
// while, then picks a new spot, repeating forever. Every part below
// (BODY/HEAD/HAND/EYE/MOUTH/ROD/HOOK/LINE_ANCHOR_DEFS) was authored as
// fixed absolute Figma coordinates for one static pose, so to make the
// whole assembly movable+flippable as one rigid unit, everything gets
// drawn inside a single translate(rigX, 0) + (flip) transform, using each
// part's offset from RIG_ANCHOR_X0 (the boat's own original center) rather
// than its raw absolute x. See localDef()/localX() and drawRig() below.
const RIG_ANCHOR_X0 = BOAT_IMG_DEF.x + BOAT_IMG_DEF.w / 2;
// How far the rig's bounding box reaches behind (the boat's own back/left
// edge, currently the leftmost point of the whole assembly) and ahead (the
// rod+hook side, plus a little slack for the hook's idle sway) of that
// center — used to keep the whole box on-screen, including right up to
// both edges, regardless of which way the boat ends up facing.
const RIG_BACK_EXTENT = RIG_ANCHOR_X0 - BOAT_IMG_DEF.x;
const RIG_FRONT_EXTENT = (HOOK_IMG_DEF.x + HOOK_IMG_DEF.w + 4) - RIG_ANCHOR_X0;
const RIG_MOVE_SPEED = 4 * FRAME_TIME_SCALE; // px/frame while sailing between spots

// Claw-machine fishing: the hook drops straight down and grabs the very
// FIRST fish it touches, wherever that happens to be (not a fixed depth +
// wait), then heads straight back up — at most one fish per cast, whether
// the catch happens on the way down or (if nothing bit on the way down) on
// the way up. See updateRig()'s 'casting'/'reeling' branches and
// tryCatchAtHook() below.
const HOOK_REST_Y = HOOK_IMG_DEF.y; // idle/travelling depth, start and end of every cast
const HOOK_MAX_DEPTH_Y = CANVAS_H - 30; // how far down the hook can drop if it never touches a fish
const HOOK_CAST_SPEED = 8 * FRAME_TIME_SCALE; // px/frame descending
const HOOK_REEL_SPEED = 6 * FRAME_TIME_SCALE; // px/frame ascending — a little slower, reads as pulling something up

let backgroundBuf;
let stoneImgs = {};
let kelps = [];
let coralImgs = {};
let fishImgs = {};
let cloudImgs = {};
let heroFishImgs = {};
let caughtFishBufs = {};
let fishRecolored = { back: {}, mid: {}, front: {} };
let fishBack = [], fishMid = [], fishFront = [];
let cloudBack = [], cloudFront = [];
let heroFish = [];
let pendingRespawns = []; // [{ framesLeft }] — one entry per mature catch waiting to spawn a new juvenile
let reefBack = [], reefMid = [], reefFront = [];
let bodyImg, headImg, hand1Img, hand2Img, mouthImg, boatImg, rodImg, hookImg;
let blinkTimer = 90 / FRAME_TIME_SCALE, blinking = false, blinkT = 0;
let hookSwayPhase;

// Rig movement/fishing state — see updateRig() for the state machine.
let rigX = RIG_ANCHOR_X0;
let rigDir = 1; // 1 = facing/travelling right, -1 = facing/travelling left
let rigTargetX = RIG_ANCHOR_X0;
let rigState = 'moving'; // 'moving' | 'casting' | 'reeling'
let hookY = HOOK_REST_Y; // stateful — the descent can stop early on a catch, so this isn't a simple lerp between two fixed points
let caughtFish = null; // {name, h} — at most one fish per cast, still dangling on the way up

function preload() {
  bodyImg = loadImage('assets/body.png');
  headImg = loadImage('assets/head.png');
  hand1Img = loadImage('assets/hand1.png');
  hand2Img = loadImage('assets/hand2.png');
  mouthImg = loadImage('assets/mouth.png');
  boatImg = loadImage('assets/boat.png');
  rodImg = loadImage('assets/rod.png');
  hookImg = loadImage('assets/hook.png');
  Object.entries(CORAL_ASSET_FILES).forEach(([name, file]) => {
    coralImgs[name] = loadImage('assets/' + file);
  });
  Object.entries(STONE_DEFS).forEach(([layer, def]) => {
    stoneImgs[layer] = loadImage('assets/' + def.file);
  });
  Object.entries(FISH_ASSET_FILES).forEach(([name, file]) => {
    fishImgs[name] = loadImage('assets/' + file);
  });
  Object.entries(CLOUD_ASSET_FILES).forEach(([name, file]) => {
    cloudImgs[name] = loadImage('assets/' + file);
  });
  Object.entries(HERO_FISH_ASSET_FILES).forEach(([name, file]) => {
    heroFishImgs[name] = loadImage('assets/' + file);
  });
}

function setup() {
  // Canvas is drawn at 1920x1080 logical units either way, but rendering at
  // the screen's real device pixel ratio keeps that crisp instead of the
  // browser stretching a 1x bitmap to fill a bigger/HiDPI display. Capped at
  // 2x though — on a 3x+ display the raw ratio pushes the actual pixel count
  // (and therefore every image()/gradient draw call's cost) up so much it
  // was the main cause of a reported ~20fps average; 2x is still plenty
  // sharp for this kind of flat illustration.
  pixelDensity(Math.min(displayDensity(), 2));
  const canvas = createCanvas(CANVAS_W, CANVAS_H);
  canvas.parent('sketch-holder');
  frameRate(FRAME_RATE);
  noStroke();
  // Chrome/Edge default to imageSmoothingQuality 'low', which uses a cheap
  // filter for big downscales — the PNG assets here are exported much larger
  // than their on-canvas size, so 'low' visibly degraded them. 'high' uses a
  // proper Lanczos-class resampler.
  drawingContext.imageSmoothingQuality = 'high';
  // Kelp temporarily off — no PNG export exists yet for it, and leaving it
  // as the lone vector-drawn shape reads as an unfinished leftover next to
  // the PNG-based reef. Re-enable via `kelps = KELP_DEFS.map(makeTracedInstance);`
  // once a Kelp PNG is exported.
  kelps = [];
  backgroundBuf = buildBackground();
  buildReef();
  buildFishRecolors();
  fishBack = buildFishLayer('back', FISH_LAYER_DEFS.back);
  fishMid = buildFishLayer('mid', FISH_LAYER_DEFS.mid);
  fishFront = buildFishLayer('front', FISH_LAYER_DEFS.front);
  cloudBack = buildCloudLayer(CLOUD_LAYER_DEFS.back);
  cloudFront = buildCloudLayer(CLOUD_LAYER_DEFS.front);
  heroFish = buildHeroFish();
  buildCaughtFishBufs();
  hookSwayPhase = random(TWO_PI);
}

// Kept well below the horizon/sea-surface line — mid-to-lower water column,
// never near the top where a silhouette would read as breaking the surface.
function fishSwimBand() {
  const waterH = CANVAS_H - HORIZON_Y;
  return { top: HORIZON_Y + waterH * 0.22, bottom: HORIZON_Y + waterH * 0.85 };
}

// Recolors each of the 3 fish shapes into each of the 3 layer tones, once,
// up front — 9 small buffers total, reused by every fish instance in that
// layer rather than recoloring per-instance every frame.
function buildFishRecolors() {
  Object.keys(FISH_LAYER_DEFS).forEach(layerKey => {
    const def = FISH_LAYER_DEFS[layerKey];
    Object.keys(FISH_ASSET_FILES).forEach(name => {
      fishRecolored[layerKey][name] = recolorSilhouette(fishImgs[name], def.top, def.bottom);
    });
  });
}

// Uses the source PNG's own alpha as a mask ('source-in') and fills a
// vertical gradient behind it — tint()/multiply can't recolor a black
// source since multiplying by pure black (0,0,0) always stays black.
function recolorSilhouette(img, topHex, bottomHex) {
  const g = createGraphics(img.width, img.height);
  g.image(img, 0, 0);
  g.drawingContext.globalCompositeOperation = 'source-in';
  const grad = g.drawingContext.createLinearGradient(0, 0, 0, img.height);
  grad.addColorStop(0, topHex);
  grad.addColorStop(1, bottomHex);
  g.drawingContext.fillStyle = grad;
  g.drawingContext.fillRect(0, 0, img.width, img.height);
  return g;
}

// Shared by every small on-screen sprite built from a much bigger source PNG
// (ambient fish, clouds, the hero catchable fish below): drawing straight
// from a huge native-resolution source every frame forces the canvas to
// redo a big high-quality downscale on every instance, every frame — the
// same lag cause already solved for the reef corals (see
// REEF_SLICE_OVERSAMPLE above). Pre-scaling once, here at build time, means
// draw() just blits an already-small buffer every frame instead.
//
// createGraphics() also defaults to pixel density 1 regardless of the main
// canvas's own density (set via pixelDensity(displayDensity()) in setup,
// often 1.5-3x on real screens). Without matching it here, this buffer's
// actual raw pixels fall short of what the main canvas needs to fill the
// same CSS-pixel area, so it gets stretched past its native resolution at
// draw time and reads as pixelated — worse the smaller the buffer is.
function preScaleToDisplaySize(img, dispW, dispH) {
  const g = createGraphics(Math.max(1, Math.ceil(dispW)), Math.max(1, Math.ceil(dispH)));
  g.pixelDensity(pixelDensity());
  g.drawingContext.imageSmoothingQuality = 'high';
  g.image(img, 0, 0, g.width, g.height);
  return g;
}

function buildFishLayer(layerKey, def) {
  const band = fishSwimBand();
  const names = Object.keys(FISH_ASSET_FILES);
  const laneH = (band.bottom - band.top) / def.count;
  const fish = [];
  for (let i = 0; i < def.count; i++) {
    // one fish per lane (see the comment above FISH_LAYER_DEFS) — jitter
    // stays inside the lane's own slice so it can never drift onto a
    // neighboring lane's line
    const laneTop = band.top + i * laneH;
    const name = random(names);
    const nativeBuf = fishRecolored[layerKey][name];
    const h = random(def.sizeMin, def.sizeMax);
    const w = h * (nativeBuf.width / nativeBuf.height);
    fish.push({
      x: random(CANVAS_W),
      y: laneTop + laneH * random(0.2, 0.8),
      w, h,
      buf: preScaleToDisplaySize(nativeBuf, w, h),
      dir: random() < 0.5 ? 1 : -1,
      speedMul: random(0.85, 1.2),
      opacityMul: random(0.85, 1.15)
    });
  }
  return fish;
}

function updateFishLayer(layer, def) {
  const baseSpeed = 1.3 * def.speed * FRAME_TIME_SCALE;
  const margin = 140;
  layer.forEach(f => {
    f.x += f.dir * baseSpeed * f.speedMul;
    if (f.dir === 1 && f.x > CANVAS_W + margin) f.x = -margin;
    if (f.dir === -1 && f.x < -margin) f.x = CANVAS_W + margin;
  });
}

function drawFishInstance(f, def) {
  push();
  translate(f.x, f.y);
  // mirror horizontally only when swimming right-to-left — the art has an
  // asymmetric dorsal fin, so rotate(PI) would flip it upside-down too
  if (f.dir === -1) scale(-1, 1);
  imageMode(CENTER);
  // f.buf is already the recolored (non-black), pre-scaled buffer — tint()
  // here is only ever scaling alpha (255,255,255 leaves RGB unchanged),
  // which is the one thing tint() can safely do to a source that isn't
  // pure black.
  tint(255, 255, 255, 255 * def.opacity * f.opacityMul);
  image(f.buf, 0, 0, f.w, f.h);
  pop();
}

// As reefHealth drops (see the comment above its declaration), only a
// shrinking prefix of each ambient layer stays active — the rest just never
// gets updated or drawn again. Since reefHealth only ever decreases, a fish
// that drops out of the active range never needs to come back.
function drawFishLayer(layer, def) {
  const activeCount = Math.ceil(layer.length * reefHealth);
  const active = layer.slice(0, activeCount);
  updateFishLayer(active, def);
  active.forEach(f => drawFishInstance(f, def));
}

function buildCloudLayer(def) {
  const names = Object.keys(CLOUD_ASSET_FILES);
  const zoneW = CANVAS_W / CLOUD_ZONE_COUNT;
  const clouds = [];
  for (let i = 0; i < def.count; i++) {
    const img = cloudImgs[random(names)];
    const w = random(def.widthMin, def.widthMax);
    const h = w * (img.height / img.width);
    // bigger clouds need more headroom to keep their own bottom edge above
    // the character's head — bound is per-cloud, not a fixed constant
    const bottomBound = Math.max(CLOUD_SKY_TOP + 10, HEAD_IMG_DEF.y - CLOUD_HEAD_CLEARANCE - h / 2);
    const zoneIdx = Math.floor(random(CLOUD_ZONE_COUNT));
    const zoneLeft = zoneIdx * zoneW, zoneRight = zoneLeft + zoneW;
    clouds.push({
      x: random(zoneLeft + w / 2, zoneRight - w / 2),
      y: random(CLOUD_SKY_TOP, bottomBound),
      w, h,
      buf: preScaleToDisplaySize(img, w, h),
      dir: random() < 0.5 ? 1 : -1,
      speedMul: random(0.8, 1.2),
      zoneLeft, zoneRight
    });
  }
  return clouds;
}

function updateCloudLayer(layer, def) {
  const baseSpeed = 1.3 * def.speed * FRAME_TIME_SCALE;
  layer.forEach(c => {
    c.x += c.dir * baseSpeed * c.speedMul;
    const halfW = c.w / 2;
    if (c.x - halfW < c.zoneLeft) { c.x = c.zoneLeft + halfW; c.dir = 1; }
    else if (c.x + halfW > c.zoneRight) { c.x = c.zoneRight - halfW; c.dir = -1; }
  });
}

function drawCloudInstance(c, def) {
  push();
  translate(c.x, c.y);
  imageMode(CENTER);
  tint(255, 255, 255, 255 * def.opacity);
  image(c.buf, 0, 0, c.w, c.h);
  pop();
}

function drawCloudLayer(layer, def) {
  updateCloudLayer(layer, def);
  layer.forEach(c => drawCloudInstance(c, def));
}

// ---- hero catchable fish (Fish1/Fish2) — always swimming, independent of
// whatever the boat's rig is doing (see HERO_FISH_ASSET_FILES comment) ----

// spawnFromEdge=true (used for respawns, not the initial population) starts
// the fish just past whichever screen edge matches its own swim direction,
// so it visibly swims in rather than just appearing mid-lake.
function makeHeroFish(name, hMin, hMax, spawnFromEdge) {
  const img = heroFishImgs[name];
  const h = random(hMin, hMax);
  const w = h * (img.width / img.height);
  const dir = random() < 0.5 ? 1 : -1;
  const edgeMargin = w + HERO_FISH_EDGE_SPAWN_MARGIN;
  const x = spawnFromEdge ? (dir === 1 ? -edgeMargin : CANVAS_W + edgeMargin) : random(CANVAS_W);
  return {
    name, // needed at catch time — which sprite to show dangling on the hook
    x,
    y: random(HERO_FISH_BAND.top, HERO_FISH_BAND.bottom),
    w, h,
    buf: preScaleToDisplaySize(img, w, h),
    dir,
    speedMul: random(0.85, 1.2)
  };
}

function buildHeroFish() {
  const names = Object.keys(HERO_FISH_ASSET_FILES);
  const fish = [];
  for (let i = 0; i < HERO_FISH_COUNT; i++) {
    fish.push(makeHeroFish(random(names), HERO_FISH_SIZE_MIN, HERO_FISH_SIZE_MAX, false));
  }
  return fish;
}

// A mature fish that gets caught already had its chance to reproduce, so
// after its respawn delay elapses, a new juvenile (not a full-grown
// replacement) takes its place — offspring start small, and swim in from
// off-screen rather than popping into existence mid-lake.
function spawnJuvenileFish() {
  const names = Object.keys(HERO_FISH_ASSET_FILES);
  return makeHeroFish(random(names), HERO_FISH_SIZE_MIN, HERO_FISH_MATURE_THRESHOLD, true);
}

function updateFishSpawns() {
  for (let i = pendingRespawns.length - 1; i >= 0; i--) {
    if (--pendingRespawns[i].framesLeft <= 0) {
      pendingRespawns.splice(i, 1);
      heroFish.push(spawnJuvenileFish());
    }
  }
}

function updateHeroFish() {
  const baseSpeed = 1.3 * HERO_FISH_SPEED * FRAME_TIME_SCALE;
  const margin = 160;
  heroFish.forEach(f => {
    f.x += f.dir * baseSpeed * f.speedMul;
    if (f.dir === 1 && f.x > CANVAS_W + margin) f.x = -margin;
    if (f.dir === -1 && f.x < -margin) f.x = CANVAS_W + margin;
  });
}

function drawHeroFishInstance(f) {
  push();
  translate(f.x, f.y);
  // source art faces LEFT by default — mirror when swimming right (opposite
  // of the BackFish/cloud convention, which face right by default)
  if (f.dir === 1) scale(-1, 1);
  imageMode(CENTER);
  image(f.buf, 0, 0, f.w, f.h);
  pop();
}

function drawHeroFishLayer() {
  updateFishSpawns();
  updateHeroFish();
  heroFish.forEach(drawHeroFishInstance);
}

function buildCaughtFishBufs() {
  Object.keys(HERO_FISH_ASSET_FILES).forEach(name => {
    const img = heroFishImgs[name];
    const h = CAUGHT_FISH_SIZE;
    const w = h * (img.width / img.height);
    caughtFishBufs[name] = { buf: preScaleToDisplaySize(img, w, h), w, h };
  });
}

// Smaller caught fish cost more health than bigger ones — catching
// juveniles before they can reproduce is the specific overfishing practice
// SDG 14.4 calls out, so it should hit the ecosystem harder here too.
function applyCatchHealthPenalty(caughtH) {
  const smallness = constrain(map(caughtH, HERO_FISH_SIZE_MIN, HERO_FISH_SIZE_MAX, 1, 0), 0, 1);
  const penalty = lerp(REEF_HEALTH_PENALTY_LARGE, REEF_HEALTH_PENALTY_SMALL, smallness);
  reefHealth = constrain(reefHealth - penalty, 0, 1);
}

// Picks one hand-built preset per rock layer into reefBack/reefMid/reefFront
// so draw() can slot each one in right before its own layer is painted on
// top of it (see draw() below for why).
function buildReef() {
  // 3rd/back layer sways noticeably stronger and faster than mid/front —
  // it reads as thinner, more delicate growth further from the character,
  // more sensitive to the current.
  reefBack = buildReefLayer(REEF_PRESETS['3rd'], { ampBoost: 1.8, speedBoost: 1.6 });
  reefMid = buildReefLayer(REEF_PRESETS['2nd']);
  reefFront = buildReefLayer(REEF_PRESETS['1st']);
}

function buildReefLayer(presets, opts = {}) {
  const ampBoost = opts.ampBoost || 1;
  const speedBoost = opts.speedBoost || 1;
  const preset = random(presets);
  return preset.map(def => {
    const img = coralImgs[def.name];
    // def.w/def.h come from that specific placement's own Figma
    // renderBounds, which isn't always the same aspect ratio as the
    // exported PNG (different placements were sometimes scaled slightly
    // non-uniformly in Figma) — forcing both independently stretched the
    // image. Height stays authoritative (it drives the "half exposed above
    // the rock line" placement); width is derived from the PNG's own real
    // aspect ratio so nothing gets squished. The base/root position keeps
    // the original full-size def.y + def.h anchor (where it was designed to
    // sit against the rock line) — only the rendered bulk shrinks by
    // REEF_SCALE, not where it's rooted.
    const h = def.h * REEF_SCALE;
    const w = h * (img.width / img.height);
    const centerX = def.x + def.w / 2;
    // Fish Bone is a rigid skeleton, not a living organism — it shouldn't
    // sway like the corals around it.
    const noSway = def.name === 'Fish Bone';
    return {
      buf: scaleToDisplaySize(img, w, h),
      baseX: centerX - w / 2, baseY: def.y + def.h, w, h,
      speedMul: random(0.7, 1.3) * speedBoost,
      ampMul: noSway ? 0 : random(0.75, 1.3) * ampBoost,
      stiffExp: random(1.2, 2.2),
      phase: random(TWO_PI),
      flutter: !noSway && random() > 0.3
    };
  });
}

// The strip-sway animation slices this buffer into REEF_STRIPS horizontal
// bands every frame. Pre-scaling all the way down to the final on-canvas
// size (as an earlier version did) left each strip only a couple of source
// pixels tall once sliced 30 ways, which read as blocky/pixelated once the
// PNGs carried real detailed artwork instead of a flat recolor. Oversampling
// the buffer here — capped at the source's own native resolution, no point
// upscaling past real detail — keeps each strip's source slice thick enough
// to resample cleanly, while still being far smaller than re-resampling the
// full native image on every strip, every frame (the original lag cause).
const REEF_SLICE_OVERSAMPLE = 3;

function scaleToDisplaySize(img, dispW, dispH) {
  const bufH = Math.min(Math.ceil(dispH * REEF_SLICE_OVERSAMPLE), img.height);
  const bufW = Math.round(bufH * (dispW / dispH));
  const small = createGraphics(bufW, bufH);
  small.drawingContext.imageSmoothingQuality = 'high';
  small.image(img, 0, 0, bufW, bufH);
  return small;
}

// Bends a recolored reef buffer into horizontal strips, base-anchored, each
// offset by a per-instance sine sway — same rooted/free-tip motion the
// vector-traced kelp uses (drawSwayLoop), just for a raster source instead.
function drawReefInstance(inst) {
  const stripH = inst.buf.height / REEF_STRIPS;
  const dispStripH = inst.h / REEF_STRIPS + 0.6; // slight overlap avoids seam lines
  // as reefHealth drops the whole reef should read as more sluggish/lifeless
  const vitality = lerp(REEF_HEALTH_VITALITY_FLOOR, 1, reefHealth);
  const effSpeed = REEF_SWAY_SPEED * inst.speedMul * vitality * FRAME_TIME_SCALE;

  // Each strip is already a modest scale from an oversampled source (see
  // REEF_SLICE_OVERSAMPLE) — measured directly, paying 'high' (Lanczos)
  // resampling on every one of up to ~400 tiny strip draws a frame (multiple
  // instances x REEF_STRIPS, several times over across 3 layers) was
  // consistently 2-2.5x more expensive than the rest of the entire scene
  // combined, for a difference not worth it at this small a scale.
  // Restored to 'high' for everything else after the loop.
  drawingContext.imageSmoothingQuality = 'medium';

  for (let i = 0; i < REEF_STRIPS; i++) {
    const t = i / (REEF_STRIPS - 1); // 0 = base, 1 = tip
    const falloff = Math.pow(t, inst.stiffExp);
    const primary = sin(frameCount * effSpeed + t * 1.6 + inst.phase) * REEF_SWAY_AMP * inst.ampMul * falloff;
    const flutter = inst.flutter
      ? sin(frameCount * effSpeed * 2.3 + t * 4.2 + inst.phase) * REEF_SWAY_AMP * inst.ampMul * 0.15 * falloff
      : 0;
    const sway = primary + flutter;

    const srcYFromBottom = inst.buf.height - (i + 1) * stripH;
    const dy = inst.baseY - (i + 1) * dispStripH;

    image(
      inst.buf,
      inst.baseX + sway, dy, inst.w, dispStripH,
      0, srcYFromBottom, inst.buf.width, stripH
    );
  }

  drawingContext.imageSmoothingQuality = 'high';
}

// Each layer's reef corals draw BEFORE that layer's rock — the rock then
// paints over their base/roots, leaving only the upper body visible above
// its own contour line, and every later (nearer) layer naturally re-occludes
// whatever pokes into its own silhouette too.
function draw() {
  image(backgroundBuf, 0, 0, CANVAS_W, CANVAS_H);
  drawCloudLayer(cloudBack, CLOUD_LAYER_DEFS.back);
  drawCloudLayer(cloudFront, CLOUD_LAYER_DEFS.front);
  drawFishLayer(fishBack, FISH_LAYER_DEFS.back);
  reefBack.forEach(drawReefInstance);
  drawStone('3rd');
  drawFishLayer(fishMid, FISH_LAYER_DEFS.mid);
  reefMid.forEach(drawReefInstance);
  drawStone('2nd');
  drawFishLayer(fishFront, FISH_LAYER_DEFS.front);
  reefFront.forEach(drawReefInstance);
  drawStone('1st');
  kelps.forEach(drawTracedShape);
  drawHeroFishLayer();
  updateRig();
  drawRig();
}

function drawImgDef(img, def) {
  image(img, def.x, def.y, def.w, def.h);
}

function fillGradientRect(ctx, x, y, w, h, hexTop, hexBottom) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, hexTop);
  g.addColorStop(1, hexBottom);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

// The sky/water gradient never changes frame to frame, so it's rendered
// once here into an offscreen buffer instead of recreating 2 canvas
// gradients and refilling the whole canvas every single frame — this and
// the pixelDensity cap in setup() were the two biggest wins for a reported
// ~20fps average.
function buildBackground() {
  const buf = createGraphics(CANVAS_W, CANVAS_H);
  buf.pixelDensity(pixelDensity());
  fillGradientRect(buf.drawingContext, 0, 0, CANVAS_W, HORIZON_Y, PALETTE.blackPearl[0], PALETTE.blackPearl[2]);
  fillGradientRect(buf.drawingContext, 0, HORIZON_Y, CANVAS_W, CANVAS_H - HORIZON_Y, PALETTE.oceanBlue[2], PALETTE.oceanBlue[3]);
  return buf;
}

// Real static art (see STONE_DEFS) — width always matches CANVAS_W exactly,
// only the height/y-offset differs per layer.
function drawStone(layer) {
  const def = STONE_DEFS[layer];
  const img = stoneImgs[layer];
  image(img, 0, def.y, CANVAS_W, img.height);
}

// Splits raw SVG path data into closed loops and keeps only each command's
// end point (bezier handles are dropped) — plenty of resolution once traced
// at this point density, and cheap to animate per vertex every frame.
function splitSubpaths(d) {
  return d.match(/M[^Z]*Z/g) || [d];
}

function parseSubpath(d) {
  const cmds = d.match(/[MLHVC][^MLHVCZ]*/g) || [];
  let cx = 0, cy = 0;
  return cmds.map(c => {
    const cmd = c[0];
    const nums = c.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if (cmd === 'H') cx = nums[0];
    else if (cmd === 'V') cy = nums[0];
    else { cx = nums[nums.length - 2]; cy = nums[nums.length - 1]; }
    return { x: cx, y: cy };
  });
}

function parseShape(rawPaths) {
  const subpaths = [];
  rawPaths.forEach(d => splitSubpaths(d).forEach(sp => subpaths.push(parseSubpath(sp))));
  return subpaths;
}

function makeTracedInstance(def) {
  const sway = def.sway !== false;
  return {
    subpaths: parseShape(def.paths),
    x: def.x, y: def.y, w: def.w, h: def.h, rot: def.rot,
    topHex: def.top, bottomHex: def.bottom, fillRule: def.fillRule || 'nonzero',
    speed: random(0.02, 0.035), amp: sway ? constrain(def.h * 0.03, 1.5, 6) : 0, phase: random(TWO_PI)
  };
}

function drawTracedShape(inst) {
  drawingContext.save();
  drawingContext.translate(inst.x, inst.y);
  if (inst.rot) drawingContext.rotate(inst.rot);
  const g = drawingContext.createLinearGradient(0, 0, 0, inst.h);
  g.addColorStop(0, inst.topHex);
  g.addColorStop(1, inst.bottomHex);
  drawingContext.fillStyle = g;
  inst.subpaths.forEach(sp => drawSwayLoop(sp, inst));
  drawingContext.restore();
}

// Rooted at the base (large local y = seafloor) and free at the tip (small
// local y) — the sway falloff makes each shape read as anchored, not floating.
function drawSwayLoop(points, inst) {
  drawingContext.beginPath();
  points.forEach((p, i) => {
    const falloff = 1 - constrain(p.y / inst.h, 0, 1);
    const sway = sin(frameCount * inst.speed * FRAME_TIME_SCALE + i * 0.35 + inst.phase) * inst.amp * falloff;
    if (i === 0) drawingContext.moveTo(p.x + sway, p.y);
    else drawingContext.lineTo(p.x + sway, p.y);
  });
  drawingContext.closePath();
  drawingContext.fill(inst.fillRule);
}

function drawGradientEllipse(cx, cy, w, h, topHex, bottomHex) {
  const g = drawingContext.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
  g.addColorStop(0, topHex);
  g.addColorStop(1, bottomHex);
  drawingContext.fillStyle = g;
  drawingContext.beginPath();
  drawingContext.ellipse(cx, cy, w / 2, h / 2, 0, 0, TWO_PI);
  drawingContext.fill();
}

// Idle blink: closed eyelids read as height 0, so scaling the eye's vertical
// radius down to (almost) nothing and back is enough to sell a real blink —
// no separate eyelid asset needed.
function updateBlink() {
  if (blinking) {
    blinkT += (1 / 8) * FRAME_TIME_SCALE;
    if (blinkT >= 1) { blinking = false; blinkT = 0; blinkTimer = Math.floor(random(90, 260) / FRAME_TIME_SCALE); }
  } else if (--blinkTimer <= 0) {
    blinking = true;
    blinkT = 0;
  }
}

function eyeOpenness() {
  if (!blinking) return 1;
  return blinkT < 0.5 ? 1 - 2 * blinkT : 2 * (blinkT - 0.5);
}

function drawEye(e, openness) {
  const h = Math.max(e.r * 2 * openness, 1.5);
  drawGradientEllipse(e.x + e.r, e.y + e.r, e.r * 2, h, PALETTE.springGreen[3], PALETTE.pastelBerry[3]);
  if (openness > 0.15) {
    const ph = Math.max(e.pupilR * 2 * openness, 1);
    drawGradientEllipse(e.x + e.r, e.y + e.r, e.pupilR * 2, ph, PALETTE.blackPearl[0], PALETTE.blackPearl[1]);
  }
}

// The line is real geometry (not a traced shape), so the hook end can move
// independently of the rest of the rig and the line just follows — exactly
// what the cast/wait/reel cycle below needs. Takes/returns local (rig-space)
// coordinates since it's always called from inside drawRig()'s transform.
// Returns the hook's current local x so the caller can draw the hook image
// at the same spot.
function drawFishingLine() {
  const hookX = hookLocalX();
  const endX = hookX + HOOK_IMG_DEF.w / 2;
  const endY = hookY + 3;
  drawingContext.save();
  drawingContext.strokeStyle = PALETTE.blackPearl[2];
  drawingContext.lineWidth = 1.5;
  drawingContext.beginPath();
  drawingContext.moveTo(localX(LINE_ANCHOR.x), LINE_ANCHOR.y);
  drawingContext.lineTo(endX, endY);
  drawingContext.stroke();
  drawingContext.restore();
  return hookX;
}

// ---- boat/character rig: movement, flip, and the cast/wait/reel fishing
// cycle (see the comment above RIG_ANCHOR_X0 near the top of the file) ----

function localX(x) { return x - RIG_ANCHOR_X0; }
function localDef(def) { return { ...def, x: def.x - RIG_ANCHOR_X0 }; }

// The hook's local x (its own idle sway, same formula drawFishingLine used
// to compute directly) and its world x — accounting for the rig's own
// translate(rigX,0) + possible scale(-1,1) flip — since the catch-proximity
// check in updateRig() needs to compare against heroFish positions, which
// live in world space, not the rig's local space.
function hookLocalX() {
  const sway = sin(frameCount * 0.02 * FRAME_TIME_SCALE + hookSwayPhase) * 4;
  return localX(HOOK_IMG_DEF.x) + sway;
}
function hookWorldX() {
  return rigX + rigDir * hookLocalX();
}

function rigRangeFor(dir) {
  return dir === 1
    ? { min: RIG_BACK_EXTENT, max: CANVAS_W - RIG_FRONT_EXTENT }
    : { min: RIG_FRONT_EXTENT, max: CANVAS_W - RIG_BACK_EXTENT };
}

// Picks a new spot to sail to. dir is decided first, then the target is
// constrained to (a) keep the rig's whole bounding box on-screen for that
// facing direction and (b) actually lie on that side of the current
// position — otherwise the boat would end up moving one way while flipped
// to visually face the other. If there's no room left in the rolled
// direction (already at that side's extreme), it just turns around instead.
function pickRigTarget() {
  let dir = random() < 0.5 ? 1 : -1;
  let range = rigRangeFor(dir);
  let lo = dir === 1 ? Math.max(range.min, rigX) : range.min;
  let hi = dir === 1 ? range.max : Math.min(range.max, rigX);
  if (lo >= hi) {
    dir *= -1;
    range = rigRangeFor(dir);
    lo = dir === 1 ? Math.max(range.min, rigX) : range.min;
    hi = dir === 1 ? range.max : Math.min(range.max, rigX);
  }
  rigTargetX = random(lo, hi);
  rigDir = dir;
}

// Checks every live fish against the hook's current world position and
// grabs the first one within CATCH_RADIUS — at most one catch per cast, so
// once caughtFish is set this is a no-op for the rest of the trip (called
// again on the way up in case nothing bit on the way down).
function tryCatchAtHook() {
  if (caughtFish) return;
  const hx = hookWorldX(), hy = hookY;
  for (let i = 0; i < heroFish.length; i++) {
    const fish = heroFish[i];
    if (dist(fish.x, fish.y, hx, hy) >= CATCH_RADIUS) continue;
    heroFish.splice(i, 1);
    caughtFish = { name: fish.name, h: fish.h };
    applyCatchHealthPenalty(fish.h);
    // mature fish already had its chance to reproduce — a juvenile
    // replacement grows in after a delay. A juvenile catch is permanent.
    if (fish.h >= HERO_FISH_MATURE_THRESHOLD) {
      pendingRespawns.push({ framesLeft: Math.floor(random(HERO_FISH_RESPAWN_FRAMES_MIN, HERO_FISH_RESPAWN_FRAMES_MAX)) });
    }
    return;
  }
}

function updateRig() {
  if (rigState === 'moving') {
    const delta = rigTargetX - rigX;
    if (Math.abs(delta) <= RIG_MOVE_SPEED) {
      rigX = rigTargetX;
      rigState = 'casting';
      hookY = HOOK_REST_Y;
      caughtFish = null;
    } else {
      rigX += Math.sign(delta) * RIG_MOVE_SPEED;
    }
  } else if (rigState === 'casting') {
    hookY = Math.min(hookY + HOOK_CAST_SPEED, HOOK_MAX_DEPTH_Y);
    tryCatchAtHook();
    if (caughtFish || hookY >= HOOK_MAX_DEPTH_Y) {
      rigState = 'reeling';
    }
  } else if (rigState === 'reeling') {
    hookY = Math.max(hookY - HOOK_REEL_SPEED, HOOK_REST_Y);
    tryCatchAtHook();
    if (hookY <= HOOK_REST_Y) {
      rigState = 'moving';
      caughtFish = null;
      pickRigTarget();
    }
  }
}

// A little struggling wiggle while it dangles up on the line — purely
// decorative, the sprite's own resting orientation is fine for this. Drawn
// at the actual caught fish's own height so a tiny juvenile visibly looks
// tiny on the hook and a bigger one looks bigger — CAUGHT_FISH_SIZE (the
// pre-scaled buffer's own resolution) is set to the largest realistic
// catch so this only ever scales down, never up.
function drawCaughtFish(x, y) {
  const cf = caughtFishBufs[caughtFish.name];
  const dispH = caughtFish.h;
  const dispW = dispH * (cf.w / cf.h);
  push();
  translate(x, y);
  rotate(sin(frameCount * 0.6 * FRAME_TIME_SCALE) * 0.18);
  imageMode(CENTER);
  image(cf.buf, 0, 0, dispW, dispH);
  pop();
}

function drawRig() {
  push();
  translate(rigX, 0);
  if (rigDir === -1) scale(-1, 1);
  const hookX = drawFishingLine();
  drawImgDef(rodImg, localDef(ROD_IMG_DEF));
  drawImgDef(hookImg, { x: hookX, y: hookY, w: HOOK_IMG_DEF.w, h: HOOK_IMG_DEF.h });
  if (caughtFish) {
    drawCaughtFish(hookX + HOOK_IMG_DEF.w / 2, hookY + HOOK_IMG_DEF.h + 15);
  }
  drawImgDef(bodyImg, localDef(BODY_IMG_DEF));
  drawImgDef(headImg, localDef(HEAD_IMG_DEF));
  drawImgDef(hand1Img, { x: localX(HAND_DEFS[0].x), y: HAND_DEFS[0].y, w: HAND_DEFS[0].d, h: HAND_DEFS[0].d });
  drawImgDef(hand2Img, { x: localX(HAND_DEFS[1].x), y: HAND_DEFS[1].y, w: HAND_DEFS[1].d, h: HAND_DEFS[1].d });
  updateBlink();
  const openness = eyeOpenness();
  EYE_DEFS.forEach(e => drawEye(localDef(e), openness));
  drawImgDef(mouthImg, localDef(MOUTH_IMG_DEF));
  drawImgDef(boatImg, localDef(BOAT_IMG_DEF));
  pop();
}
