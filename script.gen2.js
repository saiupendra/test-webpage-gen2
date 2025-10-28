(function() {
    'use strict';

    function includeHTML(selector, file) {
        const element = document.querySelector(selector);
        if (!element) return;
        fetch(file).then(response => {
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            return response.text()
        }).then(data => {
            element.innerHTML = data;
            document.dispatchEvent(new Event('headerFooterLoaded'))
        }).catch(error => console.warn('Include error:', error))
    }
    let modalShown = false;

    function showAppointmentModal() {
        if (!modalShown && !sessionStorage.getItem('appointmentModalShown')) {
            const modal = document.getElementById('appointment-modal');
            if (modal) {
                modal.style.display = 'block';
                modalShown = true;
                sessionStorage.setItem('appointmentModalShown', 'true')
            }
        }
    }

    function hideAppointmentModal() {
        const modal = document.getElementById('appointment-modal');
        if (modal) modal.style.display = 'none'
    }

    function setupModalEvents() {
        const modal = document.getElementById('appointment-modal');
        const closeBtn = document.getElementById('closeModalBtn');
        if (!modal) return;
        if (closeBtn) {
            closeBtn.addEventListener('click', hideAppointmentModal)
        }
        window.addEventListener('click', function(event) {
            if (event.target === modal) hideAppointmentModal()
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') hideAppointmentModal()
        })
    }

    function setupScrollTrigger() {
        let scrollListenerAttached = false;

        function onScroll() {
            if ((window.scrollY || window.pageYOffset) > 300) {
                showAppointmentModal();
                if (scrollListenerAttached) {
                    window.removeEventListener('scroll', onScroll);
                    scrollListenerAttached = false
                }
            }
        }
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(onScroll, 50)
        }, {
            passive: true
        })
    }

    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(event) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                event.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    })
                }
            })
        })
    }

    function setupFormHandling() {
        const form = document.getElementById('book-appointment');
        if (!form) return;
        form.addEventListener('submit', function(event) {
            console.log('Appointment form submitted')
        })
    }

    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img)
                        }
                    }
                })
            });
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img)
            })
        }
    }

    function trackEvent(eventName, eventData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData)
        } else {
            console.log('Event:', eventName, eventData)
        }
    }

    function setupCountdown() {
        const launchDate = new Date('2026-01-15T00:00:00').getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = launchDate - now;
            if (distance < 0) {
                const elements = ['days', 'hours', 'minutes', 'seconds'];
                elements.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = '0'
                });
                return
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            const elements = {
                days: String(days).padStart(2, '0'),
                hours: String(hours).padStart(2, '0'),
                minutes: String(minutes).padStart(2, '0'),
                seconds: String(seconds).padStart(2, '0')
            };
            Object.entries(elements).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value
            })
        }
        updateCountdown();
        setInterval(updateCountdown, 1000)
    }

    function setupActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
        window.addEventListener('scroll', function() {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (pageYOffset >= sectionTop) {
                    current = section.getAttribute('id')
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active')
                }
            })
        }, {
            passive: true
        })
    }

    function init() {
        includeHTML('.header-include', 'header.html');
        includeHTML('.footer-include', 'footer.html');
        setupModalEvents();
        setupScrollTrigger();
        setupFormHandling();
        setupSmoothScroll();
        setupLazyLoading();
        const daysEl = document.getElementById('days');
        if (daysEl) {
            setupCountdown()
        }
        setupActiveNav();
        trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href
        })
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init)
    } else {
        init()
    }
    window.appointmentModal = {
        show: showAppointmentModal,
        hide: hideAppointmentModal
    };
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('Tab is hidden')
        } else {
            console.log('Tab is visible')
        }
    })
    includeHTML('.header-include', 'header.html');
    includeHTML('.footer-include', 'footer.html');

})();