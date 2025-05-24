;(function(){
  const SHORT_DOMAIN = 'i.gps-glaz.ru/i/';
  const UTM_STORAGE_KEY = 'GPSGLAZ_UTM';

  const SLUG_CAMPAIGN = {
    ozon: 'vendor_org_98506',
    wb: '281702-id-site',
    ym: 'market-site'
  };

  function getCurrentUTMFromURL() {
    const p = new URLSearchParams(window.location.search);
    const utm = new URLSearchParams();
    for (const [k, v] of p.entries()) {
      if (k.toLowerCase().startsWith('utm_')) utm.set(k, v);
    }
    return utm.toString();
  }

  function getUTMFromLocalStorage() {
    return localStorage.getItem(UTM_STORAGE_KEY) || '';
  }

  function saveUTMToLocalStorage(utmString) {
    if (utmString) localStorage.setItem(UTM_STORAGE_KEY, utmString);
  }

  function mergeUTM(primary, fallback) {
    const result = new URLSearchParams(fallback);
    for (const [k, v] of new URLSearchParams(primary)) {
      result.set(k, v);
    }
    return result;
  }

  function getGuaranteedUTM(slug = '') {
    const utm = new URLSearchParams();
    utm.set('utm_source', 'site');
    utm.set('utm_medium', 'mpbutton');
    utm.set('utm_content', /google\.|yandex\.|bing\.|duckduckgo\./i.test(document.referrer) ? 'search' : 'directlink');

    for (const [part, camp] of Object.entries(SLUG_CAMPAIGN)) {
      if (slug.includes(part)) {
        utm.set('utm_campaign', camp);
        break;
      }
    }

    utm.set('af_sub1', slug);
    utm.set('af_channel', 'site');
    utm.set('c', utm.get('utm_campaign') || '');

    return utm;
  }

  window.addEventListener('DOMContentLoaded', () => {
    const urlUTM = getCurrentUTMFromURL();
    if (urlUTM) saveUTMToLocalStorage(urlUTM);
  });

  window.addEventListener('click', e => {
    const el = e.target.closest('a, [data-url], [onclick]');
    if (!el) return;

    let url = el.getAttribute('href')
            || el.getAttribute('data-url')
            || (el.getAttribute('onclick')||'').match(/https?:\/\/[^\']+/)?.[0];
    if (!url || !url.includes(SHORT_DOMAIN)) return;

    const slug = url.split('/').pop().toLowerCase();

    const urlUTM = getCurrentUTMFromURL();
    const storedUTM = getUTMFromLocalStorage();
    let base = mergeUTM(urlUTM, storedUTM);

    if (![...base.keys()].some(k => k.startsWith('utm_'))) {
      base = getGuaranteedUTM(slug);
    }

    const ref = document.referrer;
    const content = /google\.|yandex\.|bing\.|duckduckgo\./i.test(ref) ? 'search' : 'directlink';
    base.delete('utm_content');
    base.set('utm_content', content);

    base.set('utm_source', 'site');
    base.set('utm_medium', 'mpbutton');

    for (const [part, camp] of Object.entries(SLUG_CAMPAIGN)) {
      if (slug.includes(part)) {
        base.set('utm_campaign', camp);
        base.set('c', camp);
        break;
      }
    }

    base.set('af_sub1', slug);
    base.set('af_channel', 'site');

    try {
      const parsed = new URL(url);
      for (const [k, v] of base.entries()) {
        parsed.searchParams.set(k, v);
      }
      url = parsed.toString();
    } catch (err) {
      console.warn('UTM script error:', err);
    }

    el.setAttribute('href', url);
  }, true);
})();
