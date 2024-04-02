import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { usePendingRequestStore } from '~/core/state';
import { useWalletBackupsStore } from '~/core/state/walletBackups';
import { Box, Stack, Text } from '~/design-system';

import { LogoWithLetters } from '../../components/LogoWithLetters/LogoWithLetters';

import { ImportOrCreateWallet } from './ImportOrCreateWallet';
import { OnboardBeforeConnectSheet } from './OnboardBeforeConnectSheet';

export function Welcome() {
  const { pendingRequests } = usePendingRequestStore();
  const [showOnboardBeforeConnectSheet, setShowOnboardBeforeConnectSheet] =
    useState(!!pendingRequests.length);
  const headerControls = useAnimationControls();
  const { setNeedsInitialization } = useWalletBackupsStore();

  useEffect(() => {
    setNeedsInitialization(false);
  }, [setNeedsInitialization]);

  return (
    <>
      <OnboardBeforeConnectSheet
        show={showOnboardBeforeConnectSheet}
        onClick={() => setShowOnboardBeforeConnectSheet(false)}
      />
      <Box
        as={motion.div}
        initial={{ marginTop: 88, marginBottom: 88 }}
        animate={headerControls}
      >
        <Stack space="4px">
          <Box width="full" display="flex" justifyContent="center">
            <LogoWithLetters color="label" />
          </Box>
          <Box as={motion.div} initial={{ marginTop: 50 }}>
            <Box
              width="full"
              justifyContent="center"
              alignItems="center"
              display="flex"
              style={{ marginBottom: '10px' }}
            >
              <Text
                align="center"
                color="labelTertiary"
                size="16pt"
                weight="bold"
              >
                {i18n.t('welcome.subtitle_1')}
              </Text>
            </Box>
            <Box
              width="full"
              justifyContent="center"
              alignItems="center"
              display="flex"
            >
              <Text
                align="center"
                color="labelTertiary"
                size="16pt"
                weight="bold"
              >
                {i18n.t('welcome.subtitle_2')}
              </Text>
            </Box>
          </Box>
        </Stack>
      </Box>
      <AnimatePresence mode="popLayout" initial={false}>
        <Box key="welcome" width="full">
          <ImportOrCreateWallet />
        </Box>
      </AnimatePresence>
    </>
  );
}
