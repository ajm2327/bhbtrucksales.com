export const truckDataStructure = {
    id: "string",
    year: "number",
    make: "string",
    condition: "string",
    modelCode: "string",

    stockNumber: "string",
    vinNumber: "string",

    price: "string",
    isAvailable: "boolean",
    isFeatured: "boolean",

    images: [
        {
            url: "string",
            caption: "string",
            isPrimary: "boolean"
        }
    ],

    engine: "string",
    transmission: "string",
    drivetrain: "string",
    exteriorColor: "string",
    interiorColor: "string",


    overview: "string",

    specifications: {
        engineFuel: {
            horsepower: "number",
            engineMaker: "string",
            engineBrake: "boolean",
            fuelCapacity: "string",
        },

        transmission: {
            transmissionModel: "string",
            transmissionMaker: "string",
            axleMaker: "string",
            driveAxles: "string",
            axleRatio: "string",
            suspension: "string"
        },

        dimensions: {
            wheelbase: "string",
            cabType: "string",
            bodyTypes: "string",
            roof: "string",
            bunk: "string"
        },

        equipment: {
            fifthWheel: "string",
            audioSystem: "string"
        }
    },

    dateAdded: "Date",
    lastModified: "Date",
    isActive: "boolean"
}

// Sample truck data based on your example
export const sampleTrucks = [
    {
        id: "western-star-49x-wc2899",
        year: 2025,
        make: "WESTERN STAR",
        model: "49X",
        condition: "New",
        modelCode: "49X",
        stockNumber: "WC2899",
        vinNumber: "5KJJBWDR3SPWC2899",
        price: 185000, // Sample price
        isAvailable: true,
        isFeatured: true,

        images: [
            {
                url: "/images/trucks/western-star-49x-1.jpg",
                caption: "Front view",
                isPrimary: true
            },
            {
                url: "/images/trucks/western-star-49x-2.jpg",
                caption: "Side view",
                isPrimary: false
            }
        ],

        engine: "Detroit DD15 505HP",
        transmission: "12 Spd Automated-Manual",
        drivetrain: "6x4",
        exteriorColor: "WHITE",
        interiorColor: "BLACK",
        warranty: "Full Factory Warranty",

        overview: "NOT ACTUAL PHOTOS WE HAVE A NUMBER OF THESE SAME SPEC CONSECUTIVE VINS",

        specifications: {
            engineFuel: {
                horsepower: 505,
                engineMaker: "Detroit",
                engineBrake: true,
                fuelCapacity: "80/80"
            },

            transmission: {
                transmissionModel: "DT12-1650-OH",
                transmissionMaker: "Detroit",
                axleMaker: "Detroit/Detroit",
                driveAxles: "Tandem",
                axleRatio: "3.08",
                suspension: "Air"
            },

            dimensions: {
                wheelbase: "200",
                cabType: "Daycab",
                bodyType: "Semi - Daycab Conventional",
                roof: "0",
                bunk: "None/Blank"
            },

            equipment: {
                fifthWheel: "Air Slide Fifth Wheel",
                audioSystem: "Factory System"
            }
        },

        dateAdded: new Date(),
        lastModified: new Date(),
        isActive: true
    }
]

// Helper function for generating SEO-friendly URLs
export const generateTruckSlug = (truck) => {
    return `${truck.year}-${truck.make}-${truck.model}-${truck.stockNumber}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
}