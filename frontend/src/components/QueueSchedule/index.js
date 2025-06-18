import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  TextField,
  Container,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import NumberFormat from "react-number-format";

const useStyles = makeStyles((theme) => ({
  timeField: {
    marginRight: "3.2%",
    width: "30%",
  },
}));

const QueueSchedule = ({ schedules, onSchedulesChange }) => {
  const classes = useStyles();
  const [localSchedules, setLocalSchedules] = useState(schedules || []);

  useEffect(() => {
    if (schedules) {
      setLocalSchedules(schedules);
    }
  }, [schedules]);

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...localSchedules];
    const weekday = weekdays[index];
    
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value,
      weekdayEn: weekday.value
    };
    
    setLocalSchedules(newSchedules);
    onSchedulesChange(newSchedules);
  };

  const weekdays = [
    { label: i18n.t("queueModal.form.schedules.weekdays.monday"), value: "monday" },
    { label: i18n.t("queueModal.form.schedules.weekdays.tuesday"), value: "tuesday" },
    { label: i18n.t("queueModal.form.schedules.weekdays.wednesday"), value: "wednesday" },
    { label: i18n.t("queueModal.form.schedules.weekdays.thursday"), value: "thursday" },
    { label: i18n.t("queueModal.form.schedules.weekdays.friday"), value: "friday" },
    { label: i18n.t("queueModal.form.schedules.weekdays.saturday"), value: "saturday" },
    { label: i18n.t("queueModal.form.schedules.weekdays.sunday"), value: "sunday" },
  ];

  useEffect(() => {
    if (localSchedules.length === 0) {
      const initialSchedules = weekdays.map(weekday => ({
        weekdayEn: weekday.value,
        startTime: "",
        endTime: ""
      }));
      setLocalSchedules(initialSchedules);
      onSchedulesChange(initialSchedules);
    }
  }, []);

  return (
    <Grid spacing={2} container>
      {weekdays.map((weekday, index) => (
        <Container key={weekday.value}>
          <TextField
            label={i18n.t("schedulesForm.weekday")}
            value={weekday.label}
            disabled
            variant="outlined"
            style={{ marginRight: "3.2%", width: "30%" }}
            margin="dense"
          />
          <NumberFormat
            label={i18n.t("schedulesForm.startTime")}
            value={localSchedules[index]?.startTime || ""}
            onValueChange={(values) => {
              handleScheduleChange(index, "startTime", values.value);
            }}
            variant="outlined"
            margin="dense"
            customInput={TextField}
            format="##:##"
            style={{ marginRight: "3.2%", width: "30%" }}
          />
          <NumberFormat
            label={i18n.t("schedulesForm.endTime")}
            value={localSchedules[index]?.endTime || ""}
            onValueChange={(values) => {
              handleScheduleChange(index, "endTime", values.value);
            }}
            variant="outlined"
            margin="dense"
            customInput={TextField}
            format="##:##"
            style={{ marginRight: "3.2%", width: "30%" }}
          />
        </Container>
      ))}
    </Grid>
  );
};

export default QueueSchedule; 
