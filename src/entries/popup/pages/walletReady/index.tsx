import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { i18n } from '~/core/languages';
import { Box, Symbol, Text } from '~/design-system';

import { useBrowser } from '../../hooks/useBrowser';

const userSettingsPlaceholder = {} as chrome.action.UserSettings;
const useChromeUserSettings = () => {
  const settings = useQuery(['chrome.action.getUserSettings'], () =>
    chrome.action.getUserSettings(),
  );
  return settings.data || userSettingsPlaceholder;
};

const PinToToolbar = () => {
  const { isOnToolbar } = useChromeUserSettings();
  const { isBrave, isArc, isDetected } = useBrowser();

  if (!isDetected || isOnToolbar) return null;
  return (
    <Box
      as={motion.div}
      initial={isArc ? { right: -152 } : { top: -50 }}
      animate={isArc ? { right: 40 } : { top: 0 }}
      transition={{ duration: 0.1, delay: 0.2 }}
      position="fixed"
      borderRadius="16px"
      style={{
        ...(isArc
          ? { top: '8px', left: '8px' }
          : {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            right: isBrave ? '144px' : '104px',
            top: '0',
          }),
        maxWidth: '152px',
      }}
      paddingHorizontal="12px"
      paddingVertical="16px"
      display="flex"
      flexDirection={isArc ? 'row-reverse' : 'row'}
      gap="12px"
      background="surfacePrimaryElevated"
      borderColor="buttonStrokeSecondary"
      boxShadow="18px surfacePrimaryElevated"
    >
      <Text size="14pt" weight="bold">
        {i18n.t('wallet_ready.pin_rainbow_to_your_toolbar')}
      </Text>
      <Symbol
        symbol={isArc ? 'arrow.left' : 'arrow.up'}
        color="purple"
        size={14}
        weight="bold"
      />
    </Box>
  );
};

export function WalletReady() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="8px"
      paddingTop="60px"
      paddingBottom="20px"
      position="relative"
      style={{
        minHeight: '600px',
      }}
    >
      <Text size="26pt" weight="bold" color="label" align="center">
        {i18n.t('wallet_ready.title')}
      </Text>
      <Box padding="16px" paddingTop="10px" style={{ width: '264px' }}>
        <Text size="12pt" weight="regular" color="labelTertiary" align="center">
          {i18n.t('wallet_ready.subtitle')}
        </Text>
      </Box>
      <PinToToolbar />
    </Box>
  );
}
