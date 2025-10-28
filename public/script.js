// === Initialize global chart variables ===
let featureChart;
let trendChart;
let pieChart;
let timelineChart;
let popularityTrendChart;
let boxPlotChart;

// === Render Mini Audio Features ===
function renderMiniAudioFeatures(features) {
  const container = document.getElementById('miniFeatures');
  if (!container) return;

  // Filter and sort the most important features
  const importantFeatures = {
    'Danceability': features.danceability,
    'Energy': features.energy,
    'Valence': features.valence || 0.5, // Mood
    'Acousticness': features.acousticness,
    'Instrumentalness': features.instrumentalness,
    'Liveness': features.liveness,
    'Speechiness': features.speechiness
  };

  container.innerHTML = '';
  
  Object.entries(importantFeatures).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const featureItem = document.createElement('div');
      featureItem.className = 'feature-item';
      featureItem.innerHTML = `
        <div class="feature-label">${key}</div>
        <div class="feature-value">${(value * 100).toFixed(0)}%</div>
        <div class="feature-progress">
          <div class="feature-progress-bar" style="width: ${value * 100}%"></div>
        </div>
      `;
      container.appendChild(featureItem);
    }
  });
}

// === Render Mini Trends ===
function renderMiniTrends(timelineData) {
  const container = document.getElementById('miniTrends');
  if (!container) return;

  if (!timelineData || timelineData.length === 0) {
    container.innerHTML = '<div class="no-data">No trend data available</div>';
    return;
  }

  // Calculate trends (increasing/decreasing)
  const firstItem = timelineData[0];
  const lastItem = timelineData[timelineData.length - 1];
  
  const trends = [
    {
      name: 'Energy Trend',
      icon: '⚡',
      value: calculateTrend(firstItem.energy, lastItem.energy),
      current: lastItem.energy
    },
    {
      name: 'Danceability',
      icon: '💃',
      value: calculateTrend(firstItem.danceability, lastItem.danceability),
      current: lastItem.danceability
    },
    {
      name: 'Popularity',
      icon: '⭐',
      value: calculateTrend(firstItem.popularity, lastItem.popularity),
      current: lastItem.popularity
    },
    {
      name: 'Mood',
      icon: '😊',
      value: calculateTrend(firstItem.mood || 0.5, lastItem.mood || 0.5),
      current: lastItem.mood || 0.5
    }
  ];

  container.innerHTML = '<div class="trend-summary"></div>';
  const trendSummary = container.querySelector('.trend-summary');

  trends.forEach(trend => {
    const trendItem = document.createElement('div');
    trendItem.className = 'trend-item';
    
    const trendClass = trend.value > 0 ? 'trend-positive' : 
                      trend.value < 0 ? 'trend-negative' : 'trend-neutral';
    
    const trendArrow = trend.value > 0 ? '↗' : 
                      trend.value < 0 ? '↘' : '→';
    
    trendItem.innerHTML = `
      <div class="trend-info">
        <span class="trend-icon">${trend.icon}</span>
        <span class="trend-name">${trend.name}</span>
      </div>
      <div class="trend-value ${trendClass}">
        ${trendArrow} ${Math.abs(trend.value).toFixed(1)}%
      </div>
    `;
    
    trendSummary.appendChild(trendItem);
  });
}

// Helper function to calculate trend percentage
function calculateTrend(first, last) {
  if (!first || !last || first === 0) return 0;
  return ((last - first) / first) * 100;
}

// === Render Mini Tracks Preview ===
function renderMiniTracksPreview(tracks) {
  const container = document.getElementById('miniTracksPreview');
  if (!container) return;

  if (!tracks || tracks.length === 0) {
    container.innerHTML = '<div class="no-data">No tracks available</div>';
    return;
  }

  console.log('Tracks data for preview:', tracks); // Debug log

  // Take only top 4 tracks for preview
  const previewTracks = tracks.slice(0, 4);
  
  container.innerHTML = '';
  
  previewTracks.forEach((track, index) => {
    const trackItem = document.createElement('div');
    trackItem.className = 'mini-track-item';
    
    // Safely extract track data with fallbacks
    const trackName = track.track_name || track.name || 'Unknown Track';
    const albumName = track.album_name || track.album || 'Unknown Album';
    const releaseYear = track.release_year || 'Unknown';
    const popularity = track.popularity || 0;
    const albumCover = track.album_cover || 'https://via.placeholder.com/40';
    
    const popularityPercent = Math.min(100, Math.max(0, parseInt(popularity) || 0));
    
    // Shorten long track names
    const displayTrackName = trackName.length > 25 
      ? trackName.substring(0, 25) + '...' 
      : trackName;
    
    trackItem.innerHTML = `
      <img src="${albumCover}" 
           alt="${trackName}" 
           class="mini-track-image"
           onerror="this.src='https://via.placeholder.com/40'">
      <div class="mini-track-info">
        <div class="mini-track-name" title="${trackName}">${displayTrackName}</div>
        <div class="mini-track-details">
          <span>${releaseYear}</span>
          <span>${albumName}</span>
        </div>
      </div>
      <div class="track-popularity">
        <span>${popularityPercent}</span>
        <div class="popularity-bar">
          <div class="popularity-fill" style="width: ${popularityPercent}%"></div>
        </div>
      </div>
    `;
    
    // Add click handler to open music links
    trackItem.onclick = () => {
      const spotifyUrl = track.spotify_url || `https://open.spotify.com/search/${encodeURIComponent(trackName)}`;
      window.open(spotifyUrl, '_blank');
    };
    
    container.appendChild(trackItem);
  });
}

// === Render the Main Audio Feature Chart ===
function renderFeatureChart(data, artist) {
  const ctx = document.getElementById("featureChart").getContext("2d");
  if (featureChart) featureChart.destroy();

  const labels = Object.keys(data);
  const values = Object.values(data);

  featureChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: `Audio Features: ${artist}`,
          data: values,
          backgroundColor: "rgba(0, 201, 255, 0.6)",
          borderColor: "rgba(0, 201, 255, 1)",
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: "rgba(146, 254, 157, 0.9)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#00c9ff", font: { size: 14, weight: "bold" } },
        },
        tooltip: {
          backgroundColor: "#161a23",
          titleColor: "#00c9ff",
          bodyColor: "#eee",
          borderColor: "#00c9ff",
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#ddd" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        x: { ticks: { color: "#92fe9d" }, grid: { display: false } },
      },
    },
  });
}

// === Render the Pie Chart for Audio Features ===
function renderPieChart(data, artist) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: `Audio Features (${artist})`,
        data: Object.values(data),
        backgroundColor: [
          "rgba(0, 201, 255, 0.6)",
          "rgba(146, 254, 157, 0.8)",
          "rgba(255, 179, 71, 0.7)",
          "rgba(231, 111, 81, 0.7)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#00c9ff"
          }
        },
        title: {
          display: true,
          text: `Feature Distribution for ${artist}`,
          color: "#00c9ff"
        }
      }
    }
  });
}

// === Render Distribution Chart (Alternative to Box Plot) ===
function renderBoxPlot(data, artist) {
  const ctx = document.getElementById('boxPlotChart').getContext('2d');
  if (boxPlotChart) boxPlotChart.destroy();

  const labels = Object.keys(data);
  const values = Object.values(data);

  // Create range data (simulated distribution)
  const minValues = values.map(val => Math.max(0, val - 0.2));
  const maxValues = values.map(val => Math.min(1, val + 0.2));

  boxPlotChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Minimum Range',
          data: minValues,
          backgroundColor: 'rgba(255, 99, 132, 0.3)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Average Value',
          data: values,
          backgroundColor: 'rgba(0, 201, 255, 0.8)',
          borderColor: 'rgba(0, 201, 255, 1)',
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'Maximum Range',
          data: maxValues,
          backgroundColor: 'rgba(146, 254, 157, 0.3)',
          borderColor: 'rgba(146, 254, 157, 1)',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { 
          labels: { color: "#00c9ff" },
          display: true
        },
        title: {
          display: true,
          text: `Feature Distribution Ranges for ${artist}`,
          color: "#00c9ff",
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          backgroundColor: "#161a23",
          titleColor: "#00c9ff",
          bodyColor: "#eee",
          callbacks: {
            label: function(context) {
              const datasetLabel = context.dataset.label;
              const value = context.parsed.y.toFixed(3);
              return `${datasetLabel}: ${value}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: { 
            color: "#ddd",
            callback: function(value) {
              return value.toFixed(1);
            }
          },
          grid: { color: "rgba(255,255,255,0.05)" },
          title: {
            display: true,
            text: 'Feature Value (0-1)',
            color: '#92fe9d'
          }
        },
        x: { 
          ticks: { color: "#92fe9d" }, 
          grid: { display: false },
          title: {
            display: true,
            text: 'Audio Features',
            color: '#92fe9d'
          }
        },
      },
    }
  });
}

// === Render the Timeline Chart (Songs Count by Year) ===
function renderTimelineChart(timelineData, artist) {
  const ctx = document.getElementById('timelineChart').getContext('2d');
  if (timelineChart) timelineChart.destroy();
  
  // Group songs by year and count them
  const yearCounts = {};
  timelineData.forEach(song => {
    const year = song.release_year;
    if (year && year > 1900) { // Filter out invalid years
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });
  
  const sortedYears = Object.keys(yearCounts).sort((a, b) => a - b);
  const counts = sortedYears.map(year => yearCounts[year]);
  
  timelineChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedYears,
      datasets: [{
        label: `Songs Released by ${artist}`,
        data: counts,
        backgroundColor: 'rgba(146, 254, 157, 0.6)',
        borderColor: 'rgba(146, 254, 157, 1)',
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(0, 201, 255, 0.8)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#00c9ff" } },
        title: {
          display: true,
          text: `${artist} - Songs by Release Year`,
          color: "#00c9ff",
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          backgroundColor: "#161a23",
          titleColor: "#00c9ff",
          bodyColor: "#eee",
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} song(s) in ${context.label}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            color: "#ddd",
            stepSize: 1
          },
          grid: { color: "rgba(255,255,255,0.05)" },
          title: {
            display: true,
            text: 'Number of Songs',
            color: '#92fe9d'
          }
        },
        x: { 
          ticks: { color: "#92fe9d" }, 
          grid: { display: false },
          title: {
            display: true,
            text: 'Release Year',
            color: '#92fe9d'
          }
        },
      },
    }
  });
}

// === Render Popularity Trend Chart (Average Popularity by Year) ===
function renderPopularityTrendChart(timelineData, artist) {
  const ctx = document.getElementById('popularityTrendChart').getContext('2d');
  if (popularityTrendChart) popularityTrendChart.destroy();
  
  // Group songs by year and calculate average popularity
  const yearData = {};
  timelineData.forEach(song => {
    const year = song.release_year;
    const popularity = parseFloat(song.popularity) || 0;
    if (year && year > 1900) {
      if (!yearData[year]) {
        yearData[year] = { total: 0, count: 0, songs: [] };
      }
      yearData[year].total += popularity;
      yearData[year].count += 1;
      yearData[year].songs.push({
        name: song.track_name,
        popularity: popularity
      });
    }
  });
  
  // Calculate averages and prepare data
  const sortedYears = Object.keys(yearData).sort((a, b) => a - b);
  const averagePopularity = sortedYears.map(year => {
    const avg = yearData[year].total / yearData[year].count;
    return Math.round(avg * 100) / 100; // Round to 2 decimal places
  });
  
  // Find peak and low points for annotations
  const maxPopularity = Math.max(...averagePopularity);
  const minPopularity = Math.min(...averagePopularity);
  const maxIndex = averagePopularity.indexOf(maxPopularity);
  const minIndex = averagePopularity.indexOf(minPopularity);
  
  popularityTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedYears,
      datasets: [{
        label: `${artist} - Average Popularity`,
        data: averagePopularity,
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: sortedYears.map((year, index) => {
          if (index === maxIndex) return '#00ff88'; // Peak point
          if (index === minIndex) return '#ff4757'; // Low point
          return '#ff6b6b';
        }),
        pointBorderColor: sortedYears.map((year, index) => {
          if (index === maxIndex) return '#00cc6a'; // Peak point border
          if (index === minIndex) return '#c44569'; // Low point border
          return '#ff6b6b';
        }),
        pointRadius: sortedYears.map((year, index) => {
          if (index === maxIndex || index === minIndex) return 8; // Highlight peak/low
          return 5;
        }),
        pointHoverRadius: 10,
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: { 
          labels: { color: "#00c9ff", font: { size: 14 } }
        },
        title: {
          display: true,
          text: `${artist} - Popularity Evolution Over Time`,
          color: "#00c9ff",
          font: { size: 18, weight: 'bold' }
        },
        tooltip: {
          backgroundColor: "#161a23",
          titleColor: "#00c9ff",
          bodyColor: "#eee",
          borderColor: "#ff6b6b",
          borderWidth: 2,
          callbacks: {
            title: function(context) {
              return `Year: ${context[0].label}`;
            },
            label: function(context) {
              const year = context.label;
              const avg = context.parsed.y;
              const songsInYear = yearData[year].songs.length;
              return [
                `Average Popularity: ${avg}`,
                `Songs Released: ${songsInYear}`,
                '--- Top Songs ---',
                ...yearData[year].songs
                  .sort((a, b) => b.popularity - a.popularity)
                  .slice(0, 3)
                  .map(song => `${song.name}: ${song.popularity}`)
              ];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { 
            color: "#ddd",
            callback: function(value) {
              return value + '%';
            }
          },
          grid: { 
            color: "rgba(255,255,255,0.05)",
            drawBorder: false
          },
          title: {
            display: true,
            text: 'Average Popularity (%)',
            color: '#92fe9d',
            font: { size: 14, weight: 'bold' }
          }
        },
        x: { 
          ticks: { 
            color: "#92fe9d",
            font: { weight: 'bold' }
          }, 
          grid: { 
            color: "rgba(146, 254, 157, 0.1)",
            drawBorder: false
          },
          title: {
            display: true,
            text: 'Release Year',
            color: '#92fe9d',
            font: { size: 14, weight: 'bold' }
          }
        },
      },
      elements: {
        point: {
          hoverBorderWidth: 3
        }
      }
    }
  });
}

// === Render the Timeline Trend Chart ===
function renderTrendChart(timeline, artist) {
  const canvas = document.getElementById("trendChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (trendChart) trendChart.destroy();
  if (!timeline || timeline.length === 0) {
    canvas.parentElement.style.display = "none";
    return;
  }

  canvas.parentElement.style.display = "";

  const labels = timeline.map((x) => x.label);
  const mood = timeline.map((x) => x.mood || 0.5);
  const energy = timeline.map((x) => x.energy);
  const dance = timeline.map((x) => x.danceability);
  const pop = timeline.map((x) => x.popularity);

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Mood",
          data: mood,
          borderColor: "#00c9ff",
          fill: false,
          tension: 0.25,
        },
        {
          label: "Energy",
          data: energy,
          borderColor: "#92fe9d",
          fill: false,
          tension: 0.25,
        },
        {
          label: "Danceability",
          data: dance,
          borderColor: "#ffb347",
          fill: false,
          tension: 0.25,
        },
        {
          label: "Popularity",
          data: pop,
          borderColor: "#e76f51",
          fill: false,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#00c9ff" } },
        title: {
          display: true,
          text: `Trends Across Tracks – ${artist}`,
          color: "#92fe9d",
        },
        tooltip: {
          backgroundColor: "#161a23",
          titleColor: "#00c9ff",
          bodyColor: "#eee",
        },
      },
      scales: {
        x: {
          ticks: { color: "#aaa" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#aaa" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
      },
    },
  });
}

// === Update the Statistic Cards ===
function updateStats(features) {
  document.getElementById("energyValue").textContent =
    features.energy?.toFixed(2) || "--";
  document.getElementById("danceValue").textContent =
    features.danceability?.toFixed(2) || "--";
  document.getElementById("tempoValue").textContent =
    features.tempo?.toFixed(0) || "--";
  document.getElementById("popValue").textContent =
    features.popularity?.toFixed(0) || "--";
}

// === Render Top Tracks Grid ===
function renderTopTracks(tracks) {
  const container = document.querySelector("#topTracks .tracks-grid");
  if (!container) return;

  container.innerHTML = "";
  tracks.forEach((track) => {
    const card = document.createElement("div");
    card.className = "track-card";
    
    // Safely extract track data
    const trackName = track.track_name || track.name || 'Unknown Track';
    const albumCover = track.album_cover || 'https://via.placeholder.com/150';
    const popularity = track.popularity || 0;
    const releaseYear = track.release_year || 'Unknown';
    const spotifyUrl = track.spotify_url || `https://open.spotify.com/search/${encodeURIComponent(trackName)}`;
    const youtubeUrl = track.youtube_url || `https://www.youtube.com/results?search_query=${encodeURIComponent(trackName)}`;
    
    card.innerHTML = `
      <img src="${albumCover}" alt="${trackName}">
      <p><b>${trackName}</b></p>
      <p>Popularity: ${popularity}</p>
      <p>Year: ${releaseYear}</p>
      <div class="links">
        <a target="_blank" href="${spotifyUrl}">Spotify</a>
        <a target="_blank" href="${youtubeUrl}">YouTube</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// === Fetch API Functions ===
async function fetchArtistFeatures(name) {
  const res = await fetch(
    `/api/artist_features?name=${encodeURIComponent(name)}`
  );
  if (!res.ok) throw new Error("Artist not found or data unavailable.");
  return res.json();
}

async function fetchArtistTrends(name) {
  const res = await fetch(
    `/api/artist_trends?name=${encodeURIComponent(name)}`
  );
  if (!res.ok) return null;
  return res.json();
}

async function fetchTopTracks(name) {
  try {
    const res = await fetch(
      `/api/artist_top_tracks?name=${encodeURIComponent(name)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    console.log('Top tracks API response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return null;
  }
}

// === Fetch Artist Timeline Data ===
async function fetchArtistTimeline(name) {
  const res = await fetch(`/api/artist_timeline?name=${encodeURIComponent(name)}`);
  if (!res.ok) return null;
  return res.json();
}

// === Fetch Artist Info from Wikipedia (long description) ===
async function fetchArtistInfo(name) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      name
    )}&prop=extracts|pageimages&exintro=true&explaintext=true&exchars=3000&pithumbsize=300&format=json&origin=*`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Artist info not found online");

    const data = await res.json();
    const page = Object.values(data.query.pages)[0];

    const hero = document.getElementById("heroSection");
    if (hero) hero.style.display = "flex"; // show hero section

    if (document.getElementById("artistImage")) {
      document.getElementById("artistImage").src =
        page.thumbnail?.source || "https://via.placeholder.com/120";
    }
    if (document.getElementById("artistName")) {
      document.getElementById("artistName").textContent = page.title || name;
    }

    const bio = page.extract || "No description available.";

    // If description is long, add "Read More"
    const bioElement = document.getElementById("artistBio");
    if (bioElement) {
      if (bio.length > 1000) {
        bioElement.innerHTML = `
          ${bio.substring(0, 1000)}<span id="moreText" style="display:none;">${bio.substring(1000)}</span>
          <button id="readMoreBtn">Read More</button>
        `;
        document.getElementById("readMoreBtn").addEventListener("click", () => {
          document.getElementById("moreText").style.display = "inline";
          document.getElementById("readMoreBtn").style.display = "none";
        });
      } else {
        bioElement.textContent = bio;
      }
    }
  } catch (err) {
    console.error(err);
    const errorElement = document.getElementById("errorMsg");
    if (errorElement) {
      errorElement.textContent = "Could not fetch artist info from the internet.";
    }
  }
}

// === Handle Search Form Submission ===
document.getElementById("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const artistName = document.getElementById("artistInput").value.trim();
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = "";

  if (!artistName) {
    errorMsg.textContent = "Please enter an artist name.";
    return;
  }

  try {
    // Show loading states for mini sections
    document.getElementById('miniFeatures').innerHTML = '<div class="loading">Loading audio features...</div>';
    document.getElementById('miniTrends').innerHTML = '<div class="loading">Loading trends data...</div>';
    document.getElementById('miniTracksPreview').innerHTML = '<div class="loading">Loading top tracks...</div>';

    // Fetch artist info for hero
    await fetchArtistInfo(artistName);

    const featureData = await fetchArtistFeatures(artistName);
    renderFeatureChart(featureData.features, artistName);
    renderPieChart(featureData.features, artistName);
    renderBoxPlot(featureData.features, artistName);
    updateStats(featureData.features);
    
    // Render mini sections
    renderMiniAudioFeatures(featureData.features);

    const trends = await fetchArtistTrends(artistName);
    if (trends?.timeline) {
      renderTrendChart(trends.timeline, artistName);
      renderMiniTrends(trends.timeline);
    } else {
      document.getElementById('miniTrends').innerHTML = '<div class="no-data">No trend data available</div>';
    }

    const topTracks = await fetchTopTracks(artistName);
    console.log('Top tracks data:', topTracks); // Debug log
    
    if (topTracks?.tracks) {
      renderTopTracks(topTracks.tracks);
      renderMiniTracksPreview(topTracks.tracks);
    } else {
      document.getElementById('miniTracksPreview').innerHTML = '<div class="no-data">No tracks available</div>';
    }

    // Render timeline charts
    const timelineData = await fetchArtistTimeline(artistName);
    if (timelineData?.songs) {
      renderTimelineChart(timelineData.songs, artistName);
      renderPopularityTrendChart(timelineData.songs, artistName);
    }

  } catch (err) {
    errorMsg.textContent = err.message;
    console.error('Search error:', err); // Debug log
    
    // Clear all charts and data
    [featureChart, pieChart, trendChart, timelineChart, popularityTrendChart, boxPlotChart].forEach(chart => {
      if (chart) chart.destroy();
    });
    
    // Clear mini sections
    document.getElementById('miniFeatures').innerHTML = '<div class="no-data">Error loading data</div>';
    document.getElementById('miniTrends').innerHTML = '<div class="no-data">Error loading data</div>';
    document.getElementById('miniTracksPreview').innerHTML = '<div class="no-data">Error loading data</div>';
    
    const tracksGrid = document.querySelector("#topTracks .tracks-grid");
    if (tracksGrid) tracksGrid.innerHTML = "";
  }
});

// === Sidebar Navigation for Sections ===
const sidebarLinks = document.querySelectorAll(".sidebar ul li");
const sections = {
  Dashboard: document.querySelector("#dashboardSection"),
  Trends: document.querySelector(".chart-section"),
  "Top Tracks": document.getElementById("topTracks"),
  About: document.getElementById("aboutSection")
};

// Show only the selected section
sidebarLinks.forEach((link) => {
  link.addEventListener("click", () => {
    sidebarLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    const sectionName = link.textContent;
    Object.entries(sections).forEach(([name, sec]) => {
      if (!sec) return;
      if (name === sectionName) sec.style.display = "block";
      else sec.style.display = "none";
    });
  });
});

// === Set Default Section ===
document.addEventListener("DOMContentLoaded", () => {
  // Initialize mini sections with empty state
  document.getElementById('miniFeatures').innerHTML = '<div class="no-data">Enter an artist name to see features</div>';
  document.getElementById('miniTrends').innerHTML = '<div class="no-data">Enter an artist name to see trends</div>';
  document.getElementById('miniTracksPreview').innerHTML = '<div class="no-data">Enter an artist name to see top tracks</div>';
  
  sidebarLinks[0].click(); // Dashboard
});