import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi';
import styles from './SearchableDropdown.module.css';

const SearchableDropdown = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar producto...",
    noOptionsMessage = "No se encontraron resultados"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredOptions(options.slice(0, 100)); // Limit initial render
            return;
        }

        const filtered = options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered.slice(0, 100)); // Limit filtered render for performance
    }, [searchTerm, options]);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <div
                className={`${styles.selectionBox} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedOption ? styles.label : styles.placeholder}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FiChevronDown className={`${styles.arrow} ${isOpen ? styles.rotate : ''}`} />
            </div>

            {isOpen && (
                <div className={styles.dropdownContent}>
                    <div className={styles.searchBar}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        {searchTerm && (
                            <FiX
                                className={styles.clearIcon}
                                onClick={() => setSearchTerm('')}
                            />
                        )}
                    </div>

                    <ul className={styles.optionsList}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <li
                                    key={option.value}
                                    className={`${styles.optionItem} ${value === option.value ? styles.selected : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    <div className={styles.optionContent}>
                                        <span className={styles.optionLabel}>{option.label}</span>
                                        {option.sublabel && (
                                            <span className={styles.optionSublabel}>{option.sublabel}</span>
                                        )}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className={styles.noOptions}>{noOptionsMessage}</li>
                        )}
                        {options.length > filteredOptions.length && !searchTerm && (
                            <li className={styles.hint}>Escribe para buscar entre {options.length} productos...</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
