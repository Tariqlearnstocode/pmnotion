import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  className = '', 
  children, 
  onClick,
  hoverable = false
}) => {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${hoverable ? 'hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children }) => {
  return <div className={`p-4 border-b border-gray-200 ${className}`}>{children}</div>;
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className = '', children }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => {
  return <div className={`p-4 border-t border-gray-200 ${className}`}>{children}</div>;
};

export default { Card, CardHeader, CardContent, CardFooter };