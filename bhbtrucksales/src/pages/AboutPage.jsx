import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

const AboutPage = () => {
    const [aboutData, setAboutData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`${backendUrl}/api/trucks/about-page`)
                const data = await response.json()

                if (response.ok && data.success) {
                    setAboutData(data.data)
                } else {
                    setError(data.error || 'Failed to load about page content')
                }
            } catch (err) {
                console.error('Error fetching about page:', err)
                setError('Unable to connect to server')
            } finally {
                setLoading(false)
            }
        }

        fetchAboutData()
    }, [backendUrl])

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Loading about page...
                    </h3>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Error Loading Page
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!aboutData) return null

    return (
        <>
            <Helmet>
                <title>{aboutData.title} - BHB Truck Sales</title>
                <meta
                    name="description"
                    content="Learn about BHB Truck Sales - your trusted source for quality commercial trucks."
                />
            </Helmet>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Page Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                            {aboutData.title}
                        </h1>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {aboutData.content && aboutData.content.length > 0 ? (
                        <div className="space-y-8">
                            {aboutData.content.map((section, index) => (
                                <div key={index}>
                                    {section.type === 'paragraph' && section.text && (
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                                            <div className="prose dark:prose-invert max-w-none">
                                                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                                    {section.text}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {section.type === 'image' && section.url && (
                                        <div className="w-full">
                                            {/* Image Banner - Full width without overlay */}
                                            <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
                                                <img
                                                    src={section.url.startsWith('http') ? section.url : `${backendUrl}${section.url}`}
                                                    alt={section.caption || `About BHB Truck Sales - Image ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none'
                                                    }}
                                                />
                                            </div>

                                            {/* Caption below image if provided */}
                                            {section.caption && (
                                                <div className="mt-4 text-center">
                                                    <p className="text-gray-600 dark:text-gray-400 italic">
                                                        {section.caption}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-gray-400 text-6xl mb-4">📄</div>
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No Content Available
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                The about page content is being updated. Please check back soon!
                            </p>
                        </div>
                    )}
                </div>

                {/* Contact CTA Section */}
                <div className="bg-primary-50 dark:bg-primary-900/20 border-t border-primary-200 dark:border-primary-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Ready to Find Your Perfect Truck?
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                                Browse our inventory of quality commercial trucks or contact us to discuss your specific needs.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors duration-200"
                                >
                                    Browse Inventory
                                </button>
                                <button
                                    onClick={() => window.location.href = '/contact'}
                                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 px-8 rounded-lg font-semibold transition-colors duration-200 border border-gray-300 dark:border-gray-600"
                                >
                                    Contact Us
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AboutPage