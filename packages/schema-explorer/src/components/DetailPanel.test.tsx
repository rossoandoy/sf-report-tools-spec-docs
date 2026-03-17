import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SchemaProvider, useSchema } from '../context/SchemaContext';
import { DetailPanel } from './DetailPanel';
import { useEffect } from 'react';
import type { SchemaFile } from '@sf-report-tools/types';

const mockSchema: SchemaFile = {
  'MANAERP__Invoice__c': {
    name: 'Invoice',
    api_name: 'MANAERP__Invoice__c',
    domain: 'billing',
    fields: [
      { api_name: 'MANAERP__Invoice__c.MANAERP__Amount__c', label: 'Amount', type: 'Currency', required: true },
      { api_name: 'MANAERP__Invoice__c.MANAERP__Status__c', label: 'Status', type: 'Picklist', required: false },
      {
        api_name: 'MANAERP__Invoice__c.MANAERP__Payment__c',
        label: 'Payment',
        type: 'Lookup',
        required: false,
        referenceTo: 'MANAERP__Payment__c',
      },
    ],
    lookups: [
      { field: 'MANAERP__Payment__c', source: 'MANAERP__Invoice__c', target: 'MANAERP__Payment__c', type: 'Lookup' },
    ],
  },
  'MANAERP__Payment__c': {
    name: 'Payment',
    api_name: 'MANAERP__Payment__c',
    domain: 'billing',
    fields: [
      { api_name: 'MANAERP__Payment__c.MANAERP__Total__c', label: 'Total', type: 'Currency', required: true },
    ],
    lookups: [],
  },
};

function TestWrapper({ children, selectObject }: { children: React.ReactNode; selectObject?: string }) {
  return (
    <SchemaProvider>
      <SchemaInit selectObject={selectObject} />
      {children}
    </SchemaProvider>
  );
}

function SchemaInit({ selectObject }: { selectObject?: string }) {
  const { dispatch } = useSchema();
  useEffect(() => {
    dispatch({ type: 'SET_SCHEMA', schema: mockSchema });
    if (selectObject) {
      dispatch({ type: 'SELECT_OBJECT', apiName: selectObject });
    }
  }, [dispatch, selectObject]);
  return null;
}

describe('DetailPanel', () => {
  it('renders nothing when no object is selected', () => {
    const { container } = render(
      <TestWrapper>
        <DetailPanel />
      </TestWrapper>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders object name and fields when selected', () => {
    render(
      <TestWrapper selectObject="MANAERP__Invoice__c">
        <DetailPanel />
      </TestWrapper>
    );
    expect(screen.getAllByText('Invoice').length).toBeGreaterThan(0);
    expect(screen.getByText('Amount')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
  });

  it('shows lookup links for reference fields', () => {
    render(
      <TestWrapper selectObject="MANAERP__Invoice__c">
        <DetailPanel />
      </TestWrapper>
    );
    // The Lookup field should show a link to Payment
    const lookupLink = screen.getByText(/Lookup → Payment/);
    expect(lookupLink).toBeDefined();
  });

  it('shows required marker', () => {
    render(
      <TestWrapper selectObject="MANAERP__Invoice__c">
        <DetailPanel />
      </TestWrapper>
    );
    const markers = screen.getAllByText('*');
    expect(markers.length).toBeGreaterThan(0);
  });

  it('closes panel on × click', () => {
    render(
      <TestWrapper selectObject="MANAERP__Invoice__c">
        <DetailPanel />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('×'));
    // After close, panel should render nothing
    expect(screen.queryByText('Invoice')).toBeNull();
  });
});
