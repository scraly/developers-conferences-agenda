import React, { useState, useCallback, useMemo } from 'react';
import TagMultiSelect from 'components/TagMultiSelect/TagMultiSelect';
import 'styles/AddEventForm.css';

const AddEventForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    eventUrl: '',
    city: '',
    country: '',
    cfpUrl: '',
    cfpEndDate: '',
    closedCaptions: false,
    onlineEvent: false,
    tags: []
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
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

    if (formData.cfpUrl.trim()) {
      try {
        new URL(formData.cfpUrl);
      } catch {
        newErrors.cfpUrl = 'Please enter a valid CFP URL';
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
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
    
    // Build the CFP section if present
    let cfpSection = '';
    if (formData.cfpUrl) {
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
- **CFP URL:** ${formData.cfpUrl || 'N/A'}
- **CFP End Date:** ${formData.cfpEndDate || 'N/A'}
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

    const title = encodeURIComponent(`Add new event: ${formData.name}`);
    const body = generateIssueBody();
    
    const githubUrl = `https://github.com/scraly/developers-conferences-agenda/issues/new?title=${title}&body=${body}`;
    
    window.open(githubUrl, '_blank');
    
    // Reset form and close
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      eventUrl: '',
      city: '',
      country: '',
      cfpUrl: '',
      cfpEndDate: '',
      closedCaptions: false,
      onlineEvent: false,
      tags: []
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-event-overlay">
      <div className="add-event-form">
        <div className="add-event-header">
          <h2>Add New Event</h2>
          <button 
            type="button" 
            className="close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Event Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'error' : ''}
              />
              {errors.startDate && <span className="error-message">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'error' : ''}
              />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventUrl">Event URL *</label>
            <input
              type="url"
              id="eventUrl"
              value={formData.eventUrl}
              onChange={(e) => handleInputChange('eventUrl', e.target.value)}
              placeholder="https://example.com"
              className={errors.eventUrl ? 'error' : ''}
            />
            {errors.eventUrl && <span className="error-message">{errors.eventUrl}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.onlineEvent}
                onChange={(e) => handleInputChange('onlineEvent', e.target.checked)}
              />
              Online Event
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City{!formData.onlineEvent ? ' *' : ''}</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country{!formData.onlineEvent ? ' *' : ''}</label>
              <input
                type="text"
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className={errors.country ? 'error' : ''}
              />
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cfpUrl">CFP URL</label>
            <input
              type="url"
              id="cfpUrl"
              value={formData.cfpUrl}
              onChange={(e) => handleInputChange('cfpUrl', e.target.value)}
              placeholder="https://example.com/cfp"
              className={errors.cfpUrl ? 'error' : ''}
            />
            {errors.cfpUrl && <span className="error-message">{errors.cfpUrl}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cfpEndDate">CFP End Date</label>
            <input
              type="date"
              id="cfpEndDate"
              value={formData.cfpEndDate}
              onChange={(e) => handleInputChange('cfpEndDate', e.target.value)}
              className={errors.cfpEndDate ? 'error' : ''}
            />
            {errors.cfpEndDate && <span className="error-message">{errors.cfpEndDate}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.closedCaptions}
                onChange={(e) => handleInputChange('closedCaptions', e.target.checked)}
              />
              Closed Captions Available
            </label>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <TagMultiSelect
              selectedTags={formData.tags}
              onChange={handleTagsChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create GitHub Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;