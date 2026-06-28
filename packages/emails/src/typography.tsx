import * as React from 'react';
import { Text } from '@react-email/components';
import { EP, MONO } from './tokens';

export function Eyebrow({
  children,
  color = EP.muted,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <Text
      style={{
        margin: '0 0 12px',
        fontFamily: MONO,
        fontSize: '10.5px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.13em',
        color,
      }}
    >
      {children}
    </Text>
  );
}

export function H1({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Text
      style={{
        margin: '0 0 18px',
        fontSize: '28px',
        lineHeight: 1.25,
        fontWeight: 700,
        letterSpacing: '-0.025em',
        color: EP.ink,
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

export function Para({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Text
      style={{
        margin: '0 0 18px',
        fontSize: '15px',
        lineHeight: 1.65,
        color: EP.body,
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: EP.ink, fontWeight: 600 }}>{children}</strong>;
}

export function MonoVal({
  children,
  color = EP.ink,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span style={{ fontFamily: MONO, fontSize: '0.92em', fontWeight: 600, color }}>
      {children}
    </span>
  );
}
