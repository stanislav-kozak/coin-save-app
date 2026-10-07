import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { ExpenseDialog } from './expense-dialog';

const post = vi.fn();
const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: { POST: (...a: unknown[]) => post(...a), GET: (...a: unknown[]) => get(...a) },
}));

const wallets = [
  { id: 'w1', name: 'Mono', currency: 'UAH', balance: '100' },
  { id: 'w2', name: 'Cash', currency: 'USD', balance: '10' },
];
const categories = [
  { id: 'c1', name: 'Продукти', icon: '🛒', color: '#F97350', sortOrder: 1 },
  { id: 'c9', name: 'Кафе', icon: '☕', color: '#A855F7', sortOrder: 2 },
];

beforeEach(() => {
  post.mockReset();
  get.mockReset();
  get.mockImplementation(async (path: string) =>
    path.endsWith('/wallets') ? { data: wallets } : { data: categories },
  );
});

const openChanges: boolean[] = [];
function Harness({ prefill }: { prefill?: { walletId: string; categoryId: string } }) {
  const [open, setOpen] = useState(true);
  return (
    <ExpenseDialog
      spaceId="sp1"
      open={open}
      prefill={prefill}
      onOpenChange={(next) => {
        openChanges.push(next);
        setOpen(next);
      }}
    />
  );
}

/** Drops a second time while the first save may still be in flight. */
function Relauncher() {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ walletId: string; categoryId: string }>();
  const drop = (walletId: string, categoryId: string) => {
    setPrefill({ walletId, categoryId });
    setOpen(true);
  };
  return (
    <>
      <button onClick={() => drop('w1', 'c9')}>drop-mono</button>
      <button onClick={() => drop('w2', 'c1')}>drop-cash</button>
      <ExpenseDialog spaceId="sp1" open={open} prefill={prefill} onOpenChange={setOpen} />
    </>
  );
}

describe('ExpenseDialog', () => {
  beforeEach(() => {
    openChanges.length = 0;
  });

  it('is prefilled from the drop and closes before the server answers', async () => {
    let resolve!: (v: unknown) => void;
    post.mockReturnValue(new Promise((r) => (resolve = r)));
    renderWithProviders(<Harness prefill={{ walletId: 'w1', categoryId: 'c9' }} />);
    expect(await screen.findByText(/Mono/)).toBeInTheDocument();
    expect(screen.getByText(/Кафе/)).toBeInTheDocument();
    expect(screen.getByText('UAH')).toBeInTheDocument();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Сума'), '340');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(openChanges).toContain(false));
    expect(post).toHaveBeenCalledWith('/api/spaces/{spaceId}/expenses', {
      params: { path: { spaceId: 'sp1' } },
      body: expect.objectContaining({ walletId: 'w1', categoryId: 'c9', amount: 340 }),
    });
    resolve({ data: { id: 'e1' } });
  });

  it('reopens with the same values and the reason when the server refuses', async () => {
    post.mockResolvedValue({ error: { statusCode: 400, code: 'WALLET_ARCHIVED', message: 'x' } });
    renderWithProviders(<Harness prefill={{ walletId: 'w1', categoryId: 'c9' }} />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '340');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Гаманець в архіві');
    expect(openChanges).toEqual([false, true]);
    expect(screen.getByLabelText('Сума')).toHaveValue('340');
  });

  it('validates the amount before sending', async () => {
    renderWithProviders(<Harness prefill={{ walletId: 'w1', categoryId: 'c9' }} />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '0');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    expect(await screen.findByText('Сума має бути більшою за нуль')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('sends one expense on Enter twice', async () => {
    post.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Harness prefill={{ walletId: 'w1', categoryId: 'c9' }} />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '5{Enter}{Enter}');
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  });

  it('lets the user pick wallet and category when opened without a drop', async () => {
    post.mockResolvedValue({ data: { id: 'e1' } });
    renderWithProviders(<Harness />);
    const user = userEvent.setup();
    await screen.findByRole('option', { name: /Cash/ });
    // The first wallet is preselected once wallets arrive, so a wallet is never missing.
    expect(screen.getByLabelText('Гаманець')).toHaveValue('w1');
    await screen.findByRole('option', { name: /Продукти/ });
    // …and the first category, so an expense isn't left uncategorized by accident.
    expect(screen.getByLabelText('Категорія')).toHaveValue('c1');
    await user.selectOptions(screen.getByLabelText('Гаманець'), 'w2');
    await user.selectOptions(screen.getByLabelText('Категорія'), '');
    expect(screen.getByText('USD')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Сума'), '5');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalled());
    const body = post.mock.calls[0][1].body;
    expect(body).toMatchObject({ walletId: 'w2', amount: 5 });
    expect(body.categoryId).toBeUndefined();
  });

  it('accepts a new drop while the previous save is pending and still reports its failure', async () => {
    let answerFirst!: (v: unknown) => void;
    post
      .mockReturnValueOnce(new Promise((r) => (answerFirst = r)))
      .mockResolvedValueOnce({ data: { id: 'e2' } });
    renderWithProviders(<Relauncher />);
    const user = userEvent.setup();

    await user.click(screen.getByText('drop-mono'));
    await user.type(await screen.findByLabelText('Сума'), '340');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(screen.queryByLabelText('Сума')).not.toBeInTheDocument());

    await user.click(screen.getByText('drop-cash'));
    await user.type(await screen.findByLabelText('Сума'), '7');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    answerFirst({ error: { statusCode: 400, code: 'WALLET_ARCHIVED', message: 'x' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Гаманець в архіві');
    expect(screen.getByLabelText('Сума')).toHaveValue('340');
    expect(screen.getByText(/Mono/)).toBeInTheDocument();
    expect(screen.getByText(/Кафе/)).toBeInTheDocument();
  });

  it('says a wallet is missing instead of silently ignoring the submit', async () => {
    get.mockImplementation(async (path: string) =>
      path.endsWith('/wallets')
        ? { error: { statusCode: 403, code: 'FORBIDDEN', message: 'x' } }
        : { data: categories },
    );
    renderWithProviders(<Harness />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '5');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    expect(await screen.findByText('Оберіть гаманець')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('can be sent again after the server refused it at once', async () => {
    post
      .mockResolvedValueOnce({ error: { statusCode: 400, code: 'WALLET_ARCHIVED', message: 'x' } })
      .mockResolvedValueOnce({ data: { id: 'e1' } });
    renderWithProviders(<Harness prefill={{ walletId: 'w1', categoryId: 'c9' }} />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Сума'), '340');
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Додати' }));
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(2));
  });
});
