import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import TruckCard from '../components/TruckCard/TruckCard'

const HomePage = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [siteSettings, setSiteSettings] = useState(null)
    const [trucksCount, setTrucksCount] = useState(0)
    const [trucks, setTrucks] = useState([])
    const [announcementDismissed, setAnnouncementDismissed] = useState(() => {
        return localStorage.getItem('announcementDismissed') === 'true'
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const [trucksResponse, settingsResponse] = await Promise.all([
                    fetch('http://localhost:3001/api/trucks?available=true'),
                    fetch('http://localhost:3001/api/trucks/site-settings')
                ])

                if (trucksResponse.ok) {
                    const trucksData = await trucksResponse.json()
                    if (trucksData.success) {
                        setTrucksCount(trucksData.data.total)

                        // Sort trucks - featured first, then by date added (newest first)
                        const sortedTrucks = trucksData.data.trucks.sort((a, b) => {
                            // Featured trucks first
                            if (a.isFeatured && !b.isFeatured) return -1
                            if (!a.isFeatured && b.isFeatured) return 1

                            // Then by date added (newest first)
                            return new Date(b.dateAdded) - new Date(a.dateAdded)
                        })

                        setTrucks(sortedTrucks)
                    }
                }

                if (settingsResponse.ok) {
                    const settingsData = await settingsResponse.json()
                    if (settingsData.success) {
                        setSiteSettings(settingsData.data)
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                setError('Unable to connect to server')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const dismissAnnouncement = () => {
        setAnnouncementDismissed(true)
        localStorage.setItem('announcementDismissed', 'true')
    }

    const scrollToInventory = () => {
        const inventorySection = document.getElementById('inventory')
        if (inventorySection) {
            inventorySection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // Create background image URL
    const backgroundImageUrl = siteSettings?.banner?.imageUrl
        ? `http://localhost:3001${siteSettings.banner.imageUrl}`
        : null

    return (
        <>
            <Helmet>
                <title>BHB Truck Sales - Quality Commercial Trucks for Sale</title>
                <meta
                    name="description"
                    content="Browse our selection of quality commercial trucks. Available with full specifications and competitive pricing."
                />
            </Helmet>

            <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Announcement Banner */}
                {siteSettings?.announcement?.isActive && !announcementDismissed && (
                    <div className="w-full bg-primary-600 text-white py-3 px-4 relative">
                        <div className="text-center">
                            {siteSettings.announcement.title && (
                                <span className="font-semibold mr-2">
                                    {siteSettings.announcement.title}:
                                </span>
                            )}
                            <span>{siteSettings.announcement.message}</span>
                        </div>
                        <button
                            onClick={dismissAnnouncement}
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-transparent hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors duration-200"
                            aria-label="Dismiss announcement"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Hero Banner - Clean without overlays or buttons */}
                <section
                    className="relative w-full h-screen flex items-center justify-center overflow-hidden"
                    style={{
                        backgroundImage: backgroundImageUrl
                            ? `linear-gradient(rgba(139, 0, 0, 0.7), rgba(139, 0, 0, 0.7)), url(${backgroundImageUrl})`
                            : 'linear-gradient(135deg, #8B0000 0%, #A0522D 50%, #8B0000 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">

                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                            <span className="block text-white drop-shadow-2xl">
                                Quality Commercial Trucks
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-gray-100 drop-shadow-lg max-w-3xl mx-auto">
                            Find the perfect commercial vehicle for your business needs
                        </p>

                        {/* Browse Inventory Button */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                            <button
                                onClick={scrollToInventory}
                                className="bg-white/90 hover:bg-white text-gray-900 font-semibold py-4 px-10 rounded-full transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                            >
                                <span className="whitespace-nowrap">Browse Our Inventory</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Loading State */}
                {loading && (
                    <section className="w-full py-16 bg-white dark:bg-gray-800">
                        <div className="max-w-4xl mx-auto px-4 text-center">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                                    Loading truck inventory...
                                </h3>
                            </div>
                        </div>
                    </section>
                )}

                {/* Error State */}
                {error && (
                    <section className="w-full py-16 bg-white dark:bg-gray-800">
                        <div className="max-w-4xl mx-auto px-4 text-center">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8">
                                <div className="text-red-600 text-5xl mb-4">⚠️</div>
                                <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">
                                    Unable to Load Trucks
                                </h3>
                                <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Inventory Section with Truck Count Badge */}
                <div id="inventory" className="w-full py-16 bg-gray-100 dark:bg-gray-800">
                    <div className="max-w-6xl mx-auto px-4">

                        {/* Inventory Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Our Truck Inventory
                            </h2>
                        </div>

                        {/* Trucks Grid */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trucks.length > 0 ? (
                                    trucks.map((truck) => (
                                        <TruckCard key={truck.id} truck={truck} />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">🚛</div>
                                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            No Trucks Available
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Check back soon for new inventory!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomePage