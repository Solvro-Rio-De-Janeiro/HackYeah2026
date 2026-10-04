import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from './app';

const authenticatedUser = {
  id: 'test-user',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
};

const backendGroup = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Moja grupa',
};

function setValidSession(groups = [backendGroup]) {
  localStorage.setItem('odnowa-auth-token', 'test-token');
  localStorage.setItem('odnowa-user', JSON.stringify(authenticatedUser));
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      return {
        ok: true,
        status: 200,
        json: async () =>
          url.endsWith('/api/auth/me')
            ? authenticatedUser
            : url.includes('/api/user-group/user/')
              ? groups
              : authenticatedUser,
      };
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

  it('should redirect to dashboard after a successful login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'test-token' }),
        })
        .mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => authenticatedUser,
        }),
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('name@domain.com'), {
      target: { value: authenticatedUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText('Wprowadź hasło'), {
      target: { value: 'valid-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ZALOGUJ SIĘ/i }));

    expect(await screen.findByLabelText('Sober Home')).toBeTruthy();
    expect(localStorage.getItem('odnowa-auth-token')).toBe('test-token');
  });

  it.each(['/login', '/signup'])(
    'should redirect a signed-in user away from %s',
    async (path) => {
      setValidSession();
      render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );

      expect(await screen.findAllByText('Moja grupa')).not.toHaveLength(0);
      expect(screen.queryByText('Welcome back')).toBeNull();
      expect(screen.queryByText('Create an account')).toBeNull();
    },
  );

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

  it('should show the empty state when the backend returns no groups', async () => {
    localStorage.setItem(
      'odnowa-groups',
      JSON.stringify([{ ...backendGroup, id: 'stale-local-group', name: 'Stara grupa' }]),
    );
    localStorage.setItem('odnowa-active-group', 'stale-local-group');
    setValidSession([]);
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('Nie należysz jeszcze do żadnej grupy'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /STWÓRZ GRUPĘ/i })).toBeTruthy();
    expect(screen.queryByText('Stara grupa')).toBeNull();
    expect(localStorage.getItem('odnowa-groups')).not.toBeNull();
    expect(localStorage.getItem('odnowa-active-group')).toBe('stale-local-group');
  });

  it('should create a group and add the current user through backend endpoints', async () => {
    localStorage.setItem('odnowa-auth-token', 'test-token');
    localStorage.setItem('odnowa-user', JSON.stringify(authenticatedUser));
    const createdGroup = {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Nowy początek',
    };
    let backendGroups: (typeof backendGroup)[] = [];
    const fetchMock = vi.fn().mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/api/auth/me')) {
          return { ok: true, status: 200, json: async () => authenticatedUser };
        }
        if (url.includes('/api/user-group/user/')) {
          return {
            ok: true,
            status: 200,
            json: async () => backendGroups,
          };
        }
        if (url.endsWith('/api/group') && init?.method === 'POST') {
          return { ok: true, status: 200, json: async () => createdGroup };
        }
        if (url.endsWith('/api/user-group') && init?.method === 'POST') {
          backendGroups = [createdGroup];
          return {
            ok: true,
            status: 200,
            json: async () => ({
              id: '33333333-3333-4333-8333-333333333333',
              user_id: authenticatedUser.id,
              group_id: createdGroup.id,
              completions: [],
              active: true,
            }),
          };
        }
        throw new Error(`Unexpected request: ${url}`);
      },
    );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /STWÓRZ GRUPĘ/i }));
    fireEvent.change(screen.getByPlaceholderText('np. Ekipa nowego początku'), {
      target: { value: createdGroup.name },
    });
    fireEvent.click(screen.getByRole('button', { name: /STWÓRZ GRUPĘ/i }));

    expect(await screen.findAllByText(createdGroup.name)).not.toHaveLength(0);
    const createRequest = fetchMock.mock.calls.find(
      ([url, init]) => String(url).endsWith('/api/group') && init?.method === 'POST',
    );
    const membershipRequest = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).endsWith('/api/user-group') && init?.method === 'POST',
    );
    expect(JSON.parse(String(createRequest?.[1]?.body))).toEqual({
      name: createdGroup.name,
    });
    expect(JSON.parse(String(membershipRequest?.[1]?.body))).toEqual({
      user_id: authenticatedUser.id,
      group_id: createdGroup.id,
    });
    const groupListRequests = fetchMock.mock.calls
      .map(([url, init], index) => ({
        url: String(url),
        method: init?.method,
        index,
      }))
      .filter(({ url }) => url.includes('/api/user-group/user/'));
    expect(groupListRequests[groupListRequests.length - 1]?.index).toBeGreaterThan(
      fetchMock.mock.calls.indexOf(membershipRequest!),
    );
    expect(localStorage.getItem('odnowa-groups')).toBeNull();
    expect(localStorage.getItem('odnowa-active-group')).toBeNull();
  });

  it('should clear the session and redirect to login on logout', async () => {
    setValidSession();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /Wyloguj/i }));

    expect(localStorage.getItem('odnowa-auth-token')).toBeNull();
    expect(localStorage.getItem('odnowa-user')).toBeNull();
    expect(await screen.findByText('Witaj ponownie')).toBeTruthy();
    expect(screen.queryByLabelText('Sober Home')).toBeNull();
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
