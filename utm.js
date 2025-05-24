;(function(){
  const SHORT_DOMAIN = 'i.gps-glaz.ru/i/';
  const TILDA_COOKIE = 'TILDAUTM=';

  function getRawTildaUTM() {
    const match = document.cookie.split('; ').find(row => row.startsWith(TILDA_COOKIE));
    return match ? decodeURIComponent(match.substring(TILDA_COOKIE.length)) : '';
  }

  function parseTildaUTM(raw) {
    const params = new URLSearchParams();
    raw.split('|||').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k && v) params.set(k.trim(), v.trim());
    });
    return params;
  }

  function ensureContent(utmParams) {
    if (!utmParams.has('utm_content')) {
      const ref = document.referrer;
      const content = /google\.|yandex\.|bing\.|duckduckgo\./i.test(ref) ? 'search' : 'directlink';
      utmParams.set('utm_content', content);
    }
  }

  window.addEventListener('click', function(e) {
    const el = e.target.closest('a, [data-url], [onclick]');
    if (!el) return;

    let url = el.getAttribute('href')
             || el.getAttribute('data-url')
             || (el.getAttribute('onclick')||'').match(/https?:\/\/[^\']+/)?.[0];

    if (!url || !url.includes(SHORT_DOMAIN)) return;

    const raw = getRawTildaUTM();
    if (!raw) return;

    const utmParams = parseTildaUTM(raw);
    ensureContent(utmParams);

    try {
      const parsed = new URL(url);
      for (const [k, v] of utmParams.entries()) {
        parsed.searchParams.set(k, v);
      }
      url = parsed.toString();
      console.log('[TILDAUTM FINAL URL]', url);
      el.setAttribute('href', url);
    } catch (err) {
      console.warn('UTM rewrite error:', err);
    }
  }, true);
})();
