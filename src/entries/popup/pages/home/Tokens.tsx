/* eslint-disable no-nested-ternary */
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

// import { supportedCurrencies } from '~/core/references';
import { useTokens } from '~/core/resources/tokens/useTokens';
import { useCurrentAddressStore } from '~/core/state';
// import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { ParsedUserAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
// import { isCustomChain } from '~/core/utils/chains';
import { Box, Column, Columns } from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';

// import { Asterisks } from '../../components/Asterisks/Asterisks';
import { useExtensionNavigate } from '../../hooks/useExtensionNavigate';
import { useTokenPressMouseEvents } from '../../hooks/useTokenPressMouseEvents';
import { ROUTES } from '../../urls';

import { TokenContextMenu } from './TokenDetails/TokenContextMenu';

export const TokenRow = memo(function TokenRow({
  token,
  testId,
}: {
  token: ParsedUserAsset;
  testId: string;
}) {
  const navigate = useExtensionNavigate();
  const openDetails = () => {
    navigate(ROUTES.TOKEN_DETAILS(token.currency.address), {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });
  };

  const { onMouseDown, onMouseUp, onMouseLeave } = useTokenPressMouseEvents({
    token,
    onClick: openDetails,
  });
  return (
    <Box
      as={motion.div}
      whileTap={{ scale: 0.98 }}
      width="full"
      layoutScroll
      layout="position"
    >
      <TokenContextMenu token={token}>
        <Box
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <AssetRow asset={token} testId={testId} />
        </Box>
      </TokenContextMenu>
    </Box>
  );
});

