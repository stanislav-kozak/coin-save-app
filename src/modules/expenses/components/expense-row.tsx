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
};

/** Figma 8:161. Amount in the wallet's currency; incomes in green with "+". */
export function ExpenseRow({ expense, category, wallet }: Props) {
  const t = useTranslations('categories');
  const locale = useLocale();
  const isIncome = expense.type === 'INCOME';
  const signed = isIncome ? expense.amount : `-${expense.amount}`;
  return (
    <li className="flex items-center gap-3 py-2">
      <EntityIcon
        id={category?.id ?? expense.id}
        color={category?.color}
        icon={category?.icon}
        size="s"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium">
          {category?.name ?? (isIncome ? t('income') : t('uncategorized'))}
        </p>
        {expense.note || wallet ? (
          <p className="truncate text-caption text-muted-foreground">
            {expense.note}
            {wallet ? (
              <span className="md:hidden">
                {expense.note ? ' · ' : ''}
                {wallet}
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
      {wallet ? (
        <span className="hidden w-40 truncate text-caption text-muted-foreground md:block">
          {wallet}
        </span>
      ) : null}
      <div className="text-right">
        <p
          className={cn(
            'text-body font-semibold tabular-nums',
            isIncome ? 'text-success' : 'text-foreground',
          )}
        >
          {formatMoney(signed, expense.walletCurrency, locale, { sign: 'always' })}
        </p>
        <p className="text-caption text-muted-foreground">
          {new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
            new Date(expense.occurredAt),
          )}
        </p>
      </div>
    </li>
  );
}
