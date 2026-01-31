import React from 'react';

const Logo = ({ className }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-color)" />
                    <stop offset="100%" stopColor="#075985" />
                </linearGradient>
            </defs>

            {/* Background circle badge with a subtle border */}
            <circle cx="50" cy="50" r="48" fill="white" fillOpacity="0.05" />
            <circle cx="50" cy="50" r="48" stroke="var(--accent-color)" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* Stylized Dog/Paw Minimalist Icon */}
            <path
                d="M50 20C35 20 22 32 22 47C22 62 35 74 50 74C65 74 78 62 78 47C78 32 65 20 50 20ZM50 64C40.6 64 33 56.4 33 47C33 37.6 40.6 30 50 30C59.4 30 67 37.6 67 47C67 56.4 59.4 64 50 64Z"
                fill="url(#logoGradient)"
            />

            {/* Central Amber Accent (The Nose/Spark) */}
            <circle cx="50" cy="47" r="6" fill="var(--secondary-color)" />

            {/* Decorative ears/details */}
            <path
                d="M32 28L25 15M68 28L75 15"
                stroke="var(--accent-color)"
                strokeWidth="4"
                strokeLinecap="round"
            />

            {/* Minimalist paws detail at bottom */}
            <circle cx="42" cy="78" r="3" fill="var(--accent-color)" opacity="0.6" />
            <circle cx="50" cy="82" r="3" fill="var(--accent-color)" opacity="0.8" />
            <circle cx="58" cy="78" r="3" fill="var(--accent-color)" opacity="0.6" />
        </svg>
    );
};

export default Logo;
