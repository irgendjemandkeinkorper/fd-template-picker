// The test site has no scheduled showings, so its Now Playing sections render
// the "Nothing Scheduled" empty state. During capture the two showtimes GraphQL
// queries are answered from this fixture instead, so the screenshots show a
// real programme. Posters are generated SVGs served under a fake imgix id.
//
// Field lists mirror the consumer app's `showingsForDate` query (recorded
// 2026-10-20); unknown fields are left null/false so the component ignores them.

export const POSTER_PREFIX = 'picker-poster-';
// The consumer app renders showtimes in the circuit's zone, which is Pacific
// for the test circuit. The capturing browser context must use the same zone.
export const TIME_ZONE = 'America/Los_Angeles';

// Showtimes are minute offsets from a base that is always a little after the
// capture time, so nothing renders as already started.
export const FILMS = [
  { id: '900001', name: 'Harbor Lights', rating: 'PG-13', duration: 118, genre: 'Drama', hue: 205, offsets: [0, 165, 330, 495], badges: ['1332'] },
  { id: '900002', name: 'The Last Projectionist', rating: 'NR', duration: 94, genre: 'Documentary', hue: 28, offsets: [30, 300], badges: [] },
  { id: '900003', name: 'Midnight at the Rialto', rating: 'R', duration: 102, genre: 'Comedy', hue: 340, offsets: [105, 375, 510], badges: ['1334'] },
  { id: '900004', name: 'Paper Moons', rating: 'PG', duration: 88, genre: 'Animation', hue: 150, offsets: [15, 180, 345], badges: [] },
  { id: '900005', name: 'Cold Open', rating: 'R', duration: 126, genre: 'Thriller', hue: 260, offsets: [150, 420], badges: ['1332'] },
];

const pad = (n) => String(n).padStart(2, '0');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Local wall-clock parts for a Date in the given IANA zone.
function parts(date, timeZone) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZoneName: 'longOffset' });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  const offset = p.timeZoneName === 'GMT' ? '+00:00' : p.timeZoneName.replace('GMT', '');
  return { ymd: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute), offset };
}

function movie(film, siteId) {
  return {
    id: film.id,
    name: film.name,
    abbreviation: film.name.replace(/[^A-Z]/g, '').slice(0, 4) || film.name.slice(0, 4).toUpperCase(),
    showingStatus: 'Now Playing',
    displayMetaData: JSON.stringify({ magicSortValue: 0, daysShown: 3, nowPlayingOrHasPlayed: true, someShowingsBadges: film.badges, everyShowingsBadges: film.badges, leavesSoon: false, lastDayTomorrow: false, lastDayToday: false, classes: 'showing-status-now-playing' }),
    urlSlug: slug(film.name),
    posterImage: `${POSTER_PREFIX}${film.id}`,
    signageDisplayPoster: false,
    bannerImage: null,
    signageDisplayBanner: false,
    animatedPosterVideo: null,
    signageDisplayAnimatedPoster: false,
    signageMessageOverride: null,
    color: `hsl(${film.hue} 40% 30%)`,
    synopsis: `<div>${film.name} is sample programming generated for the template picker.</div>`,
    starring: '',
    writers: '',
    directedBy: '',
    producedBy: '',
    searchTerms: '',
    duration: film.duration,
    genre: film.genre,
    allGenres: film.genre,
    countryOfOrigin: 'US',
    originalLanguage: 'en',
    rating: film.rating,
    ratingReason: null,
    trailerYoutubeId: null,
    trailerVideo: null,
    signageDisplayTrailer: false,
    releaseDate: null,
    dateOfFirstShowing: null,
    overrideDateOfFirstShowing: false,
    hideDateOfFirstShowing: true,
    boxOfficeWeekStartDay: 5,
    boxOfficeWeekExtendPremieres: true,
    embargoShowingLiftedAt: null,
    embargoPurchaseLiftedAt: null,
    allowPrivateSalesOnExternal: false,
    isMarathon: false,
    predictedWeekOneTicketSales: null,
    tmdbPopularityScore: null,
    tmdbId: null,
    includeInComingSoon: false,
    includeInFuture: false,
    overridePriceCard: false,
    overridePostStartTimeBufferMinutes: false,
    customPostStartTimeBufferMinutes: 10,
    sendRentrak: false,
    rentrakName: null,
    libraryChildrenShowingCount: 0,
    showingCount: film.offsets.length,
    allowPastSales: false,
    dcmEdiMovieId: null,
    dcmEdiMovieName: null,
    disableOnlineConcessions: false,
    overrideMaxTicketsPerOrderPerShowing: false,
    maxTicketsPerOrderPerShowing: 10,
    displayOrder: null,
    displayOrderNext: null,
    taxExempt: false,
    rottenTomatoesOverwrite: false,
    showRottenTomatoesRating: false,
    siteId,
    titleClassId: '188',
    customPriceCardId: null,
    criticScore: null,
    criticRating: null,
    audienceScore: null,
    audienceRating: null,
    __typename: 'Movie',
  };
}

function showing(film, index, time, { screenId, seatCount }) {
  const id = `${film.id}${pad(index)}`;
  const sold = 12 + ((index * 37 + film.offsets.length * 11) % 60);
  return {
    id,
    time,
    showingId: id,
    isMarathon: false,
    hasMarathon: false,
    allowSalesInMarathon: false,
    overrideSeatChart: false,
    hasSeatChart: false,
    overridePriceCard: false,
    overridePostStartTimeBufferMinutes: false,
    customPostStartTimeBufferMinutes: 10,
    published: true,
    ticketsSold: sold,
    marathonTicketsSold: 0,
    ticketsPaid: sold,
    current: false,
    past: false,
    overrideReservedSeating: false,
    overrideReservedSeatingValue: false,
    customHeldSeatCount: 0,
    overrideHeldSeatCount: false,
    customMarathonSeatCount: 0,
    overrideMarathonSeatCount: false,
    overrideShowingBadges: false,
    allowWithoutMembership: true,
    disableTheaterSeatDelivery: false,
    qrItemOrderingOnly: false,
    allowConsumerRefunds: false,
    allowConsumerQrTabWithoutPaymentMethod: false,
    allowItemOrdersOnline: false,
    private: false,
    isPreview: false,
    displayMetaData: JSON.stringify({ classes: '', badges: film.badges }),
    overrideMaxTicketsPerOrderPerShowing: false,
    maxTicketsPerOrderPerShowing: 10,
    screenId,
    originalScreenId: screenId,
    priceCardId: null,
    customPriceCardId: null,
    seatsRemaining: seatCount - sold,
    seatsRemainingWithoutSocialDistancing: seatCount - sold,
    __typename: 'Showing',
  };
}

// A flat list with one entry per showing; the component groups them by film.
export function showingsForDate(ymd, { now = new Date(), timeZone = TIME_ZONE, siteId = '170', screenId = '828', seatCount = 120 } = {}) {
  const local = parts(now, timeZone);
  const today = local.ymd === ymd;
  // Base: 45 minutes after capture time, rounded up to the quarter hour, never before noon.
  let base = today ? Math.max(12 * 60, Math.ceil((local.hour * 60 + local.minute + 45) / 15) * 15) : 12 * 60;
  return FILMS.flatMap((film) => {
    const m = movie(film, siteId);
    return film.offsets.map((offset, i) => {
      const minutes = base + offset;
      const time = `${ymd}T${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}:00.000${local.offset}`;
      const s = showing(film, i, time, { screenId, seatCount });
      return { ...s, movie: m, showing: { ...s, movie: m }, showings: [], showingBadgeIds: film.badges, predictedAttendance: null };
    });
  });
}

export function datesWithShowing(ymd, days = 7) {
  const [y, mo, d] = ymd.split('-').map(Number);
  return Array.from({ length: days }, (_, i) => {
    const t = new Date(Date.UTC(y, mo - 1, d + i));
    return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
  });
}

// A 2:3 poster: flat colour field, title in a serif, small caption.
export function posterSvg(film) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const words = film.name.split(' ');
  const lines = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && (last + ' ' + w).length <= 12) lines[lines.length - 1] = last + ' ' + w;
    else lines.push(w);
  }
  const text = lines.map((l, i) => `<tspan x="60" dy="${i ? 1.05 : 0}em">${esc(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${film.hue} 45% 38%)"/><stop offset="1" stop-color="hsl(${film.hue} 55% 14%)"/></linearGradient></defs>
  <rect width="600" height="900" fill="url(#g)"/>
  <rect x="30" y="30" width="540" height="840" fill="none" stroke="hsl(${film.hue} 30% 80%)" stroke-opacity="0.45" stroke-width="2"/>
  <text x="60" y="${560 - (lines.length - 1) * 60}" font-family="Georgia, 'Times New Roman', serif" font-size="68" fill="#f5efe4">${text}</text>
  <text x="60" y="800" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="4" fill="#f5efe4" fill-opacity="0.75">${esc(film.genre.toUpperCase())} · ${film.duration} MIN</text>
</svg>`;
}

// Route the two showtimes queries and the poster images on a Playwright page.
export async function mockShowtimes(page, options = {}) {
  await page.route('**/graphql', (route) => {
    let body;
    try { body = JSON.parse(route.request().postData() || '{}'); } catch { return route.continue(); }
    const query = body?.query ?? '';
    const date = body?.variables?.date || parts(options.now ?? new Date(), options.timeZone ?? TIME_ZONE).ymd;
    if (query.includes('datesWithShowing(')) {
      return route.fulfill({ json: { data: { datesWithShowing: { value: JSON.stringify(datesWithShowing(date)), __typename: 'Generic', resultVersion: 'picker-fixture' } } } });
    }
    if (query.includes('showingsForDate(')) {
      const data = showingsForDate(date, options);
      return route.fulfill({ json: { data: { showingsForDate: { data, count: data.length, resultVersion: 'picker-fixture', __typename: 'ShowingList' } } } });
    }
    return route.continue();
  });
  await page.route(`https://indy-systems.imgix.net/${POSTER_PREFIX}*`, (route) => {
    const id = new URL(route.request().url()).pathname.slice(1 + POSTER_PREFIX.length);
    const film = FILMS.find((f) => f.id === id);
    return film ? route.fulfill({ contentType: 'image/svg+xml', body: posterSvg(film) }) : route.abort();
  });
}
