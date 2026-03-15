'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 12;

    // Filters
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
    const [sort, setSort] = useState('createdAt');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Sync with URL params (especially for search from header)
    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) {
            setSearch(query);
            setSearchInput(query);
        }
        const cat = searchParams.get('category');
        if (cat !== null) {
            setActiveCategory(cat);
        }
    }, [searchParams]);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data.categories || []));
    }, []);

    const fetchProducts = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('sort', sort);
        params.set('page', page);
        params.set('limit', limit);
        if (activeCategory) params.set('category', activeCategory);
        if (search) params.set('search', search);
        if (inStockOnly) params.set('inStock', 'true');

        fetch(`/api/products?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                let prods = data.products || [];
                // Client-side price filter
                if (minPrice) prods = prods.filter(p => (p.salePrice || p.price) >= parseFloat(minPrice));
                if (maxPrice) prods = prods.filter(p => (p.salePrice || p.price) <= parseFloat(maxPrice));
                setProducts(prods);
                setTotal(data.pagination?.total || prods.length);
                setLoading(false);
            });
    }, [activeCategory, sort, search, page, minPrice, maxPrice, inStockOnly]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [activeCategory, sort, search, minPrice, maxPrice, inStockOnly]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
    };

    const clearFilters = () => {
        setActiveCategory('');
        setSort('createdAt');
        setSearch('');
        setSearchInput('');
        setMinPrice('');
        setMaxPrice('');
        setInStockOnly(false);
        setPage(1);
    };

    const activeFilterCount = [activeCategory, search, minPrice, maxPrice, inStockOnly].filter(Boolean).length;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="shop-page">
            {/* Page Header */}
            <div className="shop-page-header">
                <div className="container">
                    <span className="section-subtitle">The Boutique</span>
                    <h1 className="section-title">All Fragrances</h1>
                    <p className="shop-header-desc">Discover our curated range of fine perfumes and rare essences.</p>
                </div>
            </div>

            <div className="container">
                <div className="shop-layout">
                    {/* Sidebar Overlay for Mobile */}
                    {sidebarOpen && (
                        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
                    )}

                    {/* Sidebar */}
                    <aside className={`shop-sidebar ${sidebarOpen ? 'open' : ''}`}>
                        <div className="sidebar-header">
                            <h3>Filters</h3>
                            {activeFilterCount > 0 && (
                                <button className="clear-filters-btn" onClick={clearFilters}>
                                    Clear all ({activeFilterCount})
                                </button>
                            )}
                        </div>

                        {/* Search */}
                        <div className="sidebar-section">
                            <h4 className="sidebar-section-title">Search</h4>
                            <form onSubmit={handleSearch} className="sidebar-search">
                                <input
                                    type="text"
                                    placeholder="Search fragrances..."
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    className="sidebar-input"
                                />
                                <button type="submit" className="sidebar-search-btn">→</button>
                            </form>
                        </div>

                        {/* Categories */}
                        <div className="sidebar-section">
                            <h4 className="sidebar-section-title">Category</h4>
                            <ul className="sidebar-category-list">
                                <li>
                                    <button
                                        className={`sidebar-cat-btn ${activeCategory === '' ? 'active' : ''}`}
                                        onClick={() => setActiveCategory('')}
                                    >
                                        <span>All Fragrances</span>
                                        <span className="cat-count">{total}</span>
                                    </button>
                                </li>
                                {categories.map(cat => (
                                    <li key={cat.id}>
                                        <button
                                            className={`sidebar-cat-btn ${activeCategory === cat.slug ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(cat.slug)}
                                        >
                                            <span>{cat.name}</span>
                                            <span className="cat-count">{cat.productCount}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Price Range */}
                        <div className="sidebar-section">
                            <h4 className="sidebar-section-title">Price Range</h4>
                            <div className="price-range-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={e => setMinPrice(e.target.value)}
                                    className="sidebar-input price-input"
                                />
                                <span className="price-separator">–</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                    className="sidebar-input price-input"
                                />
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="sidebar-section">
                            <h4 className="sidebar-section-title">Availability</h4>
                            <label className="sidebar-toggle">
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={e => setInStockOnly(e.target.checked)}
                                />
                                <span className="toggle-track"></span>
                                <span className="toggle-label">In Stock Only</span>
                            </label>
                        </div>

                        {/* Collections Link */}
                        <div className="sidebar-section sidebar-collections-link">
                            <a href="/collections" className="sidebar-collections-cta">
                                Browse by Collection →
                            </a>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="shop-main">
                        {/* Toolbar */}
                        <div className="shop-toolbar">
                            <div className="shop-toolbar-left">
                                <button
                                    className="mobile-filter-btn"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    ⚙ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                                </button>
                                <span className="product-count">
                                    {loading ? '...' : `${total} fragrances`}
                                    {activeCategory && categories.find(c => c.slug === activeCategory) && (
                                        <span className="active-filter-tag">
                                            {categories.find(c => c.slug === activeCategory)?.name}
                                            <button onClick={() => setActiveCategory('')}>×</button>
                                        </span>
                                    )}
                                    {search && (
                                        <span className="active-filter-tag">
                                            "{search}"
                                            <button onClick={() => { setSearch(''); setSearchInput(''); }}>×</button>
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="shop-toolbar-right">
                                <select
                                    value={sort}
                                    onChange={e => setSort(e.target.value)}
                                    className="sort-select"
                                >
                                    <option value="createdAt">Newest First</option>
                                    <option value="price-asc">Price: Low → High</option>
                                    <option value="price-desc">Price: High → Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                                <div className="view-toggle">
                                    <button
                                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                        title="Grid View"
                                    >⊞</button>
                                    <button
                                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                        title="List View"
                                    >☰</button>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        {loading ? (
                            <div className={viewMode === 'grid' ? 'product-grid' : 'product-list'}>
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="pc skeleton">
                                        <div className="pc-image-wrap"></div>
                                        <div className="pc-body" style={{ padding: '20px' }}>
                                            <div className="skeleton" style={{ width: '60%', height: '12px', marginBottom: '10px', borderRadius: '4px' }}></div>
                                            <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '8px', borderRadius: '4px' }}></div>
                                            <div className="skeleton" style={{ width: '40%', height: '20px', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className={viewMode === 'grid' ? 'product-grid' : 'product-list'}>
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} listMode={viewMode === 'list'} />
                                ))}
                            </div>
                        ) : (
                            <div className="shop-empty">
                                <div className="shop-empty-icon">🔍</div>
                                <h3>No fragrances found</h3>
                                <p>Try adjusting your filters or search terms.</p>
                                <button className="btn btn-primary" onClick={clearFilters}>Clear All Filters</button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="shop-pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >← Previous</button>
                                <span className="pagination-info">Page {page} of {totalPages}</span>
                                <button
                                    className="pagination-btn"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >Next →</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style jsx>{`
                .shop-page { background: #0a0a0a; min-height: 100vh; }
                .shop-page-header {
                    padding: 140px 0 60px;
                    background: linear-gradient(to bottom, #111 0%, #0a0a0a 100%);
                    border-bottom: 1px solid rgba(201,169,110,0.1);
                    text-align: center;
                }
                .shop-header-desc { color: #888; font-size: 1rem; margin-top: 0.5rem; }

                .shop-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 40px;
                    padding: 40px 0 80px;
                    align-items: start;
                }

                /* ——— SIDEBAR ——— */
                .shop-sidebar {
                    position: sticky;
                    top: 100px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    padding: 28px 24px;
                }
                .sidebar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }
                .sidebar-header h3 { font-size: 1rem; color: #fff; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
                .clear-filters-btn { background: none; border: none; color: #c9a96e; font-size: 0.75rem; cursor: pointer; padding: 0; transition: opacity 0.2s; }
                .clear-filters-btn:hover { opacity: 0.7; }

                .sidebar-section { margin-bottom: 28px; }
                .sidebar-section-title {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: #666;
                    font-weight: 700;
                    margin-bottom: 14px;
                }

                .sidebar-search { display: flex; gap: 8px; }
                .sidebar-input {
                    width: 100%;
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 10px 14px;
                    color: #fff;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .sidebar-input:focus { border-color: rgba(201,169,110,0.5); }
                .sidebar-search-btn {
                    background: rgba(201,169,110,0.15);
                    border: 1px solid rgba(201,169,110,0.3);
                    color: #c9a96e;
                    padding: 10px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background 0.2s;
                }
                .sidebar-search-btn:hover { background: rgba(201,169,110,0.25); }

                .sidebar-category-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
                .sidebar-cat-btn {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: none;
                    border: none;
                    color: #999;
                    padding: 9px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.88rem;
                    text-align: left;
                    transition: all 0.2s;
                }
                .sidebar-cat-btn:hover { background: rgba(255,255,255,0.04); color: #fff; }
                .sidebar-cat-btn.active { background: rgba(201,169,110,0.1); color: #c9a96e; font-weight: 600; }
                .cat-count { font-size: 0.7rem; color: #555; background: rgba(255,255,255,0.05); padding: 2px 7px; border-radius: 10px; }
                .sidebar-cat-btn.active .cat-count { color: #c9a96e; background: rgba(201,169,110,0.15); }

                .price-range-inputs { display: flex; align-items: center; gap: 10px; }
                .price-input { flex: 1; }
                .price-separator { color: #555; font-size: 0.9rem; flex-shrink: 0; }

                .sidebar-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; }
                .sidebar-toggle input { display: none; }
                .toggle-track {
                    width: 40px; height: 22px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 11px;
                    position: relative;
                    transition: background 0.3s;
                    flex-shrink: 0;
                }
                .toggle-track::after {
                    content: '';
                    position: absolute;
                    width: 16px; height: 16px;
                    background: #fff;
                    border-radius: 50%;
                    top: 3px; left: 3px;
                    transition: transform 0.3s;
                }
                .sidebar-toggle input:checked ~ .toggle-track { background: #c9a96e; }
                .sidebar-toggle input:checked ~ .toggle-track::after { transform: translateX(18px); }
                .toggle-label { font-size: 0.88rem; color: #bbb; }

                .sidebar-collections-link { padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); }
                .sidebar-collections-cta { color: #c9a96e; font-size: 0.8rem; font-weight: 600; text-decoration: none; letter-spacing: 0.05em; }
                .sidebar-collections-cta:hover { text-decoration: underline; }

                /* ——— TOOLBAR ——— */
                .shop-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 28px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .shop-toolbar-left { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
                .shop-toolbar-right { display: flex; align-items: center; gap: 12px; }
                .product-count { font-size: 0.85rem; color: #888; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
                .active-filter-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(201,169,110,0.1);
                    border: 1px solid rgba(201,169,110,0.3);
                    color: #c9a96e;
                    padding: 2px 10px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                }
                .active-filter-tag button {
                    background: none;
                    border: none;
                    color: #c9a96e;
                    cursor: pointer;
                    padding: 0;
                    font-size: 1rem;
                    line-height: 1;
                }

                .sort-select {
                    background: rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 8px 14px;
                    border-radius: 6px;
                    font-family: inherit;
                    font-size: 0.82rem;
                    outline: none;
                    cursor: pointer;
                }
                .view-toggle { display: flex; gap: 4px; }
                .view-btn {
                    background: none;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #666;
                    width: 34px; height: 34px;
                    border-radius: 6px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center;
                }
                .view-btn.active { border-color: #c9a96e; color: #c9a96e; background: rgba(201,169,110,0.08); }
                .view-btn:hover:not(.active) { border-color: rgba(255,255,255,0.25); color: #fff; }

                /* ——— LIST MODE ——— */
                .product-list { display: flex; flex-direction: column; gap: 16px; }

                /* ——— EMPTY ——— */
                .shop-empty { text-align: center; padding: 80px 20px; }
                .shop-empty-icon { font-size: 3rem; margin-bottom: 20px; opacity: 0.4; }
                .shop-empty h3 { font-size: 1.4rem; color: #fff; margin-bottom: 12px; }
                .shop-empty p { color: #888; margin-bottom: 24px; }

                /* ——— PAGINATION ——— */
                .shop-pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    margin-top: 48px;
                    padding-top: 32px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }
                .pagination-btn {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 10px 22px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.88rem;
                    transition: all 0.2s;
                }
                .pagination-btn:hover:not(:disabled) { border-color: #c9a96e; color: #c9a96e; }
                .pagination-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .pagination-info { color: #888; font-size: 0.85rem; }

                /* ——— MOBILE ——— */
                .mobile-filter-btn { display: none; }
                .sidebar-overlay { display: none; }

                @media (max-width: 991px) {
                    .shop-layout { grid-template-columns: 1fr; }
                    .shop-sidebar {
                        position: fixed;
                        top: 0; left: 0;
                        width: 300px;
                        height: 100vh;
                        overflow-y: auto;
                        z-index: 1000;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                        border-radius: 0;
                        border: none;
                        border-right: 1px solid rgba(255,255,255,0.08);
                        background: #111;
                    }
                    .shop-sidebar.open { transform: translateX(0); }
                    .sidebar-overlay {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.6);
                        z-index: 999;
                    }
                    .mobile-filter-btn {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.1);
                        color: #fff;
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 0.85rem;
                        cursor: pointer;
                    }
                }
            `}</style>
        </div>
    );
}

export default function ProductListing() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: '8px' }} />
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
