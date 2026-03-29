document.getElementById('load-btn').addEventListener('click', () => {
    // Odpytujemy nasz plik PHP
    fetch('api.php')
        .then(response => response.json())
        .then(data => {
            console.log("Pobrane dane z PHP:", data);
            document.getElementById('results').innerText = "Znaleziono: " + data.songs[0].title;
        })
        .catch(error => console.error("Błąd połączenia:", error));
});
// js/main.js
import { AudioPlayer } from './player.js';

// Inicjalizujemy odtwarzacz
AudioPlayer.init();

// Pamiętaj, że testujemy na serwerze z portem 8000
const API_URL = 'http://localhost:8000/api.php'; 

// Elementy UI
const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const songListContainer = document.getElementById('songList');

// Główna funkcja pobierająca dane z PHP
async function fetchSongs() {
    // Zbieramy wartości z filtrów
    const searchQuery = searchInput.value;
    const genre = genreSelect.value;
    
    // Budujemy URL (np. http://localhost:8000/api.php?search=lo-fi&genre=)
    const url = new URL(API_URL);
    if (searchQuery) url.searchParams.append('search', searchQuery);
    if (genre) url.searchParams.append('genre', genre);

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results) {
            renderSongs(data.results);
        } else {
            songListContainer.innerHTML = '<p>Błąd pobierania danych z API.</p>';
        }
    } catch (error) {
        console.error("Błąd połączenia:", error);
        songListContainer.innerHTML = '<p>Brak połączenia z serwerem. Upewnij się, że PHP działa (php -S localhost:8000).</p>';
    }
}

// Funkcja rysująca listę utworów (Karty HTML)
function renderSongs(songs) {
    songListContainer.innerHTML = ''; // Czyścimy listę

    if (songs.length === 0) {
        songListContainer.innerHTML = '<p class="loading">Nie znaleziono utworów dla tego filtra.</p>';
        return;
    }

    songs.forEach(song => {
        // Tworzymy kartę utworu
        const card = document.createElement('article');
        card.className = 'song-card';
        
        // Zabezpieczamy tagi przed błędami (jeśli ich nie ma)
        const tags = song.tags ? song.tags.join(', ') : '';

        card.innerHTML = `
            <div class="song-details">
                <h3>${song.title}</h3>
                <p>👤 ${song.author} | 📜 Licencja: ${song.license || 'CC0'}</p>
                <div class="song-tags">#${tags.replace(/, /g, ' #')}</div>
            </div>
            <button class="play-track-btn" aria-label="Odtwórz ${song.title}">▶</button>
        `;

        // Dodajemy obsługę kliknięcia w przycisk "Play"
        const playBtn = card.querySelector('.play-track-btn');
        playBtn.addEventListener('click', () => {
            AudioPlayer.playTrack(song);
        });

        songListContainer.appendChild(card);
    });
}

// Event Listenery - odpalamy wyszukiwanie, gdy użytkownik pisze lub zmienia gatunek
searchInput.addEventListener('input', () => fetchSongs());
genreSelect.addEventListener('change', () => fetchSongs());

// Inicjalne załadowanie wszystkich utworów po wejściu na stronę
fetchSongs();