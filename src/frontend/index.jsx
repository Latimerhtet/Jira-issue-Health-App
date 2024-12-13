import React, { useEffect, useState } from "react";
import ForgeReconciler, { Button, Text } from "@forge/react";
import { invoke } from "@forge/bridge";

const App = () => {
  const [data, setData] = useState(null);
  const onClickHandler = async () => {
    const changelog = await invoke("getIssuesChangelog");
    console.log(changelog);
  };

  // useEffect(async () => {
  //   await invoke("getIssuesChangelog");

  // }, []);
  return <Button onClick={onClickHandler}>Test It</Button>;
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
