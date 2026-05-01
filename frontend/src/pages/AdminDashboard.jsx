import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { adminCouponApi } from '../api/adminCouponApi';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Plus, Edit2, Trash2, AlertCircle, Search, Package, TrendingUp, Users, DollarSign, Filter, Tag, Calendar, CheckCircle2 } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Coupon Form State
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercentage: '', expiryDate: '', active: true });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 'products') {
        const data = await productApi.getAllProducts();
        setProducts(data);
      } else {
        const data = await adminCouponApi.getAllCoupons();
        setCoupons(data);
      }
    } catch (err) {
      setError('Failed to fetch data. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      // Ensure empty strings are sent as null for the date
      const payload = {
        ...newCoupon,
        discountPercentage: parseFloat(newCoupon.discountPercentage),
        expiryDate: newCoupon.expiryDate ? `${newCoupon.expiryDate}T23:59:59` : null
      };
      
      await adminCouponApi.createCoupon(payload);
      setShowCouponForm(false);
      setNewCoupon({ code: '', discountPercentage: '', expiryDate: '', active: true });
      fetchData();
    } catch (err) {
      console.error("Coupon Error:", err);
      alert('Failed to create coupon. Check console for details.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Delete this promo code?')) {
      try {
        await adminCouponApi.deleteCoupon(id);
        setCoupons(coupons.filter(c => c.id !== id));
      } catch (err) {
        alert('Failed to delete coupon.');
      }
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="landing-page-wrapper" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.02em' }}>Management Console</h1>
            <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
              <button 
                onClick={() => setActiveTab('products')}
                style={{ fontSize: '1rem', fontWeight: '700', padding: '8px 0', borderBottom: activeTab === 'products' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'products' ? 'var(--secondary)' : '#94a3b8' }}
              >
                Products Inventory
              </button>
              <button 
                onClick={() => setActiveTab('coupons')}
                style={{ fontSize: '1rem', fontWeight: '700', padding: '8px 0', borderBottom: activeTab === 'coupons' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'coupons' ? 'var(--secondary)' : '#94a3b8' }}
              >
                Promo Codes
              </button>
            </div>
          </div>
          
          {activeTab === 'products' ? (
            <Link to="/admin/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '14px 28px' }}>
              <Plus size={20} /> Add New Product
            </Link>
          ) : (
            <button onClick={() => setShowCouponForm(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px' }}>
              <Tag size={20} /> Create Promo Code
            </button>
          )}
        </div>

        {activeTab === 'products' ? (
          <>
            {/* Products Table (Same as before but refined) */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <div style={{ position: 'relative', marginBottom: '32px', maxWidth: '500px' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search inventory..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none' }}
                />
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '20px 32px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '20px 32px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '20px 32px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '20px 32px', textAlign: 'right', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '20px 32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img src={product.imageUrl} alt="" style={{ width: '50px', height: '50px', objectFit: 'contain', background: '#f8fafc', borderRadius: '8px' }} />
                          <div style={{ fontWeight: '700' }}>{product.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 32px', fontWeight: '800' }}>${product.price.toFixed(2)}</td>
                      <td style={{ padding: '20px 32px' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800', background: product.availability ? '#ecfdf5' : '#fff1f2', color: product.availability ? '#059669' : '#e11d48' }}>
                          {product.availability ? 'Available' : 'Sold Out'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} style={{ p: '8px', background: '#f1f5f9', borderRadius: '8px' }}><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} style={{ p: '8px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {coupons.map((coupon) => (
              <div key={coupon.id} style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px 20px', background: 'var(--primary)', color: 'white', fontWeight: '900', borderRadius: '0 0 0 20px', fontSize: '1.2rem' }}>
                  {coupon.discountPercentage}% OFF
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Tag size={20} />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)', letterSpacing: '1px' }}>{coupon.code}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> Expires: {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color={coupon.active ? '#10b981' : '#cbd5e1'} /> Status: {coupon.active ? 'Active' : 'Inactive'}</div>
                </div>
                <button 
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  style={{ marginTop: '24px', width: '100%', padding: '12px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Trash2 size={16} /> Delete Promo Code
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Coupon Modal */}
        {showCouponForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '32px' }}>Create New Promo</h2>
              <form onSubmit={handleCreateCoupon}>
                <div className="form-group">
                  <label className="form-label">Coupon Code (e.g., WINTER50)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Percentage (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    min="1" 
                    max="100"
                    value={newCoupon.discountPercentage}
                    onChange={(e) => setNewCoupon({...newCoupon, discountPercentage: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                  <button type="button" onClick={() => setShowCouponForm(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#f1f5f9', fontWeight: '700' }}>Cancel</button>
                  <button type="submit" className="btn-auth" style={{ flex: 2, margin: 0 }}>Create Coupon</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
