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
let currentIndex = 0;
let autoSlideInterval;
const partnersTrack = document.getElementById('partnersTrack');
const partnerItems = document.querySelectorAll('.partner-item');
const totalItems = 12; // Original items count (without duplicates)
const itemsToShow = 3; // Show 3 items at a time
const itemWidth = 260; // 200px width + 30px gap + padding

function moveCarousel(direction) {
    // Clear auto-slide when manually navigating
    clearInterval(autoSlideInterval);
    
    if (direction === 1) {
        currentIndex += itemsToShow;
    } else {
        currentIndex -= itemsToShow;
    }
    
    // Reset to beginning if at end
    if (currentIndex >= totalItems) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = totalItems - itemsToShow;
    }
    
    updateCarouselPosition();
    
    // Restart auto-slide after 5 seconds
    setTimeout(() => {
        startAutoSlide();
    }, 5000);
}

function updateCarouselPosition() {
    if (partnersTrack) {
        const translateX = -(currentIndex * itemWidth);
        partnersTrack.style.transform = `translateX(${translateX}px)`;
    }
}

function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        currentIndex += itemsToShow;
        
        if (currentIndex >= totalItems) {
            currentIndex = 0;
        }
        
        updateCarouselPosition();
    }, 3500); // 3.5 seconds delay between transitions
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    updateCarouselPosition();
    startAutoSlide();
    
    // Pause auto-slide on hover
    const carouselContainer = document.querySelector('.partners-carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }
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

// Tab functionality for About page
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}
