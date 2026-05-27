import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { lat, lon } = await request.json();

    if (lat == null || lon == null) {
      return new Response(JSON.stringify({ error: 'Latitude and longitude are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wind_wave_height,swell_wave_height,wave_direction,wave_period&daily=wave_height_max,wind_wave_height_max,swell_wave_height_max&timezone=auto&forecast_days=3`;

    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return new Response(JSON.stringify({ error: `Marine API error: ${res.status} ${errorText}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();

    const hasData = data.hourly?.wave_height?.some((v: number | null) => v !== null);
    if (!hasData) {
      return new Response(JSON.stringify({ error: 'No marine data available for this location' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch marine data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
