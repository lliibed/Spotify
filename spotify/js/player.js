// js/player.js

export const AudioPlayer = {
    audio: new Audio(),
    currentSongUrl: null,
    isPlaying: false,

    // Elementy interfejsu (UI)
    ui: {
        playBtn: document.getElementById('playPauseBtn'),
        title: document.getElementById('trackTitle'),
        author: document.getElementById('trackAuthor'),
        progress: document.getElementById('progressBar')
    },

    init() {
        // Nasłuchiwanie kliknięcia Play/Pause w dolnym pasku
        this.ui.playBtn.addEventListener('click', () => this.togglePlay());

        // Aktualizacja paska postępu w miarę grania
        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration) {
                const percentage = (this.audio.currentTime / this.audio.duration) * 100;
                this.ui.progress.value = percentage;
            }
        });

        // Przewijanie utworu kliknięciem w pasek postępu
        this.ui.progress.addEventListener('input', (e) => {
            if (this.audio.duration) {
                const seekTime = (e.target.value / 100) * this.audio.duration;
                this.audio.currentTime = seekTime;
            }
        });

        // Co zrobić po zakończeniu utworu?
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.ui.playBtn.innerText = '▶';
            this.ui.progress.value = 0;
        });
    },

    playTrack(song) {
        // Jeśli klikamy ten sam utwór - pauzujemy/wznawiamy
        if (this.currentSongUrl === song.file_url) {
            this.togglePlay();
            return;
        }

        // Ładujemy nowy utwór z GitHuba
        this.audio.src = song.file_url;
        this.currentSongUrl = song.file_url;
        this.audio.play();
        this.isPlaying = true;

        // Aktualizacja UI
        this.ui.title.innerText = song.title;
        this.ui.author.innerText = song.author;
        this.ui.playBtn.innerText = '⏸'; // Zmieniamy ikonę na Pause
        this.ui.playBtn.disabled = false;
    },

    togglePlay() {
        if (!this.currentSongUrl) return; // Zabezpieczenie przed kliknięciem w puste
        
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