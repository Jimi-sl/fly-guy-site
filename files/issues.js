// The Fly Guy Files: every issue and when each part goes live.
//
// To publish a part:
//   1. Export its panels as 1080x1350 images (4:5) and put them in files/issues/<issue>/
//      named p<part>-<panel>.<ext>, e.g. files/issues/1/p1-1.jpg, p1-2.jpg, ... p2-1.jpg
//   2. Set that part's `panels` to how many panels it has.
//   3. It appears on its `release` date and time (West Africa Time). Uploading early is fine.
// Optional: files/issues/<issue>/cover.<ext> for the cover, and audio/theme.mp3 (site root) for the theme music.
window.FLYGUY_ISSUES = [
  {
    n: 1, title: 'Sold Out', teaser: 'The sky has price tags now.', ext: 'jpg',
    parts: [
      { release: '2026-10-05T07:00:00+01:00', panels: 0 },
      { release: '2026-10-07T07:00:00+01:00', panels: 0 },
      { release: '2026-10-09T07:00:00+01:00', panels: 0 },
    ],
  },
  {
    n: 2, title: 'No Fly Zone', teaser: 'Step one: don\'t.', ext: 'jpg',
    parts: [
      { release: '2026-10-12T07:00:00+01:00', panels: 0 },
      { release: '2026-10-14T07:00:00+01:00', panels: 0 },
      { release: '2026-10-16T07:00:00+01:00', panels: 0 },
    ],
  },
  {
    n: 3, title: 'Property Damage', teaser: '500 SKYCOIN. Worth it.', ext: 'jpg',
    parts: [
      { release: '2026-10-19T07:00:00+01:00', panels: 0 },
      { release: '2026-10-21T07:00:00+01:00', panels: 0 },
      { release: '2026-10-23T07:00:00+01:00', panels: 0 },
    ],
  },
  {
    n: 4, title: 'Repo', teaser: 'FINAL NOTICE.', ext: 'jpg',
    parts: [
      { release: '2026-10-26T07:00:00+01:00', panels: 0 },
      { release: '2026-10-28T07:00:00+01:00', panels: 0 },
      { release: '2026-10-30T07:00:00+01:00', panels: 0 },
    ],
  },
  {
    n: 5, title: 'Coin Operated', teaser: 'Built overnight. Of course.', ext: 'jpg',
    parts: [
      { release: '2026-11-02T07:00:00+01:00', panels: 0 },
      { release: '2026-11-04T07:00:00+01:00', panels: 0 },
      { release: '2026-11-06T07:00:00+01:00', panels: 0 },
    ],
  },
  {
    n: 6, title: 'The First Flyer', teaser: '40 years ago...', ext: 'jpg',
    parts: [
      { release: '2026-11-09T07:00:00+01:00', panels: 0 },
      { release: '2026-11-11T07:00:00+01:00', panels: 0 },
      { release: '2026-11-13T07:00:00+01:00', panels: 0 },
    ],
  },
  {
    n: 7, title: 'Rent Is Due', teaser: 'Per clause 7(b)...', ext: 'jpg',
    parts: [
      { release: '2026-11-16T07:00:00+01:00', panels: 0 },
      { release: '2026-11-18T07:00:00+01:00', panels: 0 },
      { release: '2026-11-20T07:00:00+01:00', panels: 0 },
    ],
  },
  {
    n: 8, title: 'Nobody Fences the Sky', teaser: 'The season finale.', ext: 'jpg',
    parts: [
      { release: '2026-11-23T07:00:00+01:00', panels: 0 },
      { release: '2026-11-25T07:00:00+01:00', panels: 0 },
      { release: '2026-11-27T07:00:00+01:00', panels: 0 },
    ],
  },
];

// A part is live once its release time has passed and its panels are uploaded.
window.flyGuyPartLive = function (part, now) {
  return part.panels > 0 && (now || new Date()) >= new Date(part.release);
};

window.flyGuyFormatDay = function (iso) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Lagos' });
};
