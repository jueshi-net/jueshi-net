// Tool directory prototype functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.querySelector('.search-box input');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const categorySections = document.querySelectorAll('.category-section');
    const toolCards = document.querySelectorAll('.tool-card, .tool-item');
    const chevronIcons = document.querySelectorAll('.category-header');
    const viewAllLinks = document.querySelectorAll('.view-all-link');

    // Store original tool visibility
    const allTools = [...toolCards];

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();

            toolCards.forEach(tool => {
                const toolText = (tool.getAttribute('data-search') || '').toLowerCase();
                const toolTitle = (tool.querySelector('.tool-title')?.textContent || '').toLowerCase();

                if (!searchTerm) {
                    tool.style.display = '';
                } else {
                    const matches = toolText.includes(searchTerm) || toolTitle.includes(searchTerm);
                    tool.style.display = matches ? '' : 'none';
                }
            });

            // Update category visibility based on search results
            categorySections.forEach(section => {
                const visibleTools = section.querySelectorAll('.tool-item:not([style*="display: none"])');
                section.style.display = visibleTools.length > 0 ? '' : 'none';
            });
        });
    }

    // Category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            if (category === 'all') {
                // Show all tools
                toolCards.forEach(tool => {
                    tool.style.display = '';
                });
                categorySections.forEach(section => {
                    section.style.display = '';
                });
            } else {
                // Filter tools by category
                toolCards.forEach(tool => {
                    const toolCategory = tool.getAttribute('data-category');
                    tool.style.display = toolCategory === category ? '' : 'none';
                });

                // Show/hide categories based on filter
                categorySections.forEach(section => {
                    const sectionCategory = section.getAttribute('data-category');
                    section.style.display = sectionCategory === category ? '' : 'none';
                });
            }
        });
    });

    // Category expand/collapse
    chevronIcons.forEach(header => {
        header.addEventListener('click', function(e) {
            if (e.target.closest('.view-all-link')) return;

            const section = this.closest('.category-section');
            section.classList.toggle('expanded');
        });
    });

    // View all link functionality
    viewAllLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Expand the "外贸单据" section which is initially expanded
                const foreignTradeSection = document.querySelector('[data-category="foreign-trade"]');
                if (foreignTradeSection) {
                    foreignTradeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Quick tool hover effects
    const quickTools = document.querySelectorAll('.quick-tool');
    quickTools.forEach(tool => {
        tool.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(108, 93, 211, 0.1)';
        });

        tool.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });

    // Mobile menu toggle (basic implementation)
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            // Basic implementation - could show overlay menu in real app
            console.log('Menu button clicked');
        });
    }

    // Initialize with "外贸单据" category expanded (as per spec)
    const foreignTradeSection = document.querySelector('[data-category="foreign-trade"]');
    if (foreignTradeSection) {
        foreignTradeSection.classList.add('expanded');
    }

    // Set initial category button states
    const allCategoryBtn = document.querySelector('[data-category="all"]');
    if (allCategoryBtn) {
        allCategoryBtn.classList.add('active');
    }

    // Make all tool cards clickable
    toolCards.forEach(tool => {
        tool.addEventListener('click', function() {
            const title = this.querySelector('.tool-title')?.textContent || 'Tool';
            console.log(`Navigating to: ${title}`);
            // In a real implementation, this would navigate to the tool page
        });
    });
});

// Utility function to debounce search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}