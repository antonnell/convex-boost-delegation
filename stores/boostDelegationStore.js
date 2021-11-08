import async from 'async';
import {
  MAX_UINT256,
  WEEK,
  ERROR,
  TX_SUBMITTED,
  STORE_UPDATED,
  CONFIGURE_BOOST,
  BOOST_CONFIGURED,
  DELEGATE_BOOST,
  BOOST_DELEGATED,
  CONVEX_ADDRESS,
  VEBOOST_ADDRESS,
  VECRV_ADDRESS
} from './constants';
import * as moment from 'moment';

import abis from './abis';
import veCRV from './configurations/veCRV'

import stores from './';
import BigNumber from 'bignumber.js';

class Store {
  constructor(dispatcher, emitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;

    this.store = {
      configured: false,
      veCRV: veCRV,
      tokens: []
    };

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case CONFIGURE_BOOST:
            this.configure(payload);
            break;
          case DELEGATE_BOOST:
            this.delegateBoost(payload);
            break;
          default: {
          }
        }
      }.bind(this),
    );
  }

  getStore = (index) => {
    return this.store[index];
  };

  setStore = (obj) => {
    this.store = { ...this.store, ...obj };
    console.log(this.store);
    return this.emitter.emit(STORE_UPDATED);
  };

  configure = async (payload) => {
    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      this.emitter.emit(BOOST_CONFIGURED);
      return null;
    }

    const account = stores.accountStore.getStore('account');
    if (!account) {
      this.emitter.emit(BOOST_CONFIGURED);
      return false;
    }

    const veCRV = this.getStore('veCRV')

    const boostContract = new web3.eth.Contract(abis.veBoostABI, VEBOOST_ADDRESS);
    const veCRVContract = new web3.eth.Contract(abis.veCRVABI, VECRV_ADDRESS);
    const balance = await boostContract.methods.adjusted_balance_of(account.address).call()

    const [veCRVBalanceOf, delegatedBoost, receivedBoost, balanceOf, lockEnds] = await Promise.all([
      boostContract.methods.adjusted_balance_of(account.address).call(),
      boostContract.methods.delegated_boost(account.address).call(),
      boostContract.methods.received_boost(CONVEX_ADDRESS).call(),
      boostContract.methods.balanceOf(account.address).call(),
      veCRVContract.methods.locked__end(account.address).call()
    ]);

    veCRV.balance = BigNumber(veCRVBalanceOf).div(1e18).toFixed(18)
    veCRV.delegatedBoost = BigNumber(delegatedBoost).div(1e18).toFixed(18)
    veCRV.convexReceivedBoost = BigNumber(receivedBoost).div(1e18).toFixed(18)
    veCRV.lockEnds = lockEnds

    // foreach balanceOf
    // get token info
    // push tokens to tokens[]

    this.setStore({ veCRV })
    this.emitter.emit(BOOST_CONFIGURED);
  };

  delegateBoost = async (payload) => {
    const account = stores.accountStore.getStore('account');
    if (!account) {
      return false;
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      return false;
    }

    const { expiry, percentage } = payload.content;

    this._callCreateBoost(web3, account, expiry, percentage, (err, res) => {
      if (err) {
        return this.emitter.emit(ERROR, err);
      }

      return this.emitter.emit(BOOST_DELEGATED, res);
    });
  }

  _callCreateBoost = async (web3, account, expiry, percentage, callback) => {
    const contract = new web3.eth.Contract(abis.veBoostABI, VEBOOST_ADDRESS);
    const gasPrice = await stores.accountStore.getGasPrice();

    const id = await contract.methods.totalSupply().call()

    const receiver = CONVEX_ADDRESS
    const delegator = account.address
    const sendPercent = BigNumber(percentage).times(100).toFixed(0)
    const cancelTime = moment().unix()
    const sendExpiry = moment(expiry).unix()

    console.log(delegator, receiver, sendPercent, cancelTime, sendExpiry, id)

    this._callContract(web3, contract, 'create_boost', [delegator, receiver, sendPercent, cancelTime, sendExpiry, id], account, gasPrice, CONFIGURE_BOOST, {}, callback);
  };

  _callContract = (web3, contract, method, params, account, gasPrice, dispatchEvent, dispatchEventPayload, callback) => {
    const context = this;
    contract.methods[method](...params)
      .send({
        from: account.address,
        gasPrice: web3.utils.toWei(gasPrice, 'gwei'),
      })
      .on('transactionHash', function (hash) {
        context.emitter.emit(TX_SUBMITTED, hash);
        callback(null, hash);
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        if (dispatchEvent && confirmationNumber == 0) {
          context.dispatcher.dispatch({ type: dispatchEvent, content: dispatchEventPayload });
        }
      })
      .on('error', function (error) {
        if (!error.toString().includes('-32601')) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      })
      .catch((error) => {
        if (!error.toString().includes('-32601')) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      });
  };

  _callContractWait = (web3, contract, method, params, account, gasPrice, dispatchEvent, dispatchEventPayload, callback) => {
    const context = this;
    contract.methods[method](...params)
      .send({
        from: account.address,
        gasPrice: web3.utils.toWei(gasPrice, 'gwei'),
      })
      .on('transactionHash', function (hash) {
        console.log(hash)
        // context.emitter.emit(TX_SUBMITTED, hash);
      })
      .on('receipt', function (receipt) {
        context.emitter.emit(TX_SUBMITTED, receipt.transactionHash);
        callback(null, receipt.transactionHash);

        if (dispatchEvent) {
          context.dispatcher.dispatch({ type: dispatchEvent, content: dispatchEventPayload });
        }
      })
      .on('error', function (error) {
        if (!error.toString().includes('-32601')) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      })
      .catch((error) => {
        if (!error.toString().includes('-32601')) {
          if (error.message) {
            return callback(error.message);
          }
          callback(error);
        }
      });
  };
}

export default Store;
