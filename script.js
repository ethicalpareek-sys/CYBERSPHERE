/* ============================================================
   CYBERSPHERE
   Advanced Frontend Engine
   Author: Bharat Pareek
   ============================================================ */

"use strict";

/* ============================================================
   CONFIG
   ============================================================ */

const CONFIG = Object.freeze({
    siteName: "CYBERSPHERE",
    developer: "Bharat Pareek",

    animation: {
        duration: 700,
        parallaxStrength: 18,
        particleCount: 70,
        mouseSmoothing: 0.08
    },

    storage: {
        theme: "cybersphere-theme",
        visited: "cybersphere-visited",
        preferences: "cybersphere-preferences"
    },

    selectors: {
        body: "body",
        cursor: ".cursor",
        cursorFollower: ".cursor-follower",
        nav: ".navbar",
        menu: ".nav-menu",
        menuToggle: ".menu-toggle",
        progress: ".scroll-progress",
        reveal: "[data-reveal]",
        counter: "[data-counter]",
        parallax: "[data-parallax]",
        tilt: "[data-tilt]",
        toast: "[data-toast]",
        modal: "[data-modal]"
    }
});


/* ============================================================
   GLOBAL STATE
   ============================================================ */

const state = {
    mouse: {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
    },

    scroll: {
        y: 0,
        progress: 0
    },

    ui: {
        menuOpen: false,
        modalOpen: false,
        initialized: false
    },

    performance: {
        reducedMotion:
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }
};


/* ============================================================
   DOM HELPERS
   ============================================================ */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

const lerp = (start, end, amount) =>
    start + (end - start) * amount;

const prefersReducedMotion = () =>
    state.performance.reducedMotion;


/* ============================================================
   DOM READY
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    CyberSphere.init();
});


/* ============================================================
   MAIN APPLICATION
   ============================================================ */

