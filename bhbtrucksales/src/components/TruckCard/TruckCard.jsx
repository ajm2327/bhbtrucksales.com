import { Link } from 'react-router-dom'
import { useState } from 'react'
import { generateTruckSlug } from '../../data/trucks'

const TruckCard = ({ truck }) => {
    const [imageLoading, setImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

    const primaryImage = truck.images?.find(img => img.isPrimary) || truck.images?.[0]
    const formattedPrice = truck.price ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(truck.price) : 'Contact for Price'

    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden w-full" style={{ height: '420px', maxWidth: '400px' }}>
            {/* Featured Badge - Fixed positioning and padding */}
            {truck.isFeatured && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="bg-primary-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg inline-block">
                        Featured
                    </span>
                </div>
            )}

            {/* Fixed Height Image Container */}
            <div className="relative w-full overflow-hidden bg-gray-200 dark:bg-gray-700" style={{ height: '200px' }}>
                {primaryImage && !imageError ? (
                    <>
                        {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                            </div>
                        )}
                        <img
                            src={`${backendUrl}${primaryImage.url}`}
                            alt={`${truck.year} ${truck.make} ${truck.model}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
                                } hover:scale-105`}
                            style={{ objectFit: 'cover', width: '100%', height: '200px' }}
                            onLoad={() => setImageLoading(false)}
                            onError={() => {
                                setImageError(true)
                                setImageLoading(false)
                            }}
                        />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="text-gray-400 dark:text-gray-600 text-center">
                            <div className="text-5xl mb-2">🚛</div>
                            <div className="text-sm font-medium">No Image Available</div>
                        </div>
                    </div>
                )}

            </div>

            {/* Fixed Height Content Container */}
            <div className="p-4 flex flex-col" style={{ height: '220px' }}>
                {/* Title and Price */}
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {truck.year} {truck.make} {truck.model}
                    </h3>
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {formattedPrice}
                    </p>
                </div>

                {/* Key Specs - Fixed area */}
                <div className="flex-grow mb-3 overflow-hidden">
                    <div className="space-y-1">
                        {truck.stockNumber && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Stock #:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-2">{truck.stockNumber}</span>
                            </div>
                        )}
                        {truck.mileage && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Mileage:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-2">{new Intl.NumberFormat('en-US').format(truck.mileage)}</span>
                            </div>
                        )}
                        {truck.engine && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Engine:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-2" style={{ maxWidth: '60%' }}>{truck.engine}</span>
                            </div>
                        )}
                        {truck.transmission && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Trans:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-2" style={{ maxWidth: '60%' }}>{truck.transmission}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div className="flex gap-2">
                    <Link
                        to={`/truck/${truck.id}`}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium text-sm"
                    >
                        View Details
                    </Link>
                    <Link
                        to="/contact"
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-all duration-200 font-medium text-sm"
                    >
                        Contact
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default TruckCard