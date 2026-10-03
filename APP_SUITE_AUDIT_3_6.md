<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#111923"/><stop offset=".58" stop-color="#20242a"/><stop offset="1" stop-color="#f37b32"/></linearGradient>
    <linearGradient id="far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4a2e"/><stop offset="1" stop-color="#242628"/></linearGradient>
    <linearGradient id="near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#313437"/><stop offset="1" stop-color="#080b0d"/></linearGradient>
    <radialGradient id="sun"><stop offset="0" stop-color="#ffc18a" stop-opacity=".9"/><stop offset=".25" stop-color="#ff913f" stop-opacity=".5"/><stop offset="1" stop-color="#ff6d1e" stop-opacity="0"/></radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="32"/></filter>
  </defs>
  <rect width="1200" height="700" fill="url(#sky)"/>
  <circle cx="965" cy="270" r="170" fill="url(#sun)" filter="url(#blur)"/>
  <path d="M0 520 L185 350 L290 430 L420 265 L540 400 L710 210 L850 360 L980 235 L1200 455 L1200 700 L0 700 Z" fill="url(#far)" opacity=".92"/>
  <path d="M0 600 L170 465 L300 540 L450 410 L610 585 L780 405 L930 550 L1080 430 L1200 520 L1200 700 L0 700 Z" fill="url(#near)"/>
  <path d="M0 645 C240 575 400 650 575 608 S900 570 1200 625 L1200 700 L0 700Z" fill="#050708"/>
  <g fill="#d0753b" opacity=".25"><circle cx="755" cy="357" r="2"/><circle cx="818" cy="330" r="2"/><circle cx="885" cy="320" r="1.8"/><circle cx="930" cy="303" r="2.2"/></g>
</svg>
