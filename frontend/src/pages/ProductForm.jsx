import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Save, AlertCircle, Image as ImageIcon, Sparkles } from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    availability: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct(id);
    }
  }, [id, isEditMode]);

  const fetchProduct = async (productId) => {
    try {
      const data = await productApi.getProductById(productId);
      setFormData({
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        availability: data.availability,
      });
    } catch (err) {
      setError('Failed to fetch product details.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (isEditMode) {
        await productApi.updateProduct(id, payload);
      } else {
        await productApi.createProduct(payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="landing-page-wrapper" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 2rem' }}>
        <Link to="/admin" className="back-link" style={{ marginBottom: '32px' }}>
          <ArrowLeft size={18} />
          Back to Inventory
        </Link>

        <div style={{ background: 'white', borderRadius: '32px', padding: '48px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)', margin: 0 }}>
                {isEditMode ? 'Edit Product Details' : 'Create New Product'}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>Fill in the details below to update your inventory</p>
            </div>
          </div>

          {fetching ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: '48px', height: '48px', border: '5px solid #f1f5f9', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-badge" style={{ marginBottom: '32px' }}>
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="e.g., Premium Leather Notebook"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Describe the quality and features..."
                  style={{ minHeight: '120px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Price (USD)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inventory Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
                    <input
                      type="checkbox"
                      id="availability"
                      name="availability"
                      checked={formData.availability}
                      onChange={handleChange}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                    />
                    <label htmlFor="availability" style={{ fontWeight: '600', color: 'var(--secondary)', cursor: 'pointer', margin: 0 }}>Available for Sale</label>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label">Product Image URL</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    style={{ flex: 1 }}
                  />
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#94a3b8' }}>
                    <ImageIcon size={24} />
                  </div>
                </div>
              </div>

              {formData.imageUrl && (
                <div style={{ marginTop: '24px', padding: '24px', background: '#f8fafc', borderRadius: '24px', border: '1.5px dashed #e2e8f0', textAlign: 'center' }}>
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                <Link to="/admin" className="btn-outline" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
                  Cancel
                </Link>
                <button type="submit" disabled={loading} className="btn-auth" style={{ flex: 2, margin: 0 }}>
                  {loading ? 'Processing...' : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <Save size={20} /> {isEditMode ? 'Update Product' : 'Create Product'}
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductForm;
