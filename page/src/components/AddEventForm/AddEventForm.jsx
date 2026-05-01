import React, { useState, useCallback } from 'react';
import TagMultiSelect from 'components/TagMultiSelect/TagMultiSelect';
import { useTranslation } from 'contexts/LanguageContext';
import 'styles/AddEventForm.css';

const AddEventForm = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    eventUrl: '',
    city: '',
    country: '',
    cfpUrl: '',
    cfpEndDate: '',
    hasCfp: false,
    hasSponsoring: false,
    sponsoringUrl: '',
    closedCaptions: false,
    onlineEvent: false,
    tags: [],
    attendees: '' // ← NEW
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
    if (!formData.name.trim()) newErrors.name = t('addEvent.errors.nameRequired');
    if (!formData.startDate) newErrors.startDate = t('addEvent.errors.startDateRequired');
    if (!formData.endDate) newErrors.endDate = t('addEvent.errors.endDateRequired');
    if (!formData.eventUrl.trim()) newErrors.eventUrl = t('addEvent.errors.eventUrlRequired');
    
    // Attendees validation
    if (formData.attendees.trim()) {
      const attendeesNumber = Number(formData.attendees);

      if (
        Number.isNaN(attendeesNumber) ||
        !Number.isInteger(attendeesNumber) ||
        attendeesNumber <= 0
      ) {
        newErrors.attendees = t('addEvent.errors.attendeesInvalid');
      }
    }


    // URL validation
    try {
      new URL(formData.eventUrl);
    } catch {
      if (formData.eventUrl.trim()) {
        newErrors.eventUrl = t('addEvent.errors.eventUrlInvalid');
      }
    }

    // CFP validation - only if CFP checkbox is checked
    if (formData.hasCfp) {
      if (!formData.cfpUrl.trim()) {
        newErrors.cfpUrl = t('addEvent.errors.cfpUrlRequired');
      } else {
        try {
          new URL(formData.cfpUrl);
        } catch {
          newErrors.cfpUrl = t('addEvent.errors.cfpUrlInvalid');
        }
      }
      if (!formData.cfpEndDate) {
        newErrors.cfpEndDate = t('addEvent.errors.cfpEndDateRequired');
      }
    }
    // Sponsoring validation (comme dans edit)
    if (formData.hasSponsoring) {
      if (!formData.sponsoringUrl || !formData.sponsoringUrl.trim()) {
        newErrors.sponsoringUrl = t('addEvent.errors.sponsoringUrlRequired');
      } else {
        try {
          new URL(formData.sponsoringUrl);
        } catch {
          newErrors.sponsoringUrl = t('addEvent.errors.sponsoringUrlInvalid');
        }
      }
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = t('addEvent.errors.endDateBeforeStart');
      }
    }

    if (formData.cfpEndDate && formData.startDate) {
      if (new Date(formData.cfpEndDate) > new Date(formData.startDate)) {
        newErrors.cfpEndDate = t('addEvent.errors.cfpEndDateAfterStart');
      }
    }

    // Conditional validation for city/country
    if (!formData.onlineEvent) {
      if (!formData.city.trim()) newErrors.city = t('addEvent.errors.cityRequired');
      if (!formData.country.trim()) newErrors.country = t('addEvent.errors.countryRequired');
    }

    // If city is provided, country must also be provided (and vice versa)
    if (formData.city.trim() && !formData.country.trim()) {
      newErrors.country = t('addEvent.errors.countryRequiredWithCity');
    }
    if (formData.country.trim() && !formData.city.trim()) {
      newErrors.city = t('addEvent.errors.cityRequiredWithCountry');
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
      if (formData.city.trim() && formData.country.trim()) {
        location = `${formData.city} (${formData.country}) & Online`;
      } else {
        location = 'Online';
      }
    } else {
      location = `${formData.city} (${formData.country})`;
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
    let sponsoringSection = '';
    if (formData.hasSponsoring && formData.sponsoringUrl) {
      sponsoringSection = ` <a href="${formData.sponsoringUrl}"><img alt="Sponsoring" src="https://img.shields.io/badge/sponsoring-8A2BE2"></a>`;
    }
    let closedCaptionsSection = '';
    if (formData.closedCaptions) {
      closedCaptionsSection = ` <img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" />`;
    }
    return `* ${dateRange}: [${formData.name}](${formData.eventUrl}) - ${location}${cfpSection}${sponsoringSection}${closedCaptionsSection}`;
  };

