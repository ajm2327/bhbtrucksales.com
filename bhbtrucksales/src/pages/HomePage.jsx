import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import TruckCard from '../components/TruckCard/TruckCard'


const HomePage = () => {
    const [trucks, setTrucks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTrucks = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('http://localhost:3001/api/trucks?available=true')
                const data = await response.json()

                if (data.success) {
                    setTrucks(data.data.trucks)
                } else {
                    setError('Failed to load trucks')
                }
            } catch (err) {
                console.error('Error fetching trucks:', err)
                setError('Unable to connect to server')
            } finally {
                setLoading(false)
            }
        }
        fetchTrucks()
    }, [])

    const featuredTrucks = loading ? [] : trucks.filter(truck => truck.isFeatured)
    const regularTrucks = loading ? [] : trucks.filter(truck => !truck.isFeatured)


    return (
        <>
            <Helmet>
                <title>
                    BHB Truck Sales - Quality Commercial Trucks for Sale
                </title>
                <meta
                    name="description"
                    content="Browse our selection of quality commercial trucks. Available with full specifications and competitive pricing."
                />
            </Helmet>
            <div className="bg-gray-50 min-h-screen">
                {/* Hero section */}
                <section className="bg-blue-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Quality Commercial Trucks
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Find the perfect truck for your business needs
                        </p>
                        <div className="flex justify-center">
                            <div className="bg-white text-gray-900 px-6 py-4 rounded-lg shadow-lg">
                                <span className="text-2xl font-bold text-blue-900">
                                    {trucks.length} Trucks available
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main content */}
                {!loading && !error && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                        {/* Featured trucks */}
                        {featuredTrucks.length > 0 && (
                            <section className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    Featured Trucks
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {featuredTrucks.map(truck => (
                                        <TruckCard key={truck.id} truck={truck} isFeatured={true} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* loading state */}
                        {loading && (
                            <section className="py-12">
                                <div classname="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                    <div className="text-2xl font-semibold text-gray-600">Loading trucks...</div>
                                    <div className="mt-4">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Error state */}
                        {error && (
                            <section className="py-12">
                                <div className="mx-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                    <div className="text-red-600 text-xl font-semiboled">{error}</div>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* All Trucks */}
                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                {featuredTrucks.length > 0 ? 'All Trucks' : 'Available Trucks'}
                            </h2>

                            {trucks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {regularTrucks.map(truck => (
                                        <TruckCard key={truck.id} truck={truck} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-6xl mb-4">🚛</div>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        No Trucks Available
                                    </h3>
                                    <p className="text-gray-500">
                                        Check back later for new inventory.
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