import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SchemaProvider, useSchema } from '../context/SchemaContext';
import { DomainFilter } from './DomainFilter';
import { useEffect } from 'react';
import type { SchemaFile } from '@sf-report-tools/types';

const mockSchema: SchemaFile = {
  'Obj_A': {
    name: 'Object A',
    api_name: 'Obj_A',
    domain: 'billing',
    fields: [],
    lookups: [],
  },
};

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SchemaProvider>
      <SchemaInit />
      {children}
    </SchemaProvider>
  );
}

function SchemaInit() {
  const { dispatch } = useSchema();
  useEffect(() => {
    dispatch({ type: 'SET_SCHEMA', schema: mockSchema });
  }, [dispatch]);
  return null;
}

describe('DomainFilter', () => {
  it('renders all domain buttons', () => {
    render(
      <TestWrapper>
        <DomainFilter />
      </TestWrapper>
    );
    expect(screen.getByText('請求・決済')).toBeDefined();
    expect(screen.getByText('授業・レッスン')).toBeDefined();
    expect(screen.getByText('標準オブジェクト')).toBeDefined();
  });

  it('toggles domain on click', () => {
    render(
      <TestWrapper>
        <DomainFilter />
      </TestWrapper>
    );
    const billingBtn = screen.getByText('請求・決済');
    fireEvent.click(billingBtn);
    // After click, the button should have transparent bg (deselected)
    expect(billingBtn.style.backgroundColor).toBe('transparent');
  });

  it('toggles all with 全解除/全選択 button', () => {
    render(
      <TestWrapper>
        <DomainFilter />
      </TestWrapper>
    );
    const toggleAll = screen.getByText('全解除');
    fireEvent.click(toggleAll);
    // Now it should say 全選択
    expect(screen.getByText('全選択')).toBeDefined();
  });
});
