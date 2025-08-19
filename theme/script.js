const { useState } = React;

const SOCIALS = {
  instagram: 'https://instagram.com/luisitin2001',
  tiktok: 'https://www.tiktok.com/@luisitin2001'
};

const IconLink = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="icon-btn hover:bg-slate-100 transition-colors duration-150"
    aria-label={label}
    title={label}
  >
    {children}
  </a>
);

const InstagramSVG = () => (
  <img src="./instagram.svg" width="16" height="16" alt="" aria-hidden="true" className="social-icon" />
);
const TikTokSVG = () => (
  <img src="./tiktok.svg" width="16" height="16" alt="" aria-hidden="true" className="social-icon" />
);

const SocialBar = () => (
  <div className="flex items-center gap-2">
    <IconLink href={SOCIALS.instagram} label="Instagram">
      <InstagramSVG />
    </IconLink>
    <IconLink href={SOCIALS.tiktok} label="TikTok">
      <TikTokSVG />
    </IconLink>
  </div>
);

function FunFacts({ facts = [] }) {
  const [fact, setFact] = useState(facts[0] || '');
  const shuffle = () => {
    if (facts.length) {
      const idx = Math.floor(Math.random() * facts.length);
      setFact(facts[idx]);
    }
  };
  return (
    <div className="mt-4 px-4 py-3 bg-white border rounded-xl flex items-center justify-between gap-3 shadow-card">
      <span className="text-sm text-slate-700">{fact}</span>
      <button
        className="icon-btn hover:bg-slate-100 transition-colors duration-150"
        onClick={shuffle}
        title="Shuffle fun fact"
        aria-label="Shuffle fun fact"
        style={{ background: 'transparent' }}
      >
        🔀️
      </button>
    </div>
  );
}

function App() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl shadow select-none"
            title="Hi!"
            aria-hidden="true"
          >
            🙂
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Finance Calculators</h1>
            <p className="text-slate-600">Your clean, accurate, no-fluff toolkit.</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 relative">
          <div className="flex items-center gap-2">
            <SocialBar />
          </div>
          <span className="text-[11px] text-slate-500">@luisitin2001</span>
        </div>
      </div>

      <FunFacts />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
