import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, MapPin, Star, Clock, ChevronDown, Menu, X,
  Zap, Shield, Truck, Headphones, Bell,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ─── Animated counter sub-component (hooks safe) ─────────────────────────────
const StatCard = ({
  value, suffix, label, icon, start,
}: { value: number; suffix: string; label: string; icon: string; start: boolean }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / 2200, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, value]);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 44, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 15, marginTop: 8 }}>{label}</div>
    </div>
  );
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { emoji: "🍛", name: "Biryani",      grad: ["#f59e0b","#f97316"] },
  { emoji: "🍕", name: "Pizza",        grad: ["#ef4444","#f43f5e"] },
  { emoji: "🍔", name: "Burgers",      grad: ["#eab308","#f59e0b"] },
  { emoji: "🍜", name: "Chinese",      grad: ["#10b981","#14b8a6"] },
  { emoji: "🍰", name: "Desserts",     grad: ["#ec4899","#a855f7"] },
  { emoji: "🥘", name: "South Indian", grad: ["#f97316","#ef4444"] },
  { emoji: "🧆", name: "North Indian", grad: ["#f59e0b","#eab308"] },
  { emoji: "🥗", name: "Healthy",      grad: ["#22c55e","#10b981"] },
  { emoji: "☕", name: "Beverages",    grad: ["#92400e","#d97706"] },
];

