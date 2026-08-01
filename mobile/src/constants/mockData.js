// Updated Mock Data aligned with Figma design specs

export const USER_PROFILE = {
  name: 'Subash',
  phone: '+91 98765 43210',
  email: 'subash@earthworm.ai',
  location: 'Unknown, India',
  district: 'Unknown',
  state: 'Unknown',
  farmSize: '5 Acres',
  soilType: 'Loamy Soil',
  primaryCrops: ['Tomato', 'Potato', 'Rice', 'SugarCane'],
  language: 'English',
  isVerified: true,
};

export const HOME_WEATHER = {
  location: 'Unknown, India',
  temp: 30,
  feelsLike: 32,
  condition: 'Sunny',
  humidity: 60,
  windSpeed: '12 km/h',
  rainProbability: '10%',
  alert: 'Optimal sunny conditions for crop care.',
};

export const FERTILIZER_STORES = [
  { id: '1', name: 'ABC Stores, Punjab', desc: 'NPK 19-19-19 in stock • 2.5 km away' },
  { id: '2', name: 'ABC Stores, Punjab', desc: 'Urea 46% & DAP available • 4.0 km away' },
  { id: '3', name: 'ABC Stores, Punjab', desc: 'Organic Neem Fertilizer • 5.8 km away' },
  { id: '4', name: 'ABC Stores, Punjab', desc: 'Potash & Bio-Pesticides • 7.2 km away' },
];

export const MARKET_CROPS = [
  {
    id: 'crop-1',
    name: 'Tomato',
    price: '₹60/kg',
    change: '+18%',
    isPositive: true,
    category: 'Food Crops',
  },
  {
    id: 'crop-2',
    name: 'Potato',
    price: '₹60/kg',
    change: '-16%',
    isPositive: false,
    category: 'Food Crops',
  },
  {
    id: 'crop-3',
    name: 'Rice',
    price: '₹60/kg',
    change: '+18%',
    isPositive: true,
    category: 'Food Crops',
  },
  {
    id: 'crop-4',
    name: 'SugarCane',
    price: '₹60/kg',
    change: '+20%',
    isPositive: true,
    category: 'Cash Crops',
  },
];

export const CHAT_MESSAGES_INITIAL = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'Hello Subash! 👋 How can Earthworm AI assist your farm today?',
    timestamp: '10:00 AM',
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Which fertilizer should I apply for my Tomato crop this week?',
    timestamp: '10:02 AM',
  },
  {
    id: 'msg-3',
    sender: 'ai',
    text: 'For Tomato in early fruiting stage, apply NPK 19:19:19 @ 5g/L water along with Micronutrient spray.',
    timestamp: '10:03 AM',
  },
];

export const WEATHER_FORECAST = [
  { day: 'Saturday', minTemp: '17°', maxTemp: '30°', condition: 'Sunny' },
  { day: 'Saturday', minTemp: '17°', maxTemp: '30°', condition: 'Partly Cloudy' },
  { day: 'Saturday', minTemp: '17°', maxTemp: '30°', condition: 'Sunny' },
  { day: 'Saturday', minTemp: '17°', maxTemp: '30°', condition: 'Sunny' },
];

export const ONBOARDING_SLIDES = [
  {
    id: '1',
    iconName: 'leaf',
    tagline: 'Smart Farming',
    title: 'Welcome to Earthworm AI',
    description:
      'Your AI-powered farming assistant for disease detection, weather advice, fertilizer recommendations and market prices.',
  },
  {
    id: '2',
    iconName: 'weather-partly-cloudy',
    tagline: 'Weather Alerts',
    title: 'Know Before You Grow',
    description:
      'Receive accurate weather forecasts and farming advisories tailored to your location.',
  },
  {
    id: '3',
    iconName: 'robot-outline',
    tagline: 'AI Assistant',
    title: 'Ask Anything',
    description:
      'Chat with Earthworm AI in your preferred language and get instant farming guidance anytime.',
  },
];
