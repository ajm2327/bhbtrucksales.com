import { Link } from 'react-router-dom'
import { useState } from 'react'
import { generateTruckSlug } from '../../data/trucks'

const TruckCard = ({ truck, isFeatured = false }) => {
    const [imageLoading, setImagesLoading] = useState(true)
    const [imageError, setImageError] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

    const primaryImage = truck.images.find(img => img.isPrimary) || truck.images[0]
    const formattedPrice = new Intl.NumberFormat('en-US', {

        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(truck.price)

    const cardClasses = `
        bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-102
        ${isFeatured ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
    `

    return (
        <div className={cardClasses}>
            {/* Featured Badge */}
            {isFeatured && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                    </span>
                </div>
            )}

            {/* Image */}
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
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
                            className={`w-full h-full object-cover object-center transition-all duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
                                } ${isFeatured ? 'hover:scale-105' : 'hover:scale-102'}`}
                            onLoad={() => setImagesLoading(false)}
                            onError={() => {
                                console.warn(`Failed to load image: ${backendUrl}${primaryImage.url}`)
                                setImageError(true)
                                setImagesLoading(false)
                            }}
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="text-gray-400 dark:text-gray-600 text-center">
                            <div className="text-4xl mb-2">🚛</div>
                            <div className="text-sm">
                                {imageError ? 'Image not available' : 'No Image Available'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Condition badge */}
                {truck.condition && (
                    <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${truck.condition === 'New'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : truck.condition === 'Used'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                            }`}>
                            {truck.condition}
                        </span>
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="p-6 bg-white dark:bg-gray-800 transition-colors duration-300">
                {/* Title and price */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {truck.year} {truck.make} {truck.model}
                    </h3>
                    {truck.price && (
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {formattedPrice}
                        </p>
                    )}
                </div>

                {/* Key Specs - Only show fields that have values */}
                <div className="mb-4 space-y-2">
                    {truck.engine && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Engine:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{truck.engine}</span>
                        </div>
                    )}
                    {truck.transmission && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Transmission:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{truck.transmission}</span>
                        </div>
                    )}
                    {truck.drivetrain && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Drivetrain:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{truck.drivetrain}</span>
                        </div>
                    )}
                    {truck.stockNumber && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Stock #:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{truck.stockNumber}</span>
                        </div>
                    )}
                </div>

                {/* Colors - Only show if at least one color is available */}
                {(truck.exteriorColor || truck.interiorColor) && (
                    <div className="mb-4 flex gap-4 text-sm">
                        {truck.exteriorColor && (
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Exterior:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{truck.exteriorColor}</span>
                            </div>
                        )}
                        {truck.interiorColor && (
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Interior:</span>
                                <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{truck.interiorColor}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        to={`/truck/${generateTruckSlug(truck)}`}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
                    >
                        View Details
                    </Link>
                    <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-all duration-200 font-medium">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TruckCard