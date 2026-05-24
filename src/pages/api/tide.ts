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

    const url = `https://tide-api.open-meteo.com/v1/tide?latitude=${lat}&longitude=${lon}&hourly=tide_height&daily=tide_height_max,tide_height_min&timezone=auto&forecast_days=3`;

    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return new Response(JSON.stringify({ error: `Tide API error: ${res.status} ${errorText}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();

    if (!data.hourly || !data.hourly.tide_height) {
      return new Response(JSON.stringify({ error: 'No tide data available for this location' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch tide data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
