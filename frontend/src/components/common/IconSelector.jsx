import React, { useState, useEffect, useRef } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';
import * as MdIcons from 'react-icons/md';

const IconSelector = ({ selectedIcon, onSelectIcon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [iconLibrary, setIconLibrary] = useState('Fa');
  const dropdownRef = useRef(null);

  // Icon libraries
  const iconLibraries = {
    'Fa': FaIcons,
    'Ai': AiIcons,
    'Bi': BiIcons,
    'Bs': BsIcons,
    'Md': MdIcons
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get all icons from the selected library
  const getIcons = () => {
    const currentLibrary = iconLibraries[iconLibrary];
    const icons = Object.keys(currentLibrary)
      .filter(key => key.includes(searchTerm) && typeof currentLibrary[key] === 'function')
      .slice(0, 100); // Limit to 100 icons for performance

    return icons;
  };

  // Render the selected icon or placeholder
  const renderSelectedIcon = () => {
    if (selectedIcon) {
      const [library, iconName] = selectedIcon.split(':');
      if (iconLibraries[library] && iconLibraries[library][iconName]) {
        const IconComponent = iconLibraries[library][iconName];
        return <IconComponent className="w-5 h-5" />;
      }
    }
    return <span className="text-gray-400">Select Icon</span>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {renderSelectedIcon()}
          <span className="ml-2">{selectedIcon ? selectedIcon.split(':')[1] : 'Choose an icon'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-72 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="p-2 border-b">
            <div className="flex flex-wrap gap-1">
              {Object.keys(iconLibraries).map(lib => (
                <button
                  key={lib}
                  className={`px-2 py-1 text-xs rounded ${iconLibrary === lib ? 'bg-[#92c51b] text-white' : 'bg-gray-200'}`}
                  onClick={() => setIconLibrary(lib)}
                >
                  {lib}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-2 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2">
              {getIcons().map(iconName => {
                const IconComponent = iconLibraries[iconLibrary][iconName];
                return (
                  <button
                    key={iconName}
                    className="flex items-center justify-center p-2 hover:bg-gray-100 rounded"
                    onClick={() => {
                      onSelectIcon(`${iconLibrary}:${iconName}`);
                      setIsOpen(false);
                    }}
                    title={iconName}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelector;