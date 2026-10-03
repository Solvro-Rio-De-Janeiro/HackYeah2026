import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render the brand header and navigation', () => {
    const { getByLabelText, getByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(getByLabelText('Sober Home')).toBeTruthy();
    expect(getByText('Moja grupa')).toBeTruthy();
  });
});
