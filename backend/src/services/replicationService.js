const mongoose = require('mongoose');

// Replicate room to traveler database when verified
const replicateToTravelerDB = async (room) => {
  try {
    if (!global.adminTravelerConnection || global.adminTravelerConnection.readyState !== 1) {
      console.log('[Replication] Admin_Traveler connection not ready');
      return;
    }

    // Define schema for traveler DB (same as Room but different collection)
    const travelerRoomSchema = new mongoose.Schema({}, { strict: false });
    const TravelerRoom = global.adminTravelerConnection.model('TravelerRoom', travelerRoomSchema, 'RoomDataTraveler');

    // Get raw document
    const rawDoc = room.toObject ? room.toObject() : room;
    
    // Prepare payload
    const payload = { ...rawDoc };
    
    // Handle unavailable dates
    if (rawDoc.unavailableDates && Array.isArray(rawDoc.unavailableDates) && rawDoc.unavailableDates.length > 0) {
      payload.unavailableDates = rawDoc.unavailableDates.map(date => {
        return date instanceof Date ? date : new Date(date);
      });
    } else if (rawDoc.availability && Array.isArray(rawDoc.availability) && rawDoc.availability.length > 0) {
      payload.unavailableDates = rawDoc.availability.map(date => {
        return date instanceof Date ? date : new Date(date);
      });
    } else {
      payload.unavailableDates = [];
    }
    
    delete payload.availability;
    
    // Remove _id from update payload
    const { _id, ...updatePayload } = payload;
    
    // Update or insert
    await TravelerRoom.findOneAndUpdate(
      { _id: room._id },
      { $set: updatePayload, $unset: { availability: "" } },
      { upsert: true, new: true }
    );
    
    console.log(`[Replication] Room ${room._id} replicated to traveler DB with ${payload.unavailableDates.length} unavailable dates`);
  } catch (error) {
    console.error('[Replication] Error:', error.message);
  }
};

// Remove from traveler database
const removeFromTravelerDB = async (roomId) => {
  try {
    if (!global.adminTravelerConnection || global.adminTravelerConnection.readyState !== 1) {
      return;
    }

    const TravelerRoom = global.adminTravelerConnection.model('TravelerRoom', new mongoose.Schema({}, { strict: false }), 'RoomDataTraveler');
    await TravelerRoom.deleteOne({ _id: roomId });
    
    console.log(`[Replication] Room ${roomId} removed from traveler DB`);
  } catch (error) {
    console.error('[Replication] Error removing room:', error.message);
  }
};

module.exports = {
  replicateToTravelerDB,
  removeFromTravelerDB
};