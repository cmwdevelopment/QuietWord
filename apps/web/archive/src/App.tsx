import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { api } from "./lib/api";
import { AppStateContext } from "./lib/appState";
import type { BootstrapResponse } from "./lib/types";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Onboarding from "./pages/Onboarding";
import Reader from "./pages/Reader";
import Settle from "./pages/Settle";
import Settings from "./pages/Settings";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [bootstrap, setBootstrap] = useState<BootstrapResponse>();

  async function refresh() {
    setLoading(true);
    try {
      const data = await api.bootstrap();
      setBootstrap(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const contextValue = useMemo(() => ({ bootstrap, loading, refresh }), [bootstrap, loading]);

  if (loading && !bootstrap) {
    return <main className="shell"><p>Loading QuietWord...</p></main>;
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      <main className="shell">
        <header className="top-nav">
          <Link to="/">QuietWord</Link>
          <div className="row">
            <Link to="/notes">Notes</Link>
            <Link to="/settings">Settings</Link>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/settle/:section" element={<Settle />} />
          <Route path="/reader/:section" element={<Reader />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </AppStateContext.Provider>
  );
}
