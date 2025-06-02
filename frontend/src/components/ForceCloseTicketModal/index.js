import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const ForceCloseTicketModal = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {i18n.t("forceCloseTicketModal.title")}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {i18n.t("forceCloseTicketModal.message")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t("forceCloseTicketModal.buttons.cancel")}
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          {i18n.t("forceCloseTicketModal.buttons.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForceCloseTicketModal;
