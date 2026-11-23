Grace's Interactive Portfolio

A responsive, accessible portfolio that pulls live repositories from the GitHub API, filters projects, validates a contact form and remembers visitor preferences.


Features
Semantic HTML5: header, nav, main, sections, articles, footer; ordered headings; descriptive alt text; skip link.
Custom CSS3: design tokens (custom properties), deliberate teal and amber palette, mobile-first media queries, light and dark themes.
Flexbox and Grid: Flexbox navbar and form layout; auto-fill Grid cards that reflow from 320px to 1440px with no horizontal scroll.
Vanilla JavaScript: separate script.js loaded with defer; const/let only; === only; projects stored as an array of objects; helper functions that return values; map, filter and reduce.
DOM and events: cards built with createElement and textContent (never innerHTML); addEventListener; event delegation on the project list and filter bar.
API search and filter: fetches public repos from api.github.com, with a name/description search and a language filter, plus loading and error states.
Form and localStorage: submit + preventDefault; trim, minimum-length and regex email validation; accessible errors (aria-describedby, aria-invalid, role="status"); theme and form draft saved with JSON.stringify, JSON.parse and try/catch.