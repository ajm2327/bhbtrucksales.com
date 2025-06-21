import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        truckInterest: '',
        message: ''
    })

    const [trucks, setTrucks] = useState([])

    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

    useEffect(() => {
        const fetchTrucks = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/trucks?available=true`)
                const data = await response.json()
                if (data.success) {
                    setTrucks(data.data.trucks)
                }
            } catch (error) {
                console.error('Error fetching trucks:', err)
            }
        }
        fetchTrucks()
    }, [backendUrl])


    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (error) setError('')
    }

    const validateForm = () => {

        const hasEmail = formData.email.trim()
        const hasPhone = formData.phone.trim()

        if (!formData.name.trim()) {
            setError('Name is required')
            return false
        }
        if (!hasEmail && !hasPhone) {
            setError('Please provide either an email address or phone number')
            return false
        }

        if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address')
            return false
        }

        if (!formData.message.trim()) {
            setError('Message is required')
            return false
        }
        if (formData.message.trim().length < 10) {
            setError('Message must be at least 10 characters long')
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return
        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${backendUrl}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (response.ok && result.success) {
                setSubmitted(true)
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    truckInterest: '',
                    message: ''
                })
            } else {
                setError(result.error || 'Failed to send message. Please try again.')
            }
        } catch (err) {
            console.error('Contact form error:', err)
            setError('Unable to send message. Please try emailing or calling directly.')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setSubmitted(false)
        setError('')
    }

    if (submitted) {
        return (
            <>
                <Helmet>
                    <title>Message Sent - BHB Truck Sales</title>
                </Helmet>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="max-w-md w-full mx-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                            <div className="text-green-600 text-6xl mb-4"></div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Message Sent Successfully!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Thank you for your inquiry. We look forward to contacting you.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={resetForm}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                                >
                                    Send ANother Message
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                                >
                                    Browse Trucks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Helmet>
                <title>Contact Us - BHB Truck Sales</title>
                <meta
                    name="description"
                    content="Contact BHB Truck Sales for inquiries about our commercial trucks. Call (520) 889-223 or send us a message."
                />
            </Helmet>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Page header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Contact Us
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Ready to find the perfect commercial truck? Get in touch with us today.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* contact info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Get In Touch
                                </h2>
                                <div className="space-y-4">
                                    {/* Phone */}
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                                            <a
                                                href="tel:+15208922323"
                                                className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                            >
                                                (520) 889-2323
                                            </a>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                            <a
                                                href="mailto:bhbtruck@gmail.com"
                                                className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                            >
                                                bhbtruck@gmail.com
                                            </a>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                5158 S Nogales Hwy<br />
                                                Tucson, AZ 85706
                                            </p>
                                        </div>
                                    </div>

                                    {/* Hours */}
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Hours</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Mon - Fri: 8 AM - 5 PM<br />
                                                Sat - Sun: Closed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Prefer to Call?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Speak directly with our truck experts for immediate assistance.
                                </p>
                                <a
                                    href="tel:+15208892323"
                                    className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    <span>Call Now</span>
                                </a>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Send Us a Message
                            </h2>

                            {error && (
                                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="text-red-800 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* Email and Phone Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                                            placeholder="(520) 555-0123"
                                        />
                                    </div>
                                </div>

                                {/* Subject and Truck Interest Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Subject
                                        </label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="truck-inquiry">Truck Inquiry</option>
                                            <option value="service">Service Question</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="truckInterest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Specific Truck Interest
                                        </label>
                                        <select
                                            id="truckInterest"
                                            name="truckInterest"
                                            value={formData.truckInterest}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                                        >
                                            <option value="">Select a truck (optional)</option>
                                            {trucks.map(truck => (
                                                <option key={truck.id} value={truck.id}>
                                                    {truck.year} {truck.make} {truck.model}
                                                    {truck.stockNumber ? ` - ${truck.stockNumber}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200 resize-vertical"
                                        placeholder="Tell us how we can help you..."
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Minimum 10 characters
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${loading
                                        ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                                        : 'bg-primary-600 hover:bg-primary-700 text-white transform hover:scale-105'
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Sending Message...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                            </svg>
                                            <span>Send Message</span>
                                        </span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ContactPage