import React, { useState, useContext } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import ForwardIcon from "@material-ui/icons/Forward";
import ReplyIcon from "@material-ui/icons/Reply";
import DeleteIcon from "@material-ui/icons/Delete";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import GetAppIcon from "@material-ui/icons/GetApp";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import ForwardMessageModal from "../ForwardMessageModal";
import { toast } from "react-toastify";

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
	const { setReplyingMessage } = useContext(ReplyMessageContext);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [forwardModalOpen, setForwardModalOpen] = useState(false);

	const handleDeleteMessage = async () => {
		try {
			await api.delete(`/messages/${message.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const hanldeReplyMessage = () => {
		setReplyingMessage(message);
		handleClose();
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	const handleOpenForwardModal = () => {
		setForwardModalOpen(true);
		handleClose();
	};

	const handleCopyMessage = () => {
		navigator.clipboard.writeText(message.body);
		toast.success(i18n.t("messageOptionsMenu.copied"));
		handleClose();
	};

	const handleDownload = () => {
		if (message.mediaUrl) {
			window.open(message.mediaUrl, '_blank');
		}
		handleClose();
	};

	const hasMedia = () => {
		return message.mediaUrl || 
			message.mediaType === "image" || 
			message.mediaType === "audio" || 
			message.mediaType === "video" || 
			message.mediaType === "document" ||
			message.mediaType === "application";
	};

	return (
		<>
			<ConfirmationModal
				title={i18n.t("messageOptionsMenu.confirmationModal.title")}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteMessage}
			>
				{i18n.t("messageOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<ForwardMessageModal
				open={forwardModalOpen}
				onClose={() => setForwardModalOpen(false)}
				message={message}
			/>
			<Menu
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={menuOpen}
				onClose={handleClose}
			>
				{message.fromMe && (
					<MenuItem onClick={handleOpenConfirmationModal}>
						<DeleteIcon style={{ marginRight: 8 }} />
						{i18n.t("messageOptionsMenu.delete")}
					</MenuItem>
				)}
				<MenuItem onClick={hanldeReplyMessage}>
					<ReplyIcon style={{ marginRight: 8 }} />
					{i18n.t("messageOptionsMenu.reply")}
				</MenuItem>
				<MenuItem onClick={handleCopyMessage}>
					<FileCopyIcon style={{ marginRight: 8 }} />
					{i18n.t("messageOptionsMenu.copy")}
				</MenuItem>
				{hasMedia() && (
					<MenuItem onClick={handleDownload}>
						<GetAppIcon style={{ marginRight: 8 }} />
						{i18n.t("messageOptionsMenu.download")}
					</MenuItem>
				)}
				<MenuItem onClick={handleOpenForwardModal}>
					<ForwardIcon style={{ marginRight: 8 }} />
					{i18n.t("messageOptionsMenu.forward")}
				</MenuItem>
			</Menu>
		</>
	);
};

export default MessageOptionsMenu;
