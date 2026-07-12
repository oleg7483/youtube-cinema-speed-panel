// ==UserScript==
// @name                YouTube Cinema Speed Panel
// @name:ru             Панель управления скоростью YouTube в режиме кинотеатра
// @namespace           https://github.com/oleg-zubkov
// @version             2.3
// @description         Cinema mode for YouTube: speed control panel (bottom center on hover), night mode, edge glow, hides sidebar/comments/search
// @description:ru      Режим кинотеатра для YouTube: панель скорости, ночной режим, свечение краёв, скрытие сайдбара/комментариев/поиска
// @author              Олег Зубков
// @copyright           2026, Олег Зубков
// @license             MIT
// @homepageURL         https://github.com/oleg-zubkov/youtube-cinema-speed-panel
// @supportURL          https://github.com/oleg-zubkov/youtube-cinema-speed-panel/issues
// @match               https://www.youtube.com/*
// @match               https://youtube.com/*
// @grant               GM_addStyle
// @run-at              document-end
// @icon                https://www.youtube.com/favicon.ico
// ==/UserScript==

(function () {
    'use strict';

    class CinemaModePro {
        constructor() {
            this.videoElement = null;
            this.hideTimeout = null;
            this.observer = null;
            this.speedContainer = null;
            this.canvas = null;
            this.ctx = null;
            this.glowTimer = null;
            this.nightMode = false;
            this.stretched = false;
            this.glowWarned = false;
            this.init();
        }

        init() {
            this.injectStyles();
            this.hideElements();
            this.waitForVideo();
            this.setupObservers();
            this.setupNavigation();
        }

        injectStyles() {
            const styles = [
                'video { outline: none !important; border: none !important }',
                '.html5-video-container { background: #000 !important; outline: none !important }',
                '#movie_player { outline: none !important; overflow: visible !important }',
                '#movie_player video { box-shadow: inset 0 0 100px -25px rgba(0,0,0,0.7) }',
                '.cinema-speed-container { position: fixed; bottom: 250px; left: 50%; transform: translateX(-50%); z-index: 99999; display: flex; flex-direction: column; align-items: center }',
                '.cinema-speed-bar { display: flex; align-items: center; gap: 5px; padding: 8px 14px; background: rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; opacity: 0.5; transition: opacity 0.35s ease, transform 0.35s ease }',
                '.cinema-speed-bar:hover { opacity: 1 }',
                '.cinema-speed-bar.hidden { opacity: 0; transform: translateY(24px); pointer-events: none }',
                '.cinema-speed-bar .cinema-speed-btn { padding: 5px 10px; border: 1px solid rgba(0,212,255,0.35); background: rgba(0,212,255,0.12); color: #00d4ff; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.15s }',
                '.cinema-speed-bar .cinema-speed-btn:hover { background: rgba(0,212,255,0.3) }',
                '.cinema-speed-bar .cinema-speed-btn.active { background: rgba(0,255,0,0.25); border-color: #00ff00; color: #00ff00 }',
                '.cinema-speed-label { color: #aaa; font-size: 12px; font-weight: bold; margin-right: 4px }',
                '.cinema-speed-value { color: #00ff00; font-size: 12px; font-weight: bold; margin-left: 6px }',
                '.cinema-speed-btn.night-btn { border-color: rgba(180,0,255,0.35); background: rgba(180,0,255,0.12); color: #c44dff }',
                '.cinema-speed-btn.night-btn:hover { background: rgba(180,0,255,0.3) }',
                '.cinema-speed-btn.night-btn.active { background: rgba(255,200,0,0.2); border-color: #ffcc00; color: #ffcc00 }',
                '.cinema-speed-btn.stretch-btn { border-color: rgba(255,140,0,0.35); background: rgba(255,140,0,0.12); color: #ff8c00 }',
                '.cinema-speed-btn.stretch-btn:hover { background: rgba(255,140,0,0.3) }',
                '.cinema-speed-btn.stretch-btn.active { background: rgba(255,140,0,0.3); border-color: #ff8c00; color: #ff8c00 }',
                'video.night-mode { opacity: 0.6 !important }',
                '.html5-video-container.night-mode { filter: contrast(1.1) saturate(1.2) !important }',
                'video.stretched { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; object-fit: contain !important; z-index: 99998 !important; background: #000 !important }',
                'video.stretched.night-mode { opacity: 1 !important; filter: contrast(1.1) saturate(1.2) !important }',

            ].join('\n');
            GM_addStyle(styles);
        }

        isWatchPage() {
            return window.location.pathname === '/watch';
        }

        hideElements() {
            var allSelectors = [
                '#secondary', '#comments',
                '#search', '#search-input', '#voice-search-button', 'ytd-searchbox',
                '#center', '#search-form', '#search-container', '#masthead-search-terms',
                'input#search', '[aria-label="Search"]', '[aria-label="Search YouTube"]',
                '[placeholder="Search"]', '[placeholder="Search YouTube"]'
            ];
            var hidden = this.isWatchPage();
            for (var i = 0; i < allSelectors.length; i++) {
                var els = document.querySelectorAll(allSelectors[i]);
                for (var j = 0; j < els.length; j++) {
                    if (hidden) {
                        els[j].style.setProperty('display', 'none', 'important');
                    } else {
                        els[j].style.removeProperty('display');
                    }
                }
            }
        }

        waitForVideo() {
            var self = this;
            var check = function () {
                var video = document.querySelector('video');
                if (video) {
                    self.videoElement = video;
                    self.createSpeedBar();
                    self.startEdgeGlow();
                } else {
                    setTimeout(check, 500);
                }
            };
            check();
        }

        setupObservers() {
            var self = this;
            var debounce = null;
            this.observer = new MutationObserver(function () {
                if (debounce) return;
                debounce = setTimeout(function () { debounce = null; }, 500);
                self.hideElements();
                var video = document.querySelector('video');
                if (video && video !== self.videoElement) {
                    self.stopEdgeGlow();
                    self.videoElement = video;
                    self.createSpeedBar();
                    self.startEdgeGlow();
                } else if (!video) {
                    self.stopEdgeGlow();
                    self.removeSpeedBar();
                    self.videoElement = null;
                }
            });
            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        setupNavigation() {
            var self = this;
            window.addEventListener('yt-navigate-finish', function () {
                self.hideElements();
                if (!self.isWatchPage()) {
                    self.stopEdgeGlow();
                    self.removeSpeedBar();
                    self.videoElement = null;
                } else {
                    self.waitForVideo();
                }
            });
        }

        removeSpeedBar() {
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
            }
            if (this.speedContainer) {
                this.speedContainer.remove();
                this.speedContainer = null;
            }
        }

        createSpeedBar() {
            this.removeSpeedBar();

            var self = this;
            var container = document.createElement('div');
            container.className = 'cinema-speed-container';
            container.id = 'cinema-speed-container';
            this.speedContainer = container;

            var bar = document.createElement('div');
            bar.className = 'cinema-speed-bar';
            bar.id = 'cinema-speed-bar';

            var label = document.createElement('span');
            label.className = 'cinema-speed-label';
            label.textContent = 'Speed:';
            bar.appendChild(label);

            var speeds = [1, 1.25, 1.5, 1.75, 2, 2.2];
            for (var i = 0; i < speeds.length; i++) {
                var btn = document.createElement('button');
                btn.className = 'cinema-speed-btn';
                btn.textContent = speeds[i].toFixed(2) + 'x';
                btn.dataset.speed = speeds[i].toString();
                bar.appendChild(btn);
            }

            var nightBtn = document.createElement('button');
            nightBtn.className = 'cinema-speed-btn night-btn';
            nightBtn.textContent = 'Night';
            nightBtn.dataset.night = '1';
            bar.appendChild(nightBtn);

            var stretchBtn = document.createElement('button');
            stretchBtn.className = 'cinema-speed-btn stretch-btn';
            stretchBtn.textContent = 'Stretch';
            stretchBtn.dataset.stretch = '1';
            bar.appendChild(stretchBtn);

            var val = document.createElement('span');
            val.className = 'cinema-speed-value';
            val.id = 'cinema-speed-value';
            val.textContent = '1.00x';
            bar.appendChild(val);

            container.appendChild(bar);
            document.body.appendChild(container);

            container.addEventListener('click', function (e) {
                var target = e.target.closest('.cinema-speed-btn');
                if (!target || !self.videoElement) return;
                if (target.dataset.night) {
                    self.nightMode = !self.nightMode;
                    target.classList.toggle('active', self.nightMode);
                    self.videoElement.classList.toggle('night-mode', self.nightMode);
                    var vc = self.videoElement.closest('.html5-video-container');
                    if (vc && !self.stretched) vc.classList.toggle('night-mode', self.nightMode);
                    return;
                }
                if (target.dataset.stretch) {
                    self.stretched = !self.stretched;
                    target.classList.toggle('active', self.stretched);
                    self.videoElement.classList.toggle('stretched', self.stretched);
                    var vc2 = self.videoElement.closest('.html5-video-container');
                    if (vc2) vc2.classList.toggle('night-mode', self.nightMode && !self.stretched);
                    return;
                }
                var speed = parseFloat(target.dataset.speed);
                if (!speed) return;
                self.videoElement.playbackRate = speed;
                var btns = bar.querySelectorAll('.cinema-speed-btn');
                for (var k = 0; k < btns.length; k++) {
                    if (!btns[k].dataset.night) btns[k].classList.remove('active');
                }
                target.classList.add('active');
                var valEl = document.getElementById('cinema-speed-value');
                if (valEl) valEl.textContent = speed.toFixed(2) + 'x';
            });

            var curSpeed = this.videoElement ? this.videoElement.playbackRate : 1;
            var allBtns = bar.querySelectorAll('.cinema-speed-btn');
            for (var m = 0; m < allBtns.length; m++) {
                if (parseFloat(allBtns[m].dataset.speed) === curSpeed) {
                    allBtns[m].classList.add('active');
                }
            }

            var showBar = function () {
                bar.classList.remove('hidden');
                clearTimeout(self.hideTimeout);
            };

            var startHideTimer = function () {
                clearTimeout(self.hideTimeout);
                self.hideTimeout = setTimeout(function () {
                    bar.classList.add('hidden');
                }, 5000);
            };

            container.addEventListener('mouseenter', showBar);
            container.addEventListener('mouseleave', startHideTimer);

            setTimeout(startHideTimer, 100);
        }

        startEdgeGlow() {
            this.stopEdgeGlow();
            if (!this.videoElement) return;

            var self = this;

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
            this.glowWarned = false;

            var sample = function () {
                if (!self.videoElement || !self.ctx) {
                    self.glowTimer = setTimeout(sample, 500);
                    return;
                }
                if (self.videoElement.paused || self.videoElement.readyState < 2) {
                    self.glowTimer = setTimeout(sample, 1000);
                    return;
                }
                try {
                    var vw = self.videoElement.videoWidth;
                    var vh = self.videoElement.videoHeight;
                    if (vw < 8 || vh < 8) {
                        self.glowTimer = setTimeout(sample, 500);
                        return;
                    }

                    self.canvas.width = 8;
                    self.canvas.height = 8;
                    self.ctx.drawImage(self.videoElement, 0, 0, 8, 8);
                    var d = self.ctx.getImageData(0, 0, 8, 8).data;

                    var tr = 0, tg = 0, tb = 0;
                    var br = 0, bg = 0, bb = 0;
                    for (var i = 0; i < 8; i++) {
                        var o = i * 4;
                        tr += d[o]; tg += d[o + 1]; tb += d[o + 2];
                        var bo = (56 + i) * 4;
                        br += d[bo]; bg += d[bo + 1]; bb += d[bo + 2];
                    }
                    tr /= 8; tg /= 8; tb /= 8;
                    br /= 8; bg /= 8; bb /= 8;

                    var lr = 0, lg = 0, lb = 0;
                    var rr = 0, rg = 0, rb = 0;
                    for (var j = 0; j < 8; j++) {
                        var li = j * 8 * 4;
                        var ri = li + 7 * 4;
                        lr += d[li]; lg += d[li + 1]; lb += d[li + 2];
                        rr += d[ri]; rg += d[ri + 1]; rb += d[ri + 2];
                    }
                    lr /= 8; lg /= 8; lb /= 8;
                    rr /= 8; rg /= 8; rb /= 8;

                    var glowShadow;
                    if (self.stretched) {
                        glowShadow = [
                            'inset 0 30px 50px -10px rgba(' + (tr | 0) + ',' + (tg | 0) + ',' + (tb | 0) + ',0.6)',
                            'inset 0 -30px 50px -10px rgba(' + (br | 0) + ',' + (bg | 0) + ',' + (bb | 0) + ',0.6)',
                            'inset 30px 0 50px -10px rgba(' + (lr | 0) + ',' + (lg | 0) + ',' + (lb | 0) + ',0.6)',
                            'inset -30px 0 50px -10px rgba(' + (rr | 0) + ',' + (rg | 0) + ',' + (rb | 0) + ',0.6)'
                        ].join(',');
                    } else {
                        glowShadow = [
                            'inset 0 0 100px -20px rgba(0,0,0,0.65)',
                            '0 -50px 80px -30px rgba(' + (tr | 0) + ',' + (tg | 0) + ',' + (tb | 0) + ',0.5)',
                            '0 50px 80px -30px rgba(' + (br | 0) + ',' + (bg | 0) + ',' + (bb | 0) + ',0.5)',
                            '-50px 0 80px -30px rgba(' + (lr | 0) + ',' + (lg | 0) + ',' + (lb | 0) + ',0.5)',
                            '50px 0 80px -30px rgba(' + (rr | 0) + ',' + (rg | 0) + ',' + (rb | 0) + ',0.5)'
                        ].join(',');
                    }
                    self.videoElement.style.boxShadow = glowShadow;
                } catch (e) {
                    if (!self.glowWarned) {
                        self.glowWarned = true;
                    }
                }

                self.glowTimer = setTimeout(sample, 300);
            };

            sample();
        }

        stopEdgeGlow() {
            if (this.glowTimer) {
                clearTimeout(this.glowTimer);
                this.glowTimer = null;
            }
            if (this.videoElement) {
                this.videoElement.style.boxShadow = '';
            }
            this.canvas = null;
            this.ctx = null;
        }

        destroy() {
            this.stopEdgeGlow();
            this.removeSpeedBar();
            if (this.videoElement) {
                this.videoElement.classList.remove('night-mode');
                this.videoElement.classList.remove('stretched');
                this.videoElement.style.boxShadow = '';
                var vc = this.videoElement.closest('.html5-video-container');
                if (vc) vc.classList.remove('night-mode');
            }
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            this.videoElement = null;
        }
    }

    var instance = null;

    function start() {
        if (instance) {
            instance.destroy();
        }
        instance = new CinemaModePro();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
