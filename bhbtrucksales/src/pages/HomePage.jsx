import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import TruckCard from '../components/TruckCard/TruckCard'


const HomePage = () => {
    const [trucks, setTrucks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [siteSettings, setSiteSettings] = useState(null)
    const [announcementDismissed, setAnnouncementDismissed] = useState(() => {
        return localStorage.getItem('announcementDismissed') === 'true'
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch both trucks and site settings
                const [trucksResponse, settingsResponse] = await Promise.all([
                    fetch('http://localhost:3001/api/trucks?available=true'),
                    fetch('http://localhost:3001/api/trucks/site-settings')
                ])

                const trucksData = await trucksResponse.json()
                const settingsData = await settingsResponse.json()

                if (trucksData.success) {
                    setTrucks(trucksData.data.trucks)
                } else {
                    setError('Failed to load trucks')
                }

                if (settingsData.success) {
                    setSiteSettings(settingsData.data)
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

    const featuredTrucks = loading ? [] : trucks.filter(truck => truck.isFeatured)
    const regularTrucks = loading ? [] : trucks.filter(truck => !truck.isFeatured)
    const dismissAnnouncement = () => {
        setAnnouncementDismissed(true)
        localStorage.setItem('announcementDismissed', 'true')
    }


    return (
        <>
            <Helmet>
                <title>BHB Truck Sales - Quality Commercial Trucks for Sale</title>
                <meta
                    name="description"
                    content="Browse our selection of quality commercial trucks. Available with full specifications and competitive pricing."
                />
            </Helmet>

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                {/* Announcement Strip */}
                {siteSettings?.announcement?.isActive && !announcementDismissed && (
                    <div className="bg-primary-500 dark:bg-primary-600 text-white py-3 px-4 animate-slide-down">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex-1 text-center">
                                {siteSettings.announcement.title && (
                                    <span className="font-semibold mr-2">
                                        {siteSettings.announcement.title}:
                                    </span>
                                )}
                                <span>{siteSettings.announcement.message}</span>
                            </div>
                            <button
                                onClick={dismissAnnouncement}
                                className="ml-4 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors duration-200"
                                aria-label="Dismiss announcement"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Hero Banner Section */}
                <section
                    className="relative h-[70vh] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center text-white"
                    style={{
                        backgroundImage: siteSettings?.banner?.imageUrl ? `linear-gradient(rgba(139, 0, 0, 0.7), rgba(139, 0, 0, 0.7)), url(http://localhost:3001${siteSettings.banner.imageUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
                            Quality Commercial Trucks
                        </h1>
                        <p className="text-xl md:text-3xl mb-8 text-gray-100 drop-shadow-md">
                            Find the perfect truck for your business needs
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <div className="bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 text-gray-900 dark:text-gray-100 px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm">
                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {trucks.length} Trucks Available
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <button className="bg-white text-primary-800 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                                    Browse Inventory
                                </button>
                                <button className="bg-primary-600 hover:bg-primary-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                                    Contact Us
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Loading State */}
                {loading && (
                    <section className="py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 rounded-full animate-spin"></div>
                                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
                                </div>
                                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
                                    Loading our truck inventory...
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Error State */}
                {error && (
                    <section className="py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded-lg p-8">
                                <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
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

                {/* Main Content */}
                {!loading && !error && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        {/* Featured Trucks Section */}
                        {featuredTrucks.length > 0 && (
                            <section className="mb-16">
                                <div className="text-center mb-8">
                                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        Featured Inventory
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-400">
                                        Our hand-picked premium vehicles
                                    </p>
                                </div>

                                {/* Horizontal Scroll Container */}
                                <div className="relative">
                                    <div className="flex gap-6 overflow-x-auto pb-4 horizontal-scroll snap-x snap-mandatory">
                                        {featuredTrucks.map(truck => (
                                            <div key={truck.id} className="flex-shrink-0 w-80 snap-center">
                                                <TruckCard truck={truck} isFeatured={true} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Scroll Indicator */}
                                    {featuredTrucks.length > 3 && (
                                        <div className="text-center mt-4">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                ← Scroll to see more featured trucks →
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* All Trucks Section */}
                        <section>
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    {featuredTrucks.length > 0 ? 'Complete Inventory' : 'Available Trucks'}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    Browse our full selection of quality commercial vehicles
                                </p>
                            </div>

                            {trucks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {regularTrucks.map(truck => (
                                        <TruckCard key={truck.id} truck={truck} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-gray-400 dark:text-gray-600 text-8xl mb-6">🚛</div>
                                    <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                        No Trucks Available
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-500 text-lg">
                                        Check back later for new inventory or contact us for upcoming arrivals.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </>
    )
}

export default HomePage