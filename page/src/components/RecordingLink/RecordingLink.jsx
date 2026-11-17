import { Youtube } from 'lucide-react';

import './RecordingLink.css';

const RecordingLink = ({ recording }) => {
  if (!recording) return null;

  return (
    <a
      aria-label="Watch recording"
      className="recording-link"
      href={recording}
      rel="noopener noreferrer"
      target="_blank"
      title="Watch recording"
    >
      <Youtube aria-hidden="true" size={16} />
    </a>
  );
};

export default RecordingLink;
