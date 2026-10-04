import { afterEach, render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from './app';

const authenticatedUser = {
  id: 'test-user',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
};

function setValidSession() {
  localStorage.setItem('odnowa-auth-token', 'test-token');
  localStorage.setItem('odnowa-user', JSON.stringify(authenticatedUser));
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => authenticatedUser,
    }),
  );
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('should redirect to login when there is no token', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Welcome back')).toBeTruthy();
  });

  it('should redirect to login when the token has expired', async () => {
    localStorage.setItem('odnowa-auth-token', 'expired-token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Welcome back')).toBeTruthy();
    expect(localStorage.getItem('odnowa-auth-token')).toBeNull();
  });

  it('should render successfully on root', async () => {
    setValidSession();
    const { baseElement } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
    expect((await screen.findAllByText('Moja grupa')).length).toBeGreaterThan(0);
  });

  it('should render the brand header and navigation on dashboard', async () => {
    setValidSession();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByLabelText('Sober Home')).toBeTruthy();
    expect(screen.getAllByText('Moja grupa').length).toBeGreaterThan(0);
    expect(screen.getByText('Przyłapania')).toBeTruthy();
  });

  it('should show logout for a signed-in user and clear their session on logout', async () => {
    setValidSession();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /Wyloguj/i }));

    expect(localStorage.getItem('odnowa-auth-token')).toBeNull();
    expect(localStorage.getItem('odnowa-user')).toBeNull();
    expect(screen.getByText('Witaj ponownie')).toBeTruthy();
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

  it('should render Stripe payment method section and allow switching methods', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('PAYMENT METHOD')).toBeTruthy();
    expect(screen.getByText('Stripe Secure')).toBeTruthy();
    expect(screen.getByPlaceholderText('4242 •••• •••• 4242')).toBeTruthy();

    // Switch to BLIK
    const blikRadio = screen.getByRole('radio', { name: /BLIK/i });
    act(() => {
      fireEvent.click(blikRadio);
    });
    expect(screen.getByPlaceholderText('123 456')).toBeTruthy();

    // Switch back to Card
    const cardRadio = screen.getByRole('radio', { name: /Card/i });
    act(() => {
      fireEvent.click(cardRadio);
    });

    // Test autofill test card
    const autofillBtn = screen.getByRole('button', { name: /Use Stripe test card/i });
    act(() => {
      fireEvent.click(autofillBtn);
    });

    const cardInput = screen.getByPlaceholderText('4242 •••• •••• 4242') as HTMLInputElement;
    expect(cardInput.value).toBe('4242 4242 4242 4242');
  });

  it('should render inline payment waiting timer and allow depositing directly', async () => {
    setValidSession();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    // Verify inline timer waiting for deposit is visible on dashboard
    expect(await screen.findAllByRole('timer')).not.toHaveLength(0);
    expect(screen.getAllByText(/CZEKA NA WPŁATĘ/i).length).toBeGreaterThan(0);

    // Find and click the quick deposit button
    const depositBtn = screen.getByRole('button', { name: /WPŁAĆ/i });
    expect(depositBtn).toBeTruthy();

    act(() => {
      fireEvent.click(depositBtn);
    });

    // Check that payment is recorded and timer updates
    expect(screen.getAllByText(/WPŁATA ZAKSIĘGOWANA/i).length).toBeGreaterThan(0);
  });

  it('should render Brak celów when no goal exists and allow opening add goal modal', async () => {
    setValidSession();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    // Verify "Brak celów" is displayed when group has no goal
    expect(await screen.findAllByText(/Brak celów/i)).not.toHaveLength(0);

    // Find "DODAJ CEL" button
    const addGoalButtons = screen.getAllByRole('button', { name: /DODAJ CEL/i });
    expect(addGoalButtons.length).toBeGreaterThan(0);

    act(() => {
      fireEvent.click(addGoalButtons[0]);
    });

    // Verify modal opens with goal title and target inputs
    expect(screen.getByText(/Wyznacz wspólny cel/i)).toBeTruthy();
    expect(screen.getByLabelText(/Tytuł celu/i)).toBeTruthy();
    expect(screen.getByLabelText(/Kwota celu/i)).toBeTruthy();
  });

  it('should render Profile page with actions on /profile', async () => {
    setValidSession();
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('TWÓJ CODZIENNY RYTM')).toBeTruthy();
    expect(screen.getByText(/TWÓJ PROFIL W GRUPIE/i)).toBeTruthy();
    expect(screen.getByText(/SUMA TWOICH WPŁAT/i)).toBeTruthy();
  });
});
