# Championjay Technology portfolio

A responsive, framework-free portfolio built with semantic HTML, CSS and JavaScript. The opening is a Three.js room: a character enters through the doorway, walks to the desk and sits down while the camera follows. The room's walls carry the portfolio story; move the pointer horizontally, drag, use the wall controls, or press the arrow keys to look around. The project cards, contact details and social links are configured in one place.

## Run locally

Open `index.html` in a browser, or serve this folder with any static file server. For example:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`. The Three.js scene is an ES module and should be tested over HTTP rather than from a `file://` URL. Three.js, GSAP, ScrollTrigger and the web fonts load from CDNs; a static studio fallback remains available if the 3D module cannot load.



## Host on Namecheap cPanel

This is a static website; it does not need Node.js or a database. For an easy upload, use `championjay-cpanel-upload.zip`:

1. In your Namecheap account, open **Hosting List → Go to cPanel → File Manager**.
2. Open `public_html` for your primary domain. If hosting an addon domain, use the document root shown for that domain instead.
3. Upload `championjay-cpanel-upload.zip` and extract it in that document root. Make sure `index.html` is directly inside the document root, alongside the `css`, `js`, and `assets` folders—not inside an extra `portfolio` folder.
4. In cPanel, enable the domain's SSL certificate (for example, **SSL/TLS Status → Run AutoSSL**). Visit the HTTPS version of your domain and test the room, wall controls, contact links, and images.

The archive contains only the website files; this README is not part of the upload. The contact form opens the visitor's email application and does not send submissions to a server. Three.js, GSAP, and the fonts load from external CDNs, so those services must be reachable by visitors.

## Publish on GitHub Pages

The site files live at the root of `https://github.com/championjay0007/portfolio`. After pushing the `main` branch, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, then save. GitHub Pages will publish the site at `https://championjay0007.github.io/portfolio/`; allow a few minutes for the first deployment.

## Personalize

1. The contact email is set to `championjaytech@gmail.com` in `js/main.js`. The phone and WhatsApp number is set to `2349138370625` (international digits, without `+`); update `portfolioConfig.whatsappNumber` to change it. Add verified social profile URLs when available. The social handle shown in the portfolio is `@championjaytech`.
2. Edit the `projects` array in the same file. Each project supports `title`, `description`, `technologies`, `thumbnail`, `demoUrl` and `sourceUrl`, along with its category and generated-art style. Use an empty string until a real image or URL is available.
3. Replace the dash placeholders in the achievements section in `index.html` only with verified figures.
4. Update the copy and social platforms to match the final brand.
5. To use your own screen photos, set paths such as `"./assets/images/skills.jpg"` in the `screenArtworkSources` map near the top of `js/three-scene.js`. The map supports `about`, `contact`, and `hello` (the desk monitor). The Studio headline is painted directly onto its wall. The Services wall uses nine individual 3D tiles arranged in a three-by-three grid, each with a matching dimensional icon and raised label.
6. The Studio back wall pairs the oversized portrait with its unframed headline; the pet photo has its own framed place on the side wall. Replace `assets/images/championjay-portrait.png` or `assets/images/studio-dog.png` to change them.
7. Two locally stored Unsplash images add photographic artwork to the Skills & Solutions and Contact displays: `wall-skills.jpg` (photo-1519389950473-47ba0277781c) and `wall-contact.jpg` (photo-1521737711867-e3b97375f902). The Mission & Vision display has its own stored artwork. Replace these files or update `screenArtworkSources` to use different images.
8. Use the `LIGHTS ON` control in the room to change the studio into its brighter, colorful palette; it toggles back to the original dark studio mood with `LIGHTS OFF`.

The rear Studio wall pairs the oversized portrait with a client-focused headline and subheading painted directly onto the wall—no frame or panel. The chair back also carries an embroidered-style "OPEN TO WORK / WITH YOU" message. After the character sits, the wall's kicker and headline reveal first, followed by a light sweep and supporting copy, telling a short story from idea to finished digital product. The one-time sequence respects reduced-motion preferences and remains readable in both lighting modes. The Services wall presents nine individual service tiles in a side-by-side 3D grid; each tile has a service-specific 3D icon, a raised label, and a softly bevelled metal finish. If the external typeface cannot load, the previous illustrated wall display remains as a fallback. Mission & Vision and Skills & Solutions have their own framed displays on the side walls; email, phone/WhatsApp, and social contact details have a separate, icon-led frame on the Contact wall. The pet photo is framed beside the Skills display, with a matching mobile viewpoint. The studio is finished with floral corner arrangements and a side table. Zoom with the on-screen plus/minus/reset controls, mouse wheel over the room, two-finger pinch, or the `+`, `-`, and `0` keys. The full About Me story, philosophy, services, mission and vision are also available in the accessible page content.

The contact form validates its fields and opens a prefilled email in the visitor's mail app. It does not send data to a server. A backend endpoint can be added if server-side form delivery is required.

## Accessibility and performance

- Keyboard-accessible navigation, project details, form controls and skip link.
- Reduced-motion support skips the arrival and wall-copy animations and renders a static seated character.
- Three.js rendering pauses when the room is off-screen or the tab is hidden; pixel ratio and shadow quality are reduced on mobile.
- CSS artwork keeps project previews intact without external image assets. Custom thumbnails use lazy-loaded images with a generated-art fallback.
