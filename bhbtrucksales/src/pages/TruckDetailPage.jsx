import { useState, useEffect } from 'react'

const TruckDetailPage = () => {
    // Get truck ID from URL - you'll need to import useParams from react-router-dom
    const id = window.location.pathname.split('/').pop() // Simple URL parsing for demo

    const [truck, setTruck] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [imageLoading, setImageLoading] = useState(true)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

    useEffect(() => {
        const fetchTruck = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`${backendUrl}/api/trucks/${id}`)
                const data = await response.json()

                if (response.ok && data.success) {
                    setTruck(data.data)
                } else {
                    setError(data.error || 'Truck not found')
                }
            } catch (err) {
                console.error('Error fetching truck:', err)
                setError('Unable to load truck details')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchTruck()
        }
    }, [id, backendUrl])

    // Navigate back function
    const goBack = () => {
        window.history.back()
    }

    const goHome = () => {
        window.location.href = '/'
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Loading truck details...
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
                        Truck Not Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <div className="space-x-4">
                        <button
                            onClick={goHome}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                            Browse All Trucks
                        </button>
                        <button
                            onClick={goBack}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!truck) return null

    // Format price
    const formattedPrice = truck.price ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(truck.price) : 'Contact for Price'

    // Get images
    const images = truck.images || []
    const currentImage = images[selectedImageIndex]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Breadcrumb Navigation */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm">
                        <button
                            onClick={goHome}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer"
                        >
                            Home
                        </button>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600 dark:text-gray-400">
                            {truck.year} {truck.make} {truck.model}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Top Section: Vehicle Name, Price & Status */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                            {truck.year} {truck.make} {truck.model}
                        </h1>
                        {truck.isFeatured && (
                            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Featured
                            </span>
                        )}
                    </div>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                        {formattedPrice}
                    </p>

                    {/* Status Badge */}
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${truck.isAvailable
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                            {truck.isAvailable ? 'Available' : 'Sold'}
                        </span>
                        {truck.condition && (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                {truck.condition}
                            </span>
                        )}
                    </div>
                </div>

                {/* Middle Section: Images and Key Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                            {currentImage ? (
                                <>
                                    {imageLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    <img
                                        src={`${backendUrl}${currentImage.url}`}
                                        alt={currentImage.caption || `${truck.year} ${truck.make} ${truck.model}`}
                                        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                        onLoad={() => setImageLoading(false)}
                                        onError={() => setImageLoading(false)}
                                    />

                                    {/* Image Navigation Arrows */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </>
                                    )}

                                    {/* Image Counter */}
                                    {images.length > 1 && (
                                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                            {selectedImageIndex + 1} / {images.length}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-gray-400 dark:text-gray-600 text-center">
                                        <div className="text-6xl mb-4">🚛</div>
                                        <div className="text-lg font-medium">No Images Available</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Strip */}
                        {images.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedImageIndex(index)
                                            setImageLoading(true)
                                        }}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${index === selectedImageIndex
                                            ? 'border-primary-600'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                                            }`}
                                    >
                                        <img
                                            src={`${backendUrl}${image.url}`}
                                            alt={`View ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Key Specifications and Contact */}
                    <div className="space-y-6">
                        {/* Key Specifications */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Key Specifications
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(() => {
                                    // Define all possible key specs with their display names and formatting
                                    const specs = [
                                        {
                                            key: 'stockNumber',
                                            label: 'Stock Number',
                                            value: truck.stockNumber,
                                            format: (val) => val
                                        },
                                        {
                                            key: 'mileage',
                                            label: 'Mileage',
                                            value: truck.mileage,
                                            format: (val) => typeof val === 'number' ? new Intl.NumberFormat('en-US').format(val) + ' miles' : val
                                        },
                                        {
                                            key: 'vinNumber',
                                            label: 'VIN',
                                            value: truck.vinNumber,
                                            format: (val) => val,
                                            className: 'text-xs break-all'
                                        },
                                        {
                                            key: 'engine',
                                            label: 'Engine',
                                            value: truck.engine,
                                            format: (val) => val
                                        },
                                        {
                                            key: 'transmission',
                                            label: 'Transmission',
                                            value: truck.transmission,
                                            format: (val) => val
                                        },
                                        {
                                            key: 'drivetrain',
                                            label: 'Drivetrain',
                                            value: truck.drivetrain,
                                            format: (val) => val
                                        },
                                        {
                                            key: 'exteriorColor',
                                            label: 'Exterior Color',
                                            value: truck.exteriorColor,
                                            format: (val) => val
                                        },
                                        {
                                            key: 'interiorColor',
                                            label: 'Interior Color',
                                            value: truck.interiorColor,
                                            format: (val) => val
                                        }
                                    ];

                                    // Filter out empty, null, undefined, and 'N/A' values
                                    const availableSpecs = specs.filter(spec =>
                                        spec.value &&
                                        spec.value !== 'N/A' &&
                                        spec.value !== '' &&
                                        spec.value.toString().trim() !== ''
                                    );

                                    return availableSpecs.map(spec => (
                                        <div key={spec.key}>
                                            <span className="text-gray-600 dark:text-gray-400 text-sm">{spec.label}</span>
                                            <p className={`font-semibold text-gray-900 dark:text-gray-100 ${spec.className || ''}`}>
                                                {spec.format(spec.value)}
                                            </p>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* Contact Actions */}
                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Interested in this truck?
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href="tel:+15208892323"
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    <span>Call (520) 889-2323</span>
                                </a>
                                <button
                                    onClick={() => window.location.href = '/contact'}
                                    className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 border border-gray-300 dark:border-gray-600 flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <span>Send Message</span>
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                                Located at 5158 S Nogales Hwy, Tucson, AZ 85706
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Overview and Detailed Specifications */}
                <div className="space-y-8">

                    {/* Overview Section - Full Width */}
                    {truck.overview && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Overview
                            </h2>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {truck.overview}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Detailed Specifications - Full Width */}
                    {truck.specifications && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Detailed Specifications
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Engine & Fuel */}
                                {truck.specifications.engineFuel && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                            Engine & Fuel
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(truck.specifications.engineFuel).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Transmission */}
                                {truck.specifications.transmission && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                            Transmission & Drivetrain
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(truck.specifications.transmission).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Dimensions */}
                                {truck.specifications.dimensions && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                            Dimensions & Body
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(truck.specifications.dimensions).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Equipment */}
                                {truck.specifications.equipment && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                            Equipment
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(truck.specifications.equipment).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Back to Inventory */}
                <div className="mt-12 text-center">
                    <button
                        onClick={goHome}
                        className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to All Trucks</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TruckDetailPage