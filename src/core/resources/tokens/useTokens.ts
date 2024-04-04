import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://graphql.bitquery.io',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'BQY0DOis30EHQghm5Ejqv7sjq2NaAb8N',
    Authorization:
      'Bearer ory_at_HXY3jqzaLyQgPweDfoML25QabisLY0heNzSvbcpzx84.iKU--d96bZmXEPyIrLyP9lhYY06xONros9XoqvutOIo',
  },
};

export const useTokens = (address: string) => {
  const data = JSON.stringify({
    query: `{
      ethereum(network: ethereum) {
        address(address: {is: "0x1825BEa9F9271b04171c51F46d10B1DFcEa0BD8C"}) {
          balances {
            currency {
              symbol
              address
              name
              tokenType
            }
            value
          }
        }
      }
    }`,
  });

  const {
    isLoading,
    isError,
    data: tokens,
  } = useQuery(['tokens', address], async () => {
    const response = await axios.request({ ...config, data });
    const {
      ethereum: {
        address: [{ balances }],
      },
    } = response.data.data;
    return (
      balances.filter(t => t.value != 0) || [
        {
          currency: {
            symbol: 'ETH',
            address: 'eth',
            name: 'test',
            tokenType: 'type1' 
          },
          value: 10,
        },
        {
          currency: {
            symbol: 'USDT',
            address: 'usdt',
            name: 'test',
            tokenType: 'type1' 
          },
          value: 100,
        }
      ]
    );
  });
  return { isLoading, isError, tokens };
};
