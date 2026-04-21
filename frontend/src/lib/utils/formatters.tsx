import React from 'react';

/**
 * Formats a bullet point string by converting **bold** markdown to <strong> tags.
 * @param text The bullet point string.
 * @returns A React element with DangerouslySetInnerHTML.
 */
export function formatBullet(text: string) {
  if (!text) return null;
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}
