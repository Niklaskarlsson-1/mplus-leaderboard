import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CharacterPage } from './pages/CharacterPage.tsx';
import { LeaderboardPage } from './pages/LeaderboardPage.tsx';

// HashRouter gör att länkar som /#/character/eu/sylvanas/Rooiben
// fungerar även på GitHub Pages, som saknar stöd för server-routing.
export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LeaderboardPage />} />
        <Route path="/character/:region/:realm/:name" element={<CharacterPage />} />
        <Route path="*" element={<LeaderboardPage />} />
      </Routes>
    </HashRouter>
  );
}

/** Scrolla upp till toppen när man byter sida (men inte när bara filtren ändras). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
