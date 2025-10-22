'use client';

import Script from 'next/script';

export function YandexMetrika() {
  return (
    <>
      {/* Yandex.Metrika counter */}
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104604562', 'ym');

            ym(104604562, 'init', {
              ssr:true,
              webvisor:false,
              clickmap:true,
              ecommerce:"dataLayer",
              accurateTrackBounce:true,
              trackLinks:true,
              triggerEvent:false,
              informer:false
            });
          `,
        }}
      />
      <noscript>
        <div>
          <img
            src="https://mc.yandex.ru/watch/104604562"
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
      {/* /Yandex.Metrika counter */}
    </>
  );
}
