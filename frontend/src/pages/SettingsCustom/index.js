import React, { useState, useEffect } from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, Paper, Tabs, Tab, Button, Box } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";

import QueueSchedule from "../../components/QueueSchedule";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import Integrations from "../../components/Settings/Integrations";

import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";

import useCompanies from "../../hooks/useCompanies";
import useAuth from "../../hooks/useAuth.js";
import useSettings from "../../hooks/useSettings";

import OnlyForSuperUser from "../../components/OnlyForSuperUser";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
  },
  tab: {
    backgroundColor: theme.palette.options,
    borderRadius: 4,
    padding: 0,
    minHeight: 48,
    '& .MuiTabs-flexContainer': {
      justifyContent: 'flex-start',
      paddingLeft: 0
    },
    '& .MuiTabScrollButton-root': {
      minWidth: 0,
      width: 24,
      padding: 0,
    },
    '& svg': {
      margin: 0,
    },
    '& .MuiTab-root': {
      minWidth: 120,
      textTransform: 'uppercase',
      fontWeight: 500,
      fontSize: '0.875rem'
    },
    '& .MuiTabs-indicator': {
      backgroundColor: theme.palette.primary.main,
      height: 3
    }
  },
  paper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxHeight: "100%",
  },
  control: {
    padding: theme.spacing(1),
  },
  textfield: {
    width: "100%",
  },
  saveButton: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [localSchedules, setLocalSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState([]);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();

  const loadData = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const company = await find(companyId);
      const settingList = await getAllSettings();
      setCompany(company);
      setSchedules(company.schedules || []);
      setLocalSchedules(company.schedules || []);
      setSettings(settingList);

      if (Array.isArray(settingList)) {
        const scheduleType = settingList.find(
          (d) => d.key === "scheduleType"
        );
        if (scheduleType) {
          setSchedulesEnabled(scheduleType.value === "company");
        }
      }

      const user = await getCurrentUserInfo();
      setCurrentUser(user);
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSchedulesChange = (newSchedules) => {
    setLocalSchedules(newSchedules);
    setHasChanges(true);
  };

  const handleSubmitSchedules = async () => {
    setLoading(true);
    try {
      await updateSchedules({ id: company.id, schedules: localSchedules });
      setSchedules(localSchedules);
      setHasChanges(false);
      toast.success(i18n.t("settings.success"));
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return currentUser.super;
  };

  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("settings.title")}</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} elevation={1}>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          onChange={handleTabChange}
          className={classes.tab}
        >
          <Tab label={i18n.t("settings.tabs.options")} value="options" />
          {schedulesEnabled && (
            <Tab label={i18n.t("settings.tabs.schedules")} value="schedules" />
          )}
          {isSuper() && <Tab label={i18n.t("settings.tabs.companies")} value="companies" />}
          {isSuper() && <Tab label={i18n.t("settings.tabs.plans")} value="plans" />}
          {isSuper() && <Tab label={i18n.t("settings.tabs.helps")} value="helps" />}
          <Tab label={i18n.t("settings.tabs.integrations")} value="integrations" />
        </Tabs>
        <Paper className={classes.paper} elevation={0}>
          <TabPanel className={classes.container} value={tab} name="schedules">
            <QueueSchedule
              schedules={localSchedules}
              onSchedulesChange={handleSchedulesChange}
              loading={loading}
              enabled={schedulesEnabled}
            />
            <Box display="flex" justifyContent="flex-end" width="100%" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitSchedules}
                disabled={!hasChanges || loading}
                className={classes.saveButton}
              >
                {i18n.t("schedulesForm.save")}
              </Button>
            </Box>
          </TabPanel>
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel className={classes.container} value={tab} name="companies">
                <CompaniesManager />
              </TabPanel>
            )}
          />
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel className={classes.container} value={tab} name="plans">
                <PlansManager />
              </TabPanel>
            )}
          />
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel className={classes.container} value={tab} name="helps">
                <HelpsManager />
              </TabPanel>
            )}
          />
          <TabPanel className={classes.container} value={tab} name="options">
            <Options
              settings={settings}
              scheduleTypeChanged={(value) =>
                setSchedulesEnabled(value === "company")
              }
            />
          </TabPanel>
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel className={classes.container} value={tab} name="integrations">
                <Integrations settings={settings} />
              </TabPanel>
            )}
          />
        </Paper>
      </Paper>
    </MainContainer>
  );
};

export default SettingsCustom;
