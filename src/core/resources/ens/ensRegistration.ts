import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { useQuery } from '@tanstack/react-query';
import uts46 from 'idna-uts46-hx';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';

function normalizeENS(name: string) {
  try {
    return uts46.toUnicode(name, { useStd3ASCII: true });
  } catch (err) {
    return name;
  }
}

function decodeLabelhash(hash: string) {
  if (!(hash.startsWith('[') && hash.endsWith(']'))) {
    throw Error(
      'Expected encoded labelhash to start and end with square brackets',
    );
  }

  if (hash.length !== 66) {
    throw Error('Expected encoded labelhash to have a length of 66');
  }

  return `${hash.slice(1, -1)}`;
}

function isEncodedLabelhash(hash: string) {
  return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66;
}

export function labelhash(unnormalisedLabelOrLabelhash: string) {
  if (unnormalisedLabelOrLabelhash === '[root]') {
    return '';
  }
  return isEncodedLabelhash(unnormalisedLabelOrLabelhash)
    ? '0x' + decodeLabelhash(unnormalisedLabelOrLabelhash)
    : keccak256(toUtf8Bytes(normalizeENS(unnormalisedLabelOrLabelhash)));
}

const fetchRegistration = async (ensName: string) => {
  const response = {
    registration: {
      ensName: ensName,
      expiryDate: '2023-08-21T00:00:00Z',
      registrationDate: '2020-08-21T00:00:00Z',
    },
  };
  const data = response.registration;

  return {
    registration: {
      expiryDate: data?.expiryDate as string | undefined,
      registrationDate: data?.registrationDate as string | undefined,
    },
  };
};

// ///////////////////////////////////////////////
// Query Types

export type EnsRegistrationArgs = {
  name: string;
};

// ///////////////////////////////////////////////
// Query Key

const ensRegistrationQueryKey = ({ name }: EnsRegistrationArgs) =>
  createQueryKey('ensRegistration', { name }, { persisterVersion: 1 });

type EnsRegistrationQueryKey = ReturnType<typeof ensRegistrationQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function ensRegistrationQueryFunction({
  queryKey: [{ name }],
}: QueryFunctionArgs<typeof ensRegistrationQueryKey>) {
  const registration = fetchRegistration(name);
  return registration;
}

type EnsRegistrationResult = QueryFunctionResult<
  typeof ensRegistrationQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useEnsRegistration(
  { name }: EnsRegistrationArgs,
  config: QueryConfig<
    EnsRegistrationResult,
    Error,
    EnsRegistrationResult,
    EnsRegistrationQueryKey
  > = {},
) {
  return useQuery(
    ensRegistrationQueryKey({ name }),
    ensRegistrationQueryFunction,
    config,
  );
}
