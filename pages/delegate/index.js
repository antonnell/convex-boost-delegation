import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as moment from 'moment';

import { Typography, Paper, Button, TextField, CircularProgress, Skeleton, Slider } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MobileDatePicker from '@mui/lab/MobileDatePicker';

import { withTheme, ThemeProvider } from '@mui/styles';

import Layout from '../../components/layout';
import BigNumber from 'bignumber.js';

import Unlock from '../../components/unlock';
import classes from './delegate.module.css';

import stores from '../../stores/index.js';
import { ERROR, ACCOUNT_CHANGED, CONNECT_WALLET, BOOST_CONFIGURED, DELEGATE_BOOST, BOOST_DELEGATED } from '../../stores/constants';

import { formatCurrency, formatAddress } from '../../utils';

function Delegate({ changeTheme, theme }) {

  const getNextThursday = () => {
    return moment().day(11).toDate() //should return next week thursday? Might need to add logic for if we are already past thursday today.
  }

  const [ loading, setLoading ] = useState(true);
  const [ account, setAccount ] = useState(null);
  const [unlockOpen, setUnlockOpen] = useState(false);

  const [ veCRV, setVECRV ] = useState(null);

  const [ expiry, setExpiry ] = useState(getNextThursday());
  const [ percentage, setPercentage ] = useState(100)

  const onConnectWallet = () => {
    stores.emitter.emit(CONNECT_WALLET);
  };

  useEffect(async function () {
    const accountChanged = async () => {
      setAccount(stores.accountStore.getStore('account'))
    }

    const balanceReturned = () => {
      setVECRV(stores.boostDelegationStore.getStore('veCRV'))
      setLoading(false)
    }

    const boostDelegated = () => {
      setLoading(false)
    }

    setAccount(stores.accountStore.getStore('account'))
    setVECRV(stores.boostDelegationStore.getStore('veCRV'))

    stores.emitter.on(ACCOUNT_CHANGED, accountChanged);
    stores.emitter.on(BOOST_CONFIGURED, balanceReturned)
    stores.emitter.on(BOOST_DELEGATED, boostDelegated)

    return () => {
      stores.emitter.removeListener(ACCOUNT_CHANGED, accountChanged);
      stores.emitter.removeListener(BOOST_CONFIGURED, balanceReturned)
      stores.emitter.removeListener(BOOST_DELEGATED, boostDelegated)
    };
  }, []);

  const getExpiryDate = () => {
    return moment.unix(veCRV && veCRV.lockEnds ? veCRV.lockEnds : null).toDate()
  }

  const getVeCRVPercent = () => {
    return BigNumber(veCRV && veCRV.balance ? veCRV.balance : 0).times(percentage).div(100).toFixed(4)
  }

  const onAddressClicked = () => {
    setUnlockOpen(true);
  }

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  const delegate = () => {
    setLoading(true)
    stores.dispatcher.dispatch({ type: DELEGATE_BOOST, content: { expiry, percentage } })
  }

  return (
    <Layout changeTheme={changeTheme}>
      <div className={ classes.container }>
        <div className={ classes.headerContainer}>
          <div className={ classes.bgLeft }></div>
          <div className={ classes.bgRight }></div>
          <div className={ classes.actualHeaderContainer }>
            {
              account && account.address && <Button
                disableElevation
                className={classes.accountButton}
                variant="contained"
                color={ 'primary' }
                onClick={onAddressClicked}>{formatAddress(account.address)}</Button>
            }
            {
              !(account && account.address) && <Button disableElevation
                className={classes.accountButton}
                variant="contained"
                color={ 'primary' }
                onClick={onAddressClicked}>Connect Wallet</Button>
            }
          </div>
          <div  className={ classes.actionsContainer }>
            <div>
              <Typography variant='h2' className={ classes.titleText }>Convex Boost Delegation</Typography>
              <Typography variant='h5' className={ classes.headingText }>Have you accepted Convex as our Curve farm overlord, leaving you with 4 years of locked veCRV sitting idle? Delegate it to Convex and let them manage it for you.</Typography>
            </div>
            <div>
              <Paper className={ classes.delegateContainer }>
                <div className={ classes.inputContainer }>
                  <Typography className={ classes.inputHelper }>You can deposit your idle veCRV here. Delegate up to 100% of your veCRV.</Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <MobileDatePicker
                      label="Expiry Date"
                      value={expiry}
                      onChange={(newValue) => {
                        setExpiry(newValue);
                      }}
                      minDate={ getNextThursday() }
                      maxDate={ getExpiryDate() }
                      renderInput={(params) => <TextField fullWidth {...params} />}
                    />
                  </LocalizationProvider>
                  <div>
                    <Slider defaultValue={100} aria-label="Default" valueLabelDisplay="auto" value={ percentage } onChange={(e, newValue) => {
                        setPercentage(newValue)
                      }}
                    />
                    <Typography className={ classes.inputHelper }>{percentage}% ~ {getVeCRVPercent()} veCRV</Typography>
                  </div>
                  { !(account && account.address ) &&
                    <Button
                      fullWidth
                      variant='contained'
                      size='large'
                      color='primary'
                      onClick={onAddressClicked}>Connect Wallet</Button>
                  }
                  { (account && account.address ) &&
                    <Button
                      fullWidth
                      variant='contained'
                      size='large'
                      color='primary'
                      onClick={ delegate }
                    >
                      { loading ? 'Delegating' : 'Delegate' }
                      { loading &&  <CircularProgress size={10} className={ classes.loadingCircle } /> }
                    </Button>
                  }
                </div>
              </Paper>
            </div>
          </div>
          <div className={ classes.kpis }>
            <div className={ classes.kpi }>
              <Typography className={ classes.kpiValue }>{ formatCurrency(veCRV && veCRV.convexReceivedBoost && veCRV.convexReceivedBoost) } veCRV</Typography>
              <Typography className={ classes.kpiHeader }>Total Delegated</Typography>
            </div>
            <div className={ classes.kpi }>
              <Typography className={ classes.kpiValue }>{ formatCurrency(veCRV && veCRV.balance && veCRV.balance) } veCRV</Typography>
              <Typography className={ classes.kpiHeader }>Your Balance</Typography>
            </div>
            <div className={ classes.kpi }>

            </div>
            <div className={ classes.kpi }>

            </div>
          </div>
        </div>
      </div>
      <div>

      </div>
      {unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}
    </Layout>
  );
}

export default withTheme(Delegate);
