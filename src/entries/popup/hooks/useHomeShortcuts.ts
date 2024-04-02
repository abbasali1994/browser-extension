import { useCallback, useMemo } from 'react';
import { useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useSelectedNftStore } from '~/core/state/selectedNft';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { truncateAddress } from '~/core/utils/address';
import { getProfileUrl, goToNewTab } from '~/core/utils/tabs';
import { triggerAlert } from '~/design-system/components/Alert/Alert';

import { triggerToast } from '../components/Toast/Toast';
import * as wallet from '../handlers/wallet';
import { ROUTES } from '../urls';
import {
  appConnectionMenuIsActive,
  appConnectionSwitchWalletsPromptIsActive,
  getInputIsFocused,
} from '../utils/activeElement';
import {
  clickHeaderLeft,
  clickHeaderRight,
  clickTabBar,
} from '../utils/clickHeader';

import { useActiveTab } from './useActiveTab';
import { useAppSession } from './useAppSession';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useNavigateToSwaps } from './useNavigateToSwaps';
import { useRainbowNavigate } from './useRainbowNavigate';
import { useWallets } from './useWallets';

export function useHomeShortcuts() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: ensName } = useEnsName({ address });
  const { selectedToken } = useSelectedTokenStore();
  const { selectedTransaction } = useSelectedTransactionStore();
  const { sheet } = useCurrentHomeSheetStore();
  
  const navigateToSwaps = useNavigateToSwaps();
  const { url } = useActiveTab();
  const { data: dappMetadata } = useDappMetadata({ url });
  const { disconnectSession } = useAppSession({ host: dappMetadata?.appHost });
  const { featureFlags } = useFeatureFlagsStore();
  const { isWatchingWallet } = useWallets();
  const { testnetMode, setTestnetMode } = useTestnetModeStore();
  const { developerToolsEnabled } = useDeveloperToolsEnabledStore();
  const { selectedNft } = useSelectedNftStore();

  const allowSend = useMemo(
    () => !isWatchingWallet || featureFlags.full_watching_wallets,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  const alertWatchingWallet = useCallback(() => {
    triggerAlert({ text: i18n.t('alert.wallet_watching_mode') });
  }, []);

  const getHomeShortcutsAreActive = useCallback(() => {
    return sheet === 'none' && !selectedTransaction && !selectedToken;
  }, [sheet, selectedToken, selectedTransaction]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(address as string);
    triggerToast({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(address),
    });
  }, [address]);

  const disconnectFromApp = useCallback(() => {
    disconnectSession({
      address: address,
      host: dappMetadata?.appHost || '',
    });
  }, [dappMetadata?.appHost, address, disconnectSession]);

  const openProfile = useCallback(
    () =>
      goToNewTab({
        url: getProfileUrl(ensName ?? address),
      }),
    [address, ensName],
  );

  const handleTestnetMode = useCallback(() => {
    if (developerToolsEnabled || testnetMode) {
      setTestnetMode(!testnetMode);
    }
  }, [setTestnetMode, testnetMode, developerToolsEnabled]);

  const navigate = useRainbowNavigate();
  const handleHomeShortcuts = useCallback(
    (e: KeyboardEvent) => {
      const activeAppConnectionMenu = appConnectionMenuIsActive();
      const activeAppWalletSwitcher =
        appConnectionSwitchWalletsPromptIsActive();
      const inputIsFocused = getInputIsFocused();
      if (inputIsFocused) return;
      switch (e.key) {
        case shortcuts.home.BUY.key:
          navigate(ROUTES.BUY);
          break;
        case shortcuts.home.COPY_ADDRESS.key:
          if (!selectedNft && !selectedToken) {
            handleCopy();
          }
          break;
        case shortcuts.home.GO_TO_CONNECTED_APPS.key:
          
          navigate(ROUTES.CONNECTED);
          break;
        case shortcuts.home.GO_TO_SEND.key:
          
          if (allowSend) {
            navigate(ROUTES.SEND);
          } else {
            alertWatchingWallet();
          }
          break;
        case shortcuts.home.GO_TO_SETTINGS.key:
          
          navigate(ROUTES.SETTINGS);
          break;
        case shortcuts.home.GO_TO_SWAP.key:
         
          navigateToSwaps();
          break;
        case shortcuts.home.GO_TO_PROFILE.key:
          if (!selectedToken) {
           
            openProfile();
          }
          break;
        case shortcuts.home.GO_TO_WALLETS.key:
          if (!activeAppConnectionMenu) {
           
            navigate(ROUTES.WALLET_SWITCHER);
          }
          break;
        case shortcuts.home.GO_TO_QR.key:
          
          navigate(ROUTES.QR_CODE);
          break;
        case shortcuts.home.LOCK.key:
         
          wallet.lock();
          break;
        case shortcuts.home.TESTNET_MODE.key:
          
          // in order to close dropdown menus
          clickTabBar();
          handleTestnetMode();
          break;
        case shortcuts.home.OPEN_MORE_MENU.key:
          if (!activeAppWalletSwitcher) {
           
            clickHeaderRight();
          }
          break;
        case shortcuts.home.OPEN_APP_CONNECTION_MENU.key:
          if (!activeAppConnectionMenu && !activeAppWalletSwitcher) {
            
            clickHeaderLeft();
          }
          break;
        case shortcuts.home.DISCONNECT_APP.key:
          if (!activeAppConnectionMenu) {
           
            disconnectFromApp();
          }
          break;
      }
    },
    [
      navigate,
      selectedNft,
      selectedToken,
      allowSend,
      navigateToSwaps,
      handleTestnetMode,
      handleCopy,
      alertWatchingWallet,
      openProfile,
      disconnectFromApp,
    ],
  );
  useKeyboardShortcut({
    condition: getHomeShortcutsAreActive,
    handler: handleHomeShortcuts,
  });
}
