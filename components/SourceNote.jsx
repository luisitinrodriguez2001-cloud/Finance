const SourceNote = ({ url, details, name = "LazyPortfolioETF" }) =>
/*#__PURE__*/ React.createElement(
  "p",
  { className: "text-[11px] text-slate-500 mt-1" },
  "Source: ",
  /*#__PURE__*/ React.createElement(
    "a",
    { href: url, target: "_blank", rel: "noreferrer", className: "underline" },
    name
  ),
  details ? ` — ${details}` : ''
);

// No export here so the component is available globally when loaded via script tag
// for the Babel in-browser setup used by this project.
