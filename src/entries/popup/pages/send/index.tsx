import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { useAnimationControls } from 'framer-motion';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address } from 'wagmi';

import { config } from '~/core/config';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useFlashbotsEnabledStore, useGasStore, useCurrentAddressStore } from '~/core/state';
import { useContactsStore } from '~/core/state/contacts';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import {
  computeUniqueIdForHiddenAsset,
  useHiddenAssetStore,
} from '~/core/state/hiddenAssets/hiddenAssets';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { useTokens } from '~/core/resources/tokens/useTokens';
import { AddressOrEth, ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { chainIdToUse } from '~/core/utils/chains';
import { addNewTransaction } from '~/core/utils/transactions';
import { Box, Button, Inline, Row, Rows, Symbol, Text } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { AccentColorProvider } from '~/design-system/components/Box/ColorContext';
import { PortalError, logger } from '~/logger';

import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '../../components/ExplainerSheet/ExplainerSheet';
import { Navbar } from '../../components/Navbar/Navbar';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { isLedgerConnectionError } from '../../handlers/ledger';
import { getWallet, sendTransaction } from '../../handlers/wallet';
import { useSendAsset } from '../../hooks/send/useSendAsset';
import { useSendInputs } from '../../hooks/send/useSendInputs';
import { useSendState } from '../../hooks/send/useSendState';
import { useSendValidations } from '../../hooks/send/useSendValidations';
import { useExtensionNavigate } from '../../hooks/useExtensionNavigate';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import usePrevious from '../../hooks/usePrevious';
import { useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';
import { clickHeaderRight } from '../../utils/clickHeader';

import { ContactAction, ContactPrompt } from './ContactPrompt';
import { NavbarContactButton } from './NavbarContactButton';
import { ReviewSheet } from './ReviewSheet';
import { SendTokenInput } from './SendTokenInput';
import { ToAddressInput } from './ToAddressInput';
import { ValueInput } from './ValueInput';

interface ChildInputAPI {
  blur: () => void;
  focus: () => void;
  isFocused?: () => boolean;
}

export function Send() {
  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [contactSaveAction, setSaveContactAction] = useState<{
    show: boolean;
    action: ContactAction;
  }>({ show: false, action: 'save' });
  const [toAddressDropdownOpen, setToAddressDropdownOpen] = useState(false);

  const navigate = useExtensionNavigate();

  const { isContact } = useContactsStore();
  const { allWallets } = useWallets();
  const { hiddenAssets } = useHiddenAssetStore();

  const isHidden = useCallback(
    (asset: ParsedUserAsset) =>
      hiddenAssets.some(
        (uniqueId) => uniqueId === computeUniqueIdForHiddenAsset(asset),
      ),
    [hiddenAssets],
  );

  const isMyWallet = (address: Address) =>
    allWallets?.some((w) => w.address === address);

  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore();

  const {
    asset,
    selectAssetAddressAndChain,
    assets,
    setSortMethod,
    sortMethod,
  } = useSendAsset();

  const unhiddenAssets = useMemo(
    () => assets.filter((asset) => !isHidden(asset)),
    [assets, isHidden],
  );

  const { clearCustomGasModified, selectedGas } = useGasStore();

  const { selectedToken, setSelectedToken } = useSelectedTokenStore();

  const toAddressInputRef = useRef<ChildInputAPI>(null);
  const sendTokenInputRef = useRef<ChildInputAPI>(null);
  const valueInputRef = useRef<ChildInputAPI>(null);

  const {
    assetAmount,
    rawMaxAssetBalanceAmount,
    independentAmount,
    independentField,
    independentFieldRef,
    dependentAmountDisplay,
    independentAmountDisplay,
    setIndependentAmount,
    switchIndependentField,
    setMaxAssetAmount,
  } = useSendInputs({ asset, selectedGas });

  const {
    currentCurrency,
    maxAssetBalanceParams,
    chainId,
    data,
    fromAddress,
    toAddress,
    toAddressOrName,
    toEnsName,
    txToAddress,
    value,
    setToAddressOrName,
  } = useSendState({ assetAmount, rawMaxAssetBalanceAmount, asset });

  const {
    buttonLabel,
    isValidToAddress,
    readyForReview,
    validateToAddress,
    toAddressIsSmartContract,
  } = useSendValidations({
    asset,
    assetAmount,

    selectedGas,
    toAddress,
    toAddressOrName,
  });

  const controls = useAnimationControls();
  const transactionRequestForGas: TransactionRequest = useMemo(() => {
    return {
      to: txToAddress,
      from: fromAddress,
      value,
      chainId,
      data,
      ...maxAssetBalanceParams,
    };
  }, [txToAddress, fromAddress, value, chainId, data, maxAssetBalanceParams]);

  const handleToAddressChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setToAddressOrName(e.target.value);
    },
    [setToAddressOrName],
  );

  const clearToAddress = useCallback(
    () => setToAddressOrName(''),
    [setToAddressOrName],
  );

  const openReviewSheet = useCallback(() => {
    if (readyForReview) {
      setShowReviewSheet(true);
    } else {
      controls.start({
        rotate: [1, -1.4, 0, 1, -1.4, 0],
        transition: { duration: 0.2 },
      });
      independentFieldRef?.current?.focus();
    }
  }, [readyForReview, controls, independentFieldRef]);

  const closeReviewSheet = useCallback(() => setShowReviewSheet(false), []);

  const {
    sendAddress,
    sendAmount,
    sendField,
    sendTokenAddressAndChain,
    resetSendValues,
    saveSendTokenAddressAndChain,
  } = usePopupInstanceStore();

  const activeChainId = chainIdToUse(
    connectedToHardhat,
    connectedToHardhatOp,
    chainId,
  );

  const { flashbotsEnabled } = useFlashbotsEnabledStore();
  const flashbotsEnabledGlobally =
    config.flashbots_enabled &&
    flashbotsEnabled &&
    asset?.chainId === ChainId.mainnet;

  const buildPendingTransaction = useCallback(
    (result: TransactionResponse) => {
      return {
        changes: [
          {
            direction: 'out',
            asset,
            value: assetAmount,
          },
        ],
        asset: asset,
        data: result.data,
        flashbots: flashbotsEnabledGlobally,
        value: result.value.toString(),
        from: fromAddress,
        to: txToAddress,
        hash: result.hash as TxHash,
        chainId,
        status: 'pending',
        type: 'send',
        nonce: result.nonce,
        gasPrice: (
          selectedGas.transactionGasParams as TransactionLegacyGasParams
        )?.gasPrice,
        maxFeePerGas: (selectedGas.transactionGasParams as TransactionGasParams)
          ?.maxFeePerGas,
        maxPriorityFeePerGas: (
          selectedGas.transactionGasParams as TransactionGasParams
        )?.maxPriorityFeePerGas,
      } as NewTransaction;
    },
    [
      asset,
      assetAmount,
      chainId,
      flashbotsEnabledGlobally,
      fromAddress,
      selectedGas.transactionGasParams,
      txToAddress,
    ],
  );

  const handleSend = useCallback(
    async (callback?: () => void) => {
      if (!config.send_enabled) return;

      try {
        if (asset) {
          const { type } = await getWallet(fromAddress);
          // Change the label while we wait for confirmation
          if (type === 'HardwareWalletKeychain') {
            setWaitingForDevice(true);
          }
          resetSendValues();
          const result = await sendTransaction({
            from: fromAddress,
            to: txToAddress,
            value,
            chainId: activeChainId,
            data,
          });
          if (result && asset) {
            const transaction: NewTransaction = buildPendingTransaction(result);
            addNewTransaction({
              address: fromAddress,
              chainId,
              transaction,
            });
            callback?.();
            navigate(ROUTES.HOME, {
              state: { tab: 'activity' },
            });
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!isLedgerConnectionError(e)) {
          const extractedError = (e as Error).message.split('[')[0];
          triggerAlert({
            text: i18n.t('errors.sending_transaction'),
            description: extractedError,
          });
        }
        logger.error(new PortalError('send: error executing send'), {
          message: (e as Error)?.message,
        });
      } finally {
        setWaitingForDevice(false);
      }
    },
    [
      fromAddress,
      resetSendValues,
      txToAddress,
      value,
      activeChainId,
      data,
      asset,
      buildPendingTransaction,
      chainId,
      navigate,
    ],
  );

  const selectAsset = useCallback(
    (address: AddressOrEth | '', chainId: ChainId) => {
      selectAssetAddressAndChain(address, chainId);
      saveSendTokenAddressAndChain({
        address,
        chainId,
      });
      setIndependentAmount('');
      setTimeout(() => {
        valueInputRef?.current?.focus();
      }, 300);
    },
    [
      saveSendTokenAddressAndChain,
      selectAssetAddressAndChain,
      setIndependentAmount,
    ],
  );

  useEffect(() => {
    return () => {
      clearCustomGasModified();
    };
  }, [clearCustomGasModified]);

  const { explainerSheetParams, showExplainerSheet, hideExplainerSheet } =
    useExplainerSheetParams();

  const showToContractExplainer = useCallback(() => {
    showExplainerSheet({
      show: true,
      title: i18n.t('explainers.send.to_smart_contract.title'),
      description: [
        i18n.t('explainers.send.to_smart_contract.description_1'),
        i18n.t('explainers.send.to_smart_contract.description_2'),
        i18n.t('explainers.send.to_smart_contract.description_3'),
      ],
      actionButton: {
        label: i18n.t('explainers.send.action_label'),
        variant: 'tinted',
        labelColor: 'blue',
        action: hideExplainerSheet,
      },
      header: { emoji: '✋' },
    });
  }, [hideExplainerSheet, showExplainerSheet]);

  useEffect(() => {
    // navigating from token row
    if (selectedToken) {
      selectAsset(selectedToken.address, selectedToken.chainId);
      // clear selected token
      setSelectedToken();
    } else if (sendTokenAddressAndChain) {
      selectAsset(
        sendTokenAddressAndChain.address,
        sendTokenAddressAndChain.chainId,
      );
    }

    if (sendAddress && sendAddress.length) {
      setToAddressOrName(sendAddress);
    }
    if (sendField !== independentField) {
      switchIndependentField();
    }
    if (sendAmount) {
      setIndependentAmount(sendAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevToAddressIsSmartContract = usePrevious(toAddressIsSmartContract);
  useEffect(() => {
    if (
      !prevToAddressIsSmartContract &&
      toAddressIsSmartContract &&
      !toEnsName?.includes('argent.xyz')
    ) {
      showToContractExplainer();
    }
  }, [
    prevToAddressIsSmartContract,
    showToContractExplainer,
    toAddressIsSmartContract,
    toEnsName,
  ]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === shortcuts.send.FOCUS_TO_ADDRESS.key) {
          toAddressInputRef?.current?.focus();
          sendTokenInputRef?.current?.blur();
        }
        if (e.key === shortcuts.send.FOCUS_ASSET.key) {
          toAddressInputRef?.current?.blur();
          sendTokenInputRef.current?.focus();
        }
      } else {
        if (!toAddressInputRef.current?.isFocused?.()) {
          if (e.key === shortcuts.send.SET_MAX_AMOUNT.key) {
            setMaxAssetAmount();
          }
          if (e.key === shortcuts.send.SWITCH_CURRENCY_LABEL.key) {
            switchIndependentField();
          }
        }
        if (
          e.key === shortcuts.send.OPEN_CONTACT_MENU.key &&
          !valueInputRef.current?.isFocused?.()
        ) {
          clickHeaderRight();
        }
      }
    },
  });

  const assetAccentColor = asset?.colors?.primary || asset?.colors?.fallback;

  const { currentAddress } = useCurrentAddressStore();
  const { tokens } = useTokens(currentAddress);

  return (
    <>
      <ExplainerSheet
        show={explainerSheetParams.show}
        header={explainerSheetParams.header}
        title={explainerSheetParams.title}
        description={explainerSheetParams.description}
        actionButton={explainerSheetParams.actionButton}
      />
      {toAddress && (
        <>
          <ContactPrompt
            address={toAddress}
            show={contactSaveAction?.show}
            action={contactSaveAction?.action}
            onSaveContactAction={setSaveContactAction}
            handleClose={() =>
              setSaveContactAction({ show: false, action: 'save' })
            }
          />
          <AccentColorProvider color={assetAccentColor}>
            <ReviewSheet
              show={showReviewSheet}
              onCancel={closeReviewSheet}
              onSend={handleSend}
              toAddress={toAddress}
              asset={asset}
              primaryAmountDisplay={independentAmountDisplay.display}
              secondaryAmountDisplay={dependentAmountDisplay.display}
              onSaveContactAction={setSaveContactAction}
              waitingForDevice={waitingForDevice}
            />
          </AccentColorProvider>
        </>
      )}
      <Navbar
        title={i18n.t('send.title')}
        background={'surfaceSecondary'}
        leftComponent={<Navbar.CloseButton />}
        rightComponent={
          !toAddress || isMyWallet(toAddress) ? undefined : (
            <CursorTooltip
              align="end"
              arrowAlignment="right"
              arrowCentered
              text={i18n.t('tooltip.save_to_contacts')}
              textWeight="bold"
              textSize="12pt"
              textColor="labelSecondary"
              arrowDirection={'up'}
            >
              <NavbarContactButton
                onSaveAction={setSaveContactAction}
                toAddress={toAddress}
                action={isContact({ address: toAddress }) ? 'edit' : 'save'}
                enabled={!!toAddress}
                chainId={asset?.chainId}
              />
            </CursorTooltip>
          )
        }
      />
      <Box
        background="surfaceSecondary"
        style={{ height: 535 }}
        paddingBottom="20px"
        paddingHorizontal="12px"
      >
        <Rows space="8px" alignVertical="top">
          <Rows space="8px" alignVertical="top">
            <Row height="content">
              <ToAddressInput
                toAddress={toAddress}
                toEnsName={toEnsName}
                toAddressOrName={toAddressOrName}
                clearToAddress={clearToAddress}
                handleToAddressChange={handleToAddressChange}
                setToAddressOrName={setToAddressOrName}
                onDropdownOpen={setToAddressDropdownOpen}
                validateToAddress={validateToAddress}
                ref={toAddressInputRef}
              />
            </Row>

            <Row height="content">
              <AccentColorProvider color={assetAccentColor}>
                <Box
                  background="surfaceSecondaryElevated"
                  borderRadius="24px"
                  width="full"
                >
                  <SendTokenInput
                    asset={asset}
                    assets={tokens}
                    selectAssetAddressAndChain={selectAsset}
                    dropdownClosed={toAddressDropdownOpen}
                    setSortMethod={setSortMethod}
                    sortMethod={sortMethod}
                    ref={sendTokenInputRef}
                  />
                  {asset ? (
                    <ValueInput
                      asset={asset}
                      currentCurrency={currentCurrency}
                      dependentAmount={dependentAmountDisplay}
                      independentAmount={independentAmount}
                      independentField={independentField}
                      independentFieldRef={independentFieldRef}
                      setIndependentAmount={setIndependentAmount}
                      setMaxAssetAmount={setMaxAssetAmount}
                      switchIndependentField={switchIndependentField}
                      inputAnimationControls={controls}
                      ref={valueInputRef}
                    />
                  ) : null}
                </Box>
              </AccentColorProvider>
            </Row>
          </Rows>
          <Row height="content">
            {isValidToAddress && !!asset ? (
              <AccentColorProvider color={assetAccentColor}>
                <Box paddingHorizontal="8px">
                  <Rows space="20px">
                    <Row>
                      <TransactionFee
                        chainId={chainId}
                        transactionRequest={transactionRequestForGas}
                        accentColor={assetAccentColor}
                        flashbotsEnabled={flashbotsEnabledGlobally}
                      />
                    </Row>
                    <Row>
                      <Button
                        onClick={openReviewSheet}
                        height="44px"
                        variant="flat"
                        color="accent"
                        width="full"
                        testId="send-review-button"
                        tabIndex={0}
                      >
                        <Inline space="8px" alignVertical="center">
                          {readyForReview && (
                            <Symbol
                              symbol="doc.text.magnifyingglass"
                              weight="bold"
                              size={16}
                            />
                          )}
                          <Text color="label" size="16pt" weight="bold">
                            {buttonLabel}
                          </Text>
                        </Inline>
                      </Button>
                    </Row>
                  </Rows>
                </Box>
              </AccentColorProvider>
            ) : (
              <Box paddingHorizontal="8px">
                <Button
                  height="44px"
                  variant="flat"
                  color="surfaceSecondary"
                  width="full"
                  disabled
                >
                  <Text color="labelQuaternary" size="14pt" weight="bold">
                    {buttonLabel}
                  </Text>
                </Button>
              </Box>
            )}
          </Row>
        </Rows>
      </Box>
    </>
  );
}
