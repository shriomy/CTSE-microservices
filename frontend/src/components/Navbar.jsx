import React from 'react';
import { Menu, Search, User, ShoppingCart, LogOut, Settings, ShoppingBag, Package } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, fetchCartCount, openCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');

  React.useEffect(() => {
    if (user) fetchCartCount();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(185, 28, 28, 0.2)' }}>
            <ShoppingBag size={24} />
          </div>
          <span style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--secondary)', fontFamily: 'var(--font-heading)' }}>
            SCHOOL<span style={{ color: 'var(--primary)' }}>SUPPLY</span>
          </span>
        </Link>

        {/* Dynamic Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search for stationery, notebooks, pens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', background: '#f1f5f9', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
                <User size={20} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--secondary)' }}>{user.name}</span>
              </div>
              
              {user.role === 'ROLE_ADMIN' && (
                <Link to="/admin" className="nav-icon-btn" title="Admin Panel">
                  <Settings size={22} />
                </Link>
              )}

              <button onClick={openCart} className="nav-icon-btn cart-btn" title="Shopping Cart" style={{ position: 'relative', background: 'transparent' }}>
                <ShoppingCart size={22} />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </button>

              <Link to="/orders" className="nav-icon-btn" title="Order History">
                <Package size={22} />
              </Link>

              <button onClick={handleLogout} className="nav-icon-btn" title="Logout">
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" className="btn-outline" style={{ padding: '10px 28px', fontSize: '0.95rem' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '10px 28px', fontSize: '0.95rem' }}>Join Now</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
