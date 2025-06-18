import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
  },

  pendingTicket: {
    cursor: "unset",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: 20,
  },

  newMessagesCount: {
    alignSelf: "center",
    marginRight: 8,
    marginLeft: "auto",
  },

  badgeStyle: {
    color: "white",
    backgroundColor: green[500],
  },

  acceptButton: {
    position: "absolute",
    left: "50%",
  },

  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },
  deletedMessage: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
  },

  editedMessage: {
    color: "#888",
    fontStyle: "italic",
  }
}));

const TicketListItem = ({ ticket: initialTicket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const [ticket, setTicket] = useState(initialTicket);

  useEffect(() => {
    setTicket(initialTicket);
  }, [initialTicket]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleTicketUpdate = (data) => {
      if (data.action === "update" && data.ticket.id === ticket.id) {
        setTicket(prevTicket => ({
          ...prevTicket,
          ...data.ticket,
          lastMessage: data.ticket.lastMessage || prevTicket.lastMessage,
          updatedAt: data.ticket.updatedAt || prevTicket.updatedAt
        }));
      }
    };

    const handleAppMessage = (data) => {
      if (data.action === "update" && data.message?.ticketId === ticket.id && data.ticket) {
        setTicket(prevTicket => ({
          ...prevTicket,
          ...data.ticket,
          lastMessage: data.message.isDeleted ? "Essa mensagem foi apagada pelo contato." : data.ticket.lastMessage,
          updatedAt: data.ticket.updatedAt || prevTicket.updatedAt
        }));
      }
    };

    if (socket) {
    socket.on(`company-${companyId}-ticket`, handleTicketUpdate);
    socket.on(`company-${companyId}-appMessage`, handleAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, handleTicketUpdate);
      socket.off(`company-${companyId}-appMessage`, handleAppMessage);
    };
    }
  }, [ticket.id, socketManager]);
  const handleAcepptTicket = async () => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleSelectTicket = () => {
    history.push(`/tickets/${ticket.uuid}`);
  };

  const renderLastMessage = () => {
    if (!ticket.lastMessage) {
      return <MarkdownWrapper></MarkdownWrapper>;
    }

    // Mensagem apagada
    if (ticket.lastMessage.includes("Essa mensagem foi apagada")) {
      return (
        <span className={classes.deletedMessage}>
          {ticket.lastMessage}
        </span>
      );
    }

    // Mensagem editada
    if (ticket.lastMessage.includes("(Mensagem editada)")) {
      const originalMessage = ticket.lastMessage.replace("(Mensagem editada)", "").trim();
      return (
        <span>
          <MarkdownWrapper>{originalMessage}</MarkdownWrapper>
          <span className={classes.editedMessage}> (editada)</span>
        </span>
      );
    }

    return <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>;
  };

  return (
    <React.Fragment>
      <ListItem
        dense
        button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket();
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
        })}
      >
        <Tooltip
          arrow
          placement="right"
          title={ticket.queue?.name || i18n.t("messagesList.header.without.queue")}
        >
          <span
            style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
            className={classes.ticketQueueColor}
          ></span>
        </Tooltip>
        <ListItemAvatar>
          <Avatar src={ticket?.contact?.profilePicUrl} />
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              <Typography
                noWrap
                component="span"
                variant="body2"
                color="textPrimary"
              >
                {ticket.contact.name}
              </Typography>
              {ticket.status === "closed" && (
                <Badge
                  className={classes.closedBadge}
                  badgeContent={"closed"}
                  color="primary"
                />
              )}
              {ticket.lastMessage && (
                <Typography
                  className={classes.lastMessageTime}
                  component="span"
                  variant="body2"
                  color="textSecondary"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              )}
            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <Typography
                className={classes.contactLastMessage}
                noWrap
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {renderLastMessage()}
              </Typography>

              <Badge
                className={classes.newMessagesCount}
                badgeContent={ticket.unreadMessages}
                classes={{
                  badge: classes.badgeStyle,
                }}
              />
            </span>
          }
        />
        {ticket.status === "pending" && (
          <ButtonWithSpinner
            color="primary"
            variant="contained"
            className={classes.acceptButton}
            size="small"
            loading={loading}
            onClick={(e) => handleAcepptTicket()}
          >
            {i18n.t("ticketsList.buttons.accept")}
          </ButtonWithSpinner>
        )}
      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItem;
