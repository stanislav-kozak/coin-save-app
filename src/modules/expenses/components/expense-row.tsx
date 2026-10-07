import { useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '@/shared/lib/money';
import { cn } from '@/shared/lib/utils';
import { EntityIcon } from '@/shared/ui/entity-icon';

type Props = {
  expense: {
    id: string;
    type: 'EXPENSE' | 'INCOME';
    amount: string;
    walletCurrency: string;
    note?: string | null;
    occurredAt: string;
  };
  category?: { id: string; name: string; icon?: string | null; color?: string | null };
  /** The wallet's name (analytics list, Figma 16:505): a column on desktop, a caption on phones. */
  wallet?: string;
  /** Makes the row a button that opens the record for editing. */
  onOpen?: () => void;
};

/** Figma 8:161. Amount in the wallet's currency; incomes in green with "+". */
export function ExpenseRow({ expense, category, wallet, onOpen }: Props) {
  const te = useTranslations('expenses.edit');
  const t = useTranslations('categories');
  const locale = useLocale();
  const isIncome = expense.type === 'INCOME';
  const signed = isIncome ? expense.amount : `-${expense.amount}`;
  const content = (
    <>
      <EntityIcon
        id={category?.id ?? expense.id}
        color={category?.color}
        icon={category?.icon}
        size="s"
      />
      <span className="block min-w-0 flex-1">
        <span className="block truncate text-body font-medium">
          {category?.name ?? (isIncome ? t('income') : t('uncategorized'))}
        </span>
        {expense.note || wallet ? (
          <span className="block truncate text-caption text-muted-foreground">
            {expense.note}
            {wallet ? (
              <span className="md:hidden">
                {expense.note ? ' · ' : ''}
                {wallet}
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
      {wallet ? (
        <span className="hidden w-40 truncate text-caption text-muted-foreground md:block">
          {wallet}
        </span>
      ) : null}
      <span className={cn('block shrink-0 text-right', wallet && 'md:w-36')}>
        <span
          className={cn(
            'block text-body font-semibold tabular-nums',
            isIncome ? 'text-success' : 'text-foreground',
          )}
        >
          {formatMoney(signed, expense.walletCurrency, locale, { sign: 'always' })}
        </span>
        <span className="block text-caption text-muted-foreground">
          {new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
            new Date(expense.occurredAt),
          )}
        </span>
      </span>
    </>
  );
  return (
    <li>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center gap-3 rounded-control py-2 text-left outline-none hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span className="sr-only">{te('open')}</span>
          {content}
        </button>
      ) : (
        <div className="flex items-center gap-3 py-2">{content}</div>
      )}
    </li>
  );
}
