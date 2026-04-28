import { AudioPlayer } from './player.js';

AudioPlayer.init();

const API_URL = 'api.php'; 

const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const songListContainer = document.getElementById('songList');

async function fetchSongs() {
    const searchQuery = searchInput.value;
    const genre = genreSelect.value;
    
    const url = new URL(API_URL, window.location.href);
    if (searchQuery) url.searchParams.append('search', searchQuery);
    if (genre) url.searchParams.append('genre', genre);

    try {
        const response = await fetch(url);
        // Pobieramy po prostu czystą tablicę z piosenkami (bez .results)
        const data = await response.json(); 
        
        // Zabezpieczenie: sprawdzamy czy to na pewno jest lista (tablica)
        if (Array.isArray(data)) {
            renderSongs(data);
        } else {
            renderError('Błąd pobierania danych z API.');
        }
    } catch (error) {
        console.error("Błąd połączenia:", error);
        renderError('Brak połączenia z serwerem. Upewnij się, że serwer PHP działa.');
    }
}

// Funkcja pomocnicza do błędów 
function renderError(message) {
    songListContainer.replaceChildren(); // Czyści listę bezpiecznie
    const errorMsg = document.createElement('p');
    errorMsg.textContent = message;
    songListContainer.appendChild(errorMsg);
}

function renderSongs(songs) {
  
    songListContainer.replaceChildren(); 

    if (songs.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'loading';
        emptyMsg.textContent = 'Nie znaleziono utworów dla tego filtra.';
        songListContainer.appendChild(emptyMsg);
        return;
    }

    songs.forEach(song => {
        // 1. Tworzymy główną kartę
        const card = document.createElement('article');
        card.className = 'song-card';
        
        // 2. Tworzymy obrazek
        const img = document.createElement('img');
        img.src = song.cover_url || 'https://placehold.co/60x60/222/666?text=🎵';
        img.alt = 'Okładka';
        img.loading = 'lazy';

        // 3. Tworzymy kontener na teksty
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'song-details';

        // 4. Tworzymy tytuł
        const title = document.createElement('h3');
        title.textContent = song.title; // textContent chroni przed XSS!

        // 5. Tworzymy autora i licencję
        const author = document.createElement('p');
        author.textContent = `${song.author} | Licencja: ${song.license || 'CC0'}`;

        // 6. Tworzymy tagi
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'song-tags';
        const tags = song.tags ? song.tags.join(', ') : '';
        tagsDiv.textContent = tags ? `#${tags.replace(/, /g, ' #')}` : '';

        // Składamy teksty do kontenera details
        detailsDiv.appendChild(title);
        detailsDiv.appendChild(author);
        detailsDiv.appendChild(tagsDiv);

        // 7. Tworzymy przycisk Play
        const playBtn = document.createElement('button');
        playBtn.className = 'play-track-btn';
        playBtn.setAttribute('aria-label', `Odtwórz ${song.title}`);
        playBtn.textContent = '▶';
        
        playBtn.addEventListener('click', () => {
            AudioPlayer.playTrack(song);
        });

        // 8. Składamy wszystko w jedną kartę i dodajemy do głównej listy
        card.appendChild(img);
        card.appendChild(detailsDiv);
        card.appendChild(playBtn);

        songListContainer.appendChild(card);
    });
}

// Event Listenery
searchInput.addEventListener('input', () => fetchSongs());
genreSelect.addEventListener('change', () => fetchSongs());

// Inicjalne załadowanie
fetchSongs();
