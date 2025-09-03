// Mobile menu overlay logic
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getE/* Products Carousel Functions */
let currentProductIndex = 0;
let autoProductSlideInterval;
const productsTrack = document.getElementById('productsTrack');
const productItems = document.querySelectorAll('.product-item');
const totalProductItems = 20; // Original items count (without duplicates)
const productItemsToShow = 3; // Show 3 items at a time
const productItemWidth = 280; // Increased width for better spacingId('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');
    const mainButtons = document.querySelectorAll('.mobile-menu-main');

    // Open mobile menu
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    // Close mobile menu
    if (closeMenu && mobileMenu) {
        closeMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    // Accordion dropdown logic
    mainButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Close other submenus
            mainButtons.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.classList.remove('active');
                }
            });
            // Toggle current submenu
            btn.classList.toggle('active');
        });
    });
});
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
    // Mobile: Only one dropdown open at a time
    if (window.innerWidth <= 600) {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const parentDropdown = this.closest('.dropdown');
                // Close all dropdowns
                document.querySelectorAll('.dropdown.mobile-active').forEach(dd => {
                    if (dd !== parentDropdown) dd.classList.remove('mobile-active');
                });
                // Toggle current dropdown
                parentDropdown.classList.toggle('mobile-active');
            });
        });
    }
    const navLinks = document.querySelectorAll('.nav-list a');
    const navList = document.querySelector('.nav-list');
    const hamburger = document.querySelector('.hamburger');
    
    const servicesLinks = document.querySelectorAll('.services-list a');
    const servicesList = document.querySelector('.services-list');
    const servicesHamburger = document.querySelector('.services-hamburger');
    
    // Main navigation
    // Removed auto-close on link click for mobile dropdowns
    
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
    // Initialize partners carousel
    updateCarouselPosition();
    startAutoSlide();
    
    // Pause auto-slide on hover for partners
    const carouselContainer = document.querySelector('.partners-carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }
    
    // Initialize products carousel
    updateProductsCarouselPosition();
    startProductsAutoSlide();
    
    // Pause auto-slide on hover for products
    const productsCarouselContainer = document.querySelector('.products-carousel-container');
    if (productsCarouselContainer) {
        productsCarouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoProductSlideInterval);
        });
        
        productsCarouselContainer.addEventListener('mouseleave', () => {
            startProductsAutoSlide();
        });
    }
});

// Products Carousel Functions
let currentProductIndex = 0;
let autoProductSlideInterval;
const productsTrack = document.getElementById('productsTrack');
const productItems = document.querySelectorAll('.product-item');
const totalProductItems = 20; // Original items count (without duplicates)
const productItemsToShow = 3; // Show 3 items at a time
const productItemWidth = 260; // 200px width + 30px gap + padding

function moveProductsCarousel(direction) {
    // Clear auto-slide when manually navigating
    clearInterval(autoProductSlideInterval);
    
    if (direction === 1) {
        currentProductIndex += productItemsToShow;
    } else {
        currentProductIndex -= productItemsToShow;
    }
    
    // Reset to beginning if at end
    if (currentProductIndex >= totalProductItems) {
        currentProductIndex = 0;
    } else if (currentProductIndex < 0) {
        currentProductIndex = totalProductItems - productItemsToShow;
    }
    
    updateProductsCarouselPosition();
    
    // Restart auto-slide after 5 seconds
    setTimeout(() => {
        startProductsAutoSlide();
    }, 5000);
}

function updateProductsCarouselPosition() {
    if (productsTrack) {
        const translateX = -(currentProductIndex * productItemWidth);
        productsTrack.style.transform = `translateX(${translateX}px)`;
    }
}

function startProductsAutoSlide() {
    clearInterval(autoProductSlideInterval);
    autoProductSlideInterval = setInterval(() => {
        currentProductIndex += productItemsToShow;
        
        if (currentProductIndex >= totalProductItems) {
            currentProductIndex = 0;
        }
        
        updateProductsCarouselPosition();
    }, 4000); // 4 seconds delay between transitions
}

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

// Highlights Carousel Functions
let currentHighlight = 0;
let totalHighlights = 4;

// Initialize carousel functions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize carousel with first slide if elements exist
    const slides = document.querySelectorAll('.highlights-slide');
    if (slides.length > 0) {
        totalHighlights = slides.length;
        showHighlight(0);
    }
});

