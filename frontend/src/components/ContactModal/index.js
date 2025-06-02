import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputMask from 'react-input-mask';
import Grid from "@material-ui/core/Grid";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import brLocale from 'date-fns/locale/pt-BR';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import moment from 'moment';

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { SocketManager } from "../../context/Socket/SocketContext";
import useWhatsApps from "../../hooks/useWhatsApps";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},

	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
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

	paper: {
		boxShadow: 'none',
	},
}));

const TAB_IDS = {
	CONTACT_DATA: 'contact_data',
	ADVANCED: 'advanced',
	CUSTOM_FIELDS: 'custom_fields'
};

const ContactSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, i18n.t("validation.minLength", { min: 2 }))
		.max(50, i18n.t("validation.maxLength", { max: 50 }))
		.required(i18n.t("validation.required")),
	number: Yup.string()
		.min(8, i18n.t("validation.minLength", { min: 8 }))
		.max(50, i18n.t("validation.maxLength", { max: 50 }))
		.required(i18n.t("validation.required")),
	email: Yup.string().nullable().email(i18n.t("validation.invalidEmail")),
	cpf: Yup.string().nullable().test('cpf', 'CPF inválido', function(value) {
		if (!value) return true;
		return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value);
	}),
	cnpj: Yup.string().nullable().test('cnpj', 'CNPJ inválido', function(value) {
		if (!value) return true;
		return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value);
	}),
	birthDate: Yup.date().nullable().transform((value) => {
		if (!value) return null;
		return value instanceof Date ? value : null;
	}),
	gender: Yup.string().nullable().oneOf(['M', 'F', 'O', null]),
	automation: Yup.boolean().nullable(),
	internalCode: Yup.string().nullable(),
	queueId: Yup.number().nullable(),
	whatsappId: Yup.number().required(i18n.t("validation.required"))
});

