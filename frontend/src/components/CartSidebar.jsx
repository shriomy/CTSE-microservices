import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, Tag, AlertCircle } from 'lucide-react';
import { cartApi } from '../api/cartApi';
import { useCart } from '../context/CartContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();
  
  const { fetchCartCount } = useCart();

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCartData(data);
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
      const data = await cartApi.updateCartItem(itemId, newQuantity);
      setCartData(data);
      await fetchCartCount();
    } catch (error) {
      console.error("Failed to update quantity", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingId(itemId);
      const data = await cartApi.removeCartItem(itemId);
      setCartData(data);
      await fetchCartCount();
    } catch (error) {
      console.error("Failed to remove item", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      setCouponError('');
      const data = await cartApi.applyCoupon(couponCode);
      setCartData(data);
      setCouponCode('');
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      setCouponLoading(true);
      const data = await cartApi.removeCoupon();
      setCartData(data);
    } catch (error) {
      console.error("Failed to remove coupon", error);
    } finally {
      setCouponLoading(false);
    }
  };

  if (!isOpen) return null;

  const cartItems = cartData?.items || [];
  const totalAmount = cartData?.totalAmount || 0;
  const discountAmount = cartData?.discountAmount || 0;
  const finalAmount = cartData?.finalAmount || totalAmount;
  const appliedCoupon = cartData?.appliedCouponCode;

  return (
    <>
      <div 
        className="cart-sidebar-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          zIndex: 2000, animation: 'fadeIn 0.3s ease-out'
        }}
      />

      <div 
        className="cart-sidebar"
        style={{
          position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '450px',
          height: '100vh', background: 'white', zIndex: 2001,
          boxShadow: '-20px 0 60px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
          animation: 'slideIn 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        <div style={{ padding: '32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '10px' }}>
              <ShoppingBag size={20} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)' }}>Your Basket</h2>
          </div>
          <button onClick={onClose} style={{ padding: '8px', borderRadius: '50%', background: '#f8fafc' }} className="hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {loading && !cartData ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <ShoppingBag size={60} style={{ color: '#cbd5e1', marginBottom: '24px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Your cart is empty</h3>
              <button className="btn-primary" style={{ marginTop: '24px', width: '100%' }} onClick={onClose}>Start Shopping</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '20px', opacity: updatingId === item.id ? 0.6 : 1 }}>
                  <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.productImageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>{item.productName}</h4>
                    <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem', marginBottom: '12px' }}>${item.productPrice.toFixed(2)}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} disabled={item.quantity <= 1 || updatingId === item.id} style={{ width: '28px', height: '28px' }}><Minus size={14} /></button>
                        <span style={{ width: '24px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)} disabled={updatingId === item.id} style={{ width: '28px', height: '28px' }}><Plus size={14} /></button>
                      </div>
                      <button onClick={() => handleRemoveItem(item.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon Section */}
              <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                {appliedCoupon ? (
                  <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #d1fae5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: '700' }}>
                      <Tag size={16} /> {appliedCoupon} Applied!
                    </div>
                    <button onClick={handleRemoveCoupon} style={{ color: '#065f46', fontSize: '0.85rem', fontWeight: '800', textDecoration: 'underline' }}>Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Promo code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none' }}
                    />
                    <button 
                      type="submit" 
                      disabled={couponLoading || !couponCode.trim()}
                      style={{ padding: '0 20px', borderRadius: '12px', background: 'var(--secondary)', color: 'white', fontWeight: '700', fontSize: '0.9rem' }}
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14} /> {couponError}</div>}
              </div>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ padding: '32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '1rem' }}>
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: '700' }}>
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '16px', borderTop: '1.5px dashed #cbd5e1' }}>
                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Order Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--secondary)' }}>${finalAmount.toFixed(2)}</span>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => navigate('/checkout')}
              style={{ width: '100%', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
            >
              Checkout Now <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
