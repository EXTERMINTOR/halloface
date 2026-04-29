import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">Hall of Ace.</div>
            <p className="footer-tag">
              Different problems. Same shapes. A daily field notebook on building, thinking, and the space between.
              By Wallace Noronha.
            </p>
          </div>
          <div className="footer-col">
            <h4>Read</h4>
            <ul>
              <li><Link href="/">Latest</Link></li>
              <li><Link href="/blog">Archive</Link></li>
              <li><Link href="/login">Sign in</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="https://github.com/EXTERMINTOR" target="_blank" rel="noopener">GitHub</a></li>
              <li><a href="https://www.linkedin.com/in/wallace-noronha-455b18212/" target="_blank" rel="noopener">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Wallace Noronha. All rights reserved.</span>
          <span>Hall of Ace · uh-LACE</span>
        </div>
      </div>
    </footer>
  );
}
