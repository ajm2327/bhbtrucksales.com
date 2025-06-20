import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import ThemeToggle from '../ThemeToggle'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()

    const isActive = (path) => {
        return location.pathname === path
    }

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' }
    ]

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/*Logo*/}
                    <Link to="/" className="flex items-center">
                        <h1 className="text-2xl font-bold text-primary-500 dark:text-primary-400">
                            BHB Truck Sales
                        </h1>
                    </Link>

                    {/* Desktop navigation */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-lg font-medium transition-colors duration-200 ${isActive(link.path)
                                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <ThemeToggle />  {/* Add theme toggle */}
                    </nav>

                    {/* Mobile menu button and theme toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />  {/* Add theme toggle for mobile */}
                        <button
                            className="flex items-center text-gray-700 dark:text-gray-300"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden pb-4 bg-white dark:bg-gray-900 transition-colors duration-300">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block py-2 text-lg font-medium transition-colors duration-200 ${isActive(link.path)
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    )
}

export default Header