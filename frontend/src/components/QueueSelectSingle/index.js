import React, { useEffect, useState } from "react";
import { Field } from "formik";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import Typography from "@material-ui/core/Typography";
import { ListItemIcon, ListItemText } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
}));

const QueueSelectSingle = () => {
    const classes = useStyles();
    const [queues, setQueues] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/queue");
                setQueues(data);
            } catch (err) {
                toastError(`QUEUESELETSINGLE >>> ${err}`);
            }
        })();
    }, []);

    return (
        <div style={{ marginTop: 6 }}>
            <FormControl
                variant="outlined"
                className={classes.formControl}
                margin="dense"
                fullWidth
            >
                <div>
                    <Typography>
                        {i18n.t("queueSelect.inputLabel")}
                    </Typography>
                    <Field
                        as={Select}
                        label={i18n.t("queueSelect.inputLabel")}
                        name="queueId"
                        labelId="queue-selection-label"
                        id="queue-selection"
                        fullWidth
                    >
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
                    </Field>
                </div>
            </FormControl>
        </div>
    );
};

export default QueueSelectSingle;
