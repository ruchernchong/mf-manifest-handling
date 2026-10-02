import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../src/App';

test('composes both remotes and preserves their interactive state', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Host MFE' })).toBeInTheDocument();
  expect(
    await screen.findByRole('heading', { name: 'Tools catalog' }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Select a tool'), {
    target: { value: 'Remote loader' },
  });
  expect(screen.getByText('Selected: Remote loader')).toBeInTheDocument();
  fireEvent.click(await screen.findByRole('button', { name: 'Record event' }));
  expect(screen.getByText('Recorded events: 1')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(screen.getByText('Recorded events: 0')).toBeInTheDocument();
});