export function Tokens() {
  const { currentAddress } = useCurrentAddressStore();
  const { tokens } = useTokens(currentAddress);

  return (
    <Box
      width="full"
      style={{
        // Prevent bottommost coin icon shadow from clipping
        overflow: 'visible',
      }}
      paddingBottom="16px"
      paddingTop="2px"
      marginTop="-14px"
    >
      <Box
        width="full"
        style={{
          position: 'relative',
        }}
      >
        <Box style={{ overflow: 'auto' }}>
          {tokens?.map((token: any, index: any) => {
            console.log(token);
            return (
              <Box
                key={`${index}`}
                as={motion.div}
                layoutId={`list-${index}`}
                // position="absolute"
                width="full"
              >
                <TokenRow token={token} testId={`coin-row-item-${index}`} />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

type AssetRowProps = {
  asset: ParsedUserAsset;
  testId?: string;
};

export const AssetRow = memo(function AssetRow({
  asset,
  testId,
}: AssetRowProps) {
  console.log({ asset })
  const name = asset?.currency?.name || asset?.currency?.symbol || truncateAddress(asset.currency?.address);
  const uniqueId = asset.currency?.address;
  // const { hideAssetBalances } = useHideAssetBalancesStore();
  // const { currentCurrency } = useCurrentCurrencyStore();

  // const priceChange = asset?.native?.price?.change;
  // const priceChangeDisplay = priceChange?.length ? priceChange : '-';
  // const priceChangeColor =
  //   priceChangeDisplay[0] !== '-' ? 'green' : 'labelTertiary';

  // const balanceDisplay = useMemo(
  //   () =>
  //     <TextOverflow color="labelTertiary" size="12pt" weight="semibold">
  //       {/* {updatePrecisionToDisplay(asset?.value)} */}
  //       {0.00}
  //     </TextOverflow>,
  //   [asset?.value],
  // );

  // const nativeBalanceDisplay = useMemo(
  //   () =>
  //     hideAssetBalances ? (
  //       <Inline alignHorizontal="right">
  //         <TextOverflow size="14pt" weight="semibold" align="right">
  //           {supportedCurrencies[currentCurrency].symbol}
  //         </TextOverflow>
  //         <Asterisks color="label" size={10} />
  //       </Inline>
  //     ) : isCustomChain(asset.chainId) &&
  //       asset?.native?.balance?.amount === '0' ? null : (
  //       <Text size="14pt" weight="semibold" align="right">
  //         {asset?.native?.balance?.display}
  //       </Text>
  //     ),
  //   [
  //     hideAssetBalances,
  //     currentCurrency,
  //     asset.chainId,
  //     asset?.native?.balance?.amount,
  //     asset?.native?.balance?.display,
  //   ],
  // );

  const topRow = useMemo(
    () => (
      <Columns>
        <Column>
          <Box paddingVertical="4px">
            <TextOverflow size="14pt" weight="semibold">
              {name}
            </TextOverflow>
          </Box>
        </Column>
        <Column>
          <Box paddingVertical="4px" testId={`asset-name-${uniqueId}`} display='flex' justifyContent='flex-end'>
            <TextOverflow color="labelTertiary" size="14pt" weight="semibold">
              {asset?.value.toFixed(2)}
            </TextOverflow>
          </Box>
        </Column>
      </Columns>
    ),
    [name],
  );

  const bottomRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">
            <TextOverflow size="10pt" weight="regular" align="left">
              {asset?.currency?.tokenType}
            </TextOverflow>
          </Box>
        </Column>
        {/* <Column width="content">
          <Box paddingVertical="4px">
            <Text
              color={priceChangeColor}
              size="12pt"
              weight="semibold"
              align="right"
            >
              {priceChangeDisplay}
            </Text>
          </Box>
        </Column> */}
      </Columns>
    ),
    [uniqueId],
  );

  return (
    <CoinRow
      testId={testId}
      asset={asset}
      topRow={topRow}
      bottomRow={bottomRow}
    />
  );
});

// type EmptyStateProps = {
//   depositAddress: Address;
// };

// function TokensEmptyState({ depositAddress }: EmptyStateProps) {
//   const { currentTheme } = useCurrentThemeStore();
//   const { testnetMode } = useTestnetModeStore();
//   const handleCoinbase = useCallback(async () => {
//     const { data } = await fetchProviderWidgetUrl({
//       provider: FiatProviderName.Coinbase,
//       depositAddress,
//       defaultExperience: 'send',
//     });
//     window.open(data.url, '_blank');
//   }, [depositAddress]);

//   return (
//     <Inset horizontal="20px">
//       <Stack space="12px">
//         {!testnetMode && (
//           <Box
//             background="surfaceSecondaryElevated"
//             borderRadius="16px"
//             boxShadow="12px"
//             cursor="pointer"
//             onClick={handleCoinbase}
//             style={{ overflow: 'hidden' }}
//           >
//             <Box
//               background={{ default: 'transparent', hover: 'fillQuaternary' }}
//               cursor="pointer"
//               height="full"
//               padding="16px"
//               width="full"
//             >
//               <Stack space="12px">
//                 <Inline alignVertical="center" alignHorizontal="justify">
//                   <Box>
//                     <Inline alignVertical="center" space="7px">
//                       <Box
//                         alignItems="center"
//                         display="flex"
//                         justifyContent="center"
//                         style={{ height: 12, width: 18 }}
//                       >
//                         <CoinbaseIcon showBackground />
//                       </Box>
//                       <Text
//                         as="p"
//                         cursor="pointer"
//                         size="14pt"
//                         color="label"
//                         weight="bold"
//                       >
//                         {i18n.t('tokens_tab.coinbase_title')}
//                       </Text>
//                     </Inline>
//                   </Box>
//                   <Symbol
//                     cursor="pointer"
//                     size={12}
//                     symbol="arrow.up.forward.circle"
//                     weight="semibold"
//                     color="labelTertiary"
//                   />
//                 </Inline>
//                 <Box alignItems="center" display="flex" style={{ height: 10 }}>
//                   <Text
//                     as="p"
//                     cursor="pointer"
//                     size="11pt"
//                     color="labelTertiary"
//                     weight="bold"
//                   >
//                     {i18n.t('tokens_tab.coinbase_description')}
//                   </Text>
//                 </Box>
//               </Stack>
//             </Box>
//           </Box>
//         )}

//         {!testnetMode && (
//           <Box
//             borderRadius="16px"
//             padding="16px"
//             style={{
//               boxShadow: `0 0 0 1px ${
//                 currentTheme === 'dark'
//                   ? 'rgba(245, 248, 255, 0.025)'
//                   : 'rgba(9, 17, 31, 0.03)'
//               } inset`,
//             }}
//           >
//             <Stack space="12px">
//               <Inline alignVertical="center" space="7px">
//                 <Box
//                   alignItems="center"
//                   display="flex"
//                   justifyContent="center"
//                   style={{ height: 12, width: 18 }}
//                 >
//                   <Symbol
//                     color="accent"
//                     size={16}
//                     symbol="creditcard.fill"
//                     weight="bold"
//                   />
//                 </Box>
//                 <Text as="p" size="14pt" color="label" weight="bold">
//                   {i18n.t('tokens_tab.buy_title')}
//                 </Text>
//               </Inline>
//               <Box alignItems="center" display="flex" style={{ height: 10 }}>
//                 <Text as="p" size="11pt" color="labelTertiary" weight="bold">
//                   {i18n.t('tokens_tab.buy_description_1')}
//                   <Box
//                     background="fillTertiary"
//                     as="span"
//                     borderWidth="1px"
//                     borderColor="separatorTertiary"
//                     boxShadow="1px"
//                     style={{
//                       display: 'inline-block',
//                       width: '16px',
//                       height: '14px',
//                       borderRadius: '4.5px',
//                       verticalAlign: 'middle',
//                       textAlign: 'center',
//                       lineHeight: '12px',
//                       marginLeft: '4px',
//                       marginRight: '4px',
//                     }}
//                   >
//                     {shortcuts.home.BUY.display}
//                   </Box>
//                   {i18n.t('tokens_tab.buy_description_2')}
//                 </Text>
//               </Box>
//             </Stack>
//           </Box>
//         )}

//         <Box
//           borderRadius="16px"
//           padding="16px"
//           style={{
//             boxShadow: `0 0 0 1px ${
//               currentTheme === 'dark'
//                 ? 'rgba(245, 248, 255, 0.025)'
//                 : 'rgba(9, 17, 31, 0.03)'
//             } inset`,
//           }}
//         >
//           <Stack space="12px">
//             <Inline alignVertical="center" space="7px">
//               <Box
//                 alignItems="center"
//                 display="flex"
//                 justifyContent="center"
//                 paddingLeft="2px"
//                 style={{ height: 12, width: 18 }}
//               >
//                 <Symbol
//                   color="accent"
//                   size={14.5}
//                   symbol="arrow.turn.right.down"
//                   weight="bold"
//                 />
//               </Box>
//               <Text as="p" size="14pt" color="label" weight="bold">
//                 {i18n.t('tokens_tab.send_from_wallet')}
//               </Text>
//             </Inline>
//             <Box alignItems="center" display="flex" style={{ height: 10 }}>
//               <Text as="p" size="11pt" color="labelTertiary" weight="bold">
//                 {i18n.t('tokens_tab.send_description_1')}
//                 <Box
//                   background="fillTertiary"
//                   as="span"
//                   borderWidth="1px"
//                   borderColor="separatorTertiary"
//                   boxShadow="1px"
//                   style={{
//                     display: 'inline-block',
//                     width: '16px',
//                     height: '14px',
//                     borderRadius: '4.5px',
//                     verticalAlign: 'middle',
//                     textAlign: 'center',
//                     lineHeight: '12px',
//                     marginLeft: '4px',
//                     marginRight: '4px',
//                   }}
//                 >
//                   {shortcuts.home.COPY_ADDRESS.display}
//                 </Box>
//                 {i18n.t('tokens_tab.send_description_2')}
//                 <Box
//                   background="fillTertiary"
//                   as="span"
//                   borderWidth="1px"
//                   borderColor="separatorTertiary"
//                   boxShadow="1px"
//                   style={{
//                     display: 'inline-block',
//                     width: '16px',
//                     height: '14px',
//                     borderRadius: '4.5px',
//                     verticalAlign: 'middle',
//                     textAlign: 'center',
//                     lineHeight: '12px',
//                     marginLeft: '4px',
//                     marginRight: '4px',
//                   }}
//                 >
//                   {shortcuts.home.GO_TO_QR.display}
//                 </Box>
//                 {i18n.t('tokens_tab.send_description_3')}
//               </Text>
//             </Box>
//           </Stack>
//         </Box>
//       </Stack>
//     </Inset>
//   );
// }
