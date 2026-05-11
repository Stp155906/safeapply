import React from 'react'
import { createRoot } from 'react-dom/client'
import { LockKeyhole, SearchCheck, ShieldCheck, Sparkles } from 'lucide-react'
import './style.css'

function App() {
  return (
    <main className="page">
      <header className="nav">
        <a className="brand" href="#top"><span>SA</span>SafeApply</a>
        <nav>
          <a href="#product">Product</a>
          <a href="#proof">Proof</a>
          <a href="#research">Research</a>
        </nav>
        <a className="navCta" href="#proof">Extension proof</a>
      </header>

      <section className="hero" id="top">
        <div className="copy">
          <p className="eyebrow">Free Chrome extension for job seekers</p>
          <h1>Know if a job is real before you apply.</h1>
          <p className="lede">
            SafeApply scores job posts in context, highlights scam-risk signals, and gives students quick verification
            links before they share personal information.
          </p>
          <div className="actions">
            <a className="primary" href="#product"><ShieldCheck size={18} />View score system</a>
            <a className="secondary" href="#proof"><SearchCheck size={18} />See proof layer</a>
          </div>
          <p className="plainDisclaimer">
            Important: SafeApply is a risk score and verification helper, not a final verdict. A job may still be real.
          </p>
        </div>

        <aside className="device" aria-label="SafeApply extension preview">
          <div className="extensionTop">
            <span>SA</span>
            <div><strong>SafeApply</strong><small>Visible job scan</small></div>
            <button>Rescan</button>
          </div>
          <div className="summaryCard">
            <p className="eyebrow">Trust scorecard</p>
            <div className="scoreLine"><strong>3 listings scored</strong><b>74</b></div>
            <div className="meter"><span /></div>
          </div>
          <div className="listing safe">
            <div><strong>Software Engineer</strong><small>Company careers page found</small></div><b>88</b>
          </div>
          <div className="listing review">
            <div><strong>AI Training Engineer</strong><small>Needs official-site verification</small></div><b>61</b>
          </div>
          <div className="listing risk">
            <div><strong>Remote Assistant</strong><small>Payment and messaging risk detected</small></div><b>28</b>
          </div>
          <p className="extensionNote"><LockKeyhole size={14} />Runs locally on visible page text.</p>
        </aside>
      </section>

      <section className="cards" id="product">
        <article><ShieldCheck /><strong>Instant local scan</strong><span>No server upload, no API bill, no resumes collected.</span></article>
        <article><SearchCheck /><strong>Verification links</strong><span>Searches official careers pages and known ATS sources.</span></article>
        <article><Sparkles /><strong>Portfolio-ready</strong><span>A real Chrome extension prototype with a live product page.</span></article>
      </section>

      <section className="proof" id="proof">
        <div>
          <p className="eyebrow">Responsible AI showcase</p>
          <h2>Guidance, not accusation.</h2>
        </div>
        <p>
          SafeApply does not label an employer as fake. It shows risk patterns, provides evidence links, and encourages
          applicants to verify through the official company careers page.
        </p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
