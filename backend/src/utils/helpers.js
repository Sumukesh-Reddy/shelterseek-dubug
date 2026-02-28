// Format date to readable string
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Generate date range between two dates
  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current).toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };
  
  // Check if two date ranges overlap
  const doDateRangesOverlap = (start1, end1, start2, end2) => {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);
    
    return s1 <= e2 && s2 <= e1;
  };
  
  // Generate random OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  // Generate random transaction ID
  const generateTransactionId = () => {
    return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };
  
  // Clean object (remove undefined/null values)
  const cleanObject = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined && obj[key] !== null) {
        newObj[key] = obj[key];
      }
    });
    return newObj;
  };
  
  // Paginate array
  const paginate = (array, page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return {
      data: array.slice(startIndex, endIndex),
      pagination: {
        total: array.length,
        page,
        limit,
        pages: Math.ceil(array.length / limit)
      }
    };
  };
  
  module.exports = {
    formatDate,
    generateDateRange,
    doDateRangesOverlap,
    generateOTP,
    generateTransactionId,
    cleanObject,
    paginate
  };