import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { CategoriesPage } from './categories-page';

describe('CategoriesPage', () => {
  it('renders category list', () => {
    const view = render(
      createElement(CategoriesPage, {
        initialCategories: [{ id: '1', name: 'Moradia', isActive: true }],
      }),
    );

    expect(view.getByDisplayValue('Moradia')).toBeInTheDocument();
  });
});
