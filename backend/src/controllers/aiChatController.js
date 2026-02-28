const fetch = require('node-fetch');
const Room = require('../models/Room');
const catchAsync = require('../utils/catchAsync');

// Global inventory
let aiInventory = [];

// Fetch rooms from API
async function fetchRoomsFromAPI(query = null) {
  try {
    console.log("[AI] Fetching rooms from /api/rooms endpoint");
    
    const apiUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/rooms`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === "success" && Array.isArray(data.data)) {
      console.log(`[AI] Fetched ${data.data.length} rooms from API`);
      
      const rooms = data.data.map(room => ({
        id: room._id || room.id,
        _id: room._id || room.id,
        name: room.title || room.name || "Untitled Room",
        price: room.price || 0,
        location: room.location || "Location not specified",
        description: room.description || "No description available",
        bedrooms: room.bedrooms || 1,
        beds: room.beds || 1,
        capacity: room.capacity || 2,
        propertyType: room.propertyType || "Accommodation",
        roomType: room.roomType || "Standard",
        amenities: Array.isArray(room.amenities) ? room.amenities : [],
        foodFacility: room.foodFacility || "Not specified",
        discount: room.discount || 0,
        status: room.status || "pending",
        booking: room.booking || false,
        images: Array.isArray(room.images) ? room.images : [],
        coordinates: room.coordinates || null,
        unavailableDates: Array.isArray(room.unavailableDates) ? room.unavailableDates : []
      }));
      
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        return rooms.filter(room => {
          const searchableText = [
            room.name,
            room.location,
            room.description,
            room.propertyType,
            room.roomType,
            ...room.amenities
          ].join(' ').toLowerCase();
          
          return searchableText.includes(searchTerm);
        });
      }
      
      return rooms;
    } else {
      console.error("[AI] Invalid API response format:", data);
      return [];
    }
  } catch (error) {
    console.error("[AI] Error fetching rooms from API:", error.message);
    return [];
  }
}

// Check if query is greeting/small talk
function isGreetingOrSmallTalk(query) {
  const greetings = [
    "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
    "how are you", "what's up", "hi there", "hello there", "morning", "evening"
  ];
  
  const smallTalk = [
    "thanks", "thank you", "ok", "okay", "bye", "goodbye", "see you",
    "help", "what can you do", "who are you", "what are you", "can you help",
    "nice", "good", "great", "awesome", "cool", "perfect", "excellent"
  ];
  
  const lowerQuery = query.toLowerCase().trim();
  
  return greetings.some(greeting => lowerQuery === greeting) ||
         smallTalk.some(talk => lowerQuery.includes(talk));
}

// Generate greeting response
async function generateGreetingResponse(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  let roomCount = 0;
  try {
    const rooms = await fetchRoomsFromAPI();
    roomCount = rooms.length;
  } catch (error) {
    roomCount = 0;
  }
  
  const responses = {
    "hi": `Hello! 👋 I'm your ShelterSeek booking assistant. I can help you find ${roomCount > 0 ? `${roomCount} accommodations` : 'hotels and accommodations'} across India. What are you looking for today?`,
    "hello": `Hi there! 🏨 I'm here to help you find the perfect place to stay. ${roomCount > 0 ? `I have ${roomCount} properties in my database.` : ''} Where would you like to go?`,
    "hey": "Hey! ✨ Welcome to ShelterSeek. I'm your AI assistant for finding hotels, resorts, and homestays. Tell me what you need!",
    "good morning": "Good morning! ☀️ Ready to find your perfect stay for the day?",
    "good afternoon": "Good afternoon! 🌤️ How can I help you find accommodation today?",
    "good evening": "Good evening! 🌙 Looking for a place to stay tonight?",
    "how are you": "I'm great, thanks! Ready to help you find amazing accommodations. What's on your mind?",
    "what can you do": `I can help you search through ${roomCount} properties! I can find hotels by location, price, type, and amenities. Try asking me something like:\n• "Hotels in Goa"\n• "Budget stays under 2000"\n• "Beach resorts"\n• "Family rooms with pool"`,
    "who are you": "I'm ShelterSeek AI, your personal hotel booking assistant! I search through our database to find the perfect accommodations for you.",
    "help": `I can help you find hotels, resorts, homestays, and more! Just tell me what you're looking for. Examples:\n• "Hotels in Hyderabad"\n• "Budget stays under ₹1500"\n• "Resorts"\n• "Family rooms with pool"`,
    "thanks": "You're welcome! 😊 Let me know if you need anything else.",
    "thank you": "My pleasure! Happy to help you find the perfect stay.",
    "bye": "Goodbye! 👋 Have a great day and safe travels!",
    "goodbye": "Take care! Hope to help you again soon. 🏡"
  };
  
  for (const [key, response] of Object.entries(responses)) {
    if (lowerQuery === key) {
      return { reply: response, showRooms: false, isGreeting: true };
    }
  }
  
  for (const [key, response] of Object.entries(responses)) {
    if (lowerQuery.includes(key) && key.length > 3) {
      return { reply: response, showRooms: false, isGreeting: true };
    }
  }
  
  return {
    reply: `Hi! I'm ShelterSeek bot — your hotel booking assistant. I have ${roomCount} properties in my database. Where would you like to stay and when?`,
    showRooms: false,
    isGreeting: true
  };
}

