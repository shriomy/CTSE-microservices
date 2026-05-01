import React, { useState, useEffect } from 'react';
import { 
  PenTool, Highlighter, BookOpen, 
  ShoppingBag, GlassWater, ClipboardList,
  ShieldCheck, Truck, CreditCard, Star, AlertCircle, SearchX
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import { productApi } from '../api/productApi';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';

const categories = [
  { name: 'All', icon: <Star /> },
  { name: 'Pens', icon: <PenTool /> },
  { name: 'Pencils', icon: <Highlighter /> },
  { name: 'Notebooks', icon: <BookOpen /> },
  { name: 'School Bags', icon: <ShoppingBag /> },
  { name: 'Drink Bottles', icon: <GlassWater /> },
  { name: 'Stationery Sets', icon: <ClipboardList /> },
];

const features = [
  {
    icon: <ShieldCheck size={32} />,
    title: 'Premium Quality',
    desc: 'We source only the finest stationery materials for our customers.'
  },
  {
    icon: <Truck size={32} />,
    title: 'Fast Delivery',
    desc: 'Express shipping available nationwide with real-time tracking.'
  },
  {
    icon: <CreditCard size={32} />,
    title: 'Secure Payments',
    desc: 'Your transactions are protected by industry-leading encryption.'
  }
];

// Reliable inline SVG placeholder
const placeholderImage = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22500%22%20viewBox%3D%220%200%20500%20500%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22500%22%20height%3D%22500%22%2F%3E%3Ctext%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [cartMessage, setCartMessage] = useState({ show: false, message: '', type: '' });
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [activeCategory, setActiveCategory] = useState('All');
  
  const { user } = useAuth();
  const { fetchCartCount, isCartOpen, openCart, closeCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productApi.getAvailableProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      await cartApi.addToCart(productId, 1);
      
      await fetchCartCount();
      openCart();
      
      setCartMessage({ show: true, message: 'Added to cart!', type: 'success' });
      setTimeout(() => setCartMessage({ show: false, message: '', type: '' }), 3000);
      
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setCartMessage({ 
        show: true, 
        message: err.response?.data?.message || 'Failed to add to cart. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setCartMessage({ show: false, message: '', type: '' }), 3000);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

    const catSearch = activeCategory.toLowerCase();
    const catSearchSingular = catSearch.endsWith('s') ? catSearch.slice(0, -1) : catSearch;

    const filteredProducts = products.filter(product => {
      const matchesSearch = searchQuery 
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
        
      const matchesCategory = activeCategory === 'All' 
        ? true 
        : (product.category && product.category.toLowerCase().includes(catSearchSingular)) || 
          product.name.toLowerCase().includes(catSearchSingular);
        
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="landing-page-wrapper">
      <Navbar />
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />

      {cartMessage.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '16px 24px',
          borderRadius: '8px',
          background: cartMessage.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: '500',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {cartMessage.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          {cartMessage.message}
        </div>
      )}

      <main className="landing-page">
        {/* Cinematic Hero Section */}
        <section className="hero-section" style={{ animation: 'fadeIn 1s ease-out' }}>
          <div className="hero-text">
            <div style={{ display: 'inline-flex', padding: '8px 16px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Premium Stationery 2024
            </div>
            <h1 className="hero-title">Refine Your<br/>Creative Flow</h1>
            <p className="hero-subtitle">
              Experience the perfect balance of form and function with our curated collection of professional-grade stationery and workspace essentials.
            </p>
            <div className="hero-buttons">
              <a href="#storefront" className="btn-primary" style={{ textDecoration: 'none' }}>Shop Catalog</a>
              <a href="#categories" className="btn-outline" style={{ textDecoration: 'none' }}>View Categories</a>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-image-placeholder">
              <img 
                src="https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=1000&auto=format&fit=crop" 
                alt="Premium Stationery"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = placeholderImage; }}
              />
            </div>
          </div>
        </section>

        {/* Improved Categories Section */}
        <section id="categories" className="section-container" style={{ animation: 'fadeIn 1.2s ease-out' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Curated Collections</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Hand-picked supplies for every creative endeavor.</p>
          </div>
          <div className="categories-flex" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
            {categories.map((cat, index) => {
              const isActive = activeCategory === cat.name;
              return (
                <div 
                  key={index} 
                  className="category-item"
                  onClick={() => {
                    setActiveCategory(cat.name);
                    document.getElementById('storefront').scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{ 
                    cursor: 'pointer',
                    background: isActive ? 'white' : 'transparent',
                    boxShadow: isActive ? 'var(--shadow-lg)' : 'none',
                    borderColor: isActive ? 'var(--primary-light)' : '#f1f5f9',
                    width: '140px',
                    flex: '0 0 auto'
                  }}
                >
                  <div className="category-circle"
                       style={{ 
                         background: isActive ? 'var(--primary)' : '#f1f5f9',
                         color: isActive ? 'white' : 'var(--text-main)'
                       }}>
                    {React.cloneElement(cat.icon, { size: 32 })}
                  </div>
                  <span className="category-name" style={{ color: isActive ? 'var(--primary)' : 'inherit' }}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Premium Storefront Grid */}
        <section id="storefront" className="section-container" style={{ padding: '6rem 2rem', background: 'white', borderRadius: '48px', boxShadow: '0 -20px 40px rgba(0,0,0,0.02)', marginTop: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h2 className="section-title" style={{ margin: 0, textAlign: 'left', fontSize: '3rem' }}>
                {searchQuery ? `Search: ${searchQuery}` : activeCategory}
              </h2>
              <div style={{ height: '4px', width: '60px', background: 'var(--primary)', marginTop: '16px', borderRadius: '2px' }}></div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '1.1rem' }}>{filteredProducts.length} Products Available</span>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center items-center py-40">
              <div style={{ width: '64px', height: '64px', border: '6px solid #f1f5f9', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div style={{ display: 'inline-flex', padding: '32px', background: '#f8fafc', borderRadius: '32px', marginBottom: '24px', color: '#94a3b8' }}>
                <SearchX size={64} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>No matches found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1.1rem' }}>We couldn't find any products matching your current selection.</p>
              <button 
                className="btn-outline" 
                style={{ marginTop: '32px' }}
                onClick={() => { setActiveCategory('All'); navigate('/'); }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                  <div className="product-image">
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <img 
                      src={product.imageUrl || product.image || placeholderImage} 
                      alt={product.name}
                      onError={(e) => { e.target.src = placeholderImage; }}
                    />
                  </div>
                  <div className="product-content">
                    <span className="product-category" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', fontSize: '0.75rem', color: 'var(--primary)' }}>
                      {product.category || 'Essential'}
                    </span>
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-footer">
                      <span className="product-price">${product.price.toFixed(2)}</span>
                      <button 
                        className="btn-add-cart" 
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingToCart[product.id]}
                        style={{ 
                          transform: addingToCart[product.id] ? 'scale(0.9)' : 'scale(1)',
                          background: addingToCart[product.id] ? 'var(--primary)' : 'var(--secondary)'
                        }}
                      >
                        {addingToCart[product.id] ? (
                          <div style={{ width: '24px', height: '24px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                        ) : (
                          <ShoppingBag size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upgraded Service Highlights */}
        <section className="section-container" style={{ margin: '8rem auto' }}>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card" style={{ padding: '4rem 2rem' }}>
                <div className="feature-icon-wrapper" style={{ width: '80px', height: '80px', borderRadius: '24px', marginBottom: '2rem' }}>
                  {React.cloneElement(feature.icon, { size: 40 })}
                </div>
                <h3 className="feature-title" style={{ fontSize: '1.5rem' }}>{feature.title}</h3>
                <p className="feature-desc" style={{ fontSize: '1rem' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
