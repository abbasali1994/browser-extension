import { ChainName } from './types/chains';

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

// graphql replacement exports
export enum DAppStatus {
  Scam = 'SCAM',
  Unverified = 'UNVERIFIED',
  Verified = 'VERIFIED',
}

export type DAppQuery = {
  __typename?: 'Query';
  dApp?: {
    __typename?: 'DApp';
    name: string;
    status?: DAppStatus;
    iconURL: string;
    url: string;
    description: string;
    shortName: string;
    colors: {
      __typename?: 'DAppColors';
      primary: string;
      fallback?: string | null;
      shadow?: string | null;
    };
  } | null;
};

export enum PointsErrorType {
  AlreadyUsedCode = 'ALREADY_USED_CODE',
  AwardingNotOngoing = 'AWARDING_NOT_ONGOING',
  BlockedUser = 'BLOCKED_USER',
  ExistingUser = 'EXISTING_USER',
  InvalidRedemptionCode = 'INVALID_REDEMPTION_CODE',
  InvalidReferralCode = 'INVALID_REFERRAL_CODE',
  NonExistingUser = 'NON_EXISTING_USER',
  NoBalance = 'NO_BALANCE',
}

export enum PointsMetaStatus {
  Finished = 'FINISHED',
  Ongoing = 'ONGOING',
  Paused = 'PAUSED',
}

export type PointsQuery = {
  __typename?: 'Query';
  points?: {
    __typename?: 'Points';
    error?: {
      __typename?: 'PointsError';
      message: string;
      type: PointsErrorType;
    } | null;
    meta: {
      __typename?: 'PointsMeta';
      status: PointsMetaStatus;
      distribution: { __typename?: 'PointsMetaDistribution'; next: number };
    };
    leaderboard: {
      __typename?: 'PointsLeaderboard';
      stats: {
        __typename?: 'PointsLeaderboardStats';
        total_users: number;
        total_points: number;
        rank_cutoff: number;
      };
      accounts?: Array<{
        __typename?: 'PointsLeaderboardAccount';
        address: string;
        ens: string;
        avatarURL: string;
        earnings: { __typename?: 'PointsLeaderboardEarnings'; total: number };
      }> | null;
    };
    user: {
      __typename?: 'PointsUser';
      referralCode: string;
      earnings: { __typename?: 'PointsEarnings'; total: number };
      stats: {
        __typename?: 'PointsStats';
        position: {
          __typename?: 'PointsStatsPosition';
          unranked: boolean;
          current: number;
        };
        last_airdrop: {
          __typename?: 'PointsStatsPositionLastAirdrop';
          position: { __typename?: 'PointsStatsPosition'; current: number };
          differences: Array<{
            __typename?: 'PointsStatsPositionLastAirdropDifference';
            type: string;
            group_id: string;
            earnings: { __typename?: 'PointsEarnings'; total: number };
          } | null>;
        };
      };
    };
  } | null;
};

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Any: any;
  Time: any;
  TokenBridging: any;
  TokenNetworks: any;
};

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};

export type Transaction = {
  data: Scalars['String'];
  from: Scalars['String'];
  to: Scalars['String'];
  value: Scalars['String'];
};

export type Message = {
  method: Scalars['String'];
  params: Array<Scalars['String']>;
};

export type ResolveEnsProfileQueryVariables = Exact<{
  chainId: Scalars['Int'];
  name: Scalars['String'];
  fields?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;

export type ResolveEnsProfileQuery = {
  __typename?: 'Query';
  resolveENSProfile?: {
    __typename?: 'ENSProfile';
    address: string;
    resolverAddress: string;
    reverseResolverAddress: string;
    fields: Array<{
      __typename?: 'ENSProfileField';
      key: string;
      value: string;
    }>;
  } | null;
};

export type ReverseResolveEnsProfileQueryVariables = Exact<{
  chainId: Scalars['Int'];
  address: Scalars['String'];
  fields?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;

export type ReverseResolveEnsProfileQuery = {
  __typename?: 'Query';
  reverseResolveENSProfile?: {
    __typename?: 'ENSProfile';
    name: string;
    resolverAddress: string;
    reverseResolverAddress: string;
    fields: Array<{
      __typename?: 'ENSProfileField';
      key: string;
      value: string;
    }>;
  } | null;
};

export type GetContractFunctionQueryVariables = Exact<{
  chainID: Scalars['Int'];
  hex: Scalars['String'];
  address: Scalars['String'];
}>;


export type GetContractFunctionQuery = { __typename?: 'Query', contractFunction?: { __typename?: 'ContractFunction', text: string } | null };
