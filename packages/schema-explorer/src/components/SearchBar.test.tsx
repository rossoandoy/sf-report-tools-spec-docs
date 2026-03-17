import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SchemaProvider, useSchema } from '../context/SchemaContext';
import { SearchBar } from './SearchBar';
import { useEffect } from 'react';
import type { SchemaFile } from '@sf-report-tools/types';

const mockSchema: SchemaFile = {
  'MANAERP__Invoice__c': {
    name: 'Invoice',
    api_name: 'MANAERP__Invoice__c',
    domain: 'billing',
    fields: [
      { api_name: 'MANAERP__Invoice__c.MANAERP__Amount__c', label: 'Amount', type: 'Currency', required: true },
    ],
    lookups: [],
  },
  'MANAERP__Lesson__c': {
    name: 'Lesson',
    api_name: 'MANAERP__Lesson__c',
    domain: 'lesson',
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

describe('SearchBar', () => {
  it('renders input', () => {
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText('オブジェクト・項目を検索...')).toBeDefined();
  });

  it('shows results on typing', () => {
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText('オブジェクト・項目を検索...');
    fireEvent.change(input, { target: { value: 'Invoice' } });
    fireEvent.focus(input);
    expect(screen.getByText('Invoice')).toBeDefined();
  });

  it('shows no results for non-matching query', () => {
    render(
      <TestWrapper>
        <SearchBar />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText('オブジェクト・項目を検索...');
    fireEvent.change(input, { target: { value: 'xyznonexist' } });
    expect(screen.queryByRole('listitem')).toBeNull();
  });
});