const CyberSphere = {

    init() {

        if (state.ui.initialized) return;

        this.setupTheme();
        this.setupNavigation();
        this.setupCursor();
        this.setupScroll();
        this.setupRevealAnimations();
        this.setupCounters();
        this.setupParallax();
        this.setupTilt();
        this.setupParticles();
        this.setupTyping();
        this.setupTerminal();
        this.setupForms();
        this.setupModals();
        this.setupButtons();
        this.setupKeyboardShortcuts();
        this.setupPerformance();
        this.setupVisitedState();

        state.ui.initialized = true;

        document.documentElement.classList.add("app-ready");

        console.log(
            `%c${CONFIG.siteName}`,
            "font-size:22px;font-weight:900;"
        );

        console.log(
            `%cCyberSphere frontend initialized.`,
            "font-size:13px;"
        );
    },


    /* ========================================================
       THEME
       ======================================================== */

    setupTheme() {

        const savedTheme =
            localStorage.getItem(CONFIG.storage.theme);

        const preferredDark =
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        const theme =
            savedTheme ||
            (preferredDark ? "dark" : "dark");

        document.documentElement.dataset.theme = theme;

        const themeButtons = $$(
            "[data-theme-toggle]"
        );

        themeButtons.forEach(button => {

            button.addEventListener("click", () => {

                const current =
                    document.documentElement.dataset.theme;

                const next =
                    current === "dark"
                        ? "light"
                        : "dark";

                document.documentElement.dataset.theme =
                    next;

                localStorage.setItem(
                    CONFIG.storage.theme,
                    next
                );

                this.toast(
                    `${next === "dark" ? "Dark" : "Light"} mode activated`,
                    "success"
                );
            });
        });
    },


    /* ========================================================
       NAVIGATION
       ======================================================== */

    setupNavigation() {

        const nav = $(CONFIG.selectors.nav);
        const menu = $(CONFIG.selectors.menu);
        const toggle = $(CONFIG.selectors.menuToggle);

        if (!nav) return;

        const updateNav = () => {

            if (window.scrollY > 40) {
                nav.classList.add("nav-scrolled");
            } else {
                nav.classList.remove("nav-scrolled");
            }
        };

        updateNav();

        window.addEventListener(
            "scroll",
            updateNav,
            { passive: true }
        );

        if (toggle && menu) {

            toggle.addEventListener("click", () => {

                state.ui.menuOpen =
                    !state.ui.menuOpen;

                toggle.classList.toggle(
                    "active",
                    state.ui.menuOpen
                );

                menu.classList.toggle(
                    "active",
                    state.ui.menuOpen
                );

                document.body.classList.toggle(
                    "menu-open",
                    state.ui.menuOpen
                );

                toggle.setAttribute(
                    "aria-expanded",
                    String(state.ui.menuOpen)
                );
            });
        }

        $$("a[href^='#']").forEach(link => {

            link.addEventListener("click", event => {

                const targetID =
                    link.getAttribute("href");

                if (!targetID || targetID === "#")
                    return;

                const target =
                    $(targetID);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior:
                        prefersReducedMotion()
                            ? "auto"
                            : "smooth",
                    block: "start"
                });

                this.closeMenu();
            });
        });
    },


    closeMenu() {

        const menu = $(CONFIG.selectors.menu);
        const toggle = $(CONFIG.selectors.menuToggle);

        state.ui.menuOpen = false;

        menu?.classList.remove("active");
        toggle?.classList.remove("active");

        toggle?.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "menu-open"
        );
    },


    /* ========================================================
       CUSTOM CURSOR
       ======================================================== */

    setupCursor() {

        if (
            prefersReducedMotion() ||
            !window.matchMedia("(pointer:fine)").matches
        ) {
            return;
        }

        const cursor =
            $(CONFIG.selectors.cursor);

        const follower =
            $(CONFIG.selectors.cursorFollower);

        if (!cursor && !follower) return;

        window.addEventListener(
            "pointermove",
            event => {

                state.mouse.targetX =
                    event.clientX;

                state.mouse.targetY =
                    event.clientY;

                if (cursor) {
                    cursor.style.transform =
                        `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
                }
            },
            { passive: true }
        );

        const animateCursor = () => {

            state.mouse.x = lerp(
                state.mouse.x,
                state.mouse.targetX,
                CONFIG.animation.mouseSmoothing
            );

            state.mouse.y = lerp(
                state.mouse.y,
                state.mouse.targetY,
                CONFIG.animation.mouseSmoothing
            );

            if (follower) {
                follower.style.transform =
                    `translate3d(${state.mouse.x}px, ${state.mouse.y}px, 0)`;
            }

            requestAnimationFrame(
                animateCursor
            );
        };

        animateCursor();

        $$(
            "a, button, input, textarea, select, [data-hover]"
        ).forEach(element => {

            element.addEventListener(
                "mouseenter",
                () => {
                    document.body.classList.add(
                        "cursor-hover"
                    );
                }
            );

            element.addEventListener(
                "mouseleave",
                () => {
                    document.body.classList.remove(
                        "cursor-hover"
                    );
                }
            );
        });
    },


    /* ========================================================
       SCROLL ENGINE
       ======================================================== */

    setupScroll() {

        const progress =
            $(CONFIG.selectors.progress);

        let ticking = false;

        const update = () => {

            state.scroll.y =
                window.scrollY;

            const documentHeight =
                document.documentElement.scrollHeight -
                window.innerHeight;

            state.scroll.progress =
                documentHeight > 0
                    ? state.scroll.y / documentHeight
                    : 0;

            if (progress) {
                progress.style.transform =
                    `scaleX(${state.scroll.progress})`;
            }

            ticking = false;
        };

        window.addEventListener(
            "scroll",
            () => {

                if (!ticking) {
                    requestAnimationFrame(update);
                    ticking = true;
                }
            },
            { passive: true }
        );

        update();
    },


    /* ========================================================
       REVEAL ANIMATIONS
       ======================================================== */

    setupRevealAnimations() {

        const elements =
            $$(CONFIG.selectors.reveal);

        if (!elements.length) return;

        if (
            prefersReducedMotion() ||
            !("IntersectionObserver" in window)
        ) {
            elements.forEach(element =>
                element.classList.add("revealed")
            );

            return;
        }

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting)
                            return;

                        entry.target.classList.add(
                            "revealed"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -60px 0px"
                }
            );

        elements.forEach(element =>
            observer.observe(element)
        );
    },


    /* ========================================================
       NUMBER COUNTERS
       ======================================================== */

    setupCounters() {

        const counters =
            $$(CONFIG.selectors.counter);

        if (!counters.length) return;

        if (prefersReducedMotion()) {
            counters.forEach(counter => {
                counter.textContent =
                    counter.dataset.counter;
            });

            return;
        }

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting)
                            return;

                        this.animateCounter(
                            entry.target
                        );

                        observer.unobserve(
                            entry.target
                        );
                    });

                },
                {
                    threshold: 0.7
                }
            );

        counters.forEach(counter =>
            observer.observe(counter)
        );
    },


    animateCounter(element) {

        const target =
            Number(element.dataset.counter);

        const duration = 1500;

        const startTime =
            performance.now();

        const update = currentTime => {

            const elapsed =
                currentTime - startTime;

            const progress =
                clamp(elapsed / duration, 0, 1);

            const eased =
                1 - Math.pow(1 - progress, 4);

            const value =
                Math.floor(target * eased);

            element.textContent =
                value.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    },


    /* ========================================================
       3D PARALLAX
       ======================================================== */

    setupParallax() {

        const elements =
            $$(CONFIG.selectors.parallax);

        if (
            !elements.length ||
            prefersReducedMotion()
        ) return;

        let ticking = false;

        const update = () => {

            const scroll =
                window.scrollY;

            elements.forEach(element => {

                const speed =
                    Number(
                        element.dataset.parallax || 0.15
                    );

                const offset =
                    scroll * speed;

                element.style.transform =
                    `translate3d(0, ${offset}px, 0)`;
            });

            ticking = false;
        };

        window.addEventListener(
            "scroll",
            () => {

                if (!ticking) {
                    requestAnimationFrame(update);
                    ticking = true;
                }
            },
            { passive: true }
        );
    },


    /* ========================================================
       3D CARD TILT
       ======================================================== */

    setupTilt() {

        if (prefersReducedMotion()) return;

        const cards =
            $$(CONFIG.selectors.tilt);

        cards.forEach(card => {

            card.addEventListener(
                "pointermove",
                event => {

                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        event.clientX - rect.left;

                    const y =
                        event.clientY - rect.top;

                    const centerX =
                        rect.width / 2;

                    const centerY =
                        rect.height / 2;

                    const rotateX =
                        ((y - centerY) /
                            centerY) *
                        -CONFIG.animation.parallaxStrength;

                    const rotateY =
                        ((x - centerX) /
                            centerX) *
                        CONFIG.animation.parallaxStrength;

                    card.style.transform =
                        `perspective(1000px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateZ(12px)`;
                }
            );

            card.addEventListener(
                "pointerleave",
                () => {

                    card.style.transform =
                        "";
                }
            );
        });
    },


    /* ========================================================
       PARTICLE ENGINE
       ======================================================== */

    setupParticles() {

        const canvas =
            document.querySelector(
                "#particle-canvas"
            );

        if (!canvas) return;

        const ctx =
            canvas.getContext("2d");

        if (!ctx) return;

        const particles = [];

        const resize = () => {

            const dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

            canvas.width =
                window.innerWidth * dpr;

            canvas.height =
                window.innerHeight * dpr;

            canvas.style.width =
                `${window.innerWidth}px`;

            canvas.style.height =
                `${window.innerHeight}px`;

            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );
        };

        resize();

        window.addEventListener(
            "resize",
            resize,
            { passive: true }
        );

        const count =
            prefersReducedMotion()
                ? Math.floor(
                    CONFIG.animation.particleCount / 2
                )
                : CONFIG.animation.particleCount;

        for (let i = 0; i < count; i++) {

            particles.push({
                x: Math.random() *
                    window.innerWidth,

                y: Math.random() *
                    window.innerHeight,

                radius:
                    Math.random() * 1.8 + 0.4,

                speedX:
                    (Math.random() - 0.5) * 0.35,

                speedY:
                    (Math.random() - 0.5) * 0.35,

                opacity:
                    Math.random() * 0.6 + 0.15
            });
        }

        const draw = () => {

            ctx.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
            );

            particles.forEach(particle => {

                particle.x +=
                    particle.speedX;

                particle.y +=
                    particle.speedY;

                if (
                    particle.x < -10 ||
                    particle.x > window.innerWidth + 10
                ) {
                    particle.speedX *= -1;
                }

                if (
                    particle.y < -10 ||
                    particle.y > window.innerHeight + 10
                ) {
                    particle.speedY *= -1;
                }

                ctx.beginPath();

                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle =
                    `rgba(120, 210, 255, ${particle.opacity})`;

                ctx.fill();
            });

            if (!prefersReducedMotion()) {
                requestAnimationFrame(draw)
