import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home({ isDarkMode, toggleTheme }) {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="home-nav">
        <div className="logo">mindmap.ai</div>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* THEME TOGGLE BUTTON - Added here */}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.2rem', 
              cursor: 'pointer' 
            }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <button className="nav-btn-text" onClick={() => navigate("/signin")}>
            Sign In
          </button>
          <button className="create-btn" onClick={() => navigate("/signup")}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <h1 className="hero-title">an ai mindmapper</h1>
        <p className="hero-subtitle">
          A minimalist mind-mapping tool powered by AI to help you connect ideas, 
          organize notes, and build projects in a goated workspace.
        </p>
        <div className="hero-buttons">
          <button className="create-btn large" onClick={() => navigate("/signup")}>
            Start Mapping for Free
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">✨</div>
          <h3>AI Insights</h3>
          <p>Get intelligent suggestions to connect disparate ideas and broaden your perspective.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛠️</div>
          <h3>Editor</h3>
          <p>Drag, drop, and edit nodes with a clean interface that stays out of your way.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌑</div>
          <h3>Design</h3>
          <p>Focus on what matters most. No clutter, just your thoughts on a clean canvas.</p>
        </div>
      </section>

      {/* About Section
      <section className="about-section">
        <div className="about-content">
          <h2 className="section-title">Why we built this</h2>
          <p>
            Traditional mind maps are often too complex. We wanted to create a space that 
            feels like a clean sheet of paper but works with the speed of your mind. 
            Whether you're a student organizing biology notes or a founder mapping a startup, 
            MindNode is built for you.
          </p>
        </div>
      </section> */}

      <footer className="home-footer">
        <p>&copy; 2026 MindNode.</p>
      </footer>
    </div>
  );
}