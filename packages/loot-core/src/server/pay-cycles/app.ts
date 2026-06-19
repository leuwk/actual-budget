import { v4 as uuidv4 } from 'uuid';

import { createApp } from '#server/app';
import * as db from '#server/db';
import { toDateRepr } from '#server/models';
import { mutator } from '#server/mutators';
import type {
  PayCycleActual,
  PayCycleBudget,
  PayCycleConfig,
} from '#types/models';

type DbPayCycleConfig = {
  id: string;
  start_date: string;
  frequency_days: number;
};

type DbPayCycleBudget = {
  id: string;
  category_id: string;
  amount: number;
};

type DbActual = {
  category_id: string;
  total: number;
};

export type PayCycleHandlers = {
  'pay-cycle/get-config': () => Promise<PayCycleConfig | null>;
  'pay-cycle/set-config': (
    config: Omit<PayCycleConfig, 'id'>,
  ) => Promise<PayCycleConfig>;
  'pay-cycle/get-budgets': () => Promise<PayCycleBudget[]>;
  'pay-cycle/set-budget': (
    budget: Omit<PayCycleBudget, 'id'>,
  ) => Promise<PayCycleBudget>;
  'pay-cycle/get-actuals': (arg: {
    startDate: string;
    endDate: string;
  }) => Promise<PayCycleActual[]>;
};

export const app = createApp<PayCycleHandlers>();

app.method('pay-cycle/get-config', getConfig);
app.method('pay-cycle/set-config', mutator(setConfig));
app.method('pay-cycle/get-budgets', getBudgets);
app.method('pay-cycle/set-budget', mutator(setBudget));
app.method('pay-cycle/get-actuals', getActuals);

async function getConfig(): Promise<PayCycleConfig | null> {
  const row = await db.first<DbPayCycleConfig>(
    'SELECT id, start_date, frequency_days FROM pay_cycles LIMIT 1',
  );
  if (!row) return null;
  return {
    id: row.id,
    startDate: row.start_date,
    frequencyDays: row.frequency_days,
  };
}

async function setConfig({
  startDate,
  frequencyDays,
}: Omit<PayCycleConfig, 'id'>): Promise<PayCycleConfig> {
  const existing = await db.first<{ id: string }>(
    'SELECT id FROM pay_cycles LIMIT 1',
  );
  if (existing) {
    await db.run(
      'UPDATE pay_cycles SET start_date = ?, frequency_days = ? WHERE id = ?',
      [startDate, frequencyDays, existing.id],
    );
    return { id: existing.id, startDate, frequencyDays };
  }
  const id = uuidv4();
  await db.run(
    'INSERT INTO pay_cycles (id, start_date, frequency_days) VALUES (?, ?, ?)',
    [id, startDate, frequencyDays],
  );
  return { id, startDate, frequencyDays };
}

async function getBudgets(): Promise<PayCycleBudget[]> {
  const rows = await db.all<DbPayCycleBudget>(
    'SELECT id, category_id, amount FROM pay_cycle_budgets',
  );
  return rows.map(r => ({
    id: r.id,
    categoryId: r.category_id,
    amount: r.amount,
  }));
}

async function setBudget({
  categoryId,
  amount,
}: Omit<PayCycleBudget, 'id'>): Promise<PayCycleBudget> {
  const existing = await db.first<{ id: string }>(
    'SELECT id FROM pay_cycle_budgets WHERE category_id = ?',
    [categoryId],
  );
  if (existing) {
    await db.run(
      'UPDATE pay_cycle_budgets SET amount = ? WHERE category_id = ?',
      [amount, categoryId],
    );
    return { id: existing.id, categoryId, amount };
  }
  const id = uuidv4();
  await db.run(
    'INSERT INTO pay_cycle_budgets (id, category_id, amount) VALUES (?, ?, ?)',
    [id, categoryId, amount],
  );
  return { id, categoryId, amount };
}

async function getActuals({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): Promise<PayCycleActual[]> {
  const startInt = toDateRepr(startDate);
  const endInt = toDateRepr(endDate);
  const rows = await db.all<DbActual>(
    `SELECT category as category_id, SUM(amount) as total
     FROM v_transactions_internal_alive
     WHERE date >= ? AND date <= ?
       AND category IS NOT NULL
       AND is_parent = 0
     GROUP BY category`,
    [startInt, endInt],
  );
  return rows.map(r => ({ categoryId: r.category_id, amount: r.total }));
}
