// Integration test to verify the migrated toolbar components work correctly
import React from 'react';
import Navbar from './Navbar';
import ShapesMenu from './ShapesMenu';
import { navElements, shapeElements } from '../constants';
import { ActiveElement } from '../types';

// Mock handlers for testing
const mockHandlers = {
    handleActiveElement: (element: ActiveElement) => {
        console.log('Active element changed:', element);
    },
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Image upload triggered:', e.target.files);
    },
    imageInputRef: { current: null } as React.MutableRefObject<HTMLInputElement | null>
};

// Test component that demonstrates the toolbar components
export const ToolbarIntegrationTest: React.FC = () => {
    const [activeElement, setActiveElement] = React.useState<ActiveElement>(null);

    const handleActiveElement = (element: ActiveElement) => {
        setActiveElement(element);
        mockHandlers.handleActiveElement(element);
    };

    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold mb-4">Canvas Toolbar Integration Test</h2>

            {/* Test Navbar component */}
            <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Navbar Component</h3>
                <Navbar
                    activeElement={activeElement}
                    imageInputRef={mockHandlers.imageInputRef}
                    handleImageUpload={mockHandlers.handleImageUpload}
                    handleActiveElement={handleActiveElement}
                />
            </div>

            {/* Test ShapesMenu component */}
            <div className="mb-6">
                <h3 className="text-md font-medium mb-2">ShapesMenu Component</h3>
                <ShapesMenu
                    item={{
                        name: "Rectangle",
                        icon: "/assets/rectangle.svg",
                        value: shapeElements,
                    }}
                    activeElement={activeElement}
                    handleActiveElement={handleActiveElement}
                    handleImageUpload={mockHandlers.handleImageUpload}
                    imageInputRef={mockHandlers.imageInputRef}
                />
            </div>

            {/* Display current state */}
            <div className="mt-6 p-4 bg-neutral-100 rounded-md">
                <h3 className="text-md font-medium mb-2">Current State</h3>
                <p className="text-sm">
                    Active Element: {activeElement ? `${activeElement.name} (${activeElement.value})` : 'None'}
                </p>
                <p className="text-sm">
                    Available Nav Elements: {navElements.length}
                </p>
                <p className="text-sm">
                    Available Shape Elements: {shapeElements.length}
                </p>
            </div>
        </div>
    );
};

export default ToolbarIntegrationTest;