import React, { useState, useEffect } from 'react';
import './unavailableDatesCalendar.css';

const unavailableDatesCalendar = ({ selectedDates = [], onDatesChange, minDate, maxDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);

  // Get start date (today) and end date (3 months from now)
  const startDate = minDate || new Date();
  const endDate = maxDate || (() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date;
  })();

  // Format date to YYYY-MM-DD string
  const formatDateString = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Check if date is in selectedDates array
  const isDateSelected = (date) => {
    const dateStr = formatDateString(date);
    return selectedDates.some(d => formatDateString(new Date(d)) === dateStr);
  };

  // Check if date is available for selection (within range and not in the past)
  const isDateAvailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= startDate && checkDate <= endDate;
  };

  // Toggle date selection
  const toggleDate = (date) => {
    if (!isDateAvailable(date)) return;

    const dateStr = formatDateString(date);
    let newDates;

    if (isDateSelected(date)) {
      // Remove date
      newDates = selectedDates.filter(d => formatDateString(new Date(d)) !== dateStr);
    } else {
      // Add date
      newDates = [...selectedDates, dateStr];
    }

    onDatesChange(newDates);
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  // Navigate months
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    if (newDate >= startDate || newDate.getMonth() >= startDate.getMonth()) {
      setCurrentMonth(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    if (newDate <= endDate) {
      setCurrentMonth(newDate);
    }
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = generateCalendarDays();

  return (
    <div className="unavailableDates-calendar">
      <div className="calendar-header">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            goToPreviousMonth();
          }}
          disabled={currentMonth.getMonth() <= startDate.getMonth() && currentMonth.getFullYear() <= startDate.getFullYear()}
          className="calendar-nav-btn"
        >
          ‹
        </button>
        <h3 className="calendar-month-year">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            goToNextMonth();
          }}
          disabled={currentMonth.getMonth() >= endDate.getMonth() && currentMonth.getFullYear() >= endDate.getFullYear()}
          className="calendar-nav-btn"
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((date, index) => {
          if (date === null) {
            return <div key={`empty-${index}`} className="calendar-day empty"></div>;
          }

          const dateStr = formatDateString(date);
          const isSelected = isDateSelected(date);
          const isAvailable = isDateAvailable(date);
          const isPast = date < startDate;

          return (
            <div
              key={dateStr}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isAvailable && !isPast ? 'available' : ''} ${isPast ? 'past' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleDate(date);
              }}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              title={isPast ? 'Past date' : isSelected ? 'Click to deselect' : 'Click to select'}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-color past"></span>
          <span>Unavailable</span>
        </div>
      </div>

      <div className="calendar-info">
        <p>Select dates when your room is available</p>
        <p className="selected-count">Selected: {selectedDates.length} dates</p>
      </div>
    </div>
  );
};

export default unavailableDatesCalendar;

