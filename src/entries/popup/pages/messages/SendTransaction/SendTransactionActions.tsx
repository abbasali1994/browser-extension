import { DAppStatus } from '~/core/config';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { ActiveSession } from '~/core/state/appSessions';
import { Inline } from '~/design-system';
import { useApproveAppRequestValidations } from '~/entries/popup/hooks/approveAppRequest/useApproveAppRequestValidations';

import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

import { AcceptRequestButton, RejectRequestButton } from '../BottomActions';

export const SendTransactionActions = ({
  session,
  onAcceptRequest,
  onRejectRequest,
  waitingForDevice,
  loading = false,
  dappStatus,
}: {
  session: ActiveSession;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  waitingForDevice: boolean;
  loading: boolean;
  dappStatus?: DAppStatus;
}) => {
  const { enoughNativeAssetForGas, buttonLabel } =
    useApproveAppRequestValidations({ session, dappStatus });

  
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.transaction_request.CANCEL.key) {
       
        e.preventDefault();
        onRejectRequest();
      }
    },
  });

  return (
    <Inline space="12px" wrap={false}>
      <RejectRequestButton
        onClick={onRejectRequest}
        label={i18n.t('common_actions.cancel')}
        dappStatus={dappStatus}
      />
      {enoughNativeAssetForGas && (
        <AcceptRequestButton
          onClick={onAcceptRequest}
          label={buttonLabel}
          waitingForDevice={waitingForDevice}
          loading={loading}
          dappStatus={dappStatus}
        />
      )}
    </Inline>
  );
};
