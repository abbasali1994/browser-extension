import { ChainName } from "./types/chains";

export interface PortalConfig extends Record<string, any> {
  // features
  send_enabled: boolean;
  swaps_enabled: boolean;
  tx_requests_enabled: boolean;
  flashbots_enabled: boolean;
  rpc_proxy_enabled: boolean;
  points_enabled: boolean;
  defi_positions_enabled: boolean;
  // SWAPS
  default_slippage_bips: {
    [ChainName.mainnet]: number;
    [ChainName.optimism]: number;
    [ChainName.polygon]: number;
    [ChainName.arbitrum]: number;
    [ChainName.base]: number;
    [ChainName.zora]: number;
    [ChainName.bsc]: number;
    [ChainName.avalanche]: number;
    [ChainName.blast]: number;
  };
}

const DEFAULT_CONFIG = {
  // features
  send_enabled: true,
  swaps_enabled: true,
  tx_requests_enabled: true,
  flashbots_enabled: true,
  rpc_proxy_enabled: true,
  points_enabled: true,
  defi_positions_enabled: false,
  // SWAPS
  default_slippage_bips: {
    arbitrum: 200,
    mainnet: 100,
    optimism: 200,
    polygon: 200,
    base: 200,
    zora: 200,
    bsc: 200,
    avalanche: 200,
    blast: 200,
  },
};

export const config: PortalConfig = { ...DEFAULT_CONFIG, status: 'loading' };