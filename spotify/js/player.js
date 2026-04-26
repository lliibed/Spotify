// js/player.js

export const AudioPlayer = {
    audio: new Audio(),
    currentSongUrl: null,
    isPlaying: false,
    lastVolume: 1, // Pamięta głośność przed wyciszeniem

    ui: {
        playBtn: document.getElementById('playPauseBtn'),
        title: document.getElementById('trackTitle'),
        author: document.getElementById('trackAuthor'),
        progress: document.getElementById('progressBar'),
        volumeBar: document.getElementById('volumeBar'),
        muteBtn: document.getElementById('muteBtn'),
        cover: document.getElementById('trackCover')
    },

    init() {
        this.ui.playBtn.addEventListener('click', () => this.togglePlay());

        // --- SEKCJA GŁOŚNOŚCI ---
        
        // 1. Odczytuje zapisaną głośność (lub ustawiam 100%)
        const savedVolume = localStorage.getItem('playerVolume') !== null 
            ? parseFloat(localStorage.getItem('playerVolume')) 
            : 1;
            
        this.audio.volume = savedVolume;
        this.ui.volumeBar.value = savedVolume * 100;
        this.updateMuteIcon(savedVolume);

        // 2. Obsługa przesuwania suwaka głośności
        this.ui.volumeBar.addEventListener('input', (e) => {
            const newVolume = e.target.value / 100;
            this.audio.volume = newVolume;
            this.updateMuteIcon(newVolume);
            
            // Zapisuje w przeglądarce
            localStorage.setItem('playerVolume', newVolume);
            
            if (newVolume > 0) {
                this.lastVolume = newVolume; 
            }
        });

        // 3. Obsługa kliknięcia w ikonkę (Wycisz/Odcisz)
        this.ui.muteBtn.addEventListener('click', () => this.toggleMute());

        // --- KONIEC SEKCJI GŁOŚNOŚCI ---

        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration) {
                const percentage = (this.audio.currentTime / this.audio.duration) * 100;
                this.ui.progress.value = percentage;
            }
        });

        this.ui.progress.addEventListener('input', (e) => {
            if (this.audio.duration) {
                this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
            }
        });

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.ui.playBtn.innerText = '▶';
            this.ui.progress.value = 0;
        });
    },

    // Nowa funkcja wyciszania
    toggleMute() {
        if (this.audio.volume > 0) {
            // Wyciszamy
            this.lastVolume = this.audio.volume;
            this.audio.volume = 0;
            this.ui.volumeBar.value = 0;
        } else {
            // Odciszamy do poprzedniej wartości
            this.audio.volume = this.lastVolume > 0 ? this.lastVolume : 1;
            this.ui.volumeBar.value = this.audio.volume * 100;
        }
        
        this.updateMuteIcon(this.audio.volume);
        localStorage.setItem('playerVolume', this.audio.volume);
    },

  
    updateMuteIcon(vol) {
        if (vol === 0) {
            this.ui.muteBtn.innerText = '🔇';
        } else if (vol < 0.5) {
            this.ui.muteBtn.innerText = '🔉';
        } else {
            this.ui.muteBtn.innerText = '🔊';
        }
    },

   playTrack(song) {
        if (this.currentSongUrl === song.file_url) {
            this.togglePlay();
            return;
        }

        this.audio.src = song.file_url;
        this.currentSongUrl = song.file_url;
        this.audio.play();
        this.isPlaying = true;

        this.ui.title.innerText = song.title;
        this.ui.author.innerText = song.author;
        this.ui.playBtn.innerText = '⏸';
        this.ui.playBtn.disabled = false;
        
      // Zmiana okładki (zabezpieczenie na wypadek braku linku)
        this.ui.cover.src = song.cover_url || 'https://placehold.co/50x50/222/666?text=🎵';
    },

    togglePlay() {
        if (!this.currentSongUrl) return;
        if (this.isPlaying) {
            this.audio.pause();
            this.ui.playBtn.innerText = '▶';
        } else {
            this.audio.play();
            this.ui.playBtn.innerText = '⏸';
        }
        this.isPlaying = !this.isPlaying;
    }
};
