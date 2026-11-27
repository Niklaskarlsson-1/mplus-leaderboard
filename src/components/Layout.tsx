import type { ReactNode } from 'react';

export function Shell({ children, heroImage }: { children: ReactNode; heroImage?: string }) {
  return (
    <div className="shell">
      {heroImage && (
        <div className="backdrop" style={{ backgroundImage: `url("${heroImage}")` }} aria-hidden />
      )}
      <main className="container">{children}</main>
      <footer className="footer">
        Data från <a href="https://raider.io" target="_blank" rel="noreferrer">Raider.IO</a>, föremål
        via <a href="https://www.wowhead.com" target="_blank" rel="noreferrer">Wowhead</a>.
        Fanprojekt, inte anslutet till Blizzard Entertainment.
      </footer>
    </div>
  );
}

export function Loading({ text }: { text: string }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden /> {text}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="state error" role="alert">
      {message}
    </div>
  );
}
