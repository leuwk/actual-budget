import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Input } from '@actual-app/components/input';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { PayCycleConfig } from '@actual-app/core/types/models';

type SetupFormProps = {
  onSave: (config: Omit<PayCycleConfig, 'id'>) => void;
};

export function SetupForm({ onSave }: SetupFormProps) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [frequencyDays, setFrequencyDays] = useState('14');

  function handleSubmit() {
    const freq = parseInt(frequencyDays, 10);
    if (!startDate || isNaN(freq) || freq < 1) return;
    onSave({ startDate, frequencyDays: freq });
  }

  return (
    <View style={{ maxWidth: 400, padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 600 }}>
        <Trans>Set up Pay Cycles</Trans>
      </Text>
      <Text style={{ color: theme.pageTextLight }}>
        <Trans>
          Enter the date of your first pay day and how often you get paid.
        </Trans>
      </Text>
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: 500 }}>{<Trans>First pay date</Trans>}</Text>
        <Input
          type="date"
          value={startDate}
          onChange={e => setStartDate((e.target as HTMLInputElement).value)}
          style={{ padding: '6px 8px' }}
        />
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: 500 }}>{t('Pay frequency (days)')}</Text>
        <Input
          type="number"
          value={frequencyDays}
          onChange={e => setFrequencyDays((e.target as HTMLInputElement).value)}
          min="1"
          style={{ padding: '6px 8px', width: 100 }}
        />
      </View>
      <Button variant="primary" onPress={handleSubmit}>
        <Trans>Save</Trans>
      </Button>
    </View>
  );
}
