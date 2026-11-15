import { PlayCircle, Youtube } from 'lucide-react';

import './RecordingLink.css';

const isYouTubeUrl = (recording) => {
  try {
    const hostname = new URL(recording).hostname.toLowerCase();
    return hostname === 'youtube.com'
      || hostname.endsWith('.youtube.com')
      || hostname === 'youtu.be';
  } catch {
    return false;
  }
};

const RecordingLink = ({ recording }) => {
  if (!recording) return null;

  const Icon = isYouTubeUrl(recording) ? Youtube : PlayCircle;

  return (
    <a
      aria-label="Watch recording"
      className="recording-link"
      href={recording}
      rel="noopener noreferrer"
      target="_blank"
      title="Watch recording"
    >
      <Icon aria-hidden="true" size={16} />
    </a>
  );
};

export default RecordingLink;