const RESTAURANTS = [
  { name: "Spice Garden",    cuisine: "South Indian", rating: 4.8, time: "25 min", price: "₹180 for two", tag: "Popular",      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80" },
  { name: "The Pizza House", cuisine: "Italian",      rating: 4.6, time: "30 min", price: "₹350 for two", tag: "Top Rated",    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80" },
  { name: "Biryani Bros",    cuisine: "Mughlai",      rating: 4.7, time: "35 min", price: "₹280 for two", tag: "Bestseller",   image: "https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=600&q=80" },
  { name: "Dragon Palace",   cuisine: "Chinese",      rating: 4.5, time: "20 min", price: "₹240 for two", tag: "Fast Delivery",image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80" },
  { name: "Burger Nation",   cuisine: "American",     rating: 4.4, time: "22 min", price: "₹300 for two", tag: "New",          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80" },
  { name: "Sweet Cravings",  cuisine: "Desserts",     rating: 4.9, time: "15 min", price: "₹150 for two", tag: "Fan Favourite",image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80" },
];

const FEATURES = [
  { icon: Zap,       title: "Lightning Fast Delivery", desc: "Orders delivered in 30 minutes or less. We partner with only the fastest riders." },
  { icon: Shield,    title: "Secure Payments",         desc: "Bank-grade encryption on every transaction. Pay with card, UPI, or cash on delivery." },
  { icon: Truck,     title: "Real-Time Tracking",      desc: "Watch your order move in real time from the kitchen to your doorstep." },
  { icon: Star,      title: "Verified Restaurants",    desc: "Every restaurant is quality-checked and certified before joining our platform." },
  { icon: Headphones,title: "24/7 Support",            desc: "Our dedicated support team is always available to resolve any issue instantly." },
  { icon: Bell,      title: "Live Notifications",      desc: "Get instant SMS and in-app alerts at every step of your order journey." },
];

const STATS = [
  { value: 500,   suffix: "+", label: "Restaurants",      icon: "🍽️" },
  { value: 10000, suffix: "+", label: "Orders Delivered", icon: "📦" },
  { value: 50,    suffix: "+", label: "Cities",           icon: "🌆" },
  { value: 99,    suffix: "%", label: "Satisfaction",     icon: "⭐" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Food Blogger",       rating: 5, text: "FoodFlow completely changed how I order food. The delivery is incredibly fast and the restaurant selection is unmatched!",  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"  },
  { name: "Rahul Mehta",  role: "Software Engineer",  rating: 5, text: "I order lunch through FoodFlow every day at work. The tracking feature is brilliant and food always arrives hot!",           avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"  },
  { name: "Anjali Gupta", role: "Marketing Manager",  rating: 5, text: "Love the variety! From biryani to pizza, every cuisine is covered. The payment system is super secure too.",               avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali" },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=85",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1600&q=85",
];

const SOCIAL_LINKS: any[] = [];

// ─── Main Page ────────────────────────────────────────────────────────────────
export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [query,        setQuery]        = useState("");
  const [heroIdx,      setHeroIdx]      = useState(0);
  const [navOpen,      setNavOpen]      = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  
  // UX states for guest CTA highlighting
  const [highlightCTA, setHighlightCTA] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const s = localStorage.getItem("lp_theme");
    if (s === "dark" || s === "light") return s;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const statsRef = useRef<HTMLDivElement>(null);

  const dk = theme === "dark";

  // Theme persistence
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dk);
    localStorage.setItem("lp_theme", theme);
  }, [theme, dk]);

  // Navbar scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Hero slideshow
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Stats observer
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "SUPER_ADMIN") navigate("/superadmin");
      else navigate(`/restaurants`);
    } else {
      handleGuestClick();
    }
  };

  const handleGuestClick = () => {
    // Show modal
    setShowGuestModal(true);
    
    // Smooth scroll to CTA section
    const ctaSection = document.getElementById("cta-section");
    if (ctaSection) {
      const y = ctaSection.getBoundingClientRect().top + window.scrollY - 80; // 80px offset for sticky nav
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    // Trigger highlight animation
    setHighlightCTA(true);
    setTimeout(() => {
      setHighlightCTA(false);
    }, 3000);
  };

  const handleRestaurantClick = () => {
    if (!user) {
      handleGuestClick();
    } else {
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "SUPER_ADMIN") {
        navigate("/superadmin");
      } else {
        // Authenticated customer goes to restaurants listing
        navigate("/restaurants");
      }
    }
  };

  const navLinks = [
    { label: "Home",        href: "#home"        },
    { label: "Restaurants", href: "#restaurants"  },
    { label: "Features",    href: "#features"     },
    { label: "Contact",     href: "#footer"       },
  ];

  // CSS colours based on theme
  const bg       = dk ? "#0f1117" : "#ffffff";
  const surface  = dk ? "#181c27" : "#f9f6f2";
  const surfaceAlt= dk ? "#0a0d14" : "#fff7f0";
  const text     = dk ? "#f1f5f9" : "#1a1a1a";
  const muted    = dk ? "#94a3b8" : "#6b7280";
  const border   = dk ? "#1e2535" : "#f0f0f0";
  const cardBg   = dk ? "#181c27" : "#ffffff";
  const navBg    = scrolled
    ? (dk ? "rgba(15,17,23,0.96)" : "rgba(255,255,255,0.96)")
    : "transparent";

  return (
    <>
      {/* Global keyframes */}
      <style>{`
        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .lp-fu      { animation: lp-fade-up 0.7s cubic-bezier(.16,1,.3,1) both; }
        .lp-fu-d1   { animation-delay: 0.10s; }
        .lp-fu-d2   { animation-delay: 0.22s; }
        .lp-fu-d3   { animation-delay: 0.34s; }
        .lp-fu-d4   { animation-delay: 0.46s; }
        @keyframes lp-float {
          0%,100% { transform: translateY(0);   }
          50%     { transform: translateY(-10px);}
        }
        .lp-float   { animation: lp-float 4s ease-in-out infinite; }
        @keyframes lp-hero-zoom {
          from { transform: scale(1.07); }
          to   { transform: scale(1);   }
        }
        .lp-zoom { animation: lp-hero-zoom 9s ease-out both; }
        .lp-nav-link { text-decoration:none; font-weight:600; font-size:15px; transition:color .2s; }
        .lp-card-hover { transition: transform .25s, box-shadow .25s; }
        .lp-card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.18) !important; }
        .lp-cat-btn { transition: transform .25s, box-shadow .25s, border-color .25s !important; cursor:pointer; }
        .lp-cat-btn:hover { transform:translateY(-6px); box-shadow:0 12px 32px rgba(249,115,22,.2)!important; border-color:#f97316!important; }
        .lp-feat-card { transition: transform .25s, box-shadow .25s, border-color .25s; }
        .lp-feat-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(249,115,22,.12); border-color:#f97316!important; }
        .lp-social { transition: background .2s; }
        .lp-social:hover { background:#f97316!important; }
        .lp-footer-link { text-decoration:none; display:block; margin-bottom:12px; font-size:14px; transition:color .2s; }
        .lp-footer-link:hover { color:#f97316!important; }
        @keyframes lp-cta-glow {
          0% { box-shadow: 0 0 0 0 rgba(249,115,22,0.7); transform: scale(1); }
          50% { box-shadow: 0 0 20px 10px rgba(249,115,22,0.4); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); transform: scale(1); }
        }
        .lp-cta-highlight { animation: lp-cta-glow 1.5s ease-in-out infinite; border: 2px solid #fff; }
      `}</style>

      {/* Guest Onboarding Modal */}
      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Welcome to FoodFlow! 🍽️</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Create an account to view restaurant menus, add items to your cart, and place orders instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={() => navigate("/register")} className="w-full h-12 text-base font-bold btn-brand-gradient border-0 text-white shadow-lg shadow-brand-500/25">
              Get Started Free
            </Button>
            <Button onClick={() => navigate("/login")} variant="outline" className="w-full h-12 text-base font-bold">
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div style={{ background: bg, color: text, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif" }}>

        {/* ══════════════════════════════════════════
            NAVBAR
        ══════════════════════════════════════════ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: navBg,
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${border}` : "none",
          transition: "all .3s",
          padding: "0 24px",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>

            {/* Logo */}
            <a href="#home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, boxShadow: "0 4px 14px rgba(249,115,22,.4)",
              }}>🍽️</div>
              <span style={{
                fontWeight: 800, fontSize: 22, letterSpacing: -0.5,
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>FoodFlow</span>
            </a>

            {/* Desktop links */}
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {navLinks.map(l => (
                <a key={l.label} href={l.href} className="lp-nav-link"
                  style={{ color: scrolled ? (dk ? "#94a3b8" : "#374151") : "rgba(255,255,255,0.85)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#f97316"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = scrolled ? (dk ? "#94a3b8" : "#374151") : "rgba(255,255,255,0.85)"; }}
                >{l.label}</a>
              ))}
            </div>

            {/* Auth + theme */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1px solid ${scrolled ? border : "rgba(255,255,255,0.3)"}`,
                background: scrolled ? (dk ? "#181c27" : "#f9fafb") : "rgba(255,255,255,0.12)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>{dk ? "☀️" : "🌙"}</button>

              <Link to="/login" style={{
                textDecoration: "none", fontWeight: 600, fontSize: 14,
                padding: "8px 20px", borderRadius: 10,
                border: `1.5px solid ${scrolled ? "#f97316" : "rgba(255,255,255,0.7)"}`,
                color: scrolled ? "#f97316" : "#fff",
                background: "transparent", transition: "all .2s",
              }}>Login</Link>

              <Link to="/register" style={{
                textDecoration: "none", fontWeight: 700, fontSize: 14,
                padding: "8px 22px", borderRadius: 10,
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                color: "#fff", boxShadow: "0 4px 14px rgba(249,115,22,.4)",
              }}>Sign Up Free</Link>

              {/* Hamburger (mobile) */}
              <button onClick={() => setNavOpen(!navOpen)} style={{
                border: "none", background: "none", cursor: "pointer",
                color: scrolled ? text : "#fff", display: "none",
              }} className="lp-hamburger">
                {navOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile drawer */}
          {navOpen && (
            <div style={{
              background: dk ? "#181c27" : "#fff",
              borderTop: `1px solid ${border}`,
              padding: "16px 24px 24px",
            }}>
              {navLinks.map(l => (
                <a key={l.label} href={l.href} onClick={() => setNavOpen(false)} style={{
                  display: "block", padding: "11px 0", fontWeight: 600,
                  color: muted, textDecoration: "none", fontSize: 15,
                  borderBottom: `1px solid ${border}`,
                }}>{l.label}</a>
              ))}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <Link to="/login" onClick={() => setNavOpen(false)} style={{
                  flex: 1, textAlign: "center", padding: 12, borderRadius: 10,
                  border: "1.5px solid #f97316", color: "#f97316",
                  textDecoration: "none", fontWeight: 600,
                }}>Login</Link>
                <Link to="/register" onClick={() => setNavOpen(false)} style={{
                  flex: 1, textAlign: "center", padding: 12, borderRadius: 10,
                  background: "linear-gradient(135deg,#f97316,#ea580c)",
                  color: "#fff", textDecoration: "none", fontWeight: 700,
                }}>Sign Up</Link>
              </div>
            </div>
          )}
        </nav>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section id="home" style={{ position: "relative", height: "100vh", minHeight: 620, overflow: "hidden" }}>

          {/* Slideshow background */}
          {HERO_IMAGES.map((img, i) => (
            <div key={img} style={{
              position: "absolute", inset: 0,
              opacity: i === heroIdx ? 1 : 0,
              transition: "opacity 1.4s ease",
            }}>
              <div className="lp-zoom" style={{ width: "100%", height: "100%" }}>
                <img src={img} alt="" style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  filter: "brightness(0.36) saturate(1.2)",
                }} />
              </div>
            </div>
          ))}

          {/* Overlay gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg,rgba(234,88,12,.3) 0%,rgba(0,0,0,0) 100%)",
          }} />

          {/* Hero content */}
          <div style={{
            position: "relative", zIndex: 10, maxWidth: 920, margin: "0 auto",
            padding: "0 24px", height: "100%",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center",
          }}>

            {/* Pill badge */}
            <div className="lp-fu lp-fu-d1" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(249,115,22,.18)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(249,115,22,.4)", borderRadius: 100,
              padding: "6px 18px", fontSize: 13, fontWeight: 600, color: "#fed7aa",
              marginBottom: 24,
            }}>
              <span style={{ color: "#f97316", fontSize: 10 }}>●</span>
              India's fastest growing food platform
            </div>

            <h1 className="lp-fu lp-fu-d2" style={{
              fontSize: "clamp(2.6rem,7vw,5.5rem)", fontWeight: 900, lineHeight: 1.05,
              color: "#fff", letterSpacing: -2, marginBottom: 20,
            }}>
              Discover the <span style={{ color: "#fb923c" }}>best food</span><br />near you
            </h1>

            <p className="lp-fu lp-fu-d3" style={{
              fontSize: "clamp(1rem,2.5vw,1.2rem)", color: "rgba(255,255,255,0.72)",
              maxWidth: 540, lineHeight: 1.65, marginBottom: 40,
            }}>
              Fast delivery from 500+ restaurants. Biryani, pizza, burgers, and more — all in one place.
            </p>

            {/* Search bar */}
            <form className="lp-fu lp-fu-d4" onSubmit={handleSearch} style={{
              display: "flex", width: "100%", maxWidth: 580, borderRadius: 16,
              overflow: "hidden", background: "#fff",
              boxShadow: "0 16px 48px rgba(0,0,0,.4), 0 4px 16px rgba(249,115,22,.2)",
            }}>
              <div style={{ display: "flex", alignItems: "center", flex: 1, padding: "0 20px", gap: 10 }}>
                <Search size={20} color="#9ca3af" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines, dishes…"
                  style={{
                    border: "none", outline: "none", flex: 1, fontSize: 15,
                    color: "#111", background: "transparent", padding: "18px 0",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <button type="submit" style={{
                padding: "0 28px", background: "linear-gradient(135deg,#f97316,#ea580c)",
                color: "#fff", border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 15, fontFamily: "inherit",
              }}>Find Food</button>
            </form>

            {/* Cuisine tags */}
            <div className="lp-fu lp-fu-d4" style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap", justifyContent: "center" }}>
              {["🍛 Biryani", "🍕 Pizza", "🍔 Burgers", "🥗 Healthy", "🍰 Desserts"].map(tag => (
                <button key={tag} onClick={handleRestaurantClick} style={{
                  padding: "6px 18px", borderRadius: 100,
                  background: "rgba(255,255,255,.14)", backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,.3)", color: "#fff",
                  cursor: "pointer", fontSize: 13, fontWeight: 500,
                  transition: "background .2s", fontFamily: "inherit",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(249,115,22,.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.14)"; }}
                >{tag}</button>
              ))}
            </div>
          </div>

          {/* Scroll cue */}
          <div className="lp-float" style={{
            position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
            color: "rgba(255,255,255,.55)", fontSize: 13, textAlign: "center", zIndex: 10,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}>
            <span>Scroll down</span><ChevronDown size={18} />
          </div>

          {/* Slide dots */}
          <div style={{ position: "absolute", bottom: 32, right: 32, display: "flex", gap: 8, zIndex: 10 }}>
            {HERO_IMAGES.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)} style={{
                width: i === heroIdx ? 24 : 8, height: 8, borderRadius: 4,
                background: i === heroIdx ? "#f97316" : "rgba(255,255,255,.35)",
                border: "none", cursor: "pointer", transition: "all .3s",
              }} />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CATEGORIES
        ══════════════════════════════════════════ */}
        <section id="categories" style={{ padding: "88px 24px", background: bg }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>

            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#f97316", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                WHAT'S ON YOUR MIND?
              </p>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: -1 }}>
                Explore by Cuisine
              </h2>
              <p style={{ color: muted, marginTop: 12, fontSize: 16 }}>
                From street food favourites to fine dining — every craving covered
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 20 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.name} onClick={handleRestaurantClick} className="lp-cat-btn" style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                  padding: "26px 8px", borderRadius: 20,
                  background: surface, border: `1px solid ${dk ? "#1e2535" : "#f0ebe3"}`,
                  cursor: "pointer",
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18,
                    background: `linear-gradient(135deg,${cat.grad[0]},${cat.grad[1]})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 30, boxShadow: "0 4px 16px rgba(0,0,0,.12)",
                  }}>{cat.emoji}</div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: text }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURED RESTAURANTS
        ══════════════════════════════════════════ */}
        <section id="restaurants" style={{ padding: "88px 24px", background: surfaceAlt }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#f97316", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>FEATURED</p>
                <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: -1 }}>Top Restaurants Near You</h2>
              </div>
              <button onClick={handleRestaurantClick} style={{ 
                background: "transparent", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, color: "#f97316", fontWeight: 700, fontSize: 15 
              }}>
                View all <ArrowRight size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 24 }}>
              {RESTAURANTS.map(r => (
                <div key={r.name} onClick={handleRestaurantClick} className="lp-card-hover" style={{
                  borderRadius: 20, overflow: "hidden", cursor: "pointer",
                  background: cardBg,
                  boxShadow: dk ? "0 1px 4px rgba(0,0,0,.4)" : "0 2px 12px rgba(0,0,0,.07)",
                }}>
                  {/* Image */}
                  <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                    <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                    />
                    <div style={{
                      position: "absolute", top: 14, left: 14,
                      background: "linear-gradient(135deg,#f97316,#ea580c)",
                      color: "#fff", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700,
                    }}>{r.tag}</div>
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      background: "rgba(0,0,0,.5)", backdropFilter: "blur(10px)",
                      borderRadius: 8, padding: "4px 10px",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <Star size={13} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{r.rating}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "18px 20px 20px" }}>
                    <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 4, color: text }}>{r.name}</h3>
                    <p style={{ color: muted, fontSize: 14, marginBottom: 14 }}>{r.cuisine}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${border}`, paddingTop: 14 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: muted }}>
                        <Clock size={14} /> {r.time}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: muted }}>
                        <MapPin size={14} /> {r.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════ */}
        <section id="features" style={{ padding: "100px 24px", background: bg }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#f97316", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>WHY FOODFLOW?</p>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: -1 }}>
                Everything you need, in one app
              </h2>
              <p style={{ color: muted, marginTop: 14, fontSize: 16, maxWidth: 500, margin: "14px auto 0" }}>
                We've built the most complete food delivery experience from the ground up.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 24 }}>
              {FEATURES.map(f => (
                <div key={f.title} className="lp-feat-card" style={{
                  padding: "32px 28px", borderRadius: 20,
                  background: surface, border: `1px solid ${border}`,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, marginBottom: 20,
                    background: "linear-gradient(135deg,rgba(249,115,22,.15),rgba(234,88,12,.08))",
                    border: "1px solid rgba(249,115,22,.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <f.icon size={24} color="#f97316" />
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 10, color: text }}>{f.title}</h3>
                  <p style={{ color: muted, fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            STATS — animated counters
        ══════════════════════════════════════════ */}
        <section ref={statsRef} style={{
          padding: "100px 24px",
          background: "linear-gradient(135deg,#ea580c 0%,#f97316 55%,#fb923c 100%)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Dot pattern overlay */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.08,
            backgroundImage: "radial-gradient(#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
          <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: "#fff", letterSpacing: -1 }}>
                Trusted by millions
              </h2>
              <p style={{ color: "rgba(255,255,255,.75)", marginTop: 12, fontSize: 16 }}>Our numbers speak for themselves</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 32 }}>
              {STATS.map(s => (
                <StatCard key={s.label} {...s} start={statsVisible} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════ */}
        <section style={{ padding: "100px 24px", background: surfaceAlt }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#f97316", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>TESTIMONIALS</p>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: -1 }}>What our customers say</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
              {TESTIMONIALS.map(t => (
                <div key={t.name} style={{
                  padding: 32, borderRadius: 20, background: cardBg,
                  boxShadow: dk ? "0 2px 12px rgba(0,0,0,.3)" : "0 4px 24px rgba(0,0,0,.07)",
                }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={17} fill="#f97316" color="#f97316" />
                    ))}
                  </div>
                  <p style={{ color: dk ? "#cbd5e1" : "#374151", fontSize: 15, lineHeight: 1.7, marginBottom: 24, fontStyle: "italic" }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={t.avatar} alt={t.name} style={{
                      width: 46, height: 46, borderRadius: "50%",
                      border: "2px solid #f97316", background: "#fed7aa",
                    }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: text }}>{t.name}</div>
                      <div style={{ color: muted, fontSize: 13 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA BANNER
        ══════════════════════════════════════════ */}
        <section id="cta-section" style={{ padding: "100px 24px", background: bg, textAlign: "center" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div className="lp-float" style={{ fontSize: 64, marginBottom: 24 }}>🍽️</div>
            <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900, letterSpacing: -1.5, marginBottom: 20, color: text }}>
              Ready to order?
            </h2>
            <p style={{ color: muted, fontSize: 18, marginBottom: 40, lineHeight: 1.6 }}>
              Join 100,000+ food lovers already on FoodFlow. Sign up free and get your first order discounted.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" className={highlightCTA ? "lp-cta-highlight" : ""} style={{
                padding: "15px 40px", borderRadius: 14,
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 17,
                boxShadow: "0 8px 28px rgba(249,115,22,.4)",
                display: "flex", alignItems: "center", gap: 8,
                transition: "transform .2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >Get Started Free <ArrowRight size={20} /></Link>
              <Link to="/login" style={{
                padding: "15px 40px", borderRadius: 14,
                border: `2px solid ${border}`, color: text,
                textDecoration: "none", fontWeight: 700, fontSize: 17,
                transition: "border-color .2s, color .2s",
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "#f97316"; el.style.color = "#f97316";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = border; el.style.color = text;
                }}
              >Sign In</Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════ */}
        <footer id="footer" style={{ background: dk ? "#07090f" : "#111827", color: "#9ca3af", padding: "72px 24px 32px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 48, marginBottom: 56 }}>

              {/* Brand */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg,#f97316,#ea580c)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>🍽️</div>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>FoodFlow</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}>
                  Delivering happiness one meal at a time. Fast, fresh, and reliable.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  {SOCIAL_LINKS.map(({ Icon, href }) => (
                    <a key={Icon.name} href={href} className="lp-social" style={{
                      width: 36, height: 36, borderRadius: 10, background: "#1f2937",
                      display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
                    }}>
                      <Icon size={16} color="#9ca3af" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Company */}
              <div>
                <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Company</h4>
                {["About Us", "Careers", "Blog", "Contact"].map(l => (
                  <a key={l} href="#" className="lp-footer-link" style={{ color: "#9ca3af" }}>{l}</a>
                ))}
              </div>

              {/* Services */}
              <div>
                <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Services</h4>
                {["Food Delivery", "Order Tracking", "Restaurant Partners", "Support"].map(l => (
                  <a key={l} href="#" className="lp-footer-link" style={{ color: "#9ca3af" }}>{l}</a>
                ))}
              </div>

              {/* Legal */}
              <div>
                <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Legal</h4>
                {["Privacy Policy", "Terms & Conditions", "Cookie Policy"].map(l => (
                  <a key={l} href="#" className="lp-footer-link" style={{ color: "#9ca3af" }}>{l}</a>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{
              borderTop: "1px solid #1f2937", paddingTop: 28,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: 12,
            }}>
              <span style={{ fontSize: 14 }}>© {new Date().getFullYear()} FoodFlow. All rights reserved.</span>
              <span style={{ fontSize: 14 }}>Made with ❤️ for food lovers everywhere</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};
