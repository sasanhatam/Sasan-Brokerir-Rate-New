/**
 * Embeddable Widget Script for NerkhTrack
 * 
 * This script automatically finds the base URL of the application 
 * and renders widgets into containers with class "nerkh-widget".
 */
(function() {
  // 1. Determine the Base URL of the application
  // We do this by looking at the 'src' of the script tag that loaded this file.
  // This ensures it works even when embedded on external domains.
  let appUrl = '';
  try {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    if (currentScript && currentScript.src) {
      const url = new URL(currentScript.src);
      appUrl = url.origin;
    }
  } catch (e) {
    console.error('NerkhTrack Widget: Could not determine app origin.', e);
    return;
  }

  // 2. Find all widget containers
  const containers = document.querySelectorAll('.nerkh-widget');

  containers.forEach(container => {
    // Prevent double-initialization
    if (container.shadowRoot) return;

    // 3. Read configuration from data attributes
    const type = container.getAttribute('data-type') || 'grid';
    const assets = container.getAttribute('data-assets') || 'usd,gold_18k,btc';
    const theme = container.getAttribute('data-theme') || 'light';

    // 4. Create Shadow DOM for isolation
    const shadow = container.attachShadow({ mode: 'open' });

    // 5. Create Iframe
    const iframe = document.createElement('iframe');
    
    // Construct the widget URL
    const widgetUrl = new URL(appUrl);
    widgetUrl.searchParams.set('mode', 'widget');
    widgetUrl.searchParams.set('type', type);
    widgetUrl.searchParams.set('assets', assets);
    widgetUrl.searchParams.set('theme', theme);

    iframe.src = widgetUrl.toString();
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    
    // Set height based on type (approximate defaults)
    if (type === 'ticker') {
      iframe.style.height = '60px';
    } else if (type === 'table') {
      iframe.style.height = '400px';
    } else {
      iframe.style.height = '450px'; // Grid
    }

    shadow.appendChild(iframe);
  });
})();
