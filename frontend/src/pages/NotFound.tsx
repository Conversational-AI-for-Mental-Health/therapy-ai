import React, { FC } from 'react';
import { Screens } from '@/util/types/index';

interface NotFoundProps {
  onNavigate: (screen: Screens) => void;
}

const NotFound: FC<NotFoundProps> = ({ onNavigate }) => {
  return (
    <div
      className="min-h-screen bg-surface flex flex-col items-center justify-center text-center"
      style={{ padding: 'var(--space-xxl) var(--space-md)' }}
      data-cy="not-found-page"
    >
      {/* 404 number */}
      <h1
        className="text-primary"
        style={{
          fontSize: 'clamp(80px, 20vw, 160px)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 1,
          marginBottom: 'var(--space-sm)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light, #7ec8b8))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        404
      </h1>

      {/* Headline */}
      <h2
        className="text-primary"
        style={{
          fontSize: 'var(--font-h2)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: 'var(--space-sm)',
        }}
      >
        Page not found
      </h2>

      {/* Subtext */}
      <p
        className="text-secondary"
        style={{
          fontSize: 'var(--font-body-lg)',
          maxWidth: '400px',
          lineHeight: '1.6',
          marginBottom: 'var(--space-xl)',
        }}
      >
        The page you're looking for doesn't exist or may have been moved.
      </p>

      {/* Actions */}
      <div
        className="flex flex-col sm:flex-row items-center justify-center"
        style={{ gap: 'var(--space-sm)' }}
      >
        <button
          onClick={() => onNavigate('landing')}
          className="gradient-bg-primary text-white rounded-full hover:opacity-90 transition"
          style={{ padding: 'var(--space-sm) var(--space-xl)', fontSize: 'var(--font-body-lg)' }}
        >
          Go home
        </button>
        <button
          onClick={() => window.history.back()}
          className="text-secondary hover:text-primary transition rounded-full border-2 border-current"
          style={{ padding: 'var(--space-sm) var(--space-xl)', fontSize: 'var(--font-body-lg)' }}
        >
          Go back
        </button>
      </div>
    </div>
  );
};

export default NotFound;