import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const Header = () => {
    const [siteSettings, setSiteSettings] = useState(null)
    const location = useLocation()
    const { isDarkMode, toggleTheme } = useTheme()

    // Fetch logo from site settings
    useEffect(() => {
        const fetchSiteSettings = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/trucks/site-settings')
                const data = await response.json()
                if (data.success) {
                    setSiteSettings(data.data)
                }
            } catch (error) {
                console.error('Error fetching site settings:', error)
            }
        }
        fetchSiteSettings()
    }, [])

    const isActive = (path) => location.pathname === path

    const logoUrl = siteSettings?.logo?.imageUrl

    return (
        <header className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">

                    {/* Logo and Company Name */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                            {logoUrl ? (
                                <img
                                    src={`http://localhost:3001${logoUrl}`}
                                    alt="BHB Truck Sales Logo"
                                    className="w-8 h-8 object-contain rounded"
                                />
                            ) : (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
                                </svg>
                            )}
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            BHB Truck Sales
                        </h1>
                    </Link>

                    {/* Navigation - Using inline styles that work */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Navigation Links - Red pill buttons */}
                        <Link
                            to="/about"
                            style={{
                                background: isActive('/about') ? '#b91c1c' : '#dc2626',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '20px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                border: 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                            onMouseLeave={(e) => e.target.style.background = isActive('/about') ? '#b91c1c' : '#dc2626'}
                        >
                            About
                        </Link>

                        <Link
                            to="/contact"
                            style={{
                                background: isActive('/contact') ? '#b91c1c' : '#dc2626',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '20px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                border: 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                            onMouseLeave={(e) => e.target.style.background = isActive('/contact') ? '#b91c1c' : '#dc2626'}
                        >
                            Contact
                        </Link>

                        {/* Divider */}
                        <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 8px' }}></div>

                        {/* Facebook Button */}
                        <a
                            href="https://www.facebook.com/bhbtrucksales/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: '#1877f2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#166fe5'
                                e.target.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#1877f2'
                                e.target.style.transform = 'scale(1)'
                            }}
                            aria-label="Facebook"
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>

                        {/* WhatsApp Button */}
                        <a
                            href="https://l.facebook.com/l.php?u=https%3A%2F%2Fapi.whatsapp.com%2Fsend%3Fphone%3D%252B15203995621%26context%3DAfeKfOFoLG_77WvifSUlsJiCHGuHXkg3GwX7P9u-9ox0meKs3VD3mn93oADJ7nOqH4XaXQA-GD1SDih1TOdXoA_NN_D4axboc6NULOgHAqqdlOeN8nhg8ocvIpnxHYgPILIxBnd6M5NT6UVXzV7dqAWcCw%26source%3DFB_Page%26app%3Dfacebook%26entry_point%3Dpage_cta%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExY0dsNEtPWW9hR2U3aTJqVAEe0eoS06FueTPSTEYBBXpOnQ1IiNdYwp6BxvDaKzutMHC2XpkVpDU6NeBh-Ik_aem_aTDPMwL7oIvNqy-oy5C4YQ&h=AT3R3eZTt-Grg6s0IseiiROWMpvkaMmz2Uuew5NfrMX9vDCVIPPXNtaZShOZJsXZzRoxCf-bZDNkKvqBxHtNMba5ijXwm5aZM0np-S6BG7Uqs4fKQtlcAxPZRYwd7HR1u_ugmLPABbKDPoynH60IvQ"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: '#25d366',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#22c55e'
                                e.target.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#25d366'
                                e.target.style.transform = 'scale(1)'
                            }}
                            aria-label="WhatsApp"
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488" />
                            </svg>
                        </a>

                        {/* Dark Mode Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: isDarkMode ? '#374151' : '#e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isDarkMode ? '#fbbf24' : '#4b5563',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = isDarkMode ? '#4b5563' : '#d1d5db'
                                e.target.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = isDarkMode ? '#374151' : '#e5e7eb'
                                e.target.style.transform = 'scale(1)'
                            }}
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? (
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header