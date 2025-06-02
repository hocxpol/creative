import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { ListItemIcon, ListItemText } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
	},
	dot: {
		width: 12,
		height: 12,
		borderRadius: "50%",
		marginRight: 8,
	},
	queueName: {
		marginLeft: 4,
	},
}));

const QueueSelect = ({ selectedQueueIds, onChange, multiple = true, title = i18n.t("queueSelect.inputLabel") }) => {
	const classes = useStyles();
	const [queues, setQueues] = useState([]);

	useEffect(() => {
		fetchQueues();
	}, []);

	const fetchQueues = async () => {
		try {
			const { data } = await api.get("/queue");
			setQueues(data);
		} catch (err) {
			toastError(err);
		}
	}

	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel shrink={selectedQueueIds ? true : false}>{title}</InputLabel>
				<Select
					label={title}
					multiple={multiple}
					labelWidth={60}
					value={selectedQueueIds}
					onChange={handleChange}
					MenuProps={{
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "left",
						},
						getContentAnchorEl: null,
					}}
					renderValue={selected => {
						return (
							<div className={classes.chips}>
								{selected?.length > 0 && multiple ? (
									selected.map(id => {
										const queue = queues.find(q => q.id === id);
										return queue ? (
											<div key={id} style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
												<div className={classes.dot} style={{ backgroundColor: queue.color }} />
												<span className={classes.queueName}>{queue.name}</span>
											</div>
										) : null;
									})
								) : (
									<div style={{ display: 'flex', alignItems: 'center' }}>
										<div className={classes.dot} style={{ backgroundColor: queues.find(q => q.id === selected)?.color }} />
										<span className={classes.queueName}>{queues.find(q => q.id === selected)?.name}</span>
									</div>
								)}
							</div>
						)
					}}
				>
					{!multiple && <MenuItem value={null}>Nenhum</MenuItem>}
					{queues.map(queue => (
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
		</div>
	);
};

export default QueueSelect;
