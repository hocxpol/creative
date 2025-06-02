import React, { useEffect, useState, useCallback } from "react";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import useSettings from "../../hooks/useSettings";
import { toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
	selectContainer: {
		width: "100%",
		textAlign: "left",
	},
	sectionTitle: {
		marginBottom: theme.spacing(2),
		color: theme.palette.primary.main,
		fontWeight: 500,
	},
}));

export default function Integrations(props) {
	const { settings } = props;
	const classes = useStyles();
	const { update } = useSettings();

	// Estados para ASAAS
	const [asaasType, setAsaasType] = useState("");
	const [loadingAsaasType, setLoadingAsaasType] = useState(false);

	// Estados para IXC
	const [ipixcType, setIpIxcType] = useState("");
	const [loadingIpIxcType, setLoadingIpIxcType] = useState(false);
	const [tokenixcType, setTokenIxcType] = useState("");
	const [loadingTokenIxcType, setLoadingTokenIxcType] = useState(false);

	// Estados para MK-AUTH
	const [ipmkauthType, setIpMkauthType] = useState("");
	const [loadingIpMkauthType, setLoadingIpMkauthType] = useState(false);
	const [clientidmkauthType, setClientIdMkauthType] = useState("");
	const [loadingClientIdMkauthType, setLoadingClientIdMkauthType] = useState(false);
	const [clientsecretmkauthType, setClientSecrectMkauthType] = useState("");
	const [loadingClientSecrectMkauthType, setLoadingClientSecrectMkauthType] = useState(false);

	// Referência para o timer de debounce
	const debounceTimerRef = React.useRef(null);

	// Limpa o timer quando o componente é desmontado
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (Array.isArray(settings) && settings.length) {
			const asaasType = settings.find((s) => s.key === "asaas");
			if (asaasType) {
				setAsaasType(asaasType.value);
			}

			const ipixcType = settings.find((s) => s.key === "ipixc");
			if (ipixcType) {
				setIpIxcType(ipixcType.value);
			}

			const tokenixcType = settings.find((s) => s.key === "tokenixc");
			if (tokenixcType) {
				setTokenIxcType(tokenixcType.value);
			}

			const ipmkauthType = settings.find((s) => s.key === "ipmkauth");
			if (ipmkauthType) {
				setIpMkauthType(ipmkauthType.value);
			}

			const clientidmkauthType = settings.find((s) => s.key === "clientidmkauth");
			if (clientidmkauthType) {
				setClientIdMkauthType(clientidmkauthType.value);
			}

			const clientsecretmkauthType = settings.find((s) => s.key === "clientsecretmkauth");
			if (clientsecretmkauthType) {
				setClientSecrectMkauthType(clientsecretmkauthType.value);
			}
		}
	}, [settings]);

	const handleDebouncedUpdate = useCallback(async (key, value, setLoading) => {
		// Limpa o timer anterior se existir
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Cria um novo timer
		debounceTimerRef.current = setTimeout(async () => {
			setLoading(true);
			try {
				await update({
					key,
					value,
				});
				toast.success("Operação atualizada com sucesso.");
			} catch (error) {
				console.error("Erro ao atualizar configuração:", error);
				toast.error("Erro ao atualizar configuração. Tente novamente.");
			} finally {
				setLoading(false);
			}
		}, 1000); // Espera 1 segundo antes de salvar
	}, [update]);

	// Handlers para ASAAS
	const handleChangeAsaas = useCallback((value) => {
		setAsaasType(value);
		handleDebouncedUpdate("asaas", value, setLoadingAsaasType);
	}, [handleDebouncedUpdate]);

	// Handlers para IXC
	const handleChangeIPIxc = useCallback((value) => {
		setIpIxcType(value);
		handleDebouncedUpdate("ipixc", value, setLoadingIpIxcType);
	}, [handleDebouncedUpdate]);

	const handleChangeTokenIxc = useCallback((value) => {
		setTokenIxcType(value);
		handleDebouncedUpdate("tokenixc", value, setLoadingTokenIxcType);
	}, [handleDebouncedUpdate]);

	// Handlers para MK-AUTH
	const handleChangeIpMkauth = useCallback((value) => {
		setIpMkauthType(value);
		handleDebouncedUpdate("ipmkauth", value, setLoadingIpMkauthType);
	}, [handleDebouncedUpdate]);

	const handleChangeClientIdMkauth = useCallback((value) => {
		setClientIdMkauthType(value);
		handleDebouncedUpdate("clientidmkauth", value, setLoadingClientIdMkauthType);
	}, [handleDebouncedUpdate]);

	const handleChangeClientSecrectMkauth = useCallback((value) => {
		setClientSecrectMkauthType(value);
		handleDebouncedUpdate("clientsecretmkauth", value, setLoadingClientSecrectMkauthType);
	}, [handleDebouncedUpdate]);

	return (
		<Grid spacing={3} container>
			{/* Seção ASAAS */}
			<Grid xs={12} item>
				<Typography variant="h6" className={classes.sectionTitle}>
					ASAAS
				</Typography>
				<FormControl className={classes.selectContainer}>
					<TextField
						id="asaas"
						name="asaas"
						margin="dense"
						label="Token Asaas"
						variant="outlined"
						value={asaasType}
						onChange={(e) => handleChangeAsaas(e.target.value)}
					/>
					<FormHelperText>
						{loadingAsaasType && "Salvando..."}
					</FormHelperText>
				</FormControl>
			</Grid>

			{/* Seção IXC */}
			<Grid xs={12} item>
				<Typography variant="h6" className={classes.sectionTitle}>
					IXC
				</Typography>
				<Grid container spacing={2}>
					<Grid xs={12} sm={6} item>
						<FormControl className={classes.selectContainer}>
							<TextField
								id="ipixc"
								name="ipixc"
								margin="dense"
								label="IP IXC"
								variant="outlined"
								value={ipixcType}
								onChange={(e) => handleChangeIPIxc(e.target.value)}
							/>
							<FormHelperText>
								{loadingIpIxcType && "Salvando..."}
							</FormHelperText>
						</FormControl>
					</Grid>
					<Grid xs={12} sm={6} item>
						<FormControl className={classes.selectContainer}>
							<TextField
								id="tokenixc"
								name="tokenixc"
								margin="dense"
								label="Token IXC"
								variant="outlined"
								value={tokenixcType}
								onChange={(e) => handleChangeTokenIxc(e.target.value)}
							/>
							<FormHelperText>
								{loadingTokenIxcType && "Salvando..."}
							</FormHelperText>
						</FormControl>
					</Grid>
				</Grid>
			</Grid>

			{/* Seção MK-AUTH */}
			<Grid xs={12} item>
				<Typography variant="h6" className={classes.sectionTitle}>
					MK-AUTH
				</Typography>
				<Grid container spacing={2}>
					<Grid xs={12} sm={4} item>
						<FormControl className={classes.selectContainer}>
							<TextField
								id="ipmkauth"
								name="ipmkauth"
								margin="dense"
								label="IP MK-AUTH"
								variant="outlined"
								value={ipmkauthType}
								onChange={(e) => handleChangeIpMkauth(e.target.value)}
							/>
							<FormHelperText>
								{loadingIpMkauthType && "Salvando..."}
							</FormHelperText>
						</FormControl>
					</Grid>
					<Grid xs={12} sm={4} item>
						<FormControl className={classes.selectContainer}>
							<TextField
								id="clientidmkauth"
								name="clientidmkauth"
								margin="dense"
								label="Client ID MK-AUTH"
								variant="outlined"
								value={clientidmkauthType}
								onChange={(e) => handleChangeClientIdMkauth(e.target.value)}
							/>
							<FormHelperText>
								{loadingClientIdMkauthType && "Salvando..."}
							</FormHelperText>
						</FormControl>
					</Grid>
					<Grid xs={12} sm={4} item>
						<FormControl className={classes.selectContainer}>
							<TextField
								id="clientsecretmkauth"
								name="clientsecretmkauth"
								margin="dense"
								label="Client Secret MK-AUTH"
								variant="outlined"
								value={clientsecretmkauthType}
								onChange={(e) => handleChangeClientSecrectMkauth(e.target.value)}
							/>
							<FormHelperText>
								{loadingClientSecrectMkauthType && "Salvando..."}
							</FormHelperText>
						</FormControl>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
} 