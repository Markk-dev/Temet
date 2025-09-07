// This file is used to verify that the migrated components can be imported correctly
// and that all dependencies are properly resolved

import Navbar from './Navbar';
import ShapesMenu from './ShapesMenu';
import { navElements, shapeElements } from '../constants';
import { ActiveElement, NavbarProps, ShapesMenuProps } from '../types';

// Verify that components can be imported
console.log('✅ Navbar component imported successfully');
console.log('✅ ShapesMenu component imported successfully');

// Verify that constants are available
console.log('✅ navElements constant imported:', navElements.length, 'elements');
console.log('✅ shapeElements constant imported:', shapeElements.length, 'elements');

// Verify that types are available
console.log('✅ ActiveElement type is properly defined');

// Export components for verification
export { Navbar, ShapesMenu };
export type { NavbarProps, ShapesMenuProps, ActiveElement };