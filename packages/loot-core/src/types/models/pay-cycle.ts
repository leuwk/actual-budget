export type PayCycleConfig = {
  id: string;
  startDate: string;
  frequencyDays: number;
};

export type PayCycleBudget = {
  id: string;
  categoryId: string;
  amount: number;
};

export type PayCycleActual = {
  categoryId: string;
  amount: number;
};
