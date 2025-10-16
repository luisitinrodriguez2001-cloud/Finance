function SourceNote({ url, details }) {
  return /*#__PURE__*/React.createElement(
    "p",
    { className: "text-[11px] text-slate-500 mt-1" },
    "Source: ",
    /*#__PURE__*/React.createElement(
      "a",
      { href: url, target: "_blank", rel: "noreferrer", className: "underline" },
      "LazyPortfolioETF"
    ),
    details ? ` — ${details}` : ''
  );
}

// Define on window so `text/babel` scripts can access the component globally.
window.SourceNote = SourceNote;
