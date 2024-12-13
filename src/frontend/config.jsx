import React, { Fragment, useEffect, useState } from "react";
import ForgeReconciler, {
  Button,
  Heading,
  Inline,
  Label,
  Select,
  Spinner,
  Stack,
  Strong,
  Text,
  Toggle,
  Form,
  FormSection,
  useForm,
  FormHeader,
  RequiredAsterisk,
  FormFooter,
  SectionMessage,
} from "@forge/react";

import { invoke } from "@forge/bridge";

import {
  DATE_TIME_OPTIONS,
  DEFAULT_CONFIGURATION,
  STORAGE_KEY_PREFIX,
} from "./constant";

import { format } from "date-fns";
const App = () => {
  const [projectData, setProjectData] = useState([]);
  const [projectKey, setProjectKey] = useState(undefined);
  const [projectConfigState, setProjectConfigState] = useState(null);
  const [isProjectConfigSubmitted, setIsProjectConfigSubmitted] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: projectConfigState,
  });

  // fetching projects
  const fetchProjects = async () => {
    const data = await invoke("getProjectFromJira");
    setProjectData(data);
  };

  // getting storage Data
  const getStorageConfigData = async () => {
    const data = await invoke(
      "getConfigFromStorage",
      `${STORAGE_KEY_PREFIX}_${projectKey}`
    );

    setProjectConfigState(data || DEFAULT_CONFIGURATION);
  };

  useEffect(() => {
    fetchProjects();
    getStorageConfigData();
  }, [projectKey]);

  const onProjectConfigSubmit = async (projectConfig) => {
    setLoading(true);
    await invoke("setConfigToStorage", {
      projectField: `${STORAGE_KEY_PREFIX}_${projectKey}`,
      data: projectConfig,
    });
    setProjectConfigState(projectConfig);
    setIsProjectConfigSubmitted(true);
    console.log(projectConfig);
    setLoading(false);
  };
  const RenderProjectPicker = () => {
    return initialLoading ? (
      <Spinner />
    ) : projectData?.length !== 0 ? (
      <Stack space="space.100">
        <Heading as="h4">
          In this Page you can modify<Strong>Issue Health Monitor</Strong>{" "}
          configuration for selected project
        </Heading>

        <Select
          appearance="default"
          options={projectData.map((project) => ({
            label: project.name,
            value: project.key,
          }))}
          onChange={(e) => {
            setProjectKey(e.value);
          }}
        />
      </Stack>
    ) : (
      <Text>No Configurable projects avaliable</Text>
    );
  };

  const renderDateTimeOption = (option) => {
    let label;
    const sampleDate = new Date();

    switch (option[1]) {
      case DATE_TIME_OPTIONS.day:
        label = `Day-month-year: ${format(sampleDate, DATE_TIME_OPTIONS.day)}`;
        break;
      case DATE_TIME_OPTIONS.month:
        label = `Month day, year: ${format(
          sampleDate,
          DATE_TIME_OPTIONS.month
        )}`;
        break;
      case DATE_TIME_OPTIONS.year:
        label = `Year, month day: ${format(
          sampleDate,
          DATE_TIME_OPTIONS.year
        )}`;
        break;
      default:
        label = `Year-month-day: ${format(
          sampleDate,
          DATE_TIME_OPTIONS.default
        )}`;
        break;
    }
    return { label, value: option[0] };
  };

  const getOptions = () => {
    let options = [];
    Object.entries(DATE_TIME_OPTIONS).map((option) => {
      options.push(renderDateTimeOption(option));
    });

    return options;
  };
  const options = getOptions();

  return (
    <Fragment>
      {isProjectConfigSubmitted && (
        <SectionMessage title="Configuration Saved" appearance="confirmation" />
      )}
      {!projectKey ? (
        <RenderProjectPicker />
      ) : (
        <Form onSubmit={handleSubmit(onProjectConfigSubmit)}>
          <FormSection>
            <Select
              {...register("timeConfig")}
              name="timeConfig"
              options={options}
              defaultValue={projectConfigState?.timeconfig || {}}
            />
            <Inline space="space.100" alignBlock="center">
              <Toggle
                {...register("isAssigneeVisible")}
                label="Show/hide Assignee"
                name="isAssigneeVisible"
                size="large"
                defaultChecked={
                  projectConfigState
                    ? projectConfigState?.isAssigneeVisible
                    : false
                }
              />
              <Label labelFor="isAssigneeVisible">Show/hide Assignee</Label>
            </Inline>
            <Inline space="space.100" alignBlock="center">
              <Toggle
                {...register("isNotifyAssigneeButtonVisible")}
                label="Show/hide Assignee notification button"
                name="isNotifyAssigneeButtonVisible"
                size="large"
                defaultChecked={
                  projectConfigState
                    ? projectConfigState.isNotifyAssigneeButtonVisible
                    : false
                }
              />
              <Label labelFor="isNotifyAssigneeButtonVisible">
                Show/hide Assignee notification button
              </Label>
            </Inline>
            <Inline space="space.100" alignBlock="center">
              <Toggle
                size="large"
                {...register("isHistoricalAssigneeVisible")}
                label="Show/hide Historical assignees"
                name="isHistoricalAssigneeVisible"
                defaultChecked={
                  projectConfigState
                    ? projectConfigState.isHistoricalAssigneeVisible
                    : false
                }
              />
              <Label labelFor="isHistoricalAssigneeVisible">
                Show/hide Historical assignees
              </Label>
            </Inline>
          </FormSection>
          <FormFooter>
            <Button type="submit" appearance="primary" isDisabled={loading}>
              {loading ? <Spinner /> : "Submit"}
            </Button>
          </FormFooter>
        </Form>
      )}
    </Fragment>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
