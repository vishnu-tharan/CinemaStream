import { Platform } from 'react-native';
export const cinema = {
  bg: '#0B0D12', surface: '#151820', elevated: '#1E222C', border: '#292E39',
  text: '#F4F1EB', muted: '#969CAA', accent: '#F3A66B', accentDark: '#241A15',
  danger: '#FF9393', serif: Platform.OS === 'ios' ? 'Georgia' : Platform.OS === 'web' ? 'Georgia' : 'serif',
};
