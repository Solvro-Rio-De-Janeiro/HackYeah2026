import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
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

  it('should render Sign Up page by default on /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Your space, your pace')).toBeTruthy();
    expect(screen.getByText('Create an account')).toBeTruthy();
    expect(screen.getByText(/START YOUR JOURNEY/i)).toBeTruthy();
  });

  it('should render dedicated LoginPage on /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Resume progress')).toBeTruthy();
    expect(screen.getByText('Welcome back')).toBeTruthy();
    expect(screen.getByText(/ENTER SANCTUARY/i)).toBeTruthy();
  });

  it('should navigate between /signup and /login using router links', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const loginLink = screen.getByRole('tab', { name: /Log In/i });
    fireEvent.click(loginLink);

    expect(screen.getByText('Resume progress')).toBeTruthy();
    expect(screen.getByText('Welcome back')).toBeTruthy();

    const signupLink = screen.getByRole('tab', { name: /Create Account/i });
    fireEvent.click(signupLink);

    expect(screen.getByText('Your space, your pace')).toBeTruthy();
    expect(screen.getByText('Create an account')).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );
    const toggleButton = screen.getByLabelText(/Show password/i);
    fireEvent.click(toggleButton);
    expect(screen.getByLabelText(/Hide password/i)).toBeTruthy();
  });
});
