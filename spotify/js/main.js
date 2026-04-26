// js/main.js
import { AudioPlayer } from './player.js';


AudioPlayer.init();


const API_URL = 'api.php'; 

// Elementy UI
const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const songListContainer = document.getElementById('songList');

// Główna funkcja pobierająca dane z PHP
async function fetchSongs() {
   
    const searchQuery = searchInput.value;
    const genre = genreSelect.value;
    
   
    const url = new URL(API_URL, window.location.href);
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
        songListContainer.innerHTML = '<p>Brak połączenia z serwerem. Upewnij się, że serwer PHP działa.</p>';
    }
}


function renderSongs(songs) {
    songListContainer.innerHTML = ''; 

    if (songs.length === 0) {
        songListContainer.innerHTML = '<p class="loading">Nie znaleziono utworów dla tego filtra.</p>';
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


searchInput.addEventListener('input', () => fetchSongs());
genreSelect.addEventListener('change', () => fetchSongs());


fetchSongs();
// Event Listenery - odpalamy wyszukiwanie, gdy użytkownik pisze lub zmienia gatunek
searchInput.addEventListener('input', () => fetchSongs());
genreSelect.addEventListener('change', () => fetchSongs());

// Inicjalne załadowanie wszystkich utworów po wejściu na stronę
fetchSongs();