// Search rooms intelligently
async function searchRooms(query) {
  if (!query || query.trim() === "") {
    const rooms = await fetchRoomsFromAPI();
    return rooms.slice(0, 10);
  }
  
  const searchTerm = query.toLowerCase().trim();
  console.log(`[AI] Searching for: "${searchTerm}"`);
  
  let rooms = await fetchRoomsFromAPI(searchTerm);
  
  if (rooms.length > 0) {
    console.log(`[AI] Found ${rooms.length} rooms with direct search`);
    return rooms;
  }
  
  console.log(`[AI] No direct matches, fetching all rooms for intelligent filtering`);
  const allRooms = await fetchRoomsFromAPI();
  
  if (allRooms.length === 0) {
    return [];
  }
  
  const scoredRooms = allRooms.map(room => {
    let score = 0;
    
    if (room.name.toLowerCase().includes(searchTerm)) score += 100;
    if (room.location.toLowerCase().includes(searchTerm)) score += 80;
    if (room.propertyType.toLowerCase().includes(searchTerm)) score += 60;
    if (room.description.toLowerCase().includes(searchTerm)) score += 40;
    if (room.roomType.toLowerCase().includes(searchTerm)) score += 50;
    
    room.amenities.forEach(amenity => {
      if (amenity.toLowerCase().includes(searchTerm)) score += 20;
    });
    
    const priceMatch = searchTerm.match(/\d+/);
    if (priceMatch) {
      const targetPrice = parseInt(priceMatch[0]);
      if (!isNaN(targetPrice)) {
        const priceDiff = Math.abs(room.price - targetPrice);
        if (priceDiff < 500) score += 40;
        if (room.price <= targetPrice) score += 30;
      }
    }
    
    const searchPatterns = {
      "budget": ["cheap", "affordable", "economy", "low cost", "inexpensive"],
      "luxury": ["premium", "deluxe", "5-star", "high-end", "exclusive"],
      "hostel": ["dormitory", "backpacker"],
      "resort": ["vacation", "holiday"],
      "apartment": ["flat", "unit"],
      "family": ["kids", "children", "large", "spacious"],
      "pool": ["swimming", "jacuzzi", "hot tub"],
      "wifi": ["internet", "connection", "online"],
      "breakfast": ["meal", "food", "dining"]
    };
    
    for (const [pattern, synonyms] of Object.entries(searchPatterns)) {
      if (searchTerm.includes(pattern) || synonyms.some(syn => searchTerm.includes(syn))) {
        const roomText = [
          room.description,
          room.propertyType,
          room.roomType,
          ...room.amenities
        ].join(' ').toLowerCase();
        
        if (roomText.includes(pattern) || synonyms.some(syn => roomText.includes(syn))) {
          score += 35;
        }
        
        if (pattern === "budget" && room.price < 2000) score += 25;
        if (pattern === "luxury" && room.price > 4000) score += 25;
        if (pattern === "family" && room.capacity >= 4) score += 20;
      }
    }
    
    const popularLocations = {
      "hyderabad": ["hyderabad", "hyd"],
      "chitoor": ["chittoor", "chittor"],
      "sricity": ["sri city", "sri-city"],
      "goa": ["north goa", "south goa", "panaji", "calangute", "baga"],
      "mumbai": ["bandra", "colaba", "juhu", "andheri", "navi mumbai"]
    };
    
    for (const [location, aliases] of Object.entries(popularLocations)) {
      if (searchTerm.includes(location) || aliases.some(alias => searchTerm.includes(alias))) {
        if (room.location.toLowerCase().includes(location)) {
          score += 70;
        }
      }
    }
    
    if (room.status === "verified" || room.status === "approved") score += 15;
    if (!room.booking) score += 10;
    
    return { ...room, score };
  });
  
  const relevantRooms = scoredRooms
    .filter(room => room.score > 0)
    .sort((a, b) => b.score - a.score);
  
  console.log(`[AI] Intelligent filtering found ${relevantRooms.length} relevant rooms`);
  
  if (relevantRooms.length === 0 && allRooms.length > 0) {
    console.log(`[AI] No matches found, returning recent rooms`);
    return allRooms.slice(0, 5);
  }
  
  return relevantRooms.slice(0, 8);
}

// Generate search response
function generateSearchResponse(query, foundRooms) {
  if (foundRooms.length === 0) {
    return {
      reply: `I searched our database but couldn't find any rooms matching "${query}".\n\n**Try searching by:**\n• Location (e.g., "Hyderabad", "Chitoor")\n• Price range (e.g., "under 2000", "budget")\n• Room type (e.g., "hostel", "resort", "apartment")\n• Features (e.g., "with pool", "family room")\n\nOr simply browse all available rooms!`,
      suggestions: [
        "Show all rooms",
        "Search by location",
        "Filter by price",
        "Contact support"
      ]
    };
  }
  
  const locations = [...new Set(foundRooms.map(r => r.location).filter(l => l && l !== "Location not specified"))];
  const propertyTypes = [...new Set(foundRooms.map(r => r.propertyType).filter(t => t))];
  const prices = foundRooms.map(r => r.price).filter(p => p > 0);
  
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  
  let reply = `🔍 **Search Results for "${query}"**\n\n`;
  reply += ` Found **${foundRooms.length} room${foundRooms.length !== 1 ? 's' : ''}** `;
  
  if (locations.length === 1) {
    reply += `in **${locations[0]}** `;
  } else if (locations.length > 0 && locations.length <= 3) {
    reply += `in **${locations.join(', ')}** `;
  }
  
  if (minPrice > 0 && maxPrice > 0) {
    reply += `with prices from **₹${minPrice}** to **₹${maxPrice}** per night.\n\n`;
  } else {
    reply += `\n\n`;
  }
  
  reply += `🏆 **Top Recommendations**\n\n`;
  
  foundRooms.slice(0, 3).forEach((room, index) => {
    const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
    
    reply += `${rankEmoji} **${room.name}**\n`;
    reply += `📍 ${room.location} | 👥 ${room.capacity} guests | 🏠 ${room.propertyType}\n`;
    reply += `💰 **₹${room.price}/night**`;
    
    if (room.discount > 0) {
      reply += ` (🎁 ${room.discount}% OFF)`;
    }
    
    const keyAmenities = room.amenities.slice(0, 3);
    if (keyAmenities.length > 0) {
      reply += `\n✨ ${keyAmenities.join(' • ')}`;
    }
    
    if (room.description) {
      const shortDesc = room.description.length > 70 
        ? room.description.substring(0, 70) + "..."
        : room.description;
      reply += `\n📝 ${shortDesc}\n\n`;
    } else {
      reply += `\n\n`;
    }
  });
  
  if (foundRooms.length > 3) {
    reply += `📋 **Plus ${foundRooms.length - 3} more options available**\n\n`;
  }
  
  reply += `💡 **Need more details?** Click on any room or ask me specific questions!`;
  
  return {
    reply,
    suggestions: generateSearchSuggestions(foundRooms, query)
  };
}

