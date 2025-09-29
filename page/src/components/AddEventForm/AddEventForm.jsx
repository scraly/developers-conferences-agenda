import React, { useState, useCallback } from 'react';
import TagMultiSelect from 'components/TagMultiSelect/TagMultiSelect';
import allEvents from 'misc/all-events.json';
import 'styles/AddEventForm.css';

const AddEventForm = ({ isOpen, onClose }) => {
  const initialFormState = {
    name: '',
    startDate: '',
    endDate: '',
    eventUrl: '',
    city: '',
    country: '',
    cfpUrl: '',
    cfpEndDate: '',
    hasCfp: false,
    closedCaptions: false,
    onlineEvent: false,
    tags: []
  };
  const [formData, setFormData] = useState(initialFormState);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [originalEvent, setOriginalEvent] = useState(null);
  const [errors, setErrors] = useState({});

  const handleEventSelect = (event) => {
    if (!event) return;

    setSearchQuery(event.name || '');
    setFilteredEvents([]);
    setIsEditing(true);

    // Safely determine start and end dates
    const startDateRaw = (Array.isArray(event.date) && event.date.length > 0) ? event.date[0] : null;
    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    const isValidStartDate = startDate && !isNaN(startDate.getTime());

    const endDateRaw = (Array.isArray(event.date) && event.date.length > 1) ? event.date[1] : startDateRaw;
    const endDate = endDateRaw ? new Date(endDateRaw) : null;
    const isValidEndDate = endDate && !isNaN(endDate.getTime());

    // Safely determine CFP properties
    const cfpUrl = (event.cfp && typeof event.cfp === 'object') ? event.cfp.link : '';
    const cfpEndDateRaw = (event.cfp && typeof event.cfp === 'object') ? event.cfp.untilDate : null;
    const cfpEndDate = cfpEndDateRaw ? new Date(cfpEndDateRaw) : null;
    const isValidCfpEndDate = cfpEndDate && !isNaN(cfpEndDate.getTime());

    const normalizedEvent = {
      name: event.name || '',
      startDate: isValidStartDate ? startDate.toISOString().split('T')[0] : '',
      endDate: isValidEndDate ? endDate.toISOString().split('T')[0] : (isValidStartDate ? startDate.toISOString().split('T')[0] : ''),
      eventUrl: event.hyperlink || '',
      city: event.city || '',
      country: event.country || '',
      cfpUrl: cfpUrl || '',
      cfpEndDate: isValidCfpEndDate ? cfpEndDate.toISOString().split('T')[0] : '',
      hasCfp: !!cfpUrl,
      closedCaptions: !!event.closedCaptions,
      onlineEvent: (typeof event.location === 'string') && event.location.includes('Online'),
      tags: event.tags || []
    };

    setOriginalEvent(normalizedEvent);
    setFormData(normalizedEvent);
  };

  const handleInputChange = (field, value) => {
    if (field === 'name') {
      setSearchQuery(value);
      if (value.trim() === '') {
        setFilteredEvents([]);
        if (isEditing) {
          setFormData(initialFormState);
          setIsEditing(false);
          setOriginalEvent(null);
          return;
        }
      } else if (!isEditing) {
        const query = value.toLowerCase();
        const filtered = allEvents.filter((event) => {
          if (!event.name || !event.date || !event.date[0] || isNaN(new Date(event.date[0]).getTime())) {
            return false;
          }
          const eventName = event.name.toLowerCase();
          const eventYear = new Date(event.date[0]).getFullYear().toString();

          return eventName.includes(query) || `${eventName} ${eventYear}`.includes(query);
        });
        setFilteredEvents(filtered);
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTagsChange = useCallback((newTags) => {
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.eventUrl.trim()) newErrors.eventUrl = 'Event URL is required';

    // URL validation
    try {
      new URL(formData.eventUrl);
    } catch {
      if (formData.eventUrl.trim()) {
        newErrors.eventUrl = 'Please enter a valid URL';
      }
    }

    // CFP validation - only if CFP checkbox is checked
    if (formData.hasCfp) {
      if (!formData.cfpUrl.trim()) {
        newErrors.cfpUrl = 'CFP URL is required when CFP is selected';
      } else {
        try {
          new URL(formData.cfpUrl);
        } catch {
          newErrors.cfpUrl = 'Please enter a valid CFP URL';
        }
      }
      
      if (!formData.cfpEndDate) {
        newErrors.cfpEndDate = 'CFP End Date is required when CFP is selected';
      }
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.cfpEndDate && formData.startDate) {
      if (new Date(formData.cfpEndDate) > new Date(formData.startDate)) {
        newErrors.cfpEndDate = 'CFP end date should be before event start date';
      }
    }

    // Conditional validation for city/country
    if (!formData.onlineEvent) {
      if (!formData.city.trim()) newErrors.city = 'City is required for non-online events';
      if (!formData.country.trim()) newErrors.country = 'Country is required for non-online events';
    }

    // If city is provided, country must also be provided (and vice versa)
    if (formData.city.trim() && !formData.country.trim()) {
      newErrors.country = 'Country is required when city is provided';
    }
    if (formData.country.trim() && !formData.city.trim()) {
      newErrors.city = 'City is required when country is provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateForReadme = (dateString) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthName = monthNames[date.getMonth()]
    const year = date.getFullYear();
    return `${day}-${monthName}-${year}`;
  };

  const generateReadmeLine = () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    // Generate location string
    let location;
    if (formData.onlineEvent) {
      // For online events, include city/country if provided, otherwise just "Online"
      if (formData.city.trim() && formData.country.trim()) {
        location = `${formData.city} (${formData.country}) & Online`;
      } else {
        location = 'Online';
      }
    } else {
      // For non-online events, use city/country (should be provided)
      location = `${formData.city} (${formData.country})`;
    }
    
    // Format the date range for README
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const dateRange = startDay === endDay ? `${startDay}` : `${startDay}-${endDay}`;
    
    // Build the CFP section if CFP checkbox is selected and URL is present
    let cfpSection = '';
    if (formData.hasCfp && formData.cfpUrl) {
      const cfpEndFormatted = formData.cfpEndDate ? formatDateForReadme(formData.cfpEndDate) : 'TBD';
      
      // Determine color based on CFP end date
      let cfpColor = 'red'; // default to red
      if (formData.cfpEndDate) {
        const cfpEndDate = new Date(formData.cfpEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // reset time to start of day for accurate comparison
        cfpColor = cfpEndDate >= today ? 'green' : 'red';
      }
      
      cfpSection = ` <a href="${formData.cfpUrl}"><img alt="CFP ${formData.name}" src="https://img.shields.io/static/v1?label=CFP&message=until%20${cfpEndFormatted}&color=${cfpColor}"></a>`;
    }
    
    // Build the closed captions section if present
    let closedCaptionsSection = '';
    if (formData.closedCaptions) {
      closedCaptionsSection = ` <img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" />`;
    }
    
    return `* ${dateRange}: [${formData.name}](${formData.eventUrl}) - ${location}${cfpSection}${closedCaptionsSection}`;
  };

  const generateTagsCsvLines = () => {
    if (formData.tags.length === 0) return '';
    
    // Generate event ID in format: YYYY-MM-DD-EventName
    const startDate = new Date(formData.startDate);
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const eventId = `${year}-${month}-${day}-${formData.name}`;
    
    // Create single line with event_id followed by all tags
    const tagsString = formData.tags.join(',');
    return `${eventId},${tagsString}`;
  };

  const generateIssueBody = () => {
    if (isEditing) {
      const changes = [];
      Object.keys(formData).forEach(key => {
        const originalValue = originalEvent[key];
        const newValue = formData[key];

        const originalValueString = Array.isArray(originalValue) ? originalValue.join(', ') : String(originalValue || '');
        const newValueString = Array.isArray(newValue) ? newValue.join(', ') : String(newValue || '');

        if (originalValueString !== newValueString) {
          changes.push(`- **${key}:** ~~\`${originalValueString || 'N/A'}\`~~ -> \`${newValueString || 'N/A'}\``);
        }
      });

      const humanReadableInfo = `
**Event Update:**
- **Name:** ${formData.name}
- **URL:** ${formData.eventUrl}

**Proposed Changes:**
${changes.join('\n')}

**New README.md line:**
\`\`\`
${generateReadmeLine()}
\`\`\`

**New TAGS.csv lines:**
${formData.tags.length > 0 ? `\`\`\`
${generateTagsCsvLines()}
\`\`\`` : 'No tags to add'}
`;
      return encodeURIComponent(humanReadableInfo.trim());
    }


    // Generate human-readable location
    let locationDisplay;
    if (formData.onlineEvent) {
      if (formData.city.trim() && formData.country.trim()) {
        locationDisplay = `${formData.city}, ${formData.country} & Online`;
      } else {
        locationDisplay = 'Online';
      }
    } else {
      locationDisplay = `${formData.city}, ${formData.country}`;
    }

    const humanReadableInfo = `
**Event Details:**
- **Name:** ${formData.name}
- **Start Date:** ${formData.startDate}
- **End Date:** ${formData.endDate}
- **Event URL:** ${formData.eventUrl}
- **Location:** ${locationDisplay}
- **Has CFP:** ${formData.hasCfp ? 'Yes' : 'No'}${formData.hasCfp ? `
- **CFP URL:** ${formData.cfpUrl || 'N/A'}
- **CFP End Date:** ${formData.cfpEndDate || 'N/A'}` : ''}
- **Closed Captions:** ${formData.closedCaptions ? 'Yes' : 'No'}
- **Online Event:** ${formData.onlineEvent ? 'Yes' : 'No'}
- **Tags:** ${formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}

**README.md line to add:**
\`\`\`
${generateReadmeLine()}
\`\`\`

**TAGS.csv lines to add:**
${formData.tags.length > 0 ? `\`\`\`
${generateTagsCsvLines()}
\`\`\`` : 'No tags to add'}
`;
    
    return encodeURIComponent(humanReadableInfo.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const title = encodeURIComponent(isEditing ? `[Event Update] ${formData.name}` : `[New event] ${formData.startDate}: ${formData.name}`);
    const body = generateIssueBody();
    
    const githubUrl = `https://github.com/scraly/developers-conferences-agenda/issues/new?title=${title}&body=${body}&labels=${isEditing ? 'update-event' : 'new-event'}`;
    
    window.open(githubUrl, '_blank');
    
    // Reset form and close
    setSearchQuery('');
    setIsEditing(false);
    setOriginalEvent(null);
    setFormData(initialFormState);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-event-overlay">
      <div className={`add-event-form ${isEditing ? 'editing' : ''}`}>
        <div className="add-event-header">
          <h2>{isEditing ? 'Edit Event' : 'Add New Event'}</h2>
          <button 
            aria-label="Close" 
            className="close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Event Name *</label>
            <input
              className={errors.name ? 'error' : ''}
              id="name"
              onChange={(e) => handleInputChange('name', e.target.value)}
              type="text"
              value={searchQuery}
              autoComplete="off"
            />
            {filteredEvents.length > 0 && (
              <ul className="event-suggestions">
            {filteredEvents.map((eventItem, index) => {
              if (!eventItem || !eventItem.date || !Array.isArray(eventItem.date) || eventItem.date.length === 0) {
                return null;
              }
              const startDate = new Date(eventItem.date[0]);
                  if (isNaN(startDate.getTime())) {
                    return null;
                  }
                  return (
                <li key={`${eventItem.name}-${index}`} onClick={() => handleEventSelect(eventItem)}>
                  {eventItem.name} ({startDate.toLocaleDateString()})
                    </li>
                  );
                })}
              </ul>
            )}
            {errors.name ? <span className="error-message">{errors.name}</span> : null}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                className={errors.startDate ? 'error' : ''}
                id="startDate"
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                type="date"
                value={formData.startDate}
              />
              {errors.startDate ? <span className="error-message">{errors.startDate}</span> : null}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                className={errors.endDate ? 'error' : ''}
                id="endDate"
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                type="date"
                value={formData.endDate}
              />
              {errors.endDate ? <span className="error-message">{errors.endDate}</span> : null}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventUrl">Event URL *</label>
            <input
              className={errors.eventUrl ? 'error' : ''}
              id="eventUrl"
              onChange={(e) => handleInputChange('eventUrl', e.target.value)}
              placeholder="https://example.com"
              type="url"
              value={formData.eventUrl}
            />
            {errors.eventUrl ? <span className="error-message">{errors.eventUrl}</span> : null}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                checked={formData.onlineEvent}
                onChange={(e) => handleInputChange('onlineEvent', e.target.checked)}
                type="checkbox"
              />
              Online Event
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City{!formData.onlineEvent ? ' *' : ''}</label>
              <input
                className={errors.city ? 'error' : ''}
                id="city"
                onChange={(e) => handleInputChange('city', e.target.value)}
                type="text"
                value={formData.city}
              />
              {errors.city ? <span className="error-message">{errors.city}</span> : null}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country{!formData.onlineEvent ? ' *' : ''}</label>
              <input
                className={errors.country ? 'error' : ''}
                id="country"
                onChange={(e) => handleInputChange('country', e.target.value)}
                type="text"
                value={formData.country}
              />
              {errors.country ? <span className="error-message">{errors.country}</span> : null}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                checked={formData.closedCaptions}
                onChange={(e) => handleInputChange('closedCaptions', e.target.checked)}
                type="checkbox"
              />
              Closed Captions Available
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                checked={formData.hasCfp}
                onChange={(e) => handleInputChange('hasCfp', e.target.checked)}
                type="checkbox"
              />
              CFP (Call for Papers)
            </label>
          </div>

          {formData.hasCfp ? <>
              <div className="form-group">
                <label htmlFor="cfpUrl">CFP URL *</label>
                <input
                  className={errors.cfpUrl ? 'error' : ''}
                  id="cfpUrl"
                  onChange={(e) => handleInputChange('cfpUrl', e.target.value)}
                  placeholder="https://example.com/cfp"
                  type="url"
                  value={formData.cfpUrl}
                />
                {errors.cfpUrl ? <span className="error-message">{errors.cfpUrl}</span> : null}
              </div>

              <div className="form-group">
                <label htmlFor="cfpEndDate">CFP End Date *</label>
                <input
                  className={errors.cfpEndDate ? 'error' : ''}
                  id="cfpEndDate"
                  onChange={(e) => handleInputChange('cfpEndDate', e.target.value)}
                  type="date"
                  value={formData.cfpEndDate}
                />
                {errors.cfpEndDate ? <span className="error-message">{errors.cfpEndDate}</span> : null}
              </div>
            </> : null}

          <div className="form-group">
            <label>Tags</label>
            <TagMultiSelect
              onChange={handleTagsChange}
              selectedTags={formData.tags}
            />
          </div>

          <div className="form-actions">
            <button className="cancel-button" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="submit-button" type="submit">
              {isEditing ? 'Create Update Issue' : 'Create GitHub Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;