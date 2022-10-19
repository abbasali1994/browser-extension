import React from 'react';
import { chain, useAccount, useBalance } from 'wagmi';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { Storage } from '~/core/storage';
import { Box, Text, Inset, Stack } from '~/design-system';
import { InjectToggle } from '../../components/InjectToggle';

export function Default() {
  const { address } = useAccount();
  const { data: mainnetBalance } = useBalance({
    addressOrName: address,
    chainId: chain.mainnet.id,
  });
  const { data: polygonBalance } = useBalance({
    addressOrName: address,
    chainId: chain.polygon.id,
  });
  const { data: firstTransactionTimestamp } = useFirstTransactionTimestamp({
    address,
  });

  return (
    <Inset space="20px">
      <Stack space="24px">
        <Text as="h1" size="20pt" weight="bold">
          Rainbow Rocks!!!
        </Text>
        <Stack space="16px">
          <Text size="17pt" weight="bold" color="labelSecondary">
            Mainnet Balance: {mainnetBalance?.formatted}
          </Text>
          <Text size="17pt" weight="bold" color="labelSecondary">
            Polygon Balance: {polygonBalance?.formatted}
          </Text>
          {firstTransactionTimestamp && (
            <Text size="17pt" weight="bold" color="labelTertiary">
              First transaction on:{' '}
              {new Date(firstTransactionTimestamp).toString()}
            </Text>
          )}
        </Stack>
        <InjectToggle />
        <Box
          as="button"
          background="surfaceSecondary"
          onClick={Storage.clear}
          padding="16px"
          style={{ borderRadius: 999 }}
        >
          <Text color="labelSecondary" size="15pt" weight="bold">
            CLEAR STORAGE
          </Text>
        </Box>
      </Stack>
    </Inset>
  );
}