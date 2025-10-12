import React, { useState } from 'react';
import TagMultiSelect from 'components/TagMultiSelect/TagMultiSelect';
import 'styles/AddEventForm.css';

const EditEventInlineForm = ({ event, onClose }) => {
  const [formData, setFormData] = useState({
    name: event.name || '',
    startDate: event.date && event.date[0] ? new Date(event.date[0]).toISOString().slice(0,10) : '',
    endDate: event.date && event.date[1] ? new Date(event.date[1]).toISOString().slice(0,10) : (event.date && event.date[0] ? new Date(event.date[0]).toISOString().slice(0,10) : ''),
    eventUrl: event.hyperlink || '',
    city: event.city || '',
    country: event.country || '',
    hasCfp: !!(event.cfp && event.cfp.link),
    cfpUrl: event.cfp?.link || '',
    cfpEndDate: event.cfp?.untilDate ? new Date(event.cfp.untilDate).toISOString().slice(0,10) : '',
    closedCaptions: !!event.closedCaptions,
    onlineEvent: event.location && event.location.toLowerCase().includes('online'),
    tags: event.tags ? event.tags.map(t => `${t.key}:${t.value}`) : []
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleTagsChange = (newTags) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.eventUrl.trim()) newErrors.eventUrl = 'Event URL is required';
    try { new URL(formData.eventUrl); } catch { if (formData.eventUrl.trim()) newErrors.eventUrl = 'Please enter a valid URL'; }
    if (formData.hasCfp) {
      if (!formData.cfpUrl.trim()) newErrors.cfpUrl = 'CFP URL is required when CFP is selected';
      else { try { new URL(formData.cfpUrl); } catch { newErrors.cfpUrl = 'Please enter a valid CFP URL'; } }
      if (!formData.cfpEndDate) newErrors.cfpEndDate = 'CFP End Date is required when CFP is selected';
    }
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) newErrors.endDate = 'End date must be after start date';
    }
    if (formData.cfpEndDate && formData.startDate) {
      if (new Date(formData.cfpEndDate) > new Date(formData.startDate)) newErrors.cfpEndDate = 'CFP end date should be before event start date';
    }
    if (!formData.onlineEvent) {
      if (!formData.city.trim()) newErrors.city = 'City is required for non-online events';
      if (!formData.country.trim()) newErrors.country = 'Country is required for non-online events';
    }
    if (formData.city.trim() && !formData.country.trim()) newErrors.country = 'Country is required when city is provided';
    if (formData.country.trim() && !formData.city.trim()) newErrors.city = 'City is required when country is provided';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateForReadme = (dateString) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${monthName}-${year}`;
  };

  const generateReadmeLine = () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    let location;
    if (formData.onlineEvent) {
      // Si city/country contient déjà "Online", ne pas le dupliquer
      const city = formData.city.trim();
      const country = formData.country.trim();
      const cityCountry = [city, country].filter(Boolean).join(' ');
      if (cityCountry && !/online/i.test(cityCountry)) {
        location = `${cityCountry} & Online`;
      } else {
        location = 'Online';
      }
    } else {
      const city = formData.city.trim();
      const country = formData.country.trim();
      if (city && country) {
        location = `${city} (${country})`;
      } else if (city) {
        location = city;
      } else if (country) {
        location = country;
      } else {
        location = '';
      }
    }
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const dateRange = startDay === endDay ? `${startDay}` : `${startDay}-${endDay}`;
    let cfpSection = '';
    if (formData.hasCfp && formData.cfpUrl) {
      const cfpEndFormatted = formData.cfpEndDate ? formatDateForReadme(formData.cfpEndDate) : 'TBD';
      let cfpColor = 'red';
      if (formData.cfpEndDate) {
        const cfpEndDate = new Date(formData.cfpEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        cfpColor = cfpEndDate >= today ? 'green' : 'red';
      }
      cfpSection = ` <a href="${formData.cfpUrl}"><img alt="CFP ${formData.name}" src="https://img.shields.io/static/v1?label=CFP&message=until%20${cfpEndFormatted}&color=${cfpColor}"></a>`;
    }
    let closedCaptionsSection = '';
    if (formData.closedCaptions) {
      closedCaptionsSection = ` <img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" />`;
    }
    return `* ${dateRange}: [${formData.name}](${formData.eventUrl}) - ${location}${cfpSection}${closedCaptionsSection}`;
  };

  const generateTagsCsvLines = () => {
    if (!formData.tags.length) return '';
    const startDate = new Date(formData.startDate);
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const eventId = `${year}-${month}-${day}-${formData.name}`;
    const tagsString = formData.tags.join(',');
    return `${eventId},${tagsString}`;
  };

  const generateIssueBody = () => {
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
    const humanReadableInfo = `\n**Event Details (EDIT):**\n- **Name:** ${formData.name}\n- **Start Date:** ${formData.startDate}\n- **End Date:** ${formData.endDate}\n- **Event URL:** ${formData.eventUrl}\n- **Location:** ${locationDisplay}\n- **Has CFP:** ${formData.hasCfp ? 'Yes' : 'No'}${formData.hasCfp ? `\n- **CFP URL:** ${formData.cfpUrl || 'N/A'}\n- **CFP End Date:** ${formData.cfpEndDate || 'N/A'}` : ''}\n- **Closed Captions:** ${formData.closedCaptions ? 'Yes' : 'No'}\n- **Online Event:** ${formData.onlineEvent ? 'Yes' : 'No'}\n- **Tags:** ${formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}\n\n**README.md line to update:**\n\`\`\`\n${generateReadmeLine()}\n\`\`\`\n\n**TAGS.csv lines to update:**\n${formData.tags.length > 0 ? `\`\`\`\n${generateTagsCsvLines()}\n\`\`\`` : 'No tags to update'}\n`;
    return encodeURIComponent(humanReadableInfo.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const title = encodeURIComponent(`[Edit event] ${formData.startDate}: ${formData.name}`);
    const body = generateIssueBody();
    const githubUrl = `https://github.com/scraly/developers-conferences-agenda/issues/new?title=${title}&body=${body}&labels=edit-event`;
    window.open(githubUrl, '_blank');
    onClose();
  };

  return (
    <div className="add-event-overlay">
      <div className="add-event-form">
        <div className="add-event-header">
          <h2>Edit Event</h2>
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
              value={formData.name}
            />
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
              Create GitHub Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventInlineForm;
