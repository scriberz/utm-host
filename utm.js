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

  function forceContent(utmParams) {
    const ref = document.referrer;
    const content = /google\.|yandex\.|bing\.|duckduckgo\./i.test(ref) ? 'search' : 'directlink';
    utmParams.set('utm_content', content); // 💥 всегда перезаписываем
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
    forceContent(utmParams); // 💥 utm_content точно будет

    try {
      const parsed = new URL(url);
      // 💥 удаляем ВСЕ существующие utm_
      parsed.search = parsed.search.replace(/([?&])utm_[^=]+=[^&]+/gi, '$1').replace(/[?&]$/, '');

      // добавляем актуальные метки
      for (const [k, v] of utmParams.entries()) {
        parsed.searchParams.set(k, v);
      }

      url = parsed.toString();
      console.log('[FINAL URL with content]', url);
      el.setAttribute('href', url);
    } catch (err) {
      console.warn('UTM build error:', err);
    }
  }, true);
})();
