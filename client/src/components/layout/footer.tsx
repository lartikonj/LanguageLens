import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center">
                <span className="text-primary-600 dark:text-primary-400 text-2xl font-bold">Lingua<span className="text-accent-500">Content</span></span>
            </Link>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
              Learn languages naturally by enjoying content you love.
            </p>
            <div className="mt-6 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">
              Explore
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/categories" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Featured Content
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Most Popular
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Recently Added
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Our Method
                </Link>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-base text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} LinguaContent. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
              Terms
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
              Privacy
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
