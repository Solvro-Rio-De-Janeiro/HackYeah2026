import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  it('should render successfully on root', () => {
    const { baseElement } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
    expect(screen.getByText('Moja grupa')).toBeTruthy();
  });

  it('should render the brand header and navigation on dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Sober Home')).toBeTruthy();
    expect(screen.getByText('Moja grupa')).toBeTruthy();
    expect(screen.getByText('Przyłapania')).toBeTruthy();
  });

  it('should render Sign Up page on /signup', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
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
    expect(screen.getByRole('button', { name: /LOG IN/i })).toBeTruthy();
  });

  it('should navigate between /signup and /login using router links', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
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

  it('should toggle password visibility on /signup', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );
    const toggleButtons = screen.getAllByLabelText(/Show password/i);
    expect(toggleButtons.length).toBeGreaterThan(0);
    fireEvent.click(toggleButtons[0]);
    expect(screen.getByLabelText(/Hide password/i)).toBeTruthy();
  });
});
