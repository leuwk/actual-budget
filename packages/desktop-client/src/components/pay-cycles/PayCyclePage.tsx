import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { send } from '@actual-app/core/platform/client/connection';
import type {
  PayCycleActual,
  PayCycleBudget,
  PayCycleConfig,
} from '@actual-app/core/types/models';

import { Page } from '#components/Page';
import { useCategories } from '#hooks/useCategories';

import { CycleTable } from './CycleTable';
import { addDays, getCycleStart } from './payCycleUtils';
import { SetupForm } from './SetupForm';

export function PayCyclePage() {
  const { t } = useTranslation();
  const { data: categories } = useCategories();
  const [config, setConfig] = useState<PayCycleConfig | null | undefined>(
    undefined,
  );
  const [budgets, setBudgets] = useState<PayCycleBudget[]>([]);
  const [actuals, setActuals] = useState<PayCycleActual[]>([]);
  const [cycleOffset, setCycleOffset] = useState(0);

  useEffect(() => {
    async function load() {
      const [cfg, buds] = await Promise.all([
        send('pay-cycle/get-config'),
        send('pay-cycle/get-budgets'),
      ]);
      setConfig(cfg);
      setBudgets(buds);
    }
    void load();
  }, []);

  const cycleStart =
    config != null
      ? addDays(
          getCycleStart(config.startDate, config.frequencyDays),
          cycleOffset * config.frequencyDays,
        )
      : '';

  const cycleEnd =
    config != null ? addDays(cycleStart, config.frequencyDays - 1) : '';

  useEffect(() => {
    if (!cycleStart || !cycleEnd) return;
    void send('pay-cycle/get-actuals', {
      startDate: cycleStart,
      endDate: cycleEnd,
    }).then(setActuals);
  }, [cycleStart, cycleEnd]);

  async function handleSaveConfig(newConfig: Omit<PayCycleConfig, 'id'>) {
    const saved = await send('pay-cycle/set-config', newConfig);
    setConfig(saved);
  }

  async function handleBudgetChange(categoryId: string, amount: number) {
    const saved = await send('pay-cycle/set-budget', { categoryId, amount });
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.categoryId === categoryId);
      if (idx >= 0) {
        return prev.map((b, i) => (i === idx ? saved : b));
      }
      return [...prev, saved];
    });
  }

  const groups = categories?.grouped ?? [];

  return (
    <Page header={t('Pay Cycles')}>
      {config === undefined ? (
        <Text style={{ color: theme.pageTextLight }}>
          <Trans>Loading...</Trans>
        </Text>
      ) : config === null ? (
        <SetupForm onSave={handleSaveConfig} />
      ) : (
        <CycleTable
          config={config}
          groups={groups}
          budgets={budgets}
          actuals={actuals}
          cycleStart={cycleStart}
          cycleEnd={cycleEnd}
          onCycleChange={delta => setCycleOffset(prev => prev + delta)}
          onBudgetChange={handleBudgetChange}
        />
      )}
    </Page>
  );
}
