import heroImg from './assets/hero.png'
import './App.css'

function App() {
  return (
    <main className="landing">
      <header className="landing__header">
        <div className="landing__brand">Shipzyy</div>
        <nav className="landing__nav">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="landing__hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Modern shipping for online stores</span>
          <h1>Ship faster, track smarter, and delight customers.</h1>
          <p>
            Shipzyy gives your business a powerful shipping dashboard with
automations, delivery tracking, and customer notifications in one place.
          </p>

          <div className="hero__actions">
            <a className="button button--primary" href="#pricing">
              Start free trial
            </a>
            <a className="button button--secondary" href="#features">
              Explore features
            </a>
          </div>

          <div className="hero__stats">
            <div>
              <strong>99.9%</strong>
              <span>on-time delivery</span>
            </div>
            <div>
              <strong>30k+</strong>
              <span>stores powered</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>live support</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <img src={heroImg} alt="Shipping dashboard illustration" />
        </div>
      </section>

      <section id="features" className="landing__features">
        <article className="feature-card">
          <h2>Automate every shipment</h2>
          <p>Connect stores, print labels, and send delivery updates automatically.</p>
        </article>
        <article className="feature-card">
          <h2>Live tracking at a glance</h2>
          <p>See shipment status, maps, and exceptions in one dashboard.</p>
        </article>
        <article className="feature-card">
          <h2>Customer-first notifications</h2>
          <p>Keep buyers informed with branded email and SMS alerts.</p>
        </article>
      </section>

      <section id="pricing" className="landing__cta">
        <div className="cta-card">
          <h2>Ready to power your shipping?</h2>
          <p>Launch your first shipment workflow in minutes with Shipzyy.</p>
          <a className="button button--primary" href="mailto:support@shipzyy.com">
            Book a demo
          </a>
        </div>
      </section>

      <footer id="contact" className="landing__footer">
        <p>Shipzyy — modern shipping orchestration for e-commerce teams.</p>
      </footer>
    </main>
  )
}

export default App
