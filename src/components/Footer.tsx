import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container-page footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">Asistent LMS</div>
          <p className="footer__desc">
            ონლაინ სასწავლო პლატფორმა — კურსები, გაკვეთილები და განვითარება.
          </p>
        </div>

        <nav className="footer__nav" aria-label="Footer navigation">
          <Link className="footer__link" href="/courses">
            კურსები
          </Link>
          <Link className="footer__link" href="/about">
            ჩვენს შესახებ
          </Link>
          <Link className="footer__link" href="/contact">
            კონტაქტი
          </Link>
          <Link className="footer__link" href="/terms">
            წესები
          </Link>
          <Link className="footer__link" href="/privacy">
            კონფიდენციალურობა
          </Link>
        </nav>

        <div className="footer__meta">
          <div className="footer__copy">© {year} Asistent LMS</div>
          <div className="footer__small">All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
