import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { user } = useAuth();
  const { fetchCartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [user, navigate]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartApi.getCart();
      setCartItems(cartData.items || []);
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      setUpdatingId(itemId);
      await cartApi.updateCartItem(itemId, newQuantity);
      
      // Update local state instantly for UI
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity, subtotal: item.productPrice * newQuantity }
            : item
        )
      );
      
      await fetchCartCount(); // Update navbar
    } catch (error) {
      console.error("Failed to update quantity", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingId(itemId);
      await cartApi.removeCartItem(itemId);
      
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      await fetchCartCount();
    } catch (error) {
      console.error("Failed to remove item", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="landing-page-wrapper">
      <Navbar />

      <main className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Your Cart</h1>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid #f3f4f6', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <ShoppingCart size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Your cart is empty</h2>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Looks like you haven't added any stationery yet.</p>
            <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout" style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <div className="cart-items-section">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card" style={{ 
                  opacity: updatingId === item.id ? 0.6 : 1,
                  background: 'white',
                  borderRadius: '24px',
                  padding: '24px',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: '24px',
                  marginBottom: '20px',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}>
                  <div style={{ width: '140px', height: '140px', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
                    <img 
                      src={item.productImageUrl || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22500%22%20viewBox%3D%220%200%20500%20500%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22500%22%20height%3D%22500%22%2F%3E%3Ctext%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'} 
                      alt={item.productName} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22500%22%20viewBox%3D%220%200%20500%20500%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22500%22%20height%3D%22500%22%2F%3E%3Ctext%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
                    />
                  </div>
                  
                  <div className="cart-item-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 className="cart-item-title" style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', color: 'var(--secondary)' }}>{item.productName}</h3>
                        <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>${item.productPrice.toFixed(2)}</div>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updatingId === item.id}
                        style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '12px', transition: 'all 0.2s' }}
                        className="hover:bg-red-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    <div className="cart-item-actions" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="quantity-controls" style={{ background: '#f1f5f9', borderRadius: '14px', padding: '4px' }}>
                        <button 
                          className="quantity-btn" 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1 || updatingId === item.id}
                          style={{ width: '40px', height: '40px' }}
                        >
                          <Minus size={18} />
                        </button>
                        <div className="quantity-display" style={{ width: '50px', fontSize: '1.1rem' }}>{item.quantity}</div>
                        <button 
                          className="quantity-btn"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          disabled={updatingId === item.id}
                          style={{ width: '40px', height: '40px' }}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="cart-item-subtotal" style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--secondary)' }}>
                        ${item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-wrapper">
              <div className="cart-summary" style={{ background: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #f1f5f9', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', position: 'sticky', top: '120px' }}>
                <h2 className="summary-title" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '32px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>Summary</h2>
                
                <div className="summary-row" style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                  <span style={{ fontWeight: '700' }}>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="summary-row" style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ color: '#10b981', fontWeight: '800' }}>FREE</span>
                </div>
                <div className="summary-row" style={{ marginBottom: '32px', fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Est. Tax</span>
                  <span style={{ fontWeight: '700' }}>$0.00</span>
                </div>
                
                <div className="summary-row total" style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '24px', marginTop: '24px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>Total</span>
                  <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>${totalAmount.toFixed(2)}</span>
                </div>
                
                <button 
                  className="btn-checkout" 
                  onClick={() => navigate('/checkout')}
                  style={{ background: 'var(--secondary)', height: '64px', fontSize: '1.2rem', marginTop: '40px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.15)' }}
                >
                  Checkout Now <ArrowRight size={24} />
                </button>
                
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <Link to="/" style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} className="hover:text-primary">
                    <ShoppingCart size={18} /> Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
