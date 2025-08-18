const SourceNote = ({ url, details, dispersionUrl }) => /*#__PURE__*/(
  React.createElement(
    "p",
    { className: "text-[11px] text-slate-500 mt-1" },
    "Source: ",
    React.createElement(
      "a",
      { href: url, target: "_blank", rel: "noreferrer", className: "underline" },
      "Slickcharts"
    ),
    details ? ` — ${details}` : '',
    dispersionUrl &&
      /*#__PURE__*/ React.createElement(
        React.Fragment,
        null,
        " · ",
        React.createElement(
          "a",
          {
            href: dispersionUrl,
            target: "_blank",
            rel: "noreferrer",
            className: "underline"
          },
          "LazyPortfolioETF"
        )
      )
  )
);

// No export here so the component is available globally when loaded via script tag
// for the Babel in-browser setup used by this project.