const generateMetadataCsvLine = () => {
  // Attendees is optional metadata
  if (!formData.attendees) return '';

  const startDate = new Date(formData.startDate);
  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const day = String(startDate.getDate()).padStart(2, '0');

  // Event identifier must match README / TAGS / METADATA
  const eventId = `${year}-${month}-${day}-${formData.name}`;

  return `${eventId},attendees:${formData.attendees}`;
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
- **Estimated Attendees:** ${formData.attendees || 'Not specified'}
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

**METADATA.csv line to add:**
${generateMetadataCsvLine()
  ? `\`\`\`
${generateMetadataCsvLine()}
\`\`\``
  : 'No metadata to add'}
`;

    return encodeURIComponent(humanReadableInfo.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const title = encodeURIComponent(`[New event] ${formData.startDate}: ${formData.name}`);
    const body = generateIssueBody();
    
    const githubUrl = `https://github.com/scraly/developers-conferences-agenda/issues/new?title=${title}&body=${body}&labels=new-event`;
    
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
      hasCfp: false,
      closedCaptions: false,
      onlineEvent: false,
      tags: [],
      attendees: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-event-overlay">
      <div className="add-event-form">
        <div className="add-event-header">
          <h2>{t('addEvent.title')}</h2>
          <button 
            aria-label={t('common.close')} 
            className="close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="name">{t('addEvent.eventName')} {t('addEvent.required')}</label>
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
              <label htmlFor="startDate">{t('addEvent.startDate')} {t('addEvent.required')}</label>
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
              <label htmlFor="endDate">{t('addEvent.endDate')} {t('addEvent.required')}</label>
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
            <label htmlFor="eventUrl">{t('addEvent.eventUrl')} {t('addEvent.required')}</label>
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
              {t('addEvent.onlineEvent')}
            </label>
          </div>

          {!formData.onlineEvent ? (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">{t('addEvent.city')} {t('addEvent.required')}</label>
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
                <label htmlFor="country">{t('addEvent.country')} {t('addEvent.required')}</label>
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
          ) : null}

          <div className="form-group">
            <label className="checkbox-label">
              <input
                checked={formData.closedCaptions}
                onChange={(e) => handleInputChange('closedCaptions', e.target.checked)}
                type="checkbox"
              />
              {t('addEvent.closedCaptions')}
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                checked={formData.hasCfp}
                onChange={(e) => handleInputChange('hasCfp', e.target.checked)}
                type="checkbox"
              />
              {t('addEvent.hasCfp')}
            </label>
          </div>

          {formData.hasCfp ? <>
              <div className="form-group">
                <label htmlFor="cfpUrl">{t('addEvent.cfpUrl')} {t('addEvent.required')}</label>
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
                <label htmlFor="cfpEndDate">{t('addEvent.cfpEndDate')} {t('addEvent.required')}</label>
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
            <label className="checkbox-label">
              <input
                checked={formData.hasSponsoring}
                onChange={e => handleInputChange('hasSponsoring', e.target.checked)}
                type="checkbox"
              />
              {t('addEvent.hasSponsoring')}
            </label>
          </div>
          {formData.hasSponsoring ? (
            <div className="form-group">
              <label htmlFor="sponsoringUrl">{t('addEvent.sponsoringUrl')} {t('addEvent.required')}</label>
              <input
                className={errors.sponsoringUrl ? 'error' : ''}
                id="sponsoringUrl"
                onChange={e => handleInputChange('sponsoringUrl', e.target.value)}
                placeholder="https://example.com/sponsoring"
                type="url"
                value={formData.sponsoringUrl}
              />
              {errors.sponsoringUrl ? <span className="error-message">{errors.sponsoringUrl}</span> : null}
            </div>
          ) : null}

          <div className="form-group">
            <label htmlFor="attendees">{t('addEvent.attendees')}</label>
            <input
              className={errors.attendees ? 'error' : ''}
              id="attendees"
              onChange={(e) => handleInputChange('attendees', e.target.value)}
              placeholder="e.g. 500"
              type="number"
              min="1"
              step="1"
              value={formData.attendees}
            />
            {errors.attendees ? (
              <span className="error-message">{errors.attendees}</span>
            ) : null}
          </div>


          <div className="form-group">
            <label>{t('addEvent.tags')}</label>
            <TagMultiSelect
              onChange={handleTagsChange}
              selectedTags={formData.tags}
            />
          </div>

          <div className="form-actions">
            <button className="cancel-button" onClick={onClose} type="button">
              {t('addEvent.cancel')}
            </button>
            <button className="submit-button" type="submit">
              {t('addEvent.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;