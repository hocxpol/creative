import React, { useState, useEffect, useRef } from "react";

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

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import {
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
} from "@material-ui/core";
import { Colorize } from "@material-ui/icons";
import { QueueOptions } from "../QueueOptions";
import SchedulesForm from "../SchedulesForm";
import usePlans from "../../hooks/usePlans";
import useAuth from "../../hooks/useAuth.js";
import QueueSchedule from "../QueueSchedule";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
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
  colorAdorment: {
    width: 20,
    height: 20,
  },
  paper: {
    boxShadow: 'none',
  },
}));

const QueueSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("validation.minLength", { min: 2 }))
    .max(50, i18n.t("validation.maxLength", { max: 50 }))
    .required(i18n.t("validation.required")),
  color: Yup.string()
    .min(3, i18n.t("validation.minLength", { min: 3 }))
    .max(9, i18n.t("validation.maxLength", { max: 9 }))
    .required(i18n.t("validation.required")),
  greetingMessage: Yup.string()
    .nullable(),
  keyword: Yup.string()
    .max(50, i18n.t("validation.tooLong"))
    .nullable(),
  isInvisible: Yup.boolean().nullable(),
  noAutomation: Yup.boolean().nullable()
});

const TAB_IDS = {
  DATA: 'data',
  SCHEDULES: 'schedules',
  OPTIONS: 'options',
  INTEGRATIONS: 'integrations',
  ADVANCED: 'advanced'
};

