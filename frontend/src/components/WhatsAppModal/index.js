import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth.js";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  FormHelperText,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import usePlans from "../../hooks/usePlans";

const useStyles = makeStyles((theme) => ({
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
  paper: {
    boxShadow: 'none',
  },
  disabledField: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
}));

const TAB_IDS = {
  CONNECTION: 'connection',
  QUEUE: 'queue',
  CALLS: 'calls',
  RATING: 'rating',
  INTEGRATION: 'integration'
};

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const { getPlanCompany } = usePlans();
  const { user } = useAuth();
  const initialState = {
    name: "",
    greetingMessage: "",
    completionMessage: "",
    outOfHoursMessage: "",
    ratingMessage: "",
    isDefault: false,
    token: "",
    provider: "beta",
    //timeSendQueue: 0,
    //sendIdQueue: 0,
    expiresInactiveMessage: "",
    expiresTicket: 0,
    timeUseBotQueues: 0,
    maxUseBotQueues: 3,
    callMessage: "*Mensagem Automática:*\n\nAs chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto."
  };
  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [queues, setQueues] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState(null)
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [activeTab, setActiveTab] = useState(TAB_IDS.CONNECTION);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  
  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId || !user?.companyId) return;

      try {
        const { data } = await api.get(`whatsapp/${whatsAppId}?session=0`);
        setWhatsApp(data);

        const whatsQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(whatsQueueIds);
        setSelectedQueueId(data.transferQueueId);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId, user?.companyId]);

  useEffect(() => {
    (async () => {
      if (!user?.companyId) return;
      try {
        const { data } = await api.get("/prompt");
        setPrompts(data.prompts);
      } catch (err) {
        toastError(err);
      }
    })();
  }, [user?.companyId]);

  useEffect(() => {
    (async () => {
      if (!user?.companyId) return;
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toastError(err);
      }
    })();
  }, [user?.companyId]);

  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        if (!user?.companyId) {
          return;
        }
        const planInfo = await getPlanCompany(null, user.companyId);
        if (planInfo) {
          setCurrentPlanId(planInfo.id);
          setShowOpenAi(planInfo.plan.useOpenAi || false);
          setShowIntegrations(planInfo.plan.useIntegrations || false);
          setShowExternalApi(planInfo.plan.useExternalApi || false);
        }
      } catch (err) {
        toastError(err);
      }
    };
    fetchPlanInfo();
  }, [getPlanCompany, user?.companyId]);

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const scheduleType = data.find((d) => d.key === "scheduleType");
        if (scheduleType) {
          setSchedulesEnabled(scheduleType.value === "company");
        }
      }
    });
  }, []);

  const handleSaveWhatsApp = async (values) => {
    const whatsappData = {
      ...values, 
      queueIds: selectedQueueIds, 
      transferQueueId: selectedQueueId,
      promptId: selectedPrompt ? selectedPrompt : null
    };
    delete whatsappData["queues"];
    delete whatsappData["session"];

    try {
      if (whatsAppId) {
        await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
      } else {
        await api.post("/whatsapp", whatsappData);
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleChangeQueue = (e) => {
    setSelectedQueueIds(e);
    setSelectedPrompt(null);
  };

  const handleChangePrompt = (e) => {
    setSelectedPrompt(e.target.value);
    setSelectedQueueIds([]);
  };

  const handleClose = () => {
    onClose();
    setWhatsApp(initialState);
    setSelectedQueueId(null);
    setSelectedQueueIds([]);
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {whatsAppId
            ? i18n.t("whatsappModal.title.edit")
            : i18n.t("whatsappModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveWhatsApp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <Tabs
                value={activeTab}
                indicatorColor="primary"
                textColor="primary"
                onChange={handleTabChange}
                aria-label="whatsapp tabs"
              >
                <Tab value={TAB_IDS.CONNECTION} label={i18n.t("whatsappModal.tabs.general")} />
                <Tab value={TAB_IDS.QUEUE} label={i18n.t("whatsappModal.tabs.queues")} />
                <Tab value={TAB_IDS.CALLS} label={i18n.t("whatsappModal.tabs.calls")} />
                <Tab value={TAB_IDS.RATING} label={i18n.t("whatsappModal.tabs.rating")} />
                {showIntegrations && (
                  <Tab value={TAB_IDS.INTEGRATION} label={i18n.t("whatsappModal.tabs.integration")} />
                )}
              </Tabs>

              <DialogContent dividers>
                {activeTab === TAB_IDS.CONNECTION && (
                  <Paper className={classes.paper} >
                    <Grid container spacing={2}>
                      <Grid item xs={12} >
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.name")}
                          autoFocus
                          name="name"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          variant="outlined"
                          margin="dense"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Field
                              as={Switch}
                              color="primary"
                              name="isDefault"
                              checked={values.isDefault}
                            />
                          }
                          label={i18n.t("whatsappModal.form.default")}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.greetingMessage")}
                          type="greetingMessage"
                          multiline
                          rows={4}
                          fullWidth
                          name="greetingMessage"
                          error={touched.greetingMessage && Boolean(errors.greetingMessage)}
                          helperText={touched.greetingMessage && errors.greetingMessage}
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.completionMessage")}
                          type="completionMessage"
                          multiline
                          rows={4}
                          fullWidth
                          name="completionMessage"
                          error={touched.completionMessage && Boolean(errors.completionMessage)}
                          helperText={touched.completionMessage && errors.completionMessage}
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>
                      {schedulesEnabled && (
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            label={i18n.t("queueModal.form.outOfHoursMessage")}
                            type="outOfHoursMessage"
                            multiline
                            rows={4}
                            fullWidth
                            name="outOfHoursMessage"
                            error={touched.outOfHoursMessage && Boolean(errors.outOfHoursMessage)}
                            helperText={touched.outOfHoursMessage && errors.outOfHoursMessage}
                            variant="outlined"
                            margin="dense"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                )}

                {activeTab === TAB_IDS.QUEUE && (
                  <Paper className={classes.paper} >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <QueueSelect
                          selectedQueueIds={selectedQueueIds}
                          onChange={(selectedIds) => handleChangeQueue(selectedIds)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <h3>{i18n.t("whatsappModal.form.queueRedirection")}</h3>
                        <p>{i18n.t("whatsappModal.form.queueRedirectionDesc")}</p>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          fullWidth
                          type="number"
                          as={TextField}
                          label='Transferir após x (minutos)'
                          name="timeToTransfer"
                          error={touched.timeToTransfer && Boolean(errors.timeToTransfer)}
                          helperText={touched.timeToTransfer && errors.timeToTransfer}
                          variant="outlined"
                          margin="dense"
                          InputLabelProps={{ shrink: values.timeToTransfer ? true : false }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <QueueSelect
                          selectedQueueIds={selectedQueueId}
                          onChange={(selectedId) => setSelectedQueueId(selectedId)}
                          multiple={false}
                          title={'Departamento de Transferência'}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.expiresTicket")}
                          fullWidth
                          name="expiresTicket"
                          variant="outlined"
                          margin="dense"
                          error={touched.expiresTicket && Boolean(errors.expiresTicket)}
                          helperText={touched.expiresTicket && errors.expiresTicket}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.expiresInactiveMessage")}
                          multiline
                          rows={4}
                          fullWidth
                          name="expiresInactiveMessage"
                          error={touched.expiresInactiveMessage && Boolean(errors.expiresInactiveMessage)}
                          helperText={touched.expiresInactiveMessage && errors.expiresInactiveMessage}
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {activeTab === TAB_IDS.CALLS && (
                  <Paper className={classes.paper} >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.callMessage")}
                          type="callMessage"
                          multiline
                          rows={4}
                          fullWidth
                          name="callMessage"
                          error={touched.callMessage && Boolean(errors.callMessage)}
                          helperText={touched.callMessage && errors.callMessage}
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {activeTab === TAB_IDS.RATING && (
                  <Paper className={classes.paper} >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("whatsappModal.form.ratingMessage")}
                          type="ratingMessage"
                          multiline
                          rows={4}
                          fullWidth
                          name="ratingMessage"
                          error={touched.ratingMessage && Boolean(errors.ratingMessage)}
                          helperText={touched.ratingMessage && errors.ratingMessage}
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {activeTab === TAB_IDS.INTEGRATION && showIntegrations && (
                  <Paper className={classes.paper} >
                    <Grid container spacing={2}>
                      {showExternalApi && (
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            label={i18n.t("whatsappModal.form.token")}
                            type="token"
                            fullWidth
                            name="token"
                            variant="outlined"
                            margin="dense"
                          />
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
                              <MenuItem value="">
                                Nenhum
                              </MenuItem>
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
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          label="Tempo de uso do bot"
                          type="number"
                          fullWidth
                          name="timeUseBotQueues"
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          label="Máximo uso do bot"
                          type="number"
                          fullWidth
                          name="maxUseBotQueues"
                          variant="outlined"
                          margin="dense"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </DialogContent>

              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("whatsappModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
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

export default React.memo(WhatsAppModal);
