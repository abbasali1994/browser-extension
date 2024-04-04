import { useCallback, useState } from 'react';
import { Chain } from 'wagmi';

import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useRainbowChainsStore } from '~/core/state';
import { useUserChainsStore } from '~/core/state/userChains';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { Row, Rows, Separator } from '~/design-system';
import { PortalError, logger } from '~/logger';

import { AddEthereumChainActions } from './AddEthereumChainActions';
import { AddEthereumChainInfo } from './AddEthereumChainInfo';

interface ApproveRequestProps {
  approveRequest: (response: boolean) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export const AddEthereumChain = ({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) => {
  const [loading, setLoading] = useState(false);
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });

  const {
    chainId,
    rpcUrls: [rpcUrl],
    chainName,
    nativeCurrency: { symbol, name, decimals },
    blockExplorerUrls: [blockExplorerUrl],
  } = request.params?.[0] as {
    chainId: string;
    rpcUrls: string[];
    chainName: string;
    iconUrls: string[];
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrls: string[];
  };

  const [testnet, setTestnet] = useState(
    chainName.toLowerCase().includes('testnet'),
  );

  const { addCustomRPC } = useRainbowChainsStore();
  const { addUserChain } = useUserChainsStore();

  const onAcceptRequest = useCallback(() => {
    try {
      setLoading(true);

      const chain: Chain = {
        id: Number(chainId),
        name: chainName || name,
        network: chainName || name,
        nativeCurrency: {
          symbol,
          decimals: 18,
          name: name || symbol,
        },
        rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } },
        testnet,
      };
      addCustomRPC({
        chain,
      });
      addUserChain({ chainId: Number(chainId) });

      approveRequest(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.info('error adding ethereum chain');
      logger.error(new PortalError(e.name), { message: e.message });
    } finally {
      setLoading(false);
    }
  }, [chainId, chainName, name, symbol, rpcUrl, testnet, addCustomRPC, addUserChain, approveRequest]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
    
  }, [rejectRequest]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <AddEthereumChainInfo
          appHostName={dappMetadata?.appHostName}
          appLogo={dappMetadata?.appLogo}
          appName={dappMetadata?.appName}
          dappStatus={dappMetadata?.status}
          suggestedNetwork={{
            chainId: Number(chainId),
            chainName,
            nativeCurrencyName: name,
            nativeCurrencySymbol: symbol,
            nativeCurrencyDecimals: decimals,
            rpcUrl,
            blockExplorerUrl,
          }}
          testnet={testnet}
          setTestnet={setTestnet}
        />
        <Separator color="separatorTertiary" />
      </Row>
      <Row height="content">
        <AddEthereumChainActions
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading}
          dappStatus={dappMetadata?.status}
        />
      </Row>
    </Rows>
  );
};
