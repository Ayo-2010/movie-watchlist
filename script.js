const STORAGE_KEY = 'watchlistMovies';
const POSTERS = [
  ['#7f1d1d', '#e11d48'],
  ['#1e3a8a', '#3b82f6'],
  ['#3b0764', '#a855f7'],
  ['#064e3b', '#10b981'],
  ['#78350f', '#f59e0b'],
  ['#0c4a6e', '#0ea5e9'],
];

const form = document.getElementById('addForm');
const titleInput = document.getElementById('titleInput');
const yearInput = document.getElementById('yearInput');
const genreInput = document.getElementById('genreInput');
const errorEl = document.getElementById('error');
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const tabs = document.getElementById('tabs');
const searchEl = document.getElementById('search');
const wantCount = document.getElementById('wantCount');
const watchedCount = document.getElementById('watchedCount');

const SEED = [
  { title: 'Inception', year: 2010, genre: 'Sci-Fi', watched: false },
  { title: 'Parasite', year: 2019, genre: 'Thriller', watched: true },
  { title: 'Spirited Away', year: 2001, genre: 'Animation', watched: false },
];

let movies = [];
let filter = 'all';

function loadMovies() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    return [];
  }

  return SEED.map((movie, index) => ({ ...movie, id: `seed-${index}` }));
}

function saveMovies() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

function initials(title) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

function posterColors(title) {
  const hash = [...title].reduce((total, char) => total + char.charCodeAt(0), 0);
  return POSTERS[hash % POSTERS.length];
}

function visibleMovies() {
  const term = searchEl.value.trim().toLowerCase();

  return movies.filter((movie) => {
    if (filter === 'want' && movie.watched) return false;
    if (filter === 'watched' && !movie.watched) return false;
    if (term && !movie.title.toLowerCase().includes(term)) return false;
    return true;
  });
}

function render() {
  listEl.innerHTML = '';

  const visible = visibleMovies();

  visible.forEach((movie) => {
    const card = document.createElement('article');
    card.className = 'movie' + (movie.watched ? ' watched' : '');

    const poster = document.createElement('div');
    poster.className = 'poster';
    const [from, to] = posterColors(movie.title);
    poster.style.background = `linear-gradient(150deg, ${from}, ${to})`;

    const mark = document.createElement('span');
    mark.textContent = initials(movie.title);
    const year = document.createElement('small');
    year.textContent = movie.year || '—';
    poster.append(mark, year);

    const info = document.createElement('div');
    info.className = 'info';

    const title = document.createElement('h2');
    title.textContent = movie.title;

    const meta = document.createElement('p');
    meta.textContent = movie.year ? `${movie.genre} · ${movie.year}` : movie.genre;

    const status = document.createElement('span');
    status.className = 'status' + (movie.watched ? ' done' : '');
    status.textContent = movie.watched ? 'Watched' : 'To watch';

    info.append(title, meta, status);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toggle';
    toggle.textContent = movie.watched ? 'Watch again' : 'Mark watched';
    toggle.addEventListener('click', () => {
      movie.watched = !movie.watched;
      saveMovies();
      render();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      movies = movies.filter((item) => item.id !== movie.id);
      saveMovies();
      render();
    });

    actions.append(toggle, remove);
    card.append(poster, info, actions);
    listEl.appendChild(card);
  });

  emptyEl.hidden = visible.length > 0;
  emptyEl.textContent = movies.length === 0
    ? 'Nothing here yet. Add your first film above.'
    : 'No films match this view.';

  const watched = movies.filter((movie) => movie.watched).length;
  wantCount.textContent = movies.length - watched;
  watchedCount.textContent = watched;
}

function addMovie(title, year, genre) {
  if (!title) {
    errorEl.textContent = 'Give the film a title.';
    errorEl.hidden = false;
    return;
  }

  if (year && (year < 1888 || year > 2100)) {
    errorEl.textContent = 'Enter a year between 1888 and 2100.';
    errorEl.hidden = false;
    return;
  }

  movies.push({
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    title,
    year: year || null,
    genre,
    watched: false,
  });

  saveMovies();
  errorEl.hidden = true;
  form.reset();
  genreInput.value = 'Drama';
  render();
  titleInput.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const year = yearInput.value ? Number(yearInput.value) : null;

  addMovie(title, year, genreInput.value);
});

tabs.addEventListener('click', (event) => {
  const tab = event.target.closest('.tab');
  if (!tab) return;

  filter = tab.dataset.filter;
  tabs.querySelectorAll('.tab').forEach((item) => {
    item.classList.toggle('active', item === tab);
  });
  render();
});

searchEl.addEventListener('input', render);

movies = loadMovies();

if (!localStorage.getItem(STORAGE_KEY)) saveMovies();

render();
