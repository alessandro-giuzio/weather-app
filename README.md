# Weather App

A modern, responsive weather forecast app built with [Astro](https://astro.build/), [Vue 3](https://vuejs.org/), and [Tailwind CSS](https://tailwindcss.com/). Get current and multi-day weather forecasts for any city, with a beautiful UI and PWA support.

---

## Features

- 🌤️ Search for any city and get current weather
- 📅 3-day forecast with icons and details
- 📍 Responsive design for mobile and desktop
- 🎨 Clean, modern UI with Tailwind CSS
- ⚡ Fast, static site built with Astro
- 🖼️ Weather condition icons from WeatherAPI
- 🦾 PWA support (installable on mobile/desktop)

---

## Screenshots

<!-- Add screenshots here -->

![Screenshot 1](/public/assets/images/weatherAPP.png)

---

## Tech Stack

- [Astro](https://astro.build/) (static site generator)
- [Vue 3](https://vuejs.org/) (UI components)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first CSS)
- [WeatherAPI](https://www.weatherapi.com/) (weather data)

---

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/alessandro-giuzio/weather-app.git
cd weather-app
```

### 2. Install dependencies

```sh
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```
PUBLIC_WEATHER_API_KEY=your_weatherapi_key_here
```

Get your free API key from [WeatherAPI](https://www.weatherapi.com/).

### 4. Run locally

```sh
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321) in your browser.

---

## Deployment

1. **Build the app:**

```sh
npm run build
```

2. **Deploy the `dist/` folder** to your static host (Vercel, Netlify, GitHub Pages, etc.)
3. **Set the `PUBLIC_WEATHER_API_KEY`** in your host's environment variables dashboard.

---

## PWA Support

- The app is installable on mobile and desktop.
- Add to home screen for a native-like experience.

---

## Credits

- [Astro](https://astro.build/)
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WeatherAPI](https://www.weatherapi.com/)

---

## License

MIT
