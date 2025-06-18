import React, { useEffect, useState } from "react";

import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Title from "../Title";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import useSettings from "../../hooks/useSettings";
import { ToastContainer, toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { Tabs, Tab } from "@material-ui/core";
import Box from "@material-ui/core/Box";

//import 'react-toastify/dist/ReactToastify.css';

const useStyles = makeStyles((theme) => ({
	container: {
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	fixedHeightPaper: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: 240,
	},
	tab: {
		backgroundColor: theme.palette.options,  //DARK MODE PLW DESIGN//
		borderRadius: 4,
		width: "100%",
		"& .MuiTab-wrapper": {
			color: theme.palette.fontecor,
		},   //DARK MODE PLW DESIGN//
		"& .MuiTabs-flexContainer": {
			justifyContent: "center"
		}


	},
	paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
		marginBottom: 12,
		width: "100%",
	},
	cardAvatar: {
		fontSize: "55px",
		color: grey[500],
		backgroundColor: "#ffffff",
		width: theme.spacing(7),
		height: theme.spacing(7),
	},
	cardTitle: {
		fontSize: "18px",
		color: blue[700],
	},
	cardSubtitle: {
		color: grey[600],
		fontSize: "14px",
	},
	alignRight: {
		textAlign: "right",
	},
	fullWidth: {
		width: "100%",
	},
	selectContainer: {
		width: "100%",
		textAlign: "left",
	},
}));

export default function Options(props) {
	const { settings, scheduleTypeChanged } = props;
	const classes = useStyles();
	const [userRating, setUserRating] = useState("disabled");
	const [scheduleType, setScheduleType] = useState("disabled");
	const [callType, setCallType] = useState("enabled");
	const [chatbotType, setChatbotType] = useState("");
	const [CheckMsgIsGroup, setCheckMsgIsGroupType] = useState("enabled");

	const [loadingUserRating, setLoadingUserRating] = useState(false);
	const [loadingScheduleType, setLoadingScheduleType] = useState(false);
	const [loadingCallType, setLoadingCallType] = useState(false);
	const [loadingChatbotType, setLoadingChatbotType] = useState(false);
	const [loadingCheckMsgIsGroup, setCheckMsgIsGroup] = useState(false);

	// recursos a mais da plw design
	const [SendGreetingAccepted, setSendGreetingAccepted] = useState("disabled");
	const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);

	const [SettingsTransfTicket, setSettingsTransfTicket] = useState("disabled");
	const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);

	const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] = useState("disabled");
	const [loadingSendGreetingMessageOneQueues, setLoadingSendGreetingMessageOneQueues] = useState(false);

	const { update } = useSettings();

	const [tabValue, setTabValue] = useState(0);

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	function TabPanel(props) {
		const { children, value, index, ...other } = props;
		return (
			<div
				role="tabpanel"
				hidden={value !== index}
				id={`integration-tabpanel-${index}`}
				aria-labelledby={`integration-tab-${index}`}
				{...other}
			>
				{value === index && (
					<Box p={3}>
						{children}
					</Box>
				)}
			</div>
		);
	}

	useEffect(() => {
		if (Array.isArray(settings) && settings.length) {
			const userRating = settings.find((s) => s.key === "userRating");
			if (userRating) {
				setUserRating(userRating.value);
			}
			const scheduleType = settings.find((s) => s.key === "scheduleType");
			if (scheduleType) {
				setScheduleType(scheduleType.value);
			}
			const callType = settings.find((s) => s.key === "call");
			if (callType) {
				setCallType(callType.value);
			}
			const CheckMsgIsGroup = settings.find((s) => s.key === "CheckMsgIsGroup");
			if (CheckMsgIsGroup) {
				setCheckMsgIsGroupType(CheckMsgIsGroup.value);
			}

	  {/*PLW DESIGN SAUDAÇÃO*/}
			const SendGreetingAccepted = settings.find((s) => s.key === "sendGreetingAccepted");
			if (SendGreetingAccepted) {
				setSendGreetingAccepted(SendGreetingAccepted.value);
			}
	  {/*PLW DESIGN SAUDAÇÃO*/}	 

	  {/*TRANSFERIR TICKET*/}	
			const SettingsTransfTicket = settings.find((s) => s.key === "sendMsgTransfTicket");
			if (SettingsTransfTicket) {
				setSettingsTransfTicket(SettingsTransfTicket.value);
			}
	  {/*TRANSFERIR TICKET*/}

			const sendGreetingMessageOneQueues = settings.find((s) => s.key === "sendGreetingMessageOneQueues");
			if (sendGreetingMessageOneQueues) {
				setSendGreetingMessageOneQueues(sendGreetingMessageOneQueues.value)
			}

			const chatbotType = settings.find((s) => s.key === "chatBotType");
			if (chatbotType) {
				setChatbotType(chatbotType.value);
			}
		}
	}, [settings]);

	async function handleChangeUserRating(value) {
		setUserRating(value);
		setLoadingUserRating(true);
		await update({
			key: "userRating",
			value,
		});
		toast.success("Operação atualizada com sucesso.");
		setLoadingUserRating(false);
	}

	async function handleSendGreetingMessageOneQueues(value) {
		setSendGreetingMessageOneQueues(value);
		setLoadingSendGreetingMessageOneQueues(true);
		await update({
			key: "sendGreetingMessageOneQueues",
			value,
		});
		toast.success("Operação atualizada com sucesso.");
		setLoadingSendGreetingMessageOneQueues(false);
	}

	async function handleScheduleType(value) {
		setScheduleType(value);
		setLoadingScheduleType(true);
		await update({
			key: "scheduleType",
			value,
		});
		toast.success('Operação atualizada com sucesso.', {
			position: "top-right",
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: true,
			theme: "light",
		});
		setLoadingScheduleType(false);
		if (typeof scheduleTypeChanged === "function") {
			scheduleTypeChanged(value);
		}
	}

	async function handleCallType(value) {
		setCallType(value);
		setLoadingCallType(true);
		await update({
			key: "call",
			value,
		});
		toast.success("Operação atualizada com sucesso.");
		setLoadingCallType(false);
	}

	async function handleChatbotType(value) {
		setChatbotType(value);
		setLoadingChatbotType(true);
		await update({
			key: "chatBotType",
			value,
		});
		toast.success("Operação atualizada com sucesso.");
		setLoadingChatbotType(false);
	}

	async function handleGroupType(value) {
		setCheckMsgIsGroupType(value);
		setCheckMsgIsGroup(true);
		await update({
			key: "CheckMsgIsGroup",
			value,
		});
		toast.success("Operação atualizada com sucesso.");
		setCheckMsgIsGroupType(false);
    /*     if (typeof scheduleTypeChanged === "function") {
          scheduleTypeChanged(value);
        } */
	}

  {/*NOVO CÓDIGO*/}  
	async function handleSendGreetingAccepted(value) {
		setSendGreetingAccepted(value);
		setLoadingSendGreetingAccepted(true);
		await update({
			key: "sendGreetingAccepted",
			value,
		});
		toast.success("Operação atualizada com sucesso.");
		setLoadingSendGreetingAccepted(false);
	}

  {/*NOVO CÓDIGO*/}    
	async function handleSettingsTransfTicket(value) {
		setSettingsTransfTicket(value);
		setLoadingSettingsTransfTicket(true);
		await update({
			key: "sendMsgTransfTicket",
			value,
		});
		toast.success("Operação atualizada com sucesso.");
		setLoadingSettingsTransfTicket(false);
	}

	return (
		<>
			<Grid spacing={3} container>
        {/* <Grid xs={12} item>
                    <Title>Configurações Gerais</Title>
                </Grid> */}
				<Grid xs={12} sm={6} md={6} item>
					<FormControl className={classes.selectContainer}>
						<InputLabel id="ratings-label">Avaliações</InputLabel>
						<Select
							labelId="ratings-label"
							value={userRating}
							onChange={async (e) => {
								handleChangeUserRating(e.target.value);
							}}
						>
							<MenuItem value={"disabled"}>Desabilitadas</MenuItem>
							<MenuItem value={"enabled"}>Habilitadas</MenuItem>
						</Select>
						<FormHelperText>
							{loadingUserRating && "Atualizando..."}
						</FormHelperText>
					</FormControl>
				</Grid>
				<Grid xs={12} sm={6} md={6} item>
					<FormControl className={classes.selectContainer}>
						<InputLabel id="schedule-type-label">
							Gerenciamento de Expediente
						</InputLabel>
						<Select
							labelId="schedule-type-label"
							value={scheduleType}
							onChange={async (e) => {
								handleScheduleType(e.target.value);
							}}
						>
							<MenuItem value={"disabled"}>Desabilitado</MenuItem>
							<MenuItem value={"queue"}>Departamento</MenuItem>
							<MenuItem value={"company"}>Empresa</MenuItem>
						</Select>
						<FormHelperText>
							{loadingScheduleType && "Atualizando..."}
						</FormHelperText>
					</FormControl>
				</Grid>
				<Grid xs={12} sm={6} md={6} item>
					<FormControl className={classes.selectContainer}>
						<InputLabel id="group-type-label">
							Ignorar Mensagens de Grupos
						</InputLabel>
						<Select
							labelId="group-type-label"
							value={CheckMsgIsGroup}
							onChange={async (e) => {
								handleGroupType(e.target.value);
							}}
						>
							<MenuItem value={"disabled"}>Desativado</MenuItem>
							<MenuItem value={"enabled"}>Ativado</MenuItem>
						</Select>
						<FormHelperText>
							{loadingScheduleType && "Atualizando..."}
						</FormHelperText>
					</FormControl>
				</Grid>
				<Grid xs={12} sm={6} md={6} item>
					<FormControl className={classes.selectContainer}>
						<InputLabel id="call-type-label">
							Aceitar Chamada
						</InputLabel>
						<Select
							labelId="call-type-label"
							value={callType}
							onChange={async (e) => {
								handleCallType(e.target.value);
							}}
						>
							<MenuItem value={"disabled"}>Não Aceitar</MenuItem>
							<MenuItem value={"enabled"}>Aceitar</MenuItem>
						</Select>
						<FormHelperText>
							{loadingCallType && "Atualizando..."}
						</FormHelperText>
					</FormControl>
				</Grid>
				<Grid xs={12} sm={6} md={6} item>
					<FormControl className={classes.selectContainer}>
						<InputLabel id="chatbot-type-label">
							Tipo Chatbot
						</InputLabel>
						<Select
							labelId="chatbot-type-label"
							value={chatbotType}
							onChange={async (e) => {
								handleChatbotType(e.target.value);
							}}
						>
							<MenuItem value={"text"}>Texto</MenuItem>
			 {/*<MenuItem value={"button"}>Botão</MenuItem>*/}
             {/*<MenuItem value={"list"}>Lista</MenuItem>*/}
						</Select>
						<FormHelperText>
							{loadingChatbotType && "Atualizando..."}
						</FormHelperText>
					</FormControl>
				</Grid>
		{/* ENVIAR SAUDAÇÃO AO ACEITAR O TICKET */}
				<Grid xs={12} sm={6} md={6} item>
					<FormControl className={classes.selectContainer}>
						<InputLabel id="sendGreetingAccepted-label">Enviar saudação ao aceitar o ticket</InputLabel>
						<Select
							labelId="sendGreetingAccepted-label"
							value={SendGreetingAccepted}
							onChange={async (e) => {
								handleSendGreetingAccepted(e.target.value);
							}}
						>
							<MenuItem value={"disabled"}>Desabilitado</MenuItem>
							<MenuItem value={"enabled"}>Habilitado</MenuItem>
						</Select>
						<FormHelperText>
							{loadingSendGreetingAccepted && "Atualizando..."}
						</FormHelperText>
					</FormControl>
				</Grid>
		{/* ENVIAR SAUDAÇÃO AO ACEITAR O TICKET */}
		
		{/* ENVIAR MENSAGEM DE TRANSFERENCIA DE SETOR/ATENDENTE */}
				<Grid xs={12} sm={6} md={6} item>
					<FormControl className={classes.selectContainer}>
						<InputLabel id="sendMsgTransfTicket-label">Enviar mensagem de transferência de Departamento/agente</InputLabel>
						<Select
							labelId="sendMsgTransfTicket-label"
							value={SettingsTransfTicket}
							onChange={async (e) => {
								handleSettingsTransfTicket(e.target.value);
							}}
						>
							<MenuItem value={"disabled"}>Desabilitado</MenuItem>
							<MenuItem value={"enabled"}>Habilitado</MenuItem>
						</Select>
						<FormHelperText>
							{loadingSettingsTransfTicket && "Atualizando..."}
						</FormHelperText>
					</FormControl>
				</Grid>
		{/* ENVIAR SAUDAÇÃO QUANDO HOUVER SOMENTE 1 DEPARTAMENTO */}
				<Grid xs={12} sm={6} md={6} item>
					<FormControl className={classes.selectContainer}>
						<InputLabel id="sendGreetingMessageOneQueues-label">Enviar saudação quando houver somente 1 departamento</InputLabel>
						<Select
							labelId="sendGreetingMessageOneQueues-label"
							value={sendGreetingMessageOneQueues}
							onChange={async (e) => {
								handleSendGreetingMessageOneQueues(e.target.value);
							}}
						>
							<MenuItem value={"disabled"}>Desabilitado</MenuItem>
							<MenuItem value={"enabled"}>Habilitado</MenuItem>
						</Select>
						<FormHelperText>
							{loadingSendGreetingMessageOneQueues && "Atualizando..."}
						</FormHelperText>
					</FormControl>
				</Grid>
			</Grid>
		</>
	);
}
