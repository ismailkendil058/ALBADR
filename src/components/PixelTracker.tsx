import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { settingsService } from '@/services/settingsService';

declare global {
    interface Window {
        fbq: any;
        _fbq: any;
        ttq: any;
    }
}

export const PixelTracker = () => {
    const location = useLocation();
    const [pixelsLoaded, setPixelsLoaded] = useState(false);

    useEffect(() => {
        const loadPixels = async () => {
            try {
                const settings = await settingsService.getSettings();
                const fbPixelId = settings.find(s => s.key === 'facebook_pixel_id')?.value;
                const tiktokPixelId = settings.find(s => s.key === 'tiktok_pixel_id')?.value;

                // Initialize Facebook Pixel
                if (fbPixelId && !window.fbq) {
                    (function (f, b, e, v, n, t, s) {
                        if (f.fbq) return; n = f.fbq = function () {
                            n.callMethod ?
                            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                        };
                        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                        n.queue = []; t = b.createElement(e); t.async = !0;
                        t.src = v; s = b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t, s)
                    })(window, document, 'script',
                        'https://connect.facebook.net/en_US/fbevents.js');

                    window.fbq('init', fbPixelId);
                }

                // Initialize TikTok Pixel
                if (tiktokPixelId && !window.ttq) {
                    (function (w, d, t) {
                        w.ttq = w.ttq || []; var n = w.ttq; n.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"], n.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < n.methods.length; i++)n.setAndDefer(n, n.methods[i]); n.instance = function (t) { for (var e = n._i[t] || [], i = 0; i < n.methods.length; i++)n.setAndDefer(e, n.methods[i]); return e }, n.load = function (e, i) { var a = "https://analytics.tiktok.com/i18n/pixel/events.js"; n._i = n._i || {}, n._i[e] = [], n._i[e]._u = a, n._t = n._t || {}, n._t[e] = +new Date, n._o = n._o || {}, n._o[e] = i || {}; var o = document.createElement("script"); o.type = "text/javascript", o.async = !0, o.src = a + "?sdkid=" + e + "&lib=" + t; var r = document.getElementsByTagName("script")[0]; r.parentNode.insertBefore(o, r) };

                        n.load(tiktokPixelId);
                    })(window, document, 'ttq');
                }

                setPixelsLoaded(true);
            } catch (error) {
                console.error("Failed to load pixel settings", error);
            }
        };

        loadPixels();
    }, []);

    // Track PageView on route change
    useEffect(() => {
        if (!pixelsLoaded) return;

        // Facebook PageView
        if (window.fbq) {
            window.fbq('track', 'PageView');
        }

        // TikTok PageView
        if (window.ttq) {
            window.ttq.page();
        }
    }, [location.pathname, pixelsLoaded]);

    return null;
};
