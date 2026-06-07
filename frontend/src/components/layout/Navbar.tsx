import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Map, MessageCircle, PlusCircle, ChevronDown, LogOut, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features',     href: '/#features' },
  { label: 'Destinations', href: '/#destinations' },
  { label: 'Data Sources', href: '/#data-sources' },
  { label: 'Pricing',      href: '/#pricing' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isHome = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  // Smooth-scroll anchor handler
  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.slice(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 200);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileOpen(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled || !isHome ? 'rgba(17,17,17,0.92)' : 'transparent',
        backdropFilter: scrolled || !isHome ? 'blur(20px)' : 'none',
        borderBottom: scrolled || !isHome ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <span className="text-2xl transition-transform group-hover:rotate-12 duration-300">🧭</span>
          <span className="font-bold text-lg">
            <span className="gradient-text">Compass</span>
            <span className="text-slate-300"> AI</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {/* Anchor links – always visible */}
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchor(e, link.href)}
              className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}

          {/* Auth-only links */}
          {isAuthenticated && (
            <>
              <Link to="/trips" className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
                <Map size={14} /> My Trips
              </Link>
              <Link to="/chat" className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
                <MessageCircle size={14} /> Chat
              </Link>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/plan" className="hidden sm:block">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                  <PlusCircle size={15} /> Plan Trip
                </motion.button>
              </Link>

              {/* User dropdown */}
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: '#c8956c' }}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-slate-300 hidden sm:block">{user?.username}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden border shadow-2xl"
                      style={{ background: '#242424', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <p className="text-sm font-medium text-white">{user?.full_name || user?.username}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                      </div>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <button className="btn-secondary text-sm py-2 px-4">Sign In</button>
              </Link>
              <Link to="/register">
                <button className="btn-primary text-sm py-2 px-4">Get Started</button>
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t overflow-hidden"
            style={{ background: 'rgba(17,17,17,0.97)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="px-6 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href}
                  onClick={(e) => handleAnchor(e, link.href)}
                  className="block px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  {link.label}
                </a>
              ))}
              {isAuthenticated && (
                <>
                  <Link to="/trips" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    My Trips
                  </Link>
                  <Link to="/chat" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    Chat
                  </Link>
                  <Link to="/plan" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors">
                    ✈️ Plan New Trip
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
