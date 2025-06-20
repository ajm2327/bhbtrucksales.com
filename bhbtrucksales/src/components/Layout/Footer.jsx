import { Link } from 'react-router-dom'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">BHB Truck Sales</h3>
                        <p className="text-gray-300 mb-4">
                            Your trusted source for quality commercial trucks.
                            We specialize in reliable, well-maintained vehicles for your business needs.
                        </p>
                    </div>

                    {/* quick links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <nav className="space-y-2">
                            <Link
                                to="/"
                                className="block text-gray-300 hover:text-white transition-colors"
                            >
                                Browse Trucks
                            </Link>
                            <Link
                                to="/about"
                                className="block text-gray-300 hover:text-white transition-colors"
                            >
                                About Us
                            </Link>
                            <Link
                                to="/contact"
                                className="block text-gray-300 hover:text-white transition-colors"
                            >
                                Contact
                            </Link>
                        </nav>
                    </div>

                    {/*Contact info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                        <div className="space-y-2 text-gray-300">
                            <p>Phone: (520) 889-2323</p>
                            <p>Address: 5158 S Nogales Hwy,<br />
                                Tucson, AZ 85706</p>
                            <p>Hours:<br />
                                Mon - Fri: 8 am - 5 pm<br />
                                Sat - Sun: Closed</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 mt-8 pt-6 text-center">
                    <p className="text-gray-400">
                        &copy; {currentYear} BHB Truck Sales. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer