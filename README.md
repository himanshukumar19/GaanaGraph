# Artist Music Feature Analytics Web App

## Overview

This project is a web application that allows users to search for a music artist and visualize detailed audio features and trends of their songs. Features such as danceability, mood (valence), energy, loudness, tempo, and more are aggregated from a dataset of songs and displayed interactively on the frontend with visual graphs.

The application consists of two main parts:
- **Backend:** A Node.js Express server that loads a CSV dataset of songs, filters by artist, computes average audio features, and serves those features via a REST API.
- **Frontend:** A responsive web interface built with HTML, CSS, and JavaScript using Chart.js for dynamic bar charts. It fetches data from the backend API and renders beautiful audio feature visualizations based on user input.

---

## Features

- Search artists by name and display their averaged audio features.
- Interactive bar charts showing multiple audio features per artist.
- Error handling for artists not found.
- Responsive and modern UI design.
- Easy to extend for adding more features like comparison, trend timelines, playlists.

---

## Project Structure
```
artist-music-analytics/
├── backend/
│ ├── music_dataset/
│ │ └── SpotifyFeatures.csv # Dataset CSV file
│ ├── node_modules/
│ ├── package.json
│ └── server.js # Node.js Express backend
├── frontend/
│ ├── index.html # Main frontend HTML file
│ ├── styles.css # CSS for styling
│ └── script.js # JavaScript for frontend logic and charts
└── README.md # This file
```

---

## How It Works

1. The **backend** loads the CSV dataset at startup and caches the data in memory.
2. When the frontend requests `/api/artist_features?name=ArtistName`, the backend filters all songs by that artist.
3. It calculates average values for key audio features like danceability, energy, valence, loudness, etc.
4. Sends the computed audio features back as JSON.
5. The **frontend** receives the features and draws animated bar charts using Chart.js.
6. Users see a responsive, interactive visualization of the artist’s music profile.

---

## Setup Instructions

### Backend Setup

1. Navigate to the backend folder:
   cd backend

2. Install dependencies:


3. Ensure your dataset CSV (`SpotifyFeatures.csv`) is located in the folder:


4. Run the server:
   node server.js



5. Server runs on `http://localhost:3000`.

### Frontend Setup

1. Open `frontend/index.html` in your web browser to load the interface.

2. The frontend automatically calls the backend API at `http://localhost:3000/api/artist_features`.

---

## How to Use

- Enter an artist’s name in the search box.
- Hit the "Search" button.
- The app will display a bar chart visualizing the artist’s average audio features.
- If no artist is found, a friendly error message will appear.

---

## Future Improvements

- Add user authentication and favorite artist saving.
- Track song trends over time or albums.
- Compare multiple artists side-by-side.
- Enable audio preview integration from Spotify or YouTube.
- Add playlist analysis and geographical popularity.

---

## Contributing

Contributions are welcome! Please:

- Fork the repo
- Create a feature branch
- Test your changes locally
- Submit a PR for review

---

## Technologies Used

- Node.js + Express for backend API
- csv-parser for CSV data processing
- CORS for backend-frontend cross-origin
- HTML5, CSS3, JavaScript for frontend
- Chart.js for data visualization

---

## Contact

For questions or support, please reach out via GitHub issues or contact the project maintainer.

---

Thank you for checking out this project! 🎵
# GaAAAAANA
