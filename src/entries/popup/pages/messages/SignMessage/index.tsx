import { useCallback, useEffect, useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { Bleed, Box, Stack } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { showLedgerDisconnectedAlertIfNeeded } from '~/entries/popup/handlers/ledger';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { PortalError, logger } from '~/logger';

import * as wallet from '../../../handlers/wallet';
import { AccountSigningWith } from '../AccountSigningWith';

import { SignMessageActions } from './SignMessageActions';
import { SignMessageInfo } from './SignMessageInfo';

interface ApproveRequestProps {
  approveRequest: (payload: unknown) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export function SignMessage({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const [loading, setLoading] = useState(false);
  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });
  const { featureFlags } = useFeatureFlagsStore();
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });
  const { watchedWallets } = useWallets();

  const selectedWallet = activeSession?.address;

  const onAcceptRequest = useCallback(async () => {
    const requestPayload = getSigningRequestDisplayDetails(request);
    if (!requestPayload.msgData || !requestPayload.address || !selectedWallet)
      return;
    const { type } = await wallet.getWallet(selectedWallet);
    const result = null;

    setLoading(true);
    try {
      // Change the label while we wait for confirmation
      if (type === 'HardwareWalletKeychain') {
        setWaitingForDevice(true);
      }
      approveRequest(result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showLedgerDisconnectedAlertIfNeeded(e);
      logger.info('error in sign message');
      logger.error(new PortalError(e.name), { message: e.message });
    } finally {
      setWaitingForDevice(false);
      setLoading(false);
    }
  }, [approveRequest, request, selectedWallet]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
  }, [rejectRequest]);

  const isWatchingWallet = useMemo(() => {
    const watchedAddresses = watchedWallets?.map(({ address }) => address);
    return selectedWallet && watchedAddresses?.includes(selectedWallet);
  }, [selectedWallet, watchedWallets]);

  useEffect(() => {
    if (!featureFlags.full_watching_wallets && isWatchingWallet) {
      triggerAlert({
        text: i18n.t('alert.wallet_watching_mode'),
        callback: rejectRequest,
      });
    }
  }, [featureFlags.full_watching_wallets, isWatchingWallet, rejectRequest]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: POPUP_DIMENSIONS.height, overflow: 'hidden' }}
    >
      <SignMessageInfo request={request} />
      <Stack space="20px" padding="20px">
        <Bleed vertical="4px">
          <AccountSigningWith session={activeSession} noFee />
        </Bleed>
        <SignMessageActions
          waitingForDevice={waitingForDevice}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading}
          dappStatus={dappMetadata?.status}
        />
      </Stack>
    </Box>
  );
}
