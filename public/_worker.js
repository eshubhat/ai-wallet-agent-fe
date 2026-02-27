export default {
  async fetch(request, env, ctx) {
    // Determine the URL path requested by the client
    const url = new URL(request.url);

    // If there is an extension (like .js, .css, .png), try to fetch the static asset
    if (url.pathname.includes('.')) {
      try {
        return await env.ASSETS.fetch(request);
      } catch (e) {
        // Fallback or ignore if the asset is not found
      }
    }

    // For all other requests (i.e. React Router paths like /auth, /dashboard),
    // rewrite the request to return the static index.html file so React can handle the routing.
    return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
  }
};
