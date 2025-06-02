import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Typography,
  makeStyles,
  CircularProgress,
  TextField,
  InputAdornment
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    maxWidth: 500,
    margin: "0 auto"
  },
  searchField: {
    marginBottom: theme.spacing(2)
  },
  list: {
    maxHeight: 400,
    overflow: "auto"
  },
  listItem: {
    padding: theme.spacing(1, 2)
  },
  listItemText: {
    margin: 0
  },
  noTickets: {
    textAlign: "center",
    padding: theme.spacing(2),
    color: theme.palette.text.secondary
  },
  noResults: {
    textAlign: "center",
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontStyle: "italic"
  }
}));

const ForwardMessageModal = ({ open, onClose, message }) => {
  const classes = useStyles();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      fetchTickets();
    }
  }, [open]);

  useEffect(() => {
    filterTickets();
  }, [searchTerm, tickets]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tickets", {
        params: {
          status: "open",
          exclude: message.ticketId,
          showAll: "true",
          pageNumber: "1"
        }
      });
      
      setTickets(data.tickets || []);
      setSelectedTickets([]);
      setSearchTerm("");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = tickets.filter(ticket => 
      ticket.contact.name.toLowerCase().includes(term) ||
      (ticket.lastMessage && ticket.lastMessage.toLowerCase().includes(term))
    );
    setFilteredTickets(filtered);
  };

  const handleToggleTicket = (ticketId) => {
    setSelectedTickets(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      }
      return [...prev, ticketId];
    });
  };

  const handleForward = async () => {
    if (selectedTickets.length === 0) {
      toast.error(i18n.t("forward.validation.selectChat"));
      return;
    }

    try {
      setLoading(true);
      
      // Log detalhado do objeto message
      console.log('Message object:', {
        message,
        messageId: message?.id,
        messageIdType: typeof message?.id,
        ticketId: message?.ticketId,
        ticketIdType: typeof message?.ticketId
      });
      
      // Garante que message.id seja uma string válida
      if (!message.id || typeof message.id !== 'string') {
        console.error('Invalid message ID:', message.id);
        toast.error(i18n.t("forward.validation.invalidParams"));
        return;
      }

      // Garante que todos os IDs dos tickets sejam números válidos
      const targetChatIds = selectedTickets.map(id => {
        const numberId = Number(id);
        if (isNaN(numberId)) {
          console.error('Invalid ticket ID:', id);
          throw new Error("ID de chat inválido");
        }
        return numberId;
      });

      console.log('Forwarding message - Debug:', {
        message: message,
        messageId: message.id,
        messageIdType: typeof message.id,
        selectedTickets,
        selectedTicketsTypes: selectedTickets.map(id => typeof id),
        targetChatIds,
        targetChatIdsTypes: targetChatIds.map(id => typeof id),
        isMessageIdValid: typeof message.id === 'string' && message.id.length > 0,
        isSelectedTicketsValid: Array.isArray(targetChatIds) && targetChatIds.length > 0
      });
      const requestData = {
        messageId: message.id, // Envia o ID como string
        targetChatIds
      };
      console.log('Request data types:', {
        messageId: {
          value: requestData.messageId,
          type: typeof requestData.messageId,
          isNumber: typeof requestData.messageId === 'number',
          isNaN: isNaN(requestData.messageId)
        },
        targetChatIds: {
          value: requestData.targetChatIds,
          type: typeof requestData.targetChatIds,
          isArray: Array.isArray(requestData.targetChatIds),
          length: requestData.targetChatIds.length,
          elementTypes: requestData.targetChatIds.map(id => ({
            value: id,
            type: typeof id,
            isNumber: typeof id === 'number',
            isNaN: isNaN(id)
          }))
        }
      });
      
      await api.post("/messages/forward", requestData);
      
      toast.success(i18n.t("forward.toasts.success"));
      onClose();
    } catch (err) {
      console.error('Forward error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{i18n.t("forward.title")}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={i18n.t("forward.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={classes.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
            <CircularProgress />
          </div>
        ) : tickets.length > 0 ? (
          filteredTickets.length > 0 ? (
            <List className={classes.list}>
              {filteredTickets.map(ticket => (
                <ListItem
                  key={ticket.id}
                  button
                  onClick={() => handleToggleTicket(ticket.id)}
                  className={classes.listItem}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedTickets.includes(ticket.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={ticket.contact.name}
                    secondary={ticket.lastMessage}
                    className={classes.listItemText}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography className={classes.noResults}>
              {i18n.t("forward.validation.invalidParams")}
            </Typography>
          )
        ) : (
          <Typography className={classes.noTickets}>
            {i18n.t("forward.selectChat")}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {i18n.t("forward.buttons.cancel")}
        </Button>
        <Button
          onClick={handleForward}
          color="primary"
          variant="contained"
          disabled={loading || selectedTickets.length === 0}
        >
          {i18n.t("forward.buttons.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForwardMessageModal; 
