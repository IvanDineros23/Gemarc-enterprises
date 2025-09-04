// Smart Search Functionality for Gemarc Enterprises
document.addEventListener('DOMContentLoaded', function() {
    console.log('Search script loaded');
    setupSearch();
});

function setupSearch() {
    // Get search elements
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (!searchInput || !searchBtn) {
        console.log('Search elements not found');
        return;
    }

    console.log('Search elements found, attaching listeners');

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
        'borehole': 'drilling-machine.html',
        
        'soil': 'soil.html',
        'testing': 'soil.html',
        'geotechnical': 'soil.html',
        
        'steel': 'steel.html',
        'rebar': 'steel.html',
        'reinforcement': 'steel.html',
        'metal': 'steel.html',
        
        'industrial': 'industrial-equipment.html',
        'equipment': 'industrial-equipment.html',
        'tools': 'industrial-equipment.html',
        
        // Services
        'services': 'services.html',
        'calibration': 'services.html',
        'repair': 'services.html',
        'maintenance': 'services.html',
        'training': 'services.html',
        
        // Pages
        'about': 'about.html',
        'company': 'about.html',
        'history': 'about.html',
        
        'contact': 'contact.html',
        'location': 'contact.html',
        'email': 'contact.html',
        'phone': 'contact.html',
        'address': 'contact.html',
        
        'news': 'news.html',
        'updates': 'news.html',
        'events': 'news.html',
        
        'blog': 'blogs.html',
        'blogs': 'blogs.html',
        'articles': 'blogs.html'
    };

    // Content-based search mappings (more specific terms)
    const contentMappings = {
        'triaxial': 'soil.html',
        'compressor': 'industrial-equipment.html',
        'compression': 'concrete-mortar.html',
        'tensile': 'steel.html',
        'sieve': 'aggregates.html',
        'marshall': 'asphalt-bitumen.html',
        'core drill': 'drilling-machine.html',
        'sampler': 'soil.html',
        'penetration': 'asphalt-bitumen.html',
        'viscosity': 'asphalt-bitumen.html',
        'slump': 'concrete-mortar.html',
        'curing': 'concrete-mortar.html',
        'mixer': 'concrete-mortar.html',
        'bend': 'steel.html',
        'hardness': 'steel.html',
        'universal testing machine': 'industrial-equipment.html',
        'utm': 'industrial-equipment.html',
        'superpave': 'asphalt-bitumen.html',
        'gyratory': 'asphalt-bitumen.html',
        'calibration services': 'services.html'
    };

    // Combine all mappings
    const allMappings = { ...searchMappings, ...contentMappings };

    // Event listeners
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Function to perform search
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        console.log('Searching for:', query);
        
        if (query === '') {
            alert('Please enter a search term');
            return;
        }

        // Check for exact matches first
        if (allMappings[query]) {
            console.log('Exact match found:', allMappings[query]);
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

        console.log('Best match:', bestMatch, 'with score:', bestScore);

        // If we found a good match (score > 30), redirect
        if (bestMatch && bestScore > 30) {
            console.log('Redirecting to:', bestMatch);
            window.location.href = bestMatch;
            return;
        }

        // If no direct match found, show notification
        showNoResultsNotification(query);
    }

    function showNoResultsNotification(query) {
        // Create or get notification element
        let notification = document.querySelector('.search-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'search-notification';
            
            // Append to the products-search container for proper positioning
            const searchContainer = document.querySelector('.products-search');
            if (searchContainer) {
                searchContainer.appendChild(notification);
            } else {
                searchInput.parentNode.appendChild(notification);
            }
        }
        
        // Set notification message
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-exclamation-circle" style="font-size: 16px;"></i>
                <div>
                    <strong>No results found</strong>
                    <p style="margin: 0; font-size: 13px;">Please try different keywords or check our menu for categories.</p>
                </div>
                <button onclick="this.parentNode.parentNode.style.display='none';" style="margin-left: auto; background: none; border: none; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        notification.style.display = 'block';
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            if (notification) notification.style.display = 'none';
        }, 5000);
    }
}
