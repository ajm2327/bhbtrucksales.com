import { Link } from 'react-router-dom'
import { generateTruckSlug } from '../../data/trucks'

const TruckCard = ({ truck, isFeatured = false }) => {
    const primaryImage = truck.images.find(img => img.isPrimary) || truck.images[0]
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(truck.price)

    const cardClasses = `
        bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden
        ${isFeatured ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
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
            <div className="relative h-48 bg-gray-200">
                {primaryImage ? (
                    <img
                        src={primaryImage.url}
                        alt={`${truck.year} ${truck.make} ${truck.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = '/images/placeholder-truck.jpg'
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-gray-400 text-center">
                            <div className="text-4xl mb-2">🚛</div>
                            <div className="text-sm">No Image Availabe</div>
                        </div>
                    </div>
                )}

                {/* Condition badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${truck.condition === 'New'
                            ? 'bg-green-100 text-green-800'
                            : truck.condition === 'Used'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                        {truck.condition}
                    </span>
                </div>
            </div>

            {/* Card Content */}
            <div classname="p-6">
                {/* Title and price */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {truck.year} {truck.make} {truck.model}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {formattedPrice}
                    </p>
                </div>

                {/* Key Specs */}
                <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Engine</span>
                        <span className="font-medium">{truck.engine}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transmission</span>
                        <span className="font-medium">{truck.transmission}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Drivetrain:</span>
                        <span className="font-medium">{truck.drivetrain}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stock #:</span>
                        <span className="font-medium">{truck.stockNumber}</span>
                    </div>
                </div>

                {/* Colors */}
                <div className="mb-4 flex gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Exterior:</span>
                        <span className="ml-1 font-medium">{truck.exteriorColor}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Interior:</span>
                        <span className="ml-1 font-medium">{truck.interiorColor}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        to={`/truck/$/{generateTruckSlug(truck)}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        View Details
                    </Link>
                    <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TruckCard