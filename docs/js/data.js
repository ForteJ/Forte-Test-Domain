// ============ Mock data layer ============
// Everything here stands in for a real backend. Swap fetchState()/persist()
// for real API calls when you're ready to connect a server.

const AV = n => `https://i.pravatar.cc/150?img=${n}`;
const PIC = (id, w = 400, h = 300) => `https://picsum.photos/id/${id}/${w}/${h}`;

const DEFAULT_DATA = {
  signedIn: false,
  user: {
    id: 'u1', name: 'Sarah Jenkins', role: 'Family organizer',
    email: 'sarah@jenkinsfamily.com', phone: '(415) 555-0148', avatar: AV(47),
  },
  familyAccess: [
    { id: 'u2', name: 'Mark Jenkins', role: 'Parent · Full access', avatar: AV(12) },
  ],
  kids: [
    {
      id: 'k1', name: 'Leo Jenkins', nickname: 'Leo', age: 5, grade: 'Kindergartener',
      school: 'Sunset Elementary', dob: '2021-03-10', initial: 'L', color: '#0E9C7C',
      allergies: ['Peanuts'], interests: ['Soccer', 'Playdates', 'Dinosaurs'],
      schedule: [
        { day: 'Mon', title: 'Gymnastics', time: '4:00 PM - 5:00 PM', tag: 'SPORTS' },
        { day: 'Wed', title: 'Scooter Playdate', time: '3:00 PM - 5:00 PM', tag: 'PLAYDATE' },
        { day: 'Thu', title: 'Soccer Practice', time: '5:30 PM - 7:00 PM', tag: 'SPORTS' },
      ],
    },
    {
      id: 'k2', name: 'Mia Jenkins', nickname: 'Mia', age: 3, grade: 'Preschool',
      school: 'Sunset Elementary', dob: '2023-01-22', initial: 'M', color: '#8B7CF6',
      allergies: [], interests: ['Drawing', 'Music'],
      schedule: [
        { day: 'Tue', title: 'Toddler Music Class', time: '10:00 AM - 11:00 AM', tag: 'MUSIC' },
      ],
    },
  ],
  contacts: [
    { id: 'c1', name: 'Emily Watson', kidsLabel: 'Toby (5)', lastActive: 'Yesterday', avatar: AV(5) },
    { id: 'c2', name: 'David K.', kidsLabel: 'Sam (6)', lastActive: '3 days ago', avatar: AV(15) },
    { id: 'c3', name: 'Jessica R.', kidsLabel: 'Lily (4)', lastActive: '1 week ago', avatar: AV(9) },
    { id: 'c4', name: 'Marcus Miller', kidsLabel: 'Zoe (5) & Ryan (7)', lastActive: '2 weeks ago', avatar: AV(33) },
  ],
  crews: [
    { id: 'all', name: 'All Contacts', desc: 'Default Group', count: 4, glyph: '👥', color: 'teal', members: ['c1', 'c2', 'c3', 'c4'], about: 'Everyone in your contacts, grouped automatically.' },
    { id: 'cr1', name: 'Sports Crew', desc: '8 families', count: 8, glyph: '🏃', color: 'teal', members: ['c1', 'c4'], about: 'Coordinating practices and carpools for our sporty kids.' },
    { id: 'cr2', name: 'Church & Faith', desc: '6 families', count: 6, glyph: '💜', color: 'purple', members: ['c1', 'c4', 'c3'], about: "Parents from St. Mary's Parish and Temple Beth El coordinating Sunday outings and carpools." },
    { id: 'cr3', name: 'Neighborhood', desc: '12 families', count: 12, glyph: '🏠', color: 'blue', members: ['c2', 'c3'], about: 'Families on Maple & Birch coordinating block activities.' },
    { id: 'cr4', name: 'School Friends', desc: '5 families', count: 5, glyph: '📖', color: 'orange', members: ['c1', 'c2', 'c3', 'c4'], about: 'Sunset Elementary families staying in touch outside school.' },
  ],
  activities: [
    { id: 'a1', title: 'Creative Kids Fine Art Camp', by: 'Avenue Arts Center', age: '5-11 YRS', price: 240, priceLabel: '$240', type: 'SUMMER CAMP', dist: '1.2 mi', rating: 4.9, reviews: 24, dates: 'July 12 - July 16, 2026', hours: 'Monday to Friday, 9:00 AM - 3:00 PM', location: 'Downtown Art Annex, 154 Grand Ave, Suite B', desc: "Unleash your child's inner artist this summer! Our Fine Art Camp offers daily hands-on workshops in watercolor, canvas acrylic painting, clay sculpting, and mixed media. All premium materials are included in the tuition fee. Kids should bring a packed lunch and reusable water bottle. Capstone gallery show on Friday afternoon!", img: PIC(1015), category: 'Art & STEM' },
    { id: 'a2', title: 'Strikers Youth Soccer Clinic', by: 'Westside Athletics', age: '6-10 YRS', price: 180, priceLabel: '$180', type: 'CLINIC', dist: '3.4 mi', rating: 4.7, reviews: 18, dates: 'June 8 - June 12, 2026', hours: 'Monday to Friday, 4:00 PM - 5:30 PM', location: 'West Field Sports Complex', desc: 'Build fundamental soccer skills in a fun, high-energy clinic led by certified youth coaches. Cleats and shin guards required.', img: PIC(1058), category: 'Sports' },
    { id: 'a3', title: 'Robotics & Python Intro', by: 'STEM Scholars Lab', age: '8-14 YRS', price: 310, priceLabel: '$310', type: 'STEM', dist: '2.1 mi', rating: 4.8, reviews: 31, dates: 'July 20 - July 24, 2026', hours: 'Monday to Friday, 9:00 AM - 12:00 PM', location: 'STEM Scholars Lab, 88 Innovation Way', desc: 'Hands-on introduction to robotics and Python programming. Kids build and code their own robot to take home.', img: PIC(0), category: 'Art & STEM' },
    { id: 'a4', title: 'Wilderness Discovery Trail', by: 'Eco Adventures Foundation', age: '7-12 YRS', price: 150, priceLabel: '$150', type: 'OUTDOOR', dist: '5.7 mi', rating: 4.6, reviews: 12, dates: 'June 22 - June 26, 2026', hours: 'Monday to Friday, 9:00 AM - 2:00 PM', location: 'Eco Adventures Basecamp, Redwood Trailhead', desc: 'A week of guided nature exploration, trail hiking, and wildlife education for curious kids.', img: PIC(1043), category: 'Sports' },
    { id: 'a5', title: 'Tumbling & Gymnastics Basics', by: 'Apex Gymnastics', age: '4-8 YRS', price: 200, priceLabel: '$200', type: 'SPORTS', dist: '4.2 mi', rating: 4.9, reviews: 27, dates: 'July 6 - July 10, 2026', hours: 'Monday to Friday, 10:00 AM - 11:30 AM', location: 'Apex Gymnastics Center', desc: 'A beginner-friendly gymnastics camp focused on tumbling fundamentals, balance, and confidence-building.', img: PIC(1025), category: 'Sports' },
  ],
  events: [
    { id: 'e1', date: '2026-10-14', title: 'Leo & Toby Park Date', time: '3:00 PM', tag: 'PLAYDATE', location: 'Sunset Park Playground', withName: 'Emily Watson', kidId: 'k1' },
    { id: 'e2', date: '2026-10-14', title: 'Soccer Practice Carpool', time: '5:30 PM', tag: 'SOCCER PICKUP', location: 'West Field Sports Complex', withName: 'David K.', kidId: 'k1' },
    { id: 'e3', date: '2026-10-03', title: 'Weekend Playdate', time: '2:00 PM', tag: 'PLAYDATE', location: 'Neighborhood Park', withName: 'Jessica R.', kidId: 'k1' },
    { id: 'e4', date: '2026-10-06', title: 'Gymnastics', time: '4:00 PM', tag: 'SPORTS', location: 'Apex Gymnastics', withName: '', kidId: 'k1' },
    { id: 'e5', date: '2026-10-09', title: 'Art Club', time: '3:30 PM', tag: 'ARTS', location: 'Downtown Art Annex', withName: '', kidId: 'k2' },
    { id: 'e6', date: '2026-10-18', title: 'Soccer Practice', time: '5:30 PM', tag: 'SPORTS', location: 'West Field Sports Complex', withName: '', kidId: 'k1' },
    { id: 'e7', date: '2026-10-21', title: 'Church Picnic', time: '12:00 PM', tag: 'CREW', location: "St. Mary's Parish Field", withName: 'Church & Faith crew', kidId: 'k1' },
    { id: 'e8', date: '2026-10-27', title: 'Neighborhood Bike Day', time: '10:00 AM', tag: 'CREW', location: 'Maple St Cul-de-sac', withName: 'Neighborhood crew', kidId: 'k1' },
    { id: 'e9', date: '2026-10-30', title: 'Halloween Playdate', time: '4:00 PM', tag: 'PLAYDATE', location: "Emily's house", withName: 'Emily Watson', kidId: 'k1' },
  ],
  messages: {
    c1: [
      { from: 'them', text: 'Hi Sarah! Toby had so much fun with Leo last time. Are you free for another playdate this week?' },
      { from: 'me', text: "Yes, we'd love that! Leo keeps asking when he can play on Toby's scooter again. How does 3pm sound?" },
      { from: 'them', text: 'Scooter playdate it is! I just drafted this schedule request, let me know if these details work:' },
      { from: 'card', title: 'Wednesday Scooter Date', time: 'Wed, Oct 14 @ 3:00 PM', location: 'Sunset Park Playground', attendees: 'Leo & Toby attending', status: 'pending' },
    ],
    c2: [
      { from: 'them', text: 'Hey! Still good for soccer carpool Thursday at 5:30?' },
      { from: 'me', text: 'Yes, confirmed on our end!' },
    ],
    c3: [
      { from: 'them', text: 'Would Lily and Leo like to do a playdate this weekend?' },
    ],
    c4: [
      { from: 'them', text: 'Zoe and Ryan would love to join the art camp with Leo!' },
    ],
  },
  favorites: ['a2', 'a5', 'a1'],
};

const STORAGE_KEY = 'huddleCrewState';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* private browsing / storage unavailable */ }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore storage errors */ }
}

let state = loadState();

function resetDemoData() {
  state = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveState();
}
