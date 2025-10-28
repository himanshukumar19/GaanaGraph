const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Set up middleware
app.use(cors());
app.use(express.json());

// Location of your dataset CSV file
const datasetPath = path.join(__dirname, 'music_dataset', 'SpotifyFeatures_with_year.csv');

// List of features you want to expose in the API
const FEATURES = [
  'danceability', 'energy', 'valence', 'popularity',
  'acousticness', 'instrumentalness', 'liveness', 'loudness',
  'speechiness', 'tempo'
];

// Helper function to parse CSV and cache data on server start
let dataset = [];
function loadDataset() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(datasetPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        dataset = results;
        console.log('Dataset loaded with', dataset.length, 'records');
        resolve();
      })
      .on('error', reject);
  });
}

// Compute average of numeric fields for artist tracks

// === NEW: Timeline endpoint for release year chart ===
app.get('/api/artist_timeline', (req, res) => {
  const artistName = req.query.name?.toLowerCase();
  if (!artistName) {
    return res.status(400).json({ error: 'Artist name is required' });
  }

  const artistSongs = dataset.filter(track =>
    track.artist_name && track.artist_name.toLowerCase().includes(artistName)
  );

  if (artistSongs.length === 0) {
    return res.status(404).json({ error: 'Artist not found' });
  }

  // Return songs with release year data
  const timelineData = artistSongs.map(song => ({
    track_name: song.track_name,
    release_year: parseInt(song.release_year),
    popularity: parseFloat(song.popularity),
    energy: parseFloat(song.energy),
    danceability: parseFloat(song.danceability)
  })).filter(song => song.release_year && song.release_year > 1900);

  res.json({ songs: timelineData });
});
function computeFeaturesForArtist(artistName) {
  const filtered = dataset.filter(
    (track) => track.artist_name && track.artist_name.toLowerCase() === artistName.toLowerCase()
  );
  if (filtered.length === 0) return null;

  const featureSums = {};
  FEATURES.forEach(f => featureSums[f] = 0);

  filtered.forEach(track => {
    FEATURES.forEach(f => {
      let val = parseFloat(track[f]);
      if (isNaN(val)) val = 0;
      if (f === 'loudness') val = Math.abs(val);
      featureSums[f] += val;
    });
  });

  const averages = {};
  FEATURES.forEach(f => {
    averages[f] = +(featureSums[f] / filtered.length).toFixed(3);
  });

  return averages;
}

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Artist features API
app.get('/api/artist_features', (req, res) => {
  const artistName = req.query.name;
  if (!artistName) {
    return res.status(400).json({ error: 'Artist name is required as query parameter `name`' });
  }

  const features = computeFeaturesForArtist(artistName);
  if (!features) {
    return res.status(404).json({ error: `No data found for artist: ${artistName}` });
  }

  res.json({ artist: artistName, features });
});

// Top tracks API
app.get('/api/artist_top_tracks', (req, res) => {
  const artistName = req.query.name;
  if (!artistName) return res.status(400).json({ error: "Missing 'name' query parameter" });

  const topTracks = dataset
    .filter(t => t.artist_name && t.artist_name.toLowerCase() === artistName.toLowerCase())
    .sort((a, b) => parseInt(b.popularity) - parseInt(a.popularity))
    .slice(0, 5)
    .map(track => ({
      track_name: track.track_name,
      album: track.album_name || '',
      popularity: track.popularity,
      spotify_url: track.track_id
        ? `https://open.spotify.com/track/${track.track_id}`
        : `https://www.spotify.com/search/${encodeURIComponent(track.track_name + ' ' + artistName)}`,
      youtube_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(track.track_name + ' ' + artistName)}`
    }));

  if (topTracks.length === 0) return res.status(404).json({ error: `No data for artist: ${artistName}` });

  res.json({ artist: artistName, tracks: topTracks });
});

// Trends Over Tracks (not year!) API
app.get('/api/artist_trends', (req, res) => {
  const artistName = req.query.name;
  if (!artistName) return res.status(400).json({ error: "Missing 'name' query parameter" });

  const tracks = dataset.filter(
    t => t.artist_name && t.artist_name.toLowerCase() === artistName.toLowerCase()
  );

  // Timeline: features per track order
  const timeline = tracks.map((track, idx) => ({
    label: track.track_name || `Track ${idx+1}`,
    mood: Number(track.valence),
    energy: Number(track.energy),
    popularity: Number(track.popularity),
    danceability: Number(track.danceability)
  }));

  res.json({ artist: artistName, timeline });
});

// Start server after loading dataset
loadDataset().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to load dataset:', err);
});
