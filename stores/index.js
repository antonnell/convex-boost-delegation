import AccountStore from './accountStore';
import BoostDelegationStore from './boostDelegationStore';

const Dispatcher = require('flux').Dispatcher;
const Emitter = require('events').EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

const accountStore = new AccountStore(dispatcher, emitter);
const boostDelegationStore = new BoostDelegationStore(dispatcher, emitter);

export default {
  accountStore: accountStore,
  boostDelegationStore: boostDelegationStore,
  dispatcher: dispatcher,
  emitter: emitter,
};
