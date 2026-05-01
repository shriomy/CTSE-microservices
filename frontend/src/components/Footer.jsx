import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-container" style={{ background: 'var(--secondary)', color: 'white', padding: '100px 2rem 40px', marginTop: '8rem' }}>
      <div className="footer-content" style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '80px', paddingBottom: '80px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Brand Section */}
        <div className="footer-section">
          <Link to="/" className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '10px' }}>
              <ShoppingBag size={20} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'white', fontFamily: 'var(--font-heading)' }}>
              SCHOOL<span style={{ color: 'var(--primary)' }}>SUPPLY</span>
            </span>
          </Link>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.8', marginBottom: '32px', maxWidth: '320px' }}>
            Elevating the educational journey with premium stationery and workspace essentials designed for modern creators.
          </p>
          <div className="flex gap-4" style={{ display: 'flex', gap: '16px' }}>
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.3s' }} className="hover:bg-primary">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="footer-section">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Navigation</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['Home', 'Shop Catalog', 'About Us', 'Contact'].map((item, i) => (
              <li key={i} style={{ marginBottom: '16px' }}>
                <Link to="/" style={{ color: '#94a3b8', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px' }} className="hover:text-white">
                  <ArrowRight size={14} className="opacity-0 -translate-x-2 transition-all" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Section */}
        <div className="footer-section">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Collections</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['Writing Tools', 'Notebooks', 'School Gear', 'Office Sets'].map((item, i) => (
              <li key={i} style={{ marginBottom: '16px' }}>
                <a href="#" style={{ color: '#94a3b8', transition: 'all 0.3s' }} className="hover:text-white">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter/Contact Section */}
        <div className="footer-section">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Connect</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', color: '#94a3b8' }}>
              <MapPin size={20} className="text-primary" />
              <span>123 Innovation Drive, Colombo</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', color: '#94a3b8' }}>
              <Phone size={20} className="text-primary" />
              <span>+94 11 234 5678</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8' }}>
              <Mail size={20} className="text-primary" />
              <span>hello@schoolsupply.lk</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom" style={{ maxWidth: '1400px', margin: '40px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} SCHOOLSUPPLY. Built with precision.</p>
        <div className="flex gap-8" style={{ display: 'flex', gap: '32px' }}>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
