import BigNumber from 'bignumber.js';

// URLS
export const GAS_PRICE_API = 'https://gasprice.poa.network/';
export const ZAPPER_GAS_PRICE_API = 'https://api.zapper.fi/v1/gas-price?api_key=96e0cc51-a62e-42ca-acee-910ea7d2a241'
export const ETHERSCAN_URL = 'https://etherscan.io/';


// DEFINE CONTRACT ADDRESSES
export const VECRV_ADDRESS = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2'
export const VEBOOST_ADDRESS = '0xd30DD0B919cB4012b3AdD78f6Dcb6eb7ef225Ac8'
export const CONVEX_ADDRESS = '0x989AEb4d175e16225E39E87d0D97A3360524AD80'

// GENERAL
export const ERROR = 'ERROR';
export const STORE_UPDATED = 'STORE_UPDATED';
export const TX_SUBMITTED = 'TX_SUBMITTED';

export const CONNECTION_CONNECTED = 'CONNECTION_CONNECTED';
export const CONNECTION_DISCONNECTED = 'CONNECTION_DISCONNECTED';
export const CONNECT_WALLET = 'CONNECT_WALLET';

export const CONFIGURE = 'CONFIGURE';
export const CONFIGURE_RETURNED = 'CONFIGURE_RETURNED';

export const ACCOUNT_CONFIGURED = 'ACCOUNT_CONFIGURED';
export const ACCOUNT_CHANGED = 'ACCOUNT_CHANGED';

export const GET_GAS_PRICES = 'GET_GAS_PRICES';
export const GAS_PRICES_RETURNED = 'GAS_PRICES_RETURNED';


export const CONFIGURE_BOOST = 'CONFIGURE_BOOST'
export const BOOST_CONFIGURED = 'BOOST_CONFIGURED'

export const DELEGATE_BOOST = 'DELEGATE_BOOST'
export const BOOST_DELEGATED = 'BOOST_DELEGATED'

export const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toFixed(0);
export const WEEK = BigNumber(86400).times(7).toFixed(0);
