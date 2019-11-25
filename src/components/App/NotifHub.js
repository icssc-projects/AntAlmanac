import React, { Component, Fragment } from 'react';
import {
  Badge,
  Button,
  Tooltip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { Notifications } from '@material-ui/icons';

class NotifHub extends Component {
  state = {
    open: false,
    email: '',
    sms: '',
    push: '',
    email_wl: [],
    sms_wl: [],
    push_wl: [],
  };

  componentDidMount = () => {
    this.query_bookkeeper();
  };

  query_bookkeeper = async () => {
    // First, grab email, num, token from cache
    let local_email,
      local_sms,
      local_token = null;
    if (typeof Storage !== 'undefined') {
      local_email = window.localStorage.getItem('email');
      local_sms = window.localStorage.getItem('sms');
      local_token = window.localStorage.getItem('token');
      this.setState({ email: local_email, sms: local_sms, token: local_token });
    }
    // https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev
    // Use http://127.0.0.1:5000/lookup/ for local testing

    // If using email notif, send request to lookup
    if (local_email !== null) {
      await fetch(
        'https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev/lookup/email/' +
          local_email
      )
        .then((resp) => resp.json())
        .then((json) => {
          this.setState({ email_wl: json });
        });
    }

    //If using sms, send request after parsing
    if (local_sms !== null) {
      const regex = /\d+/g;
      local_sms = local_sms.match(regex);
      local_sms = local_sms.join('');
      await fetch(
        'https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev/lookup/sms/' +
          local_sms
      )
        .then((resp) => resp.json())
        .then((json) => {
          this.setState({ sms_wl: json });
        });
    }

    // Possible to catch bad token here
    if (local_token !== null) {
      if (local_token.length < 15) {
        //undefined token, clear token cache
        window.localStorage.setItem('cachePushToken', null);
      } else {
        await fetch(
          'https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev/lookup/push/' +
            local_token
        )
          .then((resp) => resp.json())
          .then((json) => {
            this.setState({ push_wl: json });
          });
      }
    }
  };

  render() {
    return (
      <Fragment>
        <Tooltip title="Notifications Registered on Current Device">
          <Button
            onClick={() => {
              this.setState({ open: true });
              this.query_bookkeeper();
            }}
            color="inherit"
          >
            <Badge color="error" variant="dot">
              {/*todo: remember if viewed*/}
              <Notifications />
            </Badge>
            {this.props.isDesktop ? (
              <Typography color="inherit">
                Notifications&nbsp;&nbsp;&nbsp;&nbsp;
              </Typography>
            ) : (
              <Fragment />
            )}
          </Button>
        </Tooltip>

        <Dialog
          open={this.state.open}
          onClose={() => {
            this.setState({ open: false });
          }}
          scroll="paper"
          aria-labelledby="notifications-hub"
          aria-describedby="notifications-registered-on-device"
        >
          <DialogTitle id="dialog-title">
            Notifications Currently Registered to this Device
          </DialogTitle>

          <DialogContent dividers={true}>
            <DialogContentText id="content">
              {this.state.email === null ? (
                <p>You have not signed up for any email notifications!</p>
              ) : (
                <div>
                  <p>Watchlist for {this.state.email}:</p>
                  <ul>
                    {this.state.email_wl.map((course) => {
                      return (
                        <li>
                          {course.name}: {course.code}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {this.state.sms === null ? (
                <p>You have not signed up for any SMS notifications!</p>
              ) : (
                <div>
                  <p>Watchlist for {this.state.sms}:</p>
                  <ul>
                    {this.state.sms_wl.map((course) => {
                      return (
                        <li>
                          {course.name}: {course.code}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {this.state.token === null ? (
                <p>You have not signed up for any push notifications!</p>
              ) : this.state.token === undefined ||
                this.state.token.length < 15 ? ( //undefined token
                <p>
                  You have not set up push notifications correctly! Please try
                  again!
                </p>
              ) : (
                <div>
                  <p>Push notif watchlist for this device:</p>
                  <ul>
                    {this.state.push_wl.map((course) => {
                      return (
                        <li>
                          {course.name}: {course.code}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                this.setState({ open: false });
              }}
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

export default NotifHub;
