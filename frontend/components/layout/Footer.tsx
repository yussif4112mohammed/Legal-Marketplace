import Link from 'next/link';
import { Scale, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: 'Practice Areas',
      links: [
        { label: 'Real Estate Law',   href: '/lawyers?spec=1' },
        { label: 'Immigration Law',   href: '/lawyers?spec=3' },
        { label: 'Business Law',      href: '/lawyers?spec=4' },
        { label: 'Family Law',        href: '/lawyers?spec=5' },
        { label: 'Property Disputes', href: '/lawyers?spec=2' },
      ],
    },
    {
      title: 'For Attorneys',
      links: [
        { label: 'Join as a Lawyer',  href: '/auth/register?role=lawyer' },
        { label: 'Lawyer Dashboard',  href: '/dashboard/lawyer' },
        { label: 'How It Works',      href: '/#how-it-works' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us',     href: '/about' },
        { label: 'Contact',      href: '/contact' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Use', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="bg-navy-950 text-white pt-16 pb-8">
      <div className="container-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-navy-950" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Lex<span className="text-gold-400">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Connecting clients with verified, licensed attorneys across all 50 states.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center hover:bg-gold-500 hover:text-navy-950 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-navy-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-500">© {year} LexBridge, Inc. All rights reserved.</p>
          <p className="text-gray-600 text-xs text-center max-w-sm">
            LexBridge is not a law firm. Attorney profiles are verified for bar licensure only.
          </p>
        </div>
      </div>
    </footer>
  );
}
