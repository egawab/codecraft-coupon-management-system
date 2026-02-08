import Link from 'next/link';
import { Search, Home, Store, Tag, User } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Tag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Kobonz</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4 inline mr-1" />
                Home
              </Link>
              <Link
                href="/coupons"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                <Tag className="h-4 w-4 inline mr-1" />
                Coupons
              </Link>
              <Link
                href="/stores"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                <Store className="h-4 w-4 inline mr-1" />
                Stores
              </Link>
            </nav>

            {/* Auth Links */}
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Kobonz</h3>
              <p className="text-sm text-muted-foreground">
                Your one-stop platform for discovering amazing deals and coupons from
                local stores.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/coupons" className="hover:text-primary">
                    Browse Coupons
                  </Link>
                </li>
                <li>
                  <Link href="/stores" className="hover:text-primary">
                    Browse Stores
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-primary">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Businesses</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth/register" className="hover:text-primary">
                    Create Store
                  </Link>
                </li>
                <li>
                  <Link href="/store-owner" className="hover:text-primary">
                    Store Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Kobonz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