const QueueModal = ({ open, onClose, queueId }) => {
  const classes = useStyles();
  const { getPlanCompany } = usePlans();
  const { user } = useAuth();
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const initialState = {
    name: "",
    color: "",
    greetingMessage: "",
    outOfHoursMessage: "",
    orderQueue: "",
    integrationId: "",
    promptId: "",
    isInvisible: false,
    keyword: "",
    noAutomation: false
  };

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const [activeTab, setActiveTab] = useState(TAB_IDS.DATA);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const greetingRef = useRef();
  const [integrations, setIntegrations] = useState([]);

  const [schedules, setSchedules] = useState([
    { weekday: "Segunda-feira", weekdayEn: "monday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Terça-feira", weekdayEn: "tuesday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Quarta-feira", weekdayEn: "wednesday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Quinta-feira", weekdayEn: "thursday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Sexta-feira", weekdayEn: "friday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Sábado", weekdayEn: "saturday", startTime: "08:00", endTime: "12:00", },
    { weekday: "Domingo", weekdayEn: "sunday", startTime: "00:00", endTime: "00:00", },
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/prompt");
        setPrompts(data.prompts);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const scheduleType = data.find((d) => d.key === "scheduleType");
        if (scheduleType) {
          setSchedulesEnabled(scheduleType.value === "queue");
        }
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queueIntegration");

        setIntegrations(data.queueIntegrations);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);
        setQueue((prevState) => {
          return { ...prevState, ...data };
        });
        data.promptId ? setSelectedPrompt(data.promptId) : setSelectedPrompt(null);

        setSchedules(data.schedules);
      } catch (err) {
        toastError(err);
      }
    })();

    return () => {
      setQueue({
        name: "",
        color: "",
        greetingMessage: "",
        outOfHoursMessage: "",
        orderQueue: "",
        integrationId: "",
        isInvisible: false,
        keyword: "",
        noAutomation: false
      });
    };
  }, [queueId, open]);

  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        const planInfo = await getPlanCompany(null, user.companyId);
        if (planInfo) {
          setShowOpenAi(planInfo.plan.useOpenAi || false);
          setShowIntegrations(planInfo.plan.useIntegrations || false);
          setShowExternalApi(planInfo.plan.useExternalApi || false);
        }
      } catch (err) {
        //console.error(err);
      }
    };
    fetchPlanInfo();
  }, [getPlanCompany, user.companyId]);

  const handleClose = () => {
    onClose();
    setQueue(initialState);
  };

  const handleSaveQueue = async (values) => {
    try {
      const queueData = {
        ...values,
        schedules,
        promptId: selectedPrompt ? selectedPrompt : null,
        isInvisible: values.isInvisible || false,
        keyword: values.keyword || "",
        noAutomation: values.noAutomation || false
      };

      if (queueId) {
        await api.put(`/queue/${queueId}`, queueData);
      } else {
        await api.post("/queue", queueData);
      }
      toast.success(i18n.t("queueModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveSchedules = async (values) => {
    toast.success("Clique em salvar para registar as alterações");
    setSchedules(values);
    setActiveTab(TAB_IDS.SCHEDULES);
  };

  const handleChangePrompt = (e) => {
    setSelectedPrompt(e.target.value);
  };

  const handleSchedulesChange = (newSchedules) => {
    setSchedules(newSchedules);
  };

  return (
    <div className={classes.root}>
      <Dialog
        maxWidth="md"
        fullWidth={true}
        open={open}
        onClose={handleClose}
        scroll="paper"
      >
        <DialogTitle>
          {queueId
            ? `${i18n.t("queueModal.title.edit")}`
            : `${i18n.t("queueModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={queue}
          enableReinitialize={true}
          validationSchema={QueueSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveQueue(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <Tabs
                value={activeTab}
                indicatorColor="primary"
                textColor="primary"
                onChange={(e, newValue) => setActiveTab(newValue)}
                aria-label="queue tabs"
              >
                <Tab 
                  value={TAB_IDS.DATA}
                  label={i18n.t("queueModal.tabs.data")} 
                />
                {schedulesEnabled && (
                  <Tab 
                    value={TAB_IDS.SCHEDULES}
                    label={i18n.t("queueModal.tabs.schedules")} 
                  />
                )}
                <Tab 
                  value={TAB_IDS.OPTIONS}
                  label={i18n.t("queueModal.tabs.options")} 
                />
                {showIntegrations && (
                  <Tab 
                    value={TAB_IDS.INTEGRATIONS}
                    label={i18n.t("queueModal.tabs.integrations")} 
                  />
                )}
                <Tab 
                  value={TAB_IDS.ADVANCED}
                  label={i18n.t("queueModal.tabs.advanced")} 
                />
              </Tabs>

              {activeTab === TAB_IDS.DATA && (
                <Paper className={classes.paper}>
                  <DialogContent dividers>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.name")}
                          autoFocus
                          name="name"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.color")}
                          name="color"
                          id="color"
                          onFocus={() => {
                            setColorPickerModalOpen(true);
                            greetingRef.current.focus();
                          }}
                          error={touched.color && Boolean(errors.color)}
                          helperText={touched.color && errors.color}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <div
                                  style={{ backgroundColor: values.color }}
                                  className={classes.colorAdorment}
                                ></div>
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <IconButton
                                size="small"
                                color="default"
                                onClick={() => setColorPickerModalOpen(true)}
                              >
                                <Colorize />
                              </IconButton>
                            ),
                          }}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.orderQueue")}
                          name="orderQueue"
                          type="orderQueue"
                          error={touched.orderQueue && Boolean(errors.orderQueue)}
                          helperText={touched.orderQueue && errors.orderQueue}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <ColorPicker
                      open={colorPickerModalOpen}
                      handleClose={() => setColorPickerModalOpen(false)}
                      onChange={(color) => {
                        values.color = color;
                        setQueue(() => {
                          return { ...values, color };
                        });
                      }}
                    />

                    <div style={{ marginTop: 16 }}>
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.greetingMessage")}
                        type="greetingMessage"
                        multiline
                        inputRef={greetingRef}
                        rows={5}
                        fullWidth
                        name="greetingMessage"
                        error={
                          touched.greetingMessage &&
                          Boolean(errors.greetingMessage)
                        }
                        helperText={
                          touched.greetingMessage && errors.greetingMessage
                        }
                        variant="outlined"
                        margin="dense"
                      />
                      {schedulesEnabled && (
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.outOfHoursMessage")}
                          type="outOfHoursMessage"
                          multiline
                          inputRef={greetingRef}
                          rows={5}
                          fullWidth
                          name="outOfHoursMessage"
                          error={
                            touched.outOfHoursMessage &&
                            Boolean(errors.outOfHoursMessage)
                          }
                          helperText={
                            touched.outOfHoursMessage && errors.outOfHoursMessage
                          }
                          variant="outlined"
                          margin="dense"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Paper>
              )}

              {activeTab === TAB_IDS.SCHEDULES && (
                <Paper className={classes.paper}>
                  <DialogContent dividers>
                    <QueueSchedule
                      schedules={schedules}
                      onSchedulesChange={handleSchedulesChange}
                    />
                  </DialogContent>
                </Paper>
              )}

              {activeTab === TAB_IDS.OPTIONS && (
                <Paper className={classes.paper}>
                  <DialogContent dividers>
                    <QueueOptions queueId={queueId} />
                  </DialogContent>
                </Paper>
              )}

              {activeTab === TAB_IDS.INTEGRATIONS && showIntegrations && (
                <Paper className={classes.paper}>
                  <DialogContent dividers>
                    <Grid container spacing={2}>
                      {showExternalApi && (
                        <Grid item xs={12}>
                          <FormControl
                            variant="outlined"
                            margin="dense"
                            fullWidth
                          >
                            <InputLabel id="integrationId-selection-label">
                              {i18n.t("queueModal.form.integrationId")}
                            </InputLabel>
                            <Field
                              as={Select}
                              label={i18n.t("queueModal.form.integrationId")}
                              name="integrationId"
                              id="integrationId"
                              placeholder={i18n.t("queueModal.form.integrationId")}
                              labelId="integrationId-selection-label"
                              value={values.integrationId || ""}
                            >
                              <MenuItem value={""} >{"Nenhum"}</MenuItem>
                              {integrations.map((integration) => (
                                <MenuItem key={integration.id} value={integration.id}>
                                  {integration.name}
                                </MenuItem>
                              ))}
                            </Field>
                          </FormControl>
                        </Grid>
                      )}
                      {showOpenAi && (
                        <Grid item xs={12}>
                          <FormControl
                            margin="dense"
                            variant="outlined"
                            fullWidth
                          >
                            <InputLabel>
                              {i18n.t("whatsappModal.form.prompt")}
                            </InputLabel>
                            <Select
                              labelId="dialog-select-prompt-label"
                              id="dialog-select-prompt"
                              name="promptId"
                              value={selectedPrompt || ""}
                              onChange={handleChangePrompt}
                              label={i18n.t("whatsappModal.form.prompt")}
                              fullWidth
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
                            >
                              <MenuItem value={""}>{"Nenhum"}</MenuItem>
                              {prompts.map((prompt) => (
                                <MenuItem
                                  key={prompt.id}
                                  value={prompt.id}
                                >
                                  {prompt.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </DialogContent>
                </Paper>
              )}

              {activeTab === TAB_IDS.ADVANCED && (
                <Paper className={classes.paper}>
                  <DialogContent dividers>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl variant="outlined" margin="dense" fullWidth>
                          <InputLabel>{i18n.t("queueModal.form.isInvisible")}</InputLabel>
                          <Field
                            as={Select}
                            name="isInvisible"
                            label={i18n.t("queueModal.form.isInvisible")}
                          >
                            <MenuItem value={false}>{i18n.t("queueModal.form.visibility.visible")}</MenuItem>
                            <MenuItem value={true}>{i18n.t("queueModal.form.visibility.hidden")}</MenuItem>
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.keyword")}
                          name="keyword"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl variant="outlined" margin="dense" fullWidth>
                          <InputLabel>{i18n.t("queueModal.form.automation")}</InputLabel>
                          <Field
                            as={Select}
                            name="noAutomation"
                            label={i18n.t("queueModal.form.automation")}
                          >
                            <MenuItem value={false}>{i18n.t("queueModal.form.automationStatus.enabled")}</MenuItem>
                            <MenuItem value={true}>{i18n.t("queueModal.form.automationStatus.disabled")}</MenuItem>
                          </Field>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </DialogContent>
                </Paper>
              )}

              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("queueModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {queueId
                    ? `${i18n.t("queueModal.buttons.okEdit")}`
                    : `${i18n.t("queueModal.buttons.okAdd")}`}
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

export default QueueModal;
