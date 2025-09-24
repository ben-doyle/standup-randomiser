// Type definition for team member
export interface TeamMember {
  name: string;
  enabled: boolean;
}

// Local storage keys
const TEAM_MEMBERS_KEY = 'standupTeamMembers';

/**
 * Save team members to local storage
 */
export function saveTeamMembers(members: TeamMember[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members));
}

/**
 * Get team members from local storage
 */
export function getTeamMembers(): TeamMember[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(TEAM_MEMBERS_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing team members from localStorage:', e);
    return [];
  }
}

/**
 * Parse comma-separated string into team member objects
 */
export function parseTeamMembersList(input: string): TeamMember[] {
  if (!input) return [];
  
  return input
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0)
    .map(name => ({ name, enabled: true }));
}

/**
 * Convert team members to comma-separated string
 */
export function teamMembersToString(members: TeamMember[]): string {
  return members.map(m => m.name).join(', ');
}
