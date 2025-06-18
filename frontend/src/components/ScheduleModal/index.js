import React, { useState, useEffect, useContext, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Grid, IconButton } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import moment from "moment"
import { AuthContext } from "../../context/Auth/AuthContext";
import { isArray, capitalize } from "lodash";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import AttachFile from "@material-ui/icons/AttachFile";
import { head } from "lodash";
import ConfirmationModal from "../ConfirmationModal";
import MessageVariablesPicker from "../MessageVariablesPicker";
import FileUploadModal from "../FileUploadModal";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
		marginBottom: theme.spacing(2),
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
}));

const ScheduleSchema = Yup.object().shape({
	body: Yup.string()
		.min(5, "Mensagem muito curta")
		.required("Obrigatório"),
	contactId: Yup.number().required("Obrigatório"),
	sendAt: Yup.string().required("Obrigatório"),
	whatsappId: Yup.number().required("Obrigatório")
});

const ScheduleModal = ({ open, onClose, scheduleId, contactId, cleanContact, reload }) => {
	const classes = useStyles();
	const history = useHistory();
	const { user } = useContext(AuthContext);
	const messageInputRef = useRef();

	const initialState = {
		body: "",
		contactId: "",
		sendAt: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
		sentAt: "",
		userId: user.id,
		companyId: user.companyId,
		status: "PENDING",
		mediaPath: "",
		mediaName: "",
		mediaType: "",
		mediaList: [],
		whatsappId: ""
	};

	const initialContact = {
		id: "",
		name: ""
	}

	const [schedule, setSchedule] = useState(initialState);
	const [currentContact, setCurrentContact] = useState(initialContact);
	const [contacts, setContacts] = useState([initialContact]);
	const [whatsapps, setWhatsapps] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showFileUploadModal, setShowFileUploadModal] = useState(false);
	const [filesToUpload, setFilesToUpload] = useState([]);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

	useEffect(() => {
		if (contactId && contacts.length) {
			const contact = contacts.find(c => c.id === contactId);
			if (contact) {
				setCurrentContact(contact);
			}
		}
	}, [contactId, contacts]);

	useEffect(() => {
		const { companyId } = user;
		if (open) {
			try {
				(async () => {
					const { data: contactList } = await api.get('/contacts/list', { params: { companyId: companyId } });
					let customList = contactList.map((c) => ({ id: c.id, name: c.name }));
					if (isArray(customList)) {
						setContacts([{ id: "", name: "" }, ...customList]);
					}

					const { data: whatsappList } = await api.get('/whatsapp/', { params: { companyId: companyId } });
					setWhatsapps(whatsappList);

					if (contactId) {
						setSchedule(prevState => {
							return { ...prevState, contactId }
						});
					}

					if (!scheduleId) return;

					const { data } = await api.get(`/schedules/${scheduleId}`);
					setSchedule(prevState => {
						return { 
							...prevState, 
							...data, 
							sendAt: moment(data.sendAt).format('YYYY-MM-DDTHH:mm'),
							mediaList: data.mediaList || []
						};
					});
					setCurrentContact(data.contact);
				})()
			} catch (err) {
				toastError(err);
			}
		}
	}, [scheduleId, contactId, open, user]);

	const handleClose = () => {
		if (showFileUploadModal) {
			setShowFileUploadModal(false);
			return;
		}
		
		setSchedule(initialState);
		setCurrentContact(initialContact);
		setShowFileUploadModal(false);
		setFilesToUpload([]);
		onClose();
	};

	const handleSaveSchedule = async (values) => {
		setLoading(true);
		try {
			let scheduleData = { ...values };
			
			// Se houver arquivos para upload
			if (schedule.mediaList && schedule.mediaList.length > 0) {
				const formData = new FormData();
				
				schedule.mediaList.forEach((fileData, index) => {
					formData.append("files", fileData.file);
					formData.append("mediaType", fileData.file.type);
					formData.append("name", fileData.name);
					formData.append("description", fileData.description || "");
					formData.append("index", index.toString());
				});

				// Primeiro salva o agendamento
				let response;
				if (scheduleId) {
					response = await api.put(`/schedules/${scheduleId}`, scheduleData);
				} else {
					response = await api.post("/schedules", scheduleData);
				}

				// Depois faz o upload dos arquivos
				const { data } = await api.post(`/schedules/${response.data.id}/media-upload`, formData);
				scheduleData.mediaList = data.mediaList || [];
			} else {
				// Se não houver arquivos, apenas salva o agendamento
				if (scheduleId) {
					await api.put(`/schedules/${scheduleId}`, scheduleData);
				} else {
					await api.post("/schedules", scheduleData);
				}
			}
			
			toast.success(i18n.t("scheduleModal.success"));
			if (typeof reload == 'function') {
				reload();
			}
			if (contactId) {
				if (typeof cleanContact === 'function') {
					cleanContact();
					history.push('/schedules');
				}
			}
		} catch (err) {
			toastError(err);
		}
		setLoading(false);
		handleClose();
	};

	const handleUploadFiles = async (files) => {
		if (!files || files.length === 0) return;

		try {
			setLoading(true);
			const newMediaList = files.map(fileData => ({
				file: fileData.file,
				name: fileData.description || fileData.file.name,
				type: fileData.file.type,
				description: fileData.description || ""
			}));

			setSchedule(prev => ({
				...prev,
				mediaList: [...(prev.mediaList || []), ...newMediaList]
			}));

			toast.success(i18n.t("fileUploadModal.success"));
		} catch (err) {
			toastError(err);
		} finally {
			setLoading(false);
			setShowFileUploadModal(false);
			setFilesToUpload([]);
		}
	};

	const handleRemoveMedia = async (index) => {
		try {
			if (scheduleId) {
				await api.delete(`/schedules/${scheduleId}/media/${index}`);
				setSchedule(prev => ({
					...prev,
					mediaList: prev.mediaList.filter((_, i) => i !== index)
				}));
			} else {
				setSchedule(prev => ({
					...prev,
					mediaList: prev.mediaList.filter((_, i) => i !== index)
				}));
			}
			toast.success(i18n.t("scheduleModal.mediaRemoved"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleClickMsgVar = async (msgVar, setValueFunc) => {
		const el = messageInputRef.current;
		const firstHalfText = el.value.substring(0, el.selectionStart);
		const secondHalfText = el.value.substring(el.selectionEnd);
		const newCursorPos = el.selectionStart + msgVar.length;

		setValueFunc("body", `${firstHalfText}${msgVar}${secondHalfText}`);

		await new Promise(r => setTimeout(r, 100));
		messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{scheduleId ? i18n.t("scheduleModal.title.edit") : i18n.t("scheduleModal.title.add")}
				</DialogTitle>
				<Formik
					initialValues={schedule}
					enableReinitialize={true}
					validationSchema={ScheduleSchema}
					onSubmit={(values) => handleSaveSchedule(values)}
				>
					{({ values, touched, errors, setFieldValue, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<FormControl
										variant="outlined"
										fullWidth
									>
										<Autocomplete
											fullWidth
											value={currentContact}
											options={contacts}
											onChange={(e, contact) => {
												const contactId = contact ? contact.id : '';
												setFieldValue("contactId", contactId);
												setCurrentContact(contact ? contact : initialContact);
											}}
											getOptionLabel={(option) => option.name}
											getOptionSelected={(option, value) => {
												return value.id === option.id
											}}
											renderInput={(params) => (
												<TextField
													{...params}
													label={i18n.t("scheduleModal.form.contact")}
													variant="outlined"
													error={touched.contactId && Boolean(errors.contactId)}
													helperText={touched.contactId && errors.contactId}
												/>
											)}
										/>
									</FormControl>
								</div>
								<div className={classes.multFieldLine}>
									<FormControl
										variant="outlined"
										fullWidth
										error={touched.whatsappId && Boolean(errors.whatsappId)}
									>
										<InputLabel>{i18n.t("scheduleModal.form.whatsapp")}</InputLabel>
										<Field
											as={Select}
											value={values.whatsappId}
											onChange={(e) => setFieldValue("whatsappId", e.target.value)}
											label={i18n.t("scheduleModal.form.whatsapp")}
										>
											<MenuItem value="">
												<em>Selecione um WhatsApp</em>
											</MenuItem>
											{whatsapps.map((whatsapp) => (
												<MenuItem key={whatsapp.id} value={whatsapp.id}>
													{whatsapp.name}
												</MenuItem>
											))}
										</Field>
										{touched.whatsappId && errors.whatsappId && (
											<FormHelperText error>{errors.whatsappId}</FormHelperText>
										)}
									</FormControl>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("scheduleModal.form.body")}
										type="text"
										multiline
										rows={5}
										name="body"
										inputRef={messageInputRef}
										error={touched.body && Boolean(errors.body)}
										helperText={touched.body && errors.body}
										variant="outlined"
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("scheduleModal.form.sendAt")}
										type="datetime-local"
										name="sendAt"
										error={touched.sendAt && Boolean(errors.sendAt)}
										helperText={touched.sendAt && errors.sendAt}
										variant="outlined"
										fullWidth
										InputLabelProps={{
											shrink: true,
										}}
									/>
								</div>
								<Grid item>
									<MessageVariablesPicker
										disabled={isSubmitting}
										onClick={value => handleClickMsgVar(value, setFieldValue)}
									/>
								</Grid>
								{schedule.mediaList && schedule.mediaList.length > 0 && (
									<Grid xs={12} item>
										{schedule.mediaList.map((media, index) => (
											<div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
												<Button
													startIcon={<AttachFile />}
													onClick={() => {
														if (media.path) {
															const url = `${process.env.REACT_APP_BACKEND_URL}/public/${media.path}`;
															window.open(url, '_blank');
														}
													}}
												>
													{media.name}
												</Button>
												<IconButton
													onClick={() => handleRemoveMedia(index)}
													color="secondary"
													size="small"
												>
													<DeleteOutline />
												</IconButton>
											</div>
										))}
									</Grid>
								)}
							</DialogContent>
							<DialogActions>
								<Button
									color="primary"
									onClick={() => setShowFileUploadModal(true)}
									disabled={loading || isSubmitting}
									variant="outlined"
								>
									{i18n.t("quickMessages.buttons.attach")}
								</Button>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("scheduleModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{scheduleId
										? i18n.t("scheduleModal.buttons.okEdit")
										: i18n.t("scheduleModal.buttons.okAdd")}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
				<FileUploadModal
					open={showFileUploadModal}
					onClose={() => setShowFileUploadModal(false)}
					onUpload={handleUploadFiles}
					initialFiles={filesToUpload}
				/>
			</Dialog>
		</div>
	);
};

export default ScheduleModal;
