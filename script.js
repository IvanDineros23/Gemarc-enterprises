// Mobile menu toggle functionality
function toggleMobileMenu() {
    const navList = document.querySelector('.nav-list');
    const hamburger = document.querySelector('.hamburger');
    
    navList.classList.toggle('mobile-active');
    hamburger.classList.toggle('active');
}

// Services menu toggle functionality
function toggleServicesMenu() {
    const servicesList = document.querySelector('.services-list');
    const servicesHamburger = document.querySelector('.services-hamburger');
    
    servicesList.classList.toggle('mobile-active');
    servicesHamburger.classList.toggle('active');
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-list a');
    const navList = document.querySelector('.nav-list');
    const hamburger = document.querySelector('.hamburger');
    
    const servicesLinks = document.querySelectorAll('.services-list a');
    const servicesList = document.querySelector('.services-list');
    const servicesHamburger = document.querySelector('.services-hamburger');
    
    // Main navigation
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('mobile-active');
            hamburger.classList.remove('active');
        });
    });
    
    // Services navigation
    servicesLinks.forEach(link => {
        link.addEventListener('click', () => {
            servicesList.classList.remove('mobile-active');
            servicesHamburger.classList.remove('active');
        });
    });
    
    // Close mobile menus when clicking outside
    document.addEventListener('click', (e) => {
        // Close main nav
        if (!e.target.closest('.nav') && navList.classList.contains('mobile-active')) {
            navList.classList.remove('mobile-active');
            hamburger.classList.remove('active');
        }
        
        // Close services nav
        if (!e.target.closest('.services-nav') && servicesList.classList.contains('mobile-active')) {
            servicesList.classList.remove('mobile-active');
            servicesHamburger.classList.remove('active');
        }
    });
});

// Partnership Carousel Functionality
let currentPosition = 0;
const partnersTrack = document.getElementById('partnersTrack');
const partnerItems = document.querySelectorAll('.partner-item');
const itemWidth = 230; // 200px width + 30px gap
const totalItems = 12; // Original items count

function moveCarousel(direction) {
    currentPosition += direction * itemWidth;
    
    // Reset position for infinite loop
    if (currentPosition <= -(totalItems * itemWidth)) {
        currentPosition = 0;
    } else if (currentPosition > 0) {
        currentPosition = -(totalItems * itemWidth - itemWidth);
    }
    
    if (partnersTrack) {
        partnersTrack.style.transform = `translateX(${currentPosition}px)`;
        partnersTrack.style.animation = 'none';
        
        // Restart animation after manual control
        setTimeout(() => {
            partnersTrack.style.animation = 'autoScroll 20s linear infinite';
        }, 1000);
    }
}

// Reset carousel position when animation completes
function resetCarouselPosition() {
    if (partnersTrack) {
        partnersTrack.addEventListener('animationiteration', () => {
            partnersTrack.style.transform = 'translateX(0)';
        });
    }
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    resetCarouselPosition();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-list a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Mobile menu toggle (if needed later)
function toggleMobileMenu() {
    const navList = document.querySelector('.nav-list');
    navList.classList.toggle('mobile-active');
}

// Add loading animation
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'white';
        header.style.backdropFilter = 'none';
    }
});

// Service card hover effects
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});
