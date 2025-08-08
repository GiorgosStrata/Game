// weapons.js
// Weapon definitions and embedded SVG data URLs for visuals.
// Each weapon has base stats: range, speed, dmg, sprite (svg data URL), and drawOffset.

const WeaponTypes = {
  Spear: { range: 260, speed: 1.02, dmg: 18, sprite: makeSpearSVG('#ffd166'), tipOffset: 42 },
  Dagger: { range: 80, speed: 1.7, dmg: 12, sprite: makeDaggerSVG('#ef476f'), tipOffset: 28 },
  Sword: { range: 150, speed: 1.15, dmg: 16, sprite: makeSwordSVG('#06d6a0'), tipOffset: 36 },
  Axe:   { range: 120, speed: 0.9, dmg: 22, sprite: makeAxeSVG('#ff8fab'), tipOffset: 34 }
};

// simple helper to convert raw SVG to data URL safely
function svgToDataURL(svgString){
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
}

/* ---- SVG factories ----
   Keep the icons simple and stylized. Using inline SVG means no extra asset files.
*/
function makeSpearSVG(color){
  return svgToDataURL(`
    <svg xmlns='http://www.w3.org/2000/svg' width='220' height='60' viewBox='0 0 220 60'>
      <rect x='0' y='28' width='200' height='6' rx='3' fill='#3b3b3b'/>
      <polygon points='200,8 220,30 200,52' fill='${color}'/>
    </svg>`);
}
function makeDaggerSVG(color){
  return svgToDataURL(`
    <svg xmlns='http://www.w3.org/2000/svg' width='140' height='60' viewBox='0 0 140 60'>
      <rect x='0' y='26' width='110' height='8' rx='4' fill='#2b2b2b'/>
      <polygon points='110,30 130,18 130,42' fill='${color}'/>
    </svg>`);
}
function makeSwordSVG(color){
  return svgToDataURL(`
    <svg xmlns='http://www.w3.org/2000/svg' width='180' height='72' viewBox='0 0 180 72'>
      <rect x='6' y='34' width='110' height='10' rx='4' fill='#2e2e2e'/>
      <rect x='116' y='26' width='12' height='28' rx='4' fill='${color}'/>
      <rect x='0' y='50' width='60' height='8' rx='4' fill='#3b3b3b' transform='rotate(-25 30 54)'/>
    </svg>`);
}
function makeAxeSVG(color){
  return svgToDataURL(`
    <svg xmlns='http://www.w3.org/2000/svg' width='150' height='72' viewBox='0 0 150 72'>
      <rect x='0' y='34' width='86' height='8' rx='4' fill='#2e2e2e'/>
      <path d='M86 10 C120 8 130 36 86 52 Z' fill='${color}'/>
    </svg>`);
}
