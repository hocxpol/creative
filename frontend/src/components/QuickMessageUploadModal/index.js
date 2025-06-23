import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  LinearProgress,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import useQuickMessages from "../../hooks/useQuickMessages";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useContext } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  messageInput: {
    marginBottom: theme.spacing(2),
  },
  attachmentBox: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
  },
  attachmentName: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
  select: {
    marginBottom: theme.spacing(2),
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonWrapper: {
    position: 'relative',
  },
  loadingContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  loadingText: {
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
}));

const QuickMessageUploadModal = ({ open, onClose, onSend, initialMessage, initialFile }) => {
  const classes = useStyles();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [quickMessages, setQuickMessages] = useState([]);
  const [selectedQuickMessage, setSelectedQuickMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useContext(AuthContext);
  const { list: listQuickMessages } = useQuickMessages();

  // Carregar mensagens rápidas
  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId || localStorage.getItem("companyId");
      const messages = await listQuickMessages({ companyId, userId: user.id });
      setQuickMessages(messages);
    }
    if (open) {
      fetchData();
    }
  }, [open, user.companyId, user.id]);

  // Atualizar o estado quando os props mudam
  useEffect(() => {
    if (open) {
      setMessage(initialMessage || "");
      setFile(initialFile || null);
      setSelectedQuickMessage("");
    }
  }, [open, initialMessage, initialFile]);

  const handleQuickMessageChange = async (event) => {
    const selectedMessage = quickMessages.find(m => m.id === event.target.value);
    if (selectedMessage) {
      setSelectedQuickMessage(event.target.value);
      setMessage(selectedMessage.message || "");

      if (selectedMessage.mediaPath) {
        try {
          setIsUploading(true);
          const response = await fetch(selectedMessage.mediaPath);
          const blob = await response.blob();
          const file = new File([blob], selectedMessage.mediaName || 'arquivo', {
            type: blob.type
          });
          setFile(file);
        } catch (err) {
          console.error('Erro ao carregar anexo:', err);
        } finally {
          setIsUploading(false);
        }
      } else {
        setFile(null);
      }
    }
  };

  const handleSend = async () => {
    setIsSaving(true);
    try {
      await onSend({ message, file });
      onClose();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {i18n.t("quickMessages.dialog.title")}
      </DialogTitle>
      <DialogContent>
        <div className={classes.root}>
          <FormControl variant="outlined" fullWidth className={classes.select}>
            <InputLabel>{i18n.t("quickMessages.dialog.select")}</InputLabel>
            <Select
              value={selectedQuickMessage}
              onChange={handleQuickMessageChange}
              label={i18n.t("quickMessages.dialog.select")}
              disabled={isUploading || isSaving}
            >
              <MenuItem value="">
                {i18n.t("quickMessages.dialog.selectPlaceholder")}
              </MenuItem>
              {quickMessages.map((qm) => (
                <MenuItem key={qm.id} value={qm.id}>
                  {`/${qm.shortcode} - ${qm.message.substring(0, 35)}${qm.message.length > 35 ? '...' : ''}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            className={classes.messageInput}
            label={i18n.t("quickMessages.dialog.message")}
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            fullWidth
            disabled={isUploading || isSaving}
          />
          
          {file && (
            <Box className={classes.attachmentBox}>
              <AttachFileIcon />
              <Typography className={classes.attachmentName}>
                {file.name}
              </Typography>
              <IconButton
                className={classes.deleteButton}
                onClick={() => setFile(null)}
                size="small"
                disabled={isUploading || isSaving}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          )}

          {(isUploading || isSaving) && (
            <Box className={classes.loadingContainer}>
              <Typography className={classes.loadingText}>
                {isUploading 
                  ? i18n.t("quickMessages.loading.downloading") 
                  : i18n.t("quickMessages.loading.sending")}
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="secondary"
          disabled={isUploading || isSaving}
        >
          {i18n.t("quickMessages.buttons.cancel")}
        </Button>
        <div className={classes.buttonWrapper}>
          <Button
            onClick={handleSend}
            color="primary"
            variant="contained"
            disabled={(!message && !file) || isUploading || isSaving}
          >
            {i18n.t("quickMessages.buttons.send")}
          </Button>
          {(isUploading || isSaving) && (
            <CircularProgress
              size={24}
              className={classes.buttonProgress}
            />
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default QuickMessageUploadModal; 
