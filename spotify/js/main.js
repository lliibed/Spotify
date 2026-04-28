import { AudioPlayer } from './player.js';

AudioPlayer.init();

const API_URL = 'api.php'; 

// 1. Elementy UI - muszą tu być, żeby renderSongs wiedziało gdzie rysować!
const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const songListContainer = document.getElementById('songList');

// 2. Funkcja pobierająca dane
async function fetchSongs() {
    const searchQuery = searchInput.value;
    const genre = genreSelect.value;
    
    const url = new URL(API_URL, window.location.href);
    if (searchQuery) url.searchParams.append('search', searchQuery);
    if (genre) url.searchParams.append('genre', genre);

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Sprawdzamy czy PHP zwraca obiekt z .results czy czystą tablicę
        const songs = data.results ? data.results : data;
        renderSongs(songs);
        
    } catch (error) {
        console.error("Błąd połączenia:", error);
        songListContainer.innerHTML = '<p>Brak połączenia z serwerem.</p>';
    }
}

// 3. Twoja funkcja renderująca (DOKŁADNIE TA ZE ZDJĘCIA)
function renderSongs(songs) {
    songListContainer.innerHTML = ''; 

    if (songs.length === 0) {
        const p = document.createElement('p');
        p.classList.add('loading');
        p.textContent = 'Nie znaleziono utworów dla tego filtra.';
        songListContainer.appendChild(p);
        return;
    }

    songs.forEach(song => {
        const card = document.createElement('article');
        card.className = 'song-card';
        
        const tags = song.tags ? song.tags.join(', ') : '';

        card.innerHTML = `
            <img src="${song.cover_url || 'https://placehold.co/60x60/222/666?text=🎵'}" alt="Okładka" loading="lazy">
            <div class="song-details">
                <h3>${song.title}</h3>
                <p>${song.author} | Licencja: ${song.license || 'CC0'}</p>
                <div class="song-tags">#${tags.replace(/, /g, ' #')}</div>
            </div>
            <button class="play-track-btn" aria-label="Odtwórz ${song.title}">▶</button>
        `;

        const playBtn = card.querySelector('.play-track-btn');
        playBtn.addEventListener('click', () => {
            AudioPlayer.playTrack(song);
        });

        songListContainer.appendChild(card);
    });
}

// 4. Startujemy nasłuchiwanie i pierwsze ładowanie
searchInput.addEventListener('input', () => fetchSongs());
genreSelect.addEventListener('change', () => fetchSongs());

fetchSongs();
