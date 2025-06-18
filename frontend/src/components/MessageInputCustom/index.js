import React, { useState, useEffect, useContext, useRef } from "react";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import MicRecorder from "mic-recorder-to-mp3";
import clsx from "clsx";
import { isNil } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import IconButton from "@material-ui/core/IconButton";
import MoodIcon from "@material-ui/icons/Mood";
import SendIcon from "@material-ui/icons/Send";
import CancelIcon from "@material-ui/icons/Cancel";
import ClearIcon from "@material-ui/icons/Clear";
import MicIcon from "@material-ui/icons/Mic";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { FormControlLabel, Switch, Tooltip } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { isString, isEmpty, isObject, has } from "lodash";
import MessageIcon from "@material-ui/icons/Message";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import axios from "axios";

import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";

import useQuickMessages from "../../hooks/useQuickMessages";
import FileUploadModal from '../FileUploadModal';
import QuickMessageUploadModal from '../QuickMessageUploadModal';

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    backgroundColor: theme.palette.bordabox, //DARK MODE PLW DESIGN//
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },

  newMessageBox: {
    backgroundColor: theme.palette.newmessagebox, //DARK MODE PLW DESIGN//
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
  },

  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    backgroundColor: theme.palette.inputdigita, //DARK MODE PLW DESIGN//
    display: "flex",
    borderRadius: 20,
    flex: 1,
  },

  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
  },

  sendMessageIcons: {
    color: "grey",
  },

  uploadInput: {
    display: "none",
  },

  viewMediaInputWrapper: {
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },

  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },

  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },

  audioLoading: {
    color: green[500],
    opacity: "70%",
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
  },

  cancelAudioIcon: {
    color: "red",
  },

  sendAudioIcon: {
    color: "green",
  },

  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingLeft: 73,
    paddingRight: 7,
  },

  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  replyginMsgBody: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },
}));

const EmojiOptions = (props) => {
  const { disabled, showEmoji, setShowEmoji, handleAddEmoji } = props;
  const classes = useStyles();
  const pickerRef = useRef();

  useEffect(() => {
    if (!showEmoji) return;
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji, setShowEmoji]);

  return (
    <>
      <IconButton
        aria-label="emojiPicker"
        component="span"
        disabled={disabled}
        onClick={(e) => setShowEmoji((prevState) => !prevState)}
      >
        <MoodIcon className={classes.sendMessageIcons} />
      </IconButton>
      {showEmoji ? (
        <div className={classes.emojiBox} ref={pickerRef}>
          <Picker
            perLine={16}
            showPreview={false}
            showSkinTones={false}
            onSelect={handleAddEmoji}
          />
        </div>
      ) : null}
    </>
  );
};

const SignSwitch = (props) => {
  const { width, setSignMessage, signMessage } = props;
  if (isWidthUp("md", width)) {
    return (
      <FormControlLabel
        style={{ marginRight: 7, color: "gray" }}
        label={i18n.t("messagesInput.signMessage")}
        labelPlacement="start"
        control={
          <Switch
            size="small"
            checked={signMessage}
            onChange={(e) => {
              setSignMessage(e.target.checked);
            }}
            name="showAllTickets"
            color="primary"
          />
        }
      />
    );
  }
  return null;
};

const FileInput = (props) => {
  const { handleChangeMedias, disableOption } = props;
  const classes = useStyles();
  return (
    <>
      <input
        multiple
        type="file"
        id="upload-button"
        disabled={disableOption()}
        className={classes.uploadInput}
        onChange={handleChangeMedias}
      />
      <label htmlFor="upload-button">
        <IconButton
          aria-label="upload"
          component="span"
          disabled={disableOption()}
        >
          <AttachFileIcon className={classes.sendMessageIcons} />
        </IconButton>
      </label>
    </>
  );
};

const ActionButtons = (props) => {
  const {
    inputMessage,
    loading,
    recording,
    ticketStatus,
    handleSendMessage,
    handleCancelAudio,
    handleUploadAudio,
    handleStartRecording,
  } = props;
  const classes = useStyles();
  if (inputMessage) {
    return (
      <Tooltip title={i18n.t("chat.tooltips.sendMessage")}>
        <span>
          <IconButton
            aria-label="sendMessage"
            component="span"
            onClick={handleSendMessage}
            disabled={loading}
          >
            <SendIcon className={classes.sendMessageIcons} />
          </IconButton>
        </span>
      </Tooltip>
    );
  } else if (recording) {
    return (
      <div className={classes.recorderWrapper}>
        <Tooltip title={i18n.t("chat.tooltips.cancelRecording")}>
          <span>
            <IconButton
              aria-label="cancelRecording"
              component="span"
              fontSize="large"
              disabled={loading}
              onClick={handleCancelAudio}
            >
              <HighlightOffIcon className={classes.cancelAudioIcon} />
            </IconButton>
          </span>
        </Tooltip>
        {loading ? (
          <div>
            <CircularProgress className={classes.audioLoading} />
          </div>
        ) : (
          <RecordingTimer />
        )}

        <Tooltip title={i18n.t("chat.tooltips.sendRecordedAudio")}>
          <span>
            <IconButton
              aria-label="sendRecordedAudio"
              component="span"
              onClick={handleUploadAudio}
              disabled={loading}
            >
              <CheckCircleOutlineIcon className={classes.sendAudioIcon} />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return (
      <Tooltip title={i18n.t("chat.tooltips.recordAudio")}>
        <span>
          <IconButton
            aria-label="showRecorder"
            component="span"
            disabled={loading || ticketStatus !== "open"}
            onClick={handleStartRecording}
          >
            <MicIcon className={classes.sendMessageIcons} />
          </IconButton>
        </span>
      </Tooltip>
    );
  }
};

const CustomInput = (props) => {
  const {
    loading,
    inputRef,
    ticketStatus,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleInputPaste,
    disableOption,
    handleQuickAnswersClick,
    medias,
    setMedias,
    setShowFileUploadModal
  } = props;
  const classes = useStyles();
  const [quickMessages, setQuickMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const { user } = useContext(AuthContext);

  const { list: listQuickMessages } = useQuickMessages();

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const messages = await listQuickMessages({ companyId, userId: user.id });
      const options = messages.map((m) => {
        let truncatedMessage = m.message;
        if (isString(truncatedMessage) && truncatedMessage.length > 35) {
          truncatedMessage = m.message.substring(0, 35) + "...";
        }
        return {
          value: m.message,
          label: `/${m.shortcode} - ${truncatedMessage}`,
          mediaPath: m.mediaPath,
          mediaName: m.mediaName
        };
      });
      setQuickMessages(options);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (
      isString(inputMessage) &&
      !isEmpty(inputMessage) &&
      inputMessage.length > 1
    ) {
      const firstWord = inputMessage.charAt(0);
      setPopupOpen(firstWord.indexOf("/") > -1);

      const searchTerm = inputMessage.toLowerCase().replace("/", "");
      const filteredOptions = quickMessages.filter(
        (m) => m.label.toLowerCase().indexOf(searchTerm) > -1
      );
      setOptions(filteredOptions);
    } else {
      setPopupOpen(false);
      setOptions([]);
    }
  }, [inputMessage]);

  const handlePaste = (e) => {
    if (ticketStatus !== "open" || !isInputFocused) return;
    
    // Se houver texto, permite o comportamento padrão
    if (e.clipboardData.getData('text')) {
      return;
    }
    
    // Se houver arquivos no clipboard
    if (e.clipboardData.items) {
      e.preventDefault();
      
      const validFiles = [];
      const promises = [];
      
      // Itera sobre todos os itens do clipboard
      const items = Array.from(e.clipboardData.items);
      
      // Processa cada item do clipboard
      items.forEach(item => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          
          // Para imagens coladas diretamente, precisamos criar um novo arquivo
          if (file.type.startsWith('image/')) {
            promises.push(
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const img = new Image();
                  img.src = e.target.result;
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                      const newFile = new File([blob], `pasted-image-${Date.now()}.png`, {
                        type: file.type
                      });
                      resolve(newFile);
                    }, file.type);
                  };
                };
                reader.readAsDataURL(file);
              })
            );
          } else {
            validFiles.push(file);
          }
        }
      });

      // Aguarda todas as promessas de processamento de imagem serem resolvidas
      Promise.all(promises).then((processedFiles) => {
        const allFiles = [...validFiles, ...processedFiles];
        if (allFiles.length > 0) {
          setMedias(allFiles);
          setShowFileUploadModal(true);
        } else {
          toastError(new Error(i18n.t("messagesInput.errors.invalidFileType")));
        }
      });
    }
  };

  const onKeyPress = (e) => {
    if (loading || e.shiftKey) return;
    else if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const renderPlaceholder = () => {
    if (ticketStatus === "open") {
      return i18n.t("messagesInput.placeholderOpen");
    }
    return i18n.t("messagesInput.placeholderClosed");
  };

  const setInputRef = (input) => {
    if (input) {
      input.focus();
      inputRef.current = input;
    }
  };

  return (
    <div className={classes.messageInputWrapper}>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files.length > 0) {
            handleInputPaste(e);
          }
        }}
      />
      <Autocomplete
        freeSolo
        open={popupOpen}
        id="grouped-demo"
        value={inputMessage}
        options={options}
        closeIcon={null}
        disabled={disableOption()}
        getOptionLabel={(option) => {
          if (isObject(option)) {
            return option.label;
          } else {
            return option;
          }
        }}
        onChange={(event, opt) => {
          if (disableOption()) return;
          if (isObject(opt) && has(opt, "value") && isNil(opt.mediaPath)) {
            setInputMessage(opt.value);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          } else if (isObject(opt) && has(opt, "value") && !isNil(opt.mediaPath)) {
            handleQuickAnswersClick(opt);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          }
        }}
        onInputChange={(event, opt, reason) => {
          if (disableOption()) return;
          if (reason === "input") {
            setInputMessage(event.target.value);
          }
        }}
        onKeyPress={onKeyPress}
        style={{ width: "100%" }}
        renderInput={(params) => {
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <InputBase
              {...params.InputProps}
              {...rest}
              disabled={disableOption()}
              inputRef={setInputRef}
              placeholder={renderPlaceholder()}
              multiline
              className={classes.messageInput}
              maxRows={5}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onPaste={handlePaste}
            />
          );
        }}
      />
    </div>
  );
};

const MessageInputCustom = (props) => {
  const { ticketStatus, ticketId } = props;
  const classes = useStyles();

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef();
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showQuickMessageModal, setShowQuickMessageModal] = useState(false);
  const [quickMessageData, setQuickMessageData] = useState(null);

  useEffect(() => {
    inputRef.current.focus();
  }, [replyingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
    };
  }, [ticketId, setReplyingMessage]);

  // const handleChangeInput = e => {
  // 	if (isObject(e) && has(e, 'value')) {
  // 		setInputMessage(e.value);
  // 	} else {
  // 		setInputMessage(e.target.value)
  // 	}
  // };

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e) => {
    // Se for um evento de paste, verifica se há texto
    if (e.clipboardData && e.clipboardData.getData('text')) {
      // Permite que o texto seja colado normalmente
      return;
    }

    // Se for um evento de change do input file
    if (e.target.files) {
      const selectedMedias = Array.from(e.target.files);
      setMedias(selectedMedias);
      setShowFileUploadModal(true);
      return;
    }

    // Se for um evento de paste com arquivos
    if (e.clipboardData && e.clipboardData.items) {
      e.preventDefault();
      
      const validFiles = [];
      const promises = [];
      
      // Itera sobre todos os itens do clipboard
      const items = Array.from(e.clipboardData.items);
      
      // Processa cada item do clipboard
      items.forEach(item => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          
          // Para imagens coladas diretamente, precisamos criar um novo arquivo
          if (file.type.startsWith('image/')) {
            promises.push(
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const img = new Image();
                  img.src = e.target.result;
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                      const newFile = new File([blob], `pasted-image-${Date.now()}.png`, {
                        type: file.type
                      });
                      resolve(newFile);
                    }, file.type);
                  };
                };
                reader.readAsDataURL(file);
              })
            );
          } else {
            validFiles.push(file);
          }
        }
      });

      // Aguarda todas as promessas de processamento de imagem serem resolvidas
      Promise.all(promises).then((processedFiles) => {
        const allFiles = [...validFiles, ...processedFiles];
        if (allFiles.length > 0) {
          setMedias(allFiles);
          setShowFileUploadModal(true);
        } else {
          toastError(new Error(i18n.t("messagesInput.errors.invalidFileType")));
        }
      });
    }
  };

  const handleUploadQuickMessageMedia = async (blob, message) => {
    setLoading(true);
    try {
      const extension = blob.type.split("/")[1];

      const formData = new FormData();
      const filename = `${new Date().getTime()}.${extension}`;
      formData.append("medias", blob, filename);
      formData.append("body",  message);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
    setLoading(false);
  };
  
  const handleQuickAnswersClick = async (value) => {
    if (value.mediaPath) {
      try {
        const response = await axios.get(value.mediaPath, {
          responseType: "blob",
        });

        // Extrair o tipo MIME do cabeçalho Content-Type
        const contentType = response.headers['content-type'];

        // Usar o nome original do arquivo da mensagem rápida
        const fileName = value.mediaName || value.mediaPath.split('/').pop() || 'arquivo';

        // Criar um arquivo a partir do blob com o tipo MIME correto
        const file = new File([response.data], fileName, {
          type: contentType
        });

        // Abrir a modal específica para mensagens rápidas
        setQuickMessageData({
          message: value.value || "",
          file: file
        });
        setShowQuickMessageModal(true);
      } catch (err) {
        console.error('Erro ao processar anexo:', err);
        toastError(err);
      }
    } else {
      setInputMessage(value.value);
    }
  };

  const handleQuickMessageSend = async ({ message, file }) => {
    setLoading(true);
    try {
      if (file) {
        const formData = new FormData();
        formData.append("medias", file);
        formData.append("body", message ? message.trim() : file.name);
        formData.append("fromMe", true);
        await api.post(`/messages/${ticketId}`, formData);
      } else if (message) {
        const messageData = {
          read: 1,
          fromMe: true,
          mediaUrl: "",
          body: signMessage
            ? `*${user?.name}:*\n${message.trim()}`
            : message.trim(),
          quotedMsg: replyingMessage,
        };
        await api.post(`/messages/${ticketId}`, messageData);
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem rápida:', err);
      toastError(err);
    }
    setLoading(false);
    setQuickMessageData(null);
    setShowQuickMessageModal(false);
    // Limpar o input
    setInputMessage("");
  };

  const handleUploadMedia = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `audio-record-site-${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const disableOption = () => {
    return loading || recording || ticketStatus !== "open";
  };

  const renderReplyingMessage = (message) => {
    return (
      <div className={classes.replyginMsgWrapper}>
        <div className={classes.replyginMsgContainer}>
          <span
            className={clsx(classes.replyginContactMsgSideColor, {
              [classes.replyginSelfMsgSideColor]: !message.fromMe,
            })}
          ></span>
          <div className={classes.replyginMsgBody}>
            {!message.fromMe && (
              <span className={classes.messageContactName}>
                {message.contact?.name}
              </span>
            )}
            {message.body}
          </div>
        </div>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
        >
          <ClearIcon className={classes.sendMessageIcons} />
        </IconButton>
      </div>
    );
  };

  return (
    <Paper square elevation={0} className={classes.mainWrapper}>
      {replyingMessage && renderReplyingMessage(replyingMessage)}
      <div className={classes.newMessageBox}>
        <Tooltip title={i18n.t("chat.tooltips.emojis")}>
          <span>
            <EmojiOptions
              disabled={disableOption()}
              handleAddEmoji={handleAddEmoji}
              showEmoji={showEmoji}
              setShowEmoji={setShowEmoji}
            />
          </span>
        </Tooltip>

        <Tooltip title={i18n.t("chat.tooltips.attachFile")}>
          <span>
            <IconButton
              aria-label="upload"
              component="span"
              disabled={disableOption()}
              onClick={() => setShowFileUploadModal(true)}
            >
              <AttachFileIcon className={classes.sendMessageIcons} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={i18n.t("quickMessages.tooltip")}>
          <span>
            <IconButton
              aria-label="quickMessage"
              component="span"
              disabled={disableOption()}
              onClick={() => {
                setQuickMessageData({
                  message: "",
                  file: null
                });
                setShowQuickMessageModal(true);
              }}
            >
              <MessageIcon className={classes.sendMessageIcons} />
            </IconButton>
          </span>
        </Tooltip>

        <SignSwitch
          width={props.width}
          setSignMessage={setSignMessage}
          signMessage={signMessage}
        />

        <CustomInput
          loading={loading}
          inputRef={inputRef}
          ticketStatus={ticketStatus}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          handleInputPaste={handleInputPaste}
          disableOption={disableOption}
          handleQuickAnswersClick={handleQuickAnswersClick}
          medias={medias}
          setMedias={setMedias}
          setShowFileUploadModal={setShowFileUploadModal}
        />

        <ActionButtons
          inputMessage={inputMessage}
          loading={loading}
          recording={recording}
          ticketStatus={ticketStatus}
          handleSendMessage={handleSendMessage}
          handleCancelAudio={handleCancelAudio}
          handleUploadAudio={handleUploadAudio}
          handleStartRecording={handleStartRecording}
        />
      </div>
      <QuickMessageUploadModal
        open={showQuickMessageModal}
        onClose={() => {
          setShowQuickMessageModal(false);
          setQuickMessageData(null);
          // Limpar o input quando a modal é fechada
          setInputMessage("");
        }}
        onSend={handleQuickMessageSend}
        initialMessage={quickMessageData?.message}
        initialFile={quickMessageData?.file}
      />
      <FileUploadModal
        open={showFileUploadModal}
        onClose={() => {
          setShowFileUploadModal(false);
          setMedias([]);
        }}
        initialFiles={medias}
        onUpload={async (filesWithDescriptions) => {
          setLoading(true);
          
          try {
            // Enviar cada arquivo individualmente para manter a ordem e as descrições
            for (let i = 0; i < filesWithDescriptions.length; i++) {
              const { file, description } = filesWithDescriptions[i];
              
              const formData = new FormData();
              formData.append("fromMe", true);
              formData.append("medias", file);
              formData.append("body", description || file.name);
              formData.append("index", i.toString());
              
              await api.post(`/messages/${ticketId}`, formData);
            }
            
            setShowFileUploadModal(false);
            setMedias([]);
          } catch (err) {
            toastError(err);
          } finally {
            setLoading(false);
          }
        }}
      />
    </Paper>
  );
};

export default withWidth()(MessageInputCustom);