const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
	const classes = useStyles();
	const isMounted = useRef(true);
	const [activeTab, setActiveTab] = useState(TAB_IDS.CONTACT_DATA);

	const initialState = {
		name: "",
		number: "",
		email: "",
		cpf: "",
		cnpj: "",
		birthDate: null,
		gender: null,
		automation: true,
		internalCode: "",
		queueId: null,
		whatsappId: ""
	};

	const [contact, setContact] = useState(initialState);
	const [queues, setQueues] = useState([]);
	const [filteredQueues, setFilteredQueues] = useState([]);
	const { whatsApps, loading: loadingWhatsApps } = useWhatsApps();

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		const fetchQueues = async () => {
			try {
				const { data } = await api.get("/queue");
				setQueues(data);
				setFilteredQueues(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchQueues();
	}, []);

	useEffect(() => {
		if (contact.automation !== undefined) {
			setFilteredQueues(queues);
		}
	}, [contact.automation, queues]);

	useEffect(() => {
		const fetchContact = async () => {
			if (initialValues) {
				const formattedValues = {
					...initialValues,
					birthDate: initialValues.birthDate ? moment(initialValues.birthDate).toDate() : null
				};
				setContact(prevState => ({
					...prevState,
					...formattedValues
				}));
			}

			if (!contactId) return;

			try {
				const { data } = await api.get(`/contacts/${contactId}`);
				if (isMounted.current) {
					const formattedData = {
						...data,
						birthDate: data.birthDate ? moment(data.birthDate).toDate() : null
					};
					setContact(formattedData);
				}
			} catch (err) {
				toastError(err);
			}
		};

		// Add socket listener for contact updates
		const socket = SocketManager.getSocket(api.getCompanyId());
		if (socket) {
			socket.on(`company-${api.getCompanyId()}-contact`, data => {
				if (data.action === "update" && data.contact.id === contactId) {
					setContact(data.contact);
				}
			});
		}

		fetchContact();

		return () => {
			if (socket) {
				socket.off(`company-${api.getCompanyId()}-contact`);
			}
		};
	}, [contactId, open, initialValues]);

	const handleClose = () => {
		onClose();
		setContact(initialState);
	};

	const handleSave = async (values) => {
		try {
			if (values.automation === false && !values.queueId) {
				toastError(i18n.t("contactModal.validation.queueRequired"));
				return;
			}
			toast.info(i18n.t("contactModal.saving"));
			let response;
			if (contactId) {
				response = await api.put(`/contacts/${contactId}`, values);
			} else {
				response = await api.post("/contacts", values);
			}
			toast.success(i18n.t("contactModal.success"));
			
			// Emit socket event for contact update
			const socket = SocketManager.getSocket(api.getCompanyId());
			if (socket) {
				socket.emit("contact", {
					action: "update",
					contact: response.data
				});
			}
			
			if (onSave) {
				onSave();
			}
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	const handleTabChange = (_, newValue) => {
		setActiveTab(newValue);
	};

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
				<DialogTitle id="form-dialog-title">
					{contactId
						? i18n.t("contactModal.title.edit")
						: i18n.t("contactModal.title.add")}
				</DialogTitle>
				<Formik
					initialValues={contact}
					enableReinitialize={true}
					validationSchema={ContactSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSave(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, errors, touched, isSubmitting, setFieldValue }) => (
						<Form>
							<div>
								<Tabs
									value={activeTab}
									indicatorColor="primary"
									textColor="primary"
									onChange={handleTabChange}
									aria-label="contact tabs"
								>
									<Tab value={TAB_IDS.CONTACT_DATA} label={i18n.t("contactModal.tabs.contactData")} />
									<Tab value={TAB_IDS.ADVANCED} label={i18n.t("contactModal.tabs.advanced")} />
									<Tab value={TAB_IDS.CUSTOM_FIELDS} label={i18n.t("contactModal.tabs.customFields")} />
								</Tabs>

								{activeTab === TAB_IDS.CONTACT_DATA && (
									<Paper className={classes.paper}>
										<DialogContent dividers>
											<Grid container spacing={2}>
												<Grid item xs={12}>
													<Field
														as={TextField}
														label={i18n.t("contactModal.form.name") + " *"}
														name="name"
														autoFocus
														autoComplete="off"
														error={touched.name && Boolean(errors.name)}
														helperText={touched.name && errors.name}
														variant="outlined"
														margin="dense"
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														as={TextField}
														label={i18n.t("contactModal.form.number") + " *"}
														name="number"
														error={touched.number && Boolean(errors.number)}
														helperText={touched.number && errors.number}
														placeholder={i18n.t("contactModal.form.numberPlaceholder")}
														variant="outlined"
														margin="dense"
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														as={TextField}
														label={i18n.t("contactModal.form.internalCode")}
														name="internalCode"
														error={touched.internalCode && Boolean(errors.internalCode)}
														helperText={touched.internalCode && errors.internalCode}
														variant="outlined"
														margin="dense"
														fullWidth
													/>
												</Grid>
												<Grid item xs={12}>
													<Field
														as={TextField}
														label={i18n.t("contactModal.form.email")}
														name="email"
														error={touched.email && Boolean(errors.email)}
														helperText={touched.email && errors.email}
														placeholder={i18n.t("contactModal.form.emailPlaceholder")}
														variant="outlined"
														margin="dense"
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field name="cpf">
														{({ field }) => (
															<InputMask {...field} mask="999.999.999-99" maskChar={null}>
																{(inputProps) => (
																	<TextField
																		{...inputProps}
																		label={i18n.t("contactModal.form.cpf")}
																		error={touched.cpf && Boolean(errors.cpf)}
																		helperText={touched.cpf && errors.cpf}
																		variant="outlined"
																		margin="dense"
																		fullWidth
																	/>
																)}
															</InputMask>
														)}
													</Field>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field name="cnpj">
														{({ field }) => (
															<InputMask {...field} mask="99.999.999/9999-99" maskChar={null}>
																{(inputProps) => (
																	<TextField
																		{...inputProps}
																		label={i18n.t("contactModal.form.cnpj")}
																		error={touched.cnpj && Boolean(errors.cnpj)}
																		helperText={touched.cnpj && errors.cnpj}
																		variant="outlined"
																		margin="dense"
																		fullWidth
																	/>
																)}
															</InputMask>
														)}
													</Field>
												</Grid>
												<Grid item xs={12} sm={6}>
													<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
														<DatePicker
															label={i18n.t("contactModal.form.birthDate")}
															value={values.birthDate ? new Date(values.birthDate) : null}
															onChange={(newValue) => {
																setFieldValue("birthDate", newValue);
															}}
															renderInput={(params) => (
																<TextField
																	{...params}
																	variant="outlined"
																	margin="dense"
																	fullWidth
																	error={touched.birthDate && Boolean(errors.birthDate)}
																	helperText={touched.birthDate && errors.birthDate}
																/>
															)}
														/>
													</LocalizationProvider>
												</Grid>
												<Grid item xs={12} sm={6}>
													<FormControl variant="outlined" margin="dense" fullWidth>
														<InputLabel>{i18n.t("contactModal.form.gender")}</InputLabel>
														<Field
															as={Select}
															name="gender"
															label={i18n.t("contactModal.form.gender")}
															error={touched.gender && Boolean(errors.gender)}
														>
															<MenuItem value={null}>{i18n.t("contactModal.form.select")}</MenuItem>
															<MenuItem value="M">{i18n.t("contactModal.form.male")}</MenuItem>
															<MenuItem value="F">{i18n.t("contactModal.form.female")}</MenuItem>
														</Field>
													</FormControl>
												</Grid>
											</Grid>
										</DialogContent>
									</Paper>
								)}

								{activeTab === TAB_IDS.ADVANCED && (
									<Paper className={classes.paper}>
										<DialogContent dividers>
											<Grid container spacing={2}>
												<Grid item xs={12}>
													<FormControl variant="outlined" margin="dense" fullWidth required>
														<InputLabel required>{i18n.t("contactModal.form.connection")}</InputLabel>
														<Select
															label={i18n.t("contactModal.form.connection")}
															name="whatsappId"
															value={values.whatsappId || ""}
															onChange={e => setFieldValue("whatsappId", e.target.value)}
															error={touched.whatsappId && Boolean(errors.whatsappId)}
															fullWidth
															disabled={loadingWhatsApps}
															required
															renderValue={selected => {
																if (!selected) return i18n.t("contactModal.form.select");
																const w = whatsApps.find(w => String(w.id) === String(selected));
																return w ? `${w.name}` : i18n.t("contactModal.form.select");
															}}
														>
															<MenuItem value="">{i18n.t("contactModal.form.select")}</MenuItem>
															{whatsApps.map(w => (
																<MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
															))}
														</Select>
														{touched.whatsappId && errors.whatsappId && (
															<Typography color="error" variant="caption">{errors.whatsappId}</Typography>
														)}
													</FormControl>
												</Grid>
												<Grid item xs={12} sm={6}>
													<FormControl variant="outlined" margin="dense" fullWidth>
														<InputLabel>{i18n.t("contactModal.form.automation")}</InputLabel>
														<Select
															value={values.automation ? "enabled" : "disabled"}
															onChange={e => {
																const isAutomated = e.target.value === "enabled";
																setFieldValue("automation", isAutomated);
																if (isAutomated) {
																	setFieldValue("queueId", null);
																} else {
																	setFieldValue("queueId", "");
																}
															}}
															label={i18n.t("contactModal.form.automation")}
														>
															<MenuItem value="enabled">{i18n.t("contactModal.form.automationStatus.enabled")}</MenuItem>
															<MenuItem value="disabled">{i18n.t("contactModal.form.automationStatus.disabled")}</MenuItem>
														</Select>
													</FormControl>
												</Grid>
												<Grid item xs={12} sm={6}>
													<FormControl variant="outlined" margin="dense" fullWidth>
														<InputLabel>{i18n.t("contactModal.form.queue")}</InputLabel>
														<Select
															value={values.queueId || ""}
															onChange={e => setFieldValue("queueId", e.target.value || null)}
															label={i18n.t("contactModal.form.queue")}
															disabled={values.automation}
															renderValue={(selected) => {
																if (!selected) return "";
																const queue = filteredQueues.find(q => q.id === selected);
																return queue ? queue.name : "";
															}}
														>
															<MenuItem value="">{i18n.t("contactModal.form.select")}</MenuItem>
															{filteredQueues.map(queue => (
																<MenuItem key={queue.id} value={queue.id}>
																	<ListItemIcon style={{ minWidth: 30 }}>
																		{queue.isInvisible ? (
																			<VisibilityOff style={{ color: '#757575', fontSize: 20 }} />
																		) : (
																			<Visibility style={{ color: '#4caf50', fontSize: 20 }} />
																		)}
																	</ListItemIcon>
																	<ListItemText primary={queue.name} />
																</MenuItem>
															))}
														</Select>
													</FormControl>
												</Grid>
											</Grid>
										</DialogContent>
									</Paper>
								)}

								{activeTab === TAB_IDS.CUSTOM_FIELDS && (
									<Paper className={classes.paper}>
										<DialogContent dividers>
											<FieldArray name="extraInfo">
												{({ push, remove }) => (
													<>
														{values.extraInfo &&
															values.extraInfo.length > 0 &&
															values.extraInfo.map((info, index) => (
																<div
																	className={classes.extraAttr}
																	key={`${index}-info`}
																>
																	<Field
																		as={TextField}
																		label={i18n.t("contactModal.form.extraName")}
																		name={`extraInfo.${index}.name`}
																		variant="outlined"
																		margin="dense"
																		className={classes.textField}
																	/>
																	<Field
																		as={TextField}
																		label={i18n.t("contactModal.form.extraValue")}
																		name={`extraInfo.${index}.value`}
																		variant="outlined"
																		margin="dense"
																		className={classes.textField}
																	/>
																	<IconButton
																		size="small"
																		onClick={() => remove(index)}
																	>
																		<DeleteOutlineIcon />
																	</IconButton>
																</div>
															))}
														<div className={classes.extraAttr}>
															<Button
																style={{ flex: 1, marginTop: 8 }}
																variant="outlined"
																color="primary"
																onClick={() => push({ name: "", value: "" })}
															>
																{i18n.t("contactModal.buttons.addExtraInfo")}
															</Button>
														</div>
													</>
												)}
											</FieldArray>
										</DialogContent>
									</Paper>
								)}
							</div>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
								>
									{i18n.t("contactModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									variant="contained"
									className={classes.btnWrapper}
									disabled={isSubmitting}
								>
									{contactId
										? i18n.t("contactModal.buttons.edit")
										: i18n.t("contactModal.buttons.add")}
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
			</Dialog>
		</div>
	);
};

export default ContactModal;