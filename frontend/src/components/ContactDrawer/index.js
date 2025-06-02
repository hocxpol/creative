import React, { useEffect, useState } from "react";
import moment from "moment";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Link from "@material-ui/core/Link";
import InputLabel from "@material-ui/core/InputLabel";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import CreateIcon from '@material-ui/icons/Create';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import CakeIcon from '@material-ui/icons/Cake';
import WcIcon from '@material-ui/icons/Wc';
import AndroidIcon from '@material-ui/icons/Android';
import QueueIcon from '@material-ui/icons/Queue';
import CodeIcon from '@material-ui/icons/Code';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";

import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";
import { CardHeader, Grid } from "@material-ui/core";
import { ContactForm } from "../ContactForm";
import ContactModal from "../ContactModal";
import { ContactNotes } from "../ContactNotes";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { SocketManager } from "../../context/Socket/SocketContext";

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	header: {
		display: "flex",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: theme.palette.contactdrawer, //DARK MODE PLW DESIGN//
		alignItems: "center",
		padding: theme.spacing(0, 1),
		minHeight: "73px",
		justifyContent: "flex-start",
	},
	content: {
		display: "flex",
		backgroundColor: theme.palette.contactdrawer, //DARK MODE PLW DESIGN//
		flexDirection: "column",
		padding: "8px 0px 8px 8px",
		height: "100%",
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},

	contactAvatar: {
		margin: 15,
		width: 100,
		height: 100,
	},

	contactHeader: {
		display: "flex",
		padding: 16,
		flexDirection: "column",
		alignItems: "flex-start",
		justifyContent: "flex-start",
		"& > *": {
			margin: 4,
		},
	},

	contactDetails: {
		marginTop: 8,
		padding: 8,
		display: "flex",
		flexDirection: "column",
	},
	contactExtraInfo: {
		marginTop: 4,
		padding: 6,
	},
	contactInfo: {
		display: "flex",
		alignItems: "center",
		marginBottom: 8,
		width: "100%",
	},
	contactInfoIcon: {
		marginRight: 8,
		color: theme.palette.primary.main,
	},
	contactInfoText: {
		fontSize: 14,
	},
}));

const ContactDrawer = ({ open, handleDrawerClose, contact, ticket, loading }) => {
	const classes = useStyles();
	const [modalOpen, setModalOpen] = useState(false);
	const [openForm, setOpenForm] = useState(false);
	const [contactData, setContactData] = useState(null);

	useEffect(() => {
		if (open && contact?.id) {
			const fetchContact = async () => {
				try {
					const { data } = await api.get(`/contacts/${contact.id}`);
					setContactData(data);
				} catch (err) {
					toastError(err);
				}
			};
			fetchContact();

			// Add socket listener for contact updates
			const socket = SocketManager.getSocket(api.getCompanyId());
			if (socket) {
				socket.on("contact", data => {
					if (data.action === "update" && data.contact.id === contact.id) {
						setContactData(data.contact);
					}
				});
			}

			return () => {
				if (socket) {
					socket.off("contact");
				}
			};
		}
	}, [open, contact]);

	useEffect(() => {
		setOpenForm(false);
	}, [open, contact]);

	const formatDate = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return '';
		return date.toLocaleDateString('pt-BR');
	};

	// Usar contactData se disponível, senão usar contact das props
	const displayContact = contactData || contact;

	return (
		<>
			<Drawer
				className={classes.drawer}
				variant="persistent"
				anchor="right"
				open={open}
				PaperProps={{ style: { position: "absolute" } }}
				BackdropProps={{ style: { position: "absolute" } }}
				ModalProps={{
					container: document.getElementById("drawer-container"),
					style: { position: "absolute" },
				}}
				classes={{
					paper: classes.drawerPaper,
				}}
			>
				<div className={classes.header}>
					<IconButton onClick={handleDrawerClose}>
						<CloseIcon />
					</IconButton>
					<Typography style={{ justifySelf: "center" }}>
						{i18n.t("contactDrawer.header")}
					</Typography>
				</div>
				{loading ? (
					<ContactDrawerSkeleton classes={classes} />
				) : (
					<div className={classes.content}>
						<Paper square variant="outlined" className={classes.contactHeader}>
							
							<div className={classes.contactInfo}>
								<PersonIcon className={classes.contactInfoIcon} />
								<Typography className={classes.contactInfoText} onClick={() => setOpenForm(true)} style={{ cursor: 'pointer' }}>
									{displayContact.name}
									<CreateIcon style={{fontSize: 16, marginLeft: 5}} />
								</Typography>
							</div>
							<div className={classes.contactInfo}>
								<PhoneIcon className={classes.contactInfoIcon} />
								<Link href={`tel:${displayContact.number}`} className={classes.contactInfoText}>
									{displayContact.number}
								</Link>
							</div>
							<div className={classes.contactInfo}>
								<WhatsAppIcon className={classes.contactInfoIcon} />
								{i18n.t("contactModal.form.connection")}: {displayContact.whatsapp?.name || 'Não informado'}
							</div>
							<div className={classes.contactInfo}>
								<CodeIcon className={classes.contactInfoIcon} />
								<Typography className={classes.contactInfoText}>
									{i18n.t("contactModal.form.internalCode")}: {displayContact.internalCode || 'Não informado'}
								</Typography>
							</div>
							<div className={classes.contactInfo}>
								<EmailIcon className={classes.contactInfoIcon} />
								<Link href={`mailto:${displayContact.email || '#'}`} className={classes.contactInfoText}>
									{displayContact.email || 'Não informado'}
								</Link>
							</div>
							<div className={classes.contactInfo}>
								<PersonIcon className={classes.contactInfoIcon} />
								<Typography className={classes.contactInfoText}>
									{i18n.t("contactModal.form.cpf")}: {displayContact.cpf || 'Não informado'}
								</Typography>
							</div>
							<div className={classes.contactInfo}>
								<BusinessIcon className={classes.contactInfoIcon} />
								<Typography className={classes.contactInfoText}>
									{i18n.t("contactModal.form.cnpj")}: {displayContact.cnpj || 'Não informado'}
								</Typography>
							</div>
							<div className={classes.contactInfo}>
								<CakeIcon className={classes.contactInfoIcon} />
								<Typography className={classes.contactInfoText}>
									{i18n.t("contactModal.form.birthDate")}: {displayContact.birthDate ? moment(displayContact.birthDate).format('DD/MM/YYYY') : 'Não informado'}
								</Typography>
							</div>
							<div className={classes.contactInfo}>
								<WcIcon className={classes.contactInfoIcon} />
								<Typography className={classes.contactInfoText}>
									{i18n.t("contactModal.form.gender")}: {displayContact.gender ? (displayContact.gender === 'M' ? i18n.t("contactModal.form.male") : i18n.t("contactModal.form.female")) : 'Não informado'}
								</Typography>
							</div>
							<div className={classes.contactInfo}>
								<AndroidIcon className={classes.contactInfoIcon} style={{ color: displayContact.automation ? '#2196f3' : '#757575' }} />
								<Typography className={classes.contactInfoText}>
									{i18n.t("contactModal.form.automation")}: {displayContact.automation ? i18n.t("contactModal.form.automationStatus.enabled") : i18n.t("contactModal.form.automationStatus.disabled")}
								</Typography>
							</div>
							<div className={classes.contactInfo}>
								<QueueIcon className={classes.contactInfoIcon} />
								<Typography className={classes.contactInfoText}>
									{i18n.t("contactModal.form.queue")}: {displayContact.queue ? displayContact.queue.name : 'Não informado'}
								</Typography>
							</div>
							
							<Button
								variant="outlined"
								color="primary"
								onClick={() => setModalOpen(!openForm)}
								style={{marginTop: 16, width: '100%'}}
							>
								{i18n.t("contactDrawer.buttons.edit")}
							</Button>
							{(displayContact.id && openForm) && <ContactForm initialContact={displayContact} onCancel={() => setOpenForm(false)} />}
						</Paper>
						<Paper square variant="outlined" className={classes.contactDetails}>
							<Typography variant="subtitle1" style={{marginBottom: 10}}>
								{i18n.t("ticketOptionsMenu.appointmentsModal.title")}
							</Typography>
							<ContactNotes ticket={ticket} />
						</Paper>
						<Paper square variant="outlined" className={classes.contactDetails}>
							<ContactModal
								open={modalOpen}
								onClose={() => setModalOpen(false)}
								contactId={displayContact.id}
							></ContactModal>
							<Typography variant="subtitle1">
								{i18n.t("contactDrawer.extraInfo")}
							</Typography>
							{displayContact?.extraInfo?.map(info => (
								<Paper
									key={info.id}
									square
									variant="outlined"
									className={classes.contactExtraInfo}
								>
									<InputLabel>{info.name}</InputLabel>
									<Typography component="div" noWrap style={{ paddingTop: 2 }}>
										<MarkdownWrapper>{info.value}</MarkdownWrapper>
									</Typography>
								</Paper>
							))}
						</Paper>
					</div>
				)}
			</Drawer>
		</>
	);
};

export default ContactDrawer;
