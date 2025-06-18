import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtons from "../../components/MainHeaderButtons";
import Title from "../../components/Title";

import api from "../../services/api";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ScheduleModal from "../ScheduleModal";
import ConfirmationModal from "../ConfirmationModal";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const useStyles = makeStyles((theme) => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(2),
		margin: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
}));

const ScheduleList = () => {
	const classes = useStyles();
	const { user } = useContext(AuthContext);

	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [recordCount, setRecordCount] = useState(0);
	const [schedules, setSchedules] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedSchedule, setSelectedSchedule] = useState(null);
	const [searchParam, setSearchParam] = useState("");
	const [deletingSchedule, setDeletingSchedule] = useState(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	useEffect(() => {
		loadSchedules();
	}, [pageNumber, searchParam]);

	const loadSchedules = async () => {
		try {
			const { data } = await api.get("/schedules/", {
				params: { searchParam, pageNumber },
			});
			setSchedules(data.schedules);
			setHasMore(data.hasMore);
			setRecordCount(data.count);
			setLoading(false);
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenModal = () => {
		setSelectedSchedule(null);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setSelectedSchedule(null);
		setShowModal(false);
		loadSchedules();
	};

	const handleSearch = (event) => {
		setSearchParam(event.target.value.toLowerCase());
	};

	const handleEditSchedule = (schedule) => {
		setSelectedSchedule(schedule);
		setShowModal(true);
	};

	const handleDeleteSchedule = async (scheduleId) => {
		try {
			await api.delete(`/schedules/${scheduleId}`);
			toast.success(i18n.t("scheduleList.toasts.deleted"));
			loadSchedules();
		} catch (err) {
			toastError(err);
		}
		setDeletingSchedule(null);
		setConfirmOpen(false);
	};

	const formatDate = (date) => {
		return format(parseISO(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={i18n.t("scheduleList.confirmationModal.deleteTitle")}
				open={confirmOpen}
				onClose={setConfirmOpen}
				onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
			>
				{i18n.t("scheduleList.confirmationModal.deleteMessage")}
			</ConfirmationModal>
			<ScheduleModal
				open={showModal}
				onClose={handleCloseModal}
				scheduleId={selectedSchedule?.id}
				reload={loadSchedules}
			/>
			<MainHeader>
				<Title>{i18n.t("scheduleList.title")}</Title>
				<MainHeaderButtons>
					<TextField
						placeholder={i18n.t("scheduleList.searchPlaceholder")}
						type="search"
						value={searchParam}
						onChange={handleSearch}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon style={{ color: "gray" }} />
								</InputAdornment>
							),
						}}
						fullWidth
					/>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenModal}
					>
						{i18n.t("scheduleList.buttons.add")}
					</Button>
				</MainHeaderButtons>
			</MainHeader>
			<Paper className={classes.mainPaper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>{i18n.t("scheduleList.table.contact")}</TableCell>
							<TableCell>{i18n.t("scheduleList.table.whatsapp")}</TableCell>
							<TableCell>{i18n.t("scheduleList.table.body")}</TableCell>
							<TableCell>{i18n.t("scheduleList.table.sendAt")}</TableCell>
							<TableCell>{i18n.t("scheduleList.table.status")}</TableCell>
							<TableCell align="center">
								{i18n.t("scheduleList.table.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{schedules.map((schedule) => (
							<TableRow key={schedule.id}>
								<TableCell>{schedule.contact.name}</TableCell>
								<TableCell>{schedule.whatsapp?.name || "-"}</TableCell>
								<TableCell>{schedule.body}</TableCell>
								<TableCell>{formatDate(schedule.sendAt)}</TableCell>
								<TableCell>{schedule.status}</TableCell>
								<TableCell align="center">
									<IconButton
										size="small"
										onClick={() => handleEditSchedule(schedule)}
									>
										<Edit />
									</IconButton>

									<IconButton
										size="small"
										onClick={() => {
											setDeletingSchedule(schedule);
											setConfirmOpen(true);
										}}
									>
										<DeleteOutline />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Paper>
		</MainContainer>
	);
};

export default ScheduleList; 