// Generate search suggestions
function generateSearchSuggestions(foundRooms, query) {
  const suggestions = new Set();
  
  suggestions.add("Show all rooms");
  suggestions.add("Contact support");
  
  const locations = [...new Set(foundRooms.map(r => r.location).filter(l => l))];
  locations.slice(0, 2).forEach(location => {
    suggestions.add(`More in ${location}`);
  });
  
  const prices = foundRooms.map(r => r.price).filter(p => p > 0);
  if (prices.length > 0) {
    const avgPrice = prices.reduce((a, b) => a + b) / prices.length;
    
    if (avgPrice < 2000) {
      suggestions.add("Mid-range ₹2000-₹4000");
      suggestions.add("Luxury ₹4000+");
    } else if (avgPrice < 4000) {
      suggestions.add("Budget under ₹2000");
      suggestions.add("Premium ₹4000+");
    } else {
      suggestions.add("Affordable under ₹3000");
      suggestions.add("Mid-range ₹3000-₹6000");
    }
  }
  
  const propertyTypes = [...new Set(foundRooms.map(r => r.propertyType).filter(t => t))];
  propertyTypes.slice(0, 2).forEach(type => {
    suggestions.add(`Browse ${type}s`);
  });
  
  const allAmenities = foundRooms.flatMap(r => r.amenities);
  const amenityCount = {};
  allAmenities.forEach(amenity => {
    if (amenity && typeof amenity === 'string') {
      amenityCount[amenity] = (amenityCount[amenity] || 0) + 1;
    }
  });
  
  const commonAmenities = Object.entries(amenityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([amenity]) => amenity);
  
  commonAmenities.forEach(amenity => {
    suggestions.add(`With ${amenity}`);
  });
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("hyderabad")) {
      suggestions.add("Hostels in Hyderabad");
      suggestions.add("Apartments in Hyderabad");
    }
    
    if (lowerQuery.includes("chitoor")) {
      suggestions.add("Resorts in Chitoor");
    }
    
    if (lowerQuery.includes("budget") || lowerQuery.includes("cheap")) {
      suggestions.add("Under ₹2000");
      suggestions.add("Best value");
    }
    
    if (lowerQuery.includes("luxury") || lowerQuery.includes("premium")) {
      suggestions.add("Premium amenities");
      suggestions.add("Exclusive stays");
    }
  }
  
  suggestions.add("With breakfast");
  suggestions.add("Free parking");
  suggestions.add("WiFi included");
  
  return Array.from(suggestions).slice(0, 6);
}

// Generate initial suggestions
async function generateInitialSuggestions() {
  try {
    const rooms = await fetchRoomsFromAPI();
    const locations = [...new Set(rooms.map(r => r.location).filter(l => l))];
    
    return [
      `Hotels in ${locations[0] || "Hyderabad"}`,
      "Budget stays",
      "Resorts",
      "Family rooms",
      "With WiFi",
      "Free parking"
    ];
  } catch (error) {
    return [
      "Search hotels in Hyderabad",
      "Show budget hotels",
      "Beachfront properties",
      "Luxury resorts",
      "Family rooms",
      "City center hotels"
    ];
  }
}

// Main AI chat endpoint
exports.chat = catchAsync(async (req, res) => {
  console.log("[AI Chat] Request received");
  
  const { message } = req.body;
  const query = message ? message.trim() : "";
  
  console.log(`[AI Chat] Processing query: "${query}"`);
  
  if (!query) {
    const suggestions = await generateInitialSuggestions();
    return res.json({
      reply: "Hello! I'm your ShelterSeek booking assistant. How can I help you find the perfect accommodation today?",
      hotels: [],
      suggestions: suggestions
    });
  }
  
  if (isGreetingOrSmallTalk(query)) {
    console.log("[AI Chat] Detected greeting/small talk");
    const greetingResponse = await generateGreetingResponse(query);
    
    return res.json({
      reply: greetingResponse.reply,
      hotels: [],
      suggestions: await generateInitialSuggestions()
    });
  }
  
  const foundRooms = await searchRooms(query);
  const response = generateSearchResponse(query, foundRooms);
  
  const formattedRooms = foundRooms.slice(0, 5).map(room => ({
    id: room.id,
    _id: room._id,
    name: room.name,
    price: room.price,
    location: room.location,
    description: room.description,
    capacity: room.capacity,
    propertyType: room.propertyType,
    roomType: room.roomType,
    amenities: room.amenities,
    discount: room.discount,
    images: room.images,
    status: room.status,
    booking: room.booking
  }));
  
  res.json({
    reply: response.reply,
    hotels: formattedRooms,
    suggestions: response.suggestions
  });
});