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
        if (navList && !e.target.closest('.nav') && navList.classList.contains('mobile-active')) {
            navList.classList.remove('mobile-active');
            hamburger.classList.remove('active');
        }
        
        // Close services nav
        if (servicesList && !e.target.closest('.services-nav') && servicesList.classList.contains('mobile-active')) {
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

// E-brochures dropdown toggle functionality
function toggleEbrochures() {
    const content = document.getElementById('ebrochuresContent');
    const button = document.querySelector('.ebrochures-toggle-btn');
    const buttonText = button.querySelector('span');
    
    if (content.classList.contains('active')) {
        // Close dropdown
        content.classList.remove('active');
        button.classList.remove('active');
        buttonText.textContent = 'View Available Downloads';
    } else {
        // Open dropdown
        content.classList.add('active');
        button.classList.add('active');
        buttonText.textContent = 'Hide Downloads';
    }
}

// Smart Search Functionality
function initializeSearch() {
    // Search mappings for products and pages
    const searchMappings = {
        // Products
        'aggregates': 'aggregates.html',
        'aggregate': 'aggregates.html',
        'gravel': 'aggregates.html',
        'sand': 'aggregates.html',
        'stone': 'aggregates.html',
        
        'asphalt': 'asphalt-bitumen.html',
        'bitumen': 'asphalt-bitumen.html',
        'road': 'asphalt-bitumen.html',
        'pavement': 'asphalt-bitumen.html',
        
        'cement': 'cement-mortar.html',
        'mortar': 'cement-mortar.html',
        'concrete': 'concrete-mortar.html',
        
        'drilling': 'drilling-machine.html',
        'drill': 'drilling-machine.html',
        'drilling machine': 'drilling-machine.html',
        'drilling equipment': 'drilling-machine.html',
        
        'industrial': 'industrial-equipment.html',
        'industrial equipment': 'industrial-equipment.html',
        'tools': 'industrial-equipment.html',
        
        'soil': 'soil.html',
        'soil testing': 'soil.html',
        'geotechnical': 'soil.html',
        
        'steel': 'steel.html',
        'steel testing': 'steel.html',
        'metal': 'steel.html',
        'iron': 'steel.html',
        
        // Services
        'calibration': 'services.html',
        'maintenance': 'services.html',
        'supply': 'services.html',
        'services': 'services.html',
        'repair': 'services.html',
        
        // Company info
        'about': 'about.html',
        'company': 'about.html',
        'contact': 'contact.html',
        'phone': 'contact.html',
        'address': 'contact.html',
        'location': 'contact.html',
        
        // News & Blogs
        'news': 'news.html',
        'blog': 'blogs.html',
        'blogs': 'blogs.html',
        'articles': 'blogs.html',
        
        // Brand names and equipment
        'gemarc': 'about.html',
        'enterprises': 'about.html',
        'testing equipment': 'index.html',
        'quality': 'about.html',
        'laboratory': 'index.html',
        'lab equipment': 'index.html'
    };

    // Enhanced content-based search mappings
    const contentMappings = {
        // Aggregates content
        'sieve': 'aggregates.html',
        'particle size': 'aggregates.html',
        'gradation': 'aggregates.html',
        'density': 'aggregates.html',
        'absorption': 'aggregates.html',
        'crushing': 'aggregates.html',
        'abrasion': 'aggregates.html',
        'los angeles': 'aggregates.html',
        'soundness': 'aggregates.html',
        'bulk density': 'aggregates.html',
        
        // Asphalt & Bitumen content
        'penetration': 'asphalt-bitumen.html',
        'viscosity': 'asphalt-bitumen.html',
        'ductility': 'asphalt-bitumen.html',
        'softening point': 'asphalt-bitumen.html',
        'flash point': 'asphalt-bitumen.html',
        'rolling thin film': 'asphalt-bitumen.html',
        'rtfot': 'asphalt-bitumen.html',
        'marshall': 'asphalt-bitumen.html',
        'stability': 'asphalt-bitumen.html',
        'flow': 'asphalt-bitumen.html',
        
        // Cement content
        'compressive strength': 'cement-mortar.html',
        'setting time': 'cement-mortar.html',
        'soundness': 'cement-mortar.html',
        'fineness': 'cement-mortar.html',
        'consistency': 'cement-mortar.html',
        'blaine': 'cement-mortar.html',
        'vicat': 'cement-mortar.html',
        'le chatelier': 'cement-mortar.html',
        
        // Concrete content
        'slump': 'concrete-mortar.html',
        'workability': 'concrete-mortar.html',
        'cube': 'concrete-mortar.html',
        'cylinder': 'concrete-mortar.html',
        'flexural': 'concrete-mortar.html',
        'tensile': 'concrete-mortar.html',
        'modulus': 'concrete-mortar.html',
        'air content': 'concrete-mortar.html',
        
        // Steel content
        'tensile test': 'steel.html',
        'yield strength': 'steel.html',
        'ultimate strength': 'steel.html',
        'elongation': 'steel.html',
        'hardness': 'steel.html',
        'brinell': 'steel.html',
        'rockwell': 'steel.html',
        'charpy': 'steel.html',
        'impact': 'steel.html',
        'fatigue': 'steel.html',
        'rebar': 'steel.html',
        'reinforcement': 'steel.html',
        
        // Soil content
        'atterberg': 'soil.html',
        'liquid limit': 'soil.html',
        'plastic limit': 'soil.html',
        'plasticity index': 'soil.html',
        'compaction': 'soil.html',
        'proctor': 'soil.html',
        'cbr': 'soil.html',
        'california bearing ratio': 'soil.html',
        'permeability': 'soil.html',
        'consolidation': 'soil.html',
        'triaxial': 'soil.html',
        'direct shear': 'soil.html',
        'moisture content': 'soil.html',
        'specific gravity': 'soil.html',
        'grain size': 'soil.html',
        'classification': 'soil.html',
        'uscs': 'soil.html',
        'aashto': 'soil.html',
        
        // Drilling equipment content
        'core drilling': 'drilling-machine.html',
        'sampling': 'drilling-machine.html',
        'spt': 'drilling-machine.html',
        'standard penetration': 'drilling-machine.html',
        'auger': 'drilling-machine.html',
        'diamond': 'drilling-machine.html',
        'core barrel': 'drilling-machine.html',
        'drilling fluid': 'drilling-machine.html',
        'mud': 'drilling-machine.html',
        'casing': 'drilling-machine.html',
        'borehole': 'drilling-machine.html',
        
        // Industrial equipment content
        'universal testing machine': 'industrial-equipment.html',
        'utm': 'industrial-equipment.html',
        'compression machine': 'industrial-equipment.html',
        'oven': 'industrial-equipment.html',
        'balance': 'industrial-equipment.html',
        'scale': 'industrial-equipment.html',
        'mixer': 'industrial-equipment.html',
        'curing tank': 'industrial-equipment.html',
        'mold': 'industrial-equipment.html',
        'frame': 'industrial-equipment.html',
        'apparatus': 'industrial-equipment.html',
        
        // Services content
        'calibration certificate': 'services.html',
        'iso': 'services.html',
        'astm': 'services.html',
        'aashto': 'services.html',
        'standard': 'services.html',
        'specification': 'services.html',
        'verification': 'services.html',
        'accuracy': 'services.html',
        'precision': 'services.html',
        'traceability': 'services.html',
        'maintenance': 'services.html',
        'repair': 'services.html',
        'spare parts': 'services.html',
        
        // Contact content
        'email': 'contact.html',
        'telephone': 'contact.html',
        'mobile': 'contact.html',
        'address': 'contact.html',
        'location': 'contact.html',
        'office': 'contact.html',
        'hours': 'contact.html',
        'business hours': 'contact.html',
        'map': 'contact.html',
        'directions': 'contact.html'
    };

    // Combine all mappings
    const allMappings = { ...searchMappings, ...contentMappings };

    // Get search elements
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (!searchInput || !searchBtn) return;

    // Function to perform search
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (query === '') {
            alert('Please enter a search term');
            return;
        }

        // Check for exact matches first
        if (allMappings[query]) {
            window.location.href = allMappings[query];
            return;
        }

        // Check for partial matches with scoring
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [key, value] of Object.entries(allMappings)) {
            let score = 0;
            
            // Exact match gets highest score
            if (key === query) {
                score = 100;
            }
            // Query contains the key
            else if (query.includes(key)) {
                score = 80 + (key.length / query.length) * 20;
            }
            // Key contains the query
            else if (key.includes(query)) {
                score = 60 + (query.length / key.length) * 20;
            }
            // Word boundary matches
            else if (key.split(' ').some(word => word.includes(query)) || 
                     query.split(' ').some(word => key.includes(word))) {
                score = 40;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = value;
            }
        }

        // If we found a good match (score > 30), redirect
        if (bestMatch && bestScore > 30) {
            window.location.href = bestMatch;
            return;
        }

        // If no direct match, use Google site search
        const siteUrl = window.location.hostname;
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' site:' + siteUrl)}`;
        window.open(googleSearchUrl, '_blank');
    }

    // Event listeners
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Add search suggestions (optional enhancement)
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) return;

        // You can add autocomplete suggestions here later
        // For now, we'll just handle the basic search
    });
}

// Initialize search functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
});
