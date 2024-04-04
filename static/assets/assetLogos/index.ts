import EthIcon from './ethIcon.png';
import BtcIcon from './btcIcon.png';
import UsdtIcon from './usdtIcon.png';
import UsdcIcon from './usdcIcon.png';
import AaveIcon from './aaveIcon.png';

export const getAssetLogoUrl = (symbol: string): string => {
    switch(symbol) {
        case 'ETH': return EthIcon;
        case "BTC": return BtcIcon;
        case "USDT": return UsdtIcon;
        case "USDC": return UsdcIcon;
        case "AAVE": return AaveIcon;
        default: return "";
    }
}