import React, { useState, useEffect, useContext } from "react";

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
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";

const useStyles = makeStyles(theme => ({
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
	maxWidth: {
		width: "100%",
	},
	divider: {
		margin: theme.spacing(2, 0),
		display: "flex",
		alignItems: "center",
		"&::before, &::after": {
			content: '""',
			flex: 1,
			borderBottom: `1px solid ${theme.palette.divider}`,
		},
	},
	dividerText: {
		margin: theme.spacing(0, 2),
		color: theme.palette.text.secondary,
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, i18n.t("validation.minLength", { min: 2 }))
		.max(50, i18n.t("validation.maxLength", { max: 50 }))
		.required(i18n.t("validation.required")),
	password: Yup.string()
		.min(5, i18n.t("validation.minLength", { min: 5 }))
		.max(50, i18n.t("validation.maxLength", { max: 50 })),
	email: Yup.string()
		.email(i18n.t("validation.invalidEmail"))
		.required(i18n.t("validation.required")),
});

const UserModal = ({ open, onClose, userId }) => {
	const classes = useStyles();
	const [showPassword, setShowPassword] = useState(false);

	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
		allTicket: "desabled"
	};

	const { user: loggedInUser } = useContext(AuthContext);

	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [whatsappId, setWhatsappId] = useState(false);
	const { loading, whatsApps } = useWhatsApps();

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => {
					return { ...prevState, ...data };
				});
				const userQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(userQueueIds);
				setWhatsappId(data.whatsappId ? data.whatsappId : '');
			} catch (err) {
				toastError(err);
			}
		};

		fetchUser();
	}, [userId, open]);

	const handleClose = () => {
		onClose();
		setUser(initialState);
	};

	const handleSaveUser = async values => {
		const userData = { ...values, whatsappId, queueIds: selectedQueueIds, allTicket: values.allTicket };
		try {
			if (userId) {
				await api.put(`/users/${userId}`, userData);
			} else {
				await api.post("/users", userData);
			}
			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			toastError(err);
		}
		handleClose();
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
					{userId
						? `${i18n.t("userModal.title.edit")}`
						: `${i18n.t("userModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveUser(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<Field
											as={TextField}
											label={i18n.t("userModal.form.name")}
											autoFocus
											name="name"
											error={touched.name && Boolean(errors.name)}
											helperText={touched.name && errors.name}
											variant="outlined"
											margin="dense"
											fullWidth
											autoComplete="off"
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											as={TextField}
											label={i18n.t("userModal.form.password")}
											type={showPassword ? "text" : "password"}
											name="password"
											error={touched.password && Boolean(errors.password)}
											helperText={touched.password && errors.password}
											variant="outlined"
											margin="dense"
											fullWidth
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														<IconButton
															aria-label="toggle password visibility"
															onClick={() => setShowPassword(!showPassword)}
															edge="end"
														>
															{showPassword ? <VisibilityOff /> : <Visibility />}
														</IconButton>
													</InputAdornment>
												),
											}}
										/>
									</Grid>
									<Grid item xs={12}>
										<Field
											as={TextField}
											label={i18n.t("userModal.form.email")}
											name="email"
											error={touched.email && Boolean(errors.email)}
											helperText={touched.email && errors.email}
											variant="outlined"
											margin="dense"
											fullWidth
										/>
									</Grid>
									<Grid item xs={12}>
										<FormControl
											variant="outlined"
											className={classes.maxWidth}
											margin="dense"
										>
											<Can
												role={loggedInUser.profile}
												perform="user-modal:editProfile"
												yes={() => (
													<>
														<InputLabel id="profile-selection-input-label">
															{i18n.t("userModal.form.profile")}
														</InputLabel>

														<Field
															as={Select}
															label={i18n.t("userModal.form.profile")}
															name="profile"
															labelId="profile-selection-label"
															id="profile-selection"
															required
														>
															<MenuItem value="admin">{i18n.t("userModal.form.profileOptions.admin")}</MenuItem>
															<MenuItem value="user">{i18n.t("userModal.form.profileOptions.user")}</MenuItem>
														</Field>
													</>
												)}
											/>
										</FormControl>
									</Grid>
									<Grid item xs={12}>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editQueues"
											yes={() => (
												<QueueSelect
													selectedQueueIds={selectedQueueIds}
													onChange={values => setSelectedQueueIds(values)}
												/>
											)}
										/>
									</Grid>
									<Grid item xs={12}>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editProfile"
											yes={() => (
												<FormControl variant="outlined" margin="dense" className={classes.maxWidth} fullWidth>
													<InputLabel>
														{i18n.t("userModal.form.whatsapp")}
													</InputLabel>
													<Field
														as={Select}
														value={whatsappId}
														onChange={(e) => setWhatsappId(e.target.value)}
														label={i18n.t("userModal.form.whatsapp")}
													>
														<MenuItem value={''}>Nenhum</MenuItem>
														{whatsApps.map((whatsapp) => (
															<MenuItem key={whatsapp.id} value={whatsapp.id}>{whatsapp.name}</MenuItem>
														))}
													</Field>
												</FormControl>
											)}
										/>
									</Grid>
									<Grid item xs={12}>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editProfile"
											yes={() => (!loading &&
												<FormControl
													variant="outlined"
													className={classes.maxWidth}
													margin="dense"
													fullWidth
												>
													<>
														<InputLabel id="tickets-view-selection-label">
															{i18n.t("ticketsView")}
														</InputLabel>

														<Field
															as={Select}
															label={i18n.t("ticketsView")}
															name="allTicket"
															labelId="tickets-view-selection-label"
															id="tickets-view-selection"
															required
														>
															<MenuItem value="enabled">{i18n.t("ticketsViewEnabled")}</MenuItem>
															<MenuItem value="desabled">{i18n.t("ticketsViewDisabled")}</MenuItem>
														</Field>
													</>
												</FormControl>
											)}
										/>
									</Grid>
								</Grid>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{userId
										? `${i18n.t("userModal.buttons.okEdit")}`
										: `${i18n.t("userModal.buttons.okAdd")}`}
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

export default UserModal;
