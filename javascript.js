document.addEventListener('DOMContentLoaded', function () {
    fetch('spotify_data.php')
        .then(response => response.json())
        .then(data => {
            document.title = "document_title";
            const userProfile = data.user_profile;
            const userPlaylists = data.user_playlists;
            const recentlyPlayed = data.recently_played;
            const currentlyPlaying = data.current_playing;

            // console.log("USER", userProfile);
            // console.log("Playlists", userPlaylists);
            // console.log("RECENT", recentlyPlayed);
            // console.log("CURRENT", currentlyPlaying);
            // console.log("TOP ARTISTS", data.top_artists);
            // console.log("TOP TRACKS", data.top_tracks);

            const userId = userProfile.id;

            const spotifyProfileLink = `https://open.spotify.com/user/${userId}`;
            
            const profileLinkElement = document.createElement('a');
            profileLinkElement.href = spotifyProfileLink;
            profileLinkElement.target = '_blank';
            profileLinkElement.textContent = userProfile.display_name;

            profileLinkElement.style.color = 'inherit';
            profileLinkElement.style.textDecoration = 'none';
            
            document.querySelector('.display-name').innerHTML = '';
            document.querySelector('.display-name').appendChild(profileLinkElement);

            document.querySelector('.follower-count').textContent = `${userProfile.followers.total} follower`;

            try {
                userPlaylists.items.forEach(playlist => {
                    if (playlist.owner.display_name == "Spotify") {
                        return;
                    }
    
                    const playlistCard = document.createElement('div');
                    playlistCard.classList.add('playlist-card');
    
                    playlistCard.innerHTML = `
                        <a href="${playlist.external_urls.spotify}" target="_blank">
                            <img src="${playlist.images[0].url}" alt="${playlist.name}" class="playlist-image">
                        </a>
                        <div class="playlist-info">
                            <h2 class="playlist-name">${playlist.name}</h2>
                            <p class="playlist-owner">von ${playlist.owner.display_name}</p>
                            <p class="track-count">${playlist.tracks.total} songs</p>
                        </div>`;
    
                    var playlistContainer = document.getElementById('playlist-container');
                    playlistContainer.appendChild(playlistCard);
                });
            } catch (error) {
                console.error('Failed to load playlists.', error);
                console.log("Error at:" + playlist.name + "by" + playlist.owner.display_name)
            }

            const recentlyPlayedContainer = document.getElementById('recently-played-container');

            const uniqueTrackIds = new Set();

            var countTrackLoop = {};

            recentlyPlayed.items.forEach(trackData => {
                countTrackLoop[trackData.track.id] = countTrackLoop[trackData.track.id] ? countTrackLoop[trackData.track.id] + 1 : 1;
            });


            recentlyPlayed.items.forEach(trackData => {
                const track = trackData.track;

                if (uniqueTrackIds.has(track.id)) {
                    return;
                }

                loopCountOfTrack = countTrackLoop[track.id];
            
                uniqueTrackIds.add(track.id);

                const album = track.album;
                var artists = track.artists.map(artist => artist.name).join(', ');

                if (track.artists.length >= 3) {
                    artists = track.artists[0].name;
                }

                const playedAt = new Date(trackData.played_at);
                const now = new Date();
                const timeDiff = now - playedAt;
                let timeSincePlayed;

                if (timeDiff < 60000) {
                    timeSincePlayed = 'gerade eben';
                } else if (timeDiff < 3600000) {
                    const minutesAgo = Math.floor(timeDiff / 60000);
                    timeSincePlayed = `vor ${minutesAgo} minute${minutesAgo > 1 ? 'n' : ''} ${loopCountOfTrack > 1 ? `(${loopCountOfTrack} mal)` : ''}`;
                } else if (timeDiff < 86400000) {
                    const hoursAgo = Math.floor(timeDiff / 3600000);
                    timeSincePlayed = `vor ${hoursAgo} stunde${hoursAgo > 1 ? 'n' : ''} ${loopCountOfTrack > 1 ? `(${loopCountOfTrack} mal)` : ''}`;
                } else if (timeDiff < 604800000) {
                    const daysAgo = Math.floor(timeDiff / 86400000);
                    timeSincePlayed = `vor ${daysAgo} tag${daysAgo > 1 ? 'en' : ''} ${loopCountOfTrack > 1 ? `(${loopCountOfTrack} mal)` : ''}`;
                } else {
                    timeSincePlayed = 'vor über eine woche';
                }

                const trackCard = document.createElement('div');
                trackCard.classList.add('track-card');

                trackCard.innerHTML = `
                    <a href="${track.external_urls.spotify}" target="_blank">
                        <img src="${album.images[0].url}" alt="${track.name}" class="track-image">
                    </a>
                    <div class="track-info">
                        <h2 class="track-name">${track.name}</h2>
                        <p class="artist-name">${artists}</p>
                        <p class="album-details">${album.album_type === 'single' ? 'single' : `${album.name} (${track.track_number} / ${album.total_tracks})`}</p>
                        <p class="played-at">${timeSincePlayed}</p>
                        <p class="release-date">${track.album.release_date.split('-')[0]}</p>
                    </div>`;

                recentlyPlayedContainer.appendChild(trackCard);
            });

            const nowPlayingContainer = document.getElementById('now-playing-container');
            const trackNameElement = document.getElementById('track-name');
            const artistNameElement = document.getElementById('artist-name');
            const progressBarElement = document.getElementById('progress-bar');
            const currentTimeElement = document.getElementById('current-time');
            const totalTimeElement = document.getElementById('total-time');

            let intervalId;
            try {
            if (currentlyPlaying.is_playing) {
                const trackName = currentlyPlaying.item.name;
                const artistNames = currentlyPlaying.item.artists.map(artist => artist.name).join(', ');
                const durationMs = currentlyPlaying.item.duration_ms;
                const progressMs = currentlyPlaying.progress_ms;
                const trackId = currentlyPlaying.item.id;
                const spotifyLink = `https://open.spotify.com/track/${trackId}`;

                trackNameElement.textContent = trackName;
                const trackLinkElement = document.createElement('a');
                trackLinkElement.href = spotifyLink;
                trackLinkElement.target = '_blank';
                trackLinkElement.textContent = trackName;

                trackLinkElement.style.textDecoration = 'underline';
                trackLinkElement.style.color = 'inherit';

                trackNameElement.innerHTML = '';
                trackNameElement.appendChild(trackLinkElement);
                artistNameElement.textContent = artistNames;

                const progressPercentage = (progressMs / durationMs) * 100;
                progressBarElement.style.width = `${progressPercentage}%`;

                const currentMinutes = Math.floor(progressMs / 60000);
                const currentSeconds = Math.floor((progressMs % 60000) / 1000);
                currentTimeElement.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;

                const totalMinutes = Math.floor(durationMs / 60000);
                const totalSeconds = Math.floor((durationMs % 60000) / 1000);
                totalTimeElement.textContent = `${totalMinutes}:${totalSeconds}`;
            } else {
                console.log("AMK")
                trackNameElement.textContent = 'keine musik gerade';
                
                if (recentlyPlayed.items.length > 0) {
                    const lastPlayedTrackName = recentlyPlayed.items[0].track.name;
                    artistNameElement.textContent = `zuletzt '${lastPlayedTrackName}' gehört`;
                } else {
                    artistNameElement.textContent = 'yoo';
                }
            
                progressBarElement.style.width = '0%';
                currentTimeElement.textContent = '0:00';
                totalTimeElement.textContent = '0:00';
            }
        }
        catch {
            console.log("AMK2")
                trackNameElement.textContent = 'keine musik gerade';
                
                if (recentlyPlayed.items.length > 0) {
                    const lastPlayedTrackName = recentlyPlayed.items[0].track.name;
                    artistNameElement.textContent = `zuletzt '${lastPlayedTrackName}' gehört`;
                } else {
                    artistNameElement.textContent = 'yoo';
                }
            
                progressBarElement.style.width = '0%';
                currentTimeElement.textContent = '0:00';
                totalTimeElement.textContent = '0:00';
        }

            const duration_ms = currentlyPlaying.item.duration_ms;
            let progress_ms = currentlyPlaying.progress_ms;

            function formatTime(milliseconds) {
                const seconds = Math.floor(milliseconds / 1000);
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
            }

            function updateTimestamp() {
                if (!currentlyPlaying.is_playing) {
                    clearInterval(intervalId);
                    return;
                }

                progress_ms += 1000;
                const timestamp = formatTime(progress_ms);
                document.getElementById('current-time').innerText = timestamp;

                const progressPercentage = (progress_ms / duration_ms) * 100;
                progressBarElement.style.width = `${progressPercentage}%`;

                if (progress_ms >= duration_ms) {
                    location.reload();
                }
            }

            intervalId = setInterval(updateTimestamp, 1000);
        })
        .catch(error => {
            console.error('Failed to load data from the server.', error);
        });
});
