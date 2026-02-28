const fetch = require('node-fetch');

// This is a service wrapper for the AI chat functionality
// The main logic is in aiChatController.js

const getRoomSuggestions = async (query) => {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query })
    });
    
    return await response.json();
  } catch (error) {
    console.error('AI Chat service error:', error);
    return { reply: 'Sorry, I encountered an error.', hotels: [] };
  }
};

module.exports = {
  getRoomSuggestions
};