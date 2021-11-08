import React, { Component } from "react";
import { DialogContent, Dialog, Slide } from "@mui/material";

import Unlock from "./unlock.js";

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class UnlockModal extends Component {
  render() {
    const { closeModal, modalOpen } = this.props;

    // const fullScreen = window.innerWidth < 576;

    return (
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        fullWidth={true}
        maxWidth={"sm"}
        TransitionComponent={Transition}
      >
        <DialogContent style={{ background: '#3a3a3a' }}>
          <Unlock closeModal={closeModal} />
        </DialogContent>
      </Dialog>
    );
  }
}

export default UnlockModal;
