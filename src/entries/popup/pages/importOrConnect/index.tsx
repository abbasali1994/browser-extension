/* eslint-disable no-nested-ternary */
import { useCallback, useEffect } from 'react';
import { NavigateOptions } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { Box, Separator, Stack, Text } from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';
import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { useExtensionNavigate } from '../../hooks/useExtensionNavigate';
import { ROUTES } from '../../urls';

export function ImportOrConnect() {
  const navigate = useExtensionNavigate();

  const navigateTo = useCallback(
    (route: string, options?: NavigateOptions) => {
      navigate(route, options);
    },
    [navigate],
  );

  const onImportWalletClick = useCallback(
    () => navigateTo(ROUTES.IMPORT),
    [navigateTo],
  );

  useEffect(() => {
    // clear secrets if the user backs out of flow entirely
    removeImportWalletSecrets();
  }, []);

  return (
    <FullScreenContainer>
      <Stack space="24px" alignHorizontal="center">
        <Box alignItems="center">
          <Stack space="12px">
            <Text size="16pt" weight="bold" color="label" align="center">
              {i18n.t('import_or_connect.title')}
            </Text>
            <Box paddingHorizontal="15px">
              <Text
                size="12pt"
                weight="regular"
                color="labelTertiary"
                align="center"
              >
                {i18n.t('import_or_connect.explanation')}
              </Text>
            </Box>
          </Stack>
        </Box>
        <Box alignItems="center" width="full" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
        <Box>
          <OnboardMenu>
            <OnboardMenu.Item
              first
              onClick={onImportWalletClick}
              title={i18n.t('import_or_connect.import_wallet')}
              subtitle={i18n.t('import_or_connect.import_wallet_description')}
              symbol="lock.rotation"
              symbolColor="purple"
              testId="import-wallet-option"
            />
          </OnboardMenu>
        </Box>
      </Stack>
    </FullScreenContainer>
  );
}
