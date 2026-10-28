export function initPortfolioFilter() {
    const filterPills = document.querySelectorAll('.filter-pill');
    const projectCards = document.querySelectorAll('.project-card');
    const searchInput = document.getElementById('project-search');

    if (!filterPills.length || !projectCards.length) return;

    let currentFilter = 'all';
    let currentSearch = '';

    function updateGrid() {
        projectCards.forEach(card => {
            const category = card.getAttribute('data-category') || '';
            const title = (card.getAttribute('data-title') || '').toLowerCase();
            
            const matchesFilter = currentFilter === 'all' || category.split(' ').includes(currentFilter);
            const matchesSearch = title.includes(currentSearch);

            if (matchesFilter && matchesSearch) {
                card.classList.remove('is-hidden');
            } else {
                card.classList.add('is-hidden');
            }
        });
    }

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Update active state
            filterPills.forEach(p => {
                p.classList.remove('is-active');
                p.setAttribute('aria-pressed', 'false');
            });
            pill.classList.add('is-active');
            pill.setAttribute('aria-pressed', 'true');

            // Apply filter
            currentFilter = pill.getAttribute('data-filter');
            updateGrid();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase().trim();
            updateGrid();
        });
    }
}