function showHighlight(slideIndex) {
    // Hide all slides
    const slides = document.querySelectorAll('.highlights-slide');
    const dots = document.querySelectorAll('.nav-dot');
    
    // Safety check - if elements don't exist, exit the function
    if (slides.length === 0 || dots.length === 0) return;
    
    // Update totalHighlights based on actual slides
    totalHighlights = slides.length;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show selected slide
    if (slides[slideIndex]) {
        slides[slideIndex].classList.add('active');
        dots[slideIndex].classList.add('active');
        currentHighlight = slideIndex;
    }
}

function nextHighlight() {
    const slides = document.querySelectorAll('.highlights-slide');
    if (slides.length === 0) return;
    
    totalHighlights = slides.length;
    currentHighlight = (currentHighlight + 1) % totalHighlights;
    showHighlight(currentHighlight);
}

function previousHighlight() {
    const slides = document.querySelectorAll('.highlights-slide');
    if (slides.length === 0) return;
    
    totalHighlights = slides.length;
    currentHighlight = (currentHighlight - 1 + totalHighlights) % totalHighlights;
    showHighlight(currentHighlight);
}

// Auto-advance highlights (optional)
function startHighlightsAutoplay() {
    setInterval(() => {
        nextHighlight();
    }, 12000); // Change slide every 12 seconds for a slower pace
}

// Initialize highlights carousel
document.addEventListener('DOMContentLoaded', function() {
    // Start autoplay after page load
    setTimeout(startHighlightsAutoplay, 5000);
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            previousHighlight();
        } else if (e.key === 'ArrowRight') {
            nextHighlight();
        }
    });
});

// Product Categories Showcase Functions
function showCategory(categoryId) {
    // Check if elements exist first
    const allContents = document.querySelectorAll('.category-content');
    const allButtons = document.querySelectorAll('.category-nav-btn');
    
    // If these elements don't exist (section was removed), exit the function
    if (allContents.length === 0 || allButtons.length === 0) return;
    
    // Hide all category contents
    allContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all buttons
    allButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected category
    const selectedContent = document.getElementById(categoryId);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Add active class to clicked button
    const clickedButton = event ? event.target.closest('.category-nav-btn') : document.querySelector(`.category-nav-btn[onclick*="${categoryId}"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

// News Modal Functions
const newsData = {
    'iso-training': {
        title: 'ISO 9001:2015 Quality Management Training',
        image: 'images/news/GEItrainingiso9001-1024x768.jpg',
        date: 'September 1, 2025',
        content: `
            <p>Gemarc Enterprises Incorporated successfully completed comprehensive training on ISO 9001:2015 Quality Management Systems. This training program was designed to enhance our understanding and implementation of quality management principles across all aspects of our operations.</p>
            
            <p>The training covered key areas including:</p>
            <ul>
                <li>Quality Management System documentation and implementation</li>
                <li>Process approach and risk-based thinking</li>
                <li>Customer satisfaction and continuous improvement</li>
                <li>Internal audit procedures and management review processes</li>
                <li>Corrective and preventive action methodologies</li>
            </ul>
            
            <p>This certification reinforces our commitment to delivering exceptional quality in our testing equipment, calibration services, and customer support. Our team is now better equipped to ensure that all our processes meet the highest international standards.</p>
            
            <p>The ISO 9001:2015 certification will help us maintain consistency in our service delivery while continuously improving our operations to better serve our clients in the construction and testing industry.</p>
        `
    },
    'new-equipment': {
        title: 'Latest Calibration Equipment Arrival',
        image: 'images/focused-industrial-engineer-using-calibration-600nw-2462349429.webp',
        date: 'August 28, 2025',
        content: `
            <p>We are excited to announce the arrival of our latest state-of-the-art calibration equipment. This new addition to our laboratory significantly enhances our testing capabilities and improves the accuracy of our measurement services.</p>
            
            <p>The new equipment features:</p>
            <ul>
                <li>Advanced digital measurement systems with enhanced precision</li>
                <li>Automated calibration processes for improved efficiency</li>
                <li>Multi-parameter testing capabilities for comprehensive analysis</li>
                <li>Enhanced data logging and reporting functions</li>
                <li>Compliance with the latest international testing standards</li>
            </ul>
            
            <p>This investment demonstrates our ongoing commitment to providing our clients with the most accurate and reliable testing services. The new equipment allows us to offer faster turnaround times while maintaining the highest levels of precision and quality.</p>
            
            <p>Our technical team has completed extensive training on the new equipment to ensure optimal operation and maximum benefit for our clients. We look forward to delivering even better service quality with these technological advancements.</p>
        `
    },
    'partnership': {
        title: 'Expanding Our Partnership Network',
        image: 'images/technicianinstrument-technician-on-job-calibrate-600nw-1020417871.webp',
        date: 'August 25, 2025',
        content: `
            <p>Gemarc Enterprises continues to strengthen its position in the testing and calibration industry by expanding our network of strategic partnerships with leading global manufacturers and technology providers.</p>
            
            <p>Our enhanced partnership network includes:</p>
            <ul>
                <li>Advanced testing equipment manufacturers from Europe and Asia</li>
                <li>Specialized calibration service providers</li>
                <li>Technology innovators in digital measurement systems</li>
                <li>Quality assurance and compliance specialists</li>
                <li>Research and development institutions</li>
            </ul>
            
            <p>These partnerships enable us to offer our clients access to the latest technologies, innovative testing solutions, and comprehensive support services. By working closely with industry leaders, we ensure that our clients benefit from cutting-edge equipment and methodologies.</p>
            
            <p>The expanded network also allows us to provide more comprehensive training programs, technical support, and maintenance services. This collaborative approach helps us deliver superior value to our clients while staying at the forefront of industry developments.</p>
        `
    }
};

function openNewsModal(newsId) {
    const modal = document.getElementById('newsModal');
    const modalContent = document.getElementById('modalContent');
    const news = newsData[newsId];
    
    if (!news) return;
    
    modalContent.innerHTML = `
        <h2>${news.title}</h2>
        <div style="color: #666; margin-bottom: 20px;">
            <i class="fas fa-calendar"></i> ${news.date}
        </div>
        <img src="${news.image}" alt="${news.title}" style="width: 100%; max-width: 600px; height: auto; border-radius: 10px; margin: 20px 0;">
        <div style="line-height: 1.6; color: #555;">
            ${news.content}
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('newsModal');
    if (event.target === modal) {
        closeNewsModal();
    }
});

// Product Showcase Functions
let showcaseCurrentSlide = 0;
const showcaseItemsPerSlide = 4;

function moveShowcase(direction) {
    const track = document.getElementById('showcaseTrack');
    
    // Check if showcase track exists (only on index page)
    if (!track) {
        return;
    }
    
    const items = track.children;
    const totalItems = items.length;
    const maxSlides = Math.ceil(totalItems / showcaseItemsPerSlide);
    
    showcaseCurrentSlide += direction;
    
    if (showcaseCurrentSlide >= maxSlides) {
        showcaseCurrentSlide = 0;
    } else if (showcaseCurrentSlide < 0) {
        showcaseCurrentSlide = maxSlides - 1;
    }
    
    const translateX = -(showcaseCurrentSlide * 100);
    track.style.transform = `translateX(${translateX}%)`;
    
    updateShowcaseDots();
}

function currentShowcaseSlide(n) {
    showcaseCurrentSlide = n - 1;
    const track = document.getElementById('showcaseTrack');
    const translateX = -(showcaseCurrentSlide * 100);
    track.style.transform = `translateX(${translateX}%)`;
    
    updateShowcaseDots();
}

function updateShowcaseDots() {
    const dots = document.querySelectorAll('.showcase-dots .dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === showcaseCurrentSlide);
    });
}

// Auto-play showcase
function autoPlayShowcase() {
    // Check if showcase exists before starting auto-play
    const track = document.getElementById('showcaseTrack');
    if (!track) {
        return;
    }
    
    setInterval(() => {
        moveShowcase(1);
    }, 5000); // Change slide every 5 seconds
}

// Initialize showcase functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only start auto-play if showcase exists
    const track = document.getElementById('showcaseTrack');
    if (track) {
        autoPlayShowcase();
    }
    
    // Handle responsive behavior
    function handleShowcaseResize() {
        const items = document.querySelectorAll('.product-item');
        const windowWidth = window.innerWidth;
        
        let itemsPerSlide;
        if (windowWidth <= 768) {
            itemsPerSlide = 2;
        } else if (windowWidth <= 1024) {
            itemsPerSlide = 3;
        } else {
            itemsPerSlide = 4;
        }
        
        // Update global variable
        window.showcaseItemsPerSlide = itemsPerSlide;
        
        // Reset to first slide on resize
        showcaseCurrentSlide = 0;
        const track = document.getElementById('showcaseTrack');
        if (track) {
            track.style.transform = 'translateX(0%)';
            updateShowcaseDots();
        }
    }
    
    // Call on load and resize
    handleShowcaseResize();
    window.addEventListener('resize', handleShowcaseResize);
});
