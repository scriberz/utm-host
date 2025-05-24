;(function(){
  const SHORT_DOMAIN = 'i.gps-glaz.ru/i/';
  const TILDA_COOKIE = 'TILDAUTM=';

  function getUTMFromCookie() {
    const match = document.cookie.split('; ').find(row => row.startsWith(TILDA_COOKIE));
    if (!match) return '';
    try {
      return decodeURIComponent(match.substring(TILDA_COOKIE.length));
    } catch (e) {
      return '';
    }
  }

  function parseSlug(url) {
    return url.split('/').pop().toLowerCase();
  }

  function parseUTMString(utmString) {
    return new URLSearchParams(utmString);
  }

  window.addEventListener('click', function(e) {
    const el = e.target.closest('a, [data-url], [onclick]');
    if (!el) return;

    let url = el.getAttribute('href')
             || el.getAttribute('data-url')
             || (el.getAttribute('onclick')||'').match(/https?:\/\/[^\']+/)?.[0];

    if (!url || !url.includes(SHORT_DOMAIN)) return;

    const slug = parseSlug(url);
    const utmParams = parseUTMString(getUTMFromCookie());

    if (!utmParams.has('utm_content')) {
      utmParams.set('utm_content', /google\.|yandex\.|bing\.|duckduckgo\./i.test(document.referrer) ? 'search' : 'directlink');
    }

    const sep = url.includes('?') ? '&' : '?';
    url += sep + utmParams.toString();
    el.setAttribute('href', url);
  }, true);
})();
