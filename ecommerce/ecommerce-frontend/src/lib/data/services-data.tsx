import {
    Users, Award, ThumbsUp, Clock, Shield, Headphones,
    Calendar, Gift, Building2, Zap, TrendingUp,
    Droplets, AlertTriangle, CheckCircle2, Bell, Wrench, RefreshCw, AlertCircle, Phone
} from 'lucide-react';

// --- Why Choose Us Data ---

export const SERVICE_STATS = [
    {
        icon: Users,
        value: '50,000+',
        label: 'Happy Customers',
        color: 'from-[#00C4CC] to-[#00a8b3]'
    },
    {
        icon: Award,
        value: '15+',
        label: 'Years Experience',
        color: 'from-[#0B1F51] to-[#1a3570]'
    },
    {
        icon: ThumbsUp,
        value: '98%',
        label: 'Satisfaction Rate',
        color: 'from-[#F5B012] to-[#f5c942]'
    },
    {
        icon: Clock,
        value: '24/7',
        label: 'Support Available',
        color: 'from-[#22C55E] to-[#16a34a]'
    }
];

export const SERVICE_REASONS = [
    {
        icon: Shield,
        title: 'Certified Technicians',
        description: 'All our technicians are factory-trained and certified with 10+ years of hands-on experience in water purification systems.'
    },
    {
        icon: Clock,
        title: 'Quick Response Time',
        description: 'Average response time under 2 hours for emergency services. Same-day service available in most locations.'
    },
    {
        icon: Award,
        title: 'Genuine Parts Only',
        description: 'We use only 100% genuine manufacturer-approved parts with proper warranty coverage for all replacements.'
    },
    {
        icon: Headphones,
        title: 'Dedicated Support',
        description: '24/7 customer support team ready to help. Get instant assistance via phone, chat, or email anytime.'
    },
    {
        icon: ThumbsUp,
        title: 'Transparent Pricing',
        description: 'No hidden costs or surprise charges. You get a detailed quote before any work begins with clear pricing breakdown.'
    },
    {
        icon: Users,
        title: 'Trusted by Thousands',
        description: 'Join 50,000+ satisfied customers who trust us for their water purification needs. Check our verified reviews.'
    }
];

export const SERVICE_CERTIFICATIONS = [
    { name: 'ISO 9001:2015', desc: 'Quality Management' },
    { name: 'ISO 14001', desc: 'Environmental' },
    { name: 'NSF Certified', desc: 'Water Quality' },
    { name: 'BIS Approved', desc: 'Indian Standards' }
];

// --- AMC Services Data ---

export const AMC_BENEFITS = [
    {
        icon: Shield,
        title: 'Priority Service',
        description: 'Skip the queue with dedicated AMC support line'
    },
    {
        icon: Calendar,
        title: 'Regular Maintenance',
        description: 'Scheduled visits every 3 months for optimal performance'
    },
    {
        icon: Headphones,
        title: '24/7 Support',
        description: 'Round-the-clock technical assistance and guidance'
    },
    {
        icon: Gift,
        title: 'Free Spare Parts',
        description: 'Complimentary replacement of minor parts and filters'
    }
];

export const AMC_PLANS = [
    {
        name: 'Basic Plan',
        price: '₹2,999',
        duration: '/year',
        popular: false,
        features: [
            '3 Service Visits Per Year',
            'Free General Check-up',
            'Filter Cleaning',
            'Water Quality Testing',
            'Phone Support',
            '10% Off on Spare Parts'
        ]
    },
    {
        name: 'Premium Plan',
        price: '₹4,999',
        duration: '/year',
        popular: true,
        discount: '40% OFF',
        features: [
            '4 Service Visits Per Year',
            'Free Membrane Replacement',
            'Complete System Sanitization',
            'Priority Emergency Service',
            '24/7 Support',
            'Free Minor Spare Parts',
            '20% Off on Major Repairs'
        ]
    },
    {
        name: 'Elite Plan',
        price: '₹7,999',
        duration: '/year',
        popular: false,
        features: [
            'Unlimited Service Visits',
            'All Filters Included',
            'Annual RO Membrane Change',
            'Same-Day Emergency Service',
            'Dedicated Service Manager',
            'Free All Spare Parts',
            '30% Off on New Purchases'
        ]
    }
];

// --- Commercial Services Data ---

export const COMMERCIAL_SOLUTIONS = [
    {
        icon: Building2,
        title: 'Office Buildings',
        capacity: '50-500 employees',
        features: ['Wall-mounted dispensers', 'Hot & cold water', 'Low maintenance']
    },
    {
        icon: Users,
        title: 'Hotels & Restaurants',
        capacity: '100-1000 guests',
        features: ['High flow rate', 'Multiple taps', 'Food-grade certified']
    },
    {
        icon: Zap,
        title: 'Manufacturing Plants',
        capacity: '500-5000 LPH',
        features: ['Industrial capacity', 'Customized TDS', 'Continuous operation']
    },
    {
        icon: Shield,
        title: 'Healthcare Facilities',
        capacity: 'Medical grade',
        features: ['Ultra-pure water', 'Bacteria-free', 'Regular sanitization']
    }
];

export const COMMERCIAL_BENEFITS = [
    'Customized capacity from 50 LPH to 5000 LPH',
    'Energy-efficient operation reduces costs by 40%',
    'Dedicated service manager for enterprise clients',
    'Quarterly water quality reports and compliance',
    'Remote monitoring and IoT integration',
    'Same-day emergency response guarantee'
];

export const COMMERCIAL_CASE_STUDIES = [
    {
        client: 'Tech Park Pune',
        type: 'IT Campus',
        capacity: '2000 LPH',
        employees: '3000+',
        savings: '₹5L/year'
    },
    {
        client: 'Grand Hotel Mumbai',
        type: 'Hospitality',
        capacity: '1500 LPH',
        employees: '500 Rooms',
        savings: '₹3.5L/year'
    },
    {
        client: 'Manufacturing Hub',
        type: 'Industrial',
        capacity: '5000 LPH',
        employees: '1500+',
        savings: '₹8L/year'
    }
];

// --- Filter Replacement Data ---

export const FILTER_TYPES = [
    {
        name: 'Sediment Filter',
        lifespan: '6-12 months',
        price: '₹299',
        function: 'Removes dirt, dust, and particles'
    },
    {
        name: 'Pre-Carbon Filter',
        lifespan: '6-12 months',
        price: '₹399',
        function: 'Eliminates chlorine and odor'
    },
    {
        name: 'RO Membrane',
        lifespan: '24-36 months',
        price: '₹1,499',
        function: 'Removes dissolved impurities and TDS'
    },
    {
        name: 'Post-Carbon Filter',
        lifespan: '12 months',
        price: '₹349',
        function: 'Enhances taste and freshness'
    },
    {
        name: 'UV Lamp',
        lifespan: '12 months',
        price: '₹799',
        function: 'Kills bacteria and viruses'
    },
    {
        name: 'Alkaline Filter',
        lifespan: '6-8 months',
        price: '₹599',
        function: 'Adds essential minerals'
    }
];

export const FILTER_WARNING_SIGNS = [
    'Unusual taste or odor in water',
    'Reduced water flow rate',
    'Cloudy or discolored water',
    'Strange noises from purifier',
    'High TDS reading',
    'Filter change indicator on'
];

// --- Installation Services Data ---

export const INSTALLATION_FEATURES = [
    {
        icon: Wrench,
        title: 'Expert Installation',
        description: 'Certified technicians with 10+ years experience'
    },
    {
        icon: Clock,
        title: 'Same-Day Service',
        description: 'Quick installation within 24 hours of booking'
    },
    {
        icon: Shield,
        title: '1 Year Warranty',
        description: 'Complete warranty on installation work'
    }
];

export const INSTALLATION_STEPS = [
    {
        number: '01',
        title: 'Site Assessment',
        description: 'Our expert visits your location to assess water quality and installation requirements'
    },
    {
        number: '02',
        title: 'Custom Planning',
        description: 'We design the optimal setup based on your water source and usage needs'
    },
    {
        number: '03',
        title: 'Professional Setup',
        description: 'Certified technicians install the system with precision and care'
    },
    {
        number: '04',
        title: 'Quality Testing',
        description: 'Complete testing and demonstration to ensure perfect water quality'
    }
];

// --- Repair Services Data ---

export const REPAIR_COMMON_ISSUES = [
    {
        issue: 'Low Water Flow',
        solution: 'Filter replacement or membrane cleaning',
        time: '30-45 mins'
    },
    {
        issue: 'Water Leakage',
        solution: 'Seal and connection check',
        time: '20-30 mins'
    },
    {
        issue: 'Bad Taste/Odor',
        solution: 'Filter replacement and sanitization',
        time: '40-60 mins'
    },
    {
        issue: 'No Power/Display',
        solution: 'Electrical component repair',
        time: '45-60 mins'
    },
    {
        issue: 'TDS High',
        solution: 'Membrane replacement',
        time: '50-70 mins'
    },
    {
        issue: 'Unusual Noise',
        solution: 'Pump and motor inspection',
        time: '30-50 mins'
    }
];

export const REPAIR_FEATURES = [
    'Same-day repair service available',
    'Genuine spare parts guaranteed',
    '90-day warranty on repairs',
    'Transparent pricing - no hidden costs',
    'Expert certified technicians',
    'Free diagnosis and estimation'
];

// --- Service Categories Data ---

export const SERVICE_CATEGORIES = [
    {
        icon: Wrench,
        title: 'Installation',
        description: 'Expert setup and installation of all water purifier models',
        color: 'bg-[#00C4CC]',
        lightBg: 'bg-[#00C4CC]/10',
        href: '/services'
    },
    {
        icon: Shield,
        title: 'AMC Plans',
        description: 'Annual maintenance contracts with priority support',
        color: 'bg-[#F5B012]',
        lightBg: 'bg-[#F5B012]/10',
        href: '/amc'
    },
    {
        icon: RefreshCw,
        title: 'Repair Service',
        description: 'Quick troubleshooting and repair solutions',
        color: 'bg-[#0B1F51]',
        lightBg: 'bg-[#0B1F51]/10',
        href: '/services'
    },
    {
        icon: Droplets,
        title: 'Filter Replacement',
        description: 'Genuine filters with on-time replacement',
        color: 'bg-[#00C4CC]',
        lightBg: 'bg-[#00C4CC]/10',
        href: '/services'
    },
    {
        icon: Building2,
        title: 'Commercial RO',
        description: 'Industrial water plants and bulk solutions',
        color: 'bg-[#0B1F51]',
        lightBg: 'bg-[#0B1F51]/10',
        href: '/collections'
    },
    {
        icon: Zap,
        title: 'Emergency',
        description: '24/7 emergency service and support',
        color: 'bg-[#EF4444]',
        lightBg: 'bg-[#EF4444]/10',
        href: '#contact'
    }
];
