import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

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
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/*Logo*/}
                    <Link to="/" className="flex items-center">
                        <h1 className="text-2xl front-bold text-blue-900">
                            BHB Truck Sales
                        </h1>
                    </Link>

                    {/* Desktop navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-lg font-medium transition-colors duration-200 ${isActive(link.path)
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* mobile menu button */}
                    <button
                        className="md:hidden flex items-center text-gray-700"
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
                                    strokLinecap="round"
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

                {/* Mobile presentation */}
                {isMenuOpen && (
                    <nav className="md:hidden pb-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block py-2 text-lg font-medium ${isActive(link.path)
                                        ? 'text-blue-600'
                                        : 'text-gray-700'
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