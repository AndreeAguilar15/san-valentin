
import type { FlowerPalette } from './types.ts';

export const PALETTES: FlowerPalette[] = [
  {
    name: 'Rosas Rojas',
    type: 'rose',
    petals: ['#ff4d6d', '#c9184a', '#a4133c', '#ff758f'],
    stem: '#1b4332',
    center: '#590d22'
  },
  {
    name: 'Tulipanes Azules',
    type: 'tulip',
    petals: ['#48cae4', '#0096c7', '#023e8a', '#90e0ef'],
    stem: '#2d6a4f',
    center: '#caf0f8'
  },
  {
    name: 'Margaritas Rosas',
    type: 'daisy',
    petals: ['#ffc2d1', '#ffb3c1', '#ff8fab', '#fb6f92'],
    stem: '#40916c',
    center: '#ffea00'
  },
  {
    name: 'Lirios Blancos',
    type: 'lily',
    petals: ['#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6'],
    stem: '#52b788',
    center: '#fb8500'
  },
  {
    name: 'Girasoles',
    type: 'sunflower',
    petals: ['#ffb703', '#fb8500', '#ff9f1c', '#ffbf69'],
    stem: '#2d6a4f',
    center: '#3c0919'
  }
];
