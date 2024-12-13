import Resolver from "@forge/resolver";
import api, { route, storage } from "@forge/api";
import { checkAPIStatus } from "../utils/util";
const resolver = new Resolver();

resolver.define("getText", (req) => {
  console.log(req);
  return "Hello, world!";
});

// getting app projects from Jira API
resolver.define("getProjectFromJira", async () => {
  try {
    const response = await api
      .asUser()
      .requestJira(route`/rest/api/3/project/search`);

    const data = await response.json();

    return data.values.map(({ key, name }) => ({ key, name }));
  } catch (error) {
    console.error(error);
  }
});

resolver.define("getIssuesChangelog", async ({ context, payload }) => {
  const issueKey = context.extension.issue.key;
  try {
    const response = await api
      .asUser()
      .requestJira(route`/rest/api/3/issue/${issueKey}/changelog`);

    const data = await response.json();
    const transformedData = issueChangeLogTransformer(data);
    return transformedData;
  } catch (error) {
    console.log(error.message);
  }
});

resolver.define("setConfigToStorage", async ({ context, payload }) => {
  await storage.set(payload.projectField, payload.data);
});

resolver.define("getConfigFromStorage", async ({ context, payload }) => {
  const data = await storage.get(payload);
  console.log(data);
  return data;
});
const issueChangeLogTransformer = (response) => {
  if (!response) return;
  const filteredResponse = response.values.filter((value) =>
    value.items.some((item) => item.fieldId === "assignee")
  );
  return filteredResponse.length !== 0
    ? filteredResponse
        .map((changeLogItem) => ({
          ...changeLogItem,
          items: changeLogItem.items.find(
            (item) => item.fieldId === "assignee"
          ),
        }))
        .reverse()
    : [];
};
export const handler = resolver.getDefinitions();
