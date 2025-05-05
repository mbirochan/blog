'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
          >
            Birochan Blog
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <NavLink href="/" label="Home" pathname={pathname} />
            <NavLink href="/blog" label="Blog" pathname={pathname} />
            <NavLink href="/about" label="About" pathname={pathname} />
            <NavLink href="/contact" label="Contact" pathname={pathname} />
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-md hover:bg-gray-100">
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (hidden by default) */}
      <div className="hidden md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <MobileNavLink href="/" label="Home" pathname={pathname} />
          <MobileNavLink href="/blog" label="Blog" pathname={pathname} />
          <MobileNavLink href="/about" label="About" pathname={pathname} />
          <MobileNavLink href="/contact" label="Contact" pathname={pathname} />
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, label, pathname }: { href: string; label: string; pathname: string }) => {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`${
        isActive
          ? 'text-blue-600 font-semibold'
          : 'text-gray-600 hover:text-gray-900'
      } transition-colors`}
    >
      {label}
    </Link>
  );
};

const MobileNavLink = ({ href, label, pathname }: { href: string; label: string; pathname: string }) => {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`${
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
    >
      {label}
    </Link>
  );
};

export default Navbar; 