import React from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, ListItemText, ListItemIcon } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { i18n } from "../../translate/i18n";

const TicketsQueueSelect = ({
	userQueues,
	selectedQueueIds = [],
	onChange,
}) => {
	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div style={{ width: 200, marginTop: -4 }}>
			<FormControl fullWidth margin="dense">
				<Select
					multiple
					displayEmpty
					variant="outlined"
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
					renderValue={() => i18n.t("ticketsQueueSelect.placeholder")}
				>
					{userQueues?.length > 0 &&
						userQueues.map(queue => (
							<MenuItem dense key={queue.id} value={queue.id}>
								<Checkbox
									style={{
										color: queue.color,
									}}
									size="small"
									color="primary"
									checked={selectedQueueIds.indexOf(queue.id) > -1}
								/>
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

export default TicketsQueueSelect;
