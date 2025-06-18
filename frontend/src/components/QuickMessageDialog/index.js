import React, { useContext, useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import LinearProgress from "@material-ui/core/LinearProgress";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";
import { head } from "lodash";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import MessageVariablesPicker from "../MessageVariablesPicker";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { i18n } from "../../translate/i18n";

import {
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Box,
    Typography,
} from "@material-ui/core";
import ConfirmationModal from "../ConfirmationModal";

const path = require('path');

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
        },
    },
    btnWrapper: {
        position: "relative",
    },
    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    colorAdorment: {
        width: 20,
        height: 20,
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
    loadingContainer: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    loadingText: {
        marginBottom: theme.spacing(1),
        color: theme.palette.text.secondary,
    },
}));

const QuickeMessageSchema = Yup.object().shape({
    shortcode: Yup.string().required(i18n.t("quickMessages.dialog.shortcode")),
    message: Yup.string().required(i18n.t("quickMessages.dialog.message")),
});

const QuickMessageDialog = ({ open, onClose, quickemessageId, reload }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);
    const { profile } = user;
    const messageInputRef = useRef();

    const initialState = {
        shortcode: "",
        message: "",
        geral: false,
        status: true,
        visibility: "me"
    };

    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [quickemessage, setQuickemessage] = useState(initialState);
    const [attachment, setAttachment] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const attachmentFile = useRef(null);

    useEffect(() => {
        try {
            (async () => {
                if (!quickemessageId) return;

                const { data } = await api.get(`/quick-messages/${quickemessageId}`);

                setQuickemessage((prevState) => {
                    return { ...prevState, ...data };
                });
            })();
        } catch (err) {
            toastError(err);
        }
    }, [quickemessageId, open]);

    const handleClose = () => {
        setQuickemessage(initialState);
        setAttachment(null);
        onClose();
    };

    const handleAttachmentFile = (e) => {
        const file = head(e.target.files);
        if (file) {
            setAttachment(file);
        }
    };

    const handleSaveQuickeMessage = async (values) => {
        setIsSaving(true);
        const quickemessageData = { 
            ...values, 
            isMedia: true, 
            mediaPath: attachment ? String(attachment.name).replace(/ /g, "_") : values.mediaPath ? path.basename(values.mediaPath).replace(/ /g, "_") : null 
        };

        try {
            if (quickemessageId) {
                await api.put(`/quick-messages/${quickemessageId}`, quickemessageData);
                if (attachment != null) {
                    setIsUploading(true);
                    const formData = new FormData();
                    formData.append("typeArch", "quickMessage");
                    formData.append("file", attachment);
                    await api.post(
                        `/quick-messages/${quickemessageId}/media-upload`,
                        formData
                    );
                }
            } else {
                const { data } = await api.post("/quick-messages", quickemessageData);
                if (attachment != null) {
                    setIsUploading(true);
                    const formData = new FormData();
                    formData.append("typeArch", "quickMessage");
                    formData.append("file", attachment);
                    await api.post(`/quick-messages/${data.id}/media-upload`, formData);
                }
            }
            toast.success(i18n.t("quickMessages.toasts.success"));
            if (typeof reload == "function") {
                reload();
            }
        } catch (err) {
            toastError(err);
        } finally {
            setIsSaving(false);
            setIsUploading(false);
            handleClose();
        }
    };

    const deleteMedia = async () => {
        try {
            await api.delete(`/quick-messages/${quickemessageId}/media-upload`);
            setQuickemessage((prevState) => {
                return { ...prevState, mediaPath: null, mediaName: null };
            });
            setAttachment(null);
            setConfirmationOpen(false);
        } catch (err) {
            toastError(err);
        }
    };

    const handleClickMsgVar = (value, setFieldValue) => {
        const messageInput = messageInputRef.current;
        const startPos = messageInput.selectionStart;
        const endPos = messageInput.selectionEnd;
        const message = messageInput.value;
        const newMessage = message.substring(0, startPos) + value + message.substring(endPos);
        setFieldValue("message", newMessage);
        setTimeout(() => {
            messageInput.focus();
            messageInput.setSelectionRange(startPos + value.length, startPos + value.length);
        }, 0);
    };

    return (
        <div className={classes.root}>
            <ConfirmationModal
                title={i18n.t("quickMessages.confirmationModal.deleteTitle")}
                open={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
                onConfirm={deleteMedia}
            >
                {i18n.t("quickMessages.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
                    {quickemessageId
                        ? `${i18n.t("quickMessages.dialog.edit")}`
                        : `${i18n.t("quickMessages.dialog.add")}`}
                </DialogTitle>
                <div style={{ display: "none" }}>
                    <input
                        type="file"
                        ref={attachmentFile}
                        onChange={(e) => handleAttachmentFile(e)}
                    />
                </div>
                <Formik
                    initialValues={quickemessage}
                    enableReinitialize={true}
                    validationSchema={QuickeMessageSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveQuickeMessage(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, setFieldValue, values }) => (
                        <Form>
                            <DialogContent dividers>
                                <Grid spacing={2} container>
                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            autoFocus
                                            label={i18n.t("quickMessages.dialog.shortcode")}
                                            name="shortcode"
                                            error={touched.shortcode && Boolean(errors.shortcode)}
                                            helperText={touched.shortcode && errors.shortcode}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            disabled={isUploading || isSaving}
                                        />
                                    </Grid>
                                    <Grid xs={12} item>
                                        <FormControl variant="outlined" fullWidth>
                                            <InputLabel>{i18n.t("quickMessages.table.visibility")}</InputLabel>
                                            <Field
                                                as={Select}
                                                name="visibility"
                                                label={i18n.t("quickMessages.table.visibility")}
                                                disabled={isUploading || isSaving}
                                            >
                                                <MenuItem value="me">{i18n.t("quickMessages.visibilityMe")}</MenuItem>
                                                <MenuItem value="all">{i18n.t("quickMessages.visibilityAll")}</MenuItem>
                                            </Field>
                                        </FormControl>
                                    </Grid>
                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("quickMessages.dialog.message")}
                                            name="message"
                                            inputRef={messageInputRef}
                                            error={touched.message && Boolean(errors.message)}
                                            helperText={touched.message && errors.message}
                                            variant="outlined"
                                            margin="dense"
                                            multiline={true}
                                            rows={7}
                                            fullWidth
                                            disabled={isUploading || isSaving}
                                        />
                                    </Grid>
                                    <Grid xs={12} item>
                                        <MessageVariablesPicker
                                            disabled={isUploading || isSaving}
                                            onClick={value => handleClickMsgVar(value, setFieldValue)}
                                        />
                                    </Grid>
                                    {(quickemessage.mediaPath || attachment) && (
                                        <Grid xs={12} item>
                                            <Box className={classes.attachmentBox}>
                                                <AttachFileIcon />
                                                <Typography className={classes.attachmentName}>
                                                    {attachment ? attachment.name : quickemessage.mediaName}
                                                </Typography>
                                                <IconButton
                                                    className={classes.deleteButton}
                                                    onClick={() => setConfirmationOpen(true)}
                                                    size="small"
                                                    disabled={isUploading || isSaving}
                                                >
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                    )}
                                    {(isUploading || isSaving) && (
                                        <Grid item xs={12}>
                                            <Box className={classes.loadingContainer}>
                                                <Typography className={classes.loadingText}>
                                                    {i18n.t(`quickMessages.loading.${isUploading ? "uploading" : "saving"}`)}
                                                </Typography>
                                                <LinearProgress />
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                {!attachment && !quickemessage.mediaPath && (
                                    <Button
                                        color="primary"
                                        onClick={() => attachmentFile.current.click()}
                                        disabled={isUploading || isSaving}
                                        variant="outlined"
                                    >
                                        {i18n.t("quickMessages.buttons.attach")}
                                    </Button>
                                )}
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isUploading || isSaving}
                                    variant="outlined"
                                >
                                    {i18n.t("quickMessages.buttons.cancel")}
                                </Button>
                                <div className={classes.btnWrapper}>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={isUploading || isSaving}
                                        variant="contained"
                                    >
                                        {quickemessageId
                                            ? `${i18n.t("quickMessages.buttons.edit")}`
                                            : `${i18n.t("quickMessages.buttons.add")}`}
                                    </Button>
                                    {(isUploading || isSaving) && (
                                        <CircularProgress
                                            size={24}
                                            className={classes.buttonProgress}
                                        />
                                    )}
                                </div>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default QuickMessageDialog;
