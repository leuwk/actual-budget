import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { amountToInteger, integerToAmount } from '@actual-app/core/shared/util';
import type {
  CategoryGroupEntity,
  PayCycleActual,
  PayCycleBudget,
  PayCycleConfig,
} from '@actual-app/core/types/models';

import { formatDate } from './payCycleUtils';

type CycleTableProps = {
  config: PayCycleConfig;
  groups: CategoryGroupEntity[];
  budgets: PayCycleBudget[];
  actuals: PayCycleActual[];
  cycleStart: string;
  cycleEnd: string;
  onCycleChange: (delta: number) => void;
  onBudgetChange: (categoryId: string, amount: number) => void;
};

function formatAmount(milliUnits: number): string {
  return integerToAmount(milliUnits).toFixed(2);
}

export function CycleTable({
  config,
  groups,
  budgets,
  actuals,
  cycleStart,
  cycleEnd,
  onCycleChange,
  onBudgetChange,
}: CycleTableProps) {
  const { t } = useTranslation();

  const budgetMap = new Map(budgets.map(b => [b.categoryId, b.amount]));
  const actualMap = new Map(actuals.map(a => [a.categoryId, a.amount]));

  const expenseGroups = groups.filter(
    g => !g.is_income && g.categories && g.categories.length > 0,
  );

  return (
    <View style={{ gap: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: '8px 0',
        }}
      >
        <Button variant="bare" onPress={() => onCycleChange(-1)}>
          ‹
        </Button>
        <Text style={{ fontWeight: 600, fontSize: 15 }}>
          {formatDate(cycleStart)} – {formatDate(cycleEnd)}
        </Text>
        <Button variant="bare" onPress={() => onCycleChange(1)}>
          ›
        </Button>
        <Text style={{ color: theme.pageTextLight, fontSize: 13 }}>
          ({config.frequencyDays} {t('days')})
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.tableHeaderBackground,
            padding: '8px 12px',
            borderBottom: `1px solid ${theme.tableBorder}`,
          }}
        >
          <Text
            style={{ flex: 1, fontWeight: 600, color: theme.tableHeaderText }}
          >
            <Trans>Category</Trans>
          </Text>
          <Text
            style={{
              width: 110,
              textAlign: 'right',
              fontWeight: 600,
              color: theme.tableHeaderText,
            }}
          >
            <Trans>Budgeted</Trans>
          </Text>
          <Text
            style={{
              width: 110,
              textAlign: 'right',
              fontWeight: 600,
              color: theme.tableHeaderText,
            }}
          >
            <Trans>Actual</Trans>
          </Text>
          <Text
            style={{
              width: 110,
              textAlign: 'right',
              fontWeight: 600,
              color: theme.tableHeaderText,
            }}
          >
            <Trans>Remaining</Trans>
          </Text>
        </View>

        {expenseGroups.map(group => (
          <View key={group.id}>
            <View
              style={{
                padding: '6px 12px',
                backgroundColor: theme.tableRowBackgroundHover,
                borderBottom: `1px solid ${theme.tableBorder}`,
              }}
            >
              <Text style={{ fontWeight: 600, fontSize: 13 }}>
                {group.name}
              </Text>
            </View>

            {(group.categories ?? []).map(cat => {
              const budgeted = budgetMap.get(cat.id) ?? 0;
              const actual = actualMap.get(cat.id) ?? 0;
              const remaining = budgeted - actual;

              return (
                <View
                  key={cat.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '6px 12px',
                    borderBottom: `1px solid ${theme.tableBorder}`,
                    backgroundColor: theme.tableBackground,
                  }}
                >
                  <Text style={{ flex: 1 }}>{cat.name}</Text>
                  <View style={{ width: 110, alignItems: 'flex-end' }}>
                    <Input
                      type="number"
                      value={formatAmount(budgeted)}
                      onBlur={e => {
                        const val = parseFloat(
                          (e.target as HTMLInputElement).value,
                        );
                        if (!isNaN(val)) {
                          onBudgetChange(cat.id, amountToInteger(val));
                        }
                      }}
                      style={{
                        width: 90,
                        textAlign: 'right',
                        padding: '2px 6px',
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      width: 110,
                      textAlign: 'right',
                      color:
                        actual !== 0 ? theme.errorText : theme.pageTextLight,
                    }}
                  >
                    {formatAmount(actual)}
                  </Text>
                  <Text
                    style={{
                      width: 110,
                      textAlign: 'right',
                      color:
                        remaining < 0
                          ? theme.errorText
                          : theme.pageTextPositive,
                    }}
                  >
                    {formatAmount(remaining)}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
