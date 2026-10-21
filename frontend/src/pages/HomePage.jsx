import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, PackageOpen, Layers } from 'lucide-react';
import { fetchProducts } from '../features/products/productSlice';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const HomePage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, page, pages, total, loading, error } = useSelector((state) => state.products);

  const keyword = searchParams.get('keyword') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const sortParam = searchParams.get('sort') || '';
  const pageParam = parseInt(searchParams.get('page')) || 1;

  const [category, setCategory] = useState(categoryParam);
  const [sort, setSort] = useState(sortParam);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Synchronize URL query params
  useEffect(() => {
    dispatch(
      fetchProducts({
        keyword,
        category,
        sort,
        minPrice,
        maxPrice,
        page: pageParam,
      })
    );
  }, [dispatch, keyword, category, sort, pageParam]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const newParams = new URLSearchParams(searchParams);
    if (newCat && newCat !== 'All') {
      newParams.set('category', newCat);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    const newParams = new URLSearchParams(searchParams);
    if (newSort) {
      newParams.set('sort', newSort);
    } else {
      newParams.delete('sort');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleApplyPriceFilter = () => {
    dispatch(
      fetchProducts({
        keyword,
        category,
        sort,
        minPrice,
        maxPrice,
        page: 1,
      })
    );
  };

  const handleResetFilters = () => {
    setCategory('All');
    setSort('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      {!keyword && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Next-Gen MERN E-Commerce</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Curated Essentials for Modern Living.
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/80 leading-relaxed max-w-xl">
              Discover authentic products, enjoy instant OTP verification, secure Razorpay checkout, and swift doorstep fulfillment.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="#catalog"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl text-sm shadow-lg hover:bg-indigo-50 transition-all"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <div className="inline-flex items-center space-x-2 px-5 py-3 bg-white/10 text-white font-medium rounded-xl text-sm backdrop-blur-sm border border-white/10">
                <Layers className="w-4 h-4 text-indigo-300" />
                <span>Verified Inventory</span>
              </div>
            </div>
          </div>

          {/* Decorative glowing gradient circle */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        </section>
      )}

      {/* Catalog Section */}
      <section id="catalog" className="scroll-mt-24">
        {/* Section title & stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {keyword ? `Search Results for "${keyword}"` : 'Featured Products'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {products.length} of {total} products available
            </p>
          </div>
          {keyword && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start"
            >
              Clear Search Filter
            </button>
          )}
        </div>

        {/* Main Layout: Filters Sidebar + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ProductFilters
                category={category}
                onCategoryChange={handleCategoryChange}
                sort={sort}
                onSortChange={handleSortChange}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onApplyPriceFilter={handleApplyPriceFilter}
                onResetFilters={handleResetFilters}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <Loader message="Fetching products from ShopNest..." size="large" />
            ) : error ? (
              <Message variant="error">{error}</Message>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any products matching your selected criteria. Try adjusting your search keyword or price bounds.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12 pt-6 border-t border-slate-200">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {[...Array(pages).keys()].map((p) => {
                      const pageNum = p + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                            pageNum === page
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= pages}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
