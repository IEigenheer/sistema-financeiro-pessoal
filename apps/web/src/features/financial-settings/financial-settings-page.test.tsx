import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { FinancialSettingsPage } from './financial-settings-page';

describe('FinancialSettingsPage', () => {
  it('renders the form', () => {
    const view = render(
      createElement(FinancialSettingsPage, {
        initialValues: null,
      }),
    );

    expect(view.getByText('Configurações financeiras')).toBeInTheDocument();
  });
});
