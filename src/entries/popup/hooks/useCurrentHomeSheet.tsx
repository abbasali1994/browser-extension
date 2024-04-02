import { useCallback, useMemo } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';

import { SpeedUpAndCancelSheet } from '../pages/speedUpAndCancelSheet';
import { ROUTES } from '../urls';


import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useExtensionNavigate } from './useExtensionNavigate';

export function useCurrentHomeSheet() {
  const { setCurrentHomeSheet, sheet } = useCurrentHomeSheetStore();
  const { selectedTransaction } = useSelectedTransactionStore();
  
  const navigate = useExtensionNavigate();

  const closeSheet = useCallback(() => {
    setCurrentHomeSheet('none');
    navigate(ROUTES.HOME);
  }, [navigate, setCurrentHomeSheet]);

  const currentHomeSheet = useMemo(() => {
    switch (sheet) {
      case 'cancel':
      case 'speedUp':
        return selectedTransaction ? (
          <SpeedUpAndCancelSheet
            currentSheet={sheet}
            onClose={closeSheet}
            transaction={selectedTransaction}
          />
        ) : null;
      default:
        return null;
    }
  }, [closeSheet, selectedTransaction, sheet]);

  const isDisplayingSheet = useMemo(() => sheet !== 'none', [sheet]);

  useKeyboardShortcut({
    condition: () => isDisplayingSheet,
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        closeSheet();
        e.preventDefault();
      }
    },
  });

  return {
    currentHomeSheet,
    isDisplayingSheet,
  };
}
