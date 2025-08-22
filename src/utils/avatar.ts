/**
 * Avatar utility functions for generating random member avatars
 */

// Available avatar styles from DiceBear API
const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral', 
  'avataaars',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'bottts',
  'croodles',
  'croodles-neutral',
  'fun-emoji',
  'icons',
  'identicon',
  'initials',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'shapes',
  'thumbs'
];

// Background colors for avatars
const BACKGROUND_COLORS = [
  'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 
  'c4b5fd', 'a7f3d0', 'fed7d7', 'bee3f8', 'f7fafc'
];

/**
 * Generate a random avatar URL for a member
 * @param memberName - The name of the member (used as seed for consistency)
 * @param style - Optional specific style to use
 * @returns Avatar URL string
 */
export function generateAvatarUrl(memberName: string, style?: string): string {
  // Use member name as seed for consistent avatar
  const seed = encodeURIComponent(memberName);
  
  // Pick a random style if not provided
  const avatarStyle = style || AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  
  // Pick a random background color
  const bgColor = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
  
  // Generate DiceBear avatar URL
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}&backgroundColor=${bgColor}&size=200`;
}

/**
 * Generate avatar URL using UI Avatars service (alternative)
 * @param memberName - The name of the member
 * @param size - Size of the avatar (default: 200)
 * @returns Avatar URL string
 */
export function generateUIAvatar(memberName: string, size: number = 200): string {
  const initials = memberName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const bgColor = BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&size=${size}&background=${bgColor}&color=fff&bold=true`;
}

/**
 * Get a consistent avatar for a member (same name = same avatar)
 * @param memberName - The name of the member
 * @param useInitials - Whether to use initials-based avatar (default: false)
 * @returns Avatar URL string
 */
export function getConsistentAvatar(memberName: string, useInitials: boolean = false): string {
  if (useInitials) {
    return generateUIAvatar(memberName);
  }
  
  // Use member name hash to pick consistent style
  const nameHash = memberName.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0);
  }, 0);
  
  const styleIndex = Math.abs(nameHash) % AVATAR_STYLES.length;
  const colorIndex = Math.abs(nameHash >> 4) % BACKGROUND_COLORS.length;
  
  const style = AVATAR_STYLES[styleIndex];
  const bgColor = BACKGROUND_COLORS[colorIndex];
  const seed = encodeURIComponent(memberName);
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${bgColor}&size=200`;
}
