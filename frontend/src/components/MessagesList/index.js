import React, { useState, useEffect, useReducer, useRef, useContext, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

import { isSameDay, parseISO, format } from "date-fns";
import clsx from "clsx";

import { green } from "@material-ui/core/colors";
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  makeStyles,
  Typography
} from "@material-ui/core";

import {
  AccessTime,
  Block,
  Done,
  DoneAll,
  ExpandMore,
  GetApp,
  Forward,
  CloudUpload
} from "@material-ui/icons";

import MarkdownWrapper from "../MarkdownWrapper";
import ModalImageCors from "../ModalImageCors";
import MessageOptionsMenu from "../MessageOptionsMenu";
import whatsBackground from "../../assets/background-whatsapp/wa-background.webp";
import LocationPreview from "../LocationPreview";
import VcardPreview from "../VcardPreview";

import whatsBackgroundDark from "../../assets/background-whatsapp/wa-background-dark.webp"; //DARK MODE PLW DESIGN//

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import FileUploadModal from "../FileUploadModal";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  messagesListWrapper: {
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    width: "100%",
    minWidth: 300,
    minHeight: 200,
  },

  messagesList: {
    backgroundImage: theme.mode === 'light' ? `url(${whatsBackground})` : `url(${whatsBackgroundDark})`, //DARK MODE PLW DESIGN//
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "20px 20px 20px 20px",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    position: "relative",
    "&.dragActive": {
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }
    }
  },

  dragOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    pointerEvents: "none",
    transition: "all 0.3s ease-in-out",
    backdropFilter: "blur(4px)",
  },

  dragOverlayContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: theme.shape.borderRadius * 2,
    border: "2px dashed rgba(255,255,255,0.3)",
    animation: "$pulse 2s infinite",
  },

  dragOverlayIcon: {
    fontSize: "4rem",
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
    animation: "$bounce 1s infinite",
  },

  dragOverlayText: {
    color: "white",
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
    marginBottom: theme.spacing(1),
  },

  dragOverlaySubtext: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontSize: "1rem",
    marginTop: theme.spacing(1),
  },

  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
      boxShadow: "0 0 0 0 rgba(255,255,255,0.1)",
    },
    "70%": {
      transform: "scale(1.02)",
      boxShadow: "0 0 0 10px rgba(255,255,255,0)",
    },
    "100%": {
      transform: "scale(1)",
      boxShadow: "0 0 0 0 rgba(255,255,255,0)",
    },
  },

  "@keyframes bounce": {
    "0%, 100%": {
      transform: "translateY(0)",
    },
    "50%": {
      transform: "translateY(-10px)",
    },
  },

  circleLoading: {
    color: green[500],
    position: "absolute",
    opacity: "70%",
    top: 0,
    left: "50%",
    marginTop: 12,
  },

  messageLeft: {
    marginRight: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#ffffff",
    color: "#303030",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  quotedContainerLeft: {
    margin: "-3px -80px 6px -6px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsg: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  quotedSideColorLeft: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageRight: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  quotedContainerRight: {
    margin: "-3px -80px 6px -6px",
    overflowY: "hidden",
    backgroundColor: "#cfe9ba",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsgRight: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    whiteSpace: "pre-wrap",
  },

  quotedSideColorRight: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  messageActionsButton: {
    display: "none",
    position: "relative",
    color: "#999",
    zIndex: 1,
    backgroundColor: "inherit",
    opacity: "90%",
    "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },

  textContentItem: {
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },
  
  textContentItemEdited: {
    overflowWrap: "break-word",
    padding: "3px 120px 6px 6px",
  },

  textContentItemDeleted: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  messageMedia: {
    position: "relative",
    maxWidth: 300,
    "& img": {
      maxWidth: "100%",
      borderRadius: 8,
    },
    "& video": {
      maxWidth: "100%",
      borderRadius: 8,
    },
    "& audio": {
      maxWidth: "100%",
    },
  },

  vcardContainer: {
    margin: theme.spacing(1, 0),
    width: '100%',
    maxWidth: 300,
  },

  multiVcardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    margin: theme.spacing(1, 0),
  },

  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
    right: 5,
    color: "#999",
  },

  dailyTimestamp: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "110px",
    backgroundColor: "#e1f3fb",
    margin: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
  },

  dailyTimestampText: {
    color: "#808888",
    padding: 8,
    alignSelf: "center",
    marginLeft: "0px",
  },

  ackIcons: {
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  deletedIcon: {
    fontSize: 18,
    verticalAlign: "middle",
    marginRight: 4,
  },

  ackDoneAllIcon: {
    color: green[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },
  forwardedIndicator: {
    display: "flex",
    alignItems: "center",
    color: "#667781",
    fontSize: "0.75rem",
    marginBottom: 4,
    "& svg": {
      fontSize: "1rem",
      marginRight: 4
    }
  },

  forwardedPreview: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    fontSize: "0.85rem",
    color: "#667781"
  },

  messageCaption: {
    marginTop: 8,
    fontSize: "0.85rem",
    color: "#667781",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    
    // Se for uma mensagem editada, procura a mensagem original para atualizar
    if ((newMessage.mediaType === "editedMessage" || newMessage.type === "messageContextInfo" || newMessage.type === "protocolMessage") && newMessage.dataJson) {
      try {
        const parsedData = JSON.parse(newMessage.dataJson);
        
        // Tenta encontrar informações de edição em diferentes formatos
        const editInfo = parsedData.message?.editedMessage || 
                        parsedData.message?.messageContextInfo || 
                        parsedData.message?.protocolMessage;
        
        if (editInfo) {
          const originalMessageId = editInfo.key?.id;
          if (originalMessageId) {
            const messageIndex = state.findIndex((m) => m.id === originalMessageId);
            
            if (messageIndex !== -1) {
              // Atualiza a mensagem original
              const updatedMessage = {
                ...state[messageIndex],
                body: newMessage.body,
                mediaType: newMessage.mediaType,
                isEdited: true
              };
              state[messageIndex] = updatedMessage;
              return [...state];
            }
          }
        }
      } catch (error) {
        //console.error("Erro ao processar mensagem editada:", error);
      }
    }

    // Para mensagens não editadas, continua com o comportamento normal
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);
    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    
    // Se for uma mensagem editada, procura a mensagem original para atualizar
    if ((messageToUpdate.mediaType === "editedMessage" || messageToUpdate.type === "messageContextInfo" || messageToUpdate.type === "protocolMessage") && messageToUpdate.dataJson) {
      try {
        const parsedData = JSON.parse(messageToUpdate.dataJson);
        
        // Tenta encontrar informações de edição em diferentes formatos
        const editInfo = parsedData.message?.editedMessage || 
                        parsedData.message?.messageContextInfo || 
                        parsedData.message?.protocolMessage;
        
        if (editInfo) {
          const originalMessageId = editInfo.key?.id;
          if (originalMessageId) {
            const messageIndex = state.findIndex((m) => m.id === originalMessageId);
            
            if (messageIndex !== -1) {
              // Atualiza a mensagem original
              const updatedMessage = {
                ...state[messageIndex],
                body: messageToUpdate.body,
                mediaType: messageToUpdate.mediaType,
                isEdited: true
              };
              state[messageIndex] = updatedMessage;
              return [...state];
            }
          }
        }
      } catch (error) {
        // Silenciosamente ignora erros de parsing
      }
    }

    // Para mensagens não editadas, continua com o comportamento normal
    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);
    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesList = ({ ticket, ticketId, isGroup }) => {
  const classes = useStyles();
  const { isDragActive } = useDropzone();

  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef();

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);

  const socketManager = useContext(SocketContext);

  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState([]);

  const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
  const MAX_FILES = 10; // Limite máximo de arquivos
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/ogg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchMessages = async () => {
        if (ticketId === undefined) return;
        try {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber },
          });

          if (currentTicketId.current === ticketId) {
            dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
            setHasMore(data.hasMore);
            setLoading(false);
          }

          if (pageNumber === 1 && data.messages.length > 1) {
            scrollToBottom();
          }
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchMessages();
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [pageNumber, ticketId]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on("ready", () => socket.emit("joinChatBox", `${ticket.id}`));

    socket.on(`company-${companyId}-appMessage`, (data) => {
      if (data.action === "create" && data.message.ticketId === currentTicketId.current) {
        dispatch({ type: "ADD_MESSAGE", payload: data.message });
        scrollToBottom();
      }

      if (data.action === "update" && data.message.ticketId === currentTicketId.current) {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, ticket, socketManager]);

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 1;
    }

    if (loading) {
      return;
    }

    if (scrollTop < 50) {
      loadMore();
    }
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const checkMessageMedia = (message) => {
    // Se é uma mensagem editada do tipo messageContextInfo, retorna null
    // pois o conteúdo será mostrado na mensagem original atualizada
    if (message.type === "messageContextInfo" && message.hasEditedMessage) {
      return null;
    }

    if (message.mediaType === "locationMessage" && message.body.split('|').length >= 2) {
      let locationParts = message.body.split('|')
      let imageLocation = locationParts[0]
      let linkLocation = locationParts[1]
      let descriptionLocation = locationParts.length > 2 ? locationParts[2] : null

      return <LocationPreview image={imageLocation} link={linkLocation} description={descriptionLocation} />
    }

    // Verifica se é um vCard ou mensagem de contato
    if (message.mediaType === "contactMessage" ||
        message.type === "contactMessage" ||
        message.mediaType === "vcard") {
      try {
        let contactData = message.body;
        if (typeof contactData === "string") {
          contactData = JSON.parse(contactData);
        }
        return (
          <div className={classes.messageMedia}>
            <VcardPreview contact={{
              type: 'contactMessage',
              vcard: contactData.vcard || message.vcard,
              displayName: contactData.displayName || message.contact?.name || 'Contato',
              contactName: contactData.displayName || message.contact?.name || 'Contato'
            }} />
          </div>
        );
      } catch (error) {
        return (
          <div className={classes.messageMedia}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {String(message.body)}
            </pre>
          </div>
        );
      }
    }
    else if (message.mediaType === "multi_vcard") {
      try {
        let contactData = message.body;
        if (typeof contactData === "string") {
          contactData = JSON.parse(contactData);
        }
        return (
          <div className={classes.messageMedia}>
            <VcardPreview contact={{
              type: "vcard",
              vcard: contactData.vcard || contactData.body,
              displayName: contactData.name
            }} numbers={null} />
          </div>
        );
      } catch (error) {
        return (
          <div className={classes.messageMedia}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {String(message.body)}
            </pre>
          </div>
        );
      }
    }

    if (message.mediaUrl) {
      if (message.mediaType === "image" || message.mediaType?.includes("image")) {
        return <ModalImageCors imageUrl={message.mediaUrl} />;
      }
      
      if (message.mediaType === "audio") {
        return (
          <audio controls>
            <source src={message.mediaUrl} type="audio/ogg"></source>
          </audio>
        );
      }
      
      if (message.mediaType === "video") {
        return (
          <video
            className={classes.messageMedia}
            src={message.mediaUrl}
            controls
          />
        );
      }

      return (
        <>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
            >
              Download
            </Button>
          </div>
          <Divider />
        </>
      );
    }
    return null;
  };

  const renderMessageAck = (message) => {
    if (message.ack === 1) {
      return <AccessTime fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 2) {
      return <Done fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 3) {
      return <DoneAll fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 4 || message.ack === 5) {
      return <DoneAll fontSize="small" className={classes.ackDoneAllIcon} />;
    }
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <span
          className={classes.dailyTimestamp}
          key={`timestamp-${message.id}`}
        >
          <div className={classes.dailyTimestampText}>
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
          </div>
        </span>
      );
    }
    if (index < messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <span
            className={classes.dailyTimestamp}
            key={`timestamp-${message.id}`}
          >
            <div className={classes.dailyTimestampText}>
              {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
            </div>
          </span>
        );
      }
    }
    if (index === messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    }
  };

  const renderNumberTicket = (message, index) => {
    if (index < messagesList.length && index > 0) {

      let messageTicket = message.ticketId;
      let connectionName = message.ticket?.whatsapp?.name;
      let previousMessageTicket = messagesList[index - 1].ticketId;

      if (messageTicket !== previousMessageTicket) {
        return (
          <center>
            <div className={classes.ticketNunberClosed}>
              Conversa encerrada: {format(parseISO(messagesList[index - 1].createdAt), "dd/MM/yyyy HH:mm:ss")}
            </div>

            <div className={classes.ticketNunberOpen}>
              Conversa iniciada: {format(parseISO(message.createdAt), "dd/MM/yyyy HH:mm:ss")}
            </div>
          </center>
        );
      }
    }
  };

  const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const renderQuotedMessage = (message) => {
    return (
      <div
        className={clsx(classes.quotedContainerLeft, {
          [classes.quotedContainerRight]: message.fromMe,
        })}
      >
        <span
          className={clsx(classes.quotedSideColorLeft, {
            [classes.quotedSideColorRight]: message.quotedMsg?.fromMe,
          })}
        ></span>
        <div className={classes.quotedMsg}>
          {!message.quotedMsg?.fromMe && (
            <span className={classes.messageContactName}>
              {message.quotedMsg?.contact?.name}
            </span>
          )}

          {message.quotedMsg.mediaType === "audio"
            && (
              <div className={classes.downloadMedia}>
                <audio controls>
                  <source src={message.quotedMsg.mediaUrl} type="audio/ogg"></source>
                </audio>
              </div>
            )
          }
          {message.quotedMsg.mediaType === "video"
            && (
              <video
                className={classes.messageMedia}
                src={message.quotedMsg.mediaUrl}
                controls
              />
            )
          }
          {message.quotedMsg.mediaType === "application"
            && (
              <div className={classes.downloadMedia}>
                <Button
                  startIcon={<GetApp />}
                  color="primary"
                  variant="outlined"
                  target="_blank"
                  href={message.quotedMsg.mediaUrl}
                >
                  Download
                </Button>
              </div>
            )
          }

          {message.quotedMsg.mediaType === "image"
            && (
              <ModalImageCors imageUrl={message.quotedMsg.mediaUrl} />)
            || message.quotedMsg?.body}

        </div>
      </div>
    );
  };

  const renderForwardedIndicator = (message) => {
    if (!message.isForwarded && !message.forwardedFrom) return null;
    
    return (
      <>
        <div className={classes.forwardedIndicator}>
          <Forward fontSize="small" />
          <span>
            {message.isForwarded 
              ? "Mensagem encaminhada"
              : "Mensagem original"}
          </span>
        </div>
        {message.forwardedFrom && (
          <div className={classes.forwardedPreview}>
            {message.originalMessage?.body || message.body}
          </div>
        )}
      </>
    );
  };

  const renderMessageMedia = (message) => {
    if (message.mediaType === "image") {
      return (
        <div className={classes.messageMedia}>
          <ModalImageCors imageUrl={message.mediaUrl} />
          {message.body && message.body !== message.mediaUrl && (
            <div className={classes.messageCaption}>
              {message.body.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (message.mediaType === "audio") {
      return (
        <div className={classes.messageMedia}>
          <audio controls>
            <source src={message.mediaUrl} type="audio/ogg"></source>
          </audio>
          {message.body && message.body !== "Áudio" && (
            <div className={classes.messageCaption}>{message.body}</div>
          )}
        </div>
      );
    }
    if (message.mediaType === "video") {
      return (
        <div className={classes.messageMedia}>
          <video controls>
            <source src={message.mediaUrl} type="video/mp4"></source>
          </video>
          {message.body && (
            <div className={classes.messageCaption}>{message.body}</div>
          )}
        </div>
      );
    }
    if (message.mediaType === "application") {
      return (
        <div className={classes.messageMedia}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <GetApp style={{ marginRight: '8px' }} />
            <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer">
              {message.fileName || "Documento"}
            </a>
          </div>
          {message.body && message.body !== message.fileName && (
            <div className={classes.messageCaption}>
              {message.body.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  const renderMessages = () => {
    if (messagesList.length > 0) {
      const viewMessagesList = messagesList.map((message, index) => {
        // Se é uma mensagem de contexto de edição, não renderiza
        if (message.type === "messageContextInfo" && message.hasEditedMessage) {
          return null;
        }

        // Marca a mensagem como editada se ela foi referenciada em uma mensagem de edição
        const isEdited = message.isEdited || messagesList.some(m => 
          m.type === "messageContextInfo" && 
          m.hasEditedMessage && 
          (m.messageId === message.id || m.id === message.id || 
           // Verifica se o ID da mensagem original está no corpo da mensagem de edição
           (m.body && typeof m.body === 'string' && m.body.includes(message.id)))
        );

        if (message.mediaType === "call_log") {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderNumberTicket(message, index)}
              {renderMessageDivider(message, index)}
              <div className={classes.messageCenter}>
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>
                {isGroup && (
                  <span className={classes.messageContactName}>
                    {message.contact?.name}
                  </span>
                )}
                <div style={{ 
                  backgroundColor: 'rgba(223, 51, 51, 0.1)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(223, 51, 51, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  margin: '4px 0'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 17" width="28" height="28" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
                    <path fill="#df3333" d="M18.2 12.1c-1.5-1.8-5-2.7-8.2-2.7s-6.7 1-8.2 2.7c-.7.8-.3 2.3.2 2.8.2.2.3.3.5.3 1.4 0 3.6-.7 3.6-.7.5-.2.8-.5.8-1v-1.3c.7-1.2 5.4-1.2 6.4-.1l.1.1v1.3c0 .2.1.4.2.6.1.2.3.3.5.4 0 0 2.2.7 3.6.7.2 0 1.4-2 .5-3.1zM5.4 3.2l4.7 4.6 5.8-5.7-.9-.8L10.1 6 6.4 2.3h2.5V1H4.1v4.8h1.3V3.2z"></path>
                  </svg> 
                  <span style={{ 
                    color: '#df3333', 
                    fontWeight: 'bold',
                    fontSize: '1em',
                    verticalAlign: 'middle',
                    textShadow: '0 1px 1px rgba(0,0,0,0.1)'
                  }}>
                    Chamada de voz/vídeo perdida às {format(parseISO(message.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        }

        if (!message.fromMe) {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderNumberTicket(message, index)}
              {renderMessageDivider(message, index)}
              <div className={classes.messageLeft}>
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>
                {isGroup && (
                  <span className={classes.messageContactName}>
                    {message.contact?.name}
                  </span>
                )}

                {/* aviso de mensagem apagado pelo contato */}
                {message.isDeleted && (
                  <div>
                    <span className={"message-deleted"}
                    >Essa mensagem foi apagada pelo contato &nbsp;
                      <Block
                        color="error"
                        fontSize="small"
                        className={classes.deletedIcon}
                      />
                    </span>
                  </div>
                )}

                {renderForwardedIndicator(message)}
                {(message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === "vcard" || message.mediaType === "multi_vcard") && checkMessageMedia(message)}
                <div
                  className={clsx(classes.textContentItem, {
                    [classes.textContentItemDeleted]: message.isDeleted,
                    [classes.textContentItemEdited]: isEdited,
                  })}
                >
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.mediaType === "locationMessage" ? null : message.body}</MarkdownWrapper>
                  <span className={classes.timestamp}>
				    {isEdited && <span>Editada </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderNumberTicket(message, index)}
              {renderMessageDivider(message, index)}
              <div className={classes.messageRight}>
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>
                {(message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === "vcard" || message.mediaType === "multi_vcard") && checkMessageMedia(message)}
                <div
                  className={clsx(classes.textContentItem, {
                    [classes.textContentItemDeleted]: message.isDeleted,
                    [classes.textContentItemEdited]: isEdited,
                  })}
                >
                  {message.isDeleted && (
                    <Block
                      color="disabled"
                      fontSize="small"
                      className={classes.deletedIcon}
                    />
                  )}
                  {renderForwardedIndicator(message)}
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  <span className={classes.timestamp}>
				    {isEdited && <span>Editada </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                    {renderMessageAck(message)}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        }
      });
      return viewMessagesList;
    } else {
      return <div>Diga olá para seu novo contato!</div>;
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > MAX_FILES) {
      toastError(`Máximo de ${MAX_FILES} arquivos permitidos`);
      return;
    }

    setFilesToUpload(acceptedFiles);
    setShowFileUploadModal(true);
  }, []);

  const { getRootProps, isDragActive: dropzoneIsDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: ALLOWED_TYPES.join(','),
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toastError(i18n.t('fileUploadModal.errors.sizeExceeded'));
          } else if (error.code === 'file-invalid-type') {
            toastError(i18n.t('fileUploadModal.errors.invalidType'));
          }
        });
      });
    }
  });

  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      
      // Enviar cada arquivo individualmente na ordem correta
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        const formData = new FormData();
        formData.append("fromMe", true);
        formData.append("medias", fileData.file);
        // Garante que a descrição seja enviada, mesmo que vazia
        formData.append("body", fileData.description || fileData.file.name);
        // Adiciona o índice para manter a ordem
        formData.append("index", i.toString());
        
        await api.post(`/messages/${ticketId}`, formData);
      }
      
      toast.success(i18n.t('fileUploadModal.success'));
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
      setShowFileUploadModal(false);
      setFilesToUpload([]);
    }
  };

  return (
    <div className={classes.messagesListWrapper}>
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
      />
      <div
        id="messagesList"
        className={clsx(classes.messagesList, {
          [classes.dragActive]: dropzoneIsDragActive
        })}
        onScroll={handleScroll}
        {...getRootProps()}
      >
        {dropzoneIsDragActive && (
          <div 
            className={classes.dragOverlay}
            style={{ opacity: dropzoneIsDragActive ? 1 : 0 }}
          >
            <div className={classes.dragOverlayContent}>
              <CloudUpload className={classes.dragOverlayIcon} />
              <Typography variant="h6" className={classes.dragOverlayText}>
                Solte os arquivos aqui
              </Typography>
              <Typography variant="body2" className={classes.dragOverlaySubtext}>
                Arraste e solte arquivos para enviar
              </Typography>
            </div>
          </div>
        )}
        {messagesList.length > 0 ? renderMessages() : []}
      </div>
      {loading && (
        <div>
          <CircularProgress className={classes.circleLoading} />
        </div>
      )}
      <FileUploadModal
        open={showFileUploadModal}
        onClose={() => {
          setShowFileUploadModal(false);
          setFilesToUpload([]);
        }}
        onUpload={handleUploadFiles}
        initialFiles={filesToUpload}
      />
    </div>
  );
};

export default MessagesList;